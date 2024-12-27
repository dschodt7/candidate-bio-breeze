import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";

export const LinkedInInput = () => {
  return (
    <Card className="p-6 animate-fadeIn">
      <LinkedInUrlInput />
    </Card>
  );
};