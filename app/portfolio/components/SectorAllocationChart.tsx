"use client";

import { usePortfolio } from "@/providers/PortfolioProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Healthcare: "#10b981",
  Financials: "#f59e0b",
  "Consumer Discretionary": "#ef4444",
  "Consumer Staples": "#8b5cf6",
  Energy: "#f97316",
  Industrials: "#6366f1",
  Materials: "#14b8a6",
  Utilities: "#84cc16",
  "Real Estate": "#ec4899",
  "Communication Services": "#06b6d4",
  Unknown: "#94a3b8",
};

function getColorForSector(sector: string): string {
  return SECTOR_COLORS[sector] || SECTOR_COLORS.Unknown;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function SectorAllocationChart() {
  const { sectors } = usePortfolio();

  if (sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Sector Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">No sector data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sector allocation will appear once holdings are synced
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for pie chart
  const total = sectors.reduce((sum, s) => sum + s.marketValue, 0);

  // Generate pie chart segments
  let currentAngle = 0;
  const segments = sectors.map((sector) => {
    const angle = (sector.marketValue / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...sector,
      startAngle,
      endAngle: currentAngle,
      color: getColorForSector(sector.sector),
    };
  });

  // Convert angle to SVG arc path
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z",
    ].join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Sector Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {segments.map((segment, i) => (
                <path
                  key={i}
                  d={describeArc(50, 50, 45, segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
              {/* Center hole for donut effect */}
              <circle cx="50" cy="50" r="25" fill="var(--background)" />
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {segments.slice(0, 6).map((segment) => (
              <div key={segment.sector} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm truncate max-w-[120px]">{segment.sector}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{segment.weight.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            {segments.length > 6 && (
              <div className="text-xs text-muted-foreground">
                +{segments.length - 6} more sectors
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
