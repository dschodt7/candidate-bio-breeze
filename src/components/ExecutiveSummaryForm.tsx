import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <h3 className="text-lg font-medium mb-6">Executive Summary Components</h3>
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="brass-tax">
          <AccordionTrigger>Executive Lens, Brass Tax Job Matching Criteria</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
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
                Credibility Statements
                {renderHelpTooltip(
                  "Highlight achievements and qualifications that validate the candidate's expertise. Use data-driven examples or significant milestones."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter credibility statements..." />
            </div>

            <div>
              <Label className="flex items-center">
                Case Studies
                {renderHelpTooltip(
                  "Include examples of specific problems solved or impactful projects delivered. Showcase transferable skills and industry relevance."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter case studies..." />
            </div>

            <div>
              <Label className="flex items-center">
                Complete Assessment of Job
                {renderHelpTooltip(
                  "Review role responsibilities, team dynamics, and company goals. Ensure alignment with the candidate's career trajectory."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter job assessment..." />
            </div>

            <div>
              <Label className="flex items-center">
                Clear Assessment of Motivations
                {renderHelpTooltip(
                  "Explore why the candidate is pursuing this role or industry. Identify values and drivers for long-term satisfaction."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter motivation assessment..." />
            </div>

            <div>
              <Label className="flex items-center">
                Timeframe and Availability
                {renderHelpTooltip(
                  "Confirm readiness to transition into the role. Discuss availability for interviews and onboarding timelines."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter availability details..." />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sensory">
          <AccordionTrigger>Executive Lens, Sensory Job Matching Criteria</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div>
              <Label className="flex items-center">
                Interests
                {renderHelpTooltip(
                  "Highlight the candidate's passions and professional interests. Connect these to potential roles or industries."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter interests..." />
            </div>

            <div>
              <Label className="flex items-center">
                Business Problems They Solve Better Than Most
                {renderHelpTooltip(
                  "Identify areas where the candidate excels in delivering solutions. Relate this to high-demand skills in target industries."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter key problem-solving areas..." />
            </div>

            <div>
              <Label className="flex items-center">
                Foundational Understanding on a Personal Level
                {renderHelpTooltip(
                  "Uncover core beliefs, values, and guiding principles in work. Discuss how these align with organizational culture or mission."
                )}
              </Label>
              <Textarea className="mt-2" placeholder="Enter foundational understanding..." />
            </div>

            <div>
              <Label className="flex items-center">
                What Gives Them a Sense of Flow State
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