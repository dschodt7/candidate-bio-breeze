import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { LinkedInAboutSection } from "./linkedin/LinkedInAboutSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const LinkedInInput = () => {
  return (
    <Card className="p-6 animate-fadeIn">
      <LinkedInUrlInput />
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="about">
          <AccordionTrigger>About Section</AccordionTrigger>
          <AccordionContent className="pt-4">
            <LinkedInAboutSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};