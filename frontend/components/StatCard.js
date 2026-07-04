export default function StatCard({ label, value, accent = "teal" }) {
  const accents = {
    teal: "text-teal-600 bg-teal-50 dark:bg-teal-500/10",
    navy: "text-ink bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-3 inline-flex items-baseline text-3xl font-extrabold px-2 py-0.5 -mx-2 rounded-lg ${accents[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
