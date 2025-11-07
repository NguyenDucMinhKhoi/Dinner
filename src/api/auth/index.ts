import { supabase } from "../supabase";

/**
 * AUTH FLOW - Supabase Email/Password Authentication
 * - Simple and reliable email/password auth
 * - Works on all platforms (Expo Go, web, native)
 * - Built-in email verification support
 *
 * Setup required:
 * 1. Enable Email auth in Supabase Dashboard (Authentication > Providers > Email)
 * 2. Configure email templates (optional)
 */

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Check if email already exists
 * @param email - Email to check
 * @returns true if email exists, false otherwise
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .single();

    // If error and not "not found" error, throw it
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return !!data; // true if found, false if not
  } catch {
    return false; // Assume not exists on error
  }
}

/**
 * Sign up with email and password
 * @param data - Email and password
 * @returns User session and profile data
 */
export async function signUp(data: SignUpData) {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(data.email);
    if (emailExists) {
      throw new Error("Email already registered. Please sign in instead.");
    }

    // Sign up user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

  // user created

    // NOTE: Profile will be created AFTER email verification
    // See verify-otp.tsx for profile creation logic

    // Note: session will be null if email confirmation is enabled
    // User must verify email before they can sign in
    const needsEmailVerification = !authData.session && authData.user;

    return {
      session: authData.session,
      user: authData.user,
      isNewUser: true,
      needsEmailVerification, // true if user needs to verify email
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign up");
  }
}

/**
 * Sign in with email and password
 * @param data - Email and password
 * @returns User session
 */
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw error;
    }

  // signed in

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_complete")
      .eq("id", authData.user.id)
      .single();

    return {
      session: authData.session,
      user: authData.user,
      isNewUser: !profile?.is_complete,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // signed out
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
}
