import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "cyan";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    danger: "bg-red-500/10 text-red-400 border-red-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
