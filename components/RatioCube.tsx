import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Ratio {
    label: string
    value: string
    subValue?: string
    trend?: "up" | "down" | "neutral"
}

interface RatioCubeProps {
    ratios: Ratio[]
}

export function RatioCube({ ratios }: RatioCubeProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ratios.map((ratio, i) => (
                <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow bg-white dark:bg-slate-900">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{ratio.label}</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-white font-heading">{ratio.value}</span>
                            {ratio.subValue && (
                                <span className={cn(
                                    "text-xs font-medium",
                                    ratio.trend === "up" ? "text-growth dark:text-green-400" : ratio.trend === "down" ? "text-danger dark:text-red-400" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {ratio.subValue}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
