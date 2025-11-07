import type { InterestKey } from "@/src/constants/interests";
import type {
  UpdateProfileBasicInfo,
  UpdateProfileLocation,
  UpdateProfilePreferences,
} from "@/src/types/profile";
import { supabase } from "../supabase";

/**
 * Get current user's profile
 */
export async function getCurrentProfile() {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Get profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile with basic information (Step 1 of profile setup)
 */
export async function updateProfileBasicInfo(
  userId: string,
  data: UpdateProfileBasicInfo
) {
  try {
    const updateData: any = {
      username: data.username,
      birthdate: data.birthdate,
      gender: data.gender,
      bio: data.bio,
    };

    // Add phone if provided
    if (data.phone) {
      updateData.phone = data.phone;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile with interests (Step 2 of profile setup)
 */
export async function updateProfileInterests(
  userId: string,
  interests: InterestKey[]
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ interests })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile with location (Step 3 of profile setup)
 */
export async function updateProfileLocation(
  userId: string,
  data: UpdateProfileLocation
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile with preferences (Step 4 of profile setup)
 */
export async function updateProfilePreferences(
  userId: string,
  data: UpdateProfilePreferences
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        seeking_gender: data.seeking_gender,
        age_min: data.age_min,
        age_max: data.age_max,
        distance_km: data.distance_km,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Update profile avatar and complete profile setup (Step 5 of profile setup)
 */
export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        is_complete: true, // Mark profile as complete!
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}
