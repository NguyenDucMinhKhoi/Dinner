/* Supabase client wrapper
   Reads credentials from environment variables:
   - EXPO_PUBLIC_SUPABASE_URL
   - EXPO_PUBLIC_SUPABASE_ANON_KEY

   Make sure you add these to your Expo environment (app config, secrets, or CI). This file exports a ready-to-use `supabase` client.
*/
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In development it's okay to warn — production should fail loudly if missing.
  // You can set these in `app.config.js` / `app.json` -> extra, or use environment secrets in Expo.
  // See README notes after this change for exact instructions.

  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY not set"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // persistSession works in RN with AsyncStorage in typical setups.
    persistSession: true,
  },
});

export default supabase;
