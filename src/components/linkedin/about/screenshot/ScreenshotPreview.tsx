import { Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenshotPreviewProps {
  isProcessing: boolean;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
  screenshotData: string | null;
}

export const ScreenshotPreview = ({
  isProcessing,
  isSubmitted,
  onSubmit,
  onReset,
  screenshotData,
}: ScreenshotPreviewProps) => {
  return (
    <div className="space-y-4">
      {screenshotData && (
        <p className="text-sm text-blue-500">
          Screenshot ready for processing. Click submit to extract text.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isProcessing || !screenshotData}
          className="gap-2"
        >
          {isProcessing && <span className="animate-spin">⚡</span>}
          {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
        {isSubmitted && (
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};