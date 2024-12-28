import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BrassTaxCriteria } from "./BrassTaxCriteria";
import { SensoryCriteria } from "./SensoryCriteria";

export const ExecutiveSummaryForm = () => {
  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-medium mb-6">Executive Summary Components</h3>
      <div className="space-y-8">
        <div>
          <h4 className="text-base font-medium mb-4">Executive Lens, Brass Tax Job Matching Criteria</h4>
          <div className="pl-4">
            <BrassTaxCriteria />
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h4 className="text-base font-medium mb-4">Executive Lens, Sensory Job Matching Criteria</h4>
          <div className="pl-4">
            <SensoryCriteria />
          </div>
        </div>
      </div>
    </Card>
  );
};