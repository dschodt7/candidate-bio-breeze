import { AIInputWithFile } from "@/components/ui/ai-input-with-file";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const handleSubmit = (message: string, file?: File) => {
    if (!message.trim() && !file) return;
    onSend(message);
  };

  return (
    <AIInputWithFile
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};