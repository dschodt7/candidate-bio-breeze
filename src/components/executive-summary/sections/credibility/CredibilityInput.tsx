import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { useState } from "react";

interface CredibilityInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const CredibilityInput = ({ 
  value,
  onChange,
  onSubmit
}: CredibilityInputProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    onSubmit();
    setIsSubmitted(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  const handleReset = () => {
    onChange("");
    setIsSubmitted(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <EditableTextarea
        value={value}
        onChange={onChange}
        placeholder="Enter or compile credibility statements..."
        maxLength={2000}
        disabled={isSubmitted && !isEditing}
      />
      <TextareaActions
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        hasContent={!!value.trim()}
        onSubmit={handleSubmit}
        onEdit={handleEdit}
        onReset={handleReset}
      />
    </div>
  );
};