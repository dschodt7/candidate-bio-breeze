import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CharacterCounter } from "@/components/ui/character-counter";

interface EditableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  disabled?: boolean;
  className?: string;
}

export const EditableTextarea = ({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled = false,
  className = "",
}: EditableTextareaProps) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => {
          const newText = e.target.value;
          if (newText.length <= maxLength) {
            onChange(newText);
          }
        }}
        placeholder={placeholder}
        className={`min-h-[200px] font-mono ${className}`}
        disabled={disabled}
        maxLength={maxLength}
      />
      <CharacterCounter current={value.length} max={maxLength} />
    </div>
  );
};