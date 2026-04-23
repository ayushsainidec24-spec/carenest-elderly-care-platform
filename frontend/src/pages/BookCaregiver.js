import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Brain,
  Clock3,
  HeartPulse,
  MapPin,
  Star,
  Stethoscope,
} from "lucide-react";
import api from "../api";
import { getCurrentUserId } from "../utils/auth";
import "./BookCaregiver.css";

const SERVICE_OPTIONS = [
  {
    id: "Nursing Care",
    title: "Nursing Care",
    subtitle: "Post-hospital & daily nursing",
    icon: Stethoscope,
    tone: "blue",
  },
  {
    id: "Physiotherapy",
    title: "Physiotherapy",
    subtitle: "Rehabilitation & mobility",
    icon: Activity,
    tone: "green",
  },
  {
    id: "Post-Surgery Care",
    title: "Post-Surgery Care",
    subtitle: "Recovery & wound care",
    icon: HeartPulse,
    tone: "pink",
  },
  {
    id: "Dementia Care",
    title: "Dementia Care",
    subtitle: "Memory & cognitive support",
    icon: Brain,
    tone: "yellow",
  },
];

const TIME_SLOTS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"];

const CAREGIVER_DETAILS = {
  "Sarah M.": {
    role: "Senior Nurse",
    experience: "5 yrs Experience",
    distance: "0.8 km",
    reviews: 124,
    tags: ["Nursing Care", "Post-Surgery"],
    avatar: "/images/margot-carenest.webp",
  },
  "Dr. James K.": {
    role: "Physiotherapist",
    experience: "8 yrs Experience",
    distance: "1.2 km",
    reviews: 87,
    tags: ["Physiotherapy", "Rehab"],
    avatar: "/images/avatar.svg",
  },
  "Emily R.": {
    role: "Recovery Specialist",
    experience: "6 yrs Experience",
    distance: "1.5 km",
    reviews: 103,
    tags: ["Post-Surgery", "Nursing Care"],
    avatar: "/images/margot-carenest.webp",
  },
  "Anita D.": {
    role: "Memory Care Expert",
    experience: "7 yrs Experience",
    distance: "2.1 km",
    reviews: 95,
    tags: ["Dementia Care", "Companionship"],
    avatar: "/images/avatar.svg",
  },
};

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTwentyFourHour(slot) {
  const [time, modifier] = slot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function BookCaregiver() {
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState([]);
  const [selectedService, setSelectedService] = useState("Nursing Care");
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [saving, setSaving] = useState(false);
  const userId = getCurrentUserId();

  useEffect(() => {
    api.get("/caregivers").then((res) => {
      setCaregivers(res.data);
    });
  }, []);

  const caregiversWithMeta = useMemo(
    () =>
      caregivers.map((caregiver, index) => {
        const details = CAREGIVER_DETAILS[caregiver.name] || {};
        const serviceTitle = caregiver.service || SERVICE_OPTIONS[index % SERVICE_OPTIONS.length].id;
        return {
          ...caregiver,
          role: details.role || serviceTitle,
          experience: details.experience || `${4 + index} yrs Experience`,
          distance: details.distance || `${(0.8 + index * 0.4).toFixed(1)} km`,
          reviews: details.reviews || 80 + index * 12,
          tags: details.tags || [serviceTitle],
          avatar: details.avatar || "/images/avatar.svg",
        };
      }),
    [caregivers]
  );

  const filteredCaregivers = useMemo(() => {
    return caregiversWithMeta.filter((caregiver) => {
      const serviceMatch = caregiver.service === selectedService;
      const tagMatch = caregiver.tags.includes(selectedService);
      return serviceMatch || tagMatch;
    });
  }, [caregiversWithMeta, selectedService]);

  useEffect(() => {
    if (!filteredCaregivers.length) {
      setSelectedCaregiverId(null);
      return;
    }

    const alreadySelected = filteredCaregivers.some(
      (caregiver) => caregiver.id === selectedCaregiverId
    );

    if (!alreadySelected) {
      setSelectedCaregiverId(filteredCaregivers[0].id);
    }
  }, [filteredCaregivers, selectedCaregiverId]);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      let label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (index === 0) label = "Today";
      if (index === 1) label = "Tomorrow";

      return {
        value: toIsoDate(date),
        label,
      };
    });
  }, []);

  const selectedCaregiver = filteredCaregivers.find(
    (caregiver) => caregiver.id === selectedCaregiverId
  );

  const handleConfirmBooking = async () => {
    if (!selectedCaregiver || !selectedDate || !selectedTime) {
      setStatusType("error");
      setStatusMessage("Please select a caregiver, appointment day, and time slot.");
      return;
    }

    try {
      if (!userId) {
        setStatusType("error");
        setStatusMessage("Please sign in to book a caregiver.");
        return;
      }

      setSaving(true);
      setStatusMessage("");

      await api.post("/bookings", {
        user_id: userId,
        caregiver_id: selectedCaregiver.id,
        date: selectedDate,
        time: toTwentyFourHour(selectedTime),
      });

      setStatusType("success");
      setStatusMessage(
        `Booking confirmed with ${selectedCaregiver.name} on ${selectedDate} at ${selectedTime}.`
      );
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Booking could not be completed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bookingPage">
      <div className="bookingPage__hero">
        <button
          type="button"
          className="bookingPage__backButton"
          aria-label="Go back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Book a Caregiver</h1>
          <p>Find the right care for you</p>
        </div>
      </div>

      <div className="bookingCard">
        <div className="bookingCard__header">
          <h2>Select Service Type</h2>
        </div>
        <div className="bookingServices">
          {SERVICE_OPTIONS.map((service) => {
            const Icon = service.icon;
            const isActive = service.id === selectedService;

            return (
              <button
                key={service.id}
                type="button"
                className={`bookingService bookingService--${service.tone}${isActive ? " bookingService--active" : ""}`}
                onClick={() => {
                  setSelectedService(service.id);
                  setStatusMessage("");
                  setSelectedTime("");
                }}
              >
                <span className="bookingService__icon">
                  <Icon size={22} />
                </span>
                <strong>{service.title}</strong>
                <span>{service.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bookingCard">
        <div className="bookingCard__header">
          <h2>Available Caregivers</h2>
        </div>

        <div className="bookingCaregivers">
          {filteredCaregivers.length ? (
            filteredCaregivers.map((caregiver) => (
              <button
                key={caregiver.id}
                type="button"
                className={`caregiverRow${selectedCaregiverId === caregiver.id ? " caregiverRow--selected" : ""}`}
                onClick={() => {
                  setSelectedCaregiverId(caregiver.id);
                  setStatusMessage("");
                }}
              >
                <div className="caregiverRow__left">
                  <div className="caregiverRow__avatarWrap">
                    <img src={caregiver.avatar} alt={caregiver.name} className="caregiverRow__avatar" />
                    <span className="caregiverRow__online" />
                  </div>
                  <div className="caregiverRow__body">
                    <div className="caregiverRow__top">
                      <strong>{caregiver.name}</strong>
                    </div>
                    <div className="caregiverRow__meta">
                      <span>{caregiver.role}</span>
                      <span>{caregiver.experience}</span>
                    </div>
                    <div className="caregiverRow__meta caregiverRow__meta--muted">
                      <span>
                        <MapPin size={14} />
                        {caregiver.distance}
                      </span>
                      <span>{caregiver.reviews} reviews</span>
                    </div>
                    <div className="caregiverRow__tags">
                      {caregiver.tags.map((tag) => (
                        <span key={`${caregiver.id}-${tag}`} className="caregiverRow__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="caregiverRow__rating">
                  <Star size={16} fill="currentColor" />
                  <span>{caregiver.rating}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="bookingEmpty">
              No caregivers are available for this service yet. Try another service type.
            </div>
          )}
        </div>
      </div>

      <div className="bookingCard">
        <div className="bookingCard__header">
          <h2>Schedule Appointment</h2>
        </div>

        <div className="bookingDates">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`bookingChip${selectedDate === option.value ? " bookingChip--active" : ""}`}
              onClick={() => {
                setSelectedDate(option.value);
                setStatusMessage("");
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="bookingTimeHeader">
          <Clock3 size={16} />
          <span>Available Time Slots</span>
        </div>

        <div className="bookingTimes">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`bookingTime${selectedTime === slot ? " bookingTime--active" : ""}`}
              onClick={() => {
                setSelectedTime(slot);
                setStatusMessage("");
              }}
            >
              {slot}
            </button>
          ))}
        </div>

        {selectedCaregiver && (
          <div className="bookingSummary">
            <strong>Selected caregiver</strong>
            <span>
              {selectedCaregiver.name} for {selectedService} on {selectedDate}
              {selectedTime ? ` at ${selectedTime}` : ""}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="bookingConfirmButton"
        disabled={saving || !selectedCaregiver || !selectedTime}
        onClick={handleConfirmBooking}
      >
        {saving ? "Confirming Booking..." : "Confirm Booking"}
      </button>

      {statusMessage && (
        <div
          className={`bookingStatus${statusType === "success" ? " bookingStatus--success" : " bookingStatus--error"}`}
        >
          {statusMessage}
        </div>
      )}
    </section>
  );
}
