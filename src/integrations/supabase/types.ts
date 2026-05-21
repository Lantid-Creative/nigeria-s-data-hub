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
      ai_briefings: {
        Row: {
          briefing_date: string
          bullets: Json
          created_at: string
          id: string
          scope: string
          summary: string | null
        }
        Insert: {
          briefing_date?: string
          bullets?: Json
          created_at?: string
          id?: string
          scope: string
          summary?: string | null
        }
        Update: {
          briefing_date?: string
          bullets?: Json
          created_at?: string
          id?: string
          scope?: string
          summary?: string | null
        }
        Relationships: []
      }
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
      commitments: {
        Row: {
          created_at: string
          cycle_id: string | null
          description: string | null
          dimension_code: string | null
          id: string
          owner: string | null
          progress: number
          state_code: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          dimension_code?: string | null
          id?: string
          owner?: string | null
          progress?: number
          state_code: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string | null
          description?: string | null
          dimension_code?: string | null
          id?: string
          owner?: string | null
          progress?: number
          state_code?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "reporting_cycles"
            referencedColumns: ["id"]
          },
        ]
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
      digest_log: {
        Row: {
          created_at: string
          digest_type: string
          id: string
          payload: Json
          period_label: string
          recipients_count: number
          summary: string | null
        }
        Insert: {
          created_at?: string
          digest_type: string
          id?: string
          payload?: Json
          period_label: string
          recipients_count?: number
          summary?: string | null
        }
        Update: {
          created_at?: string
          digest_type?: string
          id?: string
          payload?: Json
          period_label?: string
          recipients_count?: number
          summary?: string | null
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
      evidence_uploads: {
        Row: {
          created_at: string
          cycle_id: string | null
          extracted_text: string | null
          file_name: string
          file_path: string
          id: string
          ocr_status: string
          question_code: string | null
          size_bytes: number | null
          state_code: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          cycle_id?: string | null
          extracted_text?: string | null
          file_name: string
          file_path: string
          id?: string
          ocr_status?: string
          question_code?: string | null
          size_bytes?: number | null
          state_code: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          cycle_id?: string | null
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          id?: string
          ocr_status?: string
          question_code?: string | null
          size_bytes?: number | null
          state_code?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_uploads_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "reporting_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      governor_engagement: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          id: string
          responsiveness: number | null
          state_code: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          event_date?: string
          event_type: string
          id?: string
          responsiveness?: number | null
          state_code: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          responsiveness?: number | null
          state_code?: string
          summary?: string | null
        }
        Relationships: []
      }
      grants_registry: {
        Row: {
          amount_usd: number | null
          created_at: string
          donor: string
          end_date: string | null
          id: string
          notes: string | null
          program: string
          start_date: string | null
          state_code: string | null
          status: string
        }
        Insert: {
          amount_usd?: number | null
          created_at?: string
          donor: string
          end_date?: string | null
          id?: string
          notes?: string | null
          program: string
          start_date?: string | null
          state_code?: string | null
          status?: string
        }
        Update: {
          amount_usd?: number | null
          created_at?: string
          donor?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          program?: string
          start_date?: string | null
          state_code?: string | null
          status?: string
        }
        Relationships: []
      }
      horizon_signals: {
        Row: {
          created_at: string
          dimension_code: string | null
          id: string
          signal_type: string | null
          source_url: string | null
          summary: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          dimension_code?: string | null
          id?: string
          signal_type?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          dimension_code?: string | null
          id?: string
          signal_type?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      indicator_rules: {
        Row: {
          created_at: string
          id: string
          indicator_id: string
          max_value: number | null
          max_yoy_delta_pct: number | null
          min_value: number | null
          notes: string | null
          requires_evidence: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_id: string
          max_value?: number | null
          max_yoy_delta_pct?: number | null
          min_value?: number | null
          notes?: string | null
          requires_evidence?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          indicator_id?: string
          max_value?: number | null
          max_yoy_delta_pct?: number | null
          min_value?: number | null
          notes?: string | null
          requires_evidence?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "indicator_rules_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: true
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
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
      press_clippings: {
        Row: {
          created_at: string
          headline: string
          id: string
          outlet: string | null
          published_at: string
          sentiment: string | null
          state_code: string | null
          topic: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          headline: string
          id?: string
          outlet?: string | null
          published_at?: string
          sentiment?: string | null
          state_code?: string | null
          topic?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          headline?: string
          id?: string
          outlet?: string | null
          published_at?: string
          sentiment?: string | null
          state_code?: string | null
          topic?: string | null
          url?: string | null
        }
        Relationships: []
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
      publish_queue: {
        Row: {
          approver_id: string | null
          artifact_id: string | null
          artifact_type: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          scheduled_for: string | null
          status: string
          title: string
        }
        Insert: {
          approver_id?: string | null
          artifact_id?: string | null
          artifact_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          status?: string
          title: string
        }
        Update: {
          approver_id?: string | null
          artifact_id?: string | null
          artifact_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          id: string
          key: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      report_downloads_log: {
        Row: {
          created_at: string
          id: string
          report_id: string
          state_code: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          state_code?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          state_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_downloads_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
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
          author_id: string | null
          body: Json
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
          author_id?: string | null
          body?: Json
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
          author_id?: string | null
          body?: Json
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
      reviewer_feedback: {
        Row: {
          body: string
          created_at: string
          id: string
          question_code: string | null
          resolved: boolean
          reviewer_id: string | null
          state_code: string
          submission_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          question_code?: string | null
          resolved?: boolean
          reviewer_id?: string | null
          state_code: string
          submission_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          question_code?: string | null
          resolved?: boolean
          reviewer_id?: string | null
          state_code?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "survey_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_register: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dimension_code: string | null
          id: string
          impact: number
          mitigation: string | null
          probability: number
          state_code: string | null
          status: string
          title: string
          trend: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimension_code?: string | null
          id?: string
          impact?: number
          mitigation?: string | null
          probability?: number
          state_code?: string | null
          status?: string
          title: string
          trend?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimension_code?: string | null
          id?: string
          impact?: number
          mitigation?: string | null
          probability?: number
          state_code?: string | null
          status?: string
          title?: string
          trend?: string | null
        }
        Relationships: []
      }
      saved_scenarios: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_shared: boolean
          name: string
          shocks: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_shared?: boolean
          name: string
          shocks?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_shared?: boolean
          name?: string
          shocks?: Json
          updated_at?: string
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
      state_nudges: {
        Row: {
          channel: string | null
          cycle_id: string | null
          id: string
          message: string
          sent_at: string
          sent_by: string | null
          state_code: string
        }
        Insert: {
          channel?: string | null
          cycle_id?: string | null
          id?: string
          message: string
          sent_at?: string
          sent_by?: string | null
          state_code: string
        }
        Update: {
          channel?: string | null
          cycle_id?: string | null
          id?: string
          message?: string
          sent_at?: string
          sent_by?: string | null
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_nudges_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "reporting_cycles"
            referencedColumns: ["id"]
          },
        ]
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
      support_tickets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          priority: string
          state_code: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          state_code: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          priority?: string
          state_code?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
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
          ai_risk_score: number
          completion_pct: number
          flags: Json
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
          ai_risk_score?: number
          completion_pct?: number
          flags?: Json
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
          ai_risk_score?: number
          completion_pct?: number
          flags?: Json
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
      ticket_messages: {
        Row: {
          author_id: string | null
          author_role: string
          body: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          author_role: string
          body: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
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
