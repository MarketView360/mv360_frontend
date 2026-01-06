import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold tracking-tighter text-brand/20 dark:text-brand/10">
            404
          </h1>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Page not found
          </h2>
          <p className="mx-auto max-w-[600px] text-slate-500 dark:text-slate-400 md:text-xl/relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Link href="/">
            <Button size="lg" className="bg-brand hover:bg-brand/90 text-white min-w-40 shadow-sm">
              Go Home
            </Button>
          </Link>
          <Link href="/market">
            <Button size="lg" variant="outline" className="border-2 border-slate-300 dark:border-slate-600 hover:border-brand hover:bg-brand/5 dark:hover:border-brand dark:hover:bg-brand/10 text-slate-900 dark:text-white min-w-40 shadow-sm">
              View Markets
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
}
