"use client";

import { createAuthClient } from "better-auth/react";
import { useEffect, useState } from "react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL,
});

/**
 * useSession — lightweight session hook for client-side components
 */
export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    try {
      setIsPending(true);
      setError(null);

      const res = await authClient.getSession();
      setSession(res.data || null);
    } catch (err) {
      console.error("Session fetch failed:", err);
      setSession(null);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data: session, isPending, error, refetch };
}
