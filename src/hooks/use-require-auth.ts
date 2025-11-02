import { supabase } from "@/src/api/supabase";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Hook that returns a function to navigate to a destination only if the user is authenticated.
 * If not authenticated, it redirects to a login route and includes the original destination as redirect param.
 */
export function useRequireAuth() {
  const router = useRouter();

  const requireAuth = useCallback(
    async (destination: string) => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;

        if (session) {
          // user is signed in, go to destination
          router.push(destination);
          return true;
        }

        // not signed in -> go to login and pass redirect
        const redirectTo = encodeURIComponent(destination);
        router.push(`/auth/login?redirect=${redirectTo}`);
        return false;
      } catch (err) {
        // on error, send to login
        const redirectTo = encodeURIComponent(destination);
        router.push(`/auth/login?redirect=${redirectTo}`);
        return false;
      }
    },
    [router]
  );

  return requireAuth;
}
