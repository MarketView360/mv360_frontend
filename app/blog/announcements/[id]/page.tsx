import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Megaphone } from "lucide-react";
import { getAnnouncementById } from "@/lib/announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnnouncementPage({ params }: PageProps) {
  const { id } = await params;
  const announcementId = parseInt(id, 10);

  if (isNaN(announcementId)) {
    notFound();
  }

  const announcement = await getAnnouncementById(announcementId);

  if (!announcement) {
    notFound();
  }

  const formattedDate = new Date(announcement.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Announcement
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
            {announcement.isActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900">
                Active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{announcement.text || "Announcement"}</CardTitle>
          </CardHeader>
          <CardContent>
            {announcement.Description ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {announcement.Description}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">
                No additional details provided.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Back button at bottom */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="default" className="bg-brand hover:bg-brand/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
