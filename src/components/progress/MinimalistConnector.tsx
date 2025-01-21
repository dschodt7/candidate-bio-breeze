import { Upload, Bot, Combine } from "lucide-react";

export const MinimalistConnector = () => {
  // Create an array of 21 dots (using index for key)
  const dots = Array.from({ length: 21 });

  return (
    <div className="relative h-4 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 grid grid-cols-[300px_1fr_300px] items-center">
        <div className="flex justify-center">
          <Upload className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
        <div className="flex justify-center gap-24">
          {/* First set of dots */}
          <div className="flex gap-2">
            {dots.map((_, i) => (
              <div
                key={`dot1-${i}`}
                className="h-1 w-1 rounded-full bg-gray-300 opacity-40"
              />
            ))}
          </div>
          <Combine className="size-6 text-primary fill-white" strokeWidth={1} />
          {/* Second set of dots */}
          <div className="flex gap-2">
            {dots.map((_, i) => (
              <div
                key={`dot2-${i}`}
                className="h-1 w-1 rounded-full bg-gray-300 opacity-40"
              />
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <Bot className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};