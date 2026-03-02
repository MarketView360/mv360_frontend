"use client";

import { useEffect, useState } from "react";
import { getActiveAnnouncements, type Announcement } from "@/lib/announcements";
import { AnnouncementsBanner } from "./AnnouncementsBanner";

/**
 * Wrapper component that fetches and displays active announcements
 * Similar to MaintenanceWrapper pattern
 */
export function AnnouncementsWrapper({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchAnnouncement() {
      try {
        const data = await getActiveAnnouncements();
        if (isMounted) {
          setAnnouncements(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial fetch
    fetchAnnouncement();

    // Refresh announcements every 2 minutes to keep them current
    intervalId = setInterval(fetchAnnouncement, 120000); // 120s

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Don't block initial render
  if (isLoading) {
    return <>{children}</>;
  }

  // No announcements
  const active = announcements.filter((a) => a.isActive && a.text);
  if (active.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementsBanner 
        announcements={active.map((a) => ({
          id: a.id,
          text: a.text as string,
          isClickable: a.isClickable ?? false,
        }))}
      />
      {children}
    </>
  );
}
