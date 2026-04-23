import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Heart,
  MessageCircle,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import "./Family.css";

const initialMemberForm = { name: "", role: "", phone: "" };

const defaultMembers = [
  {
    id: "family-son",
    name: "John Wilson",
    role: "Son",
    phone: "+1-206-555-0182",
    status: "Online",
    statusTone: "green",
    lastSeen: "Now",
    emoji: "🧑",
  },
  {
    id: "family-daughter",
    name: "Mary Wilson",
    role: "Daughter",
    phone: "+1-206-555-0197",
    status: "Online",
    statusTone: "green",
    lastSeen: "5 min ago",
    emoji: "👩",
  },
  {
    id: "family-physician",
    name: "Dr. Ahmed Karimi",
    role: "Physician",
    phone: "+1-206-555-0120",
    status: "On Call",
    statusTone: "blue",
    lastSeen: "Available",
    emoji: "🧑‍⚕️",
  },
];

function parseSystolic(bp) {
  if (!bp) return null;
  const [systolic] = String(bp).split("/");
  const parsed = Number(systolic);
  return Number.isFinite(parsed) ? parsed : null;
}

function isHighBloodPressure(bp) {
  const systolic = parseSystolic(bp);
  return Boolean(systolic && systolic >= 130);
}

function formatPhoneNumber(phone) {
  return phone.replace(/[^+\d]/g, "");
}

function buildWeeklyTrend(records) {
  const fallback = [
    { day: "Mon", heartRate: 74, systolic: 130 },
    { day: "Tue", heartRate: 75, systolic: 133 },
    { day: "Wed", heartRate: 76, systolic: 136 },
    { day: "Thu", heartRate: 71, systolic: 131 },
    { day: "Fri", heartRate: 74, systolic: 131 },
    { day: "Sat", heartRate: 73, systolic: 128 },
    { day: "Sun", heartRate: 74, systolic: 129 },
  ];

  if (!records.length) return fallback;

  const recent = records.slice(-7);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].slice(-recent.length);

  return recent.map((record, index) => ({
    day: labels[index],
    heartRate: Number(record.heart_rate) || 76,
    systolic: parseSystolic(record.bp) || 130,
  }));
}

function buildActivitySeries(latestHeartRate) {
  const peak = latestHeartRate ? Math.min(latestHeartRate * 45, 3800) : 3280;
  return [
    { time: "9am", steps: 900 },
    { time: "12pm", steps: peak },
    { time: "3pm", steps: Math.max(peak - 1200, 2100) },
    { time: "6pm", steps: Math.max(peak - 1500, 1700) },
    { time: "9pm", steps: Math.max(peak - 2100, 800) },
  ];
}

function buildAlerts({ health, medications, sosAlerts, caregiverName }) {
  const alerts = [];

  if (health && isHighBloodPressure(health.bp)) {
    alerts.push({
      id: "alert-bp",
      title: `Blood pressure elevated to ${health.bp}`,
      time: "21m ago",
      tone: "danger",
    });
  }

  const takenMedication = medications.find((item) => Number(item.taken) === 1);
  if (takenMedication) {
    alerts.push({
      id: "alert-med",
      title: `${takenMedication.name || "Morning medication"} taken`,
      time: "3h ago",
      tone: "success",
    });
  }

  if (caregiverName) {
    alerts.push({
      id: "alert-caregiver",
      title: `Nurse visit completed by ${caregiverName}`,
      time: "Yesterday",
      tone: "success",
    });
  }

  if (sosAlerts.length) {
    alerts.push({
      id: "alert-sos",
      title: "Emergency monitoring history available",
      time: "Recent",
      tone: "neutral",
    });
  }

  return alerts.slice(0, 4);
}

export default function Family() {
  const [healthRecords, setHealthRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState(defaultMembers);
  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [savingMedication, setSavingMedication] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = user?.id;
  const familyStorageKey = `carenest-family-members-${userId || "guest"}`;

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [healthRes, medicationRes, caregiverRes, sosRes] = await Promise.all([
        api.get("/health", { params: { user_id: userId } }),
        api.get("/medication", { params: { user_id: userId } }),
        api.get("/caregivers"),
        api.get("/sos", { params: { user_id: userId } }),
      ]);

      setHealthRecords(healthRes.data);
      setMedications(medicationRes.data);
      setCaregivers(caregiverRes.data);
      setSosAlerts(sosRes.data);
    } catch (error) {
      console.error(error);
      setFeedback("We couldn't refresh the family monitoring dashboard.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem(familyStorageKey);
      if (storedMembers) {
        setFamilyMembers(JSON.parse(storedMembers));
      }
    } catch {
      setFamilyMembers(defaultMembers);
    }
  }, [familyStorageKey]);

  useEffect(() => {
    localStorage.setItem(familyStorageKey, JSON.stringify(familyMembers));
  }, [familyMembers, familyStorageKey]);

  const latestHealth = healthRecords[healthRecords.length - 1] || null;
  const latestHeartRate = latestHealth?.heart_rate ? Number(latestHealth.heart_rate) : 76;
  const latestBloodPressure = latestHealth?.bp || "130/85";
  const latestGlucose = latestHealth?.glucose ? Number(latestHealth.glucose) : 125;
  const caregiver = caregivers[0];
  const needsAttention = isHighBloodPressure(latestBloodPressure) || latestGlucose >= 125;
  const untakenMedication = medications.find((item) => Number(item.taken) === 0);
  const weeklyTrend = buildWeeklyTrend(healthRecords);
  const activitySeries = buildActivitySeries(latestHeartRate);
  const activityGoal = 5000;
  const currentSteps = Math.min(activitySeries[1].steps, activityGoal);
  const progressPercent = Math.min((currentSteps / activityGoal) * 100, 100);
  const patientMetrics = [
    {
      label: "Blood Pressure",
      value: latestBloodPressure,
      unit: "mmHg",
      icon: Activity,
      tone: "blue",
      badge: isHighBloodPressure(latestBloodPressure) ? "High" : "Stable",
      badgeTone: isHighBloodPressure(latestBloodPressure) ? "red" : "green",
    },
    {
      label: "Heart Rate",
      value: latestHeartRate,
      unit: "bpm",
      icon: Heart,
      tone: "red",
      badge: "",
      badgeTone: "green",
    },
    {
      label: "Glucose Level",
      value: latestGlucose,
      unit: "mg/dL",
      icon: Activity,
      tone: "yellow",
      badge: latestGlucose >= 125 ? "Watch" : "Normal",
      badgeTone: latestGlucose >= 125 ? "yellow" : "green",
    },
  ];

  const connectedFamily = useMemo(() => {
    const caregiverMember = {
      id: caregiver?.id || "caregiver-member",
      name: caregiver?.name || "Sarah M.",
      role: "Caregiver",
      phone: "+1-206-555-0109",
      status: "Active",
      statusTone: "green",
      lastSeen: "Nearby",
      emoji: "🧑‍⚕️",
    };

    return [...familyMembers, caregiverMember];
  }, [caregiver, familyMembers]);

  const recentAlerts = buildAlerts({
    health: latestHealth,
    medications,
    sosAlerts,
    caregiverName: caregiver?.name || "Sarah M.",
  });

  const handleRefresh = async () => {
    setFeedback("Refreshing family updates...");
    await loadData();
    setFeedback("Family monitoring is up to date.");
  };

  const handleMarkMedication = async () => {
    if (!untakenMedication) {
      setFeedback("All medication reminders are already marked as taken.");
      return;
    }

    setSavingMedication(true);
    try {
      await api.put(`/medication/${untakenMedication.id}`, {
        name: untakenMedication.name,
        time: untakenMedication.time,
        taken: 1,
      });
      await loadData();
      setFeedback(`${untakenMedication.name} has been marked as taken.`);
    } catch (error) {
      console.error(error);
      setFeedback("We couldn't update the medication status.");
    } finally {
      setSavingMedication(false);
    }
  };

  const handleMemberSubmit = (event) => {
    event.preventDefault();
    const nextMember = {
      id: `member-${Date.now()}`,
      name: memberForm.name,
      role: memberForm.role,
      phone: memberForm.phone,
      status: "Online",
      statusTone: "green",
      lastSeen: "Just added",
      emoji: "🙂",
    };

    setFamilyMembers((current) => [...current, nextMember]);
    setMemberForm(initialMemberForm);
    setShowMemberForm(false);
    setFeedback(`${nextMember.name} was added to connected family.`);
  };

  const handleCall = (member) => {
    setFeedback(`Calling ${member.name}...`);
    window.location.href = `tel:${formatPhoneNumber(member.phone)}`;
  };

  const handleMessage = (member) => {
    setFeedback(`Opening message draft for ${member.name}.`);
    window.location.href = `sms:${formatPhoneNumber(member.phone)}`;
  };

  return (
    <section className="family-dashboard">
      <div className="family-dashboard__hero">
        <div className="family-dashboard__heroHeader">
          <button
            type="button"
            className="family-dashboard__backButton"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Family Monitoring</h1>
            <p>Real-time updates for your loved one</p>
          </div>
        </div>
      </div>

      {feedback ? <div className="family-dashboard__feedback">{feedback}</div> : null}

      <div className="family-dashboard__panel">
        <div className="family-dashboard__patientHeader">
          <div className="family-dashboard__patientMeta">
            <img
              src="/images/margot-carenest.webp"
              alt={user?.name || "Margaret Wilson"}
              className="family-dashboard__avatar"
            />
            <div>
              <h2>{user?.name || "Margaret Wilson"}</h2>
              <p>Patient . 72 years old</p>
            </div>
          </div>

          <button
            type="button"
            className={`family-dashboard__attention family-dashboard__attention--${
              needsAttention ? "warning" : "safe"
            }`}
            onClick={handleRefresh}
          >
            {needsAttention ? "Needs Attention" : "Stable Today"}
          </button>
        </div>

        <div className="family-dashboard__vitals">
          {patientMetrics.map((metric) => {
            const MetricIcon = metric.icon;

            return (
              <div key={metric.label} className="family-dashboard__vitalRow">
                <div className="family-dashboard__vitalLabel">
                  <span className={`family-dashboard__vitalIcon family-dashboard__vitalIcon--${metric.tone}`}>
                    <MetricIcon size={18} />
                  </span>
                  <span>{metric.label}</span>
                </div>

                <div className="family-dashboard__vitalValue">
                  <strong>
                    {metric.value} {metric.unit}
                  </strong>
                  {metric.badge ? (
                    <span className={`family-dashboard__badge family-dashboard__badge--${metric.badgeTone}`}>
                      {metric.badge}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="family-dashboard__medicationButton"
          onClick={handleMarkMedication}
          disabled={savingMedication}
        >
          <CheckCircle2 size={18} />
          <span>
            {savingMedication
              ? "Updating..."
              : untakenMedication
                ? `Mark ${untakenMedication.name} as Taken`
                : "Mark Medication as Taken"}
          </span>
        </button>
      </div>

      <div className="family-dashboard__panel">
        <div className="family-dashboard__sectionHeader">
          <h2>Weekly Health Trends</h2>
          <span>This week</span>
        </div>

        <div className="family-dashboard__chart">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={weeklyTrend} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="#edf2fb" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#9aa9c4", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9aa9c4", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(70, 110, 180, 0.14)",
                  boxShadow: "0 16px 28px rgba(36, 68, 128, 0.14)",
                }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#4a89f3"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4a89f3" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="family-dashboard__legend">
          <span className="family-dashboard__legendItem">
            <i className="family-dashboard__legendDot family-dashboard__legendDot--red" />
            Heart Rate
          </span>
          <span className="family-dashboard__legendItem">
            <i className="family-dashboard__legendDot family-dashboard__legendDot--blue" />
            BP Systolic
          </span>
        </div>
      </div>

      <div className="family-dashboard__panel">
        <div className="family-dashboard__sectionHeader">
          <h2>Today's Activity</h2>
          <span>{loading ? "Updating..." : "Live summary"}</span>
        </div>

        <div className="family-dashboard__activityHead">
          <strong>{currentSteps.toLocaleString()}</strong>
          <span>/ {activityGoal.toLocaleString()} steps goal</span>
        </div>

        <div className="family-dashboard__progressTrack">
          <div
            className="family-dashboard__progressFill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="family-dashboard__chart family-dashboard__chart--activity">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activitySeries} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="familyActivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c8cd9" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2c8cd9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#9aa9c4", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(70, 110, 180, 0.14)",
                  boxShadow: "0 16px 28px rgba(36, 68, 128, 0.14)",
                }}
              />
              <Area
                type="monotone"
                dataKey="steps"
                stroke="#3187d3"
                strokeWidth={3}
                fill="url(#familyActivityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="family-dashboard__panel">
        <div className="family-dashboard__sectionHeader">
          <h2>Connected Family</h2>
          <button
            type="button"
            className="family-dashboard__addMember"
            onClick={() => setShowMemberForm((current) => !current)}
          >
            <Plus size={16} />
            <span>{showMemberForm ? "Close" : "Add Member"}</span>
          </button>
        </div>

        {showMemberForm ? (
          <form className="family-dashboard__memberForm" onSubmit={handleMemberSubmit}>
            <label>
              Name
              <input
                value={memberForm.name}
                onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Role
              <input
                value={memberForm.role}
                onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}
                placeholder="Brother, Sister, Guardian..."
                required
              />
            </label>
            <label>
              Phone
              <input
                value={memberForm.phone}
                onChange={(event) => setMemberForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+1-555-000-0000"
                required
              />
            </label>
            <div className="family-dashboard__memberActions">
              <button type="submit" className="family-dashboard__saveMember">
                Save Member
              </button>
            </div>
          </form>
        ) : null}

        <div className="family-dashboard__members">
          {connectedFamily.map((member) => (
            <div key={member.id} className="family-dashboard__memberRow">
              <div className="family-dashboard__memberInfo">
                <span className="family-dashboard__memberAvatar">{member.emoji}</span>
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.role} . {member.lastSeen}
                  </span>
                </div>
              </div>

              <div className="family-dashboard__memberActionsInline">
                <span className={`family-dashboard__memberStatus family-dashboard__memberStatus--${member.statusTone}`}>
                  {member.status}
                </span>
                <button
                  type="button"
                  className="family-dashboard__iconButton family-dashboard__iconButton--call"
                  onClick={() => handleCall(member)}
                  aria-label={`Call ${member.name}`}
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="family-dashboard__iconButton family-dashboard__iconButton--message"
                  onClick={() => handleMessage(member)}
                  aria-label={`Message ${member.name}`}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="family-dashboard__panel">
        <div className="family-dashboard__sectionHeader">
          <h2>Recent Alerts</h2>
          <span>{recentAlerts.length} items</span>
        </div>

        <div className="family-dashboard__alerts">
          {recentAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              className="family-dashboard__alertRow"
              onClick={() => setFeedback(alert.title)}
            >
              <span className={`family-dashboard__alertIcon family-dashboard__alertIcon--${alert.tone}`}>
                {alert.tone === "danger" ? <Activity size={16} /> : <Users size={16} />}
              </span>
              <div className="family-dashboard__alertText">
                <strong>{alert.title}</strong>
                <span>{alert.time}</span>
              </div>
              <span className="family-dashboard__alertChevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
