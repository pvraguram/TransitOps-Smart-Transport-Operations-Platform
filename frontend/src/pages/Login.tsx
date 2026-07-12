import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth.tsx";

type Role = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

const roleRedirects: Record<Role, string> = {
  "Fleet Manager": "/dashboard",
  "Dispatcher": "/trips",
  "Safety Officer": "/drivers",
  "Financial Analyst": "/expenses",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("ops@transitops.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Dispatcher");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password, role, remember);
      if (success) {
        navigate(roleRedirects[role]);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">TransitOps</p>
            <p className="text-white/60 text-xs leading-tight">Enterprise Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Now Live: Next-Gen Fleet Dispatching
          </span>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Intelligent transit,{" "}
            <span className="text-orange-400">harmonized</span> in real-time.
          </h1>

          <p className="text-white/70 text-sm leading-relaxed">
            Harness the power of high-density telemetry, predictive
            maintenance, and optimized dispatching to drive your fleet
            forward with unmatched precision.
          </p>

          <div className="flex gap-10 mt-10">
            <div>
              <p className="text-2xl font-bold text-white">99.98%</p>
              <p className="text-white/60 text-xs mt-1">On-Time Dispatch</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">14.2%</p>
              <p className="text-white/60 text-xs mt-1">Fuel Reductions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-white/60 text-xs mt-1">Active Telemetry</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/50 text-xs">
          <p>© TransitOps Technologies Inc.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/80">Privacy</a>
            <a href="#" className="hover:text-white/80">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold leading-tight text-gray-900">TransitOps</p>
              <p className="text-gray-500 text-xs leading-tight">Enterprise Platform</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Access your enterprise transport control panel
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <span>🪟</span> Microsoft
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <span>🔵</span> Google
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  EMAIL ADDRESS
                </label>
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600">
                    PASSWORD
                  </label>
                  <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  ROLE
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white"
                >
                  <option>Fleet Manager</option>
                  <option>Dispatcher</option>
                  <option>Safety Officer</option>
                  <option>Financial Analyst</option>
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Remember this device
                </label>
                <span className="text-xs text-gray-500">
                  Region: <span className="font-semibold text-gray-700">US-East</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to Dashboard"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 text-xs">
              <span className="text-gray-500">Need an enterprise account?</span>
              <a href="#" className="font-semibold text-gray-900 hover:underline">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
