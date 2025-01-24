import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocxAnalysis } from "./analysis/DocxAnalysis";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export const FileUpload = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const {
    isDragging,
    isUploading,
    uploadedFileName,
    uploadProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleReset,
  } = useFileUpload();

  const handleAnalyzeResume = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFileName) {
      toast({
        title: "Error",
        description: "Please upload a resume first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(10);
      console.log("[FileUpload] Starting resume analysis for candidate:", candidateId);
      
      const { data: candidate, error: fetchError } = await supabase
        .from('candidates')
        .select('resume_text')
        .eq('id', candidateId)
        .single();

      if (fetchError) {
        console.error("[FileUpload] Error fetching candidate resume text:", fetchError);
      } else {
        console.log("[FileUpload] Candidate resume text status:", {
          hasText: !!candidate?.resume_text,
          textLength: candidate?.resume_text?.length,
          preview: candidate?.resume_text?.substring(0, 100)
        });
      }

      setAnalysisProgress(30);
      toast({
        title: "Processing",
        description: "Starting resume analysis...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { candidateId }
      });

      setAnalysisProgress(70);

      if (error) throw error;

      console.log("[FileUpload] Analysis response:", {
        success: data.success,
        hasData: !!data.data,
        sections: data.data ? Object.keys(data.data) : [],
        firstSection: data.data?.credibility_statements?.substring(0, 100)
      });

      setAnalysisProgress(90);

      await queryClient.invalidateQueries({
        queryKey: ['resumeAnalysis', candidateId],
        refetchType: 'active',
      });

      setAnalysisProgress(100);

      toast({
        title: "Success",
        description: "Resume analysis completed successfully",
      });
    } catch (error) {
      console.error("[FileUpload] Error analyzing resume:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error analyzing the resume",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    }
  };

  return (
    <Card className="p-6 animate-fadeIn bg-white hover:bg-black/5 transition-colors shadow-lg border border-white/20">
      <div className="space-y-4">
        <FileUploadZone
          isDragging={isDragging}
          isUploading={isUploading}
          uploadedFileName={uploadedFileName}
          uploadProgress={uploadProgress}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileInput}
          onReset={handleReset}
        />
        {uploadedFileName && (
          <>
            <div className="space-y-2">
              <Button
                onClick={handleAnalyzeResume}
                className="w-full shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 disabled:bg-primary/80"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
              {isAnalyzing && (
                <Progress 
                  value={analysisProgress} 
                  className="h-2 w-full bg-secondary/20"
                />
              )}
            </div>
            <DocxAnalysis />
          </>
        )}
      </div>
    </Card>
  );
};