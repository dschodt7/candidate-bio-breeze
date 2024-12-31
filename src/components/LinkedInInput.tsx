import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { Accordion } from "@/components/ui/accordion";
import { LinkedInSection } from "./linkedin/LinkedInSection";
import { LinkedInAnalysis } from "./linkedin/LinkedInAnalysis";
import { useCandidate } from "@/hooks/useCandidate";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const LinkedInInput = () => {
  const { candidate } = useCandidate();
  const [isOpen, setIsOpen] = useState(true);
  
  const sections: Array<{ title: string; type: LinkedinSectionType }> = [
    { title: "About Section", type: "about" },
    { title: "Experience 1", type: "experience_1" },
    { title: "Experience 2", type: "experience_2" },
    { title: "Experience 3", type: "experience_3" },
    { title: "Skills", type: "skills" },
    { title: "Recommendations", type: "recommendations" },
  ];

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">LinkedIn Profile</h3>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-6">
          <LinkedInUrlInput />
          <div className="mt-6">
            <Accordion type="multiple" className="mt-6">
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};