"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export interface FinancialRow {
  name: string;
  values: string[];
  isGrowth?: boolean;
}

export interface FinancialData {
  columns: string[];
  rows: FinancialRow[];
}

interface FinancialTableProps {
  data: {
    pnl: FinancialData;
    balanceSheet: FinancialData;
    cashFlows: FinancialData;
  };
}

type Tab = "pnl" | "balanceSheet" | "cashFlows";

const TAB_NAMES: Record<Tab, string> = {
  pnl: "Profit & Loss",
  balanceSheet: "Balance Sheet",
  cashFlows: "Cash Flows",
};

export function FinancialTable({ data }: FinancialTableProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>("pnl");
  const activeData = data[activeTab];

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Tab)}
        >
          <TabsList className="h-8">
            {(Object.keys(TAB_NAMES) as Tab[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xs px-3 h-6"
              >
                {TAB_NAMES[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th
                scope="col"
                className="table-sticky-col px-4 py-3 font-medium w-[200px] bg-muted/50"
              >
                Metric
              </th>
              {activeData.columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-4 py-3 font-medium text-right min-w-[100px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeData.rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-muted/50 transition-colors group"
              >
                <td className="table-sticky-col px-4 py-2.5 font-medium group-hover:bg-muted/50">
                  {row.name}
                </td>
                {row.values.map((val, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-4 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400",
                      row.isGrowth &&
                        parseFloat(val.replace(/,/g, "")) > 0 &&
                        "text-growth dark:text-green-400 font-medium",
                      row.isGrowth &&
                        parseFloat(val.replace(/,/g, "")) < 0 &&
                        "text-danger dark:text-red-400 font-medium"
                    )}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </CardContent>
    </Card>
  );
}
