import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Bot, CheckSquare, Square, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

interface LinkedInOptimizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptimize: (options: OptimizerOptions) => void;
  isOptimizing: boolean;
}

interface SectionState {
  [key: string]: boolean;
}

interface OptimizerOptions {
  sections: {
    [key: string]: string;  // actual content
  };
  format: 'strategic-narrative' | 'achievement-focused' | 'domain-authority';
  tone: 'ceo-board' | 'c-level' | 'senior-leader';
}

export const LinkedInOptimizerDialog = ({
  open,
  onOpenChange,
  onOptimize,
  isOptimizing
}: LinkedInOptimizerDialogProps) => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const [selectedSections, setSelectedSections] = useState<SectionState>({
    about: true,
    experience_1: true,
    experience_2: true,
    experience_3: true,
    skills: true,
    recommendations: true
  });
  const [format, setFormat] = useState<OptimizerOptions['format']>('achievement-focused');
  const [tone, setTone] = useState<OptimizerOptions['tone']>('c-level');

  // Fetch LinkedIn sections content
  const { data: linkedInSections } = useQuery({
    queryKey: ['linkedin-sections', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[LinkedInOptimizerDialog] Fetching LinkedIn sections for candidate:", candidateId);
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('section_type, content')
        .eq('candidate_id', candidateId);

      if (error) {
        console.error("[LinkedInOptimizerDialog] Error fetching LinkedIn sections:", error);
        throw error;
      }

      console.log("[LinkedInOptimizerDialog] Fetched sections:", data);
      return data.reduce((acc, section) => ({
        ...acc,
        [section.section_type]: section.content
      }), {} as Record<string, string>);
    },
    enabled: !!candidateId
  });

  const toggleSection = (key: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleOptimize = async () => {
    try {
      if (!linkedInSections) {
        toast({
          title: "Error",
          description: "No LinkedIn content available to optimize",
          variant: "destructive",
        });
        return;
      }

      // Filter sections based on selection and content availability
      const sectionsToOptimize = Object.entries(selectedSections)
        .filter(([key, isSelected]) => isSelected && linkedInSections[key])
        .reduce((acc, [key]) => {
          acc[key] = linkedInSections[key];
          return acc;
        }, {} as Record<string, string>);

      if (Object.keys(sectionsToOptimize).length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one section with content to optimize",
          variant: "destructive",
        });
        return;
      }

      console.log("[LinkedInOptimizerDialog] Optimizing sections with content:", sectionsToOptimize);

      onOptimize({
        sections: sectionsToOptimize,
        format,
        tone
      });
    } catch (error) {
      console.error('[LinkedInOptimizerDialog] Error in LinkedIn optimization:', error);
      toast({
        title: "Error",
        description: "Failed to optimize LinkedIn content",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-[#1A202C] to-[#4A235A] text-white p-4">
        <DialogHeader className="py-2">
          <DialogTitle className="text-center flex items-center justify-center gap-1.5 text-xl">
            <Bot className="h-5 w-5 text-purple-300" />
            <span className="text-white">LinkedIn Profile Optimizer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Sections to Optimize</Label>
            <div className="grid gap-1">
              {[
                { key: 'about', label: 'About Section' },
                { key: 'experience_1', label: 'Experience 1' },
                { key: 'experience_2', label: 'Experience 2' },
                { key: 'experience_3', label: 'Experience 3' },
                { key: 'skills', label: 'Skills' },
                { key: 'recommendations', label: 'Recommendations' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-md transition-all duration-200",
                    "hover:bg-[#4A235A]/50 text-left group",
                    selectedSections[key]
                      ? "bg-[#4A235A]/30 text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {selectedSections[key] ? (
                    <CheckSquare className="h-4 w-4 text-purple-300 transition-transform group-hover:scale-110" />
                  ) : (
                    <Square className="h-4 w-4 transition-transform group-hover:scale-110" />
                  )}
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-base font-semibold text-white">Content Approach</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: OptimizerOptions['format']) => 
                  setFormat(value)
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'strategic-narrative', label: 'Strategic Narrative', description: 'Vision-Driven Leadership' },
                  { value: 'achievement-focused', label: 'Achievement Focused', description: 'Results & Impact' },
                  { value: 'domain-authority', label: 'Domain Authority', description: 'Industry Expertise' }
                ].map(({ value, label, description }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`format-${value}`} className="border-purple-300 text-purple-300" />
                    <Label htmlFor={`format-${value}`} className="flex flex-col cursor-pointer">
                      <span className="font-medium text-white">{label}</span>
                      <span className="text-xs text-gray-300">{description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label className="text-base font-semibold text-white">Positioning Level</Label>
              <RadioGroup
                value={tone}
                onValueChange={(value: OptimizerOptions['tone']) => 
                  setTone(value)
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'ceo-board', label: 'CEO', description: 'Enterprise Level' },
                  { value: 'c-level', label: 'C-Level Executive', description: 'Domain Expert' },
                  { value: 'senior-leader', label: 'Senior Leader', description: 'Proven Leader' }
                ].map(({ value, label, description }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`tone-${value}`} className="border-purple-300 text-purple-300" />
                    <Label htmlFor={`tone-${value}`} className="flex flex-col cursor-pointer">
                      <span className="font-medium text-white">{label}</span>
                      <span className="text-xs text-gray-300">{description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full relative group transition-all duration-200 disabled:opacity-70 bg-gradient-to-r from-[#1A202C] to-[#4A235A] hover:from-[#4A235A] hover:to-[#1A202C] border border-purple-300/20 py-2"
        >
          <span className="flex items-center justify-center gap-1.5">
            {isOptimizing ? (
              <>
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
                Making Magic, Take 3 Deep Breaths!
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 animate-pulse transition-transform group-hover:rotate-12 text-yellow-400" />
                Optimize LinkedIn Content
              </>
            )}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
