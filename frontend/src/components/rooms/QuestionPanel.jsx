import { FileText, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const QuestionPanel = ({ room, isInterviewer, onOpenAttachModal }) => {
  const attachedQuestion = room?.attachedQuestion;

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

  if (!attachedQuestion || (!attachedQuestion.title && !attachedQuestion.url && !attachedQuestion.description)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-[#1a1a1a] border border-slate-100 dark:border-[#2a2a2a]">
        <div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-500/10">
          <HelpCircle size={32} className="text-blue-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">
          No Question Attached
        </h3>
        
        {isInterviewer ? (
          <>
            <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-gray-400">
              Attach a question from LeetCode, Codeforces, or provide a custom problem to start the interview.
            </p>
            <button
              onClick={onOpenAttachModal}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              <FileText size={18} />
              Attach Question
            </button>
          </>
        ) : (
          <p className="max-w-sm text-sm text-slate-500 dark:text-gray-400">
            Waiting for the interviewer to attach a problem statement...
          </p>
        )}
      </div>
    );
  }

  const sourceInfo = getSourceDisplay(attachedQuestion.source);

  return (
    <div className="flex h-full w-full flex-col rounded-3xl bg-white shadow-sm dark:bg-[#1a1a1a] border border-slate-100 dark:border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-[#2a2a2a] shrink-0">
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {attachedQuestion.description ? (
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 
            prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md dark:prose-code:bg-[#2a2a2a]
            prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:bg-[#111] dark:prose-pre:border-[#333]">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {attachedQuestion.description}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <ShieldCheck size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-[200px]">
              No description provided. Please check the original link above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
