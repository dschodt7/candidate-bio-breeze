import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { useState, useEffect } from "react";

interface CredibilityInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitted: boolean;
}

export const CredibilityInput = ({ 
  value,
  onChange,
  onSubmit,
  onReset,
  isSubmitted
}: CredibilityInputProps) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [isSubmitted]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmit = () => {
    onSubmit();
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
        onReset={onReset}
      />
    </div>
  );
};