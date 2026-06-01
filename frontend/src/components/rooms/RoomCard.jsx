import { Link } from "react-router-dom";
import { Users, Globe, ArrowUpRight } from "lucide-react";

const statusStyles = {
  completed:
    "bg-slate-100 text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-300",
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  waiting:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  ongoing:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
};

const RoomCard = ({ room }) => {
  const count = room?.participants?.length || 0;
  const maxParticipants = room?.maxParticipants || 0;
  const status = room?.status || "active";

  return (
    <div className="app-card rounded-3xl p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
              <Globe size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                {room?.title || "Untitled Room"}
              </h3>

              <p className="mt-1 text-sm app-text">
                Code:{" "}
                <span className="font-medium text-slate-700 dark:text-gray-200">
                  {room?.roomCode || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${
            statusStyles[status] ||
            "bg-slate-100 text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="app-panel rounded-2xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide app-muted">
            Language
          </p>

          <h4 className="mt-2 truncate font-semibold text-slate-800 dark:text-white">
            {room?.language || "Not set"}
          </h4>
        </div>

        <div className="app-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 app-muted">
            <Users size={16} />

            <p className="text-xs font-medium uppercase tracking-wide">
              Participants
            </p>
          </div>

          <h4 className="mt-2 font-semibold text-slate-800 dark:text-white">
            {count}/{maxParticipants}
          </h4>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-[#2a2a2a]">
        <p className="text-sm app-text">Interview Room</p>

        <Link
          to={`/rooms/${room?.roomCode}`}
          className="app-btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition"
        >
          Open Room
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;