export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          community_id: string
          created_at: string
          description: string | null
          id: string
          is_read: boolean | null
          monitoring_rule_id: string | null
          reddit_comment_id: string | null
          reddit_post_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"] | null
          title: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          monitoring_rule_id?: string | null
          reddit_comment_id?: string | null
          reddit_post_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          title: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean | null
          monitoring_rule_id?: string | null
          reddit_comment_id?: string | null
          reddit_post_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_monitoring_rule_id_fkey"
            columns: ["monitoring_rule_id"]
            isOneToOne: false
            referencedRelation: "monitoring_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_moderator: boolean | null
          status: Database["public"]["Enums"]["subreddit_status"] | null
          subreddit_id: string
          subreddit_name: string
          subscribers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_moderator?: boolean | null
          status?: Database["public"]["Enums"]["subreddit_status"] | null
          subreddit_id: string
          subreddit_name: string
          subscribers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_moderator?: boolean | null
          status?: Database["public"]["Enums"]["subreddit_status"] | null
          subreddit_id?: string
          subreddit_name?: string
          subscribers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_rules: {
        Row: {
          community_id: string
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          monitoring_type: Database["public"]["Enums"]["monitoring_type"]
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          monitoring_type: Database["public"]["Enums"]["monitoring_type"]
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          monitoring_type?: Database["public"]["Enums"]["monitoring_type"]
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_rules_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_address: string | null
          id: string
          is_enabled: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          community_id: string | null
          created_at: string
          description: string | null
          frequency: Database["public"]["Enums"]["schedule_frequency"]
          id: string
          is_active: boolean | null
          name: string
          next_run: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          description?: string | null
          frequency: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          is_active?: boolean | null
          name: string
          next_run?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          description?: string | null
          frequency?: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          is_active?: boolean | null
          name?: string
          next_run?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          is_mod: boolean | null
          reddit_id: string
          reddit_username: string
          total_karma: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mod?: boolean | null
          reddit_id: string
          reddit_username: string
          total_karma?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mod?: boolean | null
          reddit_id?: string
          reddit_username?: string
          total_karma?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      monitoring_type: "posts" | "comments" | "modqueue" | "reports"
      notification_type: "email" | "in_app" | "webhook"
      schedule_frequency: "hourly" | "daily" | "weekly" | "monthly"
      subreddit_status: "active" | "paused" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["low", "medium", "high", "critical"],
      monitoring_type: ["posts", "comments", "modqueue", "reports"],
      notification_type: ["email", "in_app", "webhook"],
      schedule_frequency: ["hourly", "daily", "weekly", "monthly"],
      subreddit_status: ["active", "paused", "archived"],
    },
  },
} as const
