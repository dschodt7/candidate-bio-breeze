import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { SourceAnalysis } from "./SourceAnalysis";
import { MergeResult } from "@/types/executive-summary";

interface CredibilityContentProps {
  value: string;
  mergeResult: MergeResult | null;
  isSubmitted: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onChange: (value: string) => void;
}

export const CredibilityContent = ({
  value,
  mergeResult,
  isSubmitted,
  isEditing,
  onEdit,
  onSubmit,
  onReset,
  onChange,
}: CredibilityContentProps) => {
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
      <SourceAnalysis mergeResult={mergeResult} />
    </div>
  );
};