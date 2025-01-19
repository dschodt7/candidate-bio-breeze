import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Bot, Briefcase, CheckSquare, Square, Wand2, Lock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ResumeOptimizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptimize: (options: OptimizerOptions) => void;
  isOptimizing: boolean;
}

interface OptimizerOptions {
  analysisType: 'quick-scan' | 'deep-dive' | 'strategic';
  positioningLevel: 'ceo' | 'c-level' | 'senior-leader';
  industry: string;
  sections: {
    summary: boolean;
    experience: boolean;
    skills: boolean;
    achievements: boolean;
    competencies: boolean;
  };
}

export const ResumeOptimizerDialog = ({
  open,
  onOpenChange,
  onOptimize,
  isOptimizing
}: ResumeOptimizerDialogProps) => {
  const [options, setOptions] = useState<OptimizerOptions>({
    analysisType: 'deep-dive',
    positioningLevel: 'c-level',
    industry: '',
    sections: {
      summary: true,
      experience: true,
      skills: true,
      achievements: true,
      competencies: true
    }
  });

  const toggleSection = (key: keyof OptimizerOptions['sections']) => {
    setOptions(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key]
      }
    }));
  };

  const handleOptimize = () => {
    onOptimize(options);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-[#1A202C] to-[#4A235A] text-white p-4">
        <DialogHeader className="py-2">
          <DialogTitle className="text-center flex items-center justify-center gap-1.5 text-xl">
            <Bot className="h-5 w-5 text-purple-300" />
            <span className="text-white">Resume Optimizer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Analysis Type</Label>
            <RadioGroup
              value={options.analysisType}
              onValueChange={(value: OptimizerOptions['analysisType']) => 
                setOptions(prev => ({ ...prev, analysisType: value }))
              }
              className="grid gap-1.5"
            >
              {[
                { value: 'quick-scan', label: 'Quick Scan', description: 'Overview, Rapid Assessment' },
                { value: 'deep-dive', label: 'Deep Dive', description: 'Comprehensive Analysis with Detailed Insights' },
                { value: 'strategic', label: 'Strategic Enhancement', description: 'Advanced Optimization for Executive Positioning' }
              ].map(({ value, label, description }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`type-${value}`} className="border-purple-300 text-purple-300" />
                  <Label htmlFor={`type-${value}`} className="flex flex-col cursor-pointer">
                    <span className="font-medium text-white">{label}</span>
                    <span className="text-xs text-gray-300">{description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Positioning Level</Label>
            <RadioGroup
              value={options.positioningLevel}
              onValueChange={(value: OptimizerOptions['positioningLevel']) => 
                setOptions(prev => ({ ...prev, positioningLevel: value }))
              }
              className="grid gap-1.5"
            >
              {[
                { value: 'ceo', label: 'CEO', description: 'Enterprise Level' },
                { value: 'c-level', label: 'C-Level Executive', description: 'Domain Expert' },
                { value: 'senior-leader', label: 'Senior Leader', description: 'Proven Leader' }
              ].map(({ value, label, description }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`level-${value}`} className="border-purple-300 text-purple-300" />
                  <Label htmlFor={`level-${value}`} className="flex flex-col cursor-pointer">
                    <span className="font-medium text-white">{label}</span>
                    <span className="text-xs text-gray-300">{description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Industry Context</Label>
            <div className="relative">
              <Input
                value={options.industry}
                onChange={(e) => setOptions(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Enter your industry"
                className="pl-9 bg-[#1A202C] border-purple-300/20 text-white placeholder:text-gray-400"
              />
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-white">Target Sections to Optimize</Label>
            <div className="grid gap-1">
              <div className="flex items-center gap-2 p-1.5 rounded-md bg-[#4A235A]/30 text-white">
                <Lock className="h-4 w-4 text-purple-300" />
                <FileText className="h-4 w-4 text-purple-300" />
                <span className="font-medium">Full Resume Text</span>
              </div>
              {[
                { key: 'summary', label: 'Professional Summary' },
                { key: 'experience', label: 'Work Experience' },
                { key: 'skills', label: 'Skills & Expertise' },
                { key: 'achievements', label: 'Key Achievements' },
                { key: 'competencies', label: 'Core Competencies' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSection(key as keyof OptimizerOptions['sections'])}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-md transition-all duration-200",
                    "hover:bg-[#4A235A]/50 text-left group",
                    options.sections[key as keyof OptimizerOptions['sections']] 
                      ? "bg-[#4A235A]/30 text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {options.sections[key as keyof OptimizerOptions['sections']] ? (
                    <CheckSquare className="h-4 w-4 text-purple-300 transition-transform group-hover:scale-110" />
                  ) : (
                    <Square className="h-4 w-4 transition-transform group-hover:scale-110" />
                  )}
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleOptimize}
          disabled={isOptimizing || !options.industry.trim()}
          className="w-full relative group transition-all duration-200 disabled:opacity-70 bg-gradient-to-r from-[#1A202C] to-[#4A235A] hover:from-[#4A235A] hover:to-[#1A202C] border border-purple-300/20 py-2"
        >
          <span className="flex items-center justify-center gap-1.5">
            {isOptimizing ? (
              <>
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
                Optimizing Your Resume...
                <Wand2 className="h-4 w-4 animate-pulse text-yellow-400" />
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 animate-pulse transition-transform group-hover:rotate-12 text-yellow-400" />
                Optimize Resume Content
              </>
            )}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};