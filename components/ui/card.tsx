import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "green" | "none";
}

export function Card({ children, className, glow = "none" }: CardProps) {
  const glows = {
    purple: "glow-purple border-purple-500/30",
    cyan: "glow-cyan border-cyan-500/30",
    green: "glow-green border-green-500/30",
    none: "border-white/8",
  };

  return (
    <div className={cn("glass rounded-2xl p-6", glows[glow], className)}>
      {children}
    </div>
  );
}
