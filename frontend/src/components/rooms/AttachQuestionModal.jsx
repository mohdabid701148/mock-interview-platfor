import { useState } from "react";
import { X, Link as LinkIcon, FileText } from "lucide-react";

const AttachQuestionModal = ({ isOpen, onClose, onAttach }) => {
  const [source, setSource] = useState("leetcode");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (source !== "custom" && !url.trim()) {
      setError("URL is required for external sources.");
      return;
    }

    onAttach({
      source: source === "custom" ? null : source,
      title: title.trim(),
      difficulty,
      url: source === "custom" ? "" : url.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-[#1a1a1a] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-[#2a2a2a]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Attach Interview Question
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
              Provide a question for the interviewee. It will sync instantly to their screen.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2a2a2a] dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form id="attach-question-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500"
                >
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="gfg">GeeksForGeeks</option>
                  <option value="custom">Custom (No Link)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Question Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500"
              />
            </div>

            {source !== "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  URL Link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LinkIcon size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-gray-300">
                <span>Description (Markdown Supported)</span>
                <span className="text-xs font-normal text-slate-500">Optional</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Paste the problem description, constraints, and examples here..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500 font-mono"
              />
              <p className="text-xs text-slate-500 dark:text-gray-500">
                You can use markdown for **bold**, *italics*, `code`, and lists.
              </p>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 dark:border-[#2a2a2a] mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-[#2a2a2a] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="attach-question-form"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FileText size={16} />
            Attach & Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachQuestionModal;
