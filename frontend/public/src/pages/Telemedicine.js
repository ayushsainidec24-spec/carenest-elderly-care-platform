/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  Star,
  Video,
  VideoOff,
} from "lucide-react";
import api from "../api";
import "./Telemedicine.css";

const DOCTOR_PLACEHOLDER = "/images/avatar.svg";
const POLL_INTERVAL_MS = 1200;
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const initialMessages = [
  { from: "doctor", text: "Hello Margaret, I'm ready whenever you are." },
  { from: "doctor", text: "Please start the call and let me know how you're feeling today." },
];

function decodeRoomPhone(roomId) {
  if (!roomId) return "";

  try {
    const normalized = roomId.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    return window.atob(`${normalized}${"=".repeat(paddingLength)}`);
  } catch {
    return "";
  }
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

function createEmptyRemoteStream() {
  return new MediaStream();
}

function getPermissionHelp(error) {
  const isSecure = window.isSecureContext || window.location.hostname === "localhost";
  const protocol = window.location.protocol;
  const name = error?.name || "";

  if (!isSecure && protocol !== "https:") {
    return {
      title: "Phone browsers need a secure URL",
      body:
        "Chrome on mobile usually blocks camera and microphone on local http addresses like 192.168.x.x. Open this app from an https URL or localhost to use face-to-face calling.",
      steps: [
        "Open the app using an https link instead of a local http address.",
        "If you are testing locally, use a secure tunnel such as ngrok or cloudflared.",
        "After opening the secure link, allow Camera and Microphone when Chrome asks.",
      ],
    };
  }

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      title: "Camera or microphone permission was blocked",
      body:
        "Chrome can only start the call after both camera and microphone are allowed for this site.",
      steps: [
        "Tap the lock icon in Chrome, open Site settings, then allow Camera and Microphone.",
        "On Android, also check Settings > Apps > Chrome > Permissions.",
        "Return here and press Retry Permissions or Start Call again.",
      ],
    };
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      title: "No camera or microphone was found",
      body:
        "Your phone or browser could not find an available camera or microphone for the consultation.",
      steps: [
        "Make sure no other app is currently using the camera.",
        "Reconnect headphones or external audio devices if you use them.",
        "Try again after refreshing the page.",
      ],
    };
  }

  return {
    title: "Camera setup needs attention",
    body:
      "The browser could not start the video consultation yet. Check permissions and retry the camera request.",
    steps: [
      "Confirm Camera and Microphone are allowed in Chrome site settings.",
      "If you are on phone, prefer an https link for the app.",
      "Press Retry Permissions after making changes.",
    ],
  };
}

export default function Telemedicine() {
  const roomParam = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "";
  }, []);
  const hasJoinLink = Boolean(roomParam);

  const [displayName, setDisplayName] = useState(
    roomParam ? "CareNest Guest" : "Margaret Wilson"
  );
  const [customerNumber, setCustomerNumber] = useState(decodeRoomPhone(roomParam));
  const [session, setSession] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [statusText, setStatusText] = useState(
    roomParam
      ? "Join link detected. Allow camera and microphone to enter the consultation room."
      : "Enter a patient number or share a room link to start a secure video consultation."
  );
  const [remoteParticipant, setRemoteParticipant] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draftMessage, setDraftMessage] = useState("");
  const [permissionHelp, setPermissionHelp] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const sessionRef = useRef(null);
  const lastSignalIdRef = useRef(0);
  const remoteParticipantIdRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const offerSentRef = useRef(false);
  const pollingLockRef = useRef(false);
  const intervalRef = useRef(null);
  const autoJoinAttemptedRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, [muted]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOff;
    });
  }, [cameraOff]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play?.().catch(() => {});
    }
  }, [callState, session]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play?.().catch(() => {});
    }
  }, [callState, remoteParticipant, session]);

  const attachLocalPreview = (stream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const attachRemotePreview = () => {
    if (!remoteStreamRef.current) {
      remoteStreamRef.current = createEmptyRemoteStream();
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  };

  const teardownMedia = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    stopStream(localStreamRef.current);
    stopStream(remoteStreamRef.current);

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    remoteParticipantIdRef.current = null;
    offerSentRef.current = false;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const sendSignal = async (type, payload = null, targetParticipantId = null) => {
    const activeSession = sessionRef.current;
    if (!activeSession) return;

    await api.post(`/telemedicine/session/${activeSession.sessionId}/signal`, {
      participantId: activeSession.participantId,
      type,
      payload,
      targetParticipantId,
    });
  };

  const flushPendingCandidates = async (peerConnection) => {
    if (!pendingCandidatesRef.current.length || !peerConnection.remoteDescription) return;

    const queuedCandidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of queuedCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        setErrorText("A network candidate could not be applied to the current consultation.");
      }
    }
  };

  const ensurePeerConnection = async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    attachRemotePreview();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = createEmptyRemoteStream();
      }

      event.streams[0].getTracks().forEach((track) => {
        const exists = remoteStreamRef.current
          .getTracks()
          .some((currentTrack) => currentTrack.id === track.id);

        if (!exists) {
          remoteStreamRef.current.addTrack(track);
        }
      });

      attachRemotePreview();
      setCallState("connected");
      setStatusText("Secure video consultation is live.");
      setErrorText("");
    };

    peerConnection.onicecandidate = async (event) => {
      if (!event.candidate) return;

      try {
        await sendSignal(
          "ice",
          event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
          remoteParticipantIdRef.current
        );
      } catch {
        setErrorText("Network negotiation is taking longer than expected.");
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (state === "connected") {
        setCallState("connected");
        setStatusText("Secure video consultation is live.");
      }

      if (state === "failed") {
        setErrorText("The video call connection failed. Please try again.");
        finalizeCall("ended", true);
      }

      if (state === "disconnected") {
        setStatusText("Reconnecting the consultation...");
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const createOffer = async (targetParticipantId) => {
    const peerConnection = await ensurePeerConnection();
    remoteParticipantIdRef.current = targetParticipantId;

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection.setLocalDescription(offer);
    offerSentRef.current = true;
    setCallState("connecting");
    setStatusText("Calling participant and preparing secure video...");
    await sendSignal("offer", offer, targetParticipantId);
  };

  const handleSignal = async (signal) => {
    if (!signal || !signal.type) return;

    if (signal.type === "offer") {
      remoteParticipantIdRef.current = signal.from;
      const peerConnection = await ensurePeerConnection();

      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
      await flushPendingCandidates(peerConnection);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      setCallState("connecting");
      setStatusText("Joining secure consultation...");
      await sendSignal("answer", answer, signal.from);
      return;
    }

    if (signal.type === "answer") {
      const peerConnection = await ensurePeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
      await flushPendingCandidates(peerConnection);
      setCallState("connecting");
      setStatusText("The other participant accepted the call.");
      return;
    }

    if (signal.type === "ice") {
      const peerConnection = await ensurePeerConnection();

      if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload));
        } catch {
          setErrorText("Some network path updates could not be applied.");
        }
      } else {
        pendingCandidatesRef.current.push(signal.payload);
      }
      return;
    }

    if (signal.type === "hangup" || signal.type === "leave") {
      setStatusText("The other participant ended the consultation.");
      await finalizeCall("ended", false);
    }
  };

  const leaveSession = async (sendHangupSignal) => {
    const activeSession = sessionRef.current;
    if (!activeSession) return;

    try {
      if (sendHangupSignal) {
        await sendSignal("hangup", { endedAt: Date.now() }, remoteParticipantIdRef.current);
      }
    } catch {
      // best effort
    }

    try {
      await api.delete(
        `/telemedicine/session/${activeSession.sessionId}/participant/${activeSession.participantId}`
      );
    } catch {
      // best effort
    }

    sessionRef.current = null;
    setSession(null);
  };

  const finalizeCall = async (nextState, sendHangupSignal) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    await leaveSession(sendHangupSignal);
    teardownMedia();
    setCallState(nextState);
  };

  useEffect(() => {
    if (!session || callState === "ended") return undefined;

    const pollSignals = async () => {
      if (pollingLockRef.current) return;
      pollingLockRef.current = true;

      try {
        const response = await api.get(`/telemedicine/session/${session.sessionId}`, {
          params: {
            participantId: session.participantId,
            since: lastSignalIdRef.current,
          },
        });

        const nextRemoteParticipant = response.data.participants.find(
          (participant) => participant.id !== session.participantId
        );

        setRemoteParticipant(nextRemoteParticipant || null);
        remoteParticipantIdRef.current = nextRemoteParticipant
          ? nextRemoteParticipant.id
          : null;
        lastSignalIdRef.current = response.data.lastSignalId || lastSignalIdRef.current;

        for (const signal of response.data.signals) {
          await handleSignal(signal);
        }

        if (
          session.isInitiator &&
          nextRemoteParticipant &&
          !offerSentRef.current &&
          callState !== "connected"
        ) {
          await createOffer(nextRemoteParticipant.id);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          setStatusText("This consultation room is no longer available.");
          await finalizeCall("ended", false);
        } else {
          setErrorText("Unable to refresh the consultation state. Retrying...");
        }
      } finally {
        pollingLockRef.current = false;
      }
    };

    pollSignals();
    intervalRef.current = window.setInterval(pollSignals, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callState, session]);

  useEffect(() => {
    if (!session || !["waiting", "connecting", "connected"].includes(callState)) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [callState, session]);

  useEffect(() => {
    return () => {
      leaveSession(false);
      teardownMedia();
    };
  }, []);

  const copyJoinLink = async () => {
    if (!session) return;

    try {
      await navigator.clipboard.writeText(
        session.shareUrl || `${window.location.origin}${session.joinLink}`
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      setStatusText("Join link copied. Share it with the other participant.");
    } catch {
      setErrorText("Could not copy the join link automatically.");
    }
  };

  const startCall = async () => {
    if (!customerNumber.trim()) {
      setErrorText("Enter a patient number before starting the video call.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorText("This browser does not support camera-based video calling.");
      return;
    }

    setErrorText("");
    setPermissionHelp(null);
    setFeedbackMessage("");
    setCopied(false);
    setCallState("starting");
    setStatusText("Requesting camera and microphone access...");
    setElapsedSeconds(0);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOff;
      });

      localStreamRef.current = localStream;
      attachLocalPreview(localStream);
      attachRemotePreview();

      const response = await api.post("/telemedicine/session", {
        phoneNumber: customerNumber,
        displayName,
      });

      const activeParticipants = response.data.participants || [];
      const otherParticipant = activeParticipants.find(
        (participant) => participant.id !== response.data.participantId
      );

      lastSignalIdRef.current = 0;
      offerSentRef.current = false;
      setSession(response.data);
      setRemoteParticipant(otherParticipant || null);
      remoteParticipantIdRef.current = otherParticipant ? otherParticipant.id : null;

      if (response.data.isInitiator) {
        setCallState("waiting");
        setStatusText("Consultation room ready. Copy the join link or open it on the other device.");
      } else {
        setCallState("connecting");
        setStatusText("Joining the active consultation room...");
      }
    } catch (error) {
      teardownMedia();
      setCallState("idle");
      setStatusText("Video call is not active yet.");
      setPermissionHelp(getPermissionHelp(error));
      setErrorText(
        error?.response?.data?.error ||
          "Could not start the video call. Check camera permissions and try again."
      );
    }
  };

  const retryPermissions = async () => {
    setErrorText("");
    setPermissionHelp(null);
    setFeedbackMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorText("This browser does not support camera-based video calling.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stopStream(stream);
      setStatusText("Camera and microphone are ready. You can start the consultation now.");
      setFeedbackMessage("Permissions granted successfully.");
    } catch (error) {
      setPermissionHelp(getPermissionHelp(error));
      setErrorText("Permissions are still blocked. Update Chrome settings and try again.");
    }
  };

  const endCall = async () => {
    setStatusText("Ending the consultation...");
    await finalizeCall("ended", true);
  };

  const resetForNewCall = () => {
    teardownMedia();
    setSession(null);
    setCallState("idle");
    setStatusText("Enter a patient number to start another secure video consultation.");
    setErrorText("");
    setPermissionHelp(null);
    setFeedbackMessage("");
    setCopied(false);
    setElapsedSeconds(0);
    setRemoteParticipant(null);
    setChatOpen(false);
    setMessages(initialMessages);
    autoJoinAttemptedRef.current = false;
  };

  const sendChatMessage = () => {
    if (!draftMessage.trim()) return;
    setMessages((current) => [...current, { from: "patient", text: draftMessage.trim() }]);
    setDraftMessage("");
  };

  useEffect(() => {
    if (!hasJoinLink || !customerNumber.trim()) return;
    if (session || callState !== "idle") return;
    if (autoJoinAttemptedRef.current) return;

    autoJoinAttemptedRef.current = true;
    setStatusText("Joining the consultation from the shared link...");
    startCall();
  }, [callState, customerNumber, hasJoinLink, session]);

  const remoteDisplayName = remoteParticipant?.displayName || "Dr. Ahmed Karimi";
  const showCallUi = !["ended"].includes(callState);
  const showStage = ["waiting", "starting", "connecting", "connected", "idle"].includes(callState);
  const timerLabel =
    callState === "connected"
      ? `${formatDuration(elapsedSeconds)}`
      : callState === "waiting"
        ? "Waiting"
        : "Ready";

  return (
    <section className="telemed-ui">
      <div className="telemed-ui__hero">
        <div className="telemed-ui__heroHeader">
          <button
            type="button"
            className="telemed-ui__backButton"
            onClick={() => window.history.back()}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Telemedicine Call</h1>
            <p>Secure Video Consultation</p>
          </div>
        </div>

        <button
          type="button"
          className="telemed-ui__chatButton"
          onClick={() => setChatOpen((current) => !current)}
          aria-label="Toggle chat"
        >
          <MessageCircle size={18} />
        </button>
      </div>

      <div className="telemed-ui__doctorCard">
        <div className="telemed-ui__doctorMeta">
          <div className="telemed-ui__doctorAvatarWrap">
            <img src={DOCTOR_PLACEHOLDER} alt="Doctor" className="telemed-ui__doctorAvatar" />
            <span className="telemed-ui__doctorOnline" />
          </div>

          <div>
            <div className="telemed-ui__doctorNameRow">
              <strong>Dr. Ahmed Karimi</strong>
              <BadgeCheck size={16} />
            </div>
            <div className="telemed-ui__doctorRole">General Physician . MBBS, MD</div>
            <div className="telemed-ui__doctorRating">
              <span className="telemed-ui__stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} fill="currentColor" />
                ))}
              </span>
              <span>4.9 . 200+ consultations</span>
            </div>
          </div>
        </div>

        <a href="tel:+12065550120" className="telemed-ui__doctorCall" aria-label="Call doctor">
          <Phone size={18} />
        </a>
      </div>

      {showCallUi && showStage && (
        <div className="telemed-ui__stage">
          <video ref={remoteVideoRef} autoPlay playsInline className="telemed-ui__remoteVideo" />

          <div className="telemed-ui__stageOverlay" />

          {!session || callState !== "connected" ? (
            <div className="telemed-ui__waiting">
              <img src={DOCTOR_PLACEHOLDER} alt="Doctor" className="telemed-ui__waitingAvatar" />
              <strong>{remoteDisplayName}</strong>
              <span>{statusText}</span>

              <button
                type="button"
                className="telemed-ui__startButton"
                onClick={startCall}
                disabled={callState === "starting"}
              >
                <Phone size={18} />
                <span>{callState === "starting" ? "Starting..." : "Start Call"}</span>
              </button>
            </div>
          ) : (
            <div className="telemed-ui__liveBadge">{timerLabel}</div>
          )}

          <div className="telemed-ui__localCard">
            {cameraOff && <div className="telemed-ui__localMask">You</div>}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="telemed-ui__localVideo"
            />
            <span className="telemed-ui__localLabel">You</span>
          </div>

          <div className="telemed-ui__controls">
            <button
              type="button"
              className={`telemed-ui__control ${muted ? "telemed-ui__control--active" : ""}`}
              onClick={() => setMuted((current) => !current)}
            >
              <span className="telemed-ui__controlIcon">
                {muted ? <MicOff size={19} /> : <Mic size={19} />}
              </span>
              <span>Mute</span>
            </button>

            <button
              type="button"
              className={`telemed-ui__control ${cameraOff ? "telemed-ui__control--active" : ""}`}
              onClick={() => setCameraOff((current) => !current)}
            >
              <span className="telemed-ui__controlIcon">
                {cameraOff ? <VideoOff size={19} /> : <Video size={19} />}
              </span>
              <span>Hide</span>
            </button>

            <button
              type="button"
              className={`telemed-ui__control ${chatOpen ? "telemed-ui__control--active" : ""}`}
              onClick={() => setChatOpen((current) => !current)}
            >
              <span className="telemed-ui__controlIcon">
                <MessageCircle size={19} />
              </span>
              <span>Chat</span>
            </button>

            <button type="button" className="telemed-ui__endButton" onClick={endCall}>
              <PhoneOff size={20} />
              <span>End</span>
            </button>
          </div>
        </div>
      )}

      {callState === "ended" ? (
        <div className="telemed-ui__ended">
          <img src={DOCTOR_PLACEHOLDER} alt="Doctor" className="telemed-ui__endedAvatar" />
          <h2>Consultation Ended</h2>
          <p>{statusText}</p>
          <p>Duration: {formatDuration(elapsedSeconds)}</p>
          <button type="button" className="telemed-ui__startButton" onClick={resetForNewCall}>
            <Phone size={18} />
            <span>Start Another Call</span>
          </button>
        </div>
      ) : null}

      <div className="telemed-ui__metaGrid">
        <div className="telemed-ui__infoCard">
          <h3>Consultation Setup</h3>
          <label>
            Your name
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Margaret Wilson"
            />
          </label>

          <label>
            Patient number / room key
            <input
              type="tel"
              value={customerNumber}
              readOnly={hasJoinLink}
              onChange={(event) => setCustomerNumber(event.target.value)}
              placeholder="+91 98765 43210"
            />
          </label>

          <div className="telemed-ui__infoActions">
            <button type="button" className="telemed-ui__secondaryButton" onClick={startCall}>
              Start Session
            </button>
            <button
              type="button"
              className="telemed-ui__secondaryButton"
              onClick={copyJoinLink}
              disabled={!session}
            >
              <Copy size={16} />
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>

          <div className="telemed-ui__note">
            Real browser video calls work here between people who join the same CareNest room.
            Calling arbitrary real-world phone or video networks needs an external provider such as
            Twilio, Agora, Daily, or Zoom.
          </div>

          {permissionHelp ? (
            <div className="telemed-ui__permissionCard">
              <strong>{permissionHelp.title}</strong>
              <p>{permissionHelp.body}</p>
              <ul>
                {permissionHelp.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <button
                type="button"
                className="telemed-ui__secondaryButton"
                onClick={retryPermissions}
              >
                Retry Permissions
              </button>
            </div>
          ) : null}

          {feedbackMessage ? (
            <div className="telemed-ui__success">{feedbackMessage}</div>
          ) : null}
        </div>

        <div className="telemed-ui__infoCard">
          <h3>Room Status</h3>
          <div className="telemed-ui__statusItem">
            <span>Status</span>
            <strong>{statusText}</strong>
          </div>
          <div className="telemed-ui__statusItem">
            <span>Participant</span>
            <strong>{remoteDisplayName}</strong>
          </div>
          <div className="telemed-ui__statusItem">
            <span>Timer</span>
            <strong>{formatDuration(elapsedSeconds)}</strong>
          </div>
          <div className="telemed-ui__statusItem">
            <span>Share URL</span>
            <strong className="telemed-ui__url">
              {session ? session.shareUrl || `${window.location.origin}${session.joinLink}` : "No active room"}
            </strong>
          </div>
        </div>
      </div>

      {chatOpen ? (
        <div className="telemed-ui__chatPanel">
          <div className="telemed-ui__chatHeader">
            <h3>Consultation Chat</h3>
            <button type="button" className="telemed-ui__seeAll" onClick={() => setChatOpen(false)}>
              Close
            </button>
          </div>

          <div className="telemed-ui__messages">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`telemed-ui__message ${
                  message.from === "patient" ? "telemed-ui__message--self" : ""
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="telemed-ui__messageComposer">
            <input
              type="text"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendChatMessage();
                }
              }}
              placeholder="Type a message..."
            />
            <button type="button" className="telemed-ui__sendButton" onClick={sendChatMessage}>
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : null}

      {errorText ? <div className="telemed-ui__error">{errorText}</div> : null}
    </section>
  );
}
