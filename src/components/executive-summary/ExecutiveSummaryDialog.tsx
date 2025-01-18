import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Bot, CheckSquare, Square, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: SummaryOptions) => void;
  isGenerating: boolean;
}

interface SummaryOptions {
  components: {
    credibility: boolean;
    results: boolean;
    caseStudies: boolean;
    businessProblems: boolean;
    motivations: boolean;
    leaderDiscoveryCriteria: boolean;
  };
  format: 'snapshot' | 'detailed' | 'comprehensive';
  tone: 'formal' | 'narrative' | 'glorious';
}

export const ExecutiveSummaryDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating
}: ExecutiveSummaryDialogProps) => {
  const [options, setOptions] = useState<SummaryOptions>({
    components: {
      credibility: true,
      results: true,
      caseStudies: true,
      businessProblems: true,
      motivations: true,
      leaderDiscoveryCriteria: true
    },
    format: 'detailed',
    tone: 'formal'
  });

  const toggleComponent = (key: keyof SummaryOptions['components']) => {
    setOptions(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: !prev.components[key]
      }
    }));
  };

  const handleGenerate = () => {
    onGenerate(options);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-[#1A202C] to-[#4A235A] text-white p-4">
        <DialogHeader className="py-2">
          <DialogTitle className="text-center flex items-center justify-center gap-1.5 text-xl">
            <Bot className="h-5 w-5 text-purple-300" />
            <span className="text-white">At Your Service!</span>
            <Bot className="h-5 w-5 text-purple-300" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Components to Include</Label>
            <div className="grid gap-1">
              {[
                { key: 'credibility', label: 'Assessment of Current Skills' },
                { key: 'results', label: 'Results and Achievements' },
                { key: 'caseStudies', label: 'Case Studies' },
                { key: 'businessProblems', label: 'Business Problems' },
                { key: 'motivations', label: 'Motivations' },
                { key: 'leaderDiscoveryCriteria', label: 'Leader Discovery Criteria' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleComponent(key as keyof SummaryOptions['components'])}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-md transition-all duration-200",
                    "hover:bg-[#4A235A]/50 text-left group",
                    options.components[key as keyof SummaryOptions['components']] 
                      ? "bg-[#4A235A]/30 text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {options.components[key as keyof SummaryOptions['components']] ? (
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
              <Label className="text-base font-semibold text-white">Format</Label>
              <RadioGroup
                value={options.format}
                onValueChange={(value: SummaryOptions['format']) => 
                  setOptions(prev => ({ ...prev, format: value }))
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'snapshot', label: 'Snapshot', description: '1-2 paragraphs' },
                  { value: 'detailed', label: 'Detailed', description: 'Full page' },
                  { value: 'comprehensive', label: 'Comprehensive', description: '2-3 pages' }
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
              <Label className="text-base font-semibold text-white">Tone</Label>
              <RadioGroup
                value={options.tone}
                onValueChange={(value: SummaryOptions['tone']) => 
                  setOptions(prev => ({ ...prev, tone: value }))
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'formal', label: 'Formal Excellence', description: 'Professional and data-driven' },
                  { value: 'narrative', label: 'Narrative Impact', description: 'Engaging storytelling approach' },
                  { value: 'glorious', label: 'Glorious Achievement', description: 'Bold and inspirational' }
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
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full relative group transition-all duration-200 disabled:opacity-70 bg-gradient-to-r from-[#1A202C] to-[#4A235A] hover:from-[#4A235A] hover:to-[#1A202C] border border-purple-300/20 py-2"
        >
          <span className="flex items-center justify-center gap-1.5">
            {isGenerating ? (
              <>
                <Star className="h-4 w-4 animate-pulse text-yellow-400" />
                Making Magic, Take 3 Deep Breaths!
                <Star className="h-4 w-4 animate-pulse text-yellow-400" />
              </>
            ) : (
              <>
                <Star className="h-4 w-4 transition-transform group-hover:rotate-12 text-yellow-400" />
                Generate Executive Summary
              </>
            )}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};