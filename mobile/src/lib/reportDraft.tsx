// Borrador del reporte entre el paso 1 (evidencia y ubicación) y el paso 2 (detalles)
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NewReport } from './api';

export interface DraftLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null; // null cuando el vecino ajustó el punto a mano en el mapa
  address: string | null;
}

interface Draft {
  photo: NewReport['photo'] | null;
  location: DraftLocation | null;
  setPhoto: (p: NewReport['photo'] | null) => void;
  setLocation: (l: DraftLocation | null) => void;
  reset: () => void;
}

const DraftContext = createContext<Draft | null>(null);

export function ReportDraftProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<NewReport['photo'] | null>(null);
  const [location, setLocation] = useState<DraftLocation | null>(null);
  const value = useMemo(() => ({
    photo,
    location,
    setPhoto,
    setLocation,
    reset: () => {
      setPhoto(null);
      setLocation(null);
    },
  }), [photo, location]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useReportDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useReportDraft debe usarse dentro de ReportDraftProvider');
  return ctx;
}
