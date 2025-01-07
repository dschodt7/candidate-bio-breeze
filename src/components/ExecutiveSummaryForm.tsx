import { Card } from "@/components/ui/card";
import { CredibilitySection } from "@/components/executive-summary/v3/CredibilitySection";
import { ResultsAchievementsSection } from "@/components/executive-summary/v3/ResultsAchievementsSection";
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
          <h4 className="text-base font-medium mb-4">Leader Discovery Criteria</h4>
          <div className="pl-4">
            <ErrorBoundary>
              <CredibilitySection candidateId={candidateId} />
            </ErrorBoundary>
            <ErrorBoundary>
              <ResultsAchievementsSection candidateId={candidateId} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Card>
  );
};