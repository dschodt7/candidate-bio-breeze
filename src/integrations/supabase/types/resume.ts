export interface ResumeAnalysis {
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
}

export type ResumeAnalysisInsert = Omit<ResumeAnalysis, 'id' | 'created_at' | 'updated_at'>;