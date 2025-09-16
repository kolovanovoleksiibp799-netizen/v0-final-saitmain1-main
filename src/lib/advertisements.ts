import type { Database } from "@/integrations/supabase/types";

export type AdvertisementStatus =
  | "active"
  | "inactive"
  | "archived"
  | "draft"
  | string
  | null;

type BaseAdvertisement =
  Database["public"]["Tables"]["advertisements"]["Row"]

export type Advertisement = BaseAdvertisement & {
  /** Optional status that may be returned by views or computed queries. */
  status?: AdvertisementStatus;
  /** Optional counter for analytics-style views. */
  views_count?: number | null;
  /** Optional location metadata. */
  location?: string | null;
  /** Optional product condition metadata. */
  condition?: "new" | "used" | "refurbished" | string | null;
  /** Related user information when the query joins the users table. */
  users?: {
    id?: string | null;
    nickname?: string | null;
    role?: Database["public"]["Enums"]["user_role"] | null;
  } | null;
}
