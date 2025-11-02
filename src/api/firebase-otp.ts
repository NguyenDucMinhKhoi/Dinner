/**
 * Firebase Phone Authentication (Real SMS via Firebase)
 * Docs: https://firebase.google.com/docs/auth/web/phone-auth
 *
 * IMPORTANT:
 * - Requires Firebase Phone Auth to be enabled in Firebase Console
 * - Uses reCAPTCHA verification (will show a verification popup)
 * - Sends real SMS via Firebase (free tier: unlimited)
 */

import {
  ApplicationVerifier,
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./firebase";

interface SendOTPResponse {
  ok: boolean;
  message?: string;
  data?: {
    expires: number;
    message_text: string;
  };
  error?: string;
}

interface VerifyOTPResponse {
  ok: boolean;
  valid: boolean;
  message?: string;
  error?: string;
  firebaseUser?: any;
}

// Store confirmation result from Firebase
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize reCAPTCHA verifier (only once)
 */
function initRecaptcha(): ApplicationVerifier {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  try {
    // For debugging, use 'normal' size to see the reCAPTCHA
    // For production, use 'invisible'
    const isDevelopment = process.env.NODE_ENV !== "production";

    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: isDevelopment ? "normal" : "invisible", // Show reCAPTCHA in dev mode
      callback: (response: any) => {
        console.log("✅ reCAPTCHA verified successfully", response);
      },
      "expired-callback": () => {
        console.warn("⚠️ reCAPTCHA expired, please verify again");
        // Clear verifier so it can be re-initialized
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          recaptchaVerifier = null;
        }
      },
    });

    console.log(
      "🔧 reCAPTCHA initialized:",
      isDevelopment ? "visible" : "invisible"
    );

    return recaptchaVerifier;
  } catch (error) {
    console.error("❌ Failed to initialize reCAPTCHA:", error);
    throw error;
  }
}

/**
 * Send OTP code to phone number via Firebase
 * @param phone - Phone number in E.164 format (e.g., +84765362207)
 * @returns Promise with confirmation result
 */
export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  try {
    console.log("🔥 Firebase: Sending OTP to", phone);

    // Initialize reCAPTCHA verifier
    const appVerifier = initRecaptcha();

    // Send OTP via Firebase
    confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

    console.log("✅ Firebase: OTP sent successfully");

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    return {
      ok: true,
      data: {
        expires: expiresAt,
        message_text: "OTP sent via Firebase SMS",
      },
    };
  } catch (error: any) {
    console.error("❌ Firebase sendOTP error:", error);

    // Clear reCAPTCHA on error
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    return {
      ok: false,
      error: error.message || "Failed to send OTP via Firebase",
    };
  }
}

/**
 * Verify OTP code via Firebase
 * @param phone - Phone number in E.164 format (not used, but kept for API compatibility)
 * @param code - OTP code entered by user
 * @returns Promise with verification result and Firebase user
 */
export async function verifyOTP(
  phone: string,
  code: string
): Promise<VerifyOTPResponse> {
  try {
    console.log("🔥 Firebase: Verifying OTP code...");

    // Validate OTP format
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return {
        ok: false,
        valid: false,
        error: "Invalid OTP format. Must be 6 digits.",
      };
    }

    // Check if we have a confirmation result
    if (!confirmationResult) {
      return {
        ok: false,
        valid: false,
        error: "No OTP request found. Please request a new code.",
      };
    }

    // Verify the code with Firebase
    const userCredential = await confirmationResult.confirm(code);

    console.log("✅ Firebase: OTP verified successfully");
    console.log("👤 Firebase User:", userCredential.user.uid);

    // Clear confirmation result
    confirmationResult = null;

    // Clear reCAPTCHA
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    return {
      ok: true,
      valid: true,
      message: "OTP verified successfully via Firebase",
      firebaseUser: userCredential.user,
    };
  } catch (error: any) {
    console.error("❌ Firebase verifyOTP error:", error);

    return {
      ok: false,
      valid: false,
      error: error.message || "Invalid OTP code",
    };
  }
}
