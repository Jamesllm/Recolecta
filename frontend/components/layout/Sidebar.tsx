'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Route, AlertTriangle, Truck, BarChart3, Settings } from 'lucide-react';
import { useDataSource } from '@/lib/useDataSource';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Panel general', href: '/', icon: LayoutDashboard },
  { name: 'Rutas con IA', href: '/routes', icon: Route },
  { name: 'Incidentes', href: '/incidents', icon: AlertTriangle },
  { name: 'Flota de recogida', href: '/fleet', icon: Truck },
  { name: 'Análisis', href: '/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

/** Riel de navegación flotante (propuesta «Mapa primero»): iconos con su nombre al pasar el cursor. */
export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const source = useDataSource();
  const live = source === 'api';

  return (
    <nav
      aria-label="Menú principal"
      className="app-rail fixed left-4 top-4 bottom-4 z-[1100] w-[76px] bg-white rounded-[22px] shadow-[0_8px_30px_rgba(15,23,42,0.12)] flex flex-col items-center py-4 gap-2"
    >
      <Link href="/" aria-label="Recolecta+, panel general" className="w-12 h-12 flex items-center justify-center mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={44} height={44} className="w-11 h-11 object-contain" />
      </Link>

      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            aria-label={item.name}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {item.name}
            </span>
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-3">
        <span
          title={live ? 'Conectado a la API' : 'Sin conexión con la API'}
          aria-label={live ? 'Conectado a la API' : 'Sin conexión con la API'}
          className={cn('w-2.5 h-2.5 rounded-full', live ? 'bg-emerald-500' : 'bg-rose-500')}
        />
        <span title="Gestor municipal" className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
          GM
        </span>
      </div>
    </nav>
  );
};
