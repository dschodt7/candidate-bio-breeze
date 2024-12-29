export interface ExecutiveSummarySectionConfig {
  key: string;
  title: string;
  helpText: string;
  requiresAICompile?: boolean;
  showSourceAnalysis?: boolean;
}

export interface SectionSourceAvailability {
  hasResume: boolean;
  hasLinkedIn: boolean;
  hasScreening: boolean;
}