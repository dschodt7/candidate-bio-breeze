import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { Skeleton } from "@/components/ui/skeleton";

interface CredibilityContentProps {
  value: string;
  isSubmitted: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onEdit: () => void;
  onReset: () => void;
}

export const CredibilityContent = ({
  value,
  isSubmitted,
  isEditing,
  isLoading = false,
  onChange,
  onSubmit,
  onEdit,
  onReset,
}: CredibilityContentProps) => {
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
        onSubmit={onSubmit}
        onEdit={onEdit}
        onReset={onReset}
      />
    </div>
  );
};