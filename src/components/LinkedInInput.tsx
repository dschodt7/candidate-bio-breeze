import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInInput = () => {
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
          .single();

        if (error) throw error;

        console.log("Fetched LinkedIn URL:", data.linkedin_url);
        setUrl(data.linkedin_url || "");
        setIsSubmitted(!!data.linkedin_url);
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

  const handleSubmit = async () => {
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
      console.log("Submitting LinkedIn URL for candidate:", candidateId);
      const { error } = await supabase
        .from('candidates')
        .update({ linkedin_url: url })
        .eq('id', candidateId);

      if (error) throw error;

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
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
        <div className="flex gap-4">
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
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="gap-2">
              {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
              {isSubmitted ? "Submitted" : "Submit"}
            </Button>
            {isSubmitted && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};