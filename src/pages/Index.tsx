import { FileUpload } from "@/components/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface CompileState {
  isCompiling: boolean;
  isCompiled: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [compileState, setCompileState] = useState<CompileState>({
    isCompiling: false,
    isCompiled: false,
  });

  const handleCompile = async () => {
    try {
      setCompileState({ isCompiling: true, isCompiled: false });
      console.log("Starting compilation of executive summary components");

      // Simulate processing time (remove this when implementing actual OpenAI integration)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCompileState({ isCompiling: false, isCompiled: true });
      console.log("Executive summary components compiled successfully");
      
      toast({
        title: "Compilation Complete",
        description: "Executive summary components have been compiled successfully.",
      });
    } catch (error) {
      console.error("Error compiling executive summary:", error);
      setCompileState({ isCompiling: false, isCompiled: false });
      toast({
        title: "Compilation Failed",
        description: "There was an error compiling the executive summary components.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold">Executive Summary Components</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Candidates */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">Candidates</h2>
              <div className="space-y-2">
                {/* Placeholder for candidate list */}
                <p className="text-sm text-gray-500">No candidates yet</p>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - Main Content */}
          <ResizablePanel defaultSize={55}>
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground animate-fadeIn">
                    Transform candidate information into comprehensive executive summaries
                  </p>
                </div>

                <div className="grid gap-6">
                  <FileUpload />
                  <LinkedInInput />
                  <NotesInput />
                  <Button 
                    onClick={handleCompile}
                    className="w-full py-6 text-lg font-medium"
                    disabled={compileState.isCompiling}
                  >
                    {compileState.isCompiling 
                      ? "Compiling Executive Summary Components..." 
                      : "Compile Executive Summary Components"}
                  </Button>
                  <ExecutiveSummaryForm />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - AI Assistant */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">Personal AI Assistant</h2>
              <div className="space-y-2">
                {/* Placeholder for AI Assistant */}
                <p className="text-sm text-gray-500">AI Assistant coming soon...</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;