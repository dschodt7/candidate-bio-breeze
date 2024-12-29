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