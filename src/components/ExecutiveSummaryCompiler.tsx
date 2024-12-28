import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SourceAnalysis {
  strength?: string;
  uniqueContributions?: string;
  patterns?: string;
  specificity?: string;
}

interface MergeResult {
  mergedStatements: string[];
  sourceBreakdown: {
    resume: string | SourceAnalysis;
    linkedin: string | SourceAnalysis;
  };
}

interface CompileState {
  isCompiling: boolean;
  isCompiled: boolean;
  isMergingCredibility: boolean;
}

const formatSourceAnalysis = (analysis: string | SourceAnalysis): string => {
  if (typeof analysis === 'string') {
    return analysis || "No analysis available";
  }
  
  return Object.entries(analysis)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
};

export const ExecutiveSummaryCompiler = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [compileState, setCompileState] = useState<CompileState>({
    isCompiling: false,
    isCompiled: false,
    isMergingCredibility: false
  });

  const handleCompile = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setCompileState({ ...compileState, isCompiling: true, isCompiled: false });
      console.log("Starting compilation for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('synthesize-candidate', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Compilation completed:", data);
      setCompileState({ ...compileState, isCompiling: false, isCompiled: true });
      
      toast({
        title: "Success",
        description: "Executive summary components have been compiled successfully.",
      });
    } catch (error) {
      console.error("Error compiling executive summary:", error);
      setCompileState({ ...compileState, isCompiling: false, isCompiled: false });
      toast({
        title: "Compilation Failed",
        description: "There was an error compiling the executive summary components.",
        variant: "destructive",
      });
    }
  };

  const handleMergeCredibility = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setCompileState({ ...compileState, isMergingCredibility: true });
      setMergeResult(null);
      console.log("Starting credibility merge for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Credibility merge completed:", data);
      if (data?.data) {
        console.log("Merge result:", data.data);
        setMergeResult(data.data);
      }
      setCompileState({ ...compileState, isMergingCredibility: false });
      
      toast({
        title: "Success",
        description: "Credibility statements have been merged successfully.",
      });
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      setCompileState({ ...compileState, isMergingCredibility: false });
      toast({
        title: "Merge Failed",
        description: "There was an error merging the credibility statements.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleCompile}
        className="w-full py-6 text-lg font-medium"
        disabled={compileState.isCompiling}
      >
        {compileState.isCompiling 
          ? "Compiling Executive Summary Components..." 
          : "Compile Executive Summary Components"}
      </Button>

      <Button
        onClick={handleMergeCredibility}
        className="w-full py-6 text-lg font-medium"
        variant="outline"
        disabled={compileState.isMergingCredibility}
      >
        {compileState.isMergingCredibility
          ? "Merging Credibility Statements..."
          : "Test Merge: Credibility Statements"}
      </Button>

      {mergeResult && (
        <Card className="p-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Merged Credibility Statements</Label>
              <Textarea
                value={mergeResult.mergedStatements.join("\n\n")}
                className="mt-2 min-h-[200px] font-mono"
                readOnly
              />
            </div>
            
            <div>
              <Label className="text-base font-medium">Source Analysis</Label>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>Resume:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.resume)}</p>
                <p><strong>LinkedIn:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.linkedin)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};