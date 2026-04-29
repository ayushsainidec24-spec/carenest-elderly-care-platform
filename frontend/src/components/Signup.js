import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Heart, Users, Activity, Shield } from "lucide-react";
import api from "../api";

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.message) {
        // Registration successful, redirect to login
        navigate("/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-700 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>

        {/* Medical Icons */}
        <div className="absolute top-20 left-20 text-white/20">
          <Heart size={48} />
        </div>
        <div className="absolute top-40 right-32 text-white/20">
          <Users size={36} />
        </div>
        <div className="absolute bottom-32 left-32 text-white/20">
          <Activity size={40} />
        </div>

        <div className="relative z-10 text-white">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Heart size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">CareNest</h1>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Join Our<br />
            Healthcare Family
          </h2>

          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Create your account and get started on your personalized wellness journey.
            Connect with caregivers, track your health, and access 24/7 support.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Personalized Care</h3>
              <p className="text-sm text-green-100">Tailored healthcare solutions for your unique needs</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <Activity size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-green-100">Track your health metrics and get instant insights</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <Shield size={20} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-green-100">Your health information is always protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <Heart size={24} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">CareNest</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join CareNest and start your wellness journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 text-xs">⚠</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-green-400 disabled:to-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Join CareNest</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>End-to-End Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
