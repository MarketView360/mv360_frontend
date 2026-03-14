"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle2,
  Clock, RefreshCw, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Status = "loading" | "operational" | "degraded" | "outage" | "timeout";

const STATUS_CONFIG: Record<Status, {
  icon: React.ElementType;
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  iconClass: string;
}> = {
  loading:     { icon: Clock,          label: "Checking…",               badgeVariant: "secondary",    iconClass: "text-muted-foreground" },
  operational: { icon: CheckCircle2,   label: "All systems operational", badgeVariant: "default",      iconClass: "text-green-500" },
  degraded:    { icon: AlertTriangle,  label: "Degraded performance",    badgeVariant: "secondary",    iconClass: "text-amber-500" },
  outage:      { icon: AlertCircle,    label: "Service outage",          badgeVariant: "destructive",  iconClass: "text-red-500" },
  timeout:     { icon: AlertCircle,    label: "Status check timed out",  badgeVariant: "outline",      iconClass: "text-muted-foreground" },
};

const SERVICES = [
  "Market Data API",
  "AI Assistant (Jovan)",
  "Authentication",
  "Stock Screener",
  "News Feed",
  "Real-time Quotes",
];

export default function StatusPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = async () => {
    setStatus("loading");
    try {
      const result = await Promise.race([
        fetch("/api/status").then(r => r.json()),
        new Promise<never>((_, rej) => setTimeout(() => rej("timeout"), 8000)),
      ]);
      setStatus(result.status ?? "operational");
    } catch {
      setStatus("timeout");
    }
    setLastChecked(new Date());
  };

  useEffect(() => { check(); }, []);

  const { icon: Icon, label, badgeVariant, iconClass } = STATUS_CONFIG[status];

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        System Status
      </h1>

      {/* Overall status card */}
      <Card className="shadow-none mb-6">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <Skeleton className="h-5 w-5 rounded-full" />
            ) : (
              <Icon size={20} strokeWidth={1.75} className={iconClass} aria-hidden="true" />
            )}
            {status === "loading" ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <span className="text-sm font-medium">{label}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {status !== "loading" && (
              <Badge variant={badgeVariant}>{label}</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={check}
              aria-label="Refresh status"
            >
              <RefreshCw
                size={14}
                strokeWidth={1.75}
                className={status === "loading" ? "animate-spin" : ""}
                aria-hidden="true"
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Per-service rows */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Services
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {SERVICES.map((service, i) => (
            <div key={service}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{service}</span>
                {status === "loading" ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <Badge
                    variant={status === "operational" ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {status === "operational" ? "Operational" : "Disrupted"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {lastChecked && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Last checked at {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </main>
  );
}
