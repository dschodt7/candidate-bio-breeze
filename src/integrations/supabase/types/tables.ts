import { Json } from './base';

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
      linkedin_about: string | null
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
  linkedin_sections: {
    Row: {
      id: string
      created_at: string
      updated_at: string
      candidate_id: string
      section_type: Database["public"]["Enums"]["linkedin_section_type"]
      content: string | null
      analysis: Json | null
    }
    Insert: Partial<Tables['linkedin_sections']['Row']> & Pick<Tables['linkedin_sections']['Row'], 'candidate_id' | 'section_type'>
    Update: Partial<Tables['linkedin_sections']['Row']>
    Relationships: [
      {
        foreignKeyName: "linkedin_sections_candidate_id_fkey"
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