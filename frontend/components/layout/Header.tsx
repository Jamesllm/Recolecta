'use client';

import React from 'react';
import { useDataSource } from '@/lib/useDataSource';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Botones de la pantalla (Recargar, Registrar camión…) a la derecha */
  actions?: React.ReactNode;
}

/** Cabecera flotante con bordes redondeados (mismo estilo que las tarjetas del panel general) */
export const Header: React.FC<HeaderProps> = ({
  title = 'Panel general',
  subtitle = 'Optimización en tiempo real de recolección urbana y despacho inteligente',
  actions,
}) => {
  const live = useDataSource() === 'api';
  return (
    <header className="sticky top-4 z-30 mt-4 bg-white/95 backdrop-blur rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${live ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {live ? 'En vivo' : 'Sin conexión con la API'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
};

/** Botón secundario de la cabecera (Recargar, Exportar…) */
export const HeaderButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }> = ({ primary, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`h-10 px-4 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 ${primary ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} ${className}`}
  />
);
