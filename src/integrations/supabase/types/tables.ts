import { Json } from './database';

interface CandidateBase {
  created_at: string
  id: string
  linkedin_url: string | null
  profile_id: string
  resume_path: string | null
  screening_notes: string | null
  updated_at: string
}

export interface CandidatesTable {
  Row: CandidateBase
  Insert: Partial<CandidateBase> & Pick<CandidateBase, 'profile_id'>
  Update: Partial<CandidateBase>
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

interface ExecutiveSummaryBase {
  brass_tax_criteria: Json
  candidate_id: string
  created_at: string
  id: string
  sensory_criteria: Json
  updated_at: string
}

export interface ExecutiveSummariesTable {
  Row: ExecutiveSummaryBase
  Insert: Partial<Omit<ExecutiveSummaryBase, 'candidate_id'>> & { candidate_id: string }
  Update: Partial<ExecutiveSummaryBase>
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

interface ProfileBase {
  created_at: string
  id: string
  updated_at: string
}

export interface ProfilesTable {
  Row: ProfileBase
  Insert: Partial<ProfileBase> & Pick<ProfileBase, 'id'>
  Update: Partial<ProfileBase>
  Relationships: []
}