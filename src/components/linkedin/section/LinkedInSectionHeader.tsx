import { CheckCircle } from "lucide-react";

interface LinkedInSectionHeaderProps {
  title: string;
  hasContent: boolean;
}

export const LinkedInSectionHeader = ({
  title,
  hasContent
}: LinkedInSectionHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
      {title}
    </div>
  );
};