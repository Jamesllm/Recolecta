'use client';

import { useEffect, useState } from 'react';
import { LiveTruck, fleetService } from '@/services/api';

/** Posición en vivo de los camiones con recorrido simulado; se consulta cada `intervalMs`. */
export const useLiveTrucks = (intervalMs = 3000) => {
  const [trucks, setTrucks] = useState<LiveTruck[]>([]);
  useEffect(() => {
    let cancelled = false;
    const poll = () =>
      fleetService
        .live()
        .then((data) => !cancelled && setTrucks(data))
        .catch(() => {});
    poll();
    const timer = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);
  return trucks;
};
