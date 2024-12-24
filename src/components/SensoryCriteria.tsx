import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, RotateCw } from "lucide-react";
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

export const SensoryCriteria = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<Record<string, CriteriaSection>>({
    interests: {
      title: "Interests",
      helpText: "Highlight the candidate's passions and professional interests. Connect these to potential roles or industries.",
      value: "",
    },
    problemSolving: {
      title: "Business Problems They Solve Better Than Most",
      helpText: "Identify areas where the candidate excels in delivering solutions. Relate this to high-demand skills in target industries.",
      value: "",
    },
    understanding: {
      title: "Foundational Understanding on a Personal Level",
      helpText: "Uncover core beliefs, values, and guiding principles in work. Discuss how these align with organizational culture or mission.",
      value: "",
    },
    flowState: {
      title: "What Gives Them a Sense of Flow State",
      helpText: "Discuss tasks or projects that fully engage the candidate. Align these with potential job responsibilities for high job satisfaction.",
      value: "",
    },
    activities: {
      title: "Activities and Hobbies",
      helpText: "Explore non-work activities that reflect personality and skills. Connect relevant hobbies to transferable skills or cultural fit.",
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