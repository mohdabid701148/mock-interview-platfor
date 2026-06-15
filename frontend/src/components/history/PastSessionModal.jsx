import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  X,
  Star,
  Award,
  MessageSquare,
  Clock3,
  Code2,
  Calendar,
  Sparkles,
  User,
  FileText,
} from "lucide-react";
import QuestionPanel from "../rooms/QuestionPanel";

const fileExtensions = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
};

const renderStarRating = (value) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          className={
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-gray-700"
          }
        />
      ))}
    </div>
  );
};

const getRecommendationBadge = (rec) => {
  switch (rec) {
    case "strong_hire":
      return {
        text: "Strong Hire",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      };
    case "hire":
      return {
        text: "Hire",
        classes: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
      };
    case "leaning_no_hire":
      return {
        text: "Leaning No Hire",
        classes: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
      };
    case "no_hire":
      return {
        text: "No Hire",
        classes: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
      };
    default:
      return {
        text: rec,
        classes: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#2a2a2a] dark:text-gray-300 dark:border-[#3a3a3a]",
      };
  }
};

const formatDateTime = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const PastSessionModal = ({ feedback, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState("code"); // 'code' | 'evaluation' | 'question'
  
  const room = feedback?.room || {};
  const codeState = room?.codeState || {};
  
  // Extract all languages that have saved code contents
  const languagesWithCode = Object.keys(codeState).filter(
    (lang) => codeState[lang] && codeState[lang].trim() !== ""
  );

  // Default to the room language or the first available language with code
  const [selectedLanguage, setSelectedLanguage] = useState(
    languagesWithCode.includes(room.language)
      ? room.language
      : languagesWithCode[0] || "javascript"
  );

  const selectedCode = codeState[selectedLanguage] || "";
  const isInterviewer = feedback.interviewer?._id?.toString() === currentUser?._id?.toString();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-[#2a2a2a] dark:bg-[#121212] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#181818]/50">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-[#2a2a2a] dark:text-gray-300">
                Code: {room.roomCode}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${
                  getRecommendationBadge(feedback.recommendation).classes
                }`}
              >
                {getRecommendationBadge(feedback.recommendation).text}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-[#2a2a2a] dark:text-gray-300">
                You were: {isInterviewer ? "Interviewer" : "Interviewee"}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {room.title || "Mock Interview"}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
              <Calendar size={13} />
              Session date: {formatDateTime(room.completedAt || room.updatedAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-[#2a2a2a] dark:text-gray-400 dark:hover:bg-[#262626] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-6 dark:border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition cursor-pointer ${
              activeTab === "code"
                ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Code2 size={16} />
            Code Review
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition cursor-pointer ${
              activeTab === "evaluation"
                ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Award size={16} />
            Candidate Evaluation
          </button>
          {room?.attachedQuestion && (
            <button
              onClick={() => setActiveTab("question")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition cursor-pointer ${
                activeTab === "question"
                  ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <FileText size={16} />
              Interview Question
            </button>
          )}
        </div>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-slate-50 dark:bg-[#111]">
          {activeTab === "question" ? (
            <div className="mx-auto h-full max-w-4xl">
              <QuestionPanel 
                room={room} 
                isInterviewer={false} // Disable edit controls in history view
                onOpenAttachModal={() => {}} 
              />
            </div>
          ) : activeTab === "code" ? (
            <div className="flex h-full flex-col gap-4">
              {languagesWithCode.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Code2 size={40} className="text-slate-350 dark:text-gray-650" />
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                    No Code Saved
                  </h3>
                  <p className="mt-1 text-sm app-text max-w-md">
                    No collaborative code was written or persisted during this session.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                      Languages written:
                    </span>
                    {languagesWithCode.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          selectedLanguage === lang
                            ? "bg-slate-950 text-white dark:bg-white dark:text-black font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f] dark:text-gray-300 dark:hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-hidden rounded-2xl border border-slate-250 bg-slate-900 dark:border-[#2a2a2a]">
                    <Editor
                      height="100%"
                      language={selectedLanguage}
                      value={selectedCode}
                      theme="vs-dark"
                      path={`past-${room.roomCode}-${selectedLanguage}.${fileExtensions[selectedLanguage] || "txt"}`}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 4,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 max-h-full">
              {/* Left Side: Numeric ratings */}
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Performance Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "codingSkills", label: "Coding Skills" },
                    { key: "problemSolving", label: "Problem Solving" },
                    { key: "communication", label: "Communication" },
                    { key: "dsaKnowledge", label: "DSA Knowledge" },
                    { key: "codeQuality", label: "Code Quality" },
                    { key: "debugging", label: "Debugging" },
                    { key: "speed", label: "Speed / Pacing" },
                    { key: "overallRating", label: "Overall Rating" },
                  ].map((dim) => (
                    <div
                      key={dim.key}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 dark:bg-[#181818] border border-slate-100 dark:border-[#2a2a2a]/20"
                    >
                      <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                        {dim.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {renderStarRating(feedback.scores?.[dim.key])}
                        <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                          ({feedback.scores?.[dim.key]}/5)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Written review */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <MessageSquare size={18} className="text-slate-400" />
                    Overall Feedback
                  </h3>
                  <div className="rounded-2xl bg-slate-50 p-5 dark:bg-[#181818] border border-slate-100 dark:border-[#2a2a2a]/20 text-sm leading-relaxed text-slate-700 dark:text-gray-300 whitespace-pre-line">
                    {feedback.comments?.generalFeedback}
                  </div>
                </div>

                {feedback.comments?.technicalComments && (
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-gray-200 mb-2 text-sm">
                      Technical Notes
                    </h4>
                    <div className="rounded-2xl bg-slate-50/50 p-4 dark:bg-[#181818]/50 text-sm leading-relaxed text-slate-600 dark:text-gray-400 whitespace-pre-line border border-slate-100/50 dark:border-[#2a2a2a]/10">
                      {feedback.comments.technicalComments}
                    </div>
                  </div>
                )}

                {feedback.comments?.behavioralComments && (
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-gray-200 mb-2 text-sm">
                      Behavioral Notes
                    </h4>
                    <div className="rounded-2xl bg-slate-50/50 p-4 dark:bg-[#181818]/50 text-sm leading-relaxed text-slate-600 dark:text-gray-400 whitespace-pre-line border border-slate-100/50 dark:border-[#2a2a2a]/10">
                      {feedback.comments.behavioralComments}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6 dark:border-[#2a2a2a] grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bold">
                        Interviewer
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        @{feedback.interviewer?.username || "interviewer"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bold">
                        Interviewee
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        @{feedback.interviewee?.username || "candidate"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastSessionModal;
