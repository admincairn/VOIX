// ============================================================
// VOIX — Supabase Database Types
// Mirrors the schema in supabase/migrations/001_initial.sql
// Run `supabase gen types typescript` to regenerate from live DB
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id:                    string
          name:                  string
          price_monthly:         number
          price_yearly:          number
          max_testimonials:      number
          max_videos_monthly:    number
          max_widgets:           number
          ls_variant_id_monthly: string | null
          ls_variant_id_yearly:  string | null
          features:              Json
        }
        Insert: {
          id:                    string
          name:                  string
          price_monthly:         number
          price_yearly:          number
          max_testimonials:      number
          max_videos_monthly:    number
          max_widgets:           number
          ls_variant_id_monthly?: string | null
          ls_variant_id_yearly?:  string | null
          features?:             Json
        }
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
      }
      profiles: {
        Row: {
          id:              string
          company_name:    string
          company_slug:    string
          website_url:     string | null
          logo_url:        string | null
          plan_id:         string
          plan_status:     string
          trial_ends_at:   string | null
          subscription_id: string | null
          customer_id:     string | null
          onboarded:       boolean
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id:              string
          company_name?:   string
          company_slug:    string
          website_url?:    string | null
          logo_url?:       string | null
          plan_id?:        string
          plan_status?:    string
          trial_ends_at?:  string | null
          subscription_id?: string | null
          customer_id?:    string | null
          onboarded?:      boolean
        }
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Insert'], 'id'>>
      }
      testimonials: {
        Row: {
          id:                  string
          profile_id:          string
          customer_name:       string
          customer_email:      string | null
          customer_title:      string | null
          customer_avatar_url: string | null
          content:             string
          video_url:           string | null
          video_thumbnail_url: string | null
          video_duration:      number | null
          transcript:          string | null
          rating:              number | null
          source:              string
          source_id:           string | null
          source_url:          string | null
          status:              string
          tags:                string[]
          widget_ids:          string[]
          featured:            boolean
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id?:                  string
          profile_id:           string
          customer_name:        string
          customer_email?:      string | null
          customer_title?:      string | null
          customer_avatar_url?: string | null
          content:              string
          video_url?:           string | null
          video_thumbnail_url?: string | null
          video_duration?:      number | null
          transcript?:          string | null
          rating?:              number | null
          source?:              string
          source_id?:           string | null
          source_url?:          string | null
          status?:              string
          tags?:                string[]
          widget_ids?:          string[]
          featured?:            boolean
        }
        Update: Partial<Omit<Database['public']['Tables']['testimonials']['Insert'], 'id' | 'profile_id'>>
      }
      widgets: {
        Row: {
          id:          string
          profile_id:  string
          name:        string
          type:        string
          config:      Json
          filters:     Json | null
          view_count:  number
          click_count: number
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id?:         string
          profile_id:  string
          name:        string
          type:        string
          config?:     Json
          filters?:    Json | null
          view_count?: number
          click_count?: number
        }
        Update: Partial<Omit<Database['public']['Tables']['widgets']['Insert'], 'id' | 'profile_id'>>
      }
      campaigns: {
        Row: {
          id:             string
          profile_id:     string
          name:           string
          type:           string
          status:         string
          config:         Json
          sent_count:     number
          response_count: number
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          profile_id:     string
          name:           string
          type?:          string
          status?:        string
          config?:        Json
          sent_count?:    number
          response_count?: number
        }
        Update: Partial<Omit<Database['public']['Tables']['campaigns']['Insert'], 'id' | 'profile_id'>>
      }
      invites: {
        Row: {
          id:             string
          profile_id:     string
          campaign_id:    string | null
          token:          string
          customer_email: string | null
          customer_name:  string | null
          used:           boolean
          used_at:        string | null
          created_at:     string
        }
        Insert: {
          id?:            string
          profile_id:     string
          campaign_id?:   string | null
          token?:         string
          customer_email?: string | null
          customer_name?:  string | null
          used?:           boolean
          used_at?:        string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['invites']['Insert'], 'id' | 'profile_id'>>
      }
      activities: {
        Row: {
          id:         string
          profile_id: string
          type:       string
          metadata:   Json | null
          created_at: string
        }
        Insert: {
          id?:        string
          profile_id: string
          type:       string
          metadata?:  Json | null
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_campaign_responses: {
        Args: { campaign_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}
