import { Upload, Bot, Combine } from "lucide-react";

export const MinimalistConnector = () => {
  return (
    <div className="relative h-4 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 flex items-center justify-between">
        {/* Dashed lines */}
        <div className="flex-1 border-t border-dashed border-slate-200 mx-4" />
        <div className="flex-1 border-t border-dashed border-slate-200 mx-4" />
      </div>
      <div className="absolute inset-0 flex items-center justify-between">
        {/* Icons */}
        <Upload className="size-6 text-primary fill-white" strokeWidth={1} />
        <Combine className="size-6 text-primary fill-white" strokeWidth={1} />
        <Bot className="size-6 text-primary fill-white" strokeWidth={1} />
      </div>
    </div>
  );
};