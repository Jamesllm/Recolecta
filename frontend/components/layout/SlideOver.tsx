'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}

/** Panel lateral flotante con bordes redondeados (mismo lenguaje que las tarjetas del mapa) */
export const SlideOver: React.FC<SlideOverProps> = ({ open, onClose, title, subtitle, footer, children, width = 440 }) => {
  // Escape cierra el panel
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1200]">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in" aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className="absolute top-4 right-4 bottom-4 max-w-[calc(100vw-2rem)] bg-white rounded-[24px] shadow-[0_24px_60px_rgba(15,23,42,0.25)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-10 h-10 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/60">{footer}</footer>}
      </section>
    </div>
  );
};
