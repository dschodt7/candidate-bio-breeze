import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { Accordion } from "@/components/ui/accordion";
import { LinkedInSection } from "./linkedin/LinkedInSection";
import { LinkedInAnalysis } from "./linkedin/LinkedInAnalysis";

export const LinkedInInput = () => {
  return (
    <Card className="p-6 animate-fadeIn">
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