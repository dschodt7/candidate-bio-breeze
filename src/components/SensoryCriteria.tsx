import { CriteriaSection } from "@/components/criteria/CriteriaSection";
import { useCriteriaSection } from "@/hooks/useCriteriaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const initialSections = {
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
};

export const SensoryCriteria = () => {
  const { sections, savedSections, handleSubmit, handleReset, handleChange } = 
    useCriteriaSection(initialSections);

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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};