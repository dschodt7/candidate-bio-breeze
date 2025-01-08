import { Json } from "@/integrations/supabase/types/json";

export interface ExecutiveSummary {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  sensory_criteria: Json;
  linkedin_about: string | null;
  credibility_submitted: boolean;
  resume_credibility_source: SourceAnalysis | null;
  linkedin_credibility_source: SourceAnalysis | null;
  credibility_statement: string | null;
  results_achievements: string | null;
  resume_results_source: SourceAnalysis | null;
  linkedin_results_source: SourceAnalysis | null;
  case_studies: string | null;
  resume_case_source: SourceAnalysis | null;
  linkedin_case_source: SourceAnalysis | null;
  business_problems: string | null;
  resume_business_problems_source: SourceAnalysis | null;
  linkedin_business_problems_source: SourceAnalysis | null;
  motivations: string | null;
  resume_motivations_source: SourceAnalysis | null;
  linkedin_motivations_source: SourceAnalysis | null;
}

export interface SourceAnalysis {
  relevance?: string;
  confidence?: string;
  uniqueValue?: string;
}

export interface MergeResult {
  mergedStatements: string[];
  sourceBreakdown: {
    resume: SourceAnalysis;
    linkedin: SourceAnalysis;
  };
}