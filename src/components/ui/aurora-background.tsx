import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AuroraBackground = ({ className, children, ...props }: AuroraBackgroundProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[90%] bg-[radial-gradient(ellipse_at_top,_#D3E4FD75_0%,_#D3E4FD35_35%,_transparent_50%)] animate-aurora" 
        />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};