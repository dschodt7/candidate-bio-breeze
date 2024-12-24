import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { LinkedInScreenshotUpload } from "./linkedin/LinkedInScreenshotUpload";

export const LinkedInInput = () => {
  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-6">
        <LinkedInUrlInput />
        <LinkedInScreenshotUpload />
      </div>
    </Card>
  );
};