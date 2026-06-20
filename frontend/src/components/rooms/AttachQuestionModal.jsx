import { useState } from "react";
import { X, Link as LinkIcon, FileText } from "lucide-react";

const EXAMPLE_LIMIT = 2;

const AttachQuestionModal = ({ isOpen, onClose, onAttach }) => {
  const [source, setSource] = useState("leetcode");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState([
    { input: "", output: "" },
    { input: "", output: "" },
  ]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const updateExample = (index, field, value) => {
    setExamples((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

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

    const filteredExamples = examples.filter((ex) => ex.input.trim());

    onAttach({
      source: source === "custom" ? null : source,
      title: title.trim(),
      difficulty,
      url: source === "custom" ? "" : url.trim(),
      description: description.trim(),
      examples: filteredExamples,
    });

    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#333] dark:bg-[#111] dark:text-white dark:focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-[#1a1a1a] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-[#2a2a2a]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Attach Interview Question
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
              Syncs instantly to the interviewee's screen. Example test cases
              auto-populate their editor.
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

          <form id="attach-question-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Source + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Source
                </label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
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
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Question Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className={inputClass}
              />
            </div>

            {/* URL */}
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
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-gray-300">
                <span>Description (Markdown Supported)</span>
                <span className="text-xs font-normal text-slate-500">Optional</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Paste the problem description, constraints, and examples here..."
                className={`${inputClass} font-mono`}
              />
            </div>

            {/* Example Test Cases */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Example Test Cases
                </label>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">
                  These auto-populate the test case panel in the editor (up to {EXAMPLE_LIMIT}).
                </p>
              </div>

              {examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#111] p-4 space-y-3"
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                    Example {i + 1}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1">
                        Input
                      </label>
                      <textarea
                        rows={2}
                        value={ex.input}
                        onChange={(e) => updateExample(i, "input", e.target.value)}
                        placeholder={`e.g. nums = [2,7,11,15], target = 9`}
                        className="w-full rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] p-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-gray-500 block mb-1">
                        Expected Output
                      </label>
                      <textarea
                        rows={2}
                        value={ex.output}
                        onChange={(e) => updateExample(i, "output", e.target.value)}
                        placeholder={`e.g. [0,1]`}
                        className="w-full rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] p-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
