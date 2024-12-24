import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CriteriaSection {
  title: string;
  helpText: string;
  value: string;
}

export const BrassTaxCriteria = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<Record<string, CriteriaSection>>({
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
  });

  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});

  const handleSubmit = (sectionKey: string) => {
    if (!sections[sectionKey].value) {
      toast({
        title: "Error",
        description: "Please enter some content before submitting",
        variant: "destructive",
      });
      return;
    }

    setSavedSections((prev) => ({ ...prev, [sectionKey]: true }));
    console.log(`Submitted ${sectionKey}:`, sections[sectionKey].value);
    toast({
      title: "Success",
      description: `${sections[sectionKey].title} submitted successfully`,
    });
  };

  const handleReset = (sectionKey: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], value: "" },
    }));
    setSavedSections((prev) => ({ ...prev, [sectionKey]: false }));
    console.log(`Reset ${sectionKey}`);
    toast({
      title: "Reset",
      description: `${sections[sectionKey].title} has been reset`,
    });
  };

  const handleChange = (sectionKey: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], value },
    }));
    setSavedSections((prev) => ({ ...prev, [sectionKey]: false }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([key, section]) => (
        <div key={key} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center">
              {section.title}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 inline-block text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{section.helpText}</TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(key)}
                className="gap-2"
              >
                {savedSections[key] ? <Check className="h-4 w-4 text-green-500" /> : null}
                {savedSections[key] ? "Submitted" : "Submit"}
              </Button>
              {savedSections[key] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(key)}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={section.value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="min-h-[100px]"
            placeholder={`Enter ${section.title.toLowerCase()}...`}
          />
        </div>
      ))}
    </div>
  );
};