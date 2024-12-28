import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, RotateCw, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CriteriaSectionProps {
  title: string;
  helpText: string;
  value: string;
  isSubmitted: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  hideHelp?: boolean;
}

export const CriteriaSection = ({
  title,
  helpText,
  value,
  isSubmitted,
  onChange,
  onSubmit,
  onReset,
  hideHelp = false,
}: CriteriaSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>{title}</Label>
          {!hideHelp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{helpText}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSubmit}
            className="gap-2"
          >
            {isSubmitted ? <Check className="h-4 w-4 text-green-500" /> : null}
            {isSubmitted ? "Submitted" : "Submit"}
          </Button>
          {isSubmitted && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
        placeholder={`Enter ${title.toLowerCase()}...`}
      />
    </div>
  );
};