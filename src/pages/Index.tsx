import { FileUpload } from "@/components/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight animate-fadeIn">
            Executive Summary Components
          </h1>
          <p className="text-lg text-muted-foreground animate-fadeIn">
            Transform candidate information into comprehensive executive summaries
          </p>
        </div>

        <div className="grid gap-6">
          <FileUpload />
          <LinkedInInput />
          <NotesInput />
          <ExecutiveSummaryForm />
        </div>
      </div>
    </div>
  );
};

export default Index;