import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Phone,
  MapPin,
  Users,
  X,
  Wifi,
  Bell,
} from "lucide-react";

export function EmergencySOS() {
  const navigate = useNavigate();
  const [sosState, setSosState] = useState<"idle" | "counting" | "active">("idle");
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSOS = () => {
    setSosState("counting");
    let c = 3;
    setCountdown(c);
    timerRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) {
        clearInterval(timerRef.current!);
        setSosState("active");
      }
    }, 1000);
  };

  const cancelSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSosState("idle");
    setCountdown(3);
  };

  const actions = [
    {
      icon: Phone,
      label: "Calling Emergency Services",
      detail: "911 — Ambulance dispatched",
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      icon: MapPin,
      label: "Location Shared",
      detail: "123 Oak St, Seattle WA · GPS active",
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      icon: Users,
      label: "Family Notified",
      detail: "John & Mary have been alerted",
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      icon: Bell,
      label: "Caregiver Alerted",
      detail: "Sarah M. is on her way",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #c53030, #9b2c2c)" }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">Emergency SOS</h2>
            <p className="text-white/70 text-xs">Instant help at your fingertips</p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {sosState === "active" && (
        <div
          className="rounded-3xl p-5 text-white shadow-xl text-center"
          style={{ background: "linear-gradient(135deg, #e53e3e, #c53030)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <AlertTriangle size={32} className="text-yellow-300 animate-bounce" />
            <span className="font-extrabold text-2xl">SOS ALERT SENT!</span>
            <AlertTriangle size={32} className="text-yellow-300 animate-bounce" />
          </div>
          <p className="text-white/80 text-sm">Help is on the way. Stay calm.</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Wifi size={14} className="text-white/60" />
            <span className="text-white/60 text-xs">Alerting all emergency contacts...</span>
          </div>
        </div>
      )}

      {/* SOS Button Area */}
      <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center gap-6">
        {sosState === "idle" && (
          <>
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-1">Press & Hold for Emergency</h3>
              <p className="text-gray-400 text-sm">
                Your family, caregiver, and emergency services will be alerted immediately
              </p>
            </div>
            {/* SOS Ring Button */}
            <div className="relative flex items-center justify-center">
              {/* Ripple rings */}
              <div
                className="absolute w-48 h-48 rounded-full opacity-20 animate-ping"
                style={{ background: "#e53e3e" }}
              />
              <div
                className="absolute w-40 h-40 rounded-full opacity-30 animate-ping"
                style={{ background: "#e53e3e", animationDelay: "0.2s" }}
              />
              <button
                onClick={startSOS}
                className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000)",
                  boxShadow: "0 8px 32px rgba(229,62,62,0.6)",
                }}
              >
                <AlertTriangle size={36} className="text-yellow-300" />
                <span className="font-extrabold text-xl tracking-widest">SOS</span>
                <span className="text-white/70 text-[10px]">Tap to activate</span>
              </button>
            </div>
          </>
        )}

        {sosState === "counting" && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl text-white"
              style={{ background: "radial-gradient(circle, #e53e3e, #c53030)" }}
            >
              <span className="font-extrabold text-5xl">{countdown}</span>
              <span className="text-xs text-white/70">Sending SOS...</span>
            </div>
            <button
              onClick={cancelSOS}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
            >
              <X size={16} />
              Cancel SOS
            </button>
          </div>
        )}

        {sosState === "active" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div
              className="w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl text-white"
              style={{ background: "radial-gradient(circle, #22c55e, #16a34a)" }}
            >
              <CheckCircle size={48} className="text-white" />
              <span className="font-bold text-sm mt-1">Sent!</span>
            </div>
            <button
              onClick={cancelSOS}
              className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 transition-colors"
            >
              Cancel Alert
            </button>
          </div>
        )}
      </div>

      {/* Action Status */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">
            {sosState === "active" ? "✅ Actions Completed" : "What happens when SOS is triggered"}
          </h3>
        </div>
        {actions.map(({ icon: Icon, label, detail, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              {sosState === "active" ? (
                <CheckCircle size={20} style={{ color }} />
              ) : (
                <Icon size={20} style={{ color }} />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-700 text-sm">{label}</div>
              {sosState === "active" && (
                <div className="text-xs text-gray-400 mt-0.5">{detail}</div>
              )}
            </div>
            {sosState === "active" && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: `${color}20`, color }}
              >
                Done
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Emergency Contacts</h3>
        <div className="space-y-3">
          {[
            { name: "Dr. Ahmed Karimi", role: "Primary Physician", number: "+1 555-0101", color: "#3b82f6" },
            { name: "John Wilson (Son)", role: "Family Member", number: "+1 555-0202", color: "#22c55e" },
            { name: "Mary Wilson (Daughter)", role: "Family Member", number: "+1 555-0303", color: "#8b5cf6" },
            { name: "Sarah M.", role: "Assigned Caregiver", number: "+1 555-0404", color: "#f59e0b" },
          ].map(({ name, role, number, color }) => (
            <div
              key={name}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Users size={16} style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700 text-sm">{name}</div>
                <div className="text-xs text-gray-400">{role}</div>
              </div>
              <a
                href={`tel:${number}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                <Phone size={13} />
                Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
