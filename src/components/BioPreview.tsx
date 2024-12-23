import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { useState } from "react";

export const BioPreview = () => {
  const [bio, setBio] = useState("Generated bio will appear here...");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bio);
      console.log("Bio copied to clipboard");
    } catch (err) {
      console.error("Failed to copy bio:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([bio], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidate-bio.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Bio downloaded");
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Generated Bio</h3>
          <div className="space-x-2">
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 bg-muted rounded-md min-h-[200px]">
          <p className="text-muted-foreground">{bio}</p>
        </div>
      </div>
    </Card>
  );
};