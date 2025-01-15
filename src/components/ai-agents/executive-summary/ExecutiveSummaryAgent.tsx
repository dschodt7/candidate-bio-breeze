import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type SummaryFormat = 'snapshot' | 'detailed' | 'comprehensive';

export const ExecutiveSummaryAgent = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>('snapshot');

  const generateSummary = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[ExecutiveSummaryAgent] Generating summary for candidate:", candidateId);
      setIsGenerating(true);

      const { data: response, error } = await supabase.functions.invoke(
        'generate-executive-summary',
        {
          body: { 
            candidateId,
            format: selectedFormat
          }
        }
      );

      if (error) throw error;

      console.log("[ExecutiveSummaryAgent] Summary generated successfully:", response);
      toast({
        title: "Success",
        description: "Executive summary generated successfully",
      });

    } catch (error) {
      console.error("[ExecutiveSummaryAgent] Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate executive summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Executive Summary Agent</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Summary Format</label>
          <Select
            value={selectedFormat}
            onValueChange={(value: SummaryFormat) => setSelectedFormat(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="snapshot">Snapshot (1-2 paragraphs)</SelectItem>
              <SelectItem value="detailed">Detailed (Full page)</SelectItem>
              <SelectItem value="comprehensive">Comprehensive (2-3 pages)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateSummary}
          disabled={isGenerating || !candidateId}
          className="w-full relative group"
        >
          <span className="flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                <span className="group-hover:scale-105 transition-transform">
                  Generate Executive Summary
                </span>
              </>
            )}
          </span>
        </Button>
      </div>
    </Card>
  );
};