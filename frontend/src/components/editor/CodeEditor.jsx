import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { useSocket } from "../../hooks/useSocket";
import { Play, X, Terminal, Loader2 } from "lucide-react";
import CodeOutputPanel from "./CodeOutputPanel";
import { codeExecutionService } from "../../services/codeExecution.service";
import { makeRunnableCpp } from "../../utils/cppDriver";

const starterCode = {
  javascript: `process.stdin.resume();\nprocess.stdin.setEncoding("utf-8");\nlet input = "";\nprocess.stdin.on("data", d => input += d);\nprocess.stdin.on("end", () => {\n  const line = input.trim();\n  console.log(solution(line));\n});\n\nfunction solution(s) {\n  // your code here\n}`,

  typescript: `process.stdin.resume();\nprocess.stdin.setEncoding("utf-8");\nlet input = "";\nprocess.stdin.on("data", (d: string) => input += d);\nprocess.stdin.on("end", () => {\n  const line = input.trim();\n  console.log(solution(line));\n});\n\nfunction solution(s: string): string | number {\n  // your code here\n  return "";\n}`,

  python: `import sys\n\nclass Solution:\n    def solve(self, s: str) -> int:\n        # your code here\n        pass\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(Solution().solve(s))`,

  java: `import java.util.*;\n\nclass Solution {\n    public int solve(String s) {\n        // your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        System.out.println(new Solution().solve(s));\n    }\n}`,

  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve(string s) {\n        // your code here\n        return 0;\n    }\n};\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << Solution().solve(s) << "\\n";\n    return 0;\n}`,
};

const fileExtensions = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
};

const normalizeCodeByLanguage = (value = {}) => ({ ...starterCode, ...value });

// Pull the first example input from the attached question (to prefill stdin).
const firstExampleInput = (examples) => {
  if (!Array.isArray(examples)) return "";
  const ex = examples.find((e) => e?.input?.trim());
  return ex?.input || "";
};

/**
 * compact=true  → no outer card, no title text (used inside InterviewWorkspace)
 * compact=false → standalone card with header (default, used in Room page grid)
 */
const CodeEditor = ({
  roomId,
  disabled = false,
  compact = false,
  initialTestCases,
}) => {
  const { socket } = useSocket();

  // ── editor state ─────────────────────────────────────────────────────────
  const [language, setLanguage] = useState("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(starterCode);
  const [code, setCode] = useState(starterCode.javascript);

  const languageRef = useRef("javascript");
  const codeRef = useRef(starterCode.javascript);
  const codeByLanguageRef = useRef(starterCode);
  const debounceTimerRef = useRef(null);
  const isApplyingRemoteRef = useRef(false);

  // ── console (input + output) ──────────────────────────────────────────────
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [stdin, setStdin] = useState(() => firstExampleInput(initialTestCases));
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Resizable divider between editor and console
  const [panelHeight, setPanelHeight] = useState(240);
  const resizeRef = useRef({ dragging: false, startY: 0, startH: 240 });

  const onResizeStart = (e) => {
    resizeRef.current = { dragging: true, startY: e.clientY, startH: panelHeight };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!resizeRef.current.dragging) return;
      const delta = e.clientY - resizeRef.current.startY;
      const next = resizeRef.current.startH - delta; // drag up → taller console
      setPanelHeight(Math.min(560, Math.max(120, next)));
    };
    const onUp = () => { resizeRef.current.dragging = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Prefill the input box with the question's example when one is attached
  useEffect(() => {
    const ex = firstExampleInput(initialTestCases);
    if (ex) setStdin(ex);
  }, [JSON.stringify(initialTestCases)]);

  // ── socket helpers ────────────────────────────────────────────────────────
  const clearDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const updateLocalState = (nextLanguage, nextCodeByLanguage) => {
    const normalized = normalizeCodeByLanguage(nextCodeByLanguage);
    const nextCode = normalized[nextLanguage] || starterCode[nextLanguage] || "";
    languageRef.current = nextLanguage;
    codeRef.current = nextCode;
    codeByLanguageRef.current = normalized;
    setLanguage(nextLanguage);
    setCodeByLanguage(normalized);
    setCode(nextCode);
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleCodeUpdate = ({ language: inLang, code: inCode }) => {
      if (!inLang) return;
      isApplyingRemoteRef.current = true;
      const next = { ...codeByLanguageRef.current, [inLang]: inCode || "" };
      codeByLanguageRef.current = next;
      setCodeByLanguage(next);
      if (inLang === languageRef.current) {
        codeRef.current = inCode || "";
        setCode(inCode || "");
      }
      setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
    };

    const handleLanguageUpdate = ({ language: inLang, codeByLanguage: inCBL }) => {
      if (!inLang) return;
      clearDebounce();
      isApplyingRemoteRef.current = true;
      updateLocalState(starterCode[inLang] ? inLang : "javascript", normalizeCodeByLanguage(inCBL));
      setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
    };

    socket.emit("editor-join", { roomId });
    socket.on("code-update", handleCodeUpdate);
    socket.on("language-update", handleLanguageUpdate);

    return () => {
      clearDebounce();
      socket.off("code-update", handleCodeUpdate);
      socket.off("language-update", handleLanguageUpdate);
    };
  }, [socket, roomId]);

  // ── editor change handlers ────────────────────────────────────────────────
  const handleCodeChange = (value) => {
    if (isApplyingRemoteRef.current || disabled) return;
    const newCode = value || "";
    const editLang = languageRef.current;
    const next = { ...codeByLanguageRef.current, [editLang]: newCode };
    codeRef.current = newCode;
    codeByLanguageRef.current = next;
    setCode(newCode);
    setCodeByLanguage(next);
    clearDebounce();
    debounceTimerRef.current = setTimeout(() => {
      if (!socket || !roomId) return;
      socket.emit("code-change", { roomId, language: editLang, code: newCode });
    }, 350);
  };

  const handleLanguageChange = (newLang) => {
    if (!newLang || newLang === languageRef.current || disabled) return;
    clearDebounce();
    const next = { ...codeByLanguageRef.current, [languageRef.current]: codeRef.current };
    if (!next[newLang]) next[newLang] = starterCode[newLang] || "";
    updateLocalState(newLang, next);
    if (socket && roomId) {
      socket.emit("language-change", { roomId, language: newLang, codeByLanguage: next });
    }
  };

  // If C++ code is a bare Solution class (no main), auto-generate the driver
  // so Run "just works" without clicking Make Runnable first.
  const getRunnableCode = () => {
    const src = codeRef.current;
    if (language === "cpp" && !/\bint\s+main\s*\(/.test(src)) {
      return makeRunnableCpp(src);
    }
    return src;
  };

  // ── run: execute the code with the given stdin and show output ─────────────
  const handleRunCode = async () => {
    setIsPanelOpen(true);
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await codeExecutionService.runCode(language, getRunnableCode(), stdin);
      setExecutionResult(res.data);
    } catch (err) {
      setExecutionResult({
        type: "runtime_error",
        output: err.response?.data?.message || err.message || "Execution failed.",
        executionTimeMs: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // ── toolbar (shared between compact + standalone) ─────────────────────────
  const Toolbar = (
    <div className="flex items-center gap-2">
      <LanguageSelector language={language} onChange={handleLanguageChange} />

      <div className={`flex items-center overflow-hidden shadow-sm rounded-xl border ${compact ? "border-[#2a2a2a]" : "border-slate-200 dark:border-[#2a2a2a]"}`}>
        <button
          onClick={() => setIsPanelOpen((o) => !o)}
          className={`flex items-center justify-center p-2.5 transition ${compact ? "text-slate-400 hover:bg-[#2a2a2a] bg-[#1a1a1a]" : "text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#1a1a1a]"}`}
          title="Toggle console"
        >
          <Terminal size={16} />
        </button>

        <div className={`w-px h-5 ${compact ? "bg-[#2a2a2a]" : "bg-slate-200 dark:bg-[#2a2a2a]"}`} />

        <button
          onClick={handleRunCode}
          disabled={isExecuting || disabled}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Run your code with the input below"
        >
          {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isExecuting ? "Running…" : "Run"}
        </button>
      </div>
    </div>
  );

  // ── bottom panel (Input + Output console) ─────────────────────────────────
  const BottomPanel = isPanelOpen ? (
    <div
      className={`flex flex-col shrink-0 ${compact ? "bg-[#1e1e1e]" : "bg-[#1e1e1e]"}`}
      style={{ height: panelHeight }}
    >
      {/* Drag-to-resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="group h-1.5 shrink-0 cursor-row-resize bg-[#2a2a2a] hover:bg-emerald-500/60 active:bg-emerald-500 transition-colors flex items-center justify-center"
        title="Drag to resize the console"
      >
        <div className="h-0.5 w-8 rounded-full bg-slate-600 group-hover:bg-emerald-300/70 transition-colors" />
      </div>

      {/* Header bar */}
      <div className={`flex items-center border-b shrink-0 ${compact ? "border-[#2a2a2a] bg-[#171717]" : "border-slate-200 dark:border-[#2a2a2a] bg-[#171717]"}`}>
        <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400">
          Console
        </div>
        <div className="ml-auto flex items-center gap-1 pr-2">
          {isExecuting && <div className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />}
          <button onClick={() => setIsPanelOpen(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded transition" title="Close">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <CodeOutputPanel
          stdin={stdin}
          setStdin={setStdin}
          loading={isExecuting}
          result={executionResult}
        />
      </div>
    </div>
  ) : null;

  // ── COMPACT MODE (inside InterviewWorkspace) ──────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
          {Toolbar}
        </div>

        {/* Editor — Monaco pinned to an absolute box so it can't grow the layout */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          <div className="absolute inset-0">
            <Editor
              height="100%"
              language={language}
              path={`${roomId}-${language}.${fileExtensions[language] || "txt"}`}
              value={code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                readOnly: disabled,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                detectIndentation: false,
              }}
            />
          </div>
        </div>

        {BottomPanel}
      </div>
    );
  }

  // ── STANDALONE MODE (used without InterviewWorkspace) ─────────────────────
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#2a2a2a] dark:bg-[#171717]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-[#2a2a2a] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Collaborative Code Editor
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Code and language changes sync live with everyone in this session.
          </p>
        </div>
        {Toolbar}
      </div>

      <div className="flex flex-col overflow-hidden" style={{ height: isPanelOpen ? 600 : 500 }}>
        <div className="flex-1 relative min-h-0 overflow-hidden">
          <div className="absolute inset-0">
            <Editor
              height="100%"
              language={language}
              path={`${roomId}-${language}.${fileExtensions[language] || "txt"}`}
              value={code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                readOnly: disabled,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                detectIndentation: false,
              }}
            />
          </div>
        </div>
        {BottomPanel}
      </div>
    </section>
  );
};

export default CodeEditor;
