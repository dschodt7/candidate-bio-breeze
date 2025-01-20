import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuroraBackground({ children, className, ...props }: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.15),rgba(30,41,59,0.15))] opacity-70"
        style={{
          maskImage: "radial-gradient(circle at center center, black, transparent)",
          WebkitMaskImage: "radial-gradient(circle at center center, black, transparent)",
        }}
      />
      {children}
    </div>
  );
}