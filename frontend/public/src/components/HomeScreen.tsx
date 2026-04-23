import { useNavigate } from "react-router";
import {
  Bell,
  Heart,
  Activity,
  UserCheck,
  Video,
  ChevronRight,
  Clock,
  Pill,
  Users,
  AlertTriangle,
  Star,
  Droplets,
  Thermometer,
  CalendarCheck,
  MapPin,
} from "lucide-react";

const PATIENT_IMG =
  "https://images.unsplash.com/photo-1758686254563-5c5ab338c8b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

export function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Welcome Banner */}
      <div
        className="rounded-3xl p-5 shadow-xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 60%, #1a6db5 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10"
          style={{ background: "white" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
          style={{ background: "white" }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/60 shadow-lg" style={{ borderWidth: 3 }}>
                <img src={PATIENT_IMG} alt="Margaret" className="w-full h-full object-cover" />
              </div>
              <span
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
                style={{ background: "#22c55e" }}
              />
            </div>
            <div>
              <div className="text-white/70 text-xs mb-0.5">Good Morning 👋</div>
              <div className="text-white font-extrabold text-xl leading-tight">Margaret Wilson</div>
              <div className="flex items-center gap-1 mt-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <Star key={s} size={13} className="fill-yellow-400 text-yellow-400" />
                ))}
                <Star size={13} className="text-white/30" />
                <span className="text-white/70 text-xs ml-1">Premium Member</span>
              </div>
            </div>
          </div>
          <div className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: "#e53e3e", fontSize: 10 }}
            >
              3
            </span>
          </div>
        </div>

        {/* Date + Location */}
        <div className="flex items-center gap-4 mt-4 relative z-10">
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <CalendarCheck size={13} />
            <span>Friday, March 6, 2026</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <MapPin size={13} />
            <span>Seattle, WA</span>
          </div>
        </div>
      </div>

      {/* Health At A Glance */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Your Health At A Glance</h3>
          <button
            onClick={() => navigate("/health-dashboard")}
            className="text-xs px-3 py-1.5 rounded-full font-medium text-white"
            style={{ background: "#1a6db5" }}
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <HealthCard
            icon={<Activity size={20} style={{ color: "#3b82f6" }} />}
            label="Blood Pressure"
            value="130/85"
            unit="mmHg"
            badge="High"
            badgeColor="#e53e3e"
            bg="#eff6ff"
          />
          <HealthCard
            icon={<Heart size={20} style={{ color: "#ef4444", fill: "#ef4444" }} />}
            label="Heart Rate"
            value="76"
            unit="bpm"
            badge="Normal"
            badgeColor="#22c55e"
            bg="#fef2f2"
          />
          <HealthCard
            icon={<Droplets size={20} style={{ color: "#f59e0b" }} />}
            label="Glucose"
            value="125"
            unit="mg/dL"
            badge="Watch"
            badgeColor="#f59e0b"
            bg="#fffbeb"
          />
          <HealthCard
            icon={<Thermometer size={20} style={{ color: "#8b5cf6" }} />}
            label="Temperature"
            value="98.6"
            unit="°F"
            badge="Normal"
            badgeColor="#22c55e"
            bg="#f5f3ff"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            label="Book Caregiver"
            icon={<UserCheck size={22} className="text-white" />}
            gradient="linear-gradient(135deg, #22c55e, #16a34a)"
            onClick={() => navigate("/book-caregiver")}
          />
          <QuickAction
            label="Telemedicine"
            icon={<Video size={22} className="text-white" />}
            gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
            onClick={() => navigate("/telemedicine")}
          />
          <QuickAction
            label="Health Report"
            icon={<Activity size={22} className="text-white" />}
            gradient="linear-gradient(135deg, #ef4444, #dc2626)"
            onClick={() => navigate("/health-dashboard")}
          />
          <QuickAction
            label="Family"
            icon={<Users size={22} className="text-white" />}
            gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"
            onClick={() => navigate("/family-monitoring")}
          />
        </div>
      </div>

      {/* Upcoming Visit */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Upcoming Visit</h3>
          <span className="text-xs text-blue-600 font-medium cursor-pointer">See all</span>
        </div>
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #e8f4fd, #dbeafe)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "white" }}
            >
              <img
                src="https://images.unsplash.com/photo-1676552055618-22ec8cde399a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100"
                alt="Sarah"
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm">Sarah M. — Nurse Visit</div>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                <Clock size={12} />
                Today · 3:00 PM
              </div>
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ background: "#1a6db5" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <NavRow
          icon={<Pill size={18} style={{ color: "#ef4444" }} />}
          iconBg="#fef2f2"
          label="Medication Reminder"
          sub="Morning pills at 8:00 AM"
          badge="Due Today"
          badgeColor="#ef4444"
          onClick={() => navigate("/medication-reminder")}
        />
        <NavRow
          icon={<AlertTriangle size={18} style={{ color: "#e53e3e" }} />}
          iconBg="#fff5f5"
          label="Emergency SOS"
          sub="Tap to send alert"
          onClick={() => navigate("/emergency-sos")}
        />
        <NavRow
          icon={<Users size={18} style={{ color: "#8b5cf6" }} />}
          iconBg="#f5f3ff"
          label="Family Monitoring"
          sub="John & Mary are watching"
          badge="Active"
          badgeColor="#22c55e"
          onClick={() => navigate("/family-monitoring")}
        />
      </div>
    </div>
  );
}

function HealthCard({
  icon,
  label,
  value,
  unit,
  badge,
  badgeColor,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  badge: string;
  badgeColor: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: bg }}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-extrabold text-gray-800 text-lg">{value}</span>
        <span className="text-gray-400 text-xs">{unit}</span>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  gradient,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">{label}</span>
    </button>
  );
}

function NavRow({
  icon,
  iconBg,
  label,
  sub,
  badge,
  badgeColor,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-gray-700 text-sm">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: badgeColor }}
          >
            {badge}
          </span>
        )}
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </button>
  );
}
