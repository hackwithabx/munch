export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  tags: string[];
  city: string | null;
  avatar_url: string | null;
  qr_code_url: string | null;
  payment_label: string | null;
  upi_id: string | null;
  payment_link: string | null;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  display_order: number;
  created_at: string;
};

export type SearchResult = Pick<
  Profile,
  "username" | "display_name" | "bio" | "avatar_url" | "tags" | "city"
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      social_links: {
        Row: SocialLink;
        Insert: Omit<SocialLink, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<SocialLink, "id" | "created_at">>;
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          profile_id: string;
          viewed_at: string;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          viewed_at?: string;
          referrer?: string | null;
        };
        Update: {
          referrer?: string | null;
        };
        Relationships: [];
      };
      search_queries: {
        Row: {
          id: string;
          query_text: string;
          normalized_query: string;
          source: string | null;
          searched_at: string;
        };
        Insert: {
          id?: string;
          query_text: string;
          normalized_query: string;
          source?: string | null;
          searched_at?: string;
        };
        Update: {
          query_text?: string;
          normalized_query?: string;
          source?: string | null;
          searched_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
