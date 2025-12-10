"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Card className="w-full overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900 transition-colors duration-300">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-800 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex flex-row items-center justify-between space-y-0 transition-colors duration-300">
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {(Object.keys(TAB_NAMES) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab
                  ? "bg-white dark:bg-slate-900 text-brand shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-600/50"
              )}
            >
              {TAB_NAMES[tab]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left dark:text-slate-300">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 font-medium w-[200px] shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(30,41,59,1)] transition-colors duration-300"
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-300">
            {activeData.rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group"
              >
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(15,23,42,1)] group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/80 transition-colors duration-300">
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
      </CardContent>
    </Card>
  );
}
