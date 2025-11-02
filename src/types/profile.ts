export interface Profile {
  id: string; // same as auth.users.id
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  birthdate?: string | null; // ISO date string
  gender?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_complete?: boolean | null;
  created_at?: string | null;
}
