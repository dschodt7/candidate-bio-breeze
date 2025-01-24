import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExecutiveSummarySection } from "./executive-summary/ExecutiveSummarySection";
import { ExecutiveSummaryAnalysis } from "./executive-summary/ExecutiveSummaryAnalysis";

export const ExecutiveSummaryForm = () => {
  const { candidate } = useCandidate();

  const { data: execSummary } = useQuery({
    queryKey: ['execSummary', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidate.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching executive summary:", error);
        return null;
      }

      return data;
    },
    enabled: !!candidate?.id,
  });

  if (!candidate) return null;

  return (
    <Card className="p-6 animate-fadeIn bg-white/50 backdrop-blur-sm shadow-lg border border-white/20">
      <div className="space-y-6">
        <ExecutiveSummarySection
          title="Credibility & Expertise"
          description="Highlight key achievements, skills, and expertise that establish credibility"
          content={execSummary?.credibility || ""}
          sectionKey="credibility"
        />
        
        <ExecutiveSummarySection
          title="Results & Impact"
          description="Showcase quantifiable results and business impact"
          content={execSummary?.results || ""}
          sectionKey="results"
        />
        
        <ExecutiveSummarySection
          title="Case Studies"
          description="Provide detailed examples of successful projects or initiatives"
          content={execSummary?.case_studies || ""}
          sectionKey="case_studies"
        />
        
        <ExecutiveSummarySection
          title="Business Problems"
          description="Describe complex business challenges solved"
          content={execSummary?.business_problems || ""}
          sectionKey="business_problems"
        />
        
        <ExecutiveSummarySection
          title="Motivations & Goals"
          description="Share career aspirations and what drives success"
          content={execSummary?.motivations || ""}
          sectionKey="motivations"
        />

        <ExecutiveSummaryAnalysis />
      </div>
    </Card>
  );
};