import React from "react";
import { Film } from "lucide-react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-2 group shrink-0 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
        <Film size={18} className="text-black" fill="currentColor" />
      </div>
      {!iconOnly && (
        <span className="text-sm font-bold tracking-tight text-white">
          MEDIA TRACKER
        </span>
      )}
    </div>
  );
};
