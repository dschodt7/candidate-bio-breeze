import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { LinkedInSection } from "./linkedin/LinkedInSection";
import { LinkedInAnalysis } from "./linkedin/LinkedInAnalysis";
import { useCandidate } from "@/hooks/useCandidate";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const LinkedInInput = () => {
  const { candidate } = useCandidate();
  const [isExpanded, setIsExpanded] = useState(true);
  const sections: Array<{ title: string; type: LinkedInSectionType }> = [
    { title: "About Section", type: "about" },
    { title: "Experience 1", type: "experience_1" },
    { title: "Experience 2", type: "experience_2" },
    { title: "Experience 3", type: "experience_3" },
    { title: "Skills", type: "skills" },
    { title: "Recommendations", type: "recommendations" },
  ];

  // Create an array of section types to track expanded state
  const [expandedSections, setExpandedSections] = useState<string[]>(
    isExpanded ? sections.map(s => s.type) : []
  );

  const handleToggleAll = () => {
    setIsExpanded(!isExpanded);
    setExpandedSections(isExpanded ? [] : sections.map(s => s.type));
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <LinkedInUrlInput />
      <div className="mt-6 relative">
        <button
          onClick={handleToggleAll}
          className="absolute right-0 -top-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm">
            {isExpanded ? "Collapse All" : `LinkedIn Sections (${sections.length})`}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded ? "" : "-rotate-180"
            )}
          />
        </button>
        <Accordion
          type="multiple"
          className="mt-6"
          value={expandedSections}
          onValueChange={setExpandedSections}
        >
          {sections.map(({ title, type }) => (
            <LinkedInSection
              key={type}
              title={title}
              sectionType={type}
            />
          ))}
        </Accordion>
      </div>
      <LinkedInAnalysis />
    </Card>
  );
};