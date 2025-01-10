import { Check, Circle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCandidate } from "@/hooks/useCandidate";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ProgressVisualization = () => {
  const { candidate } = useCandidate();
  const { executiveSummary } = useExecutiveSummary(candidate?.id);

  // Query to check if LinkedIn analysis exists
  const { data: linkedInAnalysis } = useQuery({
    queryKey: ['linkedInAnalysis', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("Fetching LinkedIn analysis for progress visualization");
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidate.id)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("Error fetching LinkedIn analysis:", error);
        return null;
      }
      return data?.analysis;
    },
    enabled: !!candidate?.id,
  });

  // Check if all sections are submitted
  const allSectionsSubmitted = executiveSummary && 
    executiveSummary.credibility_submitted &&
    executiveSummary.results_submitted &&
    executiveSummary.case_studies_submitted &&
    executiveSummary.business_problems_submitted &&
    executiveSummary.motivations_submitted;

  const getStatusIcon = (isComplete: boolean) => {
    return isComplete ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <Circle className="h-5 w-5 text-gray-300" />
    );
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="grid grid-cols-3 gap-8">
        {/* Inputs Analyzed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Inputs Analyzed</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!linkedInAnalysis)}
              <span className={!!linkedInAnalysis ? "text-gray-900" : "text-gray-500"}>
                LinkedIn
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!candidate?.resume_path)}
              <span className={!!candidate?.resume_path ? "text-gray-900" : "text-gray-500"}>
                Resume
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!candidate?.screening_notes)}
              <span className={!!candidate?.screening_notes ? "text-gray-900" : "text-gray-500"}>
                Screening
              </span>
            </div>
          </div>
        </div>

        {/* Exec Components */}
        <div className="space-y-4 relative">
          <h3 className="text-lg font-semibold mb-4">Exec Components</h3>
          <div className="absolute left-0 top-1/2 -translate-x-full">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-gray-900">5/5 AI Compile Complete</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-900">8/8 More Criteria</span>
            </div>
          </div>
        </div>

        {/* AI Agents */}
        <div className="space-y-4 relative">
          <h3 className="text-lg font-semibold mb-4">AI Agents</h3>
          <div className="absolute left-0 top-1/2 -translate-x-full">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Executive Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ideal Company Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Gap Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Enhancement indicator dots */}
      <div className="absolute bottom-2 right-2 flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === 0 ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </Card>
  );
};