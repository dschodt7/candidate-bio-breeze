import { useState, useEffect } from "react";
import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";

interface LinkedInTextInputProps {
  onSubmit: (text: string) => void;
  initialContent: string | null;
  onContentSaved: () => void;
  onReset: () => void;
}

export const LinkedInTextInput = ({ 
  onSubmit, 
  initialContent,
  onContentSaved,
  onReset
}: LinkedInTextInputProps) => {
  const [text, setText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const maxLength = 2000;

  useEffect(() => {
    if (initialContent) {
      setText(initialContent);
      setIsSubmitted(true);
      setIsEditing(false);
    } else {
      setText("");
      setIsSubmitted(false);
      setIsEditing(false);
    }
  }, [initialContent]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setIsSubmitted(true);
      setIsEditing(false);
      onContentSaved();
    }
  };

  const handleReset = () => {
    onReset();
    setText("");
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <EditableTextarea
        value={text}
        onChange={(newText) => {
          setText(newText);
          if (!isEditing) setIsEditing(true);
        }}
        placeholder="Paste your LinkedIn section text here"
        maxLength={maxLength}
        disabled={isSubmitted && !isEditing}
      />
      <TextareaActions
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        hasContent={!!text.trim()}
        onSubmit={handleSubmit}
        onEdit={handleEdit}
        onReset={handleReset}
      />
    </div>
  );
};