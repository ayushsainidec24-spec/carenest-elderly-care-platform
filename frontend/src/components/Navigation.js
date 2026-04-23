import { NavLink } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav__link" end>
        Dashboard
      </NavLink>
      <NavLink to="/book" className="nav__link">
        Book Caregiver
      </NavLink>
      <NavLink to="/telemedicine" className="nav__link">
        Telemedicine
      </NavLink>
      <NavLink to="/caregivers" className="nav__link">
        Caregivers
      </NavLink>
      <NavLink to="/medication" className="nav__link">
        Medication
      </NavLink>
      <NavLink to="/health" className="nav__link">
        Health
      </NavLink>
      <NavLink to="/sos" className="nav__link">
        SOS
      </NavLink>
    </nav>
  );
}
