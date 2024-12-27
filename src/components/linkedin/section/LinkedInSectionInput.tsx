import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "../LinkedInScreenshotUpload";
import { LinkedInTextInput } from "../LinkedInTextInput";

interface LinkedInSectionInputProps {
  activeTab: "text" | "screenshot";
  setActiveTab: (tab: "text" | "screenshot") => void;
  candidateId: string | null;
  onSave: (content: string) => void;
  onReset: () => void;
}

export const LinkedInSectionInput = ({
  activeTab,
  setActiveTab,
  candidateId,
  onSave,
  onReset
}: LinkedInSectionInputProps) => {
  return (
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
          onSubmit={onSave}
          initialContent={null}
          onContentSaved={() => setActiveTab("text")}
          onReset={onReset}
        />
      </TabsContent>
      
      <TabsContent value="screenshot">
        <LinkedInScreenshotUpload 
          candidateId={candidateId} 
          onSuccess={(text) => {
            onSave(text);
            setActiveTab("screenshot");
          }}
          onReset={onReset}
        />
      </TabsContent>
    </Tabs>
  );
};