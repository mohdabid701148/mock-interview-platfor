import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  Users,
  CalendarClock,
  MessageSquareText,
  History,
  Terminal,
} from "lucide-react";
import Logo from "../components/Logo";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 antialiased">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo size={32} withText textClassName="text-[15px] font-semibold tracking-tight" />

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 sm:px-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[90%] max-w-3xl -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-8 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium text-blue-400">
              Free · peer-to-peer · built for students
            </p>

            <h1 className="mt-4 text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Run a real coding<br className="hidden sm:block" /> interview with a friend.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Not flashcards. Not a chatbot. A shared editor, code that actually
              runs, and an honest scorecard at the end — so you practice the part
              that's hard: thinking out loud while someone watches.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create a free account
                <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Log in
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
              {["No card needed", "Runs in your browser", "5 languages"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={15} className="text-blue-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Product preview */}
          <div className="relative lg:pl-2">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-blue-950/30">
              {/* window bar */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-xs text-slate-500">mockmate.app/room/HXYPQP</span>
                <div className="ml-auto flex -space-x-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0d1117] bg-blue-500 text-[10px] font-bold text-white">A</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0d1117] bg-emerald-500 text-[10px] font-bold text-white">S</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.15fr]">
                {/* problem (hidden on small) */}
                <div className="hidden border-r border-white/10 p-4 sm:block">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">Medium</span>
                    <span className="text-xs font-medium text-slate-300">Unique Letters</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded bg-white/10" />
                    <div className="h-2 w-[85%] rounded bg-white/10" />
                    <div className="h-2 w-[70%] rounded bg-white/10" />
                    <div className="mt-3 h-2 w-[40%] rounded bg-white/5" />
                    <div className="h-2 w-[90%] rounded bg-white/10" />
                    <div className="h-2 w-[60%] rounded bg-white/10" />
                  </div>
                </div>

                {/* editor */}
                <div className="p-4 font-mono text-[12px] leading-5">
                  <pre className="text-slate-300">
<span className="text-slate-600">1  </span><span className="text-sky-300">class</span> Solution {'{'}
<span className="text-slate-600">2  </span>  <span className="text-sky-300">int</span> <span className="text-violet-300">unique</span>(<span className="text-sky-300">string</span> s) {'{'}
<span className="text-slate-600">3  </span>    <span className="text-sky-300">int</span> ans = <span className="text-amber-300">0</span>;
<span className="text-slate-600">4  </span>    <span className="text-slate-500">// you explain as you type…</span>
<span className="text-slate-600">5  </span>    <span className="text-sky-300">return</span> ans;
<span className="text-slate-600">6  </span>  {'}'}
<span className="text-slate-600">7  </span>{'}'}
                  </pre>
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                      <Check size={12} /> Accepted
                    </span>
                    <span className="text-[11px] text-slate-500">3 ms · output 10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* floating feedback chip */}
            <div className="absolute -bottom-4 -left-2 hidden rounded-xl border border-white/10 bg-slate-900 px-4 py-3 shadow-xl sm:block">
              <p className="text-[11px] text-slate-500">Communication</p>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className="h-1.5 w-5 rounded-full bg-blue-500" />
                ))}
                <span className="h-1.5 w-5 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* chips strip */}
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/5 py-5 text-sm text-slate-500">
            <span className="font-medium text-slate-400">Built with the tools you'd use anyway:</span>
            {["JavaScript", "Python", "Java", "C++", "TypeScript"].map((l) => (
              <span key={l} className="font-mono text-slate-300">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (bento) ───────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The whole interview, in one tab
          </h2>
          <p className="mt-3 text-slate-400">
            Everything an interview needs and nothing it doesn't.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* wide highlight */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/15 to-transparent p-6 sm:col-span-2">
            <Code2 className="text-blue-400" size={22} />
            <h3 className="mt-4 text-lg font-semibold text-white">A shared editor that keeps up</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Monaco (the editor behind VS Code) synced in real time. The interviewer
              sees every keystroke and language switch — so they can follow your
              reasoning, not just your final answer.
            </p>
          </div>

          {[
            { icon: Terminal, title: "Code that runs", desc: "Run JS, Python, Java, C++ and TS with your own inputs. Zero setup, no local environment." },
            { icon: Users, title: "One code, two roles", desc: "Share a room code. Your peer joins as interviewer or interviewee — then you swap." },
            { icon: MessageSquareText, title: "Scorecards, not vibes", desc: "Rate problem-solving, communication, and more, with written notes you can revisit." },
            { icon: CalendarClock, title: "Plan it or wing it", desc: "Schedule a session with reminders, or just spin up a room right now." },
            { icon: History, title: "Everything saved", desc: "Past sessions, the question, the code, and the feedback — all kept in your history." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]">
              <Icon className="text-blue-400" size={20} />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how" className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            From "let's practice" to done in three steps
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Create a room", d: "Make a session and send the code to a friend. One of you interviews, the other solves." },
              { n: "02", t: "Work the problem", d: "Attach a question, code in the shared editor, run it, and talk through your approach." },
              { n: "03", t: "Trade feedback", d: "Score the session and leave notes. It's saved so you can see yourself improve." },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                <span className="font-mono text-sm text-blue-400">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{s.d}</p>
                {i < 2 && (
                  <span className="absolute right-0 top-2 hidden text-slate-700 md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maker note (the human touch) ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Made by a student who got tired of practicing alone
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Most prep tools either cost money or have you talking to yourself. The part
            that actually shows up in a real interview — explaining your thinking while
            another person pushes back — is the part you can't rehearse solo. MockMate
            is just the room I wanted: grab a classmate, take turns, get real feedback.
            It runs entirely on free infrastructure, so it stays free to use.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Questions, answered
          </h2>

          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {[
              { q: "Is it actually free?", a: "Yes. It runs on free-tier hosting and there's no paid plan — sign up and use it." },
              { q: "Do I need to install anything?", a: "No. The editor and code execution run in your browser. Just open a room and go." },
              { q: "Who plays the interviewer?", a: "You and a peer. One hosts and asks the question, the other solves — then you switch roles." },
              { q: "Which languages can I run?", a: "JavaScript, Python, Java, C++, and TypeScript, each with your own test input." },
              { q: "Do I need to verify my email?", a: "Yes — a quick 6-digit code keeps accounts real. It takes a few seconds." },
            ].map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-white">
                  {item.q}
                  <span className="text-slate-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-14">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Grab a friend. Open a room.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Your next mock interview is two minutes away.
          </p>
          <Link
            to="/signup"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Start for free
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <Logo size={24} withText textClassName="text-sm font-semibold text-slate-300" />
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MockMate — a student project.
          </p>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link to="/login" className="transition hover:text-white">Log in</Link>
            <Link to="/signup" className="transition hover:text-white">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
