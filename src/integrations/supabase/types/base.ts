export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Tables
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      linkedin_section_type:
        | "about"
        | "experience_1"
        | "experience_2"
        | "experience_3"
        | "skills"
        | "recommendations"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}