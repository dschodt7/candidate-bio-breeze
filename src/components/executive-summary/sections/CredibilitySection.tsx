import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CredibilityHeader } from "./credibility/CredibilityHeader";
import { CredibilityInput } from "./credibility/CredibilityInput";
import { SourceAnalysis } from "./credibility/SourceAnalysis";
import { MergeResult } from "@/types/executive-summary";

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
        console.log("Checking sources for candidate:", candidateId);
        
        // Check for resume analysis
        const { data: resumeAnalysis } = await supabase
          .from('resume_analyses')
          .select('credibility_statements')
          .eq('candidate_id', candidateId)
          .single();
        
        const resumeAvailable = !!resumeAnalysis?.credibility_statements;
        console.log("Resume analysis available:", resumeAvailable);
        setHasResume(resumeAvailable);

        // Check for LinkedIn analysis
        const { data: linkedInSection } = await supabase
          .from('linkedin_sections')
          .select('analysis')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .single();
        
        const linkedInAvailable = !!linkedInSection?.analysis;
        console.log("LinkedIn analysis available:", linkedInAvailable);
        setHasLinkedIn(linkedInAvailable);

        // For now, screening is always false since we haven't implemented it
        setHasScreening(false);

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
      <CredibilityHeader
        onMerge={handleMergeCredibility}
        isMerging={isMerging}
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />

      <div className="space-y-4">
        <CredibilityInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <SourceAnalysis mergeResult={mergeResult} />
      </div>
    </div>
  );
};