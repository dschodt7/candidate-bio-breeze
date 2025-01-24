import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocxAnalysis } from "./analysis/DocxAnalysis";
import { useQueryClient } from "@tanstack/react-query";

export const FileUpload = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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
      const { data: candidate, error: fetchError } = await supabase
        .from('candidates')
        .select('resume_text')
        .eq('id', candidateId)
        .single();

      if (fetchError) {
        console.error("Error fetching candidate resume text:", fetchError);
      } else {
        console.log("Candidate resume text status:", {
          hasText: !!candidate?.resume_text,
          textLength: candidate?.resume_text?.length,
          preview: candidate?.resume_text?.substring(0, 100)
        });
      }

      setIsAnalyzing(true);
      console.log("[FileUpload] Starting resume analysis for candidate:", candidateId);
      toast({
        title: "Processing",
        description: "Starting resume analysis...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("[FileUpload] Analysis response:", {
        success: data.success,
        hasData: !!data.data,
        sections: data.data ? Object.keys(data.data) : [],
        firstSection: data.data?.credibility_statements?.substring(0, 100)
      });

      // Immediate query invalidation
      await queryClient.invalidateQueries({
        queryKey: ['resumeAnalysis', candidateId],
        refetchType: 'active',
      });

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
      setIsAnalyzing(false);
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
            <Button
              onClick={handleAnalyzeResume}
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isAnalyzing}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
            </Button>
            <DocxAnalysis />
          </>
        )}
      </div>
    </Card>
  );
};