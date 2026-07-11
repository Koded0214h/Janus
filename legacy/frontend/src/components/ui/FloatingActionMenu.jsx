"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingActionMenu = ({
  options,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={cn("fixed bottom-8 right-8 z-[100] p-2", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button
        className="w-14 h-14 rounded-full bg-[#11111198] hover:bg-primary hover:text-on-primary shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md border border-primary/20 p-0 relative z-10"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="flex items-center justify-center"
        >
          <Plus className="w-8 h-8" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute bottom-20 right-2 mb-2"
          >
            <div className="flex flex-col items-end gap-3 pb-8">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Button
                    onClick={() => {
                      option.onClick();
                      setIsOpen(false);
                    }}
                    size="sm"
                    className="flex items-center gap-3 bg-[#11111198] hover:bg-primary hover:text-on-primary shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-primary/10 rounded-xl backdrop-blur-md py-6 px-6 group whitespace-nowrap"
                  >
                    <span className="text-primary group-hover:text-on-primary transition-colors">{option.Icon}</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionMenu;
