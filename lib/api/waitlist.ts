const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export interface WaitlistStatusResponse {
  inWaitlist: boolean;
  email: string;
}

export interface JoinWaitlistResponse {
  success: boolean;
  alreadyInList: boolean;
  message: string;
}

export interface AnonymousWaitlistData {
  name: string;
  email: string;
  phone?: string;
  country?: string;
}

export const waitlistApi = {
  /**
   * Check if current user is in premium waitlist (requires auth)
   */
  async checkStatus(): Promise<WaitlistStatusResponse> {
    const response = await fetch(`${BACKEND_URL}/waitlist/premium/status`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check waitlist status: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Join premium waitlist (authenticated users)
   */
  async joinPremium(): Promise<JoinWaitlistResponse> {
    const response = await fetch(`${BACKEND_URL}/waitlist/premium/join`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to join waitlist: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Join premium waitlist (anonymous users with email)
   */
  async joinAnonymous(data: AnonymousWaitlistData): Promise<JoinWaitlistResponse> {
    const response = await fetch(`${BACKEND_URL}/waitlist/premium/join-anonymous`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to join waitlist: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Leave premium waitlist (unsubscribe)
   */
  async leave(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BACKEND_URL}/waitlist/premium/leave`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to leave waitlist: ${response.statusText}`);
    }

    return response.json();
  },
};
