import {
  sendOTP as firebaseSendOTP,
  verifyOTP as firebaseVerifyOTP,
} from "../firebase-otp";
import { supabase } from "../supabase";

/**
 * AUTH FLOW:
 * - Uses Firebase Phone Authentication to send real SMS OTP
 * - Requires reCAPTCHA verification (invisible on web)
 * - Free tier: Unlimited SMS (10K/day limit)
 *
 * Setup required:
 * 1. Enable Phone Authentication in Firebase Console
 * 2. Add Firebase config to .env.development
 */

/**
 * Send OTP to phone number using Firebase
 * @param phone - Phone number in E.164 format (e.g., +84765362207)
 * @returns OTP details (code NOT included - sent via SMS)
 */
export async function sendOtp(phone: string) {
  const result = await firebaseSendOTP(phone);

  if (!result.ok || !result.data) {
    throw new Error(result.error || "Failed to send OTP");
  }

  return {
    phoneNumber: phone,
    expiresAt: result.data.expires,
    message: result.data.message_text,
  };
}

/**
 * Verify OTP and create/login user in Supabase
 * @param phone - Phone number
 * @param code - OTP code entered by user
 * @returns Supabase session
 */
export async function verifyOtp(phone: string, code: string) {
  // Verify OTP with Firebase (validates code, format, and expiration)
  const verifyResult = await firebaseVerifyOTP(phone, code);

  if (!verifyResult.ok || !verifyResult.valid) {
    throw new Error(verifyResult.error || "Invalid OTP code");
  }

  // Check if user with this phone number already exists
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, phone")
    .eq("phone", phone)
    .single();

  console.log("Error:", profileError);

  // If user exists, sign in with their user ID
  if (existingProfile && !profileError) {
    // User already has an account, just create a session
    // Note: We use anonymous auth to create a session for existing user
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          phone: phone,
          phone_verified: true,
          verified_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      user: data.user,
      isNewUser: false,
    };
  }

  // User doesn't exist, create new account with anonymous auth
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        phone: phone,
        phone_verified: true,
        verified_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    throw error;
  }

  // Create profile for the new user
  const { error: profileCreateError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    phone: phone,
    is_complete: false, // Profile not complete until user fills in details
  });

  if (profileCreateError) {
    console.error("Failed to create profile:", profileCreateError);
    // Continue anyway - user is authenticated, profile can be created later
  }

  return {
    session: data.session,
    user: data.user,
    isNewUser: true,
  };
}
