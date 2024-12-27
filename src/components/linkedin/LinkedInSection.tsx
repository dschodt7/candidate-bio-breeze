import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { useLinkedInSection } from "@/hooks/useLinkedInSection";
import { LinkedInSectionWrapper } from "./section/LinkedInSectionWrapper";
import { LinkedInSectionContent } from "./section/LinkedInSectionContent";
import { LinkedInSectionInput } from "./section/LinkedInSectionInput";

interface LinkedInSectionProps {
  title: string;
  sectionType: LinkedInSectionType;
}

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Failed to load section: {error.message}
      </AlertDescription>
    </Alert>
  );
};

export const LinkedInSection = ({ 
  title,
  sectionType
}: LinkedInSectionProps) => {
  const {
    savedContent,
    activeTab,
    setActiveTab,
    saveToDatabase,
    handleReset,
    candidateId,
    hasContent
  } = useLinkedInSection(sectionType);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LinkedInSectionWrapper
        title={title}
        sectionType={sectionType}
        hasContent={hasContent}
      >
        {hasContent ? (
          <LinkedInSectionContent
            currentContent={savedContent || ""}
            onSave={(content: string) => saveToDatabase(content)}
            onReset={handleReset}
          />
        ) : (
          <LinkedInSectionInput
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            candidateId={candidateId}
            onSave={saveToDatabase}
            onReset={handleReset}
          />
        )}
      </LinkedInSectionWrapper>
    </ErrorBoundary>
  );
};