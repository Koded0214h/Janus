import React from 'react';
import { SidebarTrigger } from "@/components/ui/Sidebar";
import { Wallet, ChevronDown, Search } from "lucide-react";

export function JanusHeader({ title }) {
  
  return (
    <header className="sticky top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 w-full border-b border-outline-variant/10 bg-background/80 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      {/* Left side: Tab Name */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:text-primary transition-colors" />
          <div className="h-6 w-px bg-outline-variant/20 hidden md:block" />
          <span className="font-black text-xl tracking-tighter text-primary uppercase hidden lg:block">
            {title || "Janus Protocol"}
          </span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all">
          <Search className="w-5 h-5" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-outline-variant/20" />

        {/* New Intent/Policy Button */}
        <div className="relative">
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full border border-primary hover:bg-primary/90 transition-all group shadow-sm active:scale-95">
            <span className="font-bold tracking-tight text-sm">New</span>
            <ChevronDown className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Connect Wallet Button */}
        <button className="flex items-center gap-3 bg-surface-container-lowest px-4 py-1.5 rounded-full border border-outline-variant/20 hover:border-primary/50 transition-all group shadow-sm active:scale-95">
          <Wallet className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-mono text-sm font-bold text-on-surface">Connect Wallet</span>
        </button>
      </div>
    </header>
  );
}
