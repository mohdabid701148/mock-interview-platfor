import { FileText, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const getDifficultyColor = (diff) => {
  switch (diff) {
    case "Easy":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    case "Medium":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    case "Hard":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
    default:
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-[#2a2a2a] border-slate-200 dark:border-[#3a3a3a]";
  }
};

const getSourceDisplay = (source) => {
  switch (source) {
    case "leetcode":
      return { name: "LeetCode", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20" };
    case "codeforces":
      return { name: "Codeforces", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" };
    case "gfg":
      return { name: "GeeksForGeeks", color: "text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" };
    default:
      return { name: "Custom", color: "text-slate-600 bg-slate-50 dark:bg-[#2a2a2a] border-slate-200 dark:border-[#3a3a3a]" };
  }
};

/**
 * compact=true → flat mode inside InterviewWorkspace (no outer card border/bg)
 * compact=false (default) → standalone card mode
 */
const QuestionPanel = ({ room, isInterviewer, onOpenAttachModal, compact = false }) => {
  const attachedQuestion = room?.attachedQuestion;

  const isEmpty =
    !attachedQuestion ||
    (!attachedQuestion.title && !attachedQuestion.url && !attachedQuestion.description);

  const outerClass = compact
    ? "flex h-full w-full flex-col overflow-hidden"
    : "flex h-full w-full flex-col rounded-3xl bg-white shadow-sm dark:bg-[#1a1a1a] border border-slate-100 dark:border-[#2a2a2a] overflow-hidden";

  if (isEmpty) {
    return (
      <div className={`${outerClass} items-center justify-center p-8 text-center`}>
        <div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-500/10">
          <HelpCircle size={32} className="text-blue-500" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
          No Question Attached
        </h3>
        {isInterviewer ? (
          <>
            <p className="mb-5 max-w-xs text-sm text-slate-500 dark:text-gray-400">
              Attach a problem to start the interview. It syncs instantly to the interviewee.
            </p>
            <button
              onClick={onOpenAttachModal}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95"
            >
              <FileText size={16} />
              Attach Question
            </button>
          </>
        ) : (
          <p className="max-w-xs text-sm text-slate-500 dark:text-gray-400">
            Waiting for the interviewer to attach a problem statement…
          </p>
        )}
      </div>
    );
  }

  const sourceInfo = getSourceDisplay(attachedQuestion.source);

  const headerClass = compact
    ? "flex flex-col gap-2 border-b border-[#2a2a2a] p-4 shrink-0"
    : "flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-[#2a2a2a] shrink-0";

  return (
    <div className={outerClass}>
      {/* Header */}
      {!compact && (
        <div className={headerClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 pr-4">
              {attachedQuestion.title || "Interview Question"}
            </h2>
            {isInterviewer && (
              <button
                onClick={onOpenAttachModal}
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
              >
                Edit
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {attachedQuestion.difficulty && attachedQuestion.difficulty !== "N/A" && (
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getDifficultyColor(attachedQuestion.difficulty)}`}>
                {attachedQuestion.difficulty}
              </span>
            )}
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${sourceInfo.color}`}>
              {sourceInfo.name}
            </span>
            {attachedQuestion.url && (
              <a
                href={attachedQuestion.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-gray-300 dark:hover:bg-[#333]"
              >
                <ExternalLink size={12} />
                Open Original
              </a>
            )}
          </div>
        </div>
      )}

      {/* Compact header (inside workspace — title shown inline) */}
      {compact && (
        <div className={headerClass}>
          <div className="flex items-start gap-3">
            <h2 className="flex-1 text-base font-bold text-white leading-snug">
              {attachedQuestion.title || "Interview Question"}
            </h2>
            {attachedQuestion.url && (
              <a
                href={attachedQuestion.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-slate-500 hover:text-slate-300 transition mt-0.5"
                title="Open original problem"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {attachedQuestion.difficulty && attachedQuestion.difficulty !== "N/A" && (
              <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getDifficultyColor(attachedQuestion.difficulty)}`}>
                {attachedQuestion.difficulty}
              </span>
            )}
            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${sourceInfo.color}`}>
              {sourceInfo.name}
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {attachedQuestion.description ? (
          <div className={`prose prose-sm max-w-none px-4 py-3 ${
            compact
              ? [
                  "prose-invert",
                  "prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:leading-snug prose-headings:tracking-tight",
                  "prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-2",
                  "prose-strong:text-slate-100 prose-strong:font-semibold",
                  "prose-em:text-slate-300 prose-em:italic",
                  "prose-a:text-amber-400 prose-a:no-underline prose-a:font-normal hover:prose-a:text-amber-300",
                  "prose-ul:my-2 prose-ol:my-2",
                  "prose-li:text-slate-300 prose-li:my-0.5",
                  "prose-blockquote:border-l-[#3a3a3a] prose-blockquote:text-slate-400 prose-blockquote:not-italic",
                  "prose-code:text-emerald-300 prose-code:bg-[#1f1f1f] prose-code:px-[0.35em] prose-code:py-[0.1em] prose-code:rounded prose-code:text-[0.82em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
                  "prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-[#252525] prose-pre:rounded-lg prose-pre:my-3",
                  "prose-hr:border-[#252525] prose-hr:my-4",
                ].join(" ")
              : [
                  "prose-slate dark:prose-invert",
                  "prose-headings:font-bold",
                  "prose-a:text-blue-600 dark:prose-a:text-amber-400 prose-a:no-underline",
                  "prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded dark:prose-code:bg-[#1f1f1f] dark:prose-code:text-emerald-300 prose-code:before:content-none prose-code:after:content-none",
                  "prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:bg-[#0d0d0d] dark:prose-pre:border-[#252525]",
                ].join(" ")
          }`}>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {attachedQuestion.description}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 opacity-50">
            <ShieldCheck size={36} className={`mb-3 ${compact ? "text-slate-600" : "text-slate-300 dark:text-slate-600"}`} />
            <p className={`text-sm leading-relaxed ${compact ? "text-slate-500" : "text-slate-500 dark:text-gray-400"}`}>
              No description provided.{attachedQuestion.url ? " Check the original link above." : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
