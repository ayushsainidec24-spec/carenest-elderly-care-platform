import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Activity,
  Droplets,
  ChevronRight,
  AlertTriangle,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const heartRateData = [
  { time: "6am", value: 70 },
  { time: "8am", value: 74 },
  { time: "10am", value: 82 },
  { time: "12pm", value: 78 },
  { time: "2pm", value: 76 },
  { time: "4pm", value: 80 },
  { time: "6pm", value: 75 },
  { time: "8pm", value: 72 },
];

const bpWeekly = [
  { day: "Mon", sys: 128, dia: 82 },
  { day: "Tue", sys: 132, dia: 85 },
  { day: "Wed", sys: 135, dia: 88 },
  { day: "Thu", sys: 130, dia: 84 },
  { day: "Fri", sys: 130, dia: 85 },
  { day: "Sat", sys: 127, dia: 81 },
  { day: "Sun", sys: 128, dia: 83 },
];

const glucoseData = [
  { day: "Mon", value: 118 },
  { day: "Tue", value: 124 },
  { day: "Wed", value: 130 },
  { day: "Thu", value: 125 },
  { day: "Fri", value: 122 },
  { day: "Sat", value: 128 },
  { day: "Sun", value: 125 },
];

const tabs = ["Heart Rate", "Blood Pressure", "Glucose", "Summary"];

export function HealthDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Heart Rate");

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="flex items-center gap-3 relative z-10 mb-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">Health Dashboard</h2>
            <p className="text-white/70 text-xs">Margaret's Real-time Health Overview</p>
          </div>
        </div>
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { label: "Heart Rate", value: "76 bpm", icon: "❤️", trend: "stable" },
            { label: "Blood Pressure", value: "130/85", icon: "🩺", trend: "up" },
            { label: "Glucose", value: "125 mg/dL", icon: "🩸", trend: "watch" },
          ].map(({ label, value, icon, trend }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{icon}</span>
                {trend === "up" ? (
                  <TrendingUp size={14} className="text-red-300" />
                ) : trend === "stable" ? (
                  <Minus size={14} className="text-green-300" />
                ) : (
                  <TrendingDown size={14} className="text-yellow-300" />
                )}
              </div>
              <div className="text-white font-bold text-sm">{value}</div>
              <div className="text-white/60 text-[10px]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-2 shadow-sm flex gap-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === t ? "text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            }`}
            style={activeTab === t ? { background: "linear-gradient(135deg, #1a6db5, #0d4f8a)" } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Heart Rate Tab */}
      {activeTab === "Heart Rate" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}>
                  <Heart size={18} style={{ color: "#ef4444", fill: "#ef4444" }} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Heart Rate</div>
                  <div className="text-xs text-gray-400">Today's trend</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-gray-800">76</div>
                <div className="text-xs text-gray-400">bpm</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={heartRateData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 95]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#hrGrad)"
                  dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-3 p-3 rounded-2xl" style={{ background: "#f0fdf4" }}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-700 font-medium">Heart rate is within normal range (60–100 bpm)</span>
            </div>
          </div>
        </div>
      )}

      {/* Blood Pressure Tab */}
      {activeTab === "Blood Pressure" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#eff6ff" }}>
                  <Activity size={18} style={{ color: "#3b82f6" }} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Blood Pressure</div>
                  <div className="text-xs text-gray-400">Weekly trend</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-gray-800">130/85</div>
                <div className="text-xs text-gray-400">mmHg</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bpWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 150]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                />
                <Line
                  type="monotone"
                  dataKey="sys"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  name="Systolic"
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="dia"
                  stroke="#93c5fd"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Diastolic"
                  dot={{ r: 4, fill: "#93c5fd", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3 justify-center">
              <Legend color="#3b82f6" label="Systolic" />
              <Legend color="#93c5fd" label="Diastolic" dashed />
            </div>
            <div className="flex items-center gap-2 mt-4 p-3 rounded-2xl" style={{ background: "#fff5f5" }}>
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 font-medium">
                ⚠ Blood Pressure is slightly elevated. Monitor closely.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Glucose Tab */}
      {activeTab === "Glucose" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fffbeb" }}>
                  <Droplets size={18} style={{ color: "#f59e0b" }} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Blood Glucose</div>
                  <div className="text-xs text-gray-400">Weekly readings</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-2xl text-gray-800">125</div>
                <div className="text-xs text-gray-400">mg/dL</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[100, 145]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Glucose" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-3 p-3 rounded-2xl" style={{ background: "#fffbeb" }}>
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm text-yellow-700 font-medium">Pre-diabetic range. Consult your doctor.</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "Summary" && (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {[
            {
              icon: Heart,
              label: "Heart Rate",
              value: "76 bpm",
              sub: "Normal range (60–100)",
              color: "#ef4444",
              bg: "#fef2f2",
              status: "Normal",
              statusColor: "#22c55e",
            },
            {
              icon: Activity,
              label: "Blood Pressure",
              value: "130/85 mmHg",
              sub: "Stage 1 Hypertension",
              color: "#3b82f6",
              bg: "#eff6ff",
              status: "Elevated",
              statusColor: "#e53e3e",
            },
            {
              icon: Droplets,
              label: "Glucose Level",
              value: "125 mg/dL",
              sub: "Pre-diabetic range",
              color: "#f59e0b",
              bg: "#fffbeb",
              status: "Watch",
              statusColor: "#f59e0b",
            },
          ].map(({ icon: Icon, label, value, sub, color, bg, status, statusColor }) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{sub}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-gray-800 text-sm">{value}</div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${statusColor}20`, color: statusColor }}
                  >
                    {status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="flex items-center gap-0.5">
        <span
          className="inline-block h-0.5 w-4 rounded-full"
          style={{ background: color, borderTop: dashed ? `2px dashed ${color}` : undefined }}
        />
      </div>
      {label}
    </div>
  );
}
