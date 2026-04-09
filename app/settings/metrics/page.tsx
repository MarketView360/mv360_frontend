"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to appearance page - metrics settings are now part of appearance
export default function MetricsSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/appearance");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">Redirecting to Appearance settings...</p>
    </div>
  );
}
