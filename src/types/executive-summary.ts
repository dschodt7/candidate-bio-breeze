export interface ExecutiveSummary {
  id: string;
  created_at: string;
  updated_at: string;
  candidate_id: string;
  brass_tax_criteria: BrassTaxCriteria;
  sensory_criteria: Json;
  linkedin_about: string | null;
  credibility_submitted: boolean;
  credibility_source_analysis: SourceAnalysisResult | null;
}

export interface BrassTaxCriteria {
  credibility?: string;
}

export interface MergeResult {
  mergedStatements: string[];
  sourceBreakdown: SourceAnalysisResult;
}

export interface SourceAnalysisResult {
  resume: SourceAnalysis | string;
  linkedin: SourceAnalysis | string;
}

export interface SourceAnalysis {
  relevance?: string;
  confidence?: string;
  uniqueValue?: string;
}