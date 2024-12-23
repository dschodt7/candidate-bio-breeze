import { FileUpload } from "@/components/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

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
  );
};

export default Index;