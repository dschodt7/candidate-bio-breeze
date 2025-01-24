import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./LinkedInUrlInput";
import { Accordion } from "@/components/ui/accordion";
import { LinkedInSection } from "./LinkedInSection";
import { LinkedInAnalysis } from "./LinkedInAnalysis";
import { useCandidate } from "@/hooks/useCandidate";

export const LinkedInInput = () => {
  const { candidate } = useCandidate();

  return (
    <Card className="p-6 animate-fadeIn bg-white/50 backdrop-blur-sm shadow-lg border border-white/20">
      <LinkedInUrlInput />
      <Accordion type="single" collapsible className="mt-6">
        <LinkedInSection 
          title="About Section"
          sectionType="about"
        />
        <LinkedInSection 
          title="Experience 1"
          sectionType="experience_1"
        />
        <LinkedInSection 
          title="Experience 2"
          sectionType="experience_2"
        />
        <LinkedInSection 
          title="Experience 3"
          sectionType="experience_3"
        />
        <LinkedInSection 
          title="Skills"
          sectionType="skills"
        />
        <LinkedInSection 
          title="Recommendations"
          sectionType="recommendations"
        />
      </Accordion>
      <LinkedInAnalysis />
    </Card>
  );
};