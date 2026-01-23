import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Coming Soon | MarketView360",
  description: "This feature is coming soon to MarketView360",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-6">
          <Clock className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We&apos;re working hard to bring you this feature. Stay tuned for updates!
        </p>
        <Button asChild>
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
