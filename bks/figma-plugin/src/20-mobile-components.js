// =====================================================================
// Componentes de la app móvil (vecino)
// =====================================================================

const TAB_DEFS = [['Inicio', 'inicio'], ['Mis reportes', 'lista-reportes'], ['Perfil', 'usuario']];

async function buildMobileComponents(x, y) {
  const cat = await catalog('Componentes · App móvil', 'Navegación, encabezados, tarjetas y controles de la app para vecinos (iPhone 16 Pro · 402×874).', x, y, 1400);

  // ---------- Pestaña de navegación ----------
  await catTitle(cat, 'Navegación inferior');
  const tv = [];
  for (const on of ['Sí', 'No']) {
    const col = on === 'Sí' ? 'texto/marca' : 'texto/terciario';
    const f = AL('V', { gap: 4, align: 'CENTER', w: 96 }); f.paddingTop = 6; f.paddingBottom = 4;
    const ind = rect(24, 3, on === 'Sí' ? 'fondo/marca' : null, 0, 'Indicador'); ind.cornerRadius = 2;
    add(f, ind, icon('inicio', 24, col), await T('Inicio', 'Etiqueta/S', col, { name: 'Etiqueta' }));
    tv.push(toComp(f, `Activo=${on}`));
  }
  const tab = makeSet(tv, cat, 'Pestaña de navegación', 'Elemento de la barra inferior. Activo resalta en verde con indicador superior.', 400);
  prop(tab, 'Etiqueta', 'TEXT', 'Inicio', 'Etiqueta', 'characters');
  prop(tab, 'Icono', 'INSTANCE_SWAP', IC['inicio'].id, 'Icono', 'mainComponent');

  const nv = [];
  for (const [active] of TAB_DEFS) {
    const f = AL('V', { w: 402, fill: 'fondo/superficie' });
    strokeSides(f, 'borde/predeterminado', { t: 1 });
    await shadow(f, 'Sombra/Barra inferior');
    const row = AL('H', { name: 'Pestañas', justify: 'SPACE_BETWEEN', px: 32 });
    for (const [label, ic] of TAB_DEFS) {
      const on = label === active;
      const t = I('Pestaña de navegación', { Activo: on ? 'Sí' : 'No', Etiqueta: label, Icono: ic });
      recolor(nested(t, 'Icono'), on ? 'texto/marca' : 'texto/terciario');
      t.name = 'Pestaña ' + label;
      add(row, t);
    }
    add(f, row, I('Indicador de inicio')); fillW(row);
    nv.push(toComp(f, `Activo=${active}`));
  }
  makeSet(nv, cat, 'Barra de navegación', 'Barra inferior de la app (Inicio, Mis reportes, Perfil) con indicador de inicio incluido.', 1300);

  // ---------- Encabezado ----------
  await catTitle(cat, 'Encabezado y progreso');
  {
    const f = AL('H', { gap: 12, px: 16, align: 'CENTER', w: 402, h: 60 });
    const sl = AL('H', { name: 'Ranura atrás', w: 40, h: 40 });
    const back = ibtn('Suave', 'chevron-izquierda'); back.name = 'Atrás'; add(sl, back);
    const mid = AL('V', { name: 'Títulos', gap: 2, align: 'CENTER' });
    add(mid, await T('Título', 'Título/S', 'texto/principal', { name: 'Título', align: 'CENTER' }), await T('Subtítulo', 'Cuerpo/S', 'texto/secundario', { name: 'Subtítulo', align: 'CENTER' }));
    const sr = AL('H', { name: 'Ranura acción', w: 40, h: 40 });
    const act = ibtn('Transparente', 'mas-opciones', { color: 'texto/principal' }); act.name = 'Acción'; add(sr, act);
    add(f, sl, mid, sr); mid.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Encabezado', 'Encabezado móvil centrado con botón atrás y acción opcional. Cambia el icono de la acción desde la instancia anidada "Acción".');
    cat.appendChild(c); C['Encabezado'] = c;
    prop(c, 'Título', 'TEXT', 'Título', 'Título', 'characters');
    prop(c, 'Subtítulo', 'TEXT', 'Subtítulo', 'Subtítulo', 'characters');
    prop(c, 'Mostrar subtítulo', 'BOOLEAN', false, 'Subtítulo', 'visible');
    prop(c, 'Mostrar atrás', 'BOOLEAN', true, 'Atrás', 'visible');
    prop(c, 'Mostrar acción', 'BOOLEAN', false, 'Acción', 'visible');
    c.findOne(n => n.name === 'Subtítulo').visible = false;
    const actNode = c.findOne(n => n.type === 'INSTANCE' && n.name === 'Acción');
    actNode.visible = false;
    actNode.isExposedInstance = true;
  }
  const pv = [];
  for (const [paso, nombre] of [['1', 'Evidencia y ubicación'], ['2', 'Detalles del residuo']]) {
    const f = AL('V', { gap: 10, px: 20, w: 402 }); f.paddingBottom = 4;
    const top = AL('H', { name: 'Textos', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    add(top, await T(`Paso ${paso} de 2`, 'Etiqueta/S', 'texto/marca', { name: 'Paso' }), await T(nombre, 'Cuerpo/S', 'texto/secundario', { name: 'Nombre del paso' }));
    const bars = AL('H', { name: 'Barras', gap: 8 });
    const b1 = rect(100, 6, 'fondo/marca', 999, 'Tramo 1'), b2 = rect(100, 6, paso === '2' ? 'fondo/marca' : 'borde/predeterminado', 999, 'Tramo 2');
    add(bars, b1, b2);
    add(f, top, bars); fillW(top); fillW(bars);
    b1.layoutSizingHorizontal = 'FILL'; b2.layoutSizingHorizontal = 'FILL';
    pv.push(toComp(f, `Paso=${paso}`));
  }
  makeSet(pv, cat, 'Progreso de pasos', 'Progreso del flujo "Nuevo reporte" (2 pasos).', 900);

  // ---------- Pin de mapa ----------
  await catTitle(cat, 'Mapa');
  const PIN = { Pendiente: ['acento/advertencia', 'alerta'], 'En ruta': ['acento/info', 'camion'], Resuelto: ['acento/exito', 'check'], 'Crítico': ['acento/peligro', 'fuego'], Seleccionado: ['fondo/marca', 'ubicacion'] };
  const pinv = [];
  for (const [st, [col, ic]] of Object.entries(PIN)) {
    const f = figma.createFrame(); f.resize(40, 50); f.fills = []; f.clipsContent = false;
    const shape = figma.createNodeFromSvg('<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 2a18 18 0 0 1 7.2 34.5L20 48l-7.2-11.5A18 18 0 0 1 20 2Z" fill="#000"/></svg>');
    shape.name = 'Forma'; shape.fills = [];
    for (const v of shape.findAll(n => n.type === 'VECTOR')) { v.fills = [paint(col)]; v.strokes = [paint('fondo/superficie')]; v.strokeWeight = 2.5; v.strokeAlign = 'OUTSIDE'; }
    await shadow(shape, 'Sombra/Elevada');
    f.appendChild(shape); shape.x = 0; shape.y = 0;
    const i = icon(ic, 18, 'texto/inverso'); f.appendChild(i); i.x = 11; i.y = 11;
    pinv.push(toComp(f, `Estado=${st}`));
  }
  makeSet(pinv, cat, 'Pin de mapa', 'Marcador de incidente en el mapa: Pendiente, En ruta, Resuelto, Crítico o la ubicación seleccionada.', 600);
  {
    const f = AL('H', { gap: 10, px: 16, align: 'CENTER', fill: 'fondo/superficie', r: 999, h: 48, w: 280 });
    await shadow(f, 'Sombra/Elevada');
    const t = await T('Buscar una dirección o zona', 'Cuerpo/M', 'texto/terciario', { name: 'Texto' });
    add(f, icon('buscar', 20, 'texto/secundario'), t); t.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Barra de búsqueda', 'Búsqueda flotante sobre el mapa.'); cat.appendChild(c); C['Barra de búsqueda'] = c;
    prop(c, 'Texto', 'TEXT', 'Buscar una dirección o zona', 'Texto', 'characters');
  }
  const chv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { gap: 6, px: 14, align: 'CENTER', r: 999, h: 36, fill: on === 'Sí' ? 'fondo/oscuro' : 'fondo/superficie' });
    if (on === 'No') await shadow(f, 'Sombra/Tarjeta');
    add(f, await T('Todos', 'Etiqueta/M', on === 'Sí' ? 'texto/inverso' : 'texto/principal', { name: 'Etiqueta' }));
    chv.push(toComp(f, `Activo=${on}`));
  }
  const chip = makeSet(chv, cat, 'Chip de filtro', 'Filtro rápido sobre el mapa o listas.', 400);
  prop(chip, 'Etiqueta', 'TEXT', 'Todos', 'Etiqueta', 'characters');

  // ---------- Tarjetas ----------
  await catTitle(cat, 'Tarjetas y opciones');
  {
    const f = AL('H', { gap: 12, px: 12, py: 12, align: 'CENTER', fill: 'fondo/superficie', stroke: 'borde/predeterminado', r: 16, w: 362 });
    await shadow(f, 'Sombra/Tarjeta');
    const ph = rect(76, 76, null, 12, 'Foto'); img(ph, IMG.escombros);
    const info = AL('V', { name: 'Información', gap: 6 });
    const title = await T('Escombros acumulados', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Título' });
    const locRow = AL('H', { name: 'Ubicación', gap: 6, align: 'CENTER' });
    const loc = await T('Av. Balta 450, Chiclayo', 'Cuerpo/S', 'texto/secundario', { name: 'Dirección' });
    add(locRow, icon('ubicacion', 14, 'texto/terciario'), loc);
    const foot = AL('H', { name: 'Pie', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    const st = badge('Pendiente'); st.name = 'Estado';
    add(foot, await T('4 sep 2026', 'Cuerpo/S', 'texto/terciario', { name: 'Fecha' }), st);
    add(info, title, locRow, foot);
    add(f, ph, info); info.layoutSizingHorizontal = 'FILL';
    for (const n of [title]) { wrap(n); n.textTruncation = 'ENDING'; n.maxLines = 1; }
    fillW(locRow); loc.layoutSizingHorizontal = 'FILL'; loc.textAutoResize = 'HEIGHT'; loc.textTruncation = 'ENDING'; loc.maxLines = 1;
    fillW(foot);
    const c = toComp(f, 'Tarjeta de reporte', 'Resumen de un reporte del vecino. Cambia el estado desde la insignia anidada "Estado" y la foto en el relleno de "Foto".');
    cat.appendChild(c); C['Tarjeta de reporte'] = c;
    prop(c, 'Título', 'TEXT', 'Escombros acumulados', 'Título', 'characters');
    prop(c, 'Dirección', 'TEXT', 'Av. Balta 450, Chiclayo', 'Dirección', 'characters');
    prop(c, 'Fecha', 'TEXT', '4 sep 2026', 'Fecha', 'characters');
    c.findOne(n => n.type === 'INSTANCE' && n.name === 'Estado').isExposedInstance = true;
  }
  const opv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { gap: 14, px: 16, py: 14, align: 'CENTER', r: 12, w: 362, fill: on === 'Sí' ? 'fondo/marca-suave' : 'fondo/superficie', stroke: on === 'Sí' ? 'borde/marca' : 'borde/predeterminado', sw: on === 'Sí' ? 2 : 1 });
    const radio = AL('H', { name: 'Radio', align: 'CENTER', justify: 'CENTER', w: 22, h: 22, r: 999, fill: 'fondo/superficie', stroke: on === 'Sí' ? 'borde/marca' : 'borde/fuerte', sw: 2 });
    if (on === 'Sí') add(radio, circle(10, 'fondo/marca', 'Selección'));
    const tx = AL('V', { name: 'Textos', gap: 2 });
    const t1 = await T('Pila grande', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Título' });
    const t2 = await T('Varias bolsas o residuos dispersos en un área pequeña', 'Cuerpo/S', 'texto/secundario', { name: 'Descripción' });
    add(tx, t1, t2);
    add(f, radio, tx); tx.layoutSizingHorizontal = 'FILL'; wrap(t1); wrap(t2);
    opv.push(toComp(f, `Seleccionado=${on}`));
  }
  const op = makeSet(opv, cat, 'Opción de tamaño', 'Opción única tipo tarjeta (radio).', 900);
  prop(op, 'Título', 'TEXT', 'Pila grande', 'Título', 'characters');
  prop(op, 'Descripción', 'TEXT', 'Varias bolsas o residuos dispersos en un área pequeña', 'Descripción', 'characters');

  const wtv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('V', { gap: 12, px: 16, py: 16, r: 16, w: 175, fill: on === 'Sí' ? 'fondo/marca-suave' : 'fondo/superficie', stroke: on === 'Sí' ? 'borde/marca' : 'borde/predeterminado', sw: on === 'Sí' ? 2 : 1 });
    const top = AL('H', { name: 'Cabecera', justify: 'SPACE_BETWEEN', align: 'MIN' });
    const box = iconBox('hoja', 40, on === 'Sí' ? 'fondo/superficie' : 'fondo/sutil', on === 'Sí' ? 'texto/marca' : 'texto/secundario', 12, 22);
    let chk;
    if (on === 'Sí') { chk = AL('H', { name: 'Marca', align: 'CENTER', justify: 'CENTER', w: 22, h: 22, r: 999, fill: 'fondo/marca' }); const ck = icon('check', 14, 'texto/inverso'); ck.name = 'Check'; add(chk, ck); }
    else chk = AL('H', { name: 'Marca', w: 22, h: 22, r: 999, fill: 'fondo/superficie', stroke: 'borde/fuerte', sw: 2 });
    add(top, box, chk);
    const lbl = await T('Orgánico', 'Cuerpo/M énfasis', on === 'Sí' ? 'texto/marca-oscuro' : 'texto/principal', { name: 'Etiqueta' });
    const note = await T('Requiere manejo especial', 'Etiqueta/S', 'estado/pendiente-texto', { name: 'Nota' });
    add(f, top, lbl, note); fillW(top);
    wtv.push(toComp(f, `Seleccionado=${on}`));
  }
  const wt = makeSet(wtv, cat, 'Tarjeta de tipo de residuo', 'Selección del tipo de residuo con icono y nota opcional.', 600);
  prop(wt, 'Etiqueta', 'TEXT', 'Orgánico', 'Etiqueta', 'characters');
  prop(wt, 'Nota', 'TEXT', 'Requiere manejo especial', 'Nota', 'characters');
  prop(wt, 'Mostrar nota', 'BOOLEAN', false, 'Nota', 'visible');
  prop(wt, 'Icono', 'INSTANCE_SWAP', IC['hoja'].id, 'Icono', 'mainComponent');
  for (const v of wt.children) v.findOne(n => n.name === 'Nota').visible = false;

  const sgv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { px: 12, align: 'CENTER', justify: 'CENTER', r: 8, h: 36, fill: on === 'Sí' ? 'fondo/superficie' : null });
    if (on === 'Sí') await shadow(f, 'Sombra/Tarjeta');
    add(f, await T('Todos (4)', 'Etiqueta/M', on === 'Sí' ? 'texto/principal' : 'texto/secundario', { name: 'Etiqueta' }));
    sgv.push(toComp(f, `Activo=${on}`));
  }
  const sg = makeSet(sgv, cat, 'Segmento', 'Opción de un control segmentado (colócalas dentro de un contenedor gris con relleno de 4px).', 400);
  prop(sg, 'Etiqueta', 'TEXT', 'Todos (4)', 'Etiqueta', 'characters');

  const dotv = [];
  for (const paso of ['1', '2', '3']) {
    const f = AL('H', { gap: 6, align: 'CENTER' });
    for (let k = 1; k <= 3; k++) { const on = String(k) === paso; const r = rect(on ? 24 : 6, 6, on ? 'fondo/marca' : 'borde/fuerte', 0, 'Punto ' + k); r.cornerRadius = 3; add(f, r); }
    dotv.push(toComp(f, `Paso=${paso}`));
  }
  makeSet(dotv, cat, 'Puntos de paginación', 'Indicador de la bienvenida (3 pasos).', 500);

  // ---------- Listas ----------
  await catTitle(cat, 'Listas, notificaciones y seguimiento');
  {
    const f = AL('H', { gap: 14, px: 16, py: 14, align: 'CENTER', w: 362 });
    const tx = AL('V', { name: 'Textos', gap: 2 });
    add(tx, await T('Datos personales', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Título' }), await T('Nombre, correo y distrito', 'Cuerpo/S', 'texto/secundario', { name: 'Descripción' }));
    const ch = icon('chevron-derecha', 20, 'texto/terciario'); ch.name = 'Chevron';
    add(f, iconBox('usuario', 40, 'fondo/sutil', 'texto/principal', 12, 20), tx, ch); tx.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Fila de lista', 'Fila de ajustes con icono, título, descripción y chevron.'); cat.appendChild(c); C['Fila de lista'] = c;
    prop(c, 'Título', 'TEXT', 'Datos personales', 'Título', 'characters');
    prop(c, 'Descripción', 'TEXT', 'Nombre, correo y distrito', 'Descripción', 'characters');
    prop(c, 'Mostrar descripción', 'BOOLEAN', true, 'Descripción', 'visible');
    prop(c, 'Icono', 'INSTANCE_SWAP', IC['usuario'].id, 'Icono', 'mainComponent');
    prop(c, 'Mostrar chevron', 'BOOLEAN', true, 'Chevron', 'visible');
  }
  const ntv = [];
  for (const read of ['No', 'Sí']) {
    const f = AL('H', { gap: 12, px: 20, py: 16, align: 'MIN', w: 402, fill: read === 'No' ? 'fondo/marca-suave' : 'fondo/superficie' });
    strokeSides(f, 'borde/predeterminado', { b: 1 });
    const tx = AL('V', { name: 'Textos', gap: 4 });
    const t1 = await T('Tu reporte fue asignado a una ruta', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Título' });
    const t2 = await T('El camión 07 pasará por Jr. Elías Aguirre 220 hoy a las 10:30.', 'Cuerpo/S', 'texto/secundario', { name: 'Mensaje' });
    add(tx, t1, t2, await T('Hace 5 min', 'Cuerpo/S', 'texto/terciario', { name: 'Tiempo' }));
    const dot = circle(8, 'fondo/marca', 'No leído');
    add(f, iconBox('camion', 40, 'fondo/marca-tenue', 'texto/marca', 999, 20), tx, dot);
    tx.layoutSizingHorizontal = 'FILL'; wrap(t1); wrap(t2);
    dot.visible = read === 'No';
    ntv.push(toComp(f, `Leído=${read}`));
  }
  const nt = makeSet(ntv, cat, 'Elemento de notificación', 'Notificación de la bandeja. No leído usa fondo verde suave y punto.', 900);
  prop(nt, 'Título', 'TEXT', 'Tu reporte fue asignado a una ruta', 'Título', 'characters');
  prop(nt, 'Mensaje', 'TEXT', 'El camión 07 pasará por Jr. Elías Aguirre 220 hoy a las 10:30.', 'Mensaje', 'characters');
  prop(nt, 'Tiempo', 'TEXT', 'Hace 5 min', 'Tiempo', 'characters');
  prop(nt, 'Icono', 'INSTANCE_SWAP', IC['camion'].id, 'Icono', 'mainComponent');

  const tlv = [];
  for (const st of ['Completado', 'Actual', 'Pendiente']) {
    const f = AL('H', { gap: 14, w: 362 });
    const left = AL('V', { name: 'Guía', align: 'CENTER', w: 24 });
    let mk;
    if (st === 'Completado') { mk = AL('H', { name: 'Marcador', align: 'CENTER', justify: 'CENTER', w: 24, h: 24, r: 999, fill: 'fondo/marca' }); add(mk, icon('check', 14, 'texto/inverso')); }
    else if (st === 'Actual') { mk = AL('H', { name: 'Marcador', align: 'CENTER', justify: 'CENTER', w: 24, h: 24, r: 999, fill: 'fondo/superficie', stroke: 'borde/marca', sw: 2 }); add(mk, circle(10, 'fondo/marca', 'Punto')); }
    else mk = AL('H', { name: 'Marcador', w: 24, h: 24, r: 999, fill: 'fondo/superficie', stroke: 'borde/fuerte', sw: 2 });
    const line = rect(2, 40, st === 'Completado' ? 'fondo/marca' : 'borde/predeterminado', 0, 'Línea');
    add(left, mk, line);
    const tx = AL('V', { name: 'Textos', gap: 2 }); tx.paddingBottom = 16;
    const t1 = await T('Asignado a ruta · Camión 07', 'Cuerpo/M énfasis', st === 'Pendiente' ? 'texto/terciario' : 'texto/principal', { name: 'Título' });
    const t2 = await T('Llegada estimada hoy, 10:30', 'Cuerpo/S', 'texto/secundario', { name: 'Detalle' });
    add(tx, t1, t2);
    add(f, left, tx); tx.layoutSizingHorizontal = 'FILL'; wrap(t1); wrap(t2);
    tlv.push(toComp(f, `Estado=${st}`));
  }
  const tl = makeSet(tlv, cat, 'Paso de seguimiento', 'Línea de tiempo del estado de un reporte. Oculta la línea en el último paso.', 1200);
  prop(tl, 'Título', 'TEXT', 'Asignado a ruta · Camión 07', 'Título', 'characters');
  prop(tl, 'Detalle', 'TEXT', 'Llegada estimada hoy, 10:30', 'Detalle', 'characters');
  prop(tl, 'Mostrar línea', 'BOOLEAN', true, 'Línea', 'visible');

  // ---------- Perfil ----------
  await catTitle(cat, 'Perfil y logros');
  {
    const f = AL('V', { gap: 2, align: 'CENTER', px: 12, py: 14, fill: 'fondo/superficie', stroke: 'borde/predeterminado', r: 12, w: 112 });
    add(f, await T('12', 'Dato/M', 'texto/principal', { name: 'Valor' }), await T('Reportes', 'Cuerpo/S', 'texto/secundario', { name: 'Etiqueta' }));
    const c = toComp(f, 'Métrica', 'Dato numérico compacto.'); cat.appendChild(c); C['Métrica'] = c;
    prop(c, 'Valor', 'TEXT', '12', 'Valor', 'characters');
    prop(c, 'Etiqueta', 'TEXT', 'Reportes', 'Etiqueta', 'characters');
  }
  const lgv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('V', { gap: 8, align: 'CENTER', w: 80 });
    const b = iconBox('hoja', 56, on === 'Sí' ? 'fondo/marca-tenue' : 'fondo/sutil', on === 'Sí' ? 'texto/marca' : 'texto/terciario', 999, 26);
    add(f, b, await T('Primer reporte', 'Etiqueta/S', on === 'Sí' ? 'texto/principal' : 'texto/terciario', { name: 'Etiqueta', align: 'CENTER', w: 80 }));
    lgv.push(toComp(f, `Desbloqueado=${on}`));
  }
  const lgr = makeSet(lgv, cat, 'Logro', 'Insignia de logro del vecino.', 400);
  prop(lgr, 'Etiqueta', 'TEXT', 'Primer reporte', 'Etiqueta', 'characters');
  prop(lgr, 'Icono', 'INSTANCE_SWAP', IC['hoja'].id, 'Icono', 'mainComponent');
  return cat;
}

// ---------- Atajos ----------
function header(title, o = {}) {
  const p = { 'Título': title };
  if (o.sub) { p['Mostrar subtítulo'] = true; p['Subtítulo'] = o.sub; }
  if (o.noBack) p['Mostrar atrás'] = false;
  if (o.action) p['Mostrar acción'] = true;
  const h = I('Encabezado', p);
  if (o.action) { const a = nested(h, 'Acción', { Icono: o.action }); recolor(nested(a, 'Icono'), 'texto/principal'); }
  h.name = 'Encabezado · ' + title;
  return h;
}
function navbar(active) { const n = I('Barra de navegación', { Activo: active }); n.name = 'Barra de navegación'; return n; }
function statusbar(tema = 'Claro') { const s = I('Barra de estado', { Tema: tema }); s.name = 'Barra de estado'; return s; }
function reportCard(title, dir, date, estado, photo) {
  const c = I('Tarjeta de reporte', { 'Título': title, 'Dirección': dir, Fecha: date });
  const est = nested(c, 'Estado'); est.swapComponent(C['Insignia'].children.find(v => v.variantProperties['Tipo'] === estado));
  setText(est, 'Etiqueta', estado);
  const ph = c.findOne(n => n.name === 'Foto'); img(ph, photo);
  c.name = 'Tarjeta · ' + title;
  return c;
}
function segmented(items, activeIdx, w = 362) {
  const box = AL('H', { name: 'Control segmentado', gap: 4, px: 4, py: 4, fill: 'fondo/sutil', r: 12, w });
  items.forEach((label, k) => { const s = I('Segmento', { Activo: k === activeIdx ? 'Sí' : 'No', Etiqueta: label }); add(box, s); s.layoutSizingHorizontal = 'FILL'; });
  return box;
}
function pin(estado) { const p = I('Pin de mapa', { Estado: estado }); p.name = 'Pin · ' + estado; return p; }
