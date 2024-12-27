import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./screenshot/LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./LinkedInTextInput";
import { LinkedInAboutHeader } from "./LinkedInAboutHeader";
import { LinkedInAboutTip } from "./LinkedInAboutTip";
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
    handleReset,
    candidateId
  } = useLinkedInAbout();

  const handleSave = async (content: string) => {
    await saveToDatabase(content);
    onContentSaved();
  };

  const handleResetContent = async () => {
    console.log("Handling reset in LinkedInAboutSection");
    await handleReset();
    setActiveTab("text");
    // Ensure we call onContentReset after the state has been updated
    setTimeout(() => {
      onContentReset();
    }, 0);
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
              onContentSaved();
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
          />
        </TabsContent>
      </Tabs>

      <LinkedInAboutTip />
    </div>
  );
};