import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { Accordion } from "@/components/ui/accordion";
import { LinkedInSection } from "./linkedin/LinkedInSection";
import { LinkedInAnalysis } from "./linkedin/LinkedInAnalysis";
import { useCandidate } from "@/hooks/useCandidate";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const LinkedInInput = () => {
  const { candidate } = useCandidate();
  const sections: Array<{ title: string; type: LinkedInSectionType }> = [
    { title: "About Section", type: "about" },
    { title: "Experience 1", type: "experience_1" },
    { title: "Experience 2", type: "experience_2" },
    { title: "Experience 3", type: "experience_3" },
    { title: "Skills", type: "skills" },
    { title: "Recommendations", type: "recommendations" },
  ];

  return (
    <Card className="p-6 animate-fadeIn">
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
    </Card>
  );
};