import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Activity,
  Droplets,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const PATIENT_IMG =
  "https://images.unsplash.com/photo-1758686254563-5c5ab338c8b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

const weeklyTrend = [
  { day: "Mon", hr: 74, bp: 128 },
  { day: "Tue", hr: 76, bp: 132 },
  { day: "Wed", hr: 78, bp: 135 },
  { day: "Thu", hr: 72, bp: 130 },
  { day: "Fri", hr: 76, bp: 130 },
  { day: "Sat", hr: 75, bp: 127 },
  { day: "Sun", hr: 76, bp: 128 },
];

const activityData = [
  { hour: "6am", steps: 200 },
  { hour: "9am", steps: 800 },
  { hour: "12pm", steps: 1200 },
  { hour: "3pm", steps: 600 },
  { hour: "6pm", steps: 400 },
  { hour: "9pm", steps: 100 },
];

export function FamilyMonitoring() {
  const navigate = useNavigate();
  const [medicationTaken, setMedicationTaken] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">Family Monitoring</h2>
            <p className="text-white/70 text-xs">Real-time updates for your loved one</p>
          </div>
        </div>
      </div>

      {/* Patient Health Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        {/* Patient Info */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={PATIENT_IMG}
                alt="Margaret"
                className="w-14 h-14 rounded-2xl object-cover"
              />
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                style={{ background: "#f59e0b" }}
              />
            </div>
            <div>
              <div className="font-extrabold text-gray-800">Margaret Wilson</div>
              <div className="text-xs text-gray-500">Patient · 72 years old</div>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "#fff8e6" }}
          >
            <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
            <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Needs Attention</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          <MetricRow
            icon={<Activity size={18} style={{ color: "#3b82f6" }} />}
            iconBg="#eff6ff"
            label="Blood Pressure"
            value="130/85 mmHg"
            alert
          />
          <MetricRow
            icon={<Heart size={18} style={{ color: "#ef4444", fill: "#ef4444" }} />}
            iconBg="#fef2f2"
            label="Heart Rate"
            value="76 bpm"
          />
          <MetricRow
            icon={<Droplets size={18} style={{ color: "#f59e0b" }} />}
            iconBg="#fffbeb"
            label="Glucose Level"
            value="125 mg/dL"
            warn
          />
        </div>

        {/* Mark as Taken */}
        <button
          onClick={() => setMedicationTaken(!medicationTaken)}
          className="w-full mt-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{
            background: medicationTaken
              ? "linear-gradient(135deg, #6b7280, #4b5563)"
              : "linear-gradient(135deg, #22c55e, #16a34a)",
          }}
        >
          <CheckCircle size={18} />
          {medicationTaken ? "Medication Marked as Taken ✓" : "Mark Medication as Taken"}
        </button>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Weekly Health Trends</h3>
          <span className="text-xs text-blue-600 font-medium cursor-pointer">This week</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            <Line
              type="monotone"
              dataKey="hr"
              stroke="#ef4444"
              strokeWidth={2.5}
              name="Heart Rate"
              dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="bp"
              stroke="#3b82f6"
              strokeWidth={2.5}
              name="BP Systolic"
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-2 justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-4 h-0.5 rounded-full inline-block bg-red-500" />
            Heart Rate
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-4 h-0.5 rounded-full inline-block bg-blue-500" />
            BP Systolic
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Today's Activity</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-extrabold text-3xl text-gray-800">3,280</span>
          <span className="text-gray-400 text-sm">/ 5,000 steps goal</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
          <div
            className="h-full rounded-full"
            style={{ width: "65%", background: "linear-gradient(90deg, #1a6db5, #22c55e)" }}
          />
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a6db5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1a6db5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            <Area
              type="monotone"
              dataKey="steps"
              stroke="#1a6db5"
              strokeWidth={2}
              fill="url(#actGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Family Members */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Connected Family</h3>
          <button
            className="flex items-center gap-1 text-xs font-medium text-blue-600"
          >
            <Users size={14} />
            Add Member
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: "John Wilson", relation: "Son", emoji: "👨", status: "Online", statusColor: "#22c55e", lastSeen: "Now" },
            { name: "Mary Wilson", relation: "Daughter", emoji: "👩", status: "Online", statusColor: "#22c55e", lastSeen: "5 min ago" },
            { name: "Dr. Ahmed Karimi", relation: "Physician", emoji: "👨‍⚕️", status: "On Call", statusColor: "#3b82f6", lastSeen: "Available" },
            { name: "Sarah M.", relation: "Caregiver", emoji: "👩‍⚕️", status: "Active", statusColor: "#22c55e", lastSeen: "Nearby" },
          ].map(({ name, relation, emoji, status, statusColor, lastSeen }) => (
            <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#f9fafb", fontSize: 22 }}
              >
                {emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700 text-sm">{name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{relation}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{lastSeen}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${statusColor}18`, color: statusColor }}
                >
                  {status}
                </span>
                <div className="flex gap-1">
                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#f0fdf4" }}
                  >
                    <Phone size={14} className="text-green-500" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#eff6ff" }}
                  >
                    <MessageCircle size={14} className="text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Log */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {[
            { msg: "Blood pressure elevated to 135/88", time: "2h ago", type: "warning" },
            { msg: "Morning medication taken", time: "3h ago", type: "ok" },
            { msg: "Nurse visit completed by Sarah M.", time: "Yesterday", type: "ok" },
          ].map(({ msg, time, type }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: type === "warning" ? "#fff5f5" : "#f0fdf4" }}
              >
                {type === "warning" ? (
                  <AlertTriangle size={15} className="text-red-500" />
                ) : (
                  <CheckCircle size={15} className="text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-700 font-medium">{msg}</div>
                <div className="text-xs text-gray-400 mt-0.5">{time}</div>
              </div>
              <ChevronRight size={15} className="text-gray-200 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  iconBg,
  label,
  value,
  alert,
  warn,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  alert?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-800">{value}</span>
        {alert && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#e53e3e" }}>High</span>
        )}
        {warn && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#f59e0b" }}>Watch</span>
        )}
      </div>
    </div>
  );
}
