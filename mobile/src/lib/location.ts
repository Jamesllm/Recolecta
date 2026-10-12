// Ubicación GPS y dirección aproximada
import * as Location from 'expo-location';

export async function ensureLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function currentPosition() {
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy ?? null };
}

/** Dirección legible del punto; null si el teléfono no puede resolverla. */
export async function addressFor(latitude: number, longitude: number): Promise<string | null> {
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!a) return null;
    const street = [a.street, a.streetNumber].filter(Boolean).join(' ') || a.name;
    const city = a.city || a.district || a.subregion;
    return [street, city].filter(Boolean).join(', ') || a.formattedAddress || null;
  } catch {
    return null;
  }
}

export const formatDistance = (m?: number) => (m === undefined ? '' : m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
