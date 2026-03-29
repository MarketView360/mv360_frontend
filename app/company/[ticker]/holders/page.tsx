import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UsdValue } from "@/components/company/UsdValue";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function HoldersPage({ params }: { params: Promise<{ ticker: string }> }) {
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();

    // Basic company fetch for header
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/api/company/${ticker}`);
    if (!res.ok) notFound();
    const data = await res.json();
    const company = data.company;
    const metrics = data.metrics;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header Area Area Area */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-[1600px] py-6 px-4 md:px-8 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <CompanyLogo ticker={ticker} name={company.name} size="lg" />
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                                    <Badge variant="outline" className="text-lg font-mono px-3">{ticker}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{company.exchange}</span>
                                    <span>•</span>
                                    <span>{company.sector}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold font-mono">
                                    <UsdValue amount={metrics?.price} />
                                </span>
                                <Badge className={cn(
                                    "text-sm font-mono",
                                    (metrics?.refund_1d_p || 0) >= 0 ? "bg-growth/10 text-growth" : "bg-danger/10 text-danger"
                                )}>
                                    {(metrics?.refund_1d_p || 0) >= 0 ? "+" : ""}{metrics?.refund_1d_p?.toFixed(2)}%
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 text-right">Market Close</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}


            <div className="mx-auto max-w-[1600px] py-8 px-4 md:px-8 lg:px-12 text-center">
                <Card className="max-w-2xl mx-auto py-12">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-brand/10 text-brand">
                            <Users className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold">Holders Section coming soon</h2>
                        <p className="text-muted-foreground max-w-md">
                            Institutional and Insider ownership data for {ticker} is coming soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
