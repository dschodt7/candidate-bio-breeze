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
}

export const CriteriaSection = ({
  title,
  helpText,
  value,
  isSubmitted,
  onChange,
  onSubmit,
  onReset,
}: CriteriaSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{helpText}</TooltipContent>
          </Tooltip>
          Instructions
        </Label>
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