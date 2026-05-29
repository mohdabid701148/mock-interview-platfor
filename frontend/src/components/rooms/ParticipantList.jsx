const ParticipantList = ({ participants = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-900">Participants</h3>
        <p className="mt-1 text-sm text-slate-500">People currently in this room</p>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No participants yet.
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {p.username || "Unknown User"}
                </p>
                <p className="mt-1 text-sm text-slate-500">{p.email || ""}</p>
              </div>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                Member
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantList;