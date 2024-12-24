import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { ExecutiveSummaryCompiler } from "@/components/ExecutiveSummaryCompiler";
import { useCandidate } from "@/hooks/useCandidate";

const MainContentPanel = () => {
  const { candidate, getCandidateName } = useCandidate();

  return (
    <>
      <ResizablePanel defaultSize={55} className="p-0">
        <div className="h-full p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{getCandidateName()}</h2>
              {!candidate && (
                <p className="text-lg text-muted-foreground animate-fadeIn">
                  Select a candidate from the left panel to view and edit their information
                </p>
              )}
            </div>

            {candidate && (
              <div className="grid gap-6">
                <FileUpload />
                <LinkedInInput />
                <NotesInput />
                <ExecutiveSummaryCompiler />
                <ExecutiveSummaryForm />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default MainContentPanel;