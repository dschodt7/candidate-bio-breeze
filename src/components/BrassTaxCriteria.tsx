import { CriteriaSection } from "@/components/criteria/CriteriaSection";
import { useCriteriaSection } from "@/hooks/useCriteriaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const initialSections = {
  compensation: {
    title: "Compensation Expectations",
    helpText: "Discuss desired salary range, including base, bonuses, and equity. Benchmark against industry standards and location.",
    value: "",
  },
  workPreference: {
    title: "Hybrid/Remote or Travel Preferences",
    helpText: "Clarify whether the candidate prefers remote, hybrid, or on-site roles. Identify flexibility for occasional or frequent travel.",
    value: "",
  },
  credibility: {
    title: "Credibility Statements",
    helpText: "Highlight achievements and qualifications that validate the candidate's expertise. Use data-driven examples or significant milestones.",
    value: "",
  },
  caseStudies: {
    title: "Case Studies",
    helpText: "Include examples of specific problems solved or impactful projects delivered. Showcase transferable skills and industry relevance.",
    value: "",
  },
  jobAssessment: {
    title: "Complete Assessment of Job",
    helpText: "Review role responsibilities, team dynamics, and company goals. Ensure alignment with the candidate's career trajectory.",
    value: "",
  },
  motivations: {
    title: "Clear Assessment of Motivations",
    helpText: "Explore why the candidate is pursuing this role or industry. Identify values and drivers for long-term satisfaction.",
    value: "",
  },
  timeframe: {
    title: "Timeframe and Availability",
    helpText: "Confirm readiness to transition into the role. Discuss availability for interviews and onboarding timelines.",
    value: "",
  },
};

export const BrassTaxCriteria = () => {
  const { sections, savedSections, handleSubmit, handleReset, handleChange } = 
    useCriteriaSection(initialSections);
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
    <Accordion type="multiple" className="space-y-2">
      {Object.entries(sections).map(([key, section]) => (
        <AccordionItem key={key} value={key} className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                {section.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-muted rounded-full p-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover p-2 shadow-md border">{section.helpText}</TooltipContent>
                </Tooltip>
                {savedSections[key] && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <CriteriaSection
                title=""
                helpText={section.helpText}
                value={section.value}
                isSubmitted={savedSections[key]}
                onChange={(value) => handleChange(key, value)}
                onSubmit={() => handleSubmit(key)}
                onReset={() => handleReset(key)}
                hideHelp={true}
              />

              {key === 'credibility' && (
                <div className="space-y-4 mt-4">
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
                    <div className="space-y-4">
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
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};