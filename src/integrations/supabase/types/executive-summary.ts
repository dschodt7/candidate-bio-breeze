import { Json } from './json';

export interface ExecutiveSummariesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    candidate_id: string;
    sensory_criteria: Json;
    linkedin_about: string | null;
    credibility_submitted: boolean;
    resume_credibility_source: Json | null;
    linkedin_credibility_source: Json | null;
    credibility_statement: string | null;
    results_achievements: string | null;
    resume_results_source: Json | null;
    linkedin_results_source: Json | null;
    case_studies: string | null;
    resume_case_source: Json | null;
    linkedin_case_source: Json | null;
    business_problems: string | null;
    resume_business_problems_source: Json | null;
    linkedin_business_problems_source: Json | null;
    motivations: string | null;
    resume_motivations_source: Json | null;
    linkedin_motivations_source: Json | null;
  };
  Insert: Partial<Omit<ExecutiveSummariesTable['Row'], 'candidate_id'>> & { candidate_id: string };
  Update: Partial<ExecutiveSummariesTable['Row']>;
  Relationships: [
    {
      foreignKeyName: "executive_summaries_candidate_id_fkey";
      columns: ["candidate_id"];
      isOneToOne: false;
      referencedRelation: "candidates";
      referencedColumns: ["id"];
    }
  ];
}