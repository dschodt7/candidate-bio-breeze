import { ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "lucide-react";

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

  // Listen for various generation events
  useEffect(() => {
    const handleExecSummary = (event: CustomEvent<any>) => {
      console.log("[AIAssistantPanel] Received executive summary:", event.detail);
      
      const summaryData = event.detail.data;
      const summaryContent = `Here's the executive summary I've generated:

Summary:
${summaryData.summary}

Key Highlights:
${summaryData.highlights.map((highlight: string) => `• ${highlight}`).join('\n')}

Focus Areas:
• Strategic Leadership: ${summaryData.focusAreas.strategicLeadership}
• Execution Excellence: ${summaryData.focusAreas.executionExcellence}
• Innovation Mindset: ${summaryData.focusAreas.innovationMindset}
• Industry Expertise: ${summaryData.focusAreas.industryExpertise}`;

      const assistantMessage: Message = {
        role: "assistant",
        content: summaryContent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    };

    const handleCompanyProfile = (event: CustomEvent<any>) => {
      console.log("[AIAssistantPanel] Received company profile:", event.detail);
      
      const profileData = event.detail.data;
      const profileContent = `Here's the ideal company profile I've generated:

Profile Overview:
${profileData.profile}

Key Highlights:
${profileData.highlights.map((highlight: string) => `• ${highlight}`).join('\n')}

Fit Analysis:
• Cultural Fit: ${profileData.fitAnalysis.culturalFit}
• Leadership Style: ${profileData.fitAnalysis.leadershipFit}
• Growth Stage: ${profileData.fitAnalysis.growthFit}
• Market Position: ${profileData.fitAnalysis.marketFit}
• Innovation Focus: ${profileData.fitAnalysis.innovationFit}
• Team Dynamics: ${profileData.fitAnalysis.teamFit}`;

      const assistantMessage: Message = {
        role: "assistant",
        content: profileContent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    };

    const handleLinkedInOptimization = (event: CustomEvent<any>) => {
      console.log("[AIAssistantPanel] Received LinkedIn optimization:", event.detail);
      
      const optimizationData = event.detail.data;
      const optimizationContent = `Here's your optimized LinkedIn content:

${Object.entries(optimizationData.sections).map(([section, content]: [string, any]) => `
${section.charAt(0).toUpperCase() + section.slice(1)}:
${content.optimized}

Improvements Made:
${content.improvements.map((improvement: string) => `• ${improvement}`).join('\n')}
`).join('\n')}

Format: ${optimizationData.format}
Tone: ${optimizationData.tone}

Review the changes and update your LinkedIn profile accordingly.`;

      const assistantMessage: Message = {
        role: "assistant",
        content: optimizationContent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    };

    // Updated handler for resume optimization
    const handleResumeOptimization = (event: CustomEvent<any>) => {
      console.log("[AIAssistantPanel] Received resume optimization:", event.detail);
      
      const optimizationData = event.detail.data;
      const optimizationContent = `Here's your optimized resume content:

Analysis Type: ${optimizationData.analysisType}
Positioning Level: ${optimizationData.positioningLevel}
Industry Context: ${optimizationData.industry}

${Object.entries(optimizationData.sections).map(([section, content]: [string, any]) => `
${section}:
${content.optimized}

Improvements Made:
${content.improvements.map((improvement: any) => `
• Original: "${improvement.original}"
  Changed to: "${improvement.change}"
  Rationale: ${improvement.rationale}
`).join('')}
`).join('\n')}

Review these optimizations and update your resume accordingly. The changes focus on highlighting your achievements and aligning with ${optimizationData.positioningLevel} level positions in the ${optimizationData.industry} industry.`;

      const assistantMessage: Message = {
        role: "assistant",
        content: optimizationContent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    };

    window.addEventListener('execSummaryGenerated', handleExecSummary as EventListener);
    window.addEventListener('companyProfileGenerated', handleCompanyProfile as EventListener);
    window.addEventListener('linkedInOptimized', handleLinkedInOptimization as EventListener);
    window.addEventListener('resumeOptimized', handleResumeOptimization as EventListener);
    
    return () => {
      window.removeEventListener('execSummaryGenerated', handleExecSummary as EventListener);
      window.removeEventListener('companyProfileGenerated', handleCompanyProfile as EventListener);
      window.removeEventListener('linkedInOptimized', handleLinkedInOptimization as EventListener);
      window.removeEventListener('resumeOptimized', handleResumeOptimization as EventListener);
    };
  }, []);

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
      console.error('[AIAssistantPanel] Chat error:', error);
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
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h2 className="text-lg font-semibold">ERICC, Your AI Assistant</h2>
          </div>
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
