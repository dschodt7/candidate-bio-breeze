export interface ScreeningAnalysisSection {
  title: string;
  key: keyof ScreeningAnalysisData;
  helpText: string;
}

export interface ScreeningAnalysisData {
  compensation_expectations: string;
  work_arrangements: string;
  availability_timeline: string;
  current_challenges: string;
  executive_summary_notes: string;
}

export interface ScreeningAnalysisProps {
  notes: string;
  isNotesSubmitted: boolean;
  candidateId: string | null;
}