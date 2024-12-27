import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./LinkedInTextInput";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { useLinkedInSection } from "@/hooks/useLinkedInSection";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleSave = async (content: string) => {
    await saveToDatabase(content);
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
            
            <Tabs 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "text" | "screenshot")}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="text" 
                  disabled={!!savedContent}
                >
                  Paste Text
                </TabsTrigger>
                <TabsTrigger 
                  value="screenshot" 
                  disabled={!!savedContent}
                >
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
                  onReset={handleReset}
                />
              </TabsContent>
              
              <TabsContent value="screenshot">
                <LinkedInScreenshotUpload 
                  candidateId={candidateId} 
                  onSuccess={(text) => {
                    handleSave(text);
                    setActiveTab("screenshot");
                  }}
                  onReset={handleReset}
                />
              </TabsContent>
            </Tabs>

            <p className="text-sm text-muted-foreground">
              Tip: You can either paste a screenshot of the {title} section or directly paste the text
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </ErrorBoundary>
  );
};