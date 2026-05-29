import { useState } from "react";

const JoinRoomForm = ({ onJoin, loading = false }) => {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onJoin(roomCode);
    setRoomCode("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Room Code
        </label>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase tracking-wider text-slate-900 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>
    </form>
  );
};

export default JoinRoomForm;