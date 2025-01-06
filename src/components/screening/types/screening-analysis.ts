export interface ScreeningAnalysisSection {
  key: keyof ScreeningAnalysisData;
  title: string;
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

export interface AnalyzeButtonProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isDisabled: boolean;
}

export interface AnalysisSectionsListProps {
  analysis: ScreeningAnalysisData | null;
  isLoading: boolean;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
  onUpdateSection: (sectionKey: keyof ScreeningAnalysisData, content: string) => void;
  hasContent: boolean;
}
