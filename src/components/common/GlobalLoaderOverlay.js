import React from "react";
import { Loader2 } from "lucide-react";
import { useGlobalLoader } from "../../context/GlobalLoaderContext";

export default function GlobalLoaderOverlay() {
  const { isLoading } = useGlobalLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px]">
      <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/50 bg-white/95 px-5 py-4 shadow-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-[#981B1F]" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Processing request...</p>
          <p className="text-xs text-slate-500">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
