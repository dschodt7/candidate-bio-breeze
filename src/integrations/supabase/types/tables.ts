import { Json } from './database';

interface BaseRecord {
  created_at: string;
  updated_at: string;
  id: string;
}

export interface CandidatesTable {
  Row: BaseRecord & {
    profile_id: string;
    linkedin_url: string | null;
    screening_notes: string | null;
    resume_path: string | null;
  }
  Insert: Partial<CandidatesTable['Row']> & Pick<CandidatesTable['Row'], 'profile_id'>
  Update: Partial<CandidatesTable['Row']>
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

export interface ExecutiveSummariesTable {
  Row: BaseRecord & {
    brass_tax_criteria: Json;
    candidate_id: string;
    sensory_criteria: Json;
  }
  Insert: Partial<Omit<ExecutiveSummariesTable['Row'], 'candidate_id'>> & { candidate_id: string }
  Update: Partial<ExecutiveSummariesTable['Row']>
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

export interface ProfilesTable {
  Row: BaseRecord
  Insert: Partial<ProfilesTable['Row']> & Pick<ProfilesTable['Row'], 'id'>
  Update: Partial<ProfilesTable['Row']>
  Relationships: []
}