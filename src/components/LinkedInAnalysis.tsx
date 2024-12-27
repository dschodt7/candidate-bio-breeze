import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LinkedInAnalysisHeader } from "./linkedin/LinkedInAnalysisHeader";
import { LinkedInManualInput } from "./linkedin/LinkedInManualInput";
import { LinkedInAnalysisSection } from "./linkedin/LinkedInAnalysisSection";
import { useLinkedInAnalysis } from "./linkedin/useLinkedInAnalysis";
import { sections } from "./linkedin/types";

export const LinkedInAnalysis = () => {
  const {
    analysis,
    isAnalyzing,
    manualContent,
    showManualInput,
    handleAnalyze,
    setManualContent,
    setShowManualInput,
    handleSaveSection,
  } = useLinkedInAnalysis();

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4 mb-4">
        <LinkedInAnalysisHeader
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          showManualInput={showManualInput}
          onToggleManualInput={() => setShowManualInput(!showManualInput)}
        />

        {showManualInput && (
          <LinkedInManualInput
            content={manualContent}
            onChange={setManualContent}
          />
        )}
      </div>

      {analysis && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="linkedin">
            <AccordionTrigger className="text-sm font-medium">
              LinkedIn Analysis Results
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {sections.map(({ key, title }) => (
                  <LinkedInAnalysisSection
                    key={key}
                    title={title}
                    content={analysis[key] || ""}
                    onSave={(content) => handleSaveSection(key, content)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};