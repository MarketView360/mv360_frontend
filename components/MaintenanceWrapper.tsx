"use client";

import { useEffect, useState } from "react";
import { checkMaintenanceStatus, shouldShowMaintenanceBanner, type MaintenanceStatus } from "@/lib/maintenance";
import { getActiveAnnouncements, type Announcement } from "@/lib/announcements";
import { MaintenancePage } from "./MaintenancePage";
import { MaintenanceBanner } from "./MaintenanceBanner";
import { AnnouncementsBanner } from "./AnnouncementsBanner";

// Simple, reliable wrapper: always fetch fresh status on mount,
// then re-check on a short interval. No localStorage caching.
export function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<MaintenanceStatus | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      try {
        // Fetch both maintenance and announcement data
        const [maintenanceData, announcementData] = await Promise.all([
          checkMaintenanceStatus(),
          getActiveAnnouncements(),
        ]);
        
        if (isMounted) {
          setMaintenance(maintenanceData);
          setAnnouncements(announcementData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial fetch
    fetchData();

    // Keep status reasonably fresh without aggressive polling
    intervalId = setInterval(fetchData, 60000); // 60s

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Don't block initial render - show children immediately while loading
  if (isLoading) {
    return <>{children}</>;
  }

  // If no maintenance data, continue normally
  if (!maintenance) {
    return <>{children}</>;
  }

  // Show full maintenance page if active
  if (maintenance.is_Active === true) {
    return (
      <MaintenancePage
        title={maintenance.title}
        description={maintenance.description}
        scheduledAt={maintenance.scheduled_at}
        endsAt={maintenance.ends_at}
      />
    );
  }

  // Show banner if maintenance is upcoming (within 24h) or currently in its window
  const showBanner = shouldShowMaintenanceBanner(
    maintenance.scheduled_at,
    maintenance.ends_at,
  );

  // Check if we have at least one valid announcement to display
  const activeAnnouncements = announcements.filter((a) => a.isActive && a.text);
  const showAnnouncement = activeAnnouncements.length > 0;

  return (
    <>
      {showBanner && <MaintenanceBanner maintenance={maintenance} />}
      {showAnnouncement && (
        <AnnouncementsBanner 
          announcements={activeAnnouncements.map((a) => ({
            id: a.id,
            text: a.text as string,
            isClickable: a.isClickable ?? false,
          }))}
        />
      )}
      {children}
    </>
  );
}
