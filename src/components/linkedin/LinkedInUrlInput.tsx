import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInUrlDisplay } from "./url/LinkedInUrlDisplay";

export const LinkedInUrlInput = () => {
  const [url, setUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
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
          .maybeSingle();

        if (error) throw error;

        console.log("Fetched LinkedIn URL:", data?.linkedin_url);
        setUrl(data?.linkedin_url || "");
        setIsSubmitted(!!data?.linkedin_url);
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

  const formatUrl = (inputUrl: string) => {
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    return formattedUrl;
  };

  const handleSubmit = async () => {
    if (!candidateId || !url) {
      toast({
        title: "Error",
        description: !candidateId ? "No candidate selected" : "Please enter a LinkedIn URL",
        variant: "destructive",
      });
      return;
    }

    const formattedUrl = formatUrl(url);

    try {
      console.log("Submitting LinkedIn URL for candidate:", candidateId);
      const { error } = await supabase
        .from('candidates')
        .update({ linkedin_url: formattedUrl })
        .eq('id', candidateId);

      if (error) throw error;

      setUrl(formattedUrl);
      console.log("LinkedIn URL submitted successfully");
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "LinkedIn URL submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting LinkedIn URL:", error);
      toast({
        title: "Error",
        description: "Failed to submit LinkedIn URL",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setUrl("");
    setIsSubmitted(false);
    console.log("LinkedIn URL reset");
    toast({
      title: "Reset",
      description: "LinkedIn URL has been reset",
    });
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="linkedin-url">LinkedIn Profile URL (For Reference)</Label>
      <div className="flex gap-4">
        {isSubmitted ? (
          <LinkedInUrlDisplay 
            url={url} 
            onEdit={() => setIsSubmitted(false)}
            onReset={handleReset}
          />
        ) : (
          <>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsSubmitted(false);
              }}
              className="flex-1"
            />
            <Button onClick={handleSubmit} className="gap-2">
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};