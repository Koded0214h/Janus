import React, { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = "info", 
  confirmText = "Acknowledge", 
  cancelText = "Cancel", 
  isConfirm = false,
  isPrompt = false,
  placeholder = "Enter details..."
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
      setInputValue("");
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-8 h-8 text-primary" />,
    success: <CheckCircle2 className="w-8 h-8 text-primary" />,
    warning: <AlertTriangle className="w-8 h-8 text-tertiary" />,
    error: <AlertCircle className="w-8 h-8 text-error" />,
  };

  const handleConfirmAction = () => {
    if (onConfirm) {
      if (isPrompt) {
        onConfirm(inputValue);
      } else {
        onConfirm();
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-surface-container-low border border-outline-variant/20 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="text-xl font-headline font-black uppercase italic tracking-tighter text-on-surface">
              {title || "System Message"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-on-surface-variant text-base leading-relaxed font-light whitespace-pre-wrap">
            {message}
          </p>
          {isPrompt && (
            <input
              autoFocus
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-on-surface font-mono text-sm focus:border-primary outline-none"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmAction();
              }}
            />
          )}
        </div>
        <div className="p-6 bg-surface-container-highest/30 flex justify-end gap-4">
          {(isConfirm || isPrompt) && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-surface-container-highest text-on-surface font-mono text-xs font-bold uppercase tracking-widest hover:bg-outline-variant/20 transition-all border border-outline-variant/10"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirmAction}
            className="px-8 py-3 bg-primary text-on-primary font-mono text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,208,156,0.2)]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
