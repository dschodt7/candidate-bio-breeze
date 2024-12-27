import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";

interface LinkedInSectionContentProps {
  currentContent: string;
  isEditing: boolean;
  hasContent: boolean;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onEdit: () => void;
  onReset: () => void;
}

export const LinkedInSectionContent = ({
  currentContent,
  isEditing,
  hasContent,
  onContentChange,
  onSave,
  onEdit,
  onReset
}: LinkedInSectionContentProps) => {
  return (
    <div className="space-y-4">
      <EditableTextarea
        value={currentContent}
        onChange={onContentChange}
        placeholder="Your content here"
        maxLength={2000}
        disabled={!isEditing}
      />
      <TextareaActions
        isSubmitted={hasContent && !isEditing}
        isEditing={isEditing}
        hasContent={!!currentContent.trim()}
        onSubmit={onSave}
        onEdit={onEdit}
        onReset={onReset}
      />
    </div>
  );
};