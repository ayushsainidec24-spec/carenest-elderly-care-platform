import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Heart, Circle } from "lucide-react";
import api from "../api";
import "./AuthPages.css";
import { useGoogleAuth } from "./useGoogleAuth";

const FEATURES = [
  "Personalized Care Plans",
  "Trusted Healthcare Network",
  "Real-time Health Monitoring",
  "Family Coordination Tools",
];

export function SignupRedesign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const goToDashboard = () => navigate("/dashboard", { replace: true });
  const { googleReady, googleError, googleLoading, googleButtonRef, startGoogleSignIn } = useGoogleAuth(goToDashboard);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        goToDashboard();
      } else if (response.data.message) {
        navigate("/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Registration failed. Please try again."
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
            Create your account to connect with caregivers, book telemedicine
            appointments, track health readings, and coordinate family care from one
            calming dashboard.
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
            <button
              type="button"
              className="auth-tab"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button type="button" className="auth-tab auth-tab--active">
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form auth-form--signup">
            <label className="auth-label">
              <span>Full Name</span>
              <div className="auth-inputWrap">
                <User size={18} className="auth-inputIcon" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </label>

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
                  placeholder="Create your password"
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

            <label className="auth-label">
              <span>Confirm Password</span>
              <div className="auth-inputWrap">
                <Lock size={18} className="auth-inputIcon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {(error || googleError) && <div className="auth-error">{error || googleError}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
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
