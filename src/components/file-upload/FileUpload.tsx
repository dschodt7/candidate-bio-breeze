import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "./useFileUpload";

export const FileUpload = () => {
  const {
    isDragging,
    isUploading,
    file,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  } = useFileUpload();

  return (
    <Card className="p-6 animate-fadeIn">
      <FileUploadZone
        isDragging={isDragging}
        isUploading={isUploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileInput}
      />
      {file && !isUploading && (
        <div className="text-sm text-muted-foreground mt-2">
          <p>Uploaded: {file.name}</p>
        </div>
      )}
    </Card>
  );
};