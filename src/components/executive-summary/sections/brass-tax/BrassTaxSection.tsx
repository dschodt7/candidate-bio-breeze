import { useState, useEffect } from "react";
import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { useBrassTaxSection } from "@/hooks/useBrassTaxSection";
import { Skeleton } from "@/components/ui/skeleton";

interface BrassTaxSectionProps {
  candidateId: string | null;
  sectionKey: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const BrassTaxSection = ({ 
  candidateId,
  sectionKey,
  value,
  onChange,
  onSubmit
}: BrassTaxSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    isSubmitted,
    isLoading,
    handleSubmit,
    handleReset
  } = useBrassTaxSection(candidateId, sectionKey);

  useEffect(() => {
    setIsEditing(false);
  }, [isSubmitted]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log(`Submitting ${sectionKey} section`);
    const success = await handleSubmit(value);
    if (success) {
      onSubmit();
      setIsEditing(false);
    }
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
        placeholder={`Enter ${sectionKey} details...`}
        maxLength={2000}
        disabled={isSubmitted && !isEditing}
      />
      <TextareaActions
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        hasContent={!!value.trim()}
        onSubmit={handleSave}
        onEdit={handleEdit}
        onReset={handleReset}
      />
    </div>
  );
};