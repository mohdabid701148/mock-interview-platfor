import { CalendarClock, Clock, UserRound, XCircle } from "lucide-react";

const statusStyles = {
  scheduled:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  ongoing:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getRoom = (schedule) => {
  return schedule?.roomId || schedule?.room || {};
};

const getName = (user) => {
  return user?.username || user?.name || user?.email || "Not assigned";
};

const UpcomingInterviews = ({
  schedules = [],
  actionLoadingId = "",
  onStatusChange,
  onCancel,
}) => {
  if (!schedules.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
        <div className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm dark:bg-[#171717] dark:text-gray-500">
          <CalendarClock size={32} />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No upcoming interviews
        </h3>

        <p className="mt-2 max-w-sm text-sm app-text">
          Schedule a mock interview from the form above to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((item) => {
        const room = getRoom(item);
        const interviewer = item?.interviewer;
        const interviewee = item?.interviewee;
        const isFinished =
          item?.status === "cancelled" || item?.status === "completed";
        const isLoading = actionLoadingId === item?._id;

        return (
          <div
            key={item?._id}
            className="app-panel rounded-3xl p-5 transition hover:bg-slate-100 dark:hover:bg-[#262626]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {room?.title || "Untitled Room"}
                  </h3>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[item?.status] ||
                      "border-slate-200 bg-slate-50 text-slate-700 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-300"
                    }`}
                  >
                    {item?.status || "scheduled"}
                  </span>
                </div>

                <p className="mt-1 text-sm app-text">
                  Room Code:{" "}
                  <span className="font-medium text-slate-800 dark:text-gray-200">
                    {room?.roomCode || "N/A"}
                  </span>
                </p>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 app-muted">
                      <UserRound size={15} />
                      <span>Interviewer</span>
                    </div>

                    <p className="mt-2 font-medium text-slate-900 dark:text-white">
                      {getName(interviewer)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 app-muted">
                      <UserRound size={15} />
                      <span>Interviewee</span>
                    </div>

                    <p className="mt-2 font-medium text-slate-900 dark:text-white">
                      {getName(interviewee)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 app-muted">
                      <CalendarClock size={15} />
                      <span>Time</span>
                    </div>

                    <p className="mt-2 font-medium text-slate-900 dark:text-white">
                      {formatDateTime(item?.scheduledTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 app-muted">
                      <Clock size={15} />
                      <span>Duration</span>
                    </div>

                    <p className="mt-2 font-medium text-slate-900 dark:text-white">
                      {item?.duration || 0} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                <select
                  value=""
                  onChange={(e) =>
                    e.target.value &&
                    onStatusChange?.(item?._id, e.target.value)
                  }
                  disabled={isFinished || isLoading}
                  className="app-input rounded-xl px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Update status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  type="button"
                  onClick={() => onCancel?.(item?._id)}
                  disabled={isFinished || isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                >
                  <XCircle size={15} />
                  {isLoading ? "Updating..." : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingInterviews;