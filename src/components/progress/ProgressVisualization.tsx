import { Check, Circle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
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
        {/* Input Sources */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Input Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!linkedInAnalysis)}
              <span className={!!linkedInAnalysis ? "text-gray-900" : "text-gray-500"}>
                LinkedIn Profile
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
                Screening Notes
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Hub */}
        <div className="space-y-4 relative">
          <h3 className="text-lg font-semibold mb-4">Analysis Hub</h3>
          <div className="absolute left-0 top-1/2 -translate-x-full">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!executiveSummary?.credibility_statement)}
              <span className={!!executiveSummary?.credibility_statement ? "text-gray-900" : "text-gray-500"}>
                Credibility Analysis
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!executiveSummary?.results_achievements)}
              <span className={!!executiveSummary?.results_achievements ? "text-gray-900" : "text-gray-500"}>
                Results Analysis
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!executiveSummary?.case_studies)}
              <span className={!!executiveSummary?.case_studies ? "text-gray-900" : "text-gray-500"}>
                Case Studies Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-4 relative">
          <h3 className="text-lg font-semibold mb-4">Outputs</h3>
          <div className="absolute left-0 top-1/2 -translate-x-full">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(allSectionsSubmitted)}
              <span className={allSectionsSubmitted ? "text-gray-900" : "text-gray-500"}>
                Executive Summary
              </span>
            </div>
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