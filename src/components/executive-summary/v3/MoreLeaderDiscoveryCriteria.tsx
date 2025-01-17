import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface LinkedInAnalysis {
  interests: string;
  activities: string;
  foundationalUnderstanding: string;
  credibilityStatements: string;
  caseStudies: string;
  jobAssessment: string;
  motivations: string;
  businessProblems: string;
}

interface MoreLeaderDiscoveryCriteriaProps {
  candidateId: string | null;
}

const config = {
  key: "more_criteria",
  title: "Additional Leader Discovery Criteria",
  helpText: "Additional insights from LinkedIn and screening analyses"
};

export const MoreLeaderDiscoveryCriteria = ({ candidateId }: MoreLeaderDiscoveryCriteriaProps) => {
  console.log("[MoreLeaderDiscoveryCriteria] Rendering for candidate:", candidateId);

  const { data: linkedInData } = useQuery({
    queryKey: ['linkedin-sections', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("[MoreLeaderDiscoveryCriteria] Error fetching LinkedIn data:", error);
        return null;
      }
      return data?.analysis || null;
    },
    enabled: !!candidateId
  });

  const { data: screeningData } = useQuery({
    queryKey: ['screening-analysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const { data, error } = await supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("[MoreLeaderDiscoveryCriteria] Error fetching screening data:", error);
        return null;
      }
      return data || null;
    },
    enabled: !!candidateId
  });

  const hasLinkedIn = !!linkedInData;
  const hasScreening = !!screeningData;
  const analysis = (linkedInData as unknown) as LinkedInAnalysis;

  return (
    <BaseSectionWrapper
      config={config}
      sourceAvailability={{
        hasResume: false,
        hasLinkedIn,
        hasScreening
      }}
    >
      <div className="space-y-6">
        {/* LinkedIn Criteria */}
        {linkedInData && (
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">LinkedIn Leader Discovery Criteria</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Interests</Label>
                <p className="text-sm mt-1">{analysis.interests || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Activities and Hobbies</Label>
                <p className="text-sm mt-1">{analysis.activities || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Foundational Understanding</Label>
                <p className="text-sm mt-1">{analysis.foundationalUnderstanding || "No data available"}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Screening Criteria */}
        {screeningData && (
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">Screening Leader Discovery Criteria</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Compensation Expectations</Label>
                <p className="text-sm mt-1">{screeningData.compensation_expectations || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Work Arrangements</Label>
                <p className="text-sm mt-1">{screeningData.work_arrangements || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Availability Timeline</Label>
                <p className="text-sm mt-1">{screeningData.availability_timeline || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Current Challenges</Label>
                <p className="text-sm mt-1">{screeningData.current_challenges || "No data available"}</p>
              </div>
              <div>
                <Label className="text-xs">Executive Summary Notes</Label>
                <p className="text-sm mt-1">{screeningData.executive_summary_notes || "No data available"}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </BaseSectionWrapper>
  );
};