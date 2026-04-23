import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle,
  Circle,
  Bell,
  ChevronLeft,
  Pill,
  Clock,
  ChevronRight,
  Plus,
  Sun,
  CloudSun,
  Moon,
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dose: string;
  color: string;
  instructions?: string;
}

interface Period {
  id: string;
  label: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  meds: Medication[];
}

const initialPeriods: Period[] = [
  {
    id: "morning",
    label: "Morning",
    time: "8:00 AM",
    icon: <Sun size={18} style={{ color: "#f59e0b" }} />,
    color: "#f59e0b",
    bg: "#fffbeb",
    meds: [
      { id: "asp", name: "Aspirin", dose: "75mg · 1 Tablet", color: "#ef4444", instructions: "Take with water" },
      { id: "met", name: "Metformin", dose: "500mg · 1 Tablet", color: "#3b82f6", instructions: "Take with food" },
      { id: "cal", name: "Calcium Supplement", dose: "500mg · 1 Tablet", color: "#8b5cf6" },
    ],
  },
  {
    id: "afternoon",
    label: "Afternoon",
    time: "1:00 PM",
    icon: <CloudSun size={18} style={{ color: "#22c55e" }} />,
    color: "#22c55e",
    bg: "#f0fdf4",
    meds: [
      { id: "vitD", name: "Vitamin D", dose: "1000 IU · 1 Capsule", color: "#f59e0b", instructions: "Take after lunch" },
      { id: "omega", name: "Omega-3", dose: "1000mg · 1 Capsule", color: "#22c55e" },
    ],
  },
  {
    id: "night",
    label: "Night",
    time: "9:00 PM",
    icon: <Moon size={18} style={{ color: "#6366f1" }} />,
    color: "#6366f1",
    bg: "#eef2ff",
    meds: [
      { id: "ator", name: "Atorvastatin", dose: "20mg · 1 Tablet", color: "#22c55e", instructions: "Take at bedtime" },
      { id: "bp", name: "Amlodipine", dose: "5mg · 1 Tablet", color: "#3b82f6" },
    ],
  },
];

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const upcomingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MedicationReminder() {
  const navigate = useNavigate();
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState("Mon");

  const allMeds = initialPeriods.flatMap((p) => p.meds);
  const takenCount = allMeds.filter((m) => takenMap[m.id]).length;
  const progress = Math.round((takenCount / allMeds.length) * 100);

  const toggleMed = (id: string) => {
    setTakenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markPeriodAll = (period: Period) => {
    setTakenMap((prev) => {
      const next = { ...prev };
      period.meds.forEach((m) => { next[m.id] = true; });
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <div>
              <h2 className="font-extrabold text-lg">Medication Reminder</h2>
              <p className="text-white/70 text-xs">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Bell size={14} className="text-white" />
            <span className="text-white text-xs font-semibold">Reminders On</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800">Today's Progress</h3>
            <p className="text-xs text-gray-400 mt-0.5">{takenCount} of {allMeds.length} medications taken</p>
          </div>
          <div
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-4"
            style={{ borderColor: progress === 100 ? "#22c55e" : "#1a6db5", color: progress === 100 ? "#22c55e" : "#1a6db5" }}
          >
            <span className="font-extrabold text-lg leading-none">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background:
                progress === 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #1a6db5, #3b82f6)",
            }}
          />
        </div>
        {progress === 100 && (
          <div className="mt-3 text-center">
            <span className="text-green-600 font-bold text-sm">🎉 All medications taken for today!</span>
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {upcomingDays.map((d, i) => {
            const isToday = i === 0;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all ${
                  selectedDay === d ? "text-white shadow-md" : "text-gray-500"
                }`}
                style={selectedDay === d ? { background: "linear-gradient(135deg, #1a6db5, #0d4f8a)" } : {}}
              >
                <span className="text-xs font-medium">{d}</span>
                {isToday && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: selectedDay === d ? "white" : "#1a6db5" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Medication Schedule */}
      {initialPeriods.map((period) => {
        const periodTaken = period.meds.filter((m) => takenMap[m.id]).length;
        return (
          <div key={period.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {/* Period Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: period.bg }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "white" }}
                >
                  {period.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{period.label}</div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Clock size={11} />
                    {period.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">
                  {periodTaken}/{period.meds.length}
                </span>
                <button
                  onClick={() => markPeriodAll(period)}
                  className="text-xs px-3 py-1.5 rounded-full font-bold text-white"
                  style={{ background: period.color }}
                >
                  Mark All
                </button>
              </div>
            </div>

            {/* Medications */}
            <div className="divide-y divide-gray-50">
              {period.meds.map((med) => {
                const taken = !!takenMap[med.id];
                return (
                  <button
                    key={med.id}
                    onClick={() => toggleMed(med.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Pill Indicator */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: taken ? "#f0fdf4" : `${med.color}18` }}
                    >
                      <Pill size={18} style={{ color: taken ? "#22c55e" : med.color }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm ${taken ? "line-through text-gray-400" : "text-gray-800"}`}
                      >
                        {med.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{med.dose}</div>
                      {med.instructions && !taken && (
                        <div className="text-xs mt-1 font-medium" style={{ color: med.color }}>
                          {med.instructions}
                        </div>
                      )}
                    </div>
                    {/* Check */}
                    {taken ? (
                      <CheckCircle size={24} style={{ color: "#22c55e", fill: "#22c55e" }} />
                    ) : (
                      <Circle size={24} className="text-gray-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add New Medication */}
      <button
        className="w-full py-4 rounded-3xl border-2 border-dashed border-blue-200 flex items-center justify-center gap-2 text-blue-400 font-semibold hover:bg-blue-50 transition-colors"
      >
        <Plus size={18} />
        Add New Medication
      </button>

      {/* Upcoming */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Upcoming Reminders</h3>
          <span className="text-xs text-blue-600 font-medium">See all</span>
        </div>
        <div className="space-y-3">
          {[
            { name: "Aspirin + Metformin", time: "Tomorrow · 8:00 AM", icon: <Sun size={14} style={{ color: "#f59e0b" }} />, bg: "#fffbeb" },
            { name: "Vitamin D + Omega-3", time: "Tomorrow · 1:00 PM", icon: <CloudSun size={14} style={{ color: "#22c55e" }} />, bg: "#f0fdf4" },
            { name: "Atorvastatin + Amlodipine", time: "Tomorrow · 9:00 PM", icon: <Moon size={14} style={{ color: "#6366f1" }} />, bg: "#eef2ff" },
          ].map(({ name, time, icon, bg }) => (
            <div
              key={name}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-700 text-sm">{name}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock size={11} /> {time}
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
