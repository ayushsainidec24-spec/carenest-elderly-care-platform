import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Heart, Circle } from "lucide-react";
import api from "../api";
import "./AuthPages.css";
import { useGoogleAuth } from "./useGoogleAuth";

const FEATURES = [
  "24/7 Emergency Support",
  "Verified Healthcare Professionals",
  "Real-time Health Monitoring",
  "Family Coordination Tools",
];

export function LoginRedesign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const goToDashboard = () => navigate("/dashboard", { replace: true });
  const { googleReady, googleError, googleLoading, googleButtonRef, startGoogleSignIn } = useGoogleAuth(goToDashboard);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        goToDashboard();
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <Heart size={28} fill="currentColor" strokeWidth={2.2} />
          </div>
          <span className="auth-brand__text">CareNest</span>
        </div>

        <div className="auth-copy">
          <h1>Your trusted companion in elder care</h1>
          <p>
            Connect with professional caregivers, schedule telemedicine appointments,
            monitor health metrics, and ensure the well-being of your loved ones all in
            one place.
          </p>
        </div>

        <div className="auth-points">
          {FEATURES.map((feature) => (
            <div key={feature} className="auth-point">
              <Circle size={10} fill="currentColor" strokeWidth={0} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-panelWrap">
        <div className="auth-panel">
          <div className="auth-tabs">
            <button type="button" className="auth-tab auth-tab--active">
              Login
            </button>
            <button
              type="button"
              className="auth-tab"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              <span>Email Address</span>
              <div className="auth-inputWrap">
                <Mail size={18} className="auth-inputIcon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </label>

            <label className="auth-label">
              <span>Password</span>
              <div className="auth-inputWrap">
                <Lock size={18} className="auth-inputIcon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="auth-row auth-row--end">
              <button type="button" className="auth-linkButton">
                Forgot password?
              </button>
            </div>

            {(error || googleError) && <div className="auth-error">{error || googleError}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-socials">
            <div ref={googleButtonRef} className="auth-googleButton" />
            {!googleReady && (
              <button
                type="button"
                className="auth-social auth-social--google"
                onClick={startGoogleSignIn}
                disabled={!googleReady || googleLoading}
              >
                <span>{googleLoading ? "Opening Google..." : "Loading Google..."}</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
