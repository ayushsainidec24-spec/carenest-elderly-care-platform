import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import "./TopBar.css";

export default function TopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = getCurrentUser();

  return (
    <header className="topbar">
      <div className="topbar__title">Elder Care Assistance Platform</div>
      <div className="topbar__right">
        <button className="topbar__icon" aria-label="Notifications">
          <img src="/images/notification.svg" alt="Notifications" />
          <span className="topbar__badge">3</span>
        </button>
        <div className="topbar__profile">
          <img className="topbar__avatar" src="/images/avatar.svg" alt="Profile" />
          <div>
            <div className="topbar__name">{user?.name || "Margaret"}</div>
            <div className="topbar__role">Patient</div>
          </div>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="topbar__logout"
            aria-label="Logout"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
