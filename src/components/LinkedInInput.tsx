import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LinkedInInput = () => {
  const [url, setUrl] = useState("");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    console.log("LinkedIn URL updated:", e.target.value);
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
        <Input
          id="linkedin-url"
          type="url"
          placeholder="https://linkedin.com/in/username"
          value={url}
          onChange={handleUrlChange}
          className="w-full"
        />
      </div>
    </Card>
  );
};