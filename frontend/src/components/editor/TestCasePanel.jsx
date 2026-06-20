import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  FlaskConical,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────

const getVerdict = (result) => {
  if (!result) return null;
  if (result.passed === true) return "correct";
  if (result.passed === false) return "wrong";
  if (result.type === "compile_error") return "compile_error";
  if (result.type === "timeout") return "timeout";
  if (result.type === "runtime_error") return "runtime_error";
  return "ran"; // ran but no expected output to compare
};

const VERDICT = {
  correct: { label: "Correct", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", Icon: CheckCircle2 },
  wrong: { label: "Wrong Answer", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", Icon: XCircle },
  compile_error: { label: "Compilation Error", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", Icon: AlertTriangle },
  timeout: { label: "Time Limit Exceeded", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", Icon: Clock },
  runtime_error: { label: "Runtime Error", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", Icon: AlertTriangle },
  ran: { label: "Ran (no comparison)", color: "text-slate-400", bg: "bg-[#252525] border-[#333]", Icon: FlaskConical },
};

// ── summary bar ────────────────────────────────────────────────────────────────

const SummaryBar = ({ results, loading }) => {
  if (loading) return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
      <Loader2 size={13} className="animate-spin text-slate-400" />
      <span className="text-xs text-slate-400">Running test cases…</span>
    </div>
  );

  if (!results) return null;

  const total = results.length;
  const passed = results.filter(r => r.passed === true).length;
  const failed = results.filter(r => r.passed === false).length;
  const hasCompile = results.some(r => r.type === "compile_error");
  const hasRuntime = results.some(r => r.type === "runtime_error" || r.type === "timeout");
  const allPassed = passed === total && total > 0 && results.every(r => r.passed !== null);

  if (hasCompile) return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-amber-500/10 shrink-0">
      <AlertTriangle size={13} className="text-amber-400" />
      <span className="text-xs font-semibold text-amber-400">Compilation Error — fix your code and try again</span>
    </div>
  );

  if (hasRuntime) return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-red-500/10 shrink-0">
      <AlertTriangle size={13} className="text-red-400" />
      <span className="text-xs font-semibold text-red-400">Runtime Error</span>
    </div>
  );

  if (allPassed) return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-emerald-500/10 shrink-0">
      <CheckCircle2 size={13} className="text-emerald-400" />
      <span className="text-xs font-semibold text-emerald-400">
        {total === 1 ? "Test case passed" : `All ${total} test cases passed`}
      </span>
    </div>
  );

  if (failed > 0) return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-red-500/10 shrink-0">
      <XCircle size={13} className="text-red-400" />
      <span className="text-xs font-semibold text-red-400">Wrong Answer</span>
      <span className="text-xs text-red-400/60 ml-0.5">· {passed}/{total} passed</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
      <span className="text-xs text-slate-400">{passed}/{total} passed</span>
    </div>
  );
};

// ── main component ─────────────────────────────────────────────────────────────

const TestCasePanel = ({ testCases, results, loading, onAdd, onUpdate, onRemove }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevResultsRef = useRef(null);

  const safeIndex = Math.min(activeIndex, testCases.length - 1);
  const tc = testCases[safeIndex];
  const result = results?.[safeIndex] ?? null;
  const verdict = getVerdict(result);
  const vInfo = verdict ? VERDICT[verdict] : null;

  // Auto-jump to first failing case when new results arrive
  useEffect(() => {
    if (!results || results === prevResultsRef.current) return;
    prevResultsRef.current = results;
    const firstBad = results.findIndex(
      r => r.passed === false || (r.type && r.type !== "success")
    );
    if (firstBad >= 0) setActiveIndex(firstBad);
  }, [results]);

  const handleAdd = () => {
    onAdd();
    setActiveIndex(testCases.length);
  };

  const handleRemove = (i) => {
    onRemove(testCases[i].id);
    setActiveIndex(Math.max(0, i - 1));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1e1e1e] text-sm select-none">
      <SummaryBar results={results} loading={loading} />

      {/* ── tab strip ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 pt-1.5 border-b border-[#2a2a2a] overflow-x-auto shrink-0">
        {testCases.map((item, i) => {
          const r = results?.[i];
          const v = getVerdict(r);
          const isActive = i === safeIndex;
          const isGood = v === "correct" || v === "ran";
          const isBad = v && v !== "correct" && v !== "ran";

          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium transition-colors whitespace-nowrap border-b-2
                ${isActive
                  ? "bg-[#2a2a2a] text-white border-b-[#2a2a2a]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#252525] border-b-transparent"
                }`}
            >
              {v === "correct" && <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />}
              {isBad && <XCircle size={10} className="text-red-400 shrink-0" />}
              <span className={v === "correct" ? "text-emerald-400" : isBad ? "text-red-400" : ""}>
                Case {i + 1}
              </span>
              {testCases.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity cursor-pointer ml-0.5"
                >
                  <Minus size={11} />
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={handleAdd}
          disabled={testCases.length >= 10}
          className="ml-1 flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Add test case"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* ── content ───────────────────────────────────────────────────────── */}
      {tc && (
        <div className="flex flex-1 min-h-0 overflow-hidden select-text">
          {/* Left: editable inputs */}
          <div className="flex flex-col gap-2.5 p-3 w-[45%] border-r border-[#2a2a2a] overflow-y-auto custom-scrollbar shrink-0">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 block mb-1">
                Input
              </label>
              <textarea
                value={tc.input}
                onChange={(e) => onUpdate(tc.id, "input", e.target.value)}
                placeholder="stdin input for your program…"
                className={`w-full bg-[#141414] text-slate-200 text-xs font-mono rounded-lg p-2.5 resize-none border focus:outline-none h-[72px] custom-scrollbar ${
                  !tc.input.trim()
                    ? "border-amber-500/50 focus:border-amber-500"
                    : "border-[#2a2a2a] focus:border-[#444]"
                }`}
              />
              {!tc.input.trim() && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/90">
                  <AlertTriangle size={11} />
                  Input is empty — your program will read nothing (likely outputs 0 / blank).
                </p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 block mb-1">
                Expected Output
                <span className="ml-1 text-slate-600 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={tc.expectedOutput}
                onChange={(e) => onUpdate(tc.id, "expectedOutput", e.target.value)}
                placeholder="expected stdout…"
                className="w-full bg-[#141414] text-slate-200 text-xs font-mono rounded-lg p-2.5 resize-none border border-[#2a2a2a] focus:outline-none focus:border-[#444] h-14 custom-scrollbar"
              />
            </div>
          </div>

          {/* Right: results */}
          <div className="flex flex-col p-3 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Loader2 size={12} className="animate-spin" />
                Running case {safeIndex + 1}…
              </div>
            ) : !result ? (
              <p className="text-xs text-slate-600 italic mt-1">
                Click <span className="text-violet-400 not-italic font-medium">Test</span> to run.
              </p>
            ) : (
              <>
                {/* Verdict badge */}
                {vInfo && (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-3 text-xs font-semibold border ${vInfo.bg}`}>
                    <vInfo.Icon size={12} className={vInfo.color} />
                    <span className={vInfo.color}>{vInfo.label}</span>
                    {result.executionTimeMs > 0 && (
                      <span className="ml-auto font-normal text-slate-600">{result.executionTimeMs}ms</span>
                    )}
                  </div>
                )}

                {/* Your output */}
                <div className="mb-2.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 block mb-1">
                    {result.type === "compile_error" ? "Error" :
                     result.type === "runtime_error" ? "Error" : "Your Output"}
                  </label>
                  <pre className={`text-xs font-mono rounded-lg p-2.5 bg-[#141414] border border-[#2a2a2a] whitespace-pre-wrap break-words leading-relaxed min-h-[32px] ${
                    result.type === "success" ? "text-slate-200" : "text-red-400"
                  }`}>
                    {result.output || <span className="text-slate-600 italic">{"(no output)"}</span>}
                  </pre>
                </div>

                {/* Expected (shown when wrong answer) */}
                {verdict === "wrong" && result.expectedOutput != null && (
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 block mb-1">
                      Expected
                    </label>
                    <pre className="text-xs font-mono rounded-lg p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 whitespace-pre-wrap break-words leading-relaxed">
                      {result.expectedOutput}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;
