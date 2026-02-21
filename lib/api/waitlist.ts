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

export const waitlistApi = {
  /**
   * Check if current user is in premium waitlist
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
   * Join premium waitlist
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
};
