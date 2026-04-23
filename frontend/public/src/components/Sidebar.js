import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { label: "Home", to: "/dashboard", icon: "/images/logo.svg" },
  { label: "Book Caregiver", to: "/book", icon: "/images/icon-book.svg" },
  { label: "Telemedicine Call", to: "/telemedicine", icon: "/images/icon-telemedicine.svg" },
  { label: "Health Dashboard", to: "/health", icon: "/images/icon-health.svg" },
  { label: "Emergency SOS", to: "/sos", icon: "/images/icon-health.svg" },
  { label: "Family Monitoring", to: "/family", icon: "/images/icon-family.svg" },
  { label: "Medication Reminder", to: "/medication", icon: "/images/icon-health.svg" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img className="sidebar__logo" src="/images/logo.svg" alt="CareNest" />
        <div>
          <div className="sidebar__title">CareNest</div>
          <div className="sidebar__subtitle">Safe. Caring. Connected.</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        <div className="sidebar__section">MAIN MENU</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__icon">
              <img src={item.icon} alt="" />
            </span>
            <span>{item.label}</span>
            <span className="sidebar__chevron">›</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
