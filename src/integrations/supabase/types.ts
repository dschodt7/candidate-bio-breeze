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
          profile_id: string
          resume_path: string | null
          screening_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          linkedin_url?: string | null
          profile_id: string
          resume_path?: string | null
          screening_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          linkedin_url?: string | null
          profile_id?: string
          resume_path?: string | null
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
          brass_tax_criteria: Json
          candidate_id: string
          created_at: string
          id: string
          linkedin_about: string | null
          sensory_criteria: Json
          updated_at: string
        }
        Insert: {
          brass_tax_criteria?: Json
          candidate_id: string
          created_at?: string
          id?: string
          linkedin_about?: string | null
          sensory_criteria?: Json
          updated_at?: string
        }
        Update: {
          brass_tax_criteria?: Json
          candidate_id?: string
          created_at?: string
          id?: string
          linkedin_about?: string | null
          sensory_criteria?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_summaries_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
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
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
