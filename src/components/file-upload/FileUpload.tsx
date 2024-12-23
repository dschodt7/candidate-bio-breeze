import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { useFileUpload } from "./useFileUpload";

export const FileUpload = () => {
  const {
    isDragging,
    isUploading,
    uploadedFileName,
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
        uploadedFileName={uploadedFileName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileInput}
      />
    </Card>
  );
};