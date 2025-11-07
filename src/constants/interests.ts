/**
 * Interest Options with Key-Value Mapping
 * - Keys are stored in database (no emoji, clean data)
 * - Values are displayed in UI (with emoji, user-friendly)
 */

export const INTEREST_MAP = {
  music: "🎵 Music",
  movies: "🎬 Movies",
  reading: "📚 Reading",
  sports: "🏃 Sports",
  cooking: "🍳 Cooking",
  travel: "✈️ Travel",
  art: "🎨 Art",
  gaming: "🎮 Gaming",
  photography: "📸 Photography",
  yoga: "🧘 Yoga",
  fitness: "🏋️ Fitness",
  theater: "🎭 Theater",
  wine: "🍷 Wine",
  coffee: "☕ Coffee",
  nature: "🌿 Nature",
  pets: "🐕 Pets",
  dancing: "💃 Dancing",
  karaoke: "🎤 Karaoke",
  beach: "🏖️ Beach",
  hiking: "⛰️ Hiking",
} as const;

// Type for interest keys
export type InterestKey = keyof typeof INTEREST_MAP;

// Array of [key, label] for easy iteration in UI
export const INTEREST_OPTIONS: [InterestKey, string][] = Object.entries(
  INTEREST_MAP
) as [InterestKey, string][];

// Helper: Get label from key
export function getInterestLabel(key: InterestKey): string {
  return INTEREST_MAP[key];
}

// Helper: Get labels from keys array
export function getInterestLabels(keys: InterestKey[]): string[] {
  return keys.map(key => INTEREST_MAP[key]);
}

// Helper: Get key from label (reverse lookup)
export function getInterestKey(label: string): InterestKey | undefined {
  const entry = Object.entries(INTEREST_MAP).find(([_, val]) => val === label);
  return entry ? (entry[0] as InterestKey) : undefined;
}
