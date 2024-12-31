import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResumeAnalysis } from "./ResumeAnalysis";

export const FileUpload = () => {
  // Move all hook calls to the top level
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
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
      console.log("Starting resume analysis for candidate:", candidateId);
      toast({
        title: "Processing",
        description: "Starting resume analysis...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Analysis completed:", data);
      toast({
        title: "Success",
        description: "Resume analysis completed successfully",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
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
            <ResumeAnalysis />
          </>
        )}
      </div>
    </Card>
  );
};