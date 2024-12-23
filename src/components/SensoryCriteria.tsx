import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle } from "lucide-react";
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

  const handleSave = (sectionKey: string) => {
    if (!sections[sectionKey].value) {
      toast({
        title: "Error",
        description: "Please enter some content before saving",
        variant: "destructive",
      });
      return;
    }

    setSavedSections((prev) => ({ ...prev, [sectionKey]: true }));
    console.log(`Saved ${sectionKey}:`, sections[sectionKey].value);
    toast({
      title: "Success",
      description: `${sections[sectionKey].title} saved successfully`,
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(key)}
              className="gap-2"
            >
              {savedSections[key] ? <Check className="h-4 w-4 text-green-500" /> : null}
              Save
            </Button>
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