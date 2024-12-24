import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  const { data: executiveSummary } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("Fetching executive summary for resume analysis:", candidateId);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('brass_tax_criteria')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching executive summary:", error);
        throw error;
      }

      console.log("Fetched executive summary:", data);
      return data?.brass_tax_criteria;
    },
    enabled: !!candidateId,
  });

  if (!executiveSummary) return null;

  const sections = [
    { title: "Credibility Statements", key: "credibilityStatements" },
    { title: "Case Studies", key: "caseStudies" },
    { title: "Complete Assessment of Job", key: "jobAssessment" },
    { title: "Motivations", key: "motivations" },
    { title: "Business Problems They Solve Better Than Most", key: "businessProblems" },
    { title: "Additional Observations", key: "additionalObservations" },
  ];

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            Resume Job Matching Criteria
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {sections.map(({ title, key }) => (
                <div key={key} className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {executiveSummary[key] || "No data found"}
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};