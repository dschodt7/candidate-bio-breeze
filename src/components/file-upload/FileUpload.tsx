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

      // Invalidate the resumeAnalysis query to force a refresh
      await queryClient.invalidateQueries({
        queryKey: ['resumeAnalysis', candidateId]
      });

      toast({
        title: "Success",
        description: "Resume analysis completed successfully",
      });
    } catch (error) {
      console.error("[FileUpload] Error analyzing resume:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the resume",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 animate-fadeIn">
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
              className="w-full"
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