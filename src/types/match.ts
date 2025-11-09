/**
 * Match Candidate Profile
 */
export interface MatchCandidate {
  userId: string;
  name: string;
  age: number;
  avatarUrl: string;
  bio?: string;
  interests?: string[];
  address?: string;
  distanceKm?: number;
  gender?: string;
}

/**
 * Match Filters (from current user's preferences)
 */
export interface MatchFilters {
  seekingGender?: string;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  interests?: string[];
  latitude?: number;
  longitude?: number;
  currentUserGender?: string;
  currentUserAge?: number;
}
