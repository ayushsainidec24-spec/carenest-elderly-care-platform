import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Heart, Circle, Share2 } from "lucide-react";
import axios from "axios";
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
  const { googleError, googleLoading, startGoogleSignIn } = useGoogleAuth(() => navigate("/dashboard"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
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
            <button
              type="button"
              className="auth-social"
              onClick={startGoogleSignIn}
              disabled={googleLoading}
            >
              <span className="auth-social__mark auth-social__mark--google">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.35 11.1H12v2.8h5.4c-.25 1.4-1.05 2.54-2.23 3.32v2.76h3.6c2.1-1.94 3.3-4.72 3.3-8.28 0-.56-.05-1.1-.15-1.62z" fill="#4285F4" />
                  <path d="M12 22c2.97 0 5.47-1 7.3-2.7l-3.6-2.76c-.98.66-2.23 1.06-3.7 1.06-2.85 0-5.27-1.92-6.13-4.5H2.2v2.82C3.98 19.95 7.72 22 12 22z" fill="#34A853" />
                  <path d="M5.87 13.8a7.48 7.48 0 010-3.6V7.38H2.2a11.96 11.96 0 000 9.24l3.67-2.82z" fill="#FBBC05" />
                  <path d="M12 6.18c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.47 2.66 14.97 2 12 2 7.72 2 3.98 4.05 2.2 7.38l3.67 2.82C6.73 8.1 9.15 6.18 12 6.18z" fill="#EA4335" />
                </svg>
              </span>
              <span>{googleLoading ? "Opening Google..." : "Google"}</span>
            </button>
            <button type="button" className="auth-social">
              <Share2 size={18} className="auth-social__mark auth-social__mark--facebook" />
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
