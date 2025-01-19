import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Bot, CheckSquare, Square, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdealCompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: CompanyProfileOptions) => void;
  isGenerating: boolean;
}

interface CompanyProfileOptions {
  components: {
    cultureValues: boolean;
    leadershipStyle: boolean;
    growthStage: boolean;
    marketPosition: boolean;
    innovationFocus: boolean;
    teamComposition: boolean;
  };
  format: 'snapshot' | 'detailed' | 'strategic';
  tone: 'strategic' | 'visionary' | 'pragmatic';
}

export const IdealCompanyProfileDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating
}: IdealCompanyProfileDialogProps) => {
  const [options, setOptions] = useState<CompanyProfileOptions>({
    components: {
      cultureValues: true,
      leadershipStyle: true,
      growthStage: true,
      marketPosition: true,
      innovationFocus: true,
      teamComposition: true
    },
    format: 'detailed',
    tone: 'strategic'
  });

  const toggleComponent = (key: keyof CompanyProfileOptions['components']) => {
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
            <span className="text-white">Ideal Company Profile Generator</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Components to Include</Label>
            <div className="grid gap-1">
              {[
                { key: 'cultureValues', label: 'Company Culture & Values' },
                { key: 'leadershipStyle', label: 'Leadership Style & Structure' },
                { key: 'growthStage', label: 'Growth Stage & Trajectory' },
                { key: 'marketPosition', label: 'Market Position & Strategy' },
                { key: 'innovationFocus', label: 'Innovation & Technology Focus' },
                { key: 'teamComposition', label: 'Team Composition & Dynamics' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleComponent(key as keyof CompanyProfileOptions['components'])}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-md transition-all duration-200",
                    "hover:bg-[#4A235A]/50 text-left group",
                    options.components[key as keyof CompanyProfileOptions['components']] 
                      ? "bg-[#4A235A]/30 text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {options.components[key as keyof CompanyProfileOptions['components']] ? (
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
                onValueChange={(value: CompanyProfileOptions['format']) => 
                  setOptions(prev => ({ ...prev, format: value }))
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'snapshot', label: 'Snapshot', description: 'Key highlights' },
                  { value: 'detailed', label: 'Detailed Analysis', description: 'Full company profile' },
                  { value: 'strategic', label: 'Strategic Deep-Dive', description: 'Comprehensive analysis' }
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
                onValueChange={(value: CompanyProfileOptions['tone']) => 
                  setOptions(prev => ({ ...prev, tone: value }))
                }
                className="grid gap-1.5"
              >
                {[
                  { value: 'strategic', label: 'Strategic', description: 'Market-focused analysis' },
                  { value: 'visionary', label: 'Visionary', description: 'Future possibilities' },
                  { value: 'pragmatic', label: 'Pragmatic', description: 'Practical insights' }
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
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
                Crafting Your Ideal Company Profile...
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 animate-pulse transition-transform group-hover:rotate-12 text-yellow-400" />
                Generate Company Profile
              </>
            )}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};