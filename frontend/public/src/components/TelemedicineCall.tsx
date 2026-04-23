import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  PhoneOff,
  ChevronLeft,
  Star,
  Send,
  BadgeCheck,
  Phone,
} from "lucide-react";

const DOCTOR_IMG =
  "https://images.unsplash.com/photo-1758691463605-f4a3a92d6d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";
const PATIENT_IMG =
  "https://images.unsplash.com/photo-1758686254563-5c5ab338c8b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

const initialMessages = [
  { from: "doctor", text: "Hello Margaret! How are you feeling today?" },
  { from: "patient", text: "Hello Doctor, I have been feeling a bit dizzy lately." },
  { from: "doctor", text: "I see. Can you describe when the dizziness occurs? Is it when you stand up?" },
];

export function TelemedicineCall() {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [newMsg, setNewMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (callStarted && !callEnded) {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStarted, callEnded]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages([...messages, { from: "patient", text: newMsg.trim() }]);
    setNewMsg("");
  };

  if (callEnded) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-10 shadow-sm flex flex-col items-center gap-5 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "#fef2f2" }}
          >
            <PhoneOff size={40} className="text-red-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-gray-800">Call Ended</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Duration: <span className="font-bold">{formatTime(elapsed)}</span>
            </p>
            <p className="text-gray-400 text-xs mt-1">Session with Dr. Ahmed Karimi</p>
          </div>
          <div className="w-full p-4 rounded-2xl" style={{ background: "#f9fafb" }}>
            <p className="text-sm text-gray-600 mb-3">Rate your experience</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={28} className="fill-yellow-400 text-yellow-400 cursor-pointer" />
              ))}
            </div>
          </div>
          <button
            onClick={() => { setCallEnded(false); setCallStarted(false); setElapsed(0); }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: "linear-gradient(135deg, #1a6db5, #0d4f8a)" }}
          >
            Start New Call
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-2xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div
        className="rounded-3xl p-4 text-white shadow-xl flex items-center justify-between relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)" }}
      >
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">Telemedicine Call</h2>
            <p className="text-white/70 text-xs">Secure Video Consultation</p>
          </div>
        </div>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 relative z-10"
        >
          <MessageCircle size={18} className="text-white" />
        </button>
      </div>

      {/* Doctor Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={DOCTOR_IMG}
              alt="Dr. Ahmed"
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: "#22c55e" }}
            >
              <span className="text-white" style={{ fontSize: 8 }}>●</span>
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-800">Dr. Ahmed Karimi</span>
              <BadgeCheck size={16} className="text-blue-500" />
            </div>
            <div className="text-sm text-gray-500 mt-0.5">General Physician · MBBS, MD</div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400">4.9 · 200+ consultations</span>
            </div>
          </div>
          <a
            href="tel:+15550101"
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#f0fdf4" }}
          >
            <Phone size={18} className="text-green-500" />
          </a>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: 400 }}>
        {/* Doctor's main video (full) */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #1e3a5f 0%, #0d2644 100%)" }}
        >
          {!cameraOff ? (
            <img
              src={DOCTOR_IMG}
              alt="Doctor"
              className="w-full h-full object-cover"
              style={{ opacity: callStarted ? 1 : 0.4 }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <VideoOff size={48} className="text-white/30" />
              <span className="text-white/40 text-sm">Camera Off</span>
            </div>
          )}
        </div>

        {/* Top overlay gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }}
        />

        {/* Bottom overlay gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
        />

        {/* Patient PiP */}
        <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
          <img
            src={PATIENT_IMG}
            alt="Margaret"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <span className="text-white text-[10px] font-medium">You</span>
          </div>
        </div>

        {/* Timer */}
        {callStarted && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white font-bold text-sm bg-black/30 px-3 py-1 rounded-full">
              {formatTime(elapsed)}
            </span>
          </div>
        )}

        {/* Pre-call screen */}
        {!callStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-5">
            <div className="text-center">
              <img
                src={DOCTOR_IMG}
                alt="Dr. Ahmed"
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white/50 mb-3"
              />
              <div className="text-white font-bold text-lg">Dr. Ahmed Karimi</div>
              <div className="text-white/60 text-sm">Ready to connect...</div>
            </div>
            <button
              onClick={() => setCallStarted(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold shadow-xl"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              <Phone size={18} />
              Start Call
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-center gap-4">
          <ControlBtn
            icon={muted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
            label={muted ? "Unmute" : "Mute"}
            active={muted}
            activeColor="#ef4444"
            onClick={() => setMuted(!muted)}
          />
          <ControlBtn
            icon={cameraOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
            label={cameraOff ? "Show" : "Hide"}
            active={cameraOff}
            activeColor="#ef4444"
            onClick={() => setCameraOff(!cameraOff)}
          />
          <ControlBtn
            icon={<MessageCircle size={20} className="text-white" />}
            label="Chat"
            active={chatOpen}
            activeColor="#3b82f6"
            onClick={() => setChatOpen(!chatOpen)}
          />
          <button
            onClick={() => { if (callStarted) setCallEnded(true); }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: "#e53e3e" }}
            >
              <PhoneOff size={22} className="text-white" />
            </div>
            <span className="text-white text-[11px]">End</span>
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-bold text-gray-700">Chat with Dr. Ahmed</h4>
            <button
              onClick={() => setChatOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}
              >
                {m.from === "doctor" && (
                  <img
                    src={DOCTOR_IMG}
                    alt="Doctor"
                    className="w-7 h-7 rounded-full object-cover mr-2 mt-1 flex-shrink-0"
                  />
                )}
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm max-w-[75%]"
                  style={{
                    background: m.from === "patient" ? "#1a6db5" : "#f3f4f6",
                    color: m.from === "patient" ? "white" : "#374151",
                    borderRadius: m.from === "patient" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: "#1a6db5" }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlBtn({
  icon,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors"
        style={{ background: active ? activeColor : "rgba(255,255,255,0.2)" }}
      >
        {icon}
      </div>
      <span className="text-white text-[11px]">{label}</span>
    </button>
  );
}
