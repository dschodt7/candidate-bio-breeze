import { CriteriaSection } from "@/components/criteria/CriteriaSection";
import { useCriteriaSection } from "@/hooks/useCriteriaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CredibilitySection as CredibilitySectionV2 } from "./executive-summary/v2/CredibilitySection";
import { BrassTaxSection } from "./executive-summary/sections/brass-tax/BrassTaxSection";

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
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  return (
    <Accordion type="multiple" className="space-y-2">
      {Object.entries(sections).map(([key, section]) => (
        <AccordionItem key={key} value={key} className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                {section.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-muted rounded-full p-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover p-2 shadow-md border">
                    {section.helpText}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {key === 'credibility' ? (
              <CredibilitySectionV2 />
            ) : (
              <BrassTaxSection
                candidateId={candidateId}
                sectionKey={key}
                value={section.value}
                onChange={(value) => handleChange(key, value)}
                onSubmit={() => handleSubmit(key)}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
