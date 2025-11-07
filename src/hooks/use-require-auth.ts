import { supabase } from "@/src/api/supabase";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";

/**
 * Hook that redirects based on authentication state:
 * - If user has NO session → redirect to welcome screen
 * - If user has session → redirect to main swipe screen (index)
 *
 * Use this in root layout or app entry point to handle initial routing
 */
export function useAuthRedirect() {
  const router = useRouter();

  const checkAuthAndRedirect = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;

      if (!session) {
        // No session → show welcome screen
        router.replace("/(tabs)/welcome" as any);
      } else {
        // Has session → show main swipe screen
        router.replace("/(tabs)" as any);
      }
    } catch {
      // On error, default to welcome
      router.replace("/(tabs)/welcome" as any);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [checkAuthAndRedirect]);
}

/**
 * Hook that returns a function to navigate to a destination only if the user is authenticated.
 * If not authenticated, it redirects to welcome screen.
 */
export function useRequireAuth() {
  const router = useRouter();

  const requireAuth = async (destination: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;

      if (session) {
        // User is signed in, go to destination
        router.push(destination as any);
        return true;
      }

      // Not signed in → go to welcome
      router.push("/(tabs)/welcome" as any);
      return false;
    } catch {
      // On error, send to welcome
      router.push("/(tabs)/welcome" as any);
      return false;
    }
  };

  return requireAuth;
}
