import { Card } from "@/components/ui/card";
import { CredibilitySection } from "@/components/executive-summary/v3/CredibilitySection";
import { ResultsAchievementsSection } from "@/components/executive-summary/v3/ResultsAchievementsSection";
import { CaseStudiesSection } from "@/components/executive-summary/v3/CaseStudiesSection";
import { BusinessProblemsSection } from "@/components/executive-summary/v3/BusinessProblemsSection";
import { MotivationsSection } from "@/components/executive-summary/v3/MotivationsSection";
import { MoreLeaderDiscoveryCriteria } from "@/components/executive-summary/v3/MoreLeaderDiscoveryCriteria";
import { useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export const ExecutiveSummaryForm = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-medium mb-6">Executive Summary Components</h3>
      <div className="space-y-8">
        <div>
          <h4 className="text-base font-medium mb-4">Leader Discovery Criteria to Merge</h4>
          <div className="pl-4">
            <ErrorBoundary>
              <CredibilitySection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <ResultsAchievementsSection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <CaseStudiesSection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <BusinessProblemsSection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <MotivationsSection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <MoreLeaderDiscoveryCriteria candidateId={candidateId} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Card>
  );
};