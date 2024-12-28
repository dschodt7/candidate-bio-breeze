import { FileText, Linkedin, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SourceIndicatorsProps {
  hasResume: boolean;
  hasLinkedIn: boolean;
  hasScreening: boolean;
}

export const SourceIndicators = ({ hasResume, hasLinkedIn, hasScreening }: SourceIndicatorsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger>
          <div className={`p-1 rounded-full ${hasResume ? 'bg-green-100' : 'bg-gray-100'}`}>
            <FileText className={`h-4 w-4 ${hasResume ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>Resume {hasResume ? 'available' : 'not available'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <div className={`p-1 rounded-full ${hasLinkedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Linkedin className={`h-4 w-4 ${hasLinkedIn ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>LinkedIn {hasLinkedIn ? 'available' : 'not available'}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <div className={`p-1 rounded-full ${hasScreening ? 'bg-green-100' : 'bg-gray-100'}`}>
            <User className={`h-4 w-4 ${hasScreening ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>Screening {hasScreening ? 'completed' : 'not completed'}</TooltipContent>
      </Tooltip>
    </div>
  );
};