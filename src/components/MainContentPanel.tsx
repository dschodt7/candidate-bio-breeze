import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CompileState {
  isCompiling: boolean;
  isCompiled: boolean;
}

interface Candidate {
  id: string;
  linkedin_url: string | null;
  screening_notes: string | null;
  resume_path: string | null;
}

const MainContentPanel = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [compileState, setCompileState] = useState<CompileState>({
    isCompiling: false,
    isCompiled: false,
  });

  useEffect(() => {
    const fetchCandidate = async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) {
        setCandidate(null);
        return;
      }

      try {
        console.log("Fetching candidate details for ID:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .maybeSingle();

        if (error) throw error;

        console.log("Fetched candidate details:", data);
        setCandidate(data);
      } catch (error) {
        console.error("Error fetching candidate:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate details",
          variant: "destructive",
        });
      }
    };

    fetchCandidate();
  }, [searchParams, toast]);

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

  const getCandidateName = () => {
    if (!candidate?.linkedin_url) return "Select a Candidate";
    const match = candidate.linkedin_url.match(/in\/([\w-]+)$/);
    return match ? match[1].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : "Unknown Candidate";
  };

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
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default MainContentPanel;