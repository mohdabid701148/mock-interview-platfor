import { Link } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  Users,
  Play,
  CalendarClock,
  MessageSquareText,
  History,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Collaborative Code Editor",
    desc: "A shared Monaco editor with real-time sync — both of you see every keystroke and language switch instantly.",
  },
  {
    icon: Play,
    title: "Run Code Live",
    desc: "Execute solutions in JavaScript, Python, Java, C++ and TypeScript right inside the room with custom input.",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Rooms",
    desc: "Create a room, share the code, and pair up as interviewer and interviewee — just like a real interview.",
  },
  {
    icon: CalendarClock,
    title: "Scheduling",
    desc: "Plan mock interviews ahead of time and get notified when your session is about to start.",
  },
  {
    icon: MessageSquareText,
    title: "Structured Feedback",
    desc: "Score coding, problem-solving, communication and more — then leave actionable written feedback.",
  },
  {
    icon: History,
    title: "Interview History",
    desc: "Revisit past sessions, attached questions, code, and the feedback you received to track your growth.",
  },
];

const steps = [
  { n: "1", title: "Create a room", desc: "Spin up an interview room in one click and share the code with your peer." },
  { n: "2", title: "Pair up & solve", desc: "One interviews, one solves — collaborate on the shared editor and run the code." },
  { n: "3", title: "Get feedback", desc: "Wrap up with structured scores and notes, saved to your history for next time." },
];

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-base font-bold sm:h-9 sm:w-9 sm:text-lg">
              M
            </div>
            <span className="text-base font-bold sm:text-lg">MockMate</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:px-4"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:px-4"
            >
              Get Started
              <ArrowRight size={16} className="hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Peer-to-peer mock interviews
            </span>

            <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Practice interviews with{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                real peers.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              MockMate lets students run realistic technical interviews together —
              a shared code editor, live code execution, scheduling, and structured
              feedback, all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Start practicing free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-white/15 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/5"
              >
                I have an account
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              Email-verified accounts · Free for students
            </div>
          </div>

          {/* Editor mock */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#161616] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-slate-500">room · HXYPQP</span>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  2 online
                </span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-slate-300">
{`class Solution {
  int uniqueLetterString(string s) {
    int n = s.size(), ans = 0;
    // pair-programming in real time...
    return ans;
  }
};`}
              </pre>
              <div className="flex items-center gap-2 border-t border-white/10 bg-[#161616] px-4 py-3">
                <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
                  ✓ Accepted
                </span>
                <span className="text-xs text-slate-500">3ms · output 10</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to run a mock interview</h2>
          <p className="mt-4 text-slate-400">
            Built for students preparing for technical interviews — together.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-4 text-slate-400">Three steps from sign-up to a full mock interview.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-slate-900">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 to-emerald-600/10 p-8 text-center sm:p-14">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready for your next mock interview?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Create your free account, grab a peer, and start practicing in minutes.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Get Started — it's free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">
              M
            </div>
            MockMate © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link to="/login" className="transition hover:text-white">Login</Link>
            <Link to="/signup" className="transition hover:text-white">Sign up</Link>
            <a
              href="https://github.com/mohdabid701148/mock-interview-platfor"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
