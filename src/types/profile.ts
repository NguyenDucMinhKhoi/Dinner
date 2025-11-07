import type { InterestKey } from "@/src/constants/interests";

export interface Profile {
  id: string; // same as auth.users.id
  username?: string | null;
  bio?: string | null;
  birthdate?: string | null; // ISO date string
  gender?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  interests?: InterestKey[] | null; // Array of interest keys (e.g., ['music', 'movies'])
  seeking_gender?: string | null; // 'male' | 'female' | 'both'
  age_min?: number | null;
  age_max?: number | null;
  distance_km?: number | null;
  is_complete?: boolean | null;
  created_at?: string | null;
}

export interface UpdateProfileBasicInfo {
  username: string; // Required - primary display name and unique identifier
  phone?: string; // Optional - phone number
  birthdate: string; // YYYY-MM-DD format
  gender: "male" | "female" | "other";
  bio: string;
}

export interface UpdateProfileLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateProfilePreferences {
  seeking_gender: "male" | "female" | "both";
  age_min: number; // 18-100
  age_max: number; // 18-100
  distance_km: number; // 1-100
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

// export interface ProfileSetupData {
//   // Step 1: Basic Info
//   full_name: string;
//   birthdate: string; // YYYY-MM-DD format
//   gender: "male" | "female" | "other";
//   bio: string;

//   // Step 2: Interests (array of keys, not labels)
//   interests: InterestKey[];

//   // Step 3: Location
//   address: string;
//   latitude: number;
//   longitude: number;

//   // Step 4: Preferences
//   seeking_gender: "male" | "female" | "both";
//   age_min: number;
//   age_max: number;
//   distance_km: number;
// }
