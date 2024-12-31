import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  isDragging: boolean;
  isUploading: boolean;
  uploadedFileName: string | null;
  uploadProgress?: number;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadZone = ({
  isDragging,
  isUploading,
  uploadedFileName,
  uploadProgress = 0,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: FileUploadZoneProps) => {
  if (uploadedFileName) {
    return (
      <div className="p-4 border rounded-lg animate-fadeIn">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-600">
              {uploadedFileName}
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
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <span>{isUploading ? "Uploading..." : "Replace File"}</span>
            </Button>
          </label>
        </div>
      </div>
    );
  }

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
        {isUploading && (
          <div className="w-full max-w-xs mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground mt-2">
              {uploadProgress < 100 ? "Uploading..." : "Processing..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};