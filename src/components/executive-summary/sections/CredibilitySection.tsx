import { useState, useEffect } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SourceIndicators } from "../common/SourceIndicators";

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

interface CredibilitySectionProps {
  candidateId: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const CredibilitySection = ({ 
  candidateId,
  value,
  onChange,
  onSubmit
}: CredibilitySectionProps) => {
  const { toast } = useToast();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasScreening, setHasScreening] = useState(false);

  useEffect(() => {
    const checkSources = async () => {
      if (!candidateId) return;

      try {
        // Check for resume
        const { data: candidate } = await supabase
          .from('candidates')
          .select('resume_path')
          .eq('id', candidateId)
          .single();
        setHasResume(!!candidate?.resume_path);

        // Check for LinkedIn content
        const { data: linkedInSection } = await supabase
          .from('linkedin_sections')
          .select('content')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .single();
        setHasLinkedIn(!!linkedInSection?.content);

        // Check for screening notes
        const { data: screeningData } = await supabase
          .from('candidates')
          .select('screening_notes')
          .eq('id', candidateId)
          .single();
        setHasScreening(!!screeningData?.screening_notes);

      } catch (error) {
        console.error("Error checking sources:", error);
      }
    };

    checkSources();
  }, [candidateId]);

  const handleMergeCredibility = async () => {
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
        onChange(data.data.mergedStatements.join("\n\n"));
        onSubmit();
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SourceIndicators 
          hasResume={hasResume}
          hasLinkedIn={hasLinkedIn}
          hasScreening={hasScreening}
        />
        <Button
          onClick={handleMergeCredibility}
          variant="outline"
          className="gap-2"
          disabled={isMerging}
        >
          <Wand2 className="h-4 w-4" />
          {isMerging ? "AI Compiling..." : "AI Compile"}
        </Button>
      </div>

      <div className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px]"
          placeholder="Enter or compile credibility statements..."
        />

        {mergeResult && (
          <div className="space-y-4">
            <div>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>Resume:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.resume)}</p>
                <p><strong>LinkedIn:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.linkedin)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};