import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrassTaxCriteria } from "./BrassTaxCriteria";
import { SensoryCriteria } from "./SensoryCriteria";

export const ExecutiveSummaryForm = () => {
  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-medium mb-6">Executive Summary Components</h3>
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="brass-tax">
          <AccordionTrigger>
            Executive Lens, Brass Tax Job Matching Criteria
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <BrassTaxCriteria />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sensory">
          <AccordionTrigger>
            Executive Lens, Sensory Job Matching Criteria
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <SensoryCriteria />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};