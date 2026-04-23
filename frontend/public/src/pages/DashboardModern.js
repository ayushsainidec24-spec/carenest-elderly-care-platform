import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Heart, Thermometer } from "lucide-react";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import { getCityFromCoordinates, getCurrentPosition } from "../utils/location";

const PROFILE_IMAGE = "/images/margot-carenest.webp";

export default function DashboardModern() {
  const [health, setHealth] = useState(null);
  const [medications, setMedications] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [city, setCity] = useState("Seattle, WA");
  const user = getCurrentUser();
  const userId = user?.id;
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    if (!userId) return;

    const [healthRes, medicationRes, bookingsRes] = await Promise.all([
      api.get("/health", { params: { user_id: userId } }),
      api.get("/medication", { params: { user_id: userId } }),
      api.get("/bookings", { params: { user_id: userId } }),
    ]);

    setHealth(healthRes.data[healthRes.data.length - 1] || null);
    setMedications(medicationRes.data);
    const upcoming = bookingsRes.data
      .map((booking) => ({
        ...booking,
        datetime: new Date(`${booking.date}T${booking.time}`),
      }))
      .filter((booking) => booking.datetime >= new Date())
      .sort((left, right) => left.datetime - right.datetime);

    setNextBooking(upcoming[0] || null);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const refreshCurrentDate = () => setCurrentDate(new Date());
    refreshCurrentDate();

    const intervalId = window.setInterval(refreshCurrentDate, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function updateCityFromGPS() {
      try {
        const coords = await getCurrentPosition();
        const resolvedCity = await getCityFromCoordinates(coords.latitude, coords.longitude);
        if (resolvedCity) setCity(resolvedCity);
      } catch {
        // leave default city when GPS is unavailable or permission is denied
      }
    }

    updateCityFromGPS();
  }, []);

  const calendarMonth = currentDate.toLocaleString("en-US", { month: "long" });
  const currentDay = currentDate.getDate();
  const currentWeekday = currentDate.toLocaleString("en-US", { weekday: "long" });
  const formattedToday = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const healthCards = [
    {
      label: "Blood Pressure",
      value: health?.bp || "130/85",
      unit: "mmHg",
      status: "High",
      statusClass: "dashboard__metricBadge--high",
      icon: <Activity size={19} strokeWidth={2.4} />,
      iconClass: "dashboard__metricIcon--blue",
    },
    {
      label: "Heart Rate",
      value: health?.heart_rate ? String(health.heart_rate) : "76",
      unit: "bpm",
      status: "Normal",
      statusClass: "dashboard__metricBadge--normal",
      icon: <Heart size={18} strokeWidth={2.4} fill="currentColor" />,
      iconClass: "dashboard__metricIcon--heart",
    },
    {
      label: "Glucose",
      value: health?.glucose ? String(health.glucose) : "125",
      unit: "mg/dL",
      status: "Watch",
      statusClass: "dashboard__metricBadge--watch",
      icon: (
        <img
          src="/images/glucose-icon.svg"
          alt="Glucose"
          className="dashboard__metricIconImage"
        />
      ),
      iconClass: "dashboard__metricIcon--glucose",
    },
    {
      label: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "Normal",
      statusClass: "dashboard__metricBadge--normal",
      icon: <Thermometer size={18} strokeWidth={2.4} />,
      iconClass: "dashboard__metricIcon--temperature",
    },
  ];

  return (
    <section className="dashboard">
      <div className="dashboard__top">
        <div className="dashboard__profile">
          <div className="dashboard__avatar">
            <img
              src={PROFILE_IMAGE}
              alt={user?.name || "Patient"}
              className="dashboard__avatarImage"
            />
          </div>
          <div>
            <div className="dashboard__greeting">Good Morning</div>
            <div className="dashboard__name" style={{ color: "#ffffff" }}>
              {user?.name || "Margaret Wilson"}
            </div>
            <div className="dashboard__role">Premium Member</div>
          </div>
        </div>

        <div className="dashboard__meta">
          <div className="dashboard__metaItem">
            <span className="dashboard__metaIcon">Date</span>
            <span>{formattedToday}</span>
          </div>
          <div className="dashboard__metaItem">
            <span className="dashboard__metaIcon">City</span>
            <span>{city}</span>
          </div>
          <div className="dashboard__metaItem">
            <span className="dashboard__metaIcon">Meds</span>
            <span>{medications.length} meds</span>
          </div>
          <button
            type="button"
            className="dashboard__calendarButton"
            aria-label="Current date"
          >
            <span className="dashboard__calendarButtonEmoji">📅</span>
            <span>
              {currentWeekday}, {currentDay}
            </span>
            <span>{calendarMonth}</span>
          </button>
          <button className="dashboard__notify" aria-label="Notifications">
            Bell
            <span className="dashboard__badge">3</span>
          </button>
        </div>
      </div>

      <div className="dashboard__section dashboard__section--health">
        <div className="dashboard__sectionHeader">
          <h2 className="dashboard__healthHeading">Your Health At A Glance</h2>
          <Link to="/health" className="button secondary dashboard__viewAll">
            View All
          </Link>
        </div>

        <div className="dashboard__healthGrid">
          {healthCards.map((card) => (
            <article key={card.label} className="dashboard__metricCard">
              <div className="dashboard__metricTop">
                <div className={`dashboard__metricIcon ${card.iconClass}`}>{card.icon}</div>
                <span className={`dashboard__metricBadge ${card.statusClass}`}>{card.status}</span>
              </div>
              <div className="dashboard__metricLabel">{card.label}</div>
              <div className="dashboard__metricReading">
                <span className="dashboard__metricValue">{card.value}</span>
                <span className="dashboard__metricUnit">{card.unit}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="dashboard__section">
        <h2>Quick Actions</h2>
        <div className="dashboard__quick">
          <Link to="/book" className="quick-card quick-card--green">
            <div className="quick-card__icon"></div>
            <div className="quick-card__text">Book Caregiver</div>
          </Link>
          <Link to="/telemedicine" className="quick-card quick-card--blue">
            <div className="quick-card__icon"></div>
            <div className="quick-card__text">Telemedicine</div>
          </Link>
          <Link to="/health" className="quick-card quick-card--red">
            <div className="quick-card__icon"></div>
            <div className="quick-card__text">Health Report</div>
          </Link>
          <Link to="/family" className="quick-card quick-card--purple">
            <div className="quick-card__icon"></div>
            <div className="quick-card__text">Family</div>
          </Link>
        </div>

        {nextBooking && (
          <div className="dashboard__nextBooking">
            <h3>Next Booking</h3>
            <p>
              {nextBooking.date} at {nextBooking.time} with {nextBooking.caregiver_name}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
