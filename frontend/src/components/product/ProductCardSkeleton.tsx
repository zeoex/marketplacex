export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[10px] overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700" />
      <div className="p-3 space-y-2.5">
        <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded-lg w-4/5" />
        <div className="h-3   bg-slate-100 dark:bg-slate-700 rounded-lg w-3/5" />
        <div className="h-5   bg-slate-100 dark:bg-slate-700 rounded-lg w-2/5 mt-1" />
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}
