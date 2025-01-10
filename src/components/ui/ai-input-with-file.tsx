"use client";

import { CornerRightUp, FileUp, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFileInput } from "@/hooks/use-file-input";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface FileDisplayProps {
  fileName: string;
  onClear: () => void;
}

function FileDisplay({ fileName, onClear }: FileDisplayProps) {
  return (
    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 w-fit px-3 py-1 rounded-lg group border dark:border-white/10">
      <FileUp className="w-4 h-4 dark:text-white" />
      <span className="text-sm dark:text-white">{fileName}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-3 h-3 dark:text-white" />
      </button>
    </div>
  );
}

interface AIInputWithFileProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  accept?: string;
  maxFileSize?: number;
  onSubmit?: (message: string, file?: File) => void;
  className?: string;
  isLoading?: boolean;
}

export function AIInputWithFile({
  id = "ai-input-with-file",
  placeholder = "Ask me anything about executive recruiting...",
  minHeight = 52,
  maxHeight = 200,
  accept = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  maxFileSize = 5,
  onSubmit,
  className,
  isLoading
}: AIInputWithFileProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const { fileName, fileInputRef, handleFileSelect, clearFile, selectedFile } =
    useFileInput({ accept, maxSize: maxFileSize });

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleSubmit = () => {
    if ((inputValue.trim() || selectedFile) && !isLoading) {
      onSubmit?.(inputValue, selectedFile);
      setInputValue("");
      clearFile();
      adjustHeight(true);
    }
  };

  return (
    <div className={cn("w-full py-2 sm:py-4 px-2 sm:px-0", className)}>
      <div className="relative max-w-xl w-full mx-auto flex flex-col gap-2">
        {fileName && <FileDisplay fileName={fileName} onClear={clearFile} />}

        <div className="relative">
          <div
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-black/5 dark:bg-white/5 hover:cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-opacity transform scale-x-[-1] rotate-45 dark:text-white" />
          </div>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
          />

          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "max-w-xl bg-black/5 dark:bg-white/5 w-full rounded-2xl sm:rounded-3xl pl-10 sm:pl-12 pr-12 sm:pr-16",
              "placeholder:text-black/70 dark:placeholder:text-white/70",
              "border-none ring-black/30 dark:ring-white/30",
              "text-black dark:text-white text-wrap py-3 sm:py-4",
              "text-sm sm:text-base",
              "max-h-[200px] overflow-y-auto resize-none leading-[1.2]",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />

          <button
            onClick={handleSubmit}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1"
            type="button"
            disabled={isLoading || (!inputValue.trim() && !selectedFile)}
          >
            <CornerRightUp
              className={cn(
                "w-3.5 sm:w-4 h-3.5 sm:h-4 transition-opacity dark:text-white",
                (inputValue || selectedFile) && !isLoading ? "opacity-100" : "opacity-30"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}