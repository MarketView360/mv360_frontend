"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-700 dark:text-slate-300">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-brand text-white text-sm"
      >
        Try again
      </button>
    </div>
  );
}