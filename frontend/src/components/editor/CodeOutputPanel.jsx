import { CheckCircle2, AlertTriangle, AlertCircle, Clock, PlayCircle } from "lucide-react";

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, label: "Success", color: "text-emerald-400" },
  compile_error: { icon: AlertTriangle, label: "Compilation Error", color: "text-amber-400" },
  runtime_error: { icon: AlertCircle, label: "Runtime Error", color: "text-red-400" },
  timeout: { icon: Clock, label: "Time Limit Exceeded", color: "text-rose-400" },
  default: { icon: PlayCircle, label: "Output", color: "text-slate-400" },
};

const CodeOutputPanel = ({ stdin, setStdin, loading, result }) => {
  const config = STATUS_CONFIG[result?.type] ?? STATUS_CONFIG.default;
  const Icon = config.icon;

  const outputColor =
    result?.type === "success" ? "text-slate-300" : "text-red-400";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1e1e1e] text-sm">
      <div className="flex gap-0 h-full overflow-hidden">
        {/* Left: stdin input */}
        <div className="flex flex-col p-3 w-2/5 border-r border-[#2a2a2a] shrink-0">
          <label className="text-xs text-slate-500 mb-1">Standard Input (stdin)</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter input for your program..."
            className="flex-1 w-full bg-[#141414] text-slate-300 text-xs font-mono rounded p-2 resize-none border border-[#333] focus:outline-none focus:border-slate-500 custom-scrollbar"
          />
        </div>

        {/* Right: output */}
        <div className="flex flex-col flex-1 overflow-hidden p-3">
          <div className="flex items-center gap-2 mb-2">
            {loading ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            ) : (
              <Icon size={14} className={config.color} />
            )}
            <span className={`text-xs font-semibold ${loading ? "text-slate-400" : config.color}`}>
              {loading ? "Executing..." : config.label}
            </span>
            {result?.executionTimeMs > 0 && !loading && (
              <span className="ml-auto text-xs text-slate-600 border border-[#333] px-1.5 py-0.5 rounded bg-[#222]">
                {result.executionTimeMs}ms
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs">
            {loading ? (
              <span className="text-slate-500 italic">Running code, please wait...</span>
            ) : !result ? (
              <span className="text-slate-600 italic">Click Run to execute your code.</span>
            ) : (
              <pre className={`whitespace-pre-wrap wrap-break-word leading-relaxed ${outputColor}`}>
                {result.output || "Program finished with no output."}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOutputPanel;
