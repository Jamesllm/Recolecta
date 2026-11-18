// =====================================================================
// Organización, prototipo y punto de entrada
// =====================================================================

const GROUPS = [
  ['App móvil · 1. Bienvenida y acceso', ['m01', 'm02', 'm03', 'm04', 'm05', 'm06'], 6, 'Primer uso: bienvenida en 3 pasos, inicio de sesión, registro y recuperación de contraseña.'],
  ['App móvil · 2. Reportar residuos', ['m07', 'm08', 'm09', 'm10', 'm11', 'm12'], 6, 'Mapa de incidentes → foto y ubicación (paso 1) → ajuste en el mapa → tipo y tamaño (paso 2) → confirmación con código de seguimiento.'],
  ['App móvil · 3. Seguimiento y perfil', ['m13', 'm14', 'm15', 'm16'], 6, 'Lista de reportes del vecino, detalle con línea de tiempo, bandeja de notificaciones y perfil con puntos verdes e insignias.'],
  ['Panel administrador', ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08'], 4, 'Acceso → panel general → incidentes (tabla y detalle) → rutas con IA → flota → análisis → configuración. Menú agrupado en Operación y Gestión.']
];

async function layoutScreens(page) {
  let y = 0;
  for (const [title, keys, perRow, desc] of GROUPS) {
    const sec = figma.createSection(); sec.name = title; mark(sec); page.appendChild(sec);
    const gap = perRow === 4 ? 120 : 80;
    const d = await T(desc, 'Cuerpo/L', 'texto/secundario', { w: 1000 }); sec.appendChild(d); d.x = 80; d.y = 80;
    let x = 80, rowY = 180, rowH = 0, maxX = 0, i = 0;
    for (const k of keys) {
      const f = SCR[k]; if (!f) continue;
      if (i > 0 && i % perRow === 0) { x = 80; rowY += rowH + 160; rowH = 0; }
      sec.appendChild(f); f.x = x; f.y = rowY;
      x += f.width + gap; rowH = Math.max(rowH, f.height); maxX = Math.max(maxX, x - gap); i++;
    }
    sec.resizeWithoutConstraints(maxX + 80, rowY + rowH + 80);
    sec.x = 0; sec.y = y;
    y += sec.height + 240;
  }
}

async function applyLinks() {
  let ok = 0; const failed = [];
  for (const [node, key] of LINKS) {
    const dest = SCR[key];
    if (!dest || node.removed) { failed.push(key); continue; }
    try {
      await node.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.25 }, preserveScrollPosition: false }]
      }]);
      ok++;
    } catch (e) { failed.push(node.name + ' → ' + key); }
  }
  return { ok, failed };
}

let STAGE = 'inicio';
async function main() {
  const t0 = Date.now();
  STAGE = 'páginas'; figma.notify('Recolecta+ · Preparando páginas y fundamentos…', { timeout: 4000 });
  const pages = await ensurePages();
  await cleanup(pages);
  STAGE = 'fundamentos'; await ensureFoundations();

  await figma.setCurrentPageAsync(pages.comp);
  STAGE = 'iconos'; await ensureIcons(pages.comp);
  STAGE = 'documentación de fundamentos'; await buildFoundationsDoc(900, 0);
  figma.notify('Recolecta+ · Creando componentes…', { timeout: 4000 });
  STAGE = 'componentes base'; await buildBaseComponents(2420, 0);
  STAGE = 'componentes móviles'; await buildMobileComponents(3940, 0);
  STAGE = 'componentes del panel'; await buildAdminComponents(5460, 0);

  await figma.setCurrentPageAsync(pages.scr);
  figma.notify('Recolecta+ · Construyendo pantallas móviles…', { timeout: 4000 });
  STAGE = 'pantallas móviles'; await buildMobileScreens();
  figma.notify('Recolecta+ · Construyendo el panel administrador…', { timeout: 4000 });
  STAGE = 'pantallas del panel'; await buildAdminScreens();
  STAGE = 'organización'; await layoutScreens(pages.scr);
  STAGE = 'prototipo'; const res = await applyLinks();
  pages.scr.flowStartingPoints = [{ nodeId: SCR['m01'].id, name: 'App móvil · Vecino' }, { nodeId: SCR['a01'].id, name: 'Panel administrador' }];
  figma.viewport.scrollAndZoomIntoView(pages.scr.children);

  const secs = Math.round((Date.now() - t0) / 1000);
  const msg = `Recolecta+ listo en ${secs} s · ${Object.keys(SCR).length} pantallas · ${Object.keys(C).length} componentes · ${res.ok} enlaces de prototipo` + (res.failed.length ? ` (${res.failed.length} sin aplicar)` : '');
  if (res.failed.length) console.warn('Enlaces no aplicados:', res.failed);
  figma.closePlugin(msg);
}

main().catch(e => {
  console.error('Recolecta+ · error en la etapa "' + STAGE + '":', e);
  figma.closePlugin('Error en "' + STAGE + '": ' + (e && e.message ? e.message : String(e)));
});
