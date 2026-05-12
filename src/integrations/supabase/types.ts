export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_reads: {
        Row: {
          alert_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          alert_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          alert_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_reads_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["alert_level"]
          state_code: string | null
          title: string
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["alert_level"]
          state_code?: string | null
          title: string
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["alert_level"]
          state_code?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          organisation: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          organisation?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          organisation?: string | null
          topic?: string
        }
        Relationships: []
      }
      dimensions: {
        Row: {
          code: string
          description: string | null
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      indicators: {
        Row: {
          created_at: string
          dimension_code: string
          direction: string
          id: string
          name: string
          sort_order: number
          source: string | null
          sub_component: string | null
        }
        Insert: {
          created_at?: string
          dimension_code: string
          direction: string
          id?: string
          name: string
          sort_order?: number
          source?: string | null
          sub_component?: string | null
        }
        Update: {
          created_at?: string
          dimension_code?: string
          direction?: string
          id?: string
          name?: string
          sort_order?: number
          source?: string | null
          sub_component?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_dimension_code_fkey"
            columns: ["dimension_code"]
            isOneToOne: false
            referencedRelation: "dimensions"
            referencedColumns: ["code"]
          },
        ]
      }
      innovation_pilots: {
        Row: {
          created_at: string
          id: string
          impact: string | null
          stage: string
          state_code: string | null
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact?: string | null
          stage: string
          state_code?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          impact?: string | null
          stage?: string
          state_code?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_pilots_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          state_code: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          state_code?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          state_code?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reporting_cycles: {
        Row: {
          code: string
          ends_on: string
          id: string
          is_current: boolean
          label: string
          starts_on: string
        }
        Insert: {
          code: string
          ends_on: string
          id?: string
          is_current?: boolean
          label: string
          starts_on: string
        }
        Update: {
          code?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          label?: string
          starts_on?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          downloads: number
          file_url: string | null
          id: string
          is_public: boolean
          pages: number | null
          published_on: string
          summary: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          downloads?: number
          file_url?: string | null
          id?: string
          is_public?: boolean
          pages?: number | null
          published_on: string
          summary?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          downloads?: number
          file_url?: string | null
          id?: string
          is_public?: boolean
          pages?: number | null
          published_on?: string
          summary?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          created_at: string
          id: string
          lead_name: string
          progress: number
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_name: string
          progress?: number
          status: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_name?: string
          progress?: number
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          code: string
          growth: number | null
          id: string
          name: string
          poverty: number | null
          probability: number
          sort_order: number
          summary: string
        }
        Insert: {
          code: string
          growth?: number | null
          id?: string
          name: string
          poverty?: number | null
          probability: number
          sort_order?: number
          summary: string
        }
        Update: {
          code?: string
          growth?: number | null
          id?: string
          name?: string
          poverty?: number | null
          probability?: number
          sort_order?: number
          summary?: string
        }
        Relationships: []
      }
      state_scores: {
        Row: {
          climate: number | null
          created_at: string
          cycle_id: string
          economic: number | null
          fiscal: number | null
          governance: number | null
          human_capital: number | null
          id: string
          resilience_index: number
          security: number | null
          social: number | null
          state_code: string
        }
        Insert: {
          climate?: number | null
          created_at?: string
          cycle_id: string
          economic?: number | null
          fiscal?: number | null
          governance?: number | null
          human_capital?: number | null
          id?: string
          resilience_index: number
          security?: number | null
          social?: number | null
          state_code: string
        }
        Update: {
          climate?: number | null
          created_at?: string
          cycle_id?: string
          economic?: number | null
          fiscal?: number | null
          governance?: number | null
          human_capital?: number | null
          id?: string
          resilience_index?: number
          security?: number | null
          social?: number | null
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_scores_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "reporting_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "state_scores_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      states: {
        Row: {
          capital: string | null
          code: string
          created_at: string
          name: string
          population_millions: number | null
          zone_code: string
        }
        Insert: {
          capital?: string | null
          code: string
          created_at?: string
          name: string
          population_millions?: number | null
          zone_code: string
        }
        Update: {
          capital?: string | null
          code?: string
          created_at?: string
          name?: string
          population_millions?: number | null
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_zone_code_fkey"
            columns: ["zone_code"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["code"]
          },
        ]
      }
      survey_questions: {
        Row: {
          code: string
          created_at: string
          help_text: string | null
          id: string
          label: string
          options: Json | null
          question_type: string
          required: boolean
          section_id: string
          sort_order: number
          unit: string | null
        }
        Insert: {
          code: string
          created_at?: string
          help_text?: string | null
          id?: string
          label: string
          options?: Json | null
          question_type?: string
          required?: boolean
          section_id: string
          sort_order?: number
          unit?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          help_text?: string | null
          id?: string
          label?: string
          options?: Json | null
          question_type?: string
          required?: boolean
          section_id?: string
          sort_order?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "survey_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_sections: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          survey_id: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          survey_id: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          survey_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_sections_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_submissions: {
        Row: {
          completion_pct: number
          id: string
          payload: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state_code: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          submitted_by: string | null
          survey_id: string
          updated_at: string
        }
        Insert: {
          completion_pct?: number
          id?: string
          payload?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_code: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          survey_id: string
          updated_at?: string
        }
        Update: {
          completion_pct?: number
          id?: string
          payload?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_code?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_submissions_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "survey_submissions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          code: string
          created_at: string
          cycle_id: string | null
          description: string | null
          due_date: string | null
          id: string
          questions: number
          sections: number
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          questions?: number
          sections?: number
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          questions?: number
          sections?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "reporting_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          state_code: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          state_code?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          state_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_state_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_report_downloads: {
        Args: { _report_id: string }
        Returns: undefined
      }
      log_event: {
        Args: {
          _action: string
          _entity: string
          _entity_id?: string
          _metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      alert_level: "info" | "medium" | "high"
      app_role: "ngf_staff" | "state_user" | "partner"
      submission_status:
        | "not_started"
        | "in_progress"
        | "submitted"
        | "overdue"
        | "approved"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_level: ["info", "medium", "high"],
      app_role: ["ngf_staff", "state_user", "partner"],
      submission_status: [
        "not_started",
        "in_progress",
        "submitted",
        "overdue",
        "approved",
        "rejected",
      ],
    },
  },
} as const
