export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      candidates: CandidatesTable;
      executive_summaries: ExecutiveSummariesTable;
      linkedin_sections: LinkedInSectionsTable;
      profiles: ProfilesTable;
      resume_analyses: ResumeAnalysesTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      linkedin_section_type:
        | "about"
        | "experience_1"
        | "experience_2"
        | "experience_3"
        | "skills"
        | "recommendations";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

interface BaseTable<T, I = T, U = T> {
  Row: T;
  Insert: I;
  Update: U;
}

export interface CandidatesTable extends BaseTable<{
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
  linkedin_url: string | null;
  screening_notes: string | null;
  resume_path: string | null;
}> {}

export interface ExecutiveSummariesTable extends BaseTable<{
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  brass_tax_criteria: Json;
  sensory_criteria: Json;
  linkedin_about: string | null;
}> {}

export interface LinkedInSectionsTable extends BaseTable<{
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  section_type: Database['public']['Enums']['linkedin_section_type'];
  content: string | null;
  analysis: Json | null;
}> {}

export interface ProfilesTable extends BaseTable<{
  id: string;
  created_at: string;
  updated_at: string;
}> {}

export interface ResumeAnalysesTable extends BaseTable<{
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  credibility_statements: string | null;
  case_studies: string | null;
  job_assessment: string | null;
  motivations: string | null;
  business_problems: string | null;
  additional_observations: string | null;
}> {}