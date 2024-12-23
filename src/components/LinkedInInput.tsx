import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const LinkedInInput = () => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    console.log("LinkedIn URL updated:", e.target.value);
  };

  const handleSave = () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn URL",
        variant: "destructive",
      });
      return;
    }
    console.log("LinkedIn URL saved:", url);
    toast({
      title: "Success",
      description: "LinkedIn URL saved successfully",
    });
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
        <div className="flex gap-4">
          <Input
            id="linkedin-url"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={url}
            onChange={handleUrlChange}
            className="flex-1"
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Card>
  );
};