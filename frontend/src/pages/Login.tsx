import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Truck, ArrowRight, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type Role = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

const roleRedirects: Record<Role, string> = {
  "Fleet Manager": "/dashboard",
  "Dispatcher": "/trips",
  "Safety Officer": "/drivers",
  "Financial Analyst": "/expenses",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.532 24.552c0-1.636-.147-3.2-.42-4.704H24.48v8.907h12.94c-.558 3.001-2.24 5.548-4.774 7.26v6.033h7.732c4.524-4.168 7.154-10.303 7.154-17.496z" fill="#4285F4"/>
      <path d="M24.48 48c6.48 0 11.92-2.148 15.892-5.82l-7.732-6.033c-2.148 1.44-4.896 2.292-8.16 2.292-6.276 0-11.592-4.236-13.494-9.924H2.988v6.228C6.948 42.756 15.12 48 24.48 48z" fill="#34A853"/>
      <path d="M10.986 28.515A14.413 14.413 0 0 1 10.2 24c0-1.572.27-3.096.786-4.515v-6.228H2.988A23.97 23.97 0 0 0 .48 24c0 3.876.924 7.548 2.508 10.743l8.004-6.228z" fill="#FBBC05"/>
      <path d="M24.48 9.555c3.54 0 6.708 1.218 9.204 3.606l6.9-6.9C36.396 2.364 30.96 0 24.48 0 15.12 0 6.948 5.244 2.988 13.257l8.004 6.228C12.888 13.791 18.204 9.555 24.48 9.555z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, register, mockOAuthLogin } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Fleet Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);

  // Sign up only fields
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) { setError("Full name is required."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }

      setLoading(true);
      try {
        const success = await register(email, password, fullName, role);
        if (success) {
          navigate(roleRedirects[role]);
        } else {
          setError("Email already registered. Please sign in.");
        }
      } catch {
        setError("Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const success = await login(email, password, role, true);
        if (success) {
          navigate(roleRedirects[role]);
        } else {
          setError("Invalid credentials. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOAuth = async (provider: "google" | "microsoft") => {
    setOauthLoading(provider);
    await new Promise((res) => setTimeout(res, 800));
    mockOAuthLogin(provider);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#3b1a52] via-[#7a2d5e] to-[#e0794f]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Truck className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">TransitOps</p>
            <p className="text-white/60 text-xs leading-tight">Smart Transport Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Real-Time Fleet Intelligence
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Smarter fleets,{" "}
            <span className="text-orange-400">delivered on time.</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Manage vehicles, dispatch trips, track maintenance, and analyse
            expenses — all from a single unified control panel built for
            India's transport ecosystem.
          </p>
          <div className="flex gap-10 mt-10">
            <div>
              <p className="text-2xl font-bold text-white">99.8%</p>
              <p className="text-white/60 text-xs mt-1">On-Time Dispatch</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">14%</p>
              <p className="text-white/60 text-xs mt-1">Fuel Savings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-white/60 text-xs mt-1">Fleet Monitoring</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/50 text-xs">
          <p>© 2026 TransitOps. Built for India.</p>
          <p>India Region · IST</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold leading-tight text-gray-900">TransitOps</p>
              <p className="text-gray-500 text-xs leading-tight">Smart Transport Platform</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Mode toggle tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                  mode === "signin"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                  mode === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-gray-500 text-sm mt-1 mb-5">
              {mode === "signin"
                ? "Sign in to your transport control panel"
                : "Join TransitOps and manage your fleet"}
            </p>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                {oauthLoading === "google" ? <span className="text-xs">Signing in...</span> : <><GoogleIcon /> Google</>}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("microsoft")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                {oauthLoading === "microsoft" ? <span className="text-xs">Signing in...</span> : <><MicrosoftIcon /> Microsoft</>}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 font-medium tracking-wide">OR WITH EMAIL</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name — Sign Up only */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">FULL NAME</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rajesh Kumar"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ROLE</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                >
                  <option>Fleet Manager</option>
                  <option>Dispatcher</option>
                  <option>Safety Officer</option>
                  <option>Financial Analyst</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">PASSWORD</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password — Sign Up only */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60 mt-2"
              >
                {loading
                  ? mode === "signup" ? "Creating account..." : "Signing in..."
                  : mode === "signup" ? "Create Account" : "Sign in to Dashboard"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            India Region · IST · TransitOps v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
