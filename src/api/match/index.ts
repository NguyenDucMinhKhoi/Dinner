import type { MatchCandidate, MatchFilters } from "../../types/match";
import { getCurrentProfile } from "../profile/index";
import { supabase } from "../supabase";

/**
 * Orchestrator: fetch profile, swipes, candidate profiles then filter & sort.
 */
export async function getMatchCandidates(
  userId: string,
  limit: number = 20
): Promise<MatchCandidate[]> {
  try {
    const currentUser = await getCurrentProfile();

    const filters = createMatchFilters(currentUser);

    const swipedUserIds = await getSwipedUserIds(userId);

    const candidateProfiles = await getCandidateProfiles({
      userId,
      excludeIds: swipedUserIds,
      seekingGender: filters.seekingGender,
      limit: limit * 3,
    });

    if (!candidateProfiles || candidateProfiles.length === 0) return [];

    const matchCandidates: MatchCandidate[] = [];
    for (const candidateProfile of candidateProfiles) {
      const candidate = filterCandidate(candidateProfile, filters);
      if (candidate) {
        matchCandidates.push(candidate);
        if (matchCandidates.length >= limit) break;
      }
    }

    // Sort by number of common interests desc, then randomize
    matchCandidates.sort((a, b) => {
      const commonA = countCommonInterests(a, filters);
      const commonB = countCommonInterests(b, filters);
      if (commonA !== commonB) return commonB - commonA;
      return Math.random() - 0.5;
    });

    return matchCandidates.slice(0, limit);
  } catch (error: any) {
    throw new Error(`Failed to get match candidates: ${error.message}`);
  }
}

/** Helper: calculate age from birthdate */
function calculateAge(birthdate: string): number {
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
  return age > 0 ? age : 0;
}

/** Helper: create match filters */
function createMatchFilters(currentUser: any): MatchFilters {
  const currentUserAge = calculateAge(currentUser.birthdate);

  return {
    seekingGender: currentUser.seeking_gender,
    ageMin: currentUser.age_min,
    ageMax: currentUser.age_max,
    maxDistance: currentUser.distance_km,
    interests: currentUser.interests,
    latitude: currentUser.latitude,
    longitude: currentUser.longitude,
    currentUserGender: currentUser.gender,
    currentUserAge,
  };
}

/** Helper: list of user IDs the current user already swiped on */
async function getSwipedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("swipes")
    .select("target_user_id")
    .eq("user_id", userId)
    .eq("action", "like");

  if (error) throw error;
  return (data?.map((s: any) => s.target_user_id) as string[]) || [];
}

/** Helper: query candidate profiles with basic filters */
async function getCandidateProfiles(opts: {
  userId: string;
  excludeIds?: string[];
  seekingGender?: string | null;
  limit?: number;
}) {
  let q = supabase
    .from("profiles")
    .select(
      "id, username, birthdate, avatar_url, bio, interests, address, gender, latitude, longitude"
    )
    .eq("is_complete", true)
    .neq("id", opts.userId)
    .eq("gender", opts.seekingGender);

  if (opts.excludeIds && opts.excludeIds.length > 0) {
    q = q.not("id", "in", `(${opts.excludeIds.join(",")})`);
  }

  const { data, error } = await q.limit(opts.limit || 50);
  if (error) throw error;
  return (data as any[]) || [];
}

/** Helper: apply remaining filters and transform to MatchCandidate or return null */
function filterCandidate(candidate: any, filters: MatchFilters) {
  const age = calculateAge(candidate.birthdate);

  if (filters.ageMin && age < filters.ageMin) return null;
  if (filters.ageMax && age > filters.ageMax) return null;

  // Distance
  let distanceKm: number | undefined;
  if (
    filters.latitude &&
    filters.longitude &&
    candidate.latitude &&
    candidate.longitude
  ) {
    distanceKm = calculateDistance(
      filters.latitude,
      filters.longitude,
      candidate.latitude,
      candidate.longitude
    );
    if (filters.maxDistance && distanceKm > filters.maxDistance) return null;
  }

  // Interests: require at least one common interest if current user has interests
  const hasCommonInterest =
    !filters.interests ||
    !candidate.interests ||
    filters.interests.some((i: string) => candidate.interests?.includes(i));
  if (!hasCommonInterest) return null;

  return {
    userId: candidate.id,
    name: candidate.username || "User",
    age,
    avatarUrl: candidate.avatar_url!,
    bio: candidate.bio || undefined,
    interests: candidate.interests || undefined,
    address: candidate.address || undefined,
    distanceKm,
    gender: candidate.gender || undefined,
  } as MatchCandidate;
}

/** Helper: count common interests between candidate and current user */
function countCommonInterests(
  candidate: MatchCandidate,
  filters: MatchFilters
) {
  if (!filters.interests || !candidate.interests) return 0;
  return candidate.interests.filter(i => filters.interests?.includes(i)).length;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
