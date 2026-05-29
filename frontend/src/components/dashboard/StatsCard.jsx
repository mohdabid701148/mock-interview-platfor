const StatsCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-4xl font-semibold text-slate-900">{value}</h3>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        {Icon ? (
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatsCard;