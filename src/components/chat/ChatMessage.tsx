import { cn } from "@/lib/utils";
import { useAnimatedText } from "@/components/ui/animated-text";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "assistant" | "user";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const animatedContent = role === "assistant" ? useAnimatedText(content, "") : content;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        role === "assistant" ? "bg-white/50" : "bg-white/50"
      )}
    >
      <div className="w-6 h-6">
        {role === "assistant" ? (
          <Bot className="w-6 h-6" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm whitespace-pre-wrap">
          {animatedContent}
        </p>
      </div>
    </div>
  );
};