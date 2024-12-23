import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInInput = () => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  useEffect(() => {
    const fetchLinkedInUrl = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching LinkedIn URL for candidate:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('linkedin_url')
          .eq('id', candidateId)
          .single();

        if (error) throw error;

        console.log("Fetched LinkedIn URL:", data.linkedin_url);
        setUrl(data.linkedin_url || "");
      } catch (error) {
        console.error("Error fetching LinkedIn URL:", error);
        toast({
          title: "Error",
          description: "Failed to load LinkedIn URL",
          variant: "destructive",
        });
      }
    };

    fetchLinkedInUrl();
  }, [candidateId, toast]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    console.log("LinkedIn URL updated:", e.target.value);
  };

  const handleSave = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn URL",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Saving LinkedIn URL for candidate:", candidateId);
      const { error } = await supabase
        .from('candidates')
        .update({ linkedin_url: url })
        .eq('id', candidateId);

      if (error) throw error;

      console.log("LinkedIn URL saved successfully");
      toast({
        title: "Success",
        description: "LinkedIn URL saved successfully",
      });
    } catch (error) {
      console.error("Error saving LinkedIn URL:", error);
      toast({
        title: "Error",
        description: "Failed to save LinkedIn URL",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
        <div className="flex gap-4">
          <Input
            id="linkedin-url"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={url}
            onChange={handleUrlChange}
            className="flex-1"
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Card>
  );
};