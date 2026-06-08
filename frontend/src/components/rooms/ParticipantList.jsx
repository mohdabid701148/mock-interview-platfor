import { Mail, UserRound, Users } from "lucide-react";

const getParticipantUser = (participant) => {
  return participant?.user || participant;
};

const getParticipantName = (participant) => {
  const user = getParticipantUser(participant);

  return (
    user?.fullName ||
    user?.username ||
    user?.name ||
    participant?.username ||
    participant?.name ||
    "Unknown User"
  );
};

const getParticipantEmail = (participant) => {
  const user = getParticipantUser(participant);

  return user?.email || participant?.email || "";
};

const getParticipantRole = (participant) => {
  return participant?.role || "member";
};

const getRoleClasses = (role) => {
  if (role === "interviewer") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  }

  if (role === "interviewee") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  return "bg-slate-200 text-slate-700 dark:bg-[#2a2a2a] dark:text-gray-300";
};

const ParticipantList = ({ participants = [] }) => {
  return (
    <div className="app-card rounded-3xl p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Participants
          </h3>

          <p className="mt-1 text-sm app-text">
            Interview roles and room members
          </p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
          <Users size={20} />
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
          <div className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm dark:bg-[#171717] dark:text-gray-500">
            <UserRound size={28} />
          </div>

          <h4 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            No participants yet
          </h4>

          <p className="mt-2 text-sm app-text">
            Share the room code to invite an interviewee.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant, index) => {
            const user = getParticipantUser(participant);
            const name = getParticipantName(participant);
            const email = getParticipantEmail(participant);
            const role = getParticipantRole(participant);

            return (
              <div
                key={
                  participant?._id ||
                  participant?.id ||
                  user?._id ||
                  user?.id ||
                  index
                }
                className="app-panel flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm dark:bg-[#171717] dark:text-gray-200">
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {name}
                    </p>

                    {email ? (
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-sm app-text">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm app-muted">
                        Email not available
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleClasses(
                    role
                  )}`}
                >
                  {role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantList;