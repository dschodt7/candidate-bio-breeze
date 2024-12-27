import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { useLinkedInSection } from "@/hooks/useLinkedInSection";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
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

  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(savedContent || "");

  useEffect(() => {
    setCurrentContent(savedContent || "");
  }, [savedContent]);

  const handleSave = async (content: string) => {
    await saveToDatabase(content);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleResetContent = async () => {
    await handleReset();
    setIsEditing(false);
    setCurrentContent("");
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AccordionItem value={sectionType}>
        <AccordionTrigger className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{title} Details</h4>
            </div>
            
            {hasContent ? (
              <LinkedInSectionContent
                currentContent={currentContent}
                isEditing={isEditing}
                hasContent={hasContent}
                onContentChange={setCurrentContent}
                onSave={() => handleSave(currentContent)}
                onEdit={handleEdit}
                onReset={handleResetContent}
              />
            ) : (
              <LinkedInSectionInput
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                candidateId={candidateId}
                onSave={handleSave}
                onReset={handleResetContent}
              />
            )}

            <p className="text-sm text-muted-foreground">
              Tip: You can either paste a screenshot of the {title} section or directly paste the text
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};