import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LinkedInSectionHeader } from "./LinkedInSectionHeader";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

interface LinkedInSectionWrapperProps {
  title: string;
  sectionType: LinkedInSectionType;
  hasContent: boolean;
  children: React.ReactNode;
}

export const LinkedInSectionWrapper = ({
  title,
  sectionType,
  hasContent,
  children
}: LinkedInSectionWrapperProps) => {
  return (
    <AccordionItem value={sectionType}>
      <AccordionTrigger>
        <LinkedInSectionHeader title={title} hasContent={hasContent} />
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{title} Details</h4>
          </div>
          {children}
          <p className="text-sm text-muted-foreground">
            Tip: You can either paste a screenshot of the {title} section or directly paste the text
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};