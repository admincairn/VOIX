export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json | null;
          profile_id: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          profile_id: string;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          profile_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          config: Json;
          created_at: string;
          id: string;
          name: string;
          profile_id: string;
          response_count: number;
          sent_count: number;
          status: string;
          type: string;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          id?: string;
          name: string;
          profile_id: string;
          response_count?: number;
          sent_count?: number;
          status?: string;
          type: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          id?: string;
          name?: string;
          profile_id?: string;
          response_count?: number;
          sent_count?: number;
          status?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invites: {
        Row: {
          campaign_id: string | null;
          created_at: string;
          customer_email: string | null;
          customer_name: string | null;
          id: string;
          profile_id: string;
          token: string;
          used: boolean;
        };
        Insert: {
          campaign_id?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          id?: string;
          profile_id: string;
          token: string;
          used?: boolean;
        };
        Update: {
          campaign_id?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          id?: string;
          profile_id?: string;
          token?: string;
          used?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "invites_campaign_id_fkey";
            columns: ["campaign_id"];
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          features: Json;
          id: string;
          max_testimonials: number;
          max_videos_monthly: number;
          max_widgets: number;
          name: string;
          price_monthly: number;
          price_yearly: number;
        };
        Insert: {
          features?: Json;
          id: string;
          max_testimonials: number;
          max_videos_monthly: number;
          max_widgets: number;
          name: string;
          price_monthly: number;
          price_yearly: number;
        };
        Update: {
          features?: Json;
          id?: string;
          max_testimonials?: number;
          max_videos_monthly?: number;
          max_widgets?: number;
          name?: string;
          price_monthly?: number;
          price_yearly?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          company_name: string;
          company_slug: string;
          created_at: string;
          id: string;
          logo_url: string | null;
          plan_id: string | null;
          plan_status: string;
          subscription_id: string | null;
          trial_ends_at: string | null;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          company_name: string;
          company_slug: string;
          created_at?: string;
          id: string;
          logo_url?: string | null;
          plan_id?: string | null;
          plan_status?: string;
          subscription_id?: string | null;
          trial_ends_at?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          company_name?: string;
          company_slug?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          plan_id?: string | null;
          plan_status?: string;
          subscription_id?: string | null;
          trial_ends_at?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      testimonials: {
        Row: {
          content: string;
          created_at: string;
          customer_avatar_url: string | null;
          customer_email: string | null;
          customer_name: string;
          customer_title: string | null;
          id: string;
          profile_id: string;
          rating: number | null;
          source: string;
          source_id: string | null;
          status: string;
          tags: string[] | null;
          transcript: string | null;
          updated_at: string;
          video_duration: number | null;
          video_url: string | null;
          widget_ids: string[] | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          customer_avatar_url?: string | null;
          customer_email?: string | null;
          customer_name: string;
          customer_title?: string | null;
          id?: string;
          profile_id: string;
          rating?: number | null;
          source?: string;
          source_id?: string | null;
          status?: string;
          tags?: string[] | null;
          transcript?: string | null;
          updated_at?: string;
          video_duration?: number | null;
          video_url?: string | null;
          widget_ids?: string[] | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          customer_avatar_url?: string | null;
          customer_email?: string | null;
          customer_name?: string;
          customer_title?: string | null;
          id?: string;
          profile_id?: string;
          rating?: number | null;
          source?: string;
          source_id?: string | null;
          status?: string;
          tags?: string[] | null;
          transcript?: string | null;
          updated_at?: string;
          video_duration?: number | null;
          video_url?: string | null;
          widget_ids?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      widgets: {
        Row: {
          click_count: number;
          config: Json;
          created_at: string;
          embed_code: string | null;
          filters: Json | null;
          id: string;
          name: string;
          profile_id: string;
          type: string;
          view_count: number;
        };
        Insert: {
          click_count?: number;
          config?: Json;
          created_at?: string;
          embed_code?: string | null;
          filters?: Json | null;
          id?: string;
          name: string;
          profile_id: string;
          type: string;
          view_count?: number;
        };
        Update: {
          click_count?: number;
          config?: Json;
          created_at?: string;
          embed_code?: string | null;
          filters?: Json | null;
          id?: string;
          name?: string;
          profile_id?: string;
          type?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "widgets_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
