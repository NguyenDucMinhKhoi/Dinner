export type SwipeAction = "like" | "pass";

export interface SwipeResult {
  success: boolean;
  isMatch: boolean;
  matchId?: string;
  error?: string;
}
