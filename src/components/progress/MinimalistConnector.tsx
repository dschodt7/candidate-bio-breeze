import { Upload, Bot, Combine } from "lucide-react";

export const MinimalistConnector = () => {
  return (
    <div className="relative h-4 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 grid grid-cols-[300px_1fr_300px] items-center">
        <div className="flex justify-center">
          <Upload className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
        <div className="flex justify-center gap-12">
          {/* First set of dots */}
          <div className="flex gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          </div>
          <Combine className="size-6 text-primary fill-white" strokeWidth={1} />
          {/* Second set of dots */}
          <div className="flex gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="flex justify-center">
          <Bot className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};