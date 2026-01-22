import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CompanyNavigation } from "@/components/company/CompanyNavigation";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UsdValue } from "@/components/company/UsdValue";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContentGate } from "@/components/company/ContentGate";

// ... existing code ...

<div className="mx-auto max-w-[1600px] py-8 px-4 md:px-8 lg:px-12 text-center">
    <ContentGate feature="Stock Analysis">
        <Card className="max-w-2xl mx-auto py-12">
            <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-brand/10 text-brand">
                    <Activity className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold">Analysis Section coming soon</h2>
                <p className="text-muted-foreground max-w-md">
                    We are currently building advanced fundamental and technical analysis tools for {company.name}.
                </p>
            </CardContent>
        </Card>
    </ContentGate>
</div>
