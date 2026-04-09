"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PortfolioCallbackPage() {
  useEffect(() => {
    // Check if this page was opened in a popup/child window
    if (window.opener) {
      // Send message to parent window that connection succeeded
      window.opener.postMessage(
        { type: "SNAPTRADE_CONNECTED" },
        window.location.origin
      );

      // Close this popup window
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If not in popup, redirect to portfolio page
      window.location.href = "/portfolio";
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-900 dark:text-white">
          Connection Successful!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Returning to your portfolio...
        </p>
      </div>
    </div>
  );
}
