import { SourceIndicators } from "../../common/SourceIndicators";

interface CredibilityHeaderProps {
  hasResume: boolean;
  hasLinkedIn: boolean;
  hasScreening: boolean;
}

export const CredibilityHeader = ({
  hasResume,
  hasLinkedIn,
  hasScreening,
}: CredibilityHeaderProps) => {
  return (
    <div className="flex items-center justify-end">
      <SourceIndicators 
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />
    </div>
  );
};