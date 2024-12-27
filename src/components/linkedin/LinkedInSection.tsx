import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./LinkedInTextInput";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { useLinkedInSection } from "@/hooks/useLinkedInSection";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { useState, useEffect } from "react";

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
              <div className="space-y-4">
                <EditableTextarea
                  value={currentContent}
                  onChange={(value) => setCurrentContent(value)}
                  placeholder={`Your ${title} content`}
                  maxLength={2000}
                  disabled={!isEditing}
                />
                <TextareaActions
                  isSubmitted={hasContent && !isEditing}
                  isEditing={isEditing}
                  hasContent={!!currentContent.trim()}
                  onSubmit={() => handleSave(currentContent)}
                  onEdit={handleEdit}
                  onReset={handleResetContent}
                />
              </div>
            ) : (
              <Tabs 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "text" | "screenshot")}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="screenshot">
                    Upload Screenshot
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text">
                  <LinkedInTextInput 
                    onSubmit={handleSave}
                    initialContent={savedContent}
                    onContentSaved={() => {
                      setActiveTab("text");
                    }}
                    onReset={handleResetContent}
                  />
                </TabsContent>
                
                <TabsContent value="screenshot">
                  <LinkedInScreenshotUpload 
                    candidateId={candidateId} 
                    onSuccess={(text) => {
                      handleSave(text);
                      setActiveTab("screenshot");
                    }}
                    onReset={handleResetContent}
                  />
                </TabsContent>
              </Tabs>
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