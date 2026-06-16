import React from "react";
import { cn } from "../../lib/utils/utils";

const variantStyles = {
  default: "border-transparent bg-[#3a5f9e] text-white hover:bg-[#325186]",
  secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
  destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
  outline: "text-slate-950 border-slate-200 hover:bg-slate-50",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
