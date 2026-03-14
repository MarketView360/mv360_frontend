import { Clock, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const metadata = {
  title: "Blog | MarketView360",
  description: "Market insights and platform updates from the MarketView360 team.",
};

export default function BlogPage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="flex flex-col items-center text-center gap-6">
        <Card className="w-16 h-16 flex items-center justify-center shadow-none">
          <CardContent className="p-0 flex items-center justify-center w-full h-full">
            <Rss
              size={28}
              strokeWidth={1.5}
              className="text-muted-foreground"
              aria-hidden="true"
            />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="text-muted-foreground max-w-md">
            Market insights, platform updates, and investment research from the
            MarketView360 team. First post drops soon.
          </p>
        </div>

        <Badge variant="secondary" className="gap-1.5">
          <Clock size={11} strokeWidth={1.75} aria-hidden="true" />
          Coming Soon
        </Badge>

        <Button variant="ghost" size="sm" asChild>
          <a href="/">Back to home</a>
        </Button>
      </div>
    </main>
  );
}
