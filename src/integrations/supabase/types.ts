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
      candidates: {
        Row: {
          created_at: string
          id: string
          linkedin_url: string | null
          name: string
          original_filename: string | null
          profile_id: string
          resume_path: string | null
          resume_text: string | null
          screening_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name: string
          original_filename?: string | null
          profile_id: string
          resume_path?: string | null
          resume_text?: string | null
          screening_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          original_filename?: string | null
          profile_id?: string
          resume_path?: string | null
          resume_text?: string | null
          screening_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_summaries: {
        Row: {
          business_problems: string | null
          business_problems_submitted: boolean
          candidate_id: string
          case_studies: string | null
          case_studies_submitted: boolean
          created_at: string
          credibility_statement: string | null
          credibility_submitted: boolean
          id: string
          linkedin_about: string | null
          linkedin_business_problems_source: Json | null
          linkedin_case_source: Json | null
          linkedin_credibility_source: Json | null
          linkedin_motivations_source: Json | null
          linkedin_results_source: Json | null
          motivations: string | null
          motivations_submitted: boolean
          results_achievements: string | null
          results_submitted: boolean
          resume_business_problems_source: Json | null
          resume_case_source: Json | null
          resume_credibility_source: Json | null
          resume_motivations_source: Json | null
          resume_results_source: Json | null
          sensory_criteria: Json
          updated_at: string
        }
        Insert: {
          business_problems?: string | null
          business_problems_submitted?: boolean
          candidate_id: string
          case_studies?: string | null
          case_studies_submitted?: boolean
          created_at?: string
          credibility_statement?: string | null
          credibility_submitted?: boolean
          id?: string
          linkedin_about?: string | null
          linkedin_business_problems_source?: Json | null
          linkedin_case_source?: Json | null
          linkedin_credibility_source?: Json | null
          linkedin_motivations_source?: Json | null
          linkedin_results_source?: Json | null
          motivations?: string | null
          motivations_submitted?: boolean
          results_achievements?: string | null
          results_submitted?: boolean
          resume_business_problems_source?: Json | null
          resume_case_source?: Json | null
          resume_credibility_source?: Json | null
          resume_motivations_source?: Json | null
          resume_results_source?: Json | null
          sensory_criteria?: Json
          updated_at?: string
        }
        Update: {
          business_problems?: string | null
          business_problems_submitted?: boolean
          candidate_id?: string
          case_studies?: string | null
          case_studies_submitted?: boolean
          created_at?: string
          credibility_statement?: string | null
          credibility_submitted?: boolean
          id?: string
          linkedin_about?: string | null
          linkedin_business_problems_source?: Json | null
          linkedin_case_source?: Json | null
          linkedin_credibility_source?: Json | null
          linkedin_motivations_source?: Json | null
          linkedin_results_source?: Json | null
          motivations?: string | null
          motivations_submitted?: boolean
          results_achievements?: string | null
          results_submitted?: boolean
          resume_business_problems_source?: Json | null
          resume_case_source?: Json | null
          resume_credibility_source?: Json | null
          resume_motivations_source?: Json | null
          resume_results_source?: Json | null
          sensory_criteria?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_summaries_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      ideal_company_profiles: {
        Row: {
          candidate_id: string
          created_at: string
          culture_values: string | null
          culture_values_submitted: boolean | null
          growth_stage: string | null
          growth_stage_submitted: boolean | null
          id: string
          innovation_focus: string | null
          innovation_focus_submitted: boolean | null
          leadership_style: string | null
          leadership_style_submitted: boolean | null
          linkedin_source: Json | null
          market_position: string | null
          market_position_submitted: boolean | null
          preferred_format:
            | Database["public"]["Enums"]["company_profile_format"]
            | null
          preferred_tone:
            | Database["public"]["Enums"]["company_profile_tone"]
            | null
          resume_source: Json | null
          screening_source: Json | null
          team_composition: string | null
          team_composition_submitted: boolean | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          culture_values?: string | null
          culture_values_submitted?: boolean | null
          growth_stage?: string | null
          growth_stage_submitted?: boolean | null
          id?: string
          innovation_focus?: string | null
          innovation_focus_submitted?: boolean | null
          leadership_style?: string | null
          leadership_style_submitted?: boolean | null
          linkedin_source?: Json | null
          market_position?: string | null
          market_position_submitted?: boolean | null
          preferred_format?:
            | Database["public"]["Enums"]["company_profile_format"]
            | null
          preferred_tone?:
            | Database["public"]["Enums"]["company_profile_tone"]
            | null
          resume_source?: Json | null
          screening_source?: Json | null
          team_composition?: string | null
          team_composition_submitted?: boolean | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          culture_values?: string | null
          culture_values_submitted?: boolean | null
          growth_stage?: string | null
          growth_stage_submitted?: boolean | null
          id?: string
          innovation_focus?: string | null
          innovation_focus_submitted?: boolean | null
          leadership_style?: string | null
          leadership_style_submitted?: boolean | null
          linkedin_source?: Json | null
          market_position?: string | null
          market_position_submitted?: boolean | null
          preferred_format?:
            | Database["public"]["Enums"]["company_profile_format"]
            | null
          preferred_tone?:
            | Database["public"]["Enums"]["company_profile_tone"]
            | null
          resume_source?: Json | null
          screening_source?: Json | null
          team_composition?: string | null
          team_composition_submitted?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideal_company_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_sections: {
        Row: {
          analysis: Json | null
          candidate_id: string
          content: string | null
          created_at: string
          id: string
          section_type: Database["public"]["Enums"]["linkedin_section_type"]
          updated_at: string
        }
        Insert: {
          analysis?: Json | null
          candidate_id: string
          content?: string | null
          created_at?: string
          id?: string
          section_type: Database["public"]["Enums"]["linkedin_section_type"]
          updated_at?: string
        }
        Update: {
          analysis?: Json | null
          candidate_id?: string
          content?: string | null
          created_at?: string
          id?: string
          section_type?: Database["public"]["Enums"]["linkedin_section_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_sections_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          additional_observations: string | null
          business_problems: string | null
          candidate_id: string
          case_studies: string | null
          created_at: string
          credibility_statements: string | null
          id: string
          job_assessment: string | null
          motivations: string | null
          updated_at: string
        }
        Insert: {
          additional_observations?: string | null
          business_problems?: string | null
          candidate_id: string
          case_studies?: string | null
          created_at?: string
          credibility_statements?: string | null
          id?: string
          job_assessment?: string | null
          motivations?: string | null
          updated_at?: string
        }
        Update: {
          additional_observations?: string | null
          business_problems?: string | null
          candidate_id?: string
          case_studies?: string | null
          created_at?: string
          credibility_statements?: string | null
          id?: string
          job_assessment?: string | null
          motivations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_analyses: {
        Row: {
          availability_timeline: string | null
          candidate_id: string
          compensation_expectations: string | null
          created_at: string
          current_challenges: string | null
          executive_summary_notes: string | null
          id: string
          raw_notes: string | null
          updated_at: string
          work_arrangements: string | null
        }
        Insert: {
          availability_timeline?: string | null
          candidate_id: string
          compensation_expectations?: string | null
          created_at?: string
          current_challenges?: string | null
          executive_summary_notes?: string | null
          id?: string
          raw_notes?: string | null
          updated_at?: string
          work_arrangements?: string | null
        }
        Update: {
          availability_timeline?: string | null
          candidate_id?: string
          compensation_expectations?: string | null
          created_at?: string
          current_challenges?: string | null
          executive_summary_notes?: string | null
          id?: string
          raw_notes?: string | null
          updated_at?: string
          work_arrangements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_analyses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      company_profile_format: "snapshot" | "detailed" | "strategic"
      company_profile_tone: "strategic" | "visionary" | "pragmatic"
      linkedin_section_type:
        | "about"
        | "experience"
        | "education"
        | "skills"
        | "certifications"
        | "experience_1"
        | "experience_2"
        | "experience_3"
        | "recommendations"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
