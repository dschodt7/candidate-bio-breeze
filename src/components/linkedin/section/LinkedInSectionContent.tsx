import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";

interface LinkedInSectionContentProps {
  currentContent: string;
  onSave: (content: string) => void;
  onReset: () => void;
}

export const LinkedInSectionContent = ({
  currentContent,
  onSave,
  onReset
}: LinkedInSectionContentProps) => {
  return (
    <div className="space-y-4">
      <EditableTextarea
        value={currentContent}
        onChange={(value) => onSave(value)}
        placeholder="Your content here"
        maxLength={2000}
      />
      <TextareaActions
        isSubmitted={true}
        isEditing={false}
        hasContent={!!currentContent.trim()}
        onSubmit={() => onSave(currentContent)}
        onEdit={() => {}}
        onReset={onReset}
      />
    </div>
  );
};