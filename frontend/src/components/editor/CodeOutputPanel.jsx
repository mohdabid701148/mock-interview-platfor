import { X, PlayCircle, AlertTriangle, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const getHeaderConfig = (type) => {
  switch (type) {
    case "success":
      return { icon: CheckCircle2, title: "Execution Successful", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "compile_error":
      return { icon: AlertTriangle, title: "Compilation Error", color: "text-amber-500", bg: "bg-amber-500/10" };
    case "runtime_error":
      return { icon: AlertCircle, title: "Runtime Error", color: "text-red-500", bg: "bg-red-500/10" };
    case "timeout":
      return { icon: Clock, title: "Execution Timeout", color: "text-rose-500", bg: "bg-rose-500/10" };
    default:
      return { icon: PlayCircle, title: "Output Console", color: "text-slate-400", bg: "bg-slate-500/10" };
  }
};

const CodeOutputPanel = ({ isOpen, onClose, loading, result }) => {
  if (!isOpen) return null;

  const hasResult = result && result.type;
  const { icon: Icon, title, color, bg } = getHeaderConfig(hasResult ? result.type : "default");

  return (
    <div className="flex flex-col border-t border-slate-200 dark:border-[#2a2a2a] bg-[#1e1e1e] h-64 shrink-0 transition-all">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#171717]">
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent dark:border-white"></div>
          ) : (
            <Icon size={16} className={color} />
          )}
          <span className="text-sm font-semibold text-slate-300">
            {loading ? "Executing..." : title}
          </span>
          {hasResult && result.executionTimeMs > 0 && !loading && (
            <span className="text-xs text-slate-500 ml-2 border border-[#333] px-1.5 py-0.5 rounded bg-[#222]">
              {result.executionTimeMs}ms
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-[#2a2a2a]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-sm bg-[#1e1e1e]">
        {loading ? (
          <div className="text-slate-500 italic">Running code... please wait.</div>
        ) : !hasResult ? (
          <div className="text-slate-500 italic">No execution history for this session yet.</div>
        ) : (
          <pre className={`whitespace-pre-wrap break-words ${result.type === 'success' ? 'text-slate-300' : 'text-red-400'}`}>
            {result.output || "Program finished with no output."}
          </pre>
        )}
      </div>
    </div>
  );
};

export default CodeOutputPanel;
