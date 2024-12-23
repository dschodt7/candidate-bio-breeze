import { FileUpload } from "@/components/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { BioPreview } from "@/components/BioPreview";
import { Button } from "@/components/ui/button";

const Index = () => {
  const handleGenerate = () => {
    console.log("Generating bio...");
    // TODO: Implement bio generation logic
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight animate-fadeIn">
            Executive Bio Generator
          </h1>
          <p className="text-lg text-muted-foreground animate-fadeIn">
            Transform resumes and notes into polished professional bios
          </p>
        </div>

        <div className="grid gap-6">
          <FileUpload />
          <LinkedInInput />
          <NotesInput />
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-8 animate-slideUp"
              onClick={handleGenerate}
            >
              Generate Bio
            </Button>
          </div>
          <BioPreview />
        </div>
      </div>
    </div>
  );
};

export default Index;