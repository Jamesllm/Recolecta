'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, X } from 'lucide-react';

/** Mapas base disponibles (todos gratuitos y sin clave) */
export const MAP_STYLES = {
  streets: {
    name: 'Calles',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxNativeZoom: 19,
  },
  light: {
    name: 'Claro',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 20,
  },
  terrain: {
    name: 'Relieve',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM · estilo <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxNativeZoom: 17,
  },
  satellite: {
    name: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imágenes &copy; Esri, Maxar, Earthstar Geographics',
    maxNativeZoom: 18,
    // Nombres de calles encima de la imagen satelital
    overlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
  },
  dark: {
    name: 'Oscuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 20,
  },
} as const;

export type MapStyleId = keyof typeof MAP_STYLES;
const STYLE_IDS = Object.keys(MAP_STYLES) as MapStyleId[];
const STORAGE_KEY = 'recolecta.mapStyle';

const readStored = (): MapStyleId | null => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && v in MAP_STYLES ? (v as MapStyleId) : null;
  } catch {
    return null;
  }
};

/** Mosaico de muestra (zoom 14 en el centro actual) para la miniatura de cada estilo */
const thumbUrl = (id: MapStyleId, center: L.LatLng) => {
  const z = 14;
  const n = 2 ** z;
  const x = Math.floor(((center.lng + 180) / 360) * n);
  const rad = (center.lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return MAP_STYLES[id].url.replace('{s}', 'a').replace('{r}', '').replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
};

interface MapStyleLayerProps {
  position?: L.ControlPosition;
  initial?: MapStyleId; // estilo si el usuario aún no eligió uno
  attributionSuffix?: string;
}

/**
 * Mapa base con selector de estilo (calles, claro, relieve, satélite, oscuro).
 * Va dentro de <MapContainer>; la elección se recuerda en este navegador.
 */
export const MapStyleLayer: React.FC<MapStyleLayerProps> = ({ position = 'bottomright', initial = 'streets', attributionSuffix = ' · Rutas: <a href="https://project-osrm.org">OSRM</a>' }) => {
  const map = useMap();
  const [style, setStyle] = useState<MapStyleId>(initial);
  const [open, setOpen] = useState(false);
  const container = useMemo(() => L.DomUtil.create('div', 'leaflet-control map-style-control'), []);

  useEffect(() => {
    const stored = readStored();
    if (stored) setStyle(stored);
  }, []);

  // El selector vive en un control de Leaflet para apilarse con el zoom y no mover el mapa al hacer clic
  useEffect(() => {
    const Control = L.Control.extend({ onAdd: () => container });
    const control = new Control({ position });
    control.addTo(map);
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return () => {
      control.remove();
    };
  }, [map, container, position]);

  const pick = (id: MapStyleId) => {
    setStyle(id);
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* sin almacenamiento: solo dura esta visita */
    }
  };

  const current = MAP_STYLES[style];
  const center = map.getCenter();

  return (
    <>
      <TileLayer key={style} url={current.url} attribution={current.attribution + attributionSuffix} maxNativeZoom={current.maxNativeZoom} maxZoom={20} />
      {'overlay' in current && <TileLayer key={`${style}-labels`} url={current.overlay} maxNativeZoom={current.maxNativeZoom} maxZoom={20} />}
      {createPortal(
        open ? (
          <div className="bg-white rounded-[18px] shadow-[0_12px_40px_rgba(15,23,42,0.22)] p-2.5 w-[372px]">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs font-semibold text-slate-700">Tipo de mapa</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar tipos de mapa" className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {STYLE_IDS.map((id) => (
                <button key={id} type="button" onClick={() => pick(id)} aria-pressed={id === style} className="flex flex-col items-center gap-1 cursor-pointer group">
                  <span className={`block w-full aspect-square rounded-xl overflow-hidden bg-slate-100 ${id === style ? 'ring-[3px] ring-emerald-600' : 'ring-1 ring-slate-200 group-hover:ring-slate-400'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(id, center)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </span>
                  <span className={`text-[11px] ${id === style ? 'font-bold text-emerald-800' : 'font-medium text-slate-600'}`}>{MAP_STYLES[id].name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Cambiar tipo de mapa"
            className="h-11 pl-3 pr-3.5 rounded-full bg-white shadow-[0_8px_30px_rgba(15,23,42,0.18)] flex items-center gap-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            {current.name}
          </button>
        ),
        container
      )}
    </>
  );
};
