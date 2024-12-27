import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface AnalysisSectionProps {
  title: string;
  content: string;
  isEditing: boolean;
  editedContent: string;
  onEdit: () => void;
  onSave: () => void;
  onContentChange: (value: string) => void;
}

export const AnalysisSection = ({
  title,
  content,
  isEditing,
  editedContent,
  onEdit,
  onSave,
  onContentChange,
}: AnalysisSectionProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8"
          >
            Save
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[100px]"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">
          {content || "No data found"}
        </p>
      )}
    </div>
  );
};