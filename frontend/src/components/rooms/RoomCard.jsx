import { Link } from "react-router-dom";
import { Users, Globe, ArrowUpRight } from "lucide-react";

const RoomCard = ({ room }) => {
  const count = room?.participants?.length || 0;
  const status = room?.status || "active";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Globe size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {room.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Code: <span className="font-medium text-slate-700">{room.roomCode}</span>
              </p>
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            status === "completed"
              ? "bg-slate-100 text-slate-600"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Language
          </p>
          <h4 className="mt-2 font-semibold text-slate-800">{room.language}</h4>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={16} />
            <p className="text-xs font-medium uppercase tracking-wide">
              Participants
            </p>
          </div>
          <h4 className="mt-2 font-semibold text-slate-800">
            {count}/{room.maxParticipants}
          </h4>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-500">Interview Room</p>

        <Link
          to={`/rooms/${room.roomCode}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Open Room
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;