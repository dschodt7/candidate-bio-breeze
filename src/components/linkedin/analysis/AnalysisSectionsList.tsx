import { AnalysisSection } from "@/components/file-upload/analysis/AnalysisSection";
import { useAnalysisState } from "@/components/file-upload/analysis/useAnalysisState";

const ANALYSIS_SECTIONS = [
  { key: 'credibilityStatements', title: 'Credibility Statements' },
  { key: 'caseStudies', title: 'Case Studies' },
  { key: 'jobAssessment', title: 'Assessment of Current Skills and Experiences' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'interests', title: 'Interests' },
  { key: 'activities', title: 'Activities and Hobbies' },
  { key: 'foundationalUnderstanding', title: 'Foundational Understanding on a Personal Level' },
];

interface AnalysisSectionsListProps {
  candidateId: string;
  analysis: any;
  isLoading: boolean;
}

export const AnalysisSectionsList = ({
  candidateId,
  analysis,
  isLoading
}: AnalysisSectionsListProps) => {
  const {
    editingSection,
    editedContent,
    handleEdit,
    handleSave,
    setEditedContent
  } = useAnalysisState(candidateId, analysis);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analysis...</p>;
  }

  return (
    <div className="space-y-4 pt-2">
      {ANALYSIS_SECTIONS.map(({ key, title }) => (
        <AnalysisSection
          key={key}
          title={title}
          content={analysis?.[key] || ""}
          isEditing={editingSection === key}
          editedContent={editedContent}
          onEdit={() => handleEdit(key, analysis?.[key] || "")}
          onSave={() => handleSave(key)}
          onContentChange={setEditedContent}
        />
      ))}
    </div>
  );
};