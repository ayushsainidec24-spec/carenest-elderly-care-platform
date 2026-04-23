import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import { getCurrentPosition } from "../utils/location";
import "./SOS.css";

const HOLD_DURATION = 2000;

const familyContacts = [
  { id: "family-1", name: "John Wilson (Son)", role: "Family Member", phone: "+1-206-555-0182" },
  { id: "family-2", name: "Mary Wilson (Daughter)", role: "Family Member", phone: "+1-206-555-0197" },
];

const responseSteps = [
  {
    key: "services",
    title: "Calling Emergency Services",
    icon: Phone,
    tone: "green",
  },
  {
    key: "location",
    title: "Location Shared",
    icon: MapPin,
    tone: "blue",
  },
  {
    key: "family",
    title: "Family Notified",
    icon: Users,
    tone: "purple",
  },
  {
    key: "caregiver",
    title: "Caregiver Alerted",
    icon: Bell,
    tone: "yellow",
  },
];

function formatAlertTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SOS() {
  const [alerts, setAlerts] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [locationLabel, setLocationLabel] = useState("Location not shared yet");
  const [isTriggering, setIsTriggering] = useState(false);
  const holdStartRef = useRef(null);
  const holdFrameRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [alertsRes, caregiversRes] = await Promise.all([
        api.get("/sos", { params: { user_id: userId } }),
        api.get("/caregivers"),
      ]);

      setAlerts(alertsRes.data);
      setCaregivers(caregiversRes.data);
    } catch (error) {
      console.error(error);
      setStatusMessage("We couldn't load your SOS dashboard right now.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (holdFrameRef.current) {
        window.cancelAnimationFrame(holdFrameRef.current);
      }
      if (holdTimeoutRef.current) {
        window.clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  const emergencyContacts = useMemo(() => {
    const caregiver = caregivers[0];

    return [
      {
        id: "physician",
        name: "Dr. Ahmed Karimi",
        role: "Primary Physician",
        phone: "+1-206-555-0120",
        tone: "blue",
      },
      ...familyContacts.map((contact, index) => ({
        ...contact,
        tone: index === 0 ? "green" : "purple",
      })),
      {
        id: caregiver?.id || "caregiver",
        name: caregiver?.name || "Sarah M.",
        role: caregiver?.service || "Assigned Caregiver",
        phone: "+1-206-555-0109",
        tone: "yellow",
      },
    ];
  }, [caregivers]);

  const resetHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    holdStartRef.current = null;

    if (holdFrameRef.current) {
      window.cancelAnimationFrame(holdFrameRef.current);
      holdFrameRef.current = null;
    }

    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const triggerSOS = useCallback(async () => {
    if (!userId || isTriggering) return;

    setIsTriggering(true);

    let locationMessage = "Location unavailable";

    try {
      const coords = await getCurrentPosition();
      locationMessage = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      setLocationLabel(`Shared at ${locationMessage}`);
    } catch {
      setLocationLabel("Location permission denied or unavailable");
    }

    const message = `Emergency assistance requested by ${user?.name || "Margaret"}. Last known location: ${locationMessage}.`;

    try {
      await api.post("/sos", { user_id: userId, message });
      await loadData();
      setStatusMessage("Emergency SOS activated. Contacts and caregivers have been alerted.");
    } catch (error) {
      console.error(error);
      setStatusMessage("We couldn't trigger SOS right now. Please try again.");
    } finally {
      setIsTriggering(false);
    }
  }, [isTriggering, loadData, user?.name, userId]);

  const runHoldAnimation = useCallback(
    (startTime) => {
      const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / HOLD_DURATION, 1);

        setHoldProgress(progress);

        if (progress >= 1) {
          resetHold();
          triggerSOS();
          return;
        }

        holdFrameRef.current = window.requestAnimationFrame(tick);
      };

      holdFrameRef.current = window.requestAnimationFrame(tick);
    },
    [triggerSOS]
  );

  const startHold = () => {
    if (isTriggering) return;

    setIsHolding(true);
    setStatusMessage("Keep holding to activate the emergency alert.");
    holdStartRef.current = performance.now();
    runHoldAnimation(holdStartRef.current);
    holdTimeoutRef.current = window.setTimeout(() => {}, HOLD_DURATION);
  };

  const stopHold = () => {
    if (!isHolding) return;
    resetHold();
    setStatusMessage("SOS activation cancelled.");
  };

  const handleActionClick = async (stepKey) => {
    if (stepKey === "services") {
      window.location.href = "tel:112";
      return;
    }

    if (stepKey === "location") {
      try {
        const coords = await getCurrentPosition();
        const nextLocation = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
        setLocationLabel(`Shared at ${nextLocation}`);
        setStatusMessage("Location shared successfully.");
      } catch {
        setStatusMessage("Location access is unavailable on this device.");
      }
      return;
    }

    if (stepKey === "family") {
      setStatusMessage("Family members have been marked as notified.");
      return;
    }

    setStatusMessage("Assigned caregiver marked as alerted.");
  };

  const handleContactCall = (contact) => {
    setStatusMessage(`Calling ${contact.name}...`);
    window.location.href = `tel:${contact.phone.replace(/[^+\d]/g, "")}`;
  };

  const latestAlert = alerts[0];

  return (
    <section className="sos-dashboard">
      <div className="sos-dashboard__hero">
        <div className="sos-dashboard__heroHeader">
          <button
            type="button"
            className="sos-dashboard__backButton"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Emergency SOS</h1>
            <p>Instant help at your fingertips</p>
          </div>
        </div>
      </div>

      <div className="sos-dashboard__panel sos-dashboard__panel--trigger">
        <div className="sos-dashboard__triggerContent">
          <h2>Press &amp; Hold for Emergency</h2>
          <p>Your family, caregiver, and emergency services will be alerted immediately</p>

          <button
            type="button"
            className={`sos-dashboard__sosButton ${isHolding ? "sos-dashboard__sosButton--holding" : ""}`}
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            onClick={(event) => event.preventDefault()}
            aria-label="Press and hold to activate emergency SOS"
            disabled={isTriggering}
          >
            <span
              className="sos-dashboard__sosRing"
              style={{ transform: `scale(${1 + holdProgress * 0.45})` }}
            />
            <span className="sos-dashboard__sosInner">
              <ShieldAlert size={38} />
              <strong>{isTriggering ? "..." : "SOS"}</strong>
              <small>{isHolding ? `${Math.ceil((1 - holdProgress) * 2)}s left` : "Tap to activate"}</small>
            </span>
          </button>
        </div>
      </div>

      {statusMessage ? <div className="sos-dashboard__feedback">{statusMessage}</div> : null}

      <div className="sos-dashboard__panel">
        <div className="sos-dashboard__panelHeader">
          <h2>What happens when SOS is triggered</h2>
          <span className="sos-dashboard__panelPill">1-tap emergency flow</span>
        </div>

        <div className="sos-dashboard__actionList">
          {responseSteps.map((step) => {
            const StepIcon = step.icon;

            return (
              <button
                key={step.key}
                type="button"
                className="sos-dashboard__actionRow"
                onClick={() => handleActionClick(step.key)}
              >
                <span className={`sos-dashboard__actionIcon sos-dashboard__actionIcon--${step.tone}`}>
                  <StepIcon size={18} />
                </span>
                <span className="sos-dashboard__actionText">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sos-dashboard__grid">
        <div className="sos-dashboard__panel">
          <div className="sos-dashboard__panelHeader">
            <h2>Emergency Contacts</h2>
            <span className="sos-dashboard__panelPill">{emergencyContacts.length} contacts</span>
          </div>

          <div className="sos-dashboard__contacts">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="sos-dashboard__contactRow">
                <div className="sos-dashboard__contactInfo">
                  <span className={`sos-dashboard__contactIcon sos-dashboard__contactIcon--${contact.tone}`}>
                    <UserRound size={18} />
                  </span>
                  <div>
                    <strong>{contact.name}</strong>
                    <span>{contact.role}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="sos-dashboard__callButton"
                  onClick={() => handleContactCall(contact)}
                >
                  <Phone size={15} />
                  <span>Call</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sos-dashboard__panel">
          <div className="sos-dashboard__panelHeader">
            <h2>Emergency Status</h2>
            <button type="button" className="sos-dashboard__refresh" onClick={loadData}>
              Refresh
            </button>
          </div>

          <div className="sos-dashboard__statusCard">
            <span className="sos-dashboard__statusLabel">Latest Alert</span>
            <strong>{latestAlert ? formatAlertTime(latestAlert.created_at) : "No alerts yet"}</strong>
            <p>{latestAlert?.message || "Your emergency history will appear here after the first activation."}</p>
          </div>

          <div className="sos-dashboard__statusMeta">
            <div>
              <span className="sos-dashboard__statusLabel">Location</span>
              <strong>{locationLabel}</strong>
            </div>
            <div>
              <span className="sos-dashboard__statusLabel">Saved Alerts</span>
              <strong>{alerts.length}</strong>
            </div>
          </div>

          <div className="sos-dashboard__history">
            {loading ? (
              <p className="sos-dashboard__placeholder">Loading emergency history...</p>
            ) : alerts.length ? (
              alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="sos-dashboard__historyItem">
                  <strong>{formatAlertTime(alert.created_at)}</strong>
                  <span>{alert.message}</span>
                </div>
              ))
            ) : (
              <p className="sos-dashboard__placeholder">
                No emergency alerts have been recorded for this account yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
