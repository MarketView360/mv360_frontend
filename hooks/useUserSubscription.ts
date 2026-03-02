"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface UserSubscription {
    tier: string;
    isActive: boolean;
}

export function useUserSubscription() {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscription() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/profile/subscription`, {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setSubscription(data);
                }
            } catch (error) {
                console.error("Failed to fetch subscription:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSubscription();
    }, []);

    return { subscription, loading };
}
