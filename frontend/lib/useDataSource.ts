'use client';

import { useEffect, useState } from 'react';
import { DATA_SOURCE_EVENT, DataSource, getDataSource } from '@/services/api';

// Indica si la API respondió a la última consulta del panel.
export function useDataSource(): DataSource {
  const [source, setSource] = useState<DataSource>(getDataSource());
  useEffect(() => {
    const onChange = (e: Event) => setSource((e as CustomEvent<DataSource>).detail);
    window.addEventListener(DATA_SOURCE_EVENT, onChange);
    return () => window.removeEventListener(DATA_SOURCE_EVENT, onChange);
  }, []);
  return source;
}
