import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Mail,
  Lock,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  LineChart,
} from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
            alt="Students preparing for interview"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.35),rgba(7,17,31,0.95))]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    MockMate
                  </h1>
                  <p className="text-sm text-slate-300">
                    Placement preparation platform
                  </p>
                </div>
              </div>

              <div className="mt-16 max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  Built for college placement preparation
                </div>

                <h2 className="text-5xl font-black leading-tight xl:text-6xl">
                  Practice interviews with a
                  <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    {" "}
                    smarter workflow
                  </span>
                </h2>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                  MockMate helps students prepare for HR rounds, technical
                  rounds, aptitude tests, and company-specific interview
                  questions in one clean platform.
                </p>
              </div>
            </div>

            <div className="grid max-w-xl gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Structured prep",
                  desc: "Practice with a guided flow for placement readiness.",
                },
                {
                  icon: LineChart,
                  title: "Track progress",
                  desc: "Monitor strengths, weak areas, and interview performance.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10">
                    <item.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500">
                  <BrainCircuit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">MockMate</h1>
                  <p className="text-sm text-slate-400">
                    Placement preparation platform
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-black tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-slate-400">
                Sign in to continue your interview prep journey.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition focus-within:border-cyan-400/70">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition focus-within:border-cyan-400/70">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;