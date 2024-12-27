import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { LinkedInAboutSection } from "./linkedin/LinkedInAboutSection";
import { CheckCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInInput = () => {
  const [searchParams] = useSearchParams();
  const [hasAboutContent, setHasAboutContent] = useState(false);
  const candidateId = searchParams.get('candidate');

  const fetchAboutContent = async () => {
    if (!candidateId) return;

    try {
      console.log("Fetching LinkedIn About section for candidate:", candidateId);
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('content')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) throw error;
      
      setHasAboutContent(!!data?.content);
      console.log("LinkedIn About section fetch result:", !!data?.content);
    } catch (error) {
      console.error("Error fetching LinkedIn About section:", error);
      setHasAboutContent(false);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, [candidateId]);

  const handleContentReset = () => {
    console.log("Handling content reset in LinkedInInput");
    setHasAboutContent(false);
    // Force a re-fetch of content after reset
    fetchAboutContent();
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <LinkedInUrlInput />
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="about">
          <AccordionTrigger className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {hasAboutContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              About Section
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <LinkedInAboutSection 
              onContentSaved={() => setHasAboutContent(true)} 
              onContentReset={handleContentReset}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};