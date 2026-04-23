import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  ArrowLeft,
  Bell,
  Check,
  Clock3,
  Moon,
  Pill,
  Plus,
  Sun,
  Sunset,
} from "lucide-react";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import "./Medication.css";

const initialForm = { name: "", time: "" };
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dayParts = {
  morning: {
    label: "Morning",
    time: "8:00 AM",
    icon: Sun,
    tone: "morning",
    match: (hour) => hour < 12,
  },
  afternoon: {
    label: "Afternoon",
    time: "1:00 PM",
    icon: Sunset,
    tone: "afternoon",
    match: (hour) => hour >= 12 && hour < 18,
  },
  night: {
    label: "Night",
    time: "9:00 PM",
    icon: Moon,
    tone: "night",
    match: (hour) => hour >= 18,
  },
};

const fallbackMedications = [
  { id: "fallback-1", name: "Aspirin", time: "08:00", taken: 0 },
  { id: "fallback-2", name: "Metformin", time: "08:10", taken: 0 },
  { id: "fallback-3", name: "Calcium Supplement", time: "08:20", taken: 0 },
  { id: "fallback-4", name: "Vitamin D", time: "13:00", taken: 0 },
  { id: "fallback-5", name: "Omega-3", time: "13:15", taken: 0 },
  { id: "fallback-6", name: "Atorvastatin", time: "21:00", taken: 0 },
  { id: "fallback-7", name: "Amlodipine", time: "21:10", taken: 0 },
];

const medicationMeta = {
  aspirin: { dose: "75mg", quantity: "1 Tablet", instruction: "Take with water", accent: "red" },
  metformin: { dose: "500mg", quantity: "1 Tablet", instruction: "Take with food", accent: "blue" },
  calcium: { dose: "500mg", quantity: "1 Tablet", instruction: "Take daily", accent: "purple" },
  vitamin: { dose: "1000 IU", quantity: "1 Capsule", instruction: "Take after lunch", accent: "yellow" },
  omega: { dose: "1000mg", quantity: "1 Capsule", instruction: "Take with meal", accent: "green" },
  atorvastatin: { dose: "20mg", quantity: "1 Tablet", instruction: "Take at bedtime", accent: "green" },
  amlodipine: { dose: "5mg", quantity: "1 Tablet", instruction: "Take daily", accent: "blue" },
};

function resolveMedicationMeta(name) {
  const normalized = String(name).toLowerCase();
  const match = Object.entries(medicationMeta).find(([key]) => normalized.includes(key));
  return match?.[1] || { dose: "1 dose", quantity: "1 Tablet", instruction: "Take as prescribed", accent: "blue" };
}

function getTimeParts(value) {
  const [hourString = "08", minuteString = "00"] = String(value || "08:00").split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  return { hour: Number.isFinite(hour) ? hour : 8, minute: Number.isFinite(minute) ? minute : 0 };
}

function getBucketForTime(value) {
  const { hour } = getTimeParts(value);
  return Object.entries(dayParts).find(([, config]) => config.match(hour))?.[0] || "morning";
}

function getCurrentWeekdayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function buildGroupedMedications(list) {
  const grouped = { morning: [], afternoon: [], night: [] };

  list.forEach((item) => {
    const bucket = getBucketForTime(item.time);
    grouped[bucket].push(item);
  });

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((left, right) => left.time.localeCompare(right.time));
  });

  return grouped;
}

export default function Medication() {
  const [list, setList] = useState([]);
  const [previewList, setPreviewList] = useState(fallbackMedications);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeDay, setActiveDay] = useState(getCurrentWeekdayIndex());
  const [remindersOn, setRemindersOn] = useState(true);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = user?.id;

  const loadMedication = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get("/medication", { params: { user_id: userId } });
      setList(res.data);
      if (res.data.length) {
        setPreviewList(fallbackMedications);
      }
    } catch (err) {
      console.error(err);
      setFeedback("We couldn't load medication reminders right now.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMedication();
  }, [loadMedication]);

  const displayList = list.length ? list : previewList;
  const grouped = buildGroupedMedications(displayList);
  const takenCount = displayList.filter((item) => Number(item.taken) === 1).length;
  const totalCount = displayList.length || 1;
  const progressPercent = Math.round((takenCount / totalCount) * 100);
  const progressOffset = 251.2 - (251.2 * progressPercent) / 100;

  const scheduleSections = useMemo(
    () =>
      Object.entries(dayParts).map(([key, config]) => ({
        key,
        ...config,
        items: grouped[key].map((item) => ({
          ...item,
          meta: resolveMedicationMeta(item.name),
        })),
      })),
    [grouped]
  );

  const upcomingReminders = useMemo(
    () =>
      scheduleSections
        .filter((section) => section.items.length)
        .map((section) => ({
          key: section.key,
          tone: section.tone,
          title: section.items.map((item) => item.name).join(" + "),
          subtitle: `Tomorrow . ${section.time}`,
        })),
    [scheduleSections]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      await api.post("/medication", { user_id: userId, ...form });
      setForm(initialForm);
      setShowForm(false);
      setFeedback(`${form.name} has been added to your reminders.`);
      await loadMedication();
    } catch (error) {
      console.error(error);
      setFeedback("We couldn't add that medication.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTaken = async (item) => {
    if (String(item.id).startsWith("fallback-")) {
      setPreviewList((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, taken: entry.taken ? 0 : 1 } : entry
        )
      );
      setFeedback(
        item.taken ? `${item.name} marked as not taken.` : `${item.name} marked as taken.`
      );
      return;
    }

    await api.put(`/medication/${item.id}`, {
      name: item.name,
      time: item.time,
      taken: item.taken ? 0 : 1,
    });
    setFeedback(
      item.taken ? `${item.name} marked as not taken.` : `${item.name} marked as taken.`
    );
    loadMedication();
  };

  const markAllInSection = async (section) => {
    const pending = section.items.filter((item) => Number(item.taken) === 0);
    if (!pending.length) {
      setFeedback(`${section.label} medications are already complete.`);
      return;
    }

    await Promise.all(
      pending.map((item) =>
        String(item.id).startsWith("fallback-")
          ? Promise.resolve()
          : api.put(`/medication/${item.id}`, {
              name: item.name,
              time: item.time,
              taken: 1,
            })
      )
    );

    if (pending.some((item) => String(item.id).startsWith("fallback-"))) {
      setPreviewList((current) =>
        current.map((item) =>
          pending.some((pendingItem) => pendingItem.id === item.id) ? { ...item, taken: 1 } : item
        )
      );
    }

    setFeedback(`${section.label} medications marked as taken.`);
    loadMedication();
  };

  return (
    <section className="medication-dashboard">
      <div className="medication-dashboard__hero">
        <div className="medication-dashboard__heroHeader">
          <button
            type="button"
            className="medication-dashboard__backButton"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Medication Reminder</h1>
            <p>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>

        <button
          type="button"
          className={`medication-dashboard__toggle ${
            remindersOn ? "medication-dashboard__toggle--on" : ""
          }`}
          onClick={() => {
            setRemindersOn((current) => !current);
            setFeedback(remindersOn ? "Reminders paused." : "Reminders turned on.");
          }}
        >
          <Bell size={16} />
          <span>{remindersOn ? "Reminders On" : "Reminders Off"}</span>
        </button>
      </div>

      {feedback ? <div className="medication-dashboard__feedback">{feedback}</div> : null}

      <div className="medication-dashboard__panel medication-dashboard__panel--progress">
        <div>
          <h2>Today's Progress</h2>
          <p>
            {takenCount} of {displayList.length} medications taken
          </p>
          <div className="medication-dashboard__progressTrack">
            <div
              className="medication-dashboard__progressFill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="medication-dashboard__ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="40" className="medication-dashboard__ringBg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="medication-dashboard__ringValue"
              style={{ strokeDashoffset: progressOffset }}
            />
          </svg>
          <span>{progressPercent}%</span>
        </div>
      </div>

      <div className="medication-dashboard__panel medication-dashboard__panel--days">
        <div className="medication-dashboard__days">
          {weekdayLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`medication-dashboard__day ${
                activeDay === index ? "medication-dashboard__day--active" : ""
              }`}
              onClick={() => {
                setActiveDay(index);
                setFeedback(`${label} schedule selected.`);
              }}
            >
              <span>{label}</span>
              {activeDay === index ? <i /> : null}
            </button>
          ))}
        </div>
      </div>

      {scheduleSections.map((section) => {
        const SectionIcon = section.icon;
        const sectionTaken = section.items.filter((item) => Number(item.taken) === 1).length;

        return (
          <div key={section.key} className="medication-dashboard__panel medication-dashboard__schedule">
            <div className={`medication-dashboard__scheduleHeader medication-dashboard__scheduleHeader--${section.tone}`}>
              <div className="medication-dashboard__scheduleTitle">
                <span className={`medication-dashboard__scheduleIcon medication-dashboard__scheduleIcon--${section.tone}`}>
                  <SectionIcon size={18} />
                </span>
                <div>
                  <h3>{section.label}</h3>
                  <p>
                    <Clock3 size={13} />
                    <span>{section.time}</span>
                  </p>
                </div>
              </div>

              <div className="medication-dashboard__scheduleActions">
                <span>
                  {sectionTaken}/{section.items.length}
                </span>
                <button
                  type="button"
                  className={`medication-dashboard__markAll medication-dashboard__markAll--${section.tone}`}
                  onClick={() => markAllInSection(section)}
                >
                  Mark All
                </button>
              </div>
            </div>

            <div className="medication-dashboard__items">
              {section.items.map((item) => (
                <div key={item.id} className="medication-dashboard__item">
                  <div className="medication-dashboard__itemInfo">
                    <span className={`medication-dashboard__pillIcon medication-dashboard__pillIcon--${item.meta.accent}`}>
                      <Pill size={17} />
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.meta.dose} . {item.meta.quantity}
                      </span>
                      <small>{item.meta.instruction}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`medication-dashboard__check ${
                      Number(item.taken) === 1 ? "medication-dashboard__check--done" : ""
                    }`}
                    onClick={() => toggleTaken(item)}
                    aria-label={`Mark ${item.name} as ${Number(item.taken) === 1 ? "not taken" : "taken"}`}
                  >
                    {Number(item.taken) === 1 ? <Check size={16} /> : null}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="medication-dashboard__addWrap">
        <button
          type="button"
          className="medication-dashboard__addButton"
          onClick={() => setShowForm((current) => !current)}
        >
          <Plus size={18} />
          <span>{showForm ? "Close Form" : "Add New Medication"}</span>
        </button>
      </div>

      {showForm ? (
        <form className="medication-dashboard__panel medication-dashboard__form" onSubmit={handleSubmit}>
          <label>
            Medication name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Paracetamol"
              required
            />
          </label>
          <label>
            Reminder time
            <input
              type="time"
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              required
            />
          </label>
          <div className="medication-dashboard__formActions">
            <button type="submit" className="medication-dashboard__saveButton" disabled={saving}>
              {saving ? "Saving..." : "Save Medication"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="medication-dashboard__panel medication-dashboard__upcoming">
        <div className="medication-dashboard__sectionHeader">
          <h2>Upcoming Reminders</h2>
          <button
            type="button"
            className="medication-dashboard__seeAll"
            onClick={() => setFeedback("Showing tomorrow's grouped reminders.")}
          >
            See all
          </button>
        </div>

        <div className="medication-dashboard__upcomingList">
          {upcomingReminders.map((item) => (
            <button
              key={item.key}
              type="button"
              className="medication-dashboard__upcomingRow"
              onClick={() => setFeedback(`${item.title} scheduled for ${item.subtitle}.`)}
            >
              <span className={`medication-dashboard__upcomingIcon medication-dashboard__upcomingIcon--${item.tone}`}>
                <AlarmClock size={16} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
              <span className="medication-dashboard__chevron">›</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="medication-dashboard__loading">Loading medication reminders...</div> : null}
    </section>
  );
}
