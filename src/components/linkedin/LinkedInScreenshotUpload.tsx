import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { LinkedInScreenshot } from "./types";

export const LinkedInScreenshotUpload = () => {
  const [screenshots, setScreenshots] = useState<LinkedInScreenshot[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  useEffect(() => {
    const fetchScreenshots = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching LinkedIn screenshots for candidate:", candidateId);
        const { data, error } = await supabase
          .from('executive_summaries')
          .select('linkedin_screenshots')
          .eq('candidate_id', candidateId)
          .single();

        if (error) throw error;

        if (data?.linkedin_screenshots) {
          setScreenshots(data.linkedin_screenshots.map((path: string) => ({
            path,
            name: path.split('/').pop() || path
          })));
        }
      } catch (error) {
        console.error("Error fetching screenshots:", error);
        toast({
          title: "Error",
          description: "Failed to load screenshots",
          variant: "destructive",
        });
      }
    };

    fetchScreenshots();
  }, [candidateId, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !candidateId) return;

    try {
      setIsUploading(true);
      console.log("Uploading screenshot for candidate:", candidateId);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${candidateId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('linkedin-screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const newScreenshot = { path: filePath, name: file.name };
      const updatedScreenshots = [...screenshots, newScreenshot];

      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          linkedin_screenshots: updatedScreenshots.map(s => s.path)
        });

      if (updateError) throw updateError;

      setScreenshots(updatedScreenshots);
      toast({
        title: "Success",
        description: "Screenshot uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to upload screenshot",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (screenshotPath: string) => {
    if (!candidateId) return;

    try {
      console.log("Deleting screenshot:", screenshotPath);

      const { error: deleteError } = await supabase.storage
        .from('linkedin-screenshots')
        .remove([screenshotPath]);

      if (deleteError) throw deleteError;

      const updatedScreenshots = screenshots.filter(s => s.path !== screenshotPath);

      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          linkedin_screenshots: updatedScreenshots.map(s => s.path)
        });

      if (updateError) throw updateError;

      setScreenshots(updatedScreenshots);
      toast({
        title: "Success",
        description: "Screenshot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to delete screenshot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>LinkedIn Screenshots</Label>
      <div className="border-2 border-dashed rounded-lg p-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="screenshot-upload"
          disabled={isUploading}
        />
        <label htmlFor="screenshot-upload">
          <Button variant="outline" className="w-full" asChild disabled={isUploading}>
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Screenshot"}
            </span>
          </Button>
        </label>
      </div>

      {screenshots.length > 0 && (
        <div className="grid gap-4 mt-4">
          {screenshots.map((screenshot) => (
            <div key={screenshot.path} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm truncate">{screenshot.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(screenshot.path)}
                className="text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};