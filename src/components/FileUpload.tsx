import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      console.log("File uploaded:", droppedFile.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      console.log("File uploaded:", selectedFile.name);
    }
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
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
        <input
          type="file"
          accept=".pdf"
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
          <p className="text-sm text-muted-foreground mt-2">{file.name}</p>
        )}
      </div>
    </Card>
  );
};