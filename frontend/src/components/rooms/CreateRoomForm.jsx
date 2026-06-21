import { useState } from "react";
import { Video, Code2 } from "lucide-react";

const CreateRoomForm = ({ onCreate, loading = false }) => {
  const [form, setForm] = useState({
    title: "",
    language: "javascript",
    meetingLink: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onCreate({
      title: form.title.trim(),
      language: form.language,
      meetingLink: form.meetingLink.trim(),
    });

    setForm({
      title: "",
      language: "javascript",
      meetingLink: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
          Interview Title
        </label>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="DSA mock interview with arrays and strings"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-white dark:placeholder:text-gray-500"
          required
        />

        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          This session will have one interviewer and one interviewee.
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <Code2 size={15} />
          Primary Language
        </label>

        <select
          name="language"
          value={form.language}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <Video size={15} />
          Meeting Link
        </label>

        <input
          type="url"
          name="meetingLink"
          value={form.meetingLink}
          onChange={handleChange}
          placeholder="https://meet.google.com/..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-white dark:placeholder:text-gray-500"
        />

        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Optional. Add Google Meet, Zoom, Discord, or Jitsi link for voice/video discussion.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
        You will become the interviewer. The next user who joins with the session code becomes the interviewee.
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {loading ? "Creating..." : "Create Interview Session"}
      </button>
    </form>
  );
};

export default CreateRoomForm;