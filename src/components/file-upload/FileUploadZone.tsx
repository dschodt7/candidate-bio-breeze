import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  isDragging: boolean;
  isUploading: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadZone = ({
  isDragging,
  isUploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: FileUploadZoneProps) => {
  return (
    <div
      className={`p-8 border-2 border-dashed transition-all duration-200 ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      } animate-fadeIn`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
          onChange={onFileSelect}
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="mt-2" asChild disabled={isUploading}>
            <span>{isUploading ? "Uploading..." : "Select File"}</span>
          </Button>
        </label>
      </div>
    </div>
  );
};