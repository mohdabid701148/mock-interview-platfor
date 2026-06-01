const StatsCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="app-card rounded-3xl p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium app-text">{title}</p>

          <h3 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>

          {subtitle ? (
            <p className="mt-2 text-sm app-muted">{subtitle}</p>
          ) : null}
        </div>

        {Icon ? (
          <div className="shrink-0 rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatsCard;