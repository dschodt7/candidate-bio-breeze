import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ExecutiveSummaryDialog } from "@/components/executive-summary/ExecutiveSummaryDialog";

interface SummaryOptions {
  components: {
    credibility: boolean;
    results: boolean;
    caseStudies: boolean;
    businessProblems: boolean;
    motivations: boolean;
    leaderDiscoveryCriteria: boolean;
  };
  format: 'snapshot' | 'detailed' | 'comprehensive';
  tone: 'formal' | 'narrative' | 'glorious';
}

export const ExecutiveSummaryAgent = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateSummary = async (options: SummaryOptions) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[ExecutiveSummaryAgent] Generating summary for candidate:", candidateId);
      console.log("[ExecutiveSummaryAgent] Using options:", options);
      setIsGenerating(true);

      const { data: response, error } = await supabase.functions.invoke(
        'generate-executive-summary',
        {
          body: { 
            candidateId,
            format: options.format,
            tone: options.tone,
            components: options.components
          }
        }
      );

      if (error) throw error;

      console.log("[ExecutiveSummaryAgent] Summary generated successfully:", response);
      toast({
        title: "Success",
        description: "Executive summary generated successfully",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("[ExecutiveSummaryAgent] Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate executive summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Executive Summary Agent</h3>
          
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full relative group"
          >
            <span className="flex items-center justify-center gap-2">
              <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
              <span className="group-hover:scale-105 transition-transform">
                Generate Executive Summary
              </span>
            </span>
          </Button>
        </div>
      </Card>

      <ExecutiveSummaryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGenerate={generateSummary}
        isGenerating={isGenerating}
      />
    </>
  );
};