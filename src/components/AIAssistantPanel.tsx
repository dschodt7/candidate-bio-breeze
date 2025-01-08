import { ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const AIAssistantPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      // Add user message immediately
      const userMessage: Message = { role: "user", content };
      setMessages(prev => [...prev, userMessage]);

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { message: content }
      });

      if (error) throw error;

      // Add AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResizablePanel defaultSize={25} minSize={20} className="p-0">
      <div className="flex h-full flex-col bg-background">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </ResizablePanel>
  );
};

export default AIAssistantPanel;