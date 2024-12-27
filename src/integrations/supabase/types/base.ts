export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the basic table structure type
export type TableDefinition = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: {
    foreignKeyName: string
    columns: string[]
    isOneToOne: boolean
    referencedRelation: string
    referencedColumns: string[]
  }[]
}

// Define the Database interface with Tables type parameter
export interface Database {
  public: {
    Tables: Record<string, TableDefinition>
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