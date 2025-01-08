import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative rounded-lg border bg-background">
        <Textarea
          placeholder="Ask me anything about executive recruiting..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[52px] w-full resize-none overflow-hidden rounded-lg pr-12"
          rows={1}
        />
        <div className="absolute bottom-1.5 right-1.5">
          <Button 
            type="submit" 
            size="icon"
            className="h-8 w-8"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};