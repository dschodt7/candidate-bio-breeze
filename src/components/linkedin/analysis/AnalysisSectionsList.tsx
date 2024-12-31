/**
 * ⚠️ WARNING: This component is locked and should not be modified without explicit approval.
 * Last verified working state: March 2024
 * Contact: Project owner
 */

import { AnalysisSection } from "@/components/file-upload/analysis/AnalysisSection";
import { useAnalysisState } from "@/components/file-upload/analysis/useAnalysisState";

// This configuration is locked - do not modify without explicit approval
const ANALYSIS_SECTIONS = [
  { key: 'jobAssessment', title: 'Assessment of Current Skills and Experiences' },
  { key: 'caseStudies', title: 'Case Studies' },
  { key: 'credibilityStatements', title: 'Results and Achievements' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'interests', title: 'Interests' },
  { key: 'activities', title: 'Activities and Hobbies' },
  { key: 'foundationalUnderstanding', title: 'Foundational Understanding on a Personal Level' },
];

// This component is locked - do not modify without explicit approval
export const AnalysisSectionsList = ({
  candidateId,
  analysis,
  isLoading
}: {
  candidateId: string;
  analysis: any;
  isLoading: boolean;
}) => {
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

// End of locked component