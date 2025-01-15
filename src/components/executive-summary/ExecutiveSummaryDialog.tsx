import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Sparkles } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-sparkle" />
            <span>At Your Service!</span>
            <Sparkles className="h-5 w-5 text-yellow-400 animate-sparkle" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Components Selection */}
          <div className="space-y-4">
            <Label className="text-base">Components to Include</Label>
            <div className="grid gap-3">
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
                    "flex items-center gap-2 p-2 rounded-md transition-colors",
                    "hover:bg-accent text-left",
                    options.components[key as keyof SummaryOptions['components']] && "text-primary"
                  )}
                >
                  {options.components[key as keyof SummaryOptions['components']] ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-base">Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value: SummaryOptions['format']) => 
                setOptions(prev => ({ ...prev, format: value }))
              }
              className="grid gap-3"
            >
              {[
                { value: 'snapshot', label: 'Snapshot', description: '1-2 paragraphs' },
                { value: 'detailed', label: 'Detailed', description: 'Full page' },
                { value: 'comprehensive', label: 'Comprehensive', description: '2-3 pages' }
              ].map(({ value, label, description }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`format-${value}`} />
                  <Label htmlFor={`format-${value}`} className="flex flex-col">
                    <span>{label}</span>
                    <span className="text-sm text-muted-foreground">{description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Tone Selection */}
          <div className="space-y-4">
            <Label className="text-base">Tone</Label>
            <RadioGroup
              value={options.tone}
              onValueChange={(value: SummaryOptions['tone']) => 
                setOptions(prev => ({ ...prev, tone: value }))
              }
              className="grid gap-3"
            >
              {[
                { 
                  value: 'formal', 
                  label: 'Formal Excellence', 
                  description: 'Professional and data-driven' 
                },
                { 
                  value: 'narrative', 
                  label: 'Narrative Impact', 
                  description: 'Engaging storytelling approach' 
                },
                { 
                  value: 'glorious', 
                  label: 'Glorious Achievement', 
                  description: 'Bold and inspirational' 
                }
              ].map(({ value, label, description }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`tone-${value}`} />
                  <Label htmlFor={`tone-${value}`} className="flex flex-col">
                    <span>{label}</span>
                    <span className="text-sm text-muted-foreground">{description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full relative group"
        >
          <span className="flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Generate Executive Summary
              </>
            )}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};