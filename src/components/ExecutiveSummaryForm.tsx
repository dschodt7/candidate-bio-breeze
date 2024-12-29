import { Card } from "@/components/ui/card";
import { CredibilitySection } from "@/components/executive-summary/v3/CredibilitySection";
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
          <h4 className="text-base font-medium mb-4">Executive Lens, Brass Tax Job Matching Criteria</h4>
          <div className="pl-4">
            <ErrorBoundary>
              <CredibilitySection candidateId={candidateId} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Card>
  );
};