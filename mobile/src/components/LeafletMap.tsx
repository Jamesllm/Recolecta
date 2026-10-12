// Mapa Leaflet + OpenStreetMap dentro de un WebView (no requiere clave de Google Maps)
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors } from '@/lib/theme';

export type LatLng = { latitude: number; longitude: number };

export interface MapMarker extends LatLng {
  id: number;
  color: string;
  selected?: boolean;
}

export interface LeafletMapHandle {
  flyTo: (point: LatLng, zoom?: number) => void;
}

interface Props {
  initialCenter: LatLng;
  initialZoom?: number;
  markers?: MapMarker[];
  circle?: { center: LatLng; radius: number } | null;
  user?: LatLng | null;
  interactive?: boolean;
  style?: ViewStyle;
  onMarkerPress?: (id: number) => void;
  onMapPress?: () => void;
  onMoveEnd?: (center: LatLng) => void;
  ref?: Ref<LeafletMapHandle>;
}

// Referer con el que se piden las teselas, como exige la política de uso de OpenStreetMap
const BASE_URL = 'https://github.com/Jamesllm/Recolecta';

const buildHtml = (c: LatLng, zoom: number, interactive: boolean) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #eef2f0; }
  .pin { width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
  .pin.sel { width: 34px; height: 34px; }
  .me { width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(37,99,235,.25); }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head><body><div id="map"></div>
<script>
  const post = (m) => window.ReactNativeWebView.postMessage(JSON.stringify(m));
  const interactive = ${interactive};
  const map = L.map('map', { zoomControl: false, dragging: interactive, scrollWheelZoom: interactive, touchZoom: interactive, doubleClickZoom: interactive, tap: interactive })
    .setView([${c.latitude}, ${c.longitude}], ${zoom});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  map.on('moveend', () => { const p = map.getCenter(); post({ type: 'move', latitude: p.lat, longitude: p.lng }); });
  map.on('click', () => post({ type: 'press' }));
  window.rn = (msg) => {
    if (msg.type === 'flyTo') { map.flyTo([msg.latitude, msg.longitude], msg.zoom || map.getZoom(), { duration: 0.5 }); return; }
    layer.clearLayers();
    if (msg.circle) L.circle([msg.circle.center.latitude, msg.circle.center.longitude], { radius: msg.circle.radius, color: '#059669', weight: 2, fillColor: '#059669', fillOpacity: 0.08 }).addTo(layer);
    if (msg.user) L.marker([msg.user.latitude, msg.user.longitude], { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }), interactive: false }).addTo(layer);
    for (const m of msg.markers || []) {
      const s = m.selected ? 34 : 26;
      const icon = L.divIcon({ className: '', html: '<div class="pin' + (m.selected ? ' sel' : '') + '" style="background:' + m.color + '"></div>', iconSize: [s, s], iconAnchor: [s / 2, s] });
      L.marker([m.latitude, m.longitude], { icon }).on('click', (e) => { L.DomEvent.stopPropagation(e); post({ type: 'marker', id: m.id }); }).addTo(layer);
    }
  };
  post({ type: 'ready' });
</script></body></html>`;

export function LeafletMap({ initialCenter, initialZoom = 16, markers = [], circle = null, user = null, interactive = true, style, onMarkerPress, onMapPress, onMoveEnd, ref }: Props) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  // El HTML se genera una sola vez; los cambios se envían con injectJavaScript
  const html = useMemo(() => buildHtml(initialCenter, initialZoom, interactive), []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((msg: object) => {
    webRef.current?.injectJavaScript(`window.rn && window.rn(${JSON.stringify(msg)}); true;`);
  }, []);

  const data = { type: 'data', markers, circle, user };
  const dataKey = JSON.stringify(data);
  useEffect(() => {
    if (ready.current) send(JSON.parse(dataKey));
  }, [dataKey, send]);

  useImperativeHandle(ref, () => ({
    flyTo: (p, zoom) => send({ type: 'flyTo', ...p, zoom }),
  }), [send]);

  const onMessage = (e: WebViewMessageEvent) => {
    const msg = JSON.parse(e.nativeEvent.data);
    if (msg.type === 'ready') {
      ready.current = true;
      send(data);
    } else if (msg.type === 'marker') onMarkerPress?.(msg.id);
    else if (msg.type === 'press') onMapPress?.();
    else if (msg.type === 'move') onMoveEnd?.({ latitude: msg.latitude, longitude: msg.longitude });
  };

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webRef}
        source={{ html, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.background },
  web: { flex: 1, backgroundColor: 'transparent' },
});
