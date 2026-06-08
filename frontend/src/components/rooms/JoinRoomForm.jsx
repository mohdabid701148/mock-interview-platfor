import { useState } from "react";
import { Hash, UserCheck } from "lucide-react";

const JoinRoomForm = ({ onJoin, loading = false }) => {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanCode) {
      return;
    }

    await onJoin(cleanCode);

    setRoomCode("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <Hash size={15} />
          Session Code
        </label>

        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Enter session code"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase tracking-wider text-slate-900 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400 dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-white dark:placeholder:text-gray-500"
          required
        />

        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Join using the code shared by the interviewer.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        When you join, you become the interviewee for this session.
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-300 dark:hover:bg-[#262626]"
      >
        <UserCheck size={16} />
        {loading ? "Joining..." : "Join as Interviewee"}
      </button>
    </form>
  );
};

export default JoinRoomForm;