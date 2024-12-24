import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check } from "lucide-react";
import { LinkedInAnalysis } from "./types";

interface LinkedInAnalysisSectionProps {
  title: string;
  content: string;
  onSave: (content: string) => void;
}

export const LinkedInAnalysisSection = ({
  title,
  content,
  onSave,
}: LinkedInAnalysisSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(true);
              setEditedContent(content);
            }}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[100px]"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">
          {content || "No additional insights from LinkedIn."}
        </p>
      )}
    </div>
  );
};