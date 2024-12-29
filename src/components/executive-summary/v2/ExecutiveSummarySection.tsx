import { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceIndicators } from "../common/SourceIndicators";

interface ExecutiveSummarySectionProps {
  title: string;
  helpText: string;
  sectionKey: string;
  hasResume?: boolean;
  hasLinkedIn?: boolean;
  hasScreening?: boolean;
  children: ReactNode;
}

export const ExecutiveSummarySection = ({
  title,
  helpText,
  sectionKey,
  hasResume = false,
  hasLinkedIn = false,
  hasScreening = false,
  children
}: ExecutiveSummarySectionProps) => {
  return (
    <Accordion type="multiple" className="space-y-2">
      <AccordionItem value={sectionKey} className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2">
              {title}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-muted rounded-full p-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover p-2 shadow-md border">
                  {helpText}
                </TooltipContent>
              </Tooltip>
            </div>
            <SourceIndicators
              hasResume={hasResume}
              hasLinkedIn={hasLinkedIn}
              hasScreening={hasScreening}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};