import { Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenshotPreviewProps {
  isProcessing: boolean;
  onProcess: () => void;
  onReset: () => void;
  screenshotData: string | null;
}

export const ScreenshotPreview = ({
  isProcessing,
  onProcess,
  onReset,
  screenshotData,
}: ScreenshotPreviewProps) => {
  return (
    <div className="space-y-4">
      {screenshotData && (
        <p className="text-sm text-blue-500">
          Screenshot ready for processing. Click process to extract text.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          onClick={onProcess}
          disabled={isProcessing || !screenshotData}
          className="gap-2"
        >
          {isProcessing && <span className="animate-spin">⚡</span>}
          Process Screenshot
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};