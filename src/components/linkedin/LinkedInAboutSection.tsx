import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./about/LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./about/LinkedInTextInput";
import { LinkedInAboutHeader } from "./about/LinkedInAboutHeader";
import { LinkedInAboutTip } from "./about/LinkedInAboutTip";
import { useLinkedInAbout } from "@/hooks/useLinkedInAbout";

interface LinkedInAboutSectionProps {
  onContentSaved: () => void;
  onContentReset: () => void;
}

export const LinkedInAboutSection = ({ 
  onContentSaved,
  onContentReset 
}: LinkedInAboutSectionProps) => {
  const {
    savedContent,
    activeTab,
    setActiveTab,
    saveToDatabase,
    handleReset
  } = useLinkedInAbout();

  const handleSave = async (content: string) => {
    await saveToDatabase(content);
    onContentSaved();
  };

  const handleResetContent = async () => {
    await handleReset();
    onContentReset();
  };

  return (
    <div className="space-y-4">
      <LinkedInAboutHeader />
      
      <Tabs 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "text" | "screenshot")}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="text" 
            disabled={savedContent !== null}
          >
            Paste Text
          </TabsTrigger>
          <TabsTrigger 
            value="screenshot" 
            disabled={savedContent !== null}
          >
            Upload Screenshot
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <LinkedInTextInput 
            onSubmit={handleSave}
            initialContent={savedContent}
            onContentSaved={() => {
              onContentSaved();
              setActiveTab("text");
            }}
            onReset={handleResetContent}
          />
        </TabsContent>
        
        <TabsContent value="screenshot">
          <LinkedInScreenshotUpload 
            candidateId={searchParams.get('candidate')} 
            onSuccess={(text) => {
              handleSave(text);
              setActiveTab("screenshot");
            }}
          />
        </TabsContent>
      </Tabs>

      <LinkedInAboutTip />
    </div>
  );
};