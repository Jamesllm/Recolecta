'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Route,
  AlertTriangle,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: {
    text: string;
    variant: 'danger' | 'success' | 'neutral';
  };
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Clústeres y rutas de IA',
    href: '/routes',
    icon: Route,
  },
  {
    name: 'Incidentes',
    href: '/incidents',
    icon: AlertTriangle,
    badge: {
      text: '12',
      variant: 'danger',
    },
  },
  {
    name: 'Flota de recogida',
    href: '#fleet',
    icon: Truck,
  },
  {
    name: 'Análisis',
    href: '#analytics',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '#settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0F172A] text-slate-200 flex flex-col shrink-0 border-r border-slate-800 min-h-screen select-none sticky top-0 h-screen z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                Recolecta<span className="text-emerald-400">+</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">Urban Waste Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
          Centro de Operaciones
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-bold rounded-full transition-transform group-hover:scale-105',
                    item.badge.variant === 'danger'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {item.badge.text}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Indicator */}
      <div className="px-4 py-2 mx-4 mb-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-medium">PostGIS Node API</span>
        </div>
        <span className="text-emerald-400 font-semibold text-[11px]">En línea</span>
      </div>

      {/* Profile Card Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Ing. Ramos"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">Ing. Ramos</p>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Chief Dispatcher
              </p>
            </div>
          </div>

          <button
            title="Cerrar sesión"
            onClick={() => alert('Sesión administrativa finalizada.')}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
