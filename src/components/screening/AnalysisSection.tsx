import { Card } from "@/components/ui/card";

interface AnalysisSectionProps {
  title: string;
  content: string;
}

export const AnalysisSection = ({ title, content }: AnalysisSectionProps) => {
  return (
    <Card className="p-4">
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
    </Card>
  );
};