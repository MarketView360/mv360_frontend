"use client";

import { useEffect } from "react";

type SupportProvider = "brevo" | "tidio";

const PROVIDER: SupportProvider =
  (process.env.NEXT_PUBLIC_SUPPORT_PROVIDER as SupportProvider | undefined) || "brevo";

export function SupportWidget() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const provider = PROVIDER;

    if (provider === "brevo") {
      // Inject Brevo Conversations widget
      (window as any).BrevoConversationsID = "693dc1bff4cd67e4c902b2a5";
      (window as any).BrevoConversations =
        (window as any).BrevoConversations ||
        function () {
          ((window as any).BrevoConversations.q = (window as any).BrevoConversations.q || []).push(
            arguments,
          );
        };

      if (!document.getElementById("brevo-conversations-loader")) {
        const s = document.createElement("script");
        s.async = true;
        s.id = "brevo-conversations-loader";
        s.src = "https://conversations-widget.brevo.com/brevo-conversations.js";
        document.head?.appendChild(s);
      }
    } else if (provider === "tidio") {
      // Inject Tidio widget
      if (!document.getElementById("tidio-chat-script")) {
        const s = document.createElement("script");
        s.async = true;
        s.id = "tidio-chat-script";
        s.src = "//code.tidio.co/erp9bfeukqhak1egfqhvgxrzh1grmi9n.js";
        document.body.appendChild(s);
      }
    }

    return () => {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      if (provider === "brevo") {
        const script = document.getElementById("brevo-conversations-loader");
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }

        // Best-effort cleanup of Brevo DOM artifacts
        const brevoIframes = document.querySelectorAll(
          'iframe[src*="conversations-widget.brevo.com"], script[src*="conversations-widget.brevo.com"]',
        );
        brevoIframes.forEach((el) => el.parentNode?.removeChild(el));

        delete (window as any).BrevoConversationsID;
        delete (window as any).BrevoConversations;
      } else if (provider === "tidio") {
        const script = document.getElementById("tidio-chat-script");
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }

        // Best-effort cleanup of Tidio DOM artifacts
        const tidioNodes = document.querySelectorAll(
          '[id^="tidio-"], iframe[src*="tidio"], script[src*="tidio.co"]',
        );
        tidioNodes.forEach((el) => el.parentNode?.removeChild(el));

        delete (window as any).tidioChatApi;
      }
    };
  }, []);

  return null;
}

