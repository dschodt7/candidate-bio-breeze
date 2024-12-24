import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { sections } from "./types";
import { LinkedInAnalysisSection } from "./LinkedInAnalysisSection";
import { useLinkedInAnalysis } from "./useLinkedInAnalysis";

export const LinkedInJobMatchingCriteria = () => {
  const {
    analysis,
    handleSaveSection,
  } = useLinkedInAnalysis();

  if (!analysis) return null;

  const hasContent = Object.values(analysis).some(value => value && value !== "No additional insights from LinkedIn.");

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              LinkedIn Job Matching Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {sections.map(({ key, title }) => (
                <LinkedInAnalysisSection
                  key={key}
                  title={title}
                  content={analysis[key]}
                  onSave={(content) => handleSaveSection(key, content)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};