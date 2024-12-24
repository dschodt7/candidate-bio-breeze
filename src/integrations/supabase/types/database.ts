export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Tables {
  candidates: {
    Row: {
      id: string
      created_at: string
      updated_at: string
      profile_id: string
      linkedin_url: string | null
      screening_notes: string | null
      resume_path: string | null
    }
    Insert: Partial<Tables['candidates']['Row']> & Pick<Tables['candidates']['Row'], 'profile_id'>
    Update: Partial<Tables['candidates']['Row']>
    Relationships: [
      {
        foreignKeyName: "candidates_profile_id_fkey"
        columns: ["profile_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }
  executive_summaries: {
    Row: {
      id: string
      created_at: string
      updated_at: string
      candidate_id: string
      brass_tax_criteria: Json
      sensory_criteria: Json
    }
    Insert: Partial<Omit<Tables['executive_summaries']['Row'], 'candidate_id'>> & { candidate_id: string }
    Update: Partial<Tables['executive_summaries']['Row']>
    Relationships: [
      {
        foreignKeyName: "executive_summaries_candidate_id_fkey"
        columns: ["candidate_id"]
        isOneToOne: false
        referencedRelation: "candidates"
        referencedColumns: ["id"]
      }
    ]
  }
  profiles: {
    Row: {
      id: string
      created_at: string
      updated_at: string
    }
    Insert: Partial<Tables['profiles']['Row']> & Pick<Tables['profiles']['Row'], 'id'>
    Update: Partial<Tables['profiles']['Row']>
    Relationships: []
  }
}

export type Database = {
  public: {
    Tables: Tables
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}