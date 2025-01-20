import { Circle } from "lucide-react";

export const MinimalistConnector = () => {
  return (
    <div className="relative h-8 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 flex items-center justify-between">
        {/* Dashed lines */}
        <div className="flex-1 border-t border-dashed border-slate-200 mx-4" />
        <div className="flex-1 border-t border-dashed border-slate-200 mx-4" />
      </div>
      <div className="absolute inset-0 flex items-center justify-between">
        {/* Circles */}
        <Circle className="h-2 w-2 text-slate-200 fill-white" strokeWidth={1} />
        <Circle className="h-2 w-2 text-slate-200 fill-white" strokeWidth={1} />
        <Circle className="h-2 w-2 text-slate-200 fill-white" strokeWidth={1} />
      </div>
    </div>
  );
};