export default function LoadingCompanyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      <div className="mx-auto max-w-[1600px] py-8 px-4 md:px-8 lg:px-12 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
