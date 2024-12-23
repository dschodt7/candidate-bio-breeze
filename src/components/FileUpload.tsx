import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    await handleFileUpload(droppedFile);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      });
      return;
    }

    setFile(uploadedFile);
    console.log("File uploaded:", uploadedFile.name);
    toast({
      title: "File uploaded successfully",
      description: uploadedFile.name
    });
  };

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all duration-200 ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      } animate-fadeIn`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-lg font-medium">Drop your resume here</p>
          <p className="text-sm text-muted-foreground">
            Upload PDF or Word documents
          </p>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileInput}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="mt-2" asChild>
            <span>Select File</span>
          </Button>
        </label>
        {file && (
          <div className="text-sm text-muted-foreground mt-2">
            <p>Uploaded: {file.name}</p>
          </div>
        )}
      </div>
    </Card>
  );
};