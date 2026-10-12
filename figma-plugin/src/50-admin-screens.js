// =====================================================================
// Pantallas del panel administrador (1440 px de ancho)
// =====================================================================

const SIDE_LINKS = [['Panel general', 'a02'], ['Incidentes', 'a03'], ['Rutas con IA', 'a05'], ['Flota', 'a06'], ['Análisis', 'a07'], ['Configuración', 'a08']];

const INCIDENTS = [
  { id: '#RL-0482', fecha: '10 oct 2026', hora: '09:12', dir: 'Av. Balta 450', zona: 'Zona Centro', cat: 'Escombros', urg: 'Media', est: 'Pendiente', foto: IMG.escombros },
  { id: '#RL-0480', fecha: '9 oct 2026', hora: '18:22', dir: 'Calle San José 780', zona: 'Zona Centro-Norte', cat: 'Orgánico', urg: 'Media', est: 'Pendiente', foto: IMG.tabla[2] },
  { id: '#RL-0479', fecha: '9 oct 2026', hora: '16:04', dir: 'Mercado Modelo, puerta 3', zona: 'Zona Mercado', cat: 'Orgánico', urg: 'Alta', est: 'Pendiente', foto: IMG.tabla[0] },
  { id: '#RL-0477', fecha: '9 oct 2026', hora: '11:45', dir: 'Jr. Bolognesi 310', zona: 'Zona Centro', cat: 'Escombros', urg: 'Alta', est: 'En ruta', foto: IMG.tabla[4] },
  { id: '#RL-0475', fecha: '8 oct 2026', hora: '08:47', dir: 'Jr. Elías Aguirre 220', zona: 'Zona Centro', cat: 'Peligroso', urg: 'Alta', est: 'En ruta', foto: IMG.callejon },
  { id: '#RL-0472', fecha: '7 oct 2026', hora: '17:50', dir: 'Av. Luis Gonzales 1150', zona: 'Zona Sur', cat: 'Inorgánico', urg: 'Baja', est: 'Resuelto', foto: IMG.tabla[3] },
  { id: '#RL-0468', fecha: '6 oct 2026', hora: '09:15', dir: 'Av. Grau 560', zona: 'Zona Oeste', cat: 'Escombros', urg: 'Media', est: 'En ruta', foto: IMG.tabla[5] },
  { id: '#RL-0463', fecha: '5 oct 2026', hora: '14:32', dir: 'Parque Principal de Chiclayo', zona: 'Zona Centro', cat: 'Inorgánico', urg: 'Media', est: 'Pendiente', foto: IMG.contenedor }
];

function adminScreen(key, name, section, ruta, h = 1024) {
  const f = figma.createFrame();
  f.name = name; f.resize(1440, h);
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.itemSpacing = 0; fill(f, 'fondo/app'); f.clipsContent = true;
  mark(f); SCR[key] = f;
  const sb = sidebar(section); f.appendChild(sb); sb.layoutSizingVertical = 'FILL';
  for (const [label, target] of SIDE_LINKS) link(nested(sb, 'Menú · ' + label), target);
  link(nested(sb, 'Cerrar sesión'), 'a01');
  const main = AL('V', { name: 'Principal' }); f.appendChild(main); main.layoutSizingHorizontal = 'FILL'; main.layoutSizingVertical = 'FILL';
  put(main, topbar(ruta));
  const content = AL('V', { name: 'Contenido', gap: 24, px: 32, py: 32 }); put(main, content, true);
  return { f, main, content };
}
function stat(label, value) {
  return (async () => { const v = AL('V', { name: label, gap: 2 }); add(v, await T(label, 'Etiqueta/XS mayúsculas', 'texto/terciario'), await T(value, 'Cuerpo/M énfasis', 'texto/principal')); return v; })();
}
async function compactIncident(d) {
  const r = AL('H', { name: 'Incidente ' + d.id, gap: 12, align: 'CENTER', py: 12 });
  strokeSides(r, 'borde/predeterminado', { b: 1 });
  const ph = rect(40, 40, null, 8, 'Foto'); img(ph, d.foto);
  const tx = AL('V', { name: 'Textos', gap: 2 });
  add(tx, await T(d.dir, 'Cuerpo/M énfasis', 'texto/principal'), await T(`${d.id} · ${d.cat} · ${d.fecha}, ${d.hora}`, 'Cuerpo/S', 'texto/terciario'));
  add(r, ph, tx, badge(URG[d.urg], d.urg), badge(d.est)); tx.layoutSizingHorizontal = 'FILL';
  return r;
}
async function fleetRow(name, sub, tipo, label) {
  const r = AL('H', { name, gap: 12, align: 'CENTER', py: 10 });
  const tx = AL('V', { name: 'Textos', gap: 2 });
  add(tx, await T(name, 'Cuerpo/M énfasis', 'texto/principal'), await T(sub, 'Cuerpo/S', 'texto/terciario'));
  add(r, iconBox('camion', 36, 'fondo/sutil', 'texto/principal', 10, 18), tx, badge(tipo, label)); tx.layoutSizingHorizontal = 'FILL';
  return r;
}
function bar(width, h, color, trackW) {
  const track = AL('H', { name: 'Barra', h, r: 999, fill: 'fondo/sutil', w: trackW });
  add(track, rect(Math.max(2, width), h, color, 999, 'Valor'));
  return track;
}

// ---------------------------------------------------------------------
async function buildAdminLogin() {
  const f = figma.createFrame(); f.name = 'A1 · Iniciar sesión (panel)'; f.resize(1440, 1024);
  f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED'; fill(f, 'fondo/app'); f.clipsContent = true;
  mark(f); SCR['a01'] = f;
  const left = AL('V', { name: 'Presentación', gap: 32, px: 64, py: 64, w: 640, fill: 'fondo/oscuro', justify: 'SPACE_BETWEEN' });
  f.appendChild(left); left.layoutSizingVertical = 'FILL';
  add(left, I('Logotipo', { Tema: 'Oscuro', 'Mostrar subtítulo': true, 'Subtítulo': 'Panel municipal' }));
  const mid = AL('V', { name: 'Mensaje', gap: 20 }); put(left, mid);
  const h1 = await T('Gestión inteligente de residuos para Chiclayo', 'Display/XL', 'texto/inverso');
  const p1 = await T('Centraliza los reportes ciudadanos, prioriza las zonas críticas y despacha rutas optimizadas con inteligencia artificial.', 'Cuerpo/L', 'texto/inverso-suave');
  add(mid, h1, p1); wrap(h1); wrap(p1);
  const feats = AL('V', { name: 'Funciones', gap: 14 }); feats.paddingTop = 12; put(mid, feats);
  for (const [ic, t] of [['alerta', 'Incidentes ciudadanos en tiempo real'], ['destellos', 'Rutas optimizadas con inteligencia artificial'], ['grafico', 'Indicadores de servicio y reportes de gestión']]) {
    const r = AL('H', { gap: 12, align: 'CENTER' }); add(r, iconBox(ic, 36, 'fondo/oscuro-elevado', 'acento/exito', 10, 18), await T(t, 'Cuerpo/M', 'texto/inverso')); add(feats, r);
  }
  add(left, await T('Recolecta+ · Panel municipal v2.0', 'Cuerpo/S', 'texto/inverso-suave'));
  const right = AL('V', { name: 'Acceso', align: 'CENTER', justify: 'CENTER' }); f.appendChild(right); right.layoutSizingHorizontal = 'FILL'; right.layoutSizingVertical = 'FILL';
  const form = AL('V', { name: 'Formulario', gap: 20, px: 40, py: 40, r: 24, w: 460, fill: 'fondo/superficie', stroke: 'borde/predeterminado' });
  await shadow(form, 'Sombra/Elevada'); add(right, form);
  const ft = AL('V', { gap: 6 }); put(form, ft);
  add(ft, await T('Ingresa al panel', 'Título/L', 'texto/principal'), await T('Usa tu cuenta institucional para continuar.', 'Cuerpo/M', 'texto/secundario'));
  put(form, field('Completado', 'Correo institucional', 'c.ramos@recolecta.pe', 'correo'));
  put(form, field('Enfocado', 'Contraseña', '••••••••••', 'candado', { eye: true }));
  const opts = AL('H', { name: 'Opciones', justify: 'SPACE_BETWEEN', align: 'CENTER' }); put(form, opts);
  const keep = AL('H', { gap: 8, align: 'CENTER' }); add(keep, I('Casilla', { Marcada: 'Sí' }), await T('Mantener la sesión iniciada', 'Cuerpo/S', 'texto/secundario'));
  add(opts, keep, await T('¿Olvidaste tu contraseña?', 'Etiqueta/M', 'texto/marca'));
  const go = btn('Primario', 'Grande', 'Ingresar al panel', { der: 'flecha-derecha' }); link(go, 'a02'); put(form, go);
  put(form, I('Aviso', { Tipo: 'Info', Texto: 'Acceso exclusivo para personal autorizado. Toda la actividad queda registrada.' }));
}

// ---------------------------------------------------------------------
async function buildDashboard() {
  const { content } = adminScreen('a02', 'A2 · Panel general', 'Panel general', 'Operación  /  Panel general', 1360);
  const opt = btn('Primario', 'Mediano', 'Optimizar rutas con IA', { izq: 'destellos' }); link(opt, 'a05');
  put(content, await pageHeader('Panel general', 'Resumen operativo de hoy, sábado 10 de octubre de 2026', [btn('Contorno', 'Mediano', 'Exportar resumen', { izq: 'descargar' }), opt]));
  const kr = AL('H', { name: 'Indicadores', gap: 24 }); put(content, kr);
  for (const a of [
    ['Negativa', 'Incidentes abiertos', '142', '+8 %', 'vs. semana anterior', 'alerta', 'tendencia'],
    ['Positiva', 'Críticos sin asignar', '12', '−3', 'desde ayer', 'fuego', 'tendencia-baja'],
    ['Neutral', 'Rutas activas', '4 de 6', 'Sin cambios', '2 camiones disponibles', 'ruta', 'menos'],
    ['Positiva', 'Recolectado hoy', '38,6 t', '+12 %', 'vs. promedio diario', 'camion', 'tendencia']
  ]) { const k = kpi(...a); add(kr, k); k.layoutSizingHorizontal = 'FILL'; }

  const row = AL('H', { name: 'Mapa y zonas', gap: 24, h: 560 }); put(content, row);
  const mc = await card('Mapa de calor de incidentes', { sub: 'Últimas 24 horas · 142 incidentes activos', right: [select('Últimas 24 h', 'reloj'), btn('Contorno', 'Mediano', 'Capas', { izq: 'capas' })] });
  add(row, mc); mc.layoutSizingHorizontal = 'FILL'; mc.layoutSizingVertical = 'FILL';
  const area = AL('V', { name: 'Mapa', r: 12, clip: true }); img(area, IMG.mapaCalor); put(mc, area, true);
  const lg = AL('V', { name: 'Leyenda', gap: 8, px: 14, py: 12, r: 10, fill: 'fondo/superficie' }); await shadow(lg, 'Sombra/Elevada');
  for (const [c, t] of [['acento/peligro', 'Crítico · contenedor desbordado'], ['acento/advertencia', 'Alta acumulación'], ['acento/exito', 'Recolección en curso']]) { const r = AL('H', { gap: 8, align: 'CENTER' }); add(r, circle(8, c), await T(t, 'Cuerpo/S', 'texto/principal')); add(lg, r); }
  absolute(area, lg, 16, Math.max(16, area.height - lg.height - 16));
  const zoom = AL('V', { name: 'Zoom', r: 10, fill: 'fondo/superficie' }); await shadow(zoom, 'Sombra/Elevada');
  add(zoom, ibtn('Transparente', 'mas', { color: 'texto/principal' }), ibtn('Transparente', 'menos', { color: 'texto/principal' }));
  absolute(area, zoom, Math.max(16, area.width - 56), Math.max(16, area.height - 96));

  const zc = await card('Zonas prioritarias', { sub: 'Ordenadas por densidad de alertas', w: 360, gap: 12 });
  add(row, zc); zc.layoutSizingVertical = 'FILL';
  for (const [n, a, c, u] of [['Mercado Modelo', '15 alertas', '6,1 t estimadas', 'Alta'], ['Zona Centro-Norte', '12 alertas', '4,8 t estimadas', 'Alta'], ['Av. Industrial Sur', '8 alertas', '3,2 t estimadas', 'Media']]) {
    const z = I('Tarjeta de zona', { Nombre: n, Alertas: a, Carga: c }); swapBadge(nested(z, 'Prioridad'), URG[u], u); put(zc, z);
  }
  grow(zc);
  const cta = btn('Primario', 'Grande', 'Optimizar rutas con IA', { izq: 'destellos' }); link(cta, 'a05'); put(zc, cta);
  const sr = AL('H', { name: 'Estado del motor', justify: 'SPACE_BETWEEN', px: 16, py: 12, r: 12, fill: 'fondo/app' }); put(zc, sr);
  add(sr, await stat('Última optimización', 'Hace 2 h'), await stat('Rutas activas', '4 rutas'));

  const r3 = AL('H', { name: 'Actividad', gap: 24, align: 'MIN' }); put(content, r3);
  const all = btn('Fantasma', 'Mediano', 'Ver todos', { der: 'flecha-derecha' }); link(all, 'a03');
  const rc = await card('Incidentes recientes', { sub: 'Últimos reportes ciudadanos', right: [all], gap: 4 });
  add(r3, rc); rc.layoutSizingHorizontal = 'FILL';
  for (const d of INCIDENTS.slice(0, 5)) { const r = await compactIncident(d); put(rc, r); if (d.id === '#RL-0479') link(r, 'a04'); }
  const vf = btn('Fantasma', 'Mediano', 'Ver flota', { der: 'flecha-derecha' }); link(vf, 'a06');
  const fc = await card('Estado de la flota', { sub: '7 camiones · turno mañana', right: [vf], w: 360, gap: 4 });
  add(r3, fc);
  for (const a of [['Camión 07', 'Juan Martínez · Clúster 04', 'En ruta', 'En ruta'], ['Camión 03', 'Rosa Paredes · Clúster 07', 'En ruta', 'En ruta'], ['Camión 05', 'Ana Torres · sin ruta', 'Resuelto', 'Disponible'], ['Camión 02', 'En taller hasta el 12 oct', 'Urgencia media', 'Mantenimiento']]) put(fc, await fleetRow(...a));
}

// ---------------------------------------------------------------------
async function buildIncidents() {
  const { f, content } = adminScreen('a03', 'A3 · Incidentes', 'Incidentes', 'Operación  /  Incidentes ciudadanos');
  const asg = btn('Primario', 'Mediano', 'Asignar a ruta', { izq: 'ruta' }); link(asg, 'a05');
  put(content, await pageHeader('Incidentes', '142 reportes ciudadanos · 12 críticos sin asignar', [btn('Contorno', 'Mediano', 'Exportar CSV', { izq: 'descargar' }), asg]));
  const tools = AL('V', { name: 'Filtros', gap: 16 }); put(content, tools);
  add(tools, segmented(['Todos · 142', 'Pendientes · 58', 'En ruta · 31', 'Resueltos · 53'], 0, 560));
  const tb = AL('H', { name: 'Barra de filtros', gap: 12, px: 16, py: 12, align: 'CENTER', r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado' }); put(tools, tb);
  add(tb, I('Búsqueda'), select('Categoría: todas', 'filtro'), select('Urgencia: todas'), select('Estado: todos'), select('Últimos 30 días', 'calendario'));
  const sp = spacer(); add(tb, sp); sp.layoutSizingHorizontal = 'FILL';
  add(tb, btn('Fantasma', 'Mediano', 'Limpiar filtros'));
  const table = AL('V', { name: 'Tabla de incidentes', r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado', clip: true }); put(content, table);
  put(table, I('Encabezado de tabla'));
  INCIDENTS.forEach((d, k) => { const r = incidentRow(d, k === 1 || k === 2); put(table, r); if (d.id === '#RL-0479') { link(nested(r, 'Ver'), 'a04'); } });
  const ft = AL('H', { name: 'Pie de tabla', justify: 'SPACE_BETWEEN', align: 'CENTER', px: 16, py: 14 }); put(table, ft);
  const pag = AL('H', { name: 'Paginación', gap: 6, align: 'CENTER' });
  const prev = ibtn('Contorno', 'chevron-izquierda'); prev.rescale(0.9);
  add(pag, prev);
  for (const [n, a] of [['1', 'Sí'], ['2', 'No'], ['3', 'No']]) add(pag, I('Página', { Activa: a, 'Número': n }));
  add(pag, await T('…', 'Etiqueta/M', 'texto/terciario'), I('Página', { Activa: 'No', 'Número': '18' }));
  const next = ibtn('Contorno', 'chevron-derecha'); next.rescale(0.9); add(pag, next);
  add(ft, await T('Mostrando 1–8 de 142 incidentes', 'Cuerpo/S', 'texto/secundario'), pag);
  // Barra de acciones en lote
  const bulk = AL('H', { name: 'Barra de selección', gap: 16, pl: 20, pr: 12, py: 12, align: 'CENTER', r: 14, fill: 'fondo/oscuro' });
  await shadow(bulk, 'Sombra/Elevada');
  const asg2 = btn('Primario', 'Mediano', 'Asignar a ruta', { izq: 'ruta' }); link(asg2, 'a05');
  add(bulk, await T('2 incidentes seleccionados', 'Etiqueta/M', 'texto/inverso'), btn('Secundario', 'Mediano', 'Cambiar estado'), asg2, ibtn('Transparente', 'cerrar', { color: 'texto/inverso-suave' }));
  absolute(f, bulk, Math.round(248 + (1192 - bulk.width) / 2), f.height - bulk.height - 24);
}

// ---------------------------------------------------------------------
async function buildIncidentDetail() {
  const f = SCR['a03'].clone(); f.name = 'A4 · Detalle de incidente'; mark(f); SCR['a04'] = f;
  const old = f.findOne(n => n.name === 'Barra de selección'); if (old) old.remove();
  const ov = rect(1440, 1024, 'fondo/oscuro', 0, 'Velo'); ov.opacity = 0.4; absolute(f, ov, 0, 0); link(ov, 'a03');
  const d = INCIDENTS[2];
  const dr = AL('V', { name: 'Panel lateral', w: 520, h: 1024, fill: 'fondo/superficie' }); await shadow(dr, 'Sombra/Elevada');
  absolute(f, dr, 920, 0);
  const hd = AL('H', { name: 'Cabecera', gap: 12, align: 'CENTER', px: 24, py: 20 }); strokeSides(hd, 'borde/predeterminado', { b: 1 }); put(dr, hd);
  const ht = AL('V', { gap: 2 }); add(ht, await T('Incidente ' + d.id, 'Título/M', 'texto/principal'), await T(`Reportado el ${d.fecha} a las ${d.hora}`, 'Cuerpo/S', 'texto/secundario'));
  const cl = ibtn('Suave', 'cerrar'); link(cl, 'a03');
  add(hd, ht, cl); ht.layoutSizingHorizontal = 'FILL';
  const body = AL('V', { name: 'Contenido', gap: 20, px: 24, py: 24, clip: true }); put(dr, body, true);
  const ph = rect(100, 180, null, 16, 'Foto'); img(ph, d.foto); put(body, ph);
  const bd = AL('H', { name: 'Insignias', gap: 8 }); add(bd, badge('Urgencia alta', 'Urgencia alta'), badge('Pendiente'), badge('Neutral', 'Orgánico')); put(body, bd);
  const grid = AL('H', { name: 'Datos', gap: 20 }); put(body, grid);
  const colA = AL('V', { gap: 14 }), colB = AL('V', { gap: 14 });
  add(grid, colA, colB); colA.layoutSizingHorizontal = 'FILL'; colB.layoutSizingHorizontal = 'FILL';
  const kv = async (k, v) => { const b = AL('V', { gap: 2 }); const vt = await T(v, 'Cuerpo/M', 'texto/principal'); add(b, await T(k, 'Etiqueta/XS mayúsculas', 'texto/terciario'), vt); return [b, vt]; };
  for (const [col, items] of [[colA, [['Ubicación', `${d.dir} · ${d.zona}`], ['Tamaño estimado', 'Pila grande']]], [colB, [['Reportado por', 'María Quispe · 3 confirmaciones'], ['Clúster sugerido', 'Clúster 04 · Camión 07']]]]) {
    for (const [k, v] of items) { const [b, vt] = await kv(k, v); put(col, b); wrap(vt); }
  }
  const [desc, dt] = await kv('Descripción', 'Restos de verduras y cajas acumulados junto a la puerta 3 desde la madrugada. Bloquean parte de la vereda.'); put(body, desc); wrap(dt);
  const mm = rect(100, 110, null, 12, 'Mini mapa'); img(mm, IMG.miniMapa); put(body, mm);
  const tl = AL('V', { name: 'Seguimiento', gap: 0 }); put(body, tl);
  put(tl, await T('Seguimiento', 'Título/S', 'texto/principal'));
  tl.itemSpacing = 12;
  const steps = AL('V', { gap: 0 }); put(tl, steps);
  const S = [['Completado', 'Reporte recibido', '9 oct, 16:04 · app móvil'], ['Completado', 'Validado por inspector', '9 oct, 16:40 · Lucía Torres'], ['Actual', 'Pendiente de asignación', 'Sugerido: Clúster 04 · Camión 07'], ['Pendiente', 'Recolección', 'Sin programar']];
  S.forEach(([st, t, dd], k) => put(steps, I('Paso de seguimiento', { Estado: st, 'Título': t, Detalle: dd, 'Mostrar línea': k < S.length - 1 })));
  const ftr = AL('H', { name: 'Acciones', gap: 12, px: 24, py: 16 }); strokeSides(ftr, 'borde/predeterminado', { t: 1 }); put(dr, ftr);
  const rej = btn('Contorno', 'Grande', 'Rechazar', { izq: 'cerrar' });
  const ok = btn('Primario', 'Grande', 'Asignar a ruta', { izq: 'ruta' }); link(ok, 'a05');
  add(ftr, rej, ok); ok.layoutSizingHorizontal = 'FILL';
}

// ---------------------------------------------------------------------
async function buildRoutes() {
  const { content } = adminScreen('a05', 'A5 · Rutas con IA', 'Rutas con IA', 'Operación  /  Optimización de rutas', 1120);
  put(content, await pageHeader('Rutas con IA', 'El modelo agrupa los reportes en clústeres y propone la ruta más eficiente para cada camión.', [badge('Marca', 'Modelo IA v2.1 activo'), btn('Contorno', 'Mediano', 'Recalcular', { izq: 'actualizar' })]));
  const row = AL('H', { name: 'Planificador', gap: 24 }); put(content, row, true);
  const col = AL('V', { name: 'Clústeres', gap: 12, w: 300 }); add(row, col); col.layoutSizingVertical = 'FILL';
  const ch = AL('H', { name: 'Cabecera', justify: 'SPACE_BETWEEN', align: 'CENTER' }); put(col, ch);
  add(ch, await T('Clústeres detectados', 'Título/S', 'texto/principal'), select('Urgencia', 'filtro'));
  const CL = [['Sí', 'Clúster 04', 'Alta', 'Sector Norte · Av. Balta', '18 reportes', 'Volumen 92 %', 0.92, 'acento/peligro'],
    ['No', 'Clúster 07', 'Media', 'Sector Centro · Jr. Elías Aguirre', '12 reportes', 'Volumen 64 %', 0.64, 'acento/advertencia'],
    ['No', 'Clúster 09', 'Media', 'Sector Oeste · Av. Grau', '9 reportes', 'Volumen 58 %', 0.58, 'acento/advertencia'],
    ['No', 'Clúster 12', 'Baja', 'Sector Sur · Urb. Santa Victoria', '4 reportes', 'Volumen 35 %', 0.35, 'acento/exito']];
  for (const [sel, n, u, z, r, v, pct, color] of CL) {
    const c = I('Tarjeta de clúster', { Seleccionado: sel, Nombre: n, Zona: z, Reportes: r, Volumen: v });
    swapBadge(nested(c, 'Prioridad'), URG[u], u);
    const pg = c.findOne(x => x.name === 'Progreso'); pg.resize(Math.round(268 * pct), 6); pg.fills = [paint(color)];
    put(col, c);
  }
  const mc = await card('Ruta propuesta · Clúster 04', { sub: 'Actualizada hace 2 minutos', right: [badge('Oscura', 'En vivo')] });
  add(row, mc); mc.layoutSizingHorizontal = 'FILL'; mc.layoutSizingVertical = 'FILL';
  const area = AL('V', { name: 'Mapa', r: 12, clip: true }); img(area, IMG.mapa); put(mc, area, true);
  const route = figma.createNodeFromSvg('<svg width="420" height="560" viewBox="0 0 420 560" xmlns="http://www.w3.org/2000/svg"><path d="M80 100 V320 H230 V500 H390" stroke="#059669" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  route.name = 'Trazado de ruta'; route.fills = [];
  for (const v of route.findAll(n => n.type === 'VECTOR')) v.strokes = [paint('fondo/marca')];
  absolute(area, route, 0, 0);
  const stops = [['1', 80, 100], ['2', 80, 320], ['3', 230, 320], ['4', 230, 500]];
  for (const [n, x, y] of stops) {
    const m = AL('H', { name: 'Parada ' + n, align: 'CENTER', justify: 'CENTER', w: 30, h: 30, r: 999, fill: 'fondo/oscuro', stroke: 'fondo/superficie', sw: 2 });
    add(m, await T(n, 'Etiqueta/S', 'texto/inverso')); absolute(area, m, x - 15, y - 15);
  }
  const dst = AL('H', { name: 'Destino', align: 'CENTER', justify: 'CENTER', w: 34, h: 34, r: 999, fill: 'fondo/marca', stroke: 'fondo/superficie', sw: 2 });
  add(dst, icon('reciclaje', 18, 'texto/inverso')); absolute(area, dst, 390 - 17, 500 - 17);
  const lab = async (t, x, y) => { const l = AL('H', { name: 'Etiqueta · ' + t, px: 8, py: 4, r: 6, fill: 'fondo/oscuro' }); add(l, await T(t, 'Etiqueta/S', 'texto/inverso')); absolute(area, l, x, y); };
  await lab('Av. Balta 450', 104, 88); await lab('Planta de transferencia', 300, 528);
  const pnl = AL('V', { name: 'Resumen de la ruta', gap: 14, px: 20, py: 20, r: 16, w: 300, fill: 'fondo/superficie' });
  await shadow(pnl, 'Sombra/Elevada');
  absolute(area, pnl, Math.max(16, area.width - 316), 16);
  put(pnl, await T('Resumen de la ruta', 'Título/S', 'texto/principal'));
  const g1 = AL('H', { gap: 12 }), g2 = AL('H', { gap: 12 }); put(pnl, g1); put(pnl, g2);
  const metric = async (k, v) => { const b = AL('V', { gap: 2, px: 12, py: 10, r: 10, fill: 'fondo/app' }); add(b, await T(k, 'Cuerpo/S', 'texto/secundario'), await T(v, 'Dato/M', 'texto/principal')); return b; };
  for (const [g, items] of [[g1, [['Distancia', '14,2 km'], ['Tiempo', '45 min']]], [g2, [['Carga', '4,8 t'], ['Capacidad', '80 %']]]]) for (const [k, v] of items) { const b = await metric(k, v); add(g, b); b.layoutSizingHorizontal = 'FILL'; }
  put(pnl, divider());
  put(pnl, await T('Paradas', 'Etiqueta/XS mayúsculas', 'texto/terciario'));
  for (const [n, d, det] of [['1', 'Av. Balta 450', '5 reportes · 1,6 t · 08:15'], ['2', 'Jr. Elías Aguirre 220', '4 reportes · 1,1 t · 08:32'], ['3', 'Calle San José 780', '6 reportes · 1,3 t · 08:51'], ['4', 'Av. Grau 560', '3 reportes · 0,8 t · 09:10']]) put(pnl, I('Parada de ruta', { Tipo: 'Parada', 'Número': n, 'Dirección': d, Detalle: det }));
  put(pnl, I('Parada de ruta', { Tipo: 'Destino', 'Dirección': 'Planta de transferencia municipal', Detalle: 'Llegada estimada 09:35' }));
  put(pnl, divider());
  put(pnl, await T('Asignar camión y conductor', 'Etiqueta/M', 'texto/principal'));
  put(pnl, select('Camión 07 · Juan Martínez', 'camion'));
  const send = btn('Primario', 'Grande', 'Enviar ruta al conductor', { izq: 'enviar' }); put(pnl, send);
  const note = await T('Ruta generada por el modelo de optimización v2.1', 'Cuerpo/S', 'texto/terciario', { align: 'CENTER' }); add(pnl, note); wrap(note);
}

// ---------------------------------------------------------------------
async function buildFleet() {
  const { content } = adminScreen('a06', 'A6 · Flota', 'Flota', 'Operación  /  Flota de recolección', 1100);
  put(content, await pageHeader('Flota de recolección', '7 camiones · 4 en ruta ahora · turno mañana 06:00–14:00', [btn('Contorno', 'Mediano', 'Ver en el mapa', { izq: 'mapa' }), btn('Primario', 'Mediano', 'Registrar camión', { izq: 'mas' })]));
  const kr = AL('H', { name: 'Indicadores', gap: 24 }); put(content, kr);
  for (const a of [
    ['Positiva', 'En ruta ahora', '4', '+1', 'vs. ayer a esta hora', 'camion', 'tendencia'],
    ['Neutral', 'Disponibles', '2', 'Sin cambios', 'listos para despacho', 'check-circulo', 'menos'],
    ['Negativa', 'En mantenimiento', '1', '+1', 'Camión 02 · frenos', 'alerta', 'tendencia'],
    ['Positiva', 'Capacidad media usada', '72 %', '+6 %', 'vs. semana anterior', 'grafico', 'tendencia']
  ]) { const k = kpi(...a); add(kr, k); k.layoutSizingHorizontal = 'FILL'; }
  add(content, segmented(['Todos · 7', 'En ruta · 4', 'Disponibles · 2', 'Mantenimiento · 1'], 0, 600));
  const T7 = [
    ['En ruta', 'Camión 07', 'Placa M3K-482', 'Juan Martínez', '80 %', 'Ruta: Clúster 04', '14,2 km', 0.80, IMG.conductor1],
    ['En ruta', 'Camión 03', 'Placa M1F-217', 'Rosa Paredes', '65 %', 'Ruta: Clúster 07', '11,8 km', 0.65, IMG.conductor2],
    ['En ruta', 'Camión 09', 'Placa M5T-903', 'Luis Chávez', '58 %', 'Ruta: Clúster 09', '9,6 km', 0.58, IMG.conductor3],
    ['En ruta', 'Camión 11', 'Placa M2R-645', 'Pedro Sánchez', '35 %', 'Ruta: Clúster 12', '7,1 km', 0.35, IMG.admin],
    ['Disponible', 'Camión 05', 'Placa M4B-310', 'Ana Torres', '0 %', 'Sin ruta asignada', '—', 0, IMG.conductor2],
    ['Disponible', 'Camión 06', 'Placa M7K-128', 'Jorge Díaz', '0 %', 'Sin ruta asignada', '—', 0, IMG.conductor3],
    ['Mantenimiento', 'Camión 02', 'Placa M9P-554', 'Sin conductor', '—', 'En taller hasta el 12 oct', '—', 0, null]
  ];
  for (let r = 0; r < 2; r++) {
    const gr = AL('H', { name: 'Fila ' + (r + 1), gap: 24, align: 'MIN' }); put(content, gr);
    for (const t of T7.slice(r * 4, r * 4 + 4)) {
      const [st, n, p, dr, pc, ru, km, pct, av] = t;
      const c = I('Tarjeta de camión', { Estado: st, Nombre: n, Placa: p, Conductor: dr, Porcentaje: pc, Ruta: ru, Distancia: km });
      const cg = c.findOne(x => x.name === 'Carga'); cg.resize(Math.max(2, Math.round(224 * pct)), 8);
      const foto = c.findOne(x => x.name === 'Foto'); if (av) img(foto, av); else fill(foto, 'fondo/sutil');
      add(gr, c); c.layoutSizingHorizontal = 'FILL';
    }
    if (r === 1) {
      const addc = AL('V', { name: 'Registrar camión', gap: 8, align: 'CENTER', justify: 'CENTER', r: 16, fill: 'fondo/app', stroke: 'borde/fuerte', sw: 1.5 });
      addc.dashPattern = [6, 6];
      add(gr, addc); addc.layoutSizingHorizontal = 'FILL'; addc.layoutSizingVertical = 'FILL';
      add(addc, iconBox('mas', 44, 'fondo/superficie', 'texto/marca', 999, 22), await T('Registrar camión', 'Etiqueta/M', 'texto/principal'), await T('Añade un vehículo a la flota', 'Cuerpo/S', 'texto/secundario'));
    }
  }
}

// ---------------------------------------------------------------------
async function buildAnalytics() {
  const { content } = adminScreen('a07', 'A7 · Análisis', 'Análisis', 'Gestión  /  Análisis y reportes', 1200);
  put(content, await pageHeader('Análisis', 'Indicadores del servicio de recolección · últimos 30 días', [select('Últimos 30 días', 'calendario'), btn('Contorno', 'Mediano', 'Descargar informe', { izq: 'descargar' })]));
  const kr = AL('H', { name: 'Indicadores', gap: 24 }); put(content, kr);
  for (const a of [
    ['Negativa', 'Reportes recibidos', '1 284', '+18 %', 'vs. periodo anterior', 'documento', 'tendencia'],
    ['Positiva', 'Tiempo medio de resolución', '31 h', '−12 %', 'meta: 36 h', 'reloj', 'tendencia-baja'],
    ['Positiva', 'Toneladas recolectadas', '612 t', '+9 %', 'vs. periodo anterior', 'camion', 'tendencia'],
    ['Positiva', 'Vecinos participantes', '3 420', '+22 %', 'vs. periodo anterior', 'usuarios', 'tendencia']
  ]) { const k = kpi(...a); add(kr, k); k.layoutSizingHorizontal = 'FILL'; }

  const r2 = AL('H', { name: 'Gráficos', gap: 24, h: 380 }); put(content, r2);
  const legend = AL('H', { name: 'Leyenda', gap: 16, align: 'CENTER' });
  for (const [c, t] of [['fondo/marca', 'Recibidos'], ['acento/info', 'Resueltos']]) { const l = AL('H', { gap: 6, align: 'CENTER' }); add(l, circle(8, c), await T(t, 'Cuerpo/S', 'texto/secundario')); add(legend, l); }
  const bc = await card('Reportes por semana', { sub: 'Recibidos frente a resueltos', right: [legend] });
  add(r2, bc); bc.layoutSizingHorizontal = 'FILL'; bc.layoutSizingVertical = 'FILL';
  const chart = AL('H', { name: 'Gráfico de barras', gap: 16, align: 'MAX' }); put(bc, chart, true);
  const axis = AL('V', { name: 'Eje', justify: 'SPACE_BETWEEN', w: 32 }); add(chart, axis); axis.layoutSizingVertical = 'FILL'; axis.paddingBottom = 24;
  for (const v of ['200', '150', '100', '50', '0']) add(axis, await T(v, 'Cuerpo/S', 'texto/terciario'));
  const plot = AL('H', { name: 'Barras', justify: 'SPACE_BETWEEN', align: 'MAX' }); add(chart, plot); plot.layoutSizingHorizontal = 'FILL'; plot.layoutSizingVertical = 'FILL';
  const rec = [128, 142, 151, 139, 163, 170, 182, 209], res = [120, 131, 140, 135, 150, 158, 166, 184];
  for (let k = 0; k < 8; k++) {
    const g = AL('V', { name: 'Semana ' + (34 + k), gap: 8, align: 'CENTER' });
    const bars = AL('H', { gap: 4, align: 'MAX' });
    add(bars, rect(18, Math.round(rec[k] * 1.0), 'fondo/marca', 4, 'Recibidos'), rect(18, Math.round(res[k] * 1.0), 'acento/info', 4, 'Resueltos'));
    add(g, bars, await T('Sem ' + (34 + k), 'Cuerpo/S', 'texto/terciario'));
    add(plot, g);
  }
  const cc = await card('Reportes por categoría', { sub: '1 284 reportes en total', w: 400 });
  add(r2, cc); cc.layoutSizingVertical = 'FILL';
  for (const [n, p, c] of [['Orgánico', 42, 'fondo/marca'], ['Inorgánico', 31, 'acento/info'], ['Escombros', 19, 'acento/advertencia'], ['Peligroso', 8, 'acento/peligro']]) {
    const b = AL('V', { name: n, gap: 8 }); put(cc, b);
    const hr = AL('H', { justify: 'SPACE_BETWEEN' }); put(b, hr);
    add(hr, await T(n, 'Cuerpo/M', 'texto/principal'), await T(p + ' %', 'Etiqueta/M', 'texto/principal'));
    put(b, bar(Math.round(352 * p / 100), 10, c, 352));
  }

  const r3 = AL('H', { name: 'Detalle', gap: 24, align: 'MIN' }); put(content, r3);
  const zc = await card('Zonas con más reportes', { sub: 'Ranking del periodo', gap: 0 }); add(r3, zc); zc.layoutSizingHorizontal = 'FILL';
  const hdr = AL('H', { name: 'Encabezado', gap: 16, align: 'CENTER', py: 10 }); strokeSides(hdr, 'borde/predeterminado', { b: 1 }); put(zc, hdr);
  const colT = async (t, w, al) => { const x = await T(t, 'Etiqueta/XS mayúsculas', 'texto/terciario', { w, align: al }); return x; };
  const zn = await colT('Zona', 200); add(hdr, await colT('#', 28), zn); zn.layoutSizingHorizontal = 'FILL';
  add(hdr, await colT('Reportes', 90, 'RIGHT'), await colT('Volumen', 160), await colT('Tiempo medio', 110, 'RIGHT'));
  const Z = [['Zona Centro', 412, '28 h'], ['Zona Mercado', 298, '35 h'], ['Zona Centro-Norte', 236, '30 h'], ['Zona Oeste', 187, '33 h'], ['Zona Sur', 151, '29 h']];
  for (let k = 0; k < Z.length; k++) {
    const [n, c, t] = Z[k];
    const r = AL('H', { name: n, gap: 16, align: 'CENTER', py: 12 }); if (k < Z.length - 1) strokeSides(r, 'borde/predeterminado', { b: 1 }); put(zc, r);
    const num = AL('H', { align: 'CENTER', justify: 'CENTER', w: 28, h: 28, r: 999, fill: k === 0 ? 'fondo/marca' : 'fondo/sutil' }); add(num, await T(String(k + 1), 'Etiqueta/S', k === 0 ? 'texto/inverso' : 'texto/secundario'));
    const nt = await T(n, 'Cuerpo/M énfasis', 'texto/principal');
    add(r, num, nt); nt.layoutSizingHorizontal = 'FILL';
    add(r, await T(String(c), 'Cuerpo/M', 'texto/principal', { w: 90, align: 'RIGHT' }), bar(Math.round(160 * c / 412), 8, 'fondo/marca', 160), await T(t, 'Cuerpo/M', 'texto/secundario', { w: 110, align: 'RIGHT' }));
  }
  const sc = await card('Cumplimiento del servicio', { sub: 'Reportes atendidos en menos de 48 h', w: 400 }); add(r3, sc);
  const big = AL('H', { gap: 12, align: 'BASELINE' }); put(sc, big);
  add(big, await T('94 %', 'Display/XL', 'texto/marca'), badge('Resuelto', 'Meta: 90 %'));
  put(sc, bar(Math.round(352 * 0.94), 10, 'fondo/marca', 352));
  for (const [k, v] of [['Rutas completadas', '168 de 172'], ['Reportes rechazados', '23 (1,8 %)'], ['Quejas por demora', '7']]) {
    const r = AL('H', { justify: 'SPACE_BETWEEN', py: 10 }); strokeSides(r, 'borde/predeterminado', { t: 1 }); put(sc, r);
    add(r, await T(k, 'Cuerpo/M', 'texto/secundario'), await T(v, 'Cuerpo/M énfasis', 'texto/principal'));
  }
}

// ---------------------------------------------------------------------
async function buildSettings() {
  const { content } = adminScreen('a08', 'A8 · Configuración', 'Configuración', 'Gestión  /  Configuración', 1240);
  put(content, await pageHeader('Configuración', 'Ajusta los parámetros del servicio, la optimización de rutas y el acceso del equipo.', [btn('Contorno', 'Mediano', 'Cancelar'), btn('Primario', 'Mediano', 'Guardar cambios', { izq: 'check' })]));
  const row = AL('H', { name: 'Ajustes', gap: 24, align: 'MIN' }); put(content, row);
  const nav = AL('V', { name: 'Secciones', gap: 4, px: 8, py: 8, r: 16, w: 240, fill: 'fondo/superficie', stroke: 'borde/predeterminado' }); add(row, nav);
  for (const [t, ic, on] of [['General', 'ajustes', false], ['Zonas y sectores', 'mapa', false], ['Optimización con IA', 'destellos', true], ['Notificaciones', 'campana', false], ['Usuarios y roles', 'usuarios', false], ['Integraciones', 'capas', false]]) {
    const it = AL('H', { name: t, gap: 10, px: 12, align: 'CENTER', h: 40, r: 8, fill: on ? 'fondo/marca-suave' : null });
    add(it, icon(ic, 18, on ? 'texto/marca' : 'texto/secundario'), await T(t, on ? 'Cuerpo/M énfasis' : 'Cuerpo/M', on ? 'texto/marca-oscuro' : 'texto/principal'));
    put(nav, it);
  }
  const col = AL('V', { name: 'Paneles', gap: 24 }); add(row, col); col.layoutSizingHorizontal = 'FILL';
  const c1 = await card('Parámetros de optimización con IA', { sub: 'Se aplican en el próximo cálculo de rutas' }); put(col, c1);
  const P = [['Capacidad máxima por camión', '6,0 toneladas', 'camion'], ['Umbral de volumen para despacho', '75 %', 'grafico'], ['Horario de operación', '06:00 – 14:00', 'reloj'], ['Punto de descarga', 'Planta de transferencia municipal', 'ubicacion']];
  for (let r = 0; r < 2; r++) {
    const fr = AL('H', { gap: 20 }); put(c1, fr);
    for (const [l, v, ic] of P.slice(r * 2, r * 2 + 2)) { const fl = field('Completado', l, v, ic); add(fr, fl); fl.layoutSizingHorizontal = 'FILL'; }
  }
  const c2 = await card('Automatización', { sub: 'Reglas que el sistema aplica sin intervención', gap: 0 }); put(col, c2);
  const TG = [['Recalcular rutas automáticamente', 'Cada 2 horas durante el turno de recolección', 'Sí'], ['Priorizar residuos peligrosos', 'Se atienden antes que cualquier otra categoría', 'Sí'], ['Avisar al vecino cuando se resuelva su reporte', 'Notificación en la app y por correo', 'Sí'], ['Agrupar reportes duplicados', 'Une reportes a menos de 30 m entre sí', 'No']];
  for (let k = 0; k < TG.length; k++) {
    const [t, d, on] = TG[k];
    const r = AL('H', { name: t, gap: 16, align: 'CENTER', py: 14 }); if (k > 0) strokeSides(r, 'borde/predeterminado', { t: 1 }); put(c2, r);
    const tx = AL('V', { gap: 2 }); add(tx, await T(t, 'Cuerpo/M énfasis', 'texto/principal'), await T(d, 'Cuerpo/S', 'texto/secundario'));
    add(r, tx, I('Interruptor', { Activo: on })); tx.layoutSizingHorizontal = 'FILL';
  }
  const c3 = await card('Usuarios y roles', { sub: '3 personas con acceso al panel', gap: 0, right: [btn('Secundario', 'Mediano', 'Invitar usuario', { izq: 'asignar' })] }); put(col, c3);
  const U = [[ADMIN_USER.nombre, 'c.ramos@recolecta.pe', 'Marca', 'Administrador', IMG.admin], ['Lucía Torres', 'l.torres@recolecta.pe', 'Neutral', 'Inspectora', IMG.conductor2], ['Juan Martínez', 'j.martinez@recolecta.pe', 'Neutral', 'Conductor', IMG.conductor1]];
  for (let k = 0; k < U.length; k++) {
    const [n, e, bt, role, av] = U[k];
    const r = AL('H', { name: n, gap: 14, align: 'CENTER', py: 12 }); if (k > 0) strokeSides(r, 'borde/predeterminado', { t: 1 }); put(c3, r);
    const a = I('Avatar', { 'Tamaño': 'M' }); img(a.findOne(x => x.name === 'Foto'), av);
    const tx = AL('V', { gap: 2 }); add(tx, await T(n, 'Cuerpo/M énfasis', 'texto/principal'), await T(e, 'Cuerpo/S', 'texto/secundario'));
    add(r, a, tx, badge(bt, role), await T('Activo', 'Cuerpo/S', 'texto/marca', { w: 80, align: 'RIGHT' }), ibtn('Transparente', 'mas-opciones', { color: 'texto/secundario' }));
    tx.layoutSizingHorizontal = 'FILL';
  }
}

async function buildAdminScreens() {
  await buildAdminLogin();
  await buildDashboard();
  await buildIncidents();
  await buildIncidentDetail();
  await buildRoutes();
  await buildFleet();
  await buildAnalytics();
  await buildSettings();
}
