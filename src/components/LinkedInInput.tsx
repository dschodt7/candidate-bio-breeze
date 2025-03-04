import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "@/components/linkedin/LinkedInUrlInput";
import { Accordion } from "@/components/ui/accordion";
import { LinkedInSection } from "@/components/linkedin/LinkedInSection";
import { LinkedInAnalysis } from "@/components/linkedin/LinkedInAnalysis";
import { useCandidate } from "@/hooks/useCandidate";

export const LinkedInInput = () => {
  const { candidate } = useCandidate();

  return (
    <Card className="p-6 animate-fadeIn bg-white shadow-lg transition-all duration-300 border border-white/20 hover:bg-black/5">
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