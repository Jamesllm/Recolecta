'use client';

import React, { useState } from 'react';

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

interface GroupedBarsProps {
  data: Array<{ label: string } & Record<string, number | string>>;
  series: BarSeries[];
  height?: number;
  unit?: string; // texto del tooltip, p. ej. «reportes»
}

/** Escala «redonda» del eje: 1, 2, 5, 10, 20, 50... */
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/** Barras agrupadas con un solo eje, leyenda y tooltip al pasar el cursor por cada grupo. */
export const GroupedBars: React.FC<GroupedBarsProps> = ({ data, series, height = 220, unit = '' }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))));
  const ticks = [max, max / 2, 0];
  const labelEvery = Math.max(1, Math.ceil(data.length / 10)); // evita etiquetas encimadas

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-slate-600">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Eje Y */}
        <div className="flex flex-col justify-between text-[10px] text-slate-400 text-right w-8 shrink-0" style={{ height }}>
          {ticks.map((t) => <span key={t} className="-translate-y-1.5 leading-none">{Number.isInteger(t) ? t : t.toFixed(1)}</span>)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
            {/* Cuadrícula */}
            {ticks.map((t) => (
              <div key={t} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${(1 - t / max) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {data.map((d, i) => (
                <div
                  key={`${d.label}-${i}`}
                  className={`relative flex-1 h-full flex items-end justify-center gap-[2px] rounded-sm ${hover === i ? 'bg-slate-100' : ''}`}
                  onMouseEnter={() => setHover(i)}
                >
                  {series.map((s) => {
                    const v = Number(d[s.key]) || 0;
                    return (
                      <div
                        key={s.key}
                        className="w-full max-w-[14px] rounded-t-[4px]"
                        style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0, background: s.color }}
                      />
                    );
                  })}
                  {hover === i && (
                    <div className={`absolute bottom-full mb-2 z-10 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-lg text-xs whitespace-nowrap pointer-events-none ${i > data.length / 2 ? 'right-0' : 'left-0'}`}>
                      <p className="font-semibold text-slate-800 mb-1">{d.label}</p>
                      {series.map((s) => (
                        <p key={s.key} className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                          {s.label}: <b className="text-slate-900">{Number(d[s.key]) || 0}</b> {unit}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Eje X */}
          <div className="flex gap-[2px] mt-1.5">
            {data.map((d, i) => (
              <span key={`${d.label}-x-${i}`} className="flex-1 text-center text-[10px] text-slate-400 truncate">
                {i % labelEvery === 0 ? d.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
