import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface CredibilityInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitted: boolean;
  isLoading?: boolean;
}

export const CredibilityInput = ({ 
  value,
  onChange,
  onSubmit,
  onReset,
  isSubmitted,
  isLoading = false
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

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