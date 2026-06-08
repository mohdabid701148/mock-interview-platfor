import { CalendarClock, Clock3, FileText } from "lucide-react";

const statusStyles = {
  scheduled:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelled:
    "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  missed:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const getScheduleTime = (schedule) => {
  return schedule?.scheduledAt || schedule?.scheduledTime;
};

const getDuration = (schedule) => {
  return schedule?.durationMinutes || schedule?.duration || 0;
};

const formatDateHeader = (value) => {
  if (!isValidDate(value)) return "Invalid date";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!isValidDate(value)) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    timeStyle: "short",
  }).format(new Date(value));
};

const getEndTime = (scheduledAt, durationMinutes = 0) => {
  if (!isValidDate(scheduledAt)) return null;

  return new Date(
    new Date(scheduledAt).getTime() + Number(durationMinutes) * 60 * 1000
  );
};

const getRoom = (schedule) => {
  return schedule?.room || schedule?.roomId || {};
};

const getName = (user) => {
  return (
    user?.fullName ||
    user?.username ||
    user?.name ||
    user?.email ||
    "Not assigned"
  );
};

const groupSchedulesByDate = (schedules) => {
  return schedules.reduce((acc, item) => {
    const scheduledAt = getScheduleTime(item);

    if (!isValidDate(scheduledAt)) return acc;

    const key = new Date(scheduledAt).toDateString();

    if (!acc[key]) acc[key] = [];

    acc[key].push(item);

    return acc;
  }, {});
};

const InterviewCalendar = ({ schedules = [] }) => {
  const grouped = groupSchedulesByDate(schedules);

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  if (!sortedDates.length) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
        <div className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm dark:bg-[#171717] dark:text-gray-500">
          <CalendarClock size={34} />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No timeline yet
        </h3>

        <p className="mt-2 max-w-sm text-sm app-text">
          Scheduled interviews will appear here grouped by date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="relative pl-6">
          <div className="absolute left-2 top-2 h-full w-px bg-slate-200 dark:bg-[#2a2a2a]" />

          <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
            {formatDateHeader(dateKey)}
          </div>

          <div className="space-y-3">
            {grouped[dateKey]
              .sort(
                (a, b) =>
                  new Date(getScheduleTime(a)) - new Date(getScheduleTime(b))
              )
              .map((item) => {
                const room = getRoom(item);
                const scheduledAt = getScheduleTime(item);
                const durationMinutes = getDuration(item);
                const start = formatTime(scheduledAt);
                const end = formatTime(
                  getEndTime(scheduledAt, durationMinutes)
                );
                const status = item?.status || "scheduled";

                return (
                  <div
                    key={item?._id || item?.id}
                    className="app-panel relative rounded-2xl p-4"
                  >
                    <div className="absolute -left-[18px] top-5 h-3 w-3 rounded-full border border-slate-300 bg-white dark:border-[#3a3a3a] dark:bg-[#171717]" />

                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                          {room?.title || "Untitled Session"}
                        </h3>

                        <p className="mt-1 text-sm app-text">
                          {getName(item?.interviewer)} → {getName(item?.interviewee)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm app-text">
                        <Clock3 size={15} />
                        <span>
                          {start} - {end}
                        </span>
                      </div>
                    </div>

                    {item?.agenda && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm app-text dark:bg-[#171717]">
                        <FileText size={15} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.agenda}</span>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 dark:bg-[#171717] dark:text-gray-300">
                        {durationMinutes} min
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 font-medium capitalize ${
                          statusStyles[status] ||
                          "bg-white text-slate-700 dark:bg-[#171717] dark:text-gray-300"
                        }`}
                      >
                        {status}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 dark:bg-[#171717] dark:text-gray-300">
                        {room?.roomCode || "N/A"}
                      </span>

                      {room?.language && (
                        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 dark:bg-[#171717] dark:text-gray-300">
                          {room.language}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InterviewCalendar;