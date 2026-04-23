import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Droplets,
  Heart,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import "./Health.css";

const initialForm = { heart_rate: "", bp: "", glucose: "" };
const timelineLabels = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];

const chartConfig = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
    icon: Heart,
    color: "#ef4444",
    gradient: "healthDashboardHeart",
    field: "heart_rate",
    formatter: (value) => `${value} bpm`,
    rangeLabel: "Heart rate is within normal range (60-100 bpm)",
    summaryTitle: "Today's trend",
  },
  bloodPressure: {
    label: "Blood Pressure",
    unit: "mmHg",
    icon: Activity,
    color: "#4f46e5",
    gradient: "healthDashboardPressure",
    field: "bp",
    formatter: (value) => `${value} mmHg`,
    rangeLabel: "Blood pressure should stay near your usual care target",
    summaryTitle: "Systolic trend",
  },
  glucose: {
    label: "Glucose",
    unit: "mg/dL",
    icon: Droplets,
    color: "#ec4899",
    gradient: "healthDashboardGlucose",
    field: "glucose",
    formatter: (value) => `${value} mg/dL`,
    rangeLabel: "Glucose is in a manageable range for daily monitoring",
    summaryTitle: "Blood sugar trend",
  },
};

function parseSystolic(bp) {
  if (!bp) return null;
  const [systolic] = String(bp).split("/");
  const parsed = Number(systolic);
  return Number.isFinite(parsed) ? parsed : null;
}

function createFallbackSeries(type, latestValues) {
  const defaults = {
    heartRate: [69, 72, 80, 76, 74, 78, 73, 70],
    bloodPressure: [122, 126, 132, 128, 127, 130, 125, 123],
    glucose: [118, 121, 128, 124, 122, 125, 120, 117],
  };

  const latestValue = latestValues[type];
  const baseline = defaults[type];

  return timelineLabels.map((time, index) => ({
    time,
    value: latestValue && index === baseline.length - 2 ? latestValue : baseline[index],
  }));
}

function buildChartSeries(records, type, latestValues) {
  if (!records.length || records.length < 4) {
    return createFallbackSeries(type, latestValues);
  }

  const recent = records.slice(-timelineLabels.length);
  const labels = timelineLabels.slice(-recent.length);

  return recent.map((record, index) => {
    let value = Number(record[chartConfig[type].field]);

    if (type === "bloodPressure") {
      value = parseSystolic(record.bp);
    }

    return {
      time: labels[index],
      value: Number.isFinite(value) ? value : 0,
    };
  });
}

function computeLatestValues(records) {
  const latestRecord = records[records.length - 1];

  return {
    heartRate: latestRecord?.heart_rate ? Number(latestRecord.heart_rate) : 76,
    bloodPressure: latestRecord?.bp || "130/85",
    glucose: latestRecord?.glucose ? Number(latestRecord.glucose) : 125,
  };
}

function getMetricStatus(type, value) {
  if (type === "heartRate") {
    if (value < 60 || value > 100) return { label: "Attention", tone: "alert" };
    return { label: "Stable", tone: "safe" };
  }

  if (type === "bloodPressure") {
    const systolic = parseSystolic(value);
    if (systolic && systolic >= 140) return { label: "High", tone: "alert" };
    if (systolic && systolic >= 130) return { label: "Watch", tone: "watch" };
    return { label: "Stable", tone: "safe" };
  }

  if (value >= 180) return { label: "High", tone: "alert" };
  if (value >= 130) return { label: "Watch", tone: "watch" };
  return { label: "Stable", tone: "safe" };
}

function getSummaryStats(records, latestValues) {
  const heartValues = records.map((record) => Number(record.heart_rate)).filter(Boolean);
  const glucoseValues = records.map((record) => Number(record.glucose)).filter(Boolean);
  const systolicValues = records.map((record) => parseSystolic(record.bp)).filter(Boolean);

  const average = (values, fallback) => {
    if (!values.length) return fallback;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  return [
    {
      label: "Average Heart Rate",
      value: `${average(heartValues, latestValues.heartRate)} bpm`,
      note: "Based on recent readings",
    },
    {
      label: "Average Systolic BP",
      value: `${average(systolicValues, parseSystolic(latestValues.bloodPressure) || 130)} mmHg`,
      note: "Most recent trend window",
    },
    {
      label: "Average Glucose",
      value: `${average(glucoseValues, latestValues.glucose)} mg/dL`,
      note: "Daily monitoring snapshot",
    },
    {
      label: "Total Entries",
      value: String(records.length || 8),
      note: records.length ? "Stored in your health history" : "Showing starter preview data",
    },
  ];
}

export default function Health() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("heartRate");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = user?.id;

  const loadHealth = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get("/health", { params: { user_id: userId } });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      setFeedback("We couldn't refresh the dashboard right now.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const latestValues = computeLatestValues(records);
  const chartValues = {
    heartRate: latestValues.heartRate,
    bloodPressure: parseSystolic(latestValues.bloodPressure) || 130,
    glucose: latestValues.glucose,
  };
  const metricCards = [
    {
      key: "heartRate",
      label: "Heart Rate",
      displayValue: `${latestValues.heartRate} bpm`,
      icon: Heart,
      trend: "Normal",
    },
    {
      key: "bloodPressure",
      label: "Blood Pressure",
      displayValue: latestValues.bloodPressure,
      icon: Activity,
      trend: "Watch",
    },
    {
      key: "glucose",
      label: "Glucose",
      displayValue: `${latestValues.glucose} mg/dL`,
      icon: Droplets,
      trend: "Monitor",
    },
  ];
  const activeMetric = chartConfig[activeTab];
  const ActiveIcon = activeMetric.icon;
  const activeStatus = getMetricStatus(activeTab, activeTab === "bloodPressure" ? latestValues.bloodPressure : chartValues[activeTab]);
  const chartSeries = buildChartSeries(records, activeTab, chartValues);
  const summaryStats = getSummaryStats(records, latestValues);

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      await api.post("/health", { user_id: userId, ...form });
      setForm(initialForm);
      setShowForm(false);
      setFeedback("New health reading saved successfully.");
      await loadHealth();
    } catch (err) {
      console.error(err);
      setFeedback("We couldn't save that reading. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setFeedback("Refreshing health dashboard...");
    await loadHealth();
    setFeedback("Health dashboard is up to date.");
  };

  return (
    <section className="health-dashboard">
      <div className="health-dashboard__hero">
        <div className="health-dashboard__heroHeader">
          <button
            type="button"
            className="health-dashboard__backButton"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Health Dashboard</h1>
            <p>{`${user?.name || "Margaret"}'s real-time health overview`}</p>
          </div>
        </div>

        <div className="health-dashboard__heroActions">
          <button type="button" className="health-dashboard__ghostButton" onClick={handleRefresh}>
            <RefreshCcw size={16} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="health-dashboard__primaryButton"
            onClick={() => setShowForm((current) => !current)}
          >
            <Plus size={16} />
            <span>{showForm ? "Close Form" : "Add Reading"}</span>
          </button>
          <button
            type="button"
            className="health-dashboard__dangerButton"
            onClick={() => navigate("/sos")}
          >
            <ShieldAlert size={16} />
            <span>Emergency SOS</span>
          </button>
        </div>

        <div className="health-dashboard__metricRow">
          {metricCards.map((card) => {
            const CardIcon = card.icon;

            return (
              <button
                key={card.key}
                type="button"
                className={`health-dashboard__metricCard ${
                  activeTab === card.key ? "health-dashboard__metricCard--active" : ""
                }`}
                onClick={() => setActiveTab(card.key)}
              >
                <div className="health-dashboard__metricIcon">
                  <CardIcon size={18} />
                </div>
                <div className="health-dashboard__metricLabel">{card.label}</div>
                <div className="health-dashboard__metricValue">{card.displayValue}</div>
                <div className="health-dashboard__metricTrend">{card.trend}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="health-dashboard__tabs">
        {Object.entries(chartConfig).map(([key, config]) => (
          <button
            key={key}
            type="button"
            className={`health-dashboard__tab ${
              activeTab === key ? "health-dashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab(key)}
          >
            {config.label}
          </button>
        ))}
        <button
          type="button"
          className={`health-dashboard__tab ${
            activeTab === "summary" ? "health-dashboard__tab--active" : ""
          }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
      </div>

      {feedback ? <div className="health-dashboard__feedback">{feedback}</div> : null}

      {activeTab === "summary" ? (
        <div className="health-dashboard__panel health-dashboard__panel--summary">
          <div className="health-dashboard__panelHeader">
            <div>
              <span className="health-dashboard__eyebrow">Daily snapshot</span>
              <h2>Care summary</h2>
            </div>
            <div className="health-dashboard__summaryBadge">
              <Stethoscope size={16} />
              <span>{records.length ? "Live data connected" : "Preview data active"}</span>
            </div>
          </div>

          <div className="health-dashboard__summaryGrid">
            {summaryStats.map((item) => (
              <article key={item.label} className="health-dashboard__summaryCard">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.note}</small>
              </article>
            ))}
          </div>

          <div className="health-dashboard__summaryNote">
            <span className="health-dashboard__summaryDot" />
            <p>
              {records.length
                ? "Recent readings are stored and reflected across the dashboard cards, chart tabs, and summary insights."
                : "No saved readings yet, so the dashboard is showing a realistic starter preview until you add your first entry."}
            </p>
          </div>
        </div>
      ) : (
        <div className="health-dashboard__panel">
          <div className="health-dashboard__panelHeader">
            <div className="health-dashboard__chartTitle">
              <div className={`health-dashboard__chartIcon health-dashboard__chartIcon--${activeStatus.tone}`}>
                <ActiveIcon size={18} />
              </div>
              <div>
                <h2>{activeMetric.label}</h2>
                <p>{activeMetric.summaryTitle}</p>
              </div>
            </div>
            <div className="health-dashboard__reading">
              <strong>
                {activeTab === "bloodPressure"
                  ? latestValues.bloodPressure
                  : chartValues[activeTab]}
              </strong>
              <span>{activeMetric.unit}</span>
            </div>
          </div>

          <div className="health-dashboard__chartWrap">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={activeMetric.gradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={activeMetric.color} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="#e8eefb" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#8ea1c4", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8ea1c4", fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => activeMetric.formatter(value)}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(37, 99, 235, 0.14)",
                    boxShadow: "0 18px 30px rgba(30, 64, 175, 0.14)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={activeMetric.color}
                  strokeWidth={3}
                  fill={`url(#${activeMetric.gradient})`}
                  dot={{ r: 4, strokeWidth: 2, fill: activeMetric.color }}
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`health-dashboard__status health-dashboard__status--${activeStatus.tone}`}>
            <span className="health-dashboard__statusDot" />
            <p>{activeMetric.rangeLabel}</p>
          </div>
        </div>
      )}

      <div className="health-dashboard__bottomGrid">
        <div className="health-dashboard__panel">
          <div className="health-dashboard__panelHeader">
            <div>
              <span className="health-dashboard__eyebrow">Health log</span>
              <h2>Recent readings</h2>
            </div>
            <span className="health-dashboard__pill">{records.length} saved</span>
          </div>

          <div className="health-dashboard__history">
            {(records.length ? records.slice(-5).reverse() : createFallbackSeries("heartRate", chartValues).slice(-5).reverse()).map((record, index) => {
              const value = record.heart_rate ? `${record.heart_rate} bpm` : `${record.value} bpm`;
              const bp = record.bp || latestValues.bloodPressure;
              const glucose = record.glucose || latestValues.glucose;

              return (
                <div key={record.id || record.time || index} className="health-dashboard__historyItem">
                  <div>
                    <strong>{record.time || `Reading #${record.id}`}</strong>
                    <span>{bp} mmHg</span>
                  </div>
                  <div>
                    <strong>{value}</strong>
                    <span>{glucose} mg/dL</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="health-dashboard__panel">
          <div className="health-dashboard__panelHeader">
            <div>
              <span className="health-dashboard__eyebrow">Add update</span>
              <h2>Record a new reading</h2>
            </div>
            <button
              type="button"
              className="health-dashboard__ghostButton health-dashboard__ghostButton--light"
              onClick={() => setShowForm((current) => !current)}
            >
              {showForm ? "Hide form" : "Open form"}
            </button>
          </div>

          {showForm ? (
            <form className="health-dashboard__form" onSubmit={handleSubmit}>
              <label>
                Heart rate
                <input
                  type="number"
                  value={form.heart_rate}
                  onChange={(event) => handleFormChange("heart_rate", event.target.value)}
                  placeholder="76"
                  required
                />
              </label>
              <label>
                Blood pressure
                <input
                  value={form.bp}
                  onChange={(event) => handleFormChange("bp", event.target.value)}
                  placeholder="130/85"
                  required
                />
              </label>
              <label>
                Glucose
                <input
                  type="number"
                  value={form.glucose}
                  onChange={(event) => handleFormChange("glucose", event.target.value)}
                  placeholder="125"
                  required
                />
              </label>

              <div className="health-dashboard__formActions">
                <button type="submit" className="health-dashboard__primaryButton" disabled={saving}>
                  {saving ? "Saving..." : "Save Reading"}
                </button>
                <button
                  type="button"
                  className="health-dashboard__ghostButton health-dashboard__ghostButton--light"
                  onClick={() => {
                    setForm(initialForm);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="health-dashboard__emptyForm">
              <p>Open the form to add a fresh health reading and update the dashboard instantly.</p>
              <button
                type="button"
                className="health-dashboard__primaryButton"
                onClick={() => setShowForm(true)}
              >
                Add reading
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? <div className="health-dashboard__loading">Loading health readings...</div> : null}
    </section>
  );
}
