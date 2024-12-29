import { Json } from "@/integrations/supabase/types";

export interface ExecutiveSummary {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  brass_tax_criteria: BrassTaxCriteria;
  sensory_criteria: Json;
  linkedin_about: string | null;
  credibility_submitted: boolean;
}

export interface BrassTaxCriteria {
  compensation?: string;
  workPreference?: string;
  credibility?: string;
  caseStudies?: string;
  jobAssessment?: string;
  motivations?: string;
  timeframe?: string;
}

export interface MergeResult {
  mergedStatements: string[];
  sourceBreakdown: {
    resume: string | SourceAnalysis;
    linkedin: string | SourceAnalysis;
  };
}

export interface SourceAnalysis {
  relevance?: string;
  confidence?: string;
  uniqueValue?: string;
}