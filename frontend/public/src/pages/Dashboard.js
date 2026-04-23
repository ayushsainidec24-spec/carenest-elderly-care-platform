import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Droplets, Heart, Thermometer } from "lucide-react";
import api from "../api";
import { getCurrentUser } from "../utils/auth";
import { getCityFromCoordinates, getCurrentPosition } from "../utils/location";

const PROFILE_IMAGE = "/images/margot-carenest.webp";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [medications, setMedications] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [city, setCity] = useState("Seattle, WA");
  const user = getCurrentUser();
  const userId = user?.id;

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
      .map((b) => ({
        ...b,
        datetime: new Date(`${b.date}T${b.time}`),
      }))
      .filter((b) => b.datetime >= new Date())
      .sort((a, b) => a.datetime - b.datetime);

    setNextBooking(upcoming[0] || null);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function updateCityFromGPS() {
      try {
        const coords = await getCurrentPosition();
        const resolvedCity = await getCityFromCoordinates(coords.latitude, coords.longitude);
        if (resolvedCity) setCity(resolvedCity);
      } catch {
        // keep fallback city when geolocation is not permitted or unsupported
      }
    }

    updateCityFromGPS();
  }, []);

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
            <span className="dashboard__metaIcon">📅</span>
            <span>Friday, March 6, 2026</span>
          </div>
          <div className="dashboard__metaItem">
            <span className="dashboard__metaIcon">📍</span>
            <span>{city}</span>
          </div>
          <div className="dashboard__metaItem">
            <span className="dashboard__metaIcon">💊</span>
            <span>{medications.length} meds</span>
          </div>
          <button className="dashboard__notify">
            🔔
            <span className="dashboard__badge">3</span>
          </button>
        </div>
      </div>

      <div className="dashboard__section dashboard__section--health">
        <div className="dashboard__sectionHeader">
          <h2>Your Health At A Glance</h2>
          <Link to="/health" className="button secondary dashboard__viewAll">
            View All
          </Link>
        </div>

        <div className="health-grid">
          {[
            {
              label: "Blood Pressure",
              value: health ? health.bp : "--",
              unit: "mmHg",
              status: "High",
              statusClass: "health-card__status--high",
              icon: <Activity size={20} />, 
            },
            {
              label: "Heart Rate",
              value: health ? `${health.heart_rate} bpm` : "--",
              unit: "",
              status: "Normal",
              statusClass: "health-card__status--normal",
              icon: <Heart size={20} />, 
            },
            {
              label: "Glucose",
              value: health ? `${health.glucose} mg/dL` : "--",
              unit: "",
              status: "Watch",
              statusClass: "health-card__status--watch",
              icon: <Droplets size={20} />, 
            },
            {
              label: "Temperature",
              value: "98.6 °F",
              unit: "",
              status: "Normal",
              statusClass: "health-card__status--normal",
              icon: <Thermometer size={20} />, 
            },
          ].map((card) => (
            <div key={card.label} className="health-card">
              <div className="health-card__header">
                <div className="health-card__icon">{card.icon}</div>
                <div className={`health-card__status ${card.statusClass}`}>
                  {card.status}
                </div>
              </div>
              <div>
                <div className="health-card__title">{card.label}</div>
                <div className="health-card__value">
                  {card.value}
                  {card.unit && <span className="health-card__unit"> {card.unit}</span>}
                </div>
              </div>
            </div>
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
