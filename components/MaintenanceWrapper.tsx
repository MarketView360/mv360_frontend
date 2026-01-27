"use client";

import { useEffect, useState } from "react";
import { checkMaintenanceStatus, shouldShowMaintenanceBanner, type MaintenanceStatus } from "@/lib/maintenance";
import { MaintenancePage } from "./MaintenancePage";
import { MaintenanceBanner } from "./MaintenanceBanner";

// Simple, reliable wrapper: always fetch fresh status on mount,
// then re-check on a short interval. No localStorage caching.
export function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<MaintenanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchMaintenance() {
      try {
        const data = await checkMaintenanceStatus();
        if (isMounted) {
          setMaintenance(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to check maintenance:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial fetch
    fetchMaintenance();

    // Optional: keep status reasonably fresh without aggressive polling
    intervalId = setInterval(fetchMaintenance, 60000); // 60s

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

  return (
    <>
      {showBanner && <MaintenanceBanner maintenance={maintenance} />}
      {children}
    </>
  );
}
