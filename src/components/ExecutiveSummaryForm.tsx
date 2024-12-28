import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BrassTaxCriteria } from "./BrassTaxCriteria";
import { SensoryCriteria } from "./SensoryCriteria";
import { Separator } from "@/components/ui/separator";
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

const formatSourceAnalysis = (analysis: string | SourceAnalysis): string => {
  if (typeof analysis === 'string') {
    return analysis || "No analysis available";
  }
  
  return Object.entries(analysis)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
};

export const ExecutiveSummaryForm = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);

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
      setIsMerging(true);
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
      
      toast({
        title: "Success",
        description: "Credibility statements have been merged successfully.",
      });
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Merge Failed",
        description: "There was an error merging the credibility statements.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-medium mb-6">Executive Summary Components</h3>
      <div className="space-y-8">
        <div>
          <h4 className="text-base font-medium mb-4">Executive Lens, Brass Tax Job Matching Criteria</h4>
          <div className="pl-4">
            <BrassTaxCriteria />
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h4 className="text-base font-medium mb-4">Executive Lens, Sensory Job Matching Criteria</h4>
          <div className="pl-4">
            <SensoryCriteria />
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h4 className="text-base font-medium mb-4">Credibility Statements</h4>
          <div className="pl-4 space-y-4">
            <Button
              onClick={handleMergeCredibility}
              variant="outline"
              className="w-full gap-2"
              disabled={isMerging}
            >
              <Wand2 className="h-4 w-4" />
              {isMerging ? "AI Compiling..." : "AI Compile"}
            </Button>

            {mergeResult && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm font-medium">Merged Statements</Label>
                  <Textarea
                    value={mergeResult.mergedStatements.join("\n\n")}
                    className="mt-2 min-h-[200px] font-mono"
                    readOnly
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Source Analysis</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><strong>Resume:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.resume)}</p>
                    <p><strong>LinkedIn:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.linkedin)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};