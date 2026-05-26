import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  BrainCircuit,
  Sparkles,
  CalendarDays,
  BarChart3,
  Target,
  MessageSquareQuote,
  Trophy,
  ArrowRight,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">MockMate</h1>
              <p className="text-sm text-slate-400">
                Placement preparation dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-slate-400">Welcome back</p>
              <p className="font-semibold text-white">{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Your interview prep workspace
            </div>

            <h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              Hello, {user?.username || "Student"}.
              <span className="block bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Ready to crack placements?
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Use MockMate to practice interview rounds, build confidence, and
              prepare for company shortlists with a clean, focused workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]">
                Start mock interview
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                View progress
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: CalendarDays, label: "Sessions", value: "12" },
                { icon: BarChart3, label: "Score", value: "84%" },
                { icon: Trophy, label: "Rank", value: "Top 20%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <item.icon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="text-2xl font-black">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Today&apos;s focus</h3>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                Updated
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "HR interview basics",
                  desc: "Practice self-intro, strengths, and project explanation.",
                },
                {
                  title: "Technical round prep",
                  desc: "Revise DSA, core CS concepts, and problem solving.",
                },
                {
                  title: "Aptitude practice",
                  desc: "Sharpen reasoning, quant, and time management.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                alt="Interview preparation workspace"
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="flex items-start gap-3">
                <MessageSquareQuote className="mt-0.5 h-5 w-5 text-cyan-300" />
                <div>
                  <h4 className="font-semibold text-white">MockMate tip</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Keep your answers short, structured, and confident. Use
                    project-based examples whenever possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;