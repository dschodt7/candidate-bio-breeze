import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ExecutiveSummaryForm = () => {
  const renderHelpTooltip = (content: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 inline-block text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{content}</TooltipContent>
    </Tooltip>
  );

  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-medium mb-6">Executive Summary</h3>
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="brass-tax">
          <AccordionTrigger>Brass Tax Job Matching Criteria</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  Compensation Expectations
                  {renderHelpTooltip(
                    "Discuss desired salary range, including base, bonuses, and equity. Benchmark against industry standards and location."
                  )}
                </Label>
                <Textarea className="mt-2" placeholder="Enter compensation details..." />
              </div>

              <div>
                <Label className="flex items-center">
                  Hybrid/Remote or Travel Preferences
                  {renderHelpTooltip(
                    "Clarify whether the candidate prefers remote, hybrid, or on-site roles. Identify flexibility for occasional or frequent travel."
                  )}
                </Label>
                <Textarea className="mt-2" placeholder="Enter work location preferences..." />
              </div>

              <div>
                <Label className="flex items-center">
                  Timeframe and Availability
                  {renderHelpTooltip(
                    "Confirm readiness to transition into the role. Discuss availability for interviews and onboarding timelines."
                  )}
                </Label>
                <Input className="mt-2" placeholder="Enter availability..." />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sensory">
          <AccordionTrigger>Sensory Job Matching Criteria</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div>
              <Label className="flex items-center">
                Business Problems They Solve
                {renderHelpTooltip(
                  "Identify areas where the candidate excels in delivering solutions. Relate this to high-demand skills in target industries."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter key problem-solving areas..." />
            </div>

            <div>
              <Label className="flex items-center">
                Flow State Activities
                {renderHelpTooltip(
                  "Discuss tasks or projects that fully engage the candidate. Align these with potential job responsibilities for high job satisfaction."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter flow state activities..." />
            </div>

            <div>
              <Label className="flex items-center">
                Activities and Hobbies
                {renderHelpTooltip(
                  "Explore non-work activities that reflect personality and skills. Connect relevant hobbies to transferable skills or cultural fit."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter activities and hobbies..." />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};