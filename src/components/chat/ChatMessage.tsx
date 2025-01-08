import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "assistant" | "user";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded-lg p-4",
        role === "assistant" ? "bg-secondary" : "bg-muted"
      )}
    >
      <div className="flex-1 space-y-2">
        <div className="prose-sm prose-slate w-full break-words whitespace-pre-line">
          {content}
        </div>
      </div>
    </div>
  );
};