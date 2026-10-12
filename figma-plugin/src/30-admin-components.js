// =====================================================================
// Componentes del panel administrador (escritorio 1440×1024)
// =====================================================================

const MENU = [
  ['Operación', [['Panel general', 'panel'], ['Incidentes', 'alerta', '12'], ['Rutas con IA', 'ruta'], ['Flota', 'camion']]],
  ['Gestión', [['Análisis', 'grafico'], ['Configuración', 'ajustes']]]
];
const ADMIN_USER = { nombre: 'Ing. Carlos Ramos', rol: 'Jefe de operaciones' };
const TABLE_COLS = [['sel', 36], ['ID', 96], ['Foto', 56], ['Fecha y hora', 128], ['Ubicación', 0], ['Categoría', 112], ['Urgencia', 96], ['Estado', 104], ['Acciones', 116]];
const TABLE_W = 1128;

async function buildAdminComponents(x, y) {
  const cat = await catalog('Componentes · Panel administrador', 'Menú lateral, barra superior, indicadores, tabla de incidentes y tarjetas operativas del panel municipal.', x, y, 1400);

  // ---------- Menú lateral ----------
  await catTitle(cat, 'Menú lateral');
  const miv = [];
  for (const st of ['Activo', 'Inactivo']) {
    const on = st === 'Activo';
    const f = AL('H', { gap: 12, px: 12, align: 'CENTER', w: 216, h: 44, r: 10, fill: on ? 'fondo/oscuro-elevado' : null });
    const lbl = await T('Panel general', on ? 'Cuerpo/M énfasis' : 'Cuerpo/M', on ? 'texto/inverso' : 'texto/inverso-suave', { name: 'Etiqueta' });
    const cnt = AL('H', { name: 'Contador', px: 8, align: 'CENTER', r: 999, fill: 'acento/peligro' }); cnt.paddingTop = cnt.paddingBottom = 2;
    add(cnt, await T('12', 'Etiqueta/S', 'texto/inverso', { name: 'Número' }));
    add(f, icon('panel', 20, on ? 'acento/exito' : 'texto/inverso-suave'), lbl, cnt);
    lbl.layoutSizingHorizontal = 'FILL';
    const acc = rect(3, 20, 'acento/exito', 0, 'Acento'); acc.cornerRadius = 2;
    absolute(f, acc, 0, 12); acc.visible = on;
    miv.push(toComp(f, `Estado=${st}`));
  }
  const mi = makeSet(miv, cat, 'Elemento de menú', 'Opción del menú lateral oscuro. Activo: fondo elevado, icono verde y acento a la izquierda.', 600);
  prop(mi, 'Etiqueta', 'TEXT', 'Panel general', 'Etiqueta', 'characters');
  prop(mi, 'Icono', 'INSTANCE_SWAP', IC['panel'].id, 'Icono', 'mainComponent');
  prop(mi, 'Mostrar contador', 'BOOLEAN', false, 'Contador', 'visible');
  prop(mi, 'Contador', 'TEXT', '12', 'Número', 'characters');
  for (const v of mi.children) v.findOne(n => n.name === 'Contador').visible = false;

  const smv = [];
  const allItems = MENU.flatMap(g => g[1]);
  for (const [section] of allItems) {
    const f = AL('V', { gap: 4, px: 16, py: 24, w: 248, h: 1024, fill: 'fondo/oscuro' });
    const logo = I('Logotipo', { Tema: 'Oscuro', 'Mostrar subtítulo': true, 'Subtítulo': 'Panel municipal · Chiclayo' });
    logo.name = 'Logotipo';
    const logoWrap = AL('H', { name: 'Marca', pl: 4 }); logoWrap.paddingBottom = 24;
    add(logoWrap, logo); add(f, logoWrap);
    for (const [group, items] of MENU) {
      const gl = AL('H', { name: 'Grupo · ' + group, pl: 12 }); gl.paddingTop = 12; gl.paddingBottom = 8;
      add(gl, await T(group, 'Etiqueta/XS mayúsculas', 'texto/inverso-suave', { name: 'Grupo' }));
      add(f, gl);
      for (const [label, ic, count] of items) {
        const on = label === section;
        const it = I('Elemento de menú', { Estado: on ? 'Activo' : 'Inactivo', Etiqueta: label, Icono: ic });
        recolor(nested(it, 'Icono'), on ? 'acento/exito' : 'texto/inverso-suave');
        if (count) setP(it, { 'Mostrar contador': true, Contador: count });
        it.name = 'Menú · ' + label;
        add(f, it);
      }
    }
    const sp = spacer(); add(f, sp); sp.layoutSizingVertical = 'FILL';
    const user = AL('H', { name: 'Usuario', gap: 12, px: 12, py: 12, align: 'CENTER', r: 12, fill: 'fondo/oscuro-elevado' });
    const av = I('Avatar', { 'Tamaño': 'M' }); img(av.findOne(n => n.name === 'Foto'), IMG.admin);
    const ut = AL('V', { name: 'Datos', gap: 2 });
    add(ut, await T(ADMIN_USER.nombre, 'Etiqueta/M', 'texto/inverso', { name: 'Nombre' }), await T(ADMIN_USER.rol, 'Cuerpo/S', 'texto/inverso-suave', { name: 'Rol' }));
    const out = ibtn('Transparente', 'salir', { color: 'texto/inverso-suave' }); out.name = 'Cerrar sesión';
    add(user, av, ut, out); ut.layoutSizingHorizontal = 'FILL';
    add(f, user); fillW(user);
    smv.push(toComp(f, `Sección=${section}`));
  }
  makeSet(smv, cat, 'Menú lateral', 'Menú lateral del panel agrupado en Operación y Gestión. Elige la sección activa con la propiedad "Sección".', 1352);

  // ---------- Barra superior ----------
  await catTitle(cat, 'Barra superior y encabezados');
  {
    const f = AL('H', { gap: 16, px: 32, align: 'CENTER', w: 1192, h: 72, fill: 'fondo/superficie' });
    strokeSides(f, 'borde/predeterminado', { b: 1 });
    const crumbs = AL('H', { name: 'Migas', gap: 8, align: 'CENTER' });
    add(crumbs, icon('inicio', 16, 'texto/terciario'), await T('Operación  /  Panel general', 'Cuerpo/S', 'texto/secundario', { name: 'Ruta' }));
    const right = AL('H', { name: 'Herramientas', gap: 12, align: 'CENTER' });
    const date = AL('H', { name: 'Fecha', gap: 8, px: 12, align: 'CENTER', h: 40, r: 8, fill: 'fondo/app' });
    add(date, icon('calendario', 16, 'texto/secundario'), await T('Sáb, 10 oct 2026', 'Etiqueta/M', 'texto/principal', { name: 'Fecha actual' }));
    const s = I('Búsqueda'); s.name = 'Búsqueda';
    const bell = ibtn('Contorno', 'campana', { aviso: true }); bell.name = 'Notificaciones';
    add(right, s, date, bell);
    add(f, crumbs, right); crumbs.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Barra superior', 'Barra global del panel: migas de pan, búsqueda, fecha y notificaciones.'); cat.appendChild(c); C['Barra superior'] = c;
    prop(c, 'Ruta', 'TEXT', 'Operación  /  Panel general', 'Ruta', 'characters');
  }

  // ---------- KPI ----------
  await catTitle(cat, 'Indicadores');
  const KP = { Positiva: ['estado/resuelto-fondo', 'estado/resuelto-texto', 'tendencia'], Negativa: ['urgencia/alta-fondo', 'urgencia/alta-texto', 'tendencia'], Neutral: ['fondo/sutil', 'texto/secundario', 'menos'] };
  const kv = [];
  for (const [tend, [bg, fg, ti]] of Object.entries(KP)) {
    const f = AL('V', { gap: 14, px: 20, py: 20, r: 16, w: 264, fill: 'fondo/superficie', stroke: 'borde/predeterminado' });
    const top = AL('H', { name: 'Cabecera', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    const chip = AL('H', { name: 'Variación', gap: 4, px: 8, align: 'CENTER', r: 999, fill: bg }); chip.paddingTop = chip.paddingBottom = 4;
    const ti2 = icon(ti, 14, fg); ti2.name = 'Icono de tendencia';
    add(chip, ti2, await T('+8 %', 'Etiqueta/S', fg, { name: 'Cambio' }));
    add(top, iconBox('alerta', 40, 'fondo/marca-suave', 'texto/marca', 12, 20), chip);
    const vals = AL('V', { name: 'Valores', gap: 4 });
    add(vals, await T('Incidentes abiertos', 'Cuerpo/M', 'texto/secundario', { name: 'Etiqueta' }), await T('142', 'Dato/L', 'texto/principal', { name: 'Valor' }), await T('vs. semana anterior', 'Cuerpo/S', 'texto/terciario', { name: 'Detalle' }));
    add(f, top, vals); fillW(top);
    kv.push(toComp(f, `Tendencia=${tend}`));
  }
  const kpi = makeSet(kv, cat, 'Tarjeta de indicador', 'KPI del panel. "Tendencia" define el color (Positiva = buena noticia, Negativa = alerta), no la dirección de la flecha.', 900);
  prop(kpi, 'Etiqueta', 'TEXT', 'Incidentes abiertos', 'Etiqueta', 'characters');
  prop(kpi, 'Valor', 'TEXT', '142', 'Valor', 'characters');
  prop(kpi, 'Cambio', 'TEXT', '+8 %', 'Cambio', 'characters');
  prop(kpi, 'Detalle', 'TEXT', 'vs. semana anterior', 'Detalle', 'characters');
  prop(kpi, 'Icono', 'INSTANCE_SWAP', IC['alerta'].id, 'Icono', 'mainComponent');

  // ---------- Tabla ----------
  await catTitle(cat, 'Tabla de incidentes');
  {
    const f = AL('H', { px: 16, align: 'CENTER', w: TABLE_W, h: 44, fill: 'fondo/app' });
    strokeSides(f, 'borde/predeterminado', { b: 1 });
    for (const [col, w] of TABLE_COLS) {
      const cell = AL('H', { name: 'Columna · ' + col, align: 'CENTER', h: 44, w: w || 100 });
      if (col === 'sel') add(cell, I('Casilla', { Marcada: 'No' }));
      else add(cell, await T(col, 'Etiqueta/XS mayúsculas', 'texto/secundario', { name: 'Título de columna' }));
      add(f, cell);
      if (!w) cell.layoutSizingHorizontal = 'FILL';
    }
    const c = toComp(f, 'Encabezado de tabla', 'Encabezado de la tabla de incidentes (anchos de columna fijos).'); cat.appendChild(c); C['Encabezado de tabla'] = c;
  }
  const rv = [];
  for (const sel of ['No', 'Sí']) {
    const f = AL('H', { px: 16, align: 'CENTER', w: TABLE_W, h: 68, fill: sel === 'Sí' ? 'fondo/marca-suave' : 'fondo/superficie' });
    strokeSides(f, 'borde/predeterminado', { b: 1 });
    const cell = (col, w) => { const c = AL('H', { name: 'Celda · ' + col, gap: 4, align: 'CENTER', h: 68, w: w || 100 }); return c; };
    const cells = {};
    for (const [col, w] of TABLE_COLS) { cells[col] = cell(col, w); add(f, cells[col]); if (!w) cells[col].layoutSizingHorizontal = 'FILL'; }
    add(cells['sel'], I('Casilla', { Marcada: sel }));
    add(cells['ID'], await T('#RL-0482', 'Etiqueta/M', 'texto/principal', { name: 'ID' }));
    const ph = rect(40, 40, null, 8, 'Foto'); img(ph, IMG.tabla[0]); add(cells['Foto'], ph);
    const dt = AL('V', { name: 'Fecha y hora', gap: 2 });
    add(dt, await T('4 sep 2026', 'Cuerpo/S', 'texto/principal', { name: 'Fecha' }), await T('14:32', 'Cuerpo/S', 'texto/terciario', { name: 'Hora' }));
    add(cells['Fecha y hora'], dt);
    const loc = AL('V', { name: 'Ubicación', gap: 2 });
    add(loc, await T('Av. Balta 450', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Dirección' }), await T('Zona Centro', 'Cuerpo/S', 'texto/terciario', { name: 'Zona' }));
    add(cells['Ubicación'], loc);
    add(cells['Categoría'], await T('Escombros', 'Cuerpo/S', 'texto/secundario', { name: 'Categoría' }));
    const u = badge('Urgencia alta'); u.name = 'Urgencia'; add(cells['Urgencia'], u);
    const e = badge('Pendiente'); e.name = 'Estado'; add(cells['Estado'], e);
    for (const [nm, ic] of [['Ver', 'ojo'], ['Editar', 'editar'], ['Asignar', 'asignar']]) { const b = ibtn('Transparente', ic, { color: nm === 'Asignar' ? 'texto/marca' : 'texto/secundario' }); b.name = nm; add(cells['Acciones'], b); }
    rv.push(toComp(f, `Seleccionada=${sel}`));
  }
  const row = makeSet(rv, cat, 'Fila de incidente', 'Fila de la tabla de incidentes. Cambia urgencia y estado desde las insignias anidadas; la foto en el relleno de "Foto".', 1352);
  for (const [lbl, def] of [['ID', '#RL-0482'], ['Fecha', '4 sep 2026'], ['Hora', '14:32'], ['Dirección', 'Av. Balta 450'], ['Zona', 'Zona Centro'], ['Categoría', 'Escombros']]) prop(row, lbl, 'TEXT', def, lbl, 'characters');
  for (const v of row.children) for (const n of v.findAll(n => n.type === 'INSTANCE' && (n.name === 'Urgencia' || n.name === 'Estado'))) n.isExposedInstance = true;

  const pgv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { align: 'CENTER', justify: 'CENTER', w: 36, h: 36, r: 8, fill: on === 'Sí' ? 'fondo/marca' : 'fondo/superficie', stroke: on === 'Sí' ? null : 'borde/predeterminado' });
    add(f, await T('1', 'Etiqueta/M', on === 'Sí' ? 'texto/inverso' : 'texto/principal', { name: 'Número' }));
    pgv.push(toComp(f, `Activa=${on}`));
  }
  const pg = makeSet(pgv, cat, 'Página', 'Botón de paginación.', 300);
  prop(pg, 'Número', 'TEXT', '1', 'Número', 'characters');

  // ---------- Tarjetas operativas ----------
  await catTitle(cat, 'Tarjetas operativas');
  {
    const f = AL('H', { gap: 12, px: 16, py: 14, align: 'CENTER', r: 12, w: 340, fill: 'fondo/superficie', stroke: 'borde/predeterminado' });
    const info = AL('V', { name: 'Información', gap: 6 });
    const meta = AL('H', { name: 'Datos', gap: 14, align: 'CENTER' });
    const m1 = AL('H', { name: 'Dato alertas', gap: 4, align: 'CENTER' }); add(m1, icon('alerta', 14, 'texto/terciario'), await T('12 alertas', 'Cuerpo/S', 'texto/secundario', { name: 'Alertas' }));
    const m2 = AL('H', { name: 'Dato carga', gap: 4, align: 'CENTER' }); add(m2, icon('camion', 14, 'texto/terciario'), await T('4,8 t estimadas', 'Cuerpo/S', 'texto/secundario', { name: 'Carga' }));
    add(meta, m1, m2);
    add(info, await T('Zona Centro-Norte', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Nombre' }), meta);
    const pr = badge('Urgencia alta'); pr.name = 'Prioridad';
    add(f, info, pr); info.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Tarjeta de zona', 'Zona prioritaria con número de alertas y carga estimada.'); cat.appendChild(c); C['Tarjeta de zona'] = c;
    prop(c, 'Nombre', 'TEXT', 'Zona Centro-Norte', 'Nombre', 'characters');
    prop(c, 'Alertas', 'TEXT', '12 alertas', 'Alertas', 'characters');
    prop(c, 'Carga', 'TEXT', '4,8 t estimadas', 'Carga', 'characters');
    c.findOne(n => n.type === 'INSTANCE' && n.name === 'Prioridad').isExposedInstance = true;
  }
  const clv = [];
  for (const sel of ['Sí', 'No']) {
    const on = sel === 'Sí';
    const f = AL('V', { gap: 10, px: 16, py: 16, r: 12, w: 320, fill: on ? 'fondo/marca-suave' : 'fondo/superficie', stroke: on ? 'borde/marca' : 'borde/predeterminado', sw: on ? 2 : 1 });
    const r1 = AL('H', { name: 'Cabecera', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    const pr = badge('Urgencia alta', 'Alta'); pr.name = 'Prioridad';
    add(r1, await T('Clúster 04', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Nombre' }), pr);
    const r2 = AL('H', { name: 'Datos', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    add(r2, await T('18 reportes', 'Etiqueta/S', 'texto/marca', { name: 'Reportes' }), await T('Volumen 92 %', 'Cuerpo/S', 'texto/secundario', { name: 'Volumen' }));
    const track = AL('H', { name: 'Barra', h: 6, r: 999, fill: 'fondo/sutil' });
    const prog = rect(265, 6, 'acento/peligro', 999, 'Progreso');
    add(track, prog);
    add(f, r1, await T('Sector Norte · Av. Balta', 'Cuerpo/S', 'texto/secundario', { name: 'Zona' }), r2, track);
    fillW(r1); fillW(r2); fillW(track);
    clv.push(toComp(f, `Seleccionado=${sel}`));
  }
  const cl = makeSet(clv, cat, 'Tarjeta de clúster', 'Clúster de reportes agrupados por la IA. Ajusta el ancho y color de "Progreso" según el volumen.', 800);
  for (const [lbl, def] of [['Nombre', 'Clúster 04'], ['Zona', 'Sector Norte · Av. Balta'], ['Reportes', '18 reportes'], ['Volumen', 'Volumen 92 %']]) prop(cl, lbl, 'TEXT', def, lbl, 'characters');
  for (const v of cl.children) v.findOne(n => n.type === 'INSTANCE' && n.name === 'Prioridad').isExposedInstance = true;

  const psv = [];
  for (const tipo of ['Parada', 'Destino']) {
    const f = AL('H', { gap: 12, align: 'MIN', w: 300 });
    const num = AL('H', { name: 'Marcador', align: 'CENTER', justify: 'CENTER', w: 28, h: 28, r: 999, fill: tipo === 'Parada' ? 'fondo/oscuro' : 'fondo/marca' });
    if (tipo === 'Parada') add(num, await T('1', 'Etiqueta/S', 'texto/inverso', { name: 'Número' }));
    else add(num, icon('reciclaje', 16, 'texto/inverso'));
    const tx = AL('V', { name: 'Textos', gap: 2 });
    const t1 = await T('Av. Balta 450', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Dirección' });
    const t2 = await T('3 reportes · 1,2 t · 08:15', 'Cuerpo/S', 'texto/secundario', { name: 'Detalle' });
    add(tx, t1, t2);
    add(f, num, tx); tx.layoutSizingHorizontal = 'FILL'; wrap(t1); wrap(t2);
    psv.push(toComp(f, `Tipo=${tipo}`));
  }
  const ps = makeSet(psv, cat, 'Parada de ruta', 'Parada numerada de una ruta optimizada; Destino para la planta de transferencia.', 700);
  prop(ps, 'Número', 'TEXT', '1', 'Número', 'characters');
  prop(ps, 'Dirección', 'TEXT', 'Av. Balta 450', 'Dirección', 'characters');
  prop(ps, 'Detalle', 'TEXT', '3 reportes · 1,2 t · 08:15', 'Detalle', 'characters');

  const TRK = { 'En ruta': ['En ruta', 'En ruta', 'fondo/marca'], Disponible: ['Resuelto', 'Disponible', 'fondo/marca'], Mantenimiento: ['Urgencia media', 'Mantenimiento', 'acento/advertencia'] };
  const tkv = [];
  for (const [st, [bt, bl, barc]] of Object.entries(TRK)) {
    const f = AL('V', { gap: 16, px: 20, py: 20, r: 16, w: 264, fill: 'fondo/superficie', stroke: 'borde/predeterminado' });
    const top = AL('H', { name: 'Cabecera', gap: 12, align: 'CENTER' });
    const nm = AL('V', { name: 'Identificación', gap: 2 });
    add(nm, await T('Camión 07', 'Título/S', 'texto/principal', { name: 'Nombre' }), await T('Placa M3K-482', 'Cuerpo/S', 'texto/terciario', { name: 'Placa' }));
    add(top, iconBox('camion', 44, 'fondo/sutil', 'texto/principal', 12, 22), nm); nm.layoutSizingHorizontal = 'FILL';
    const est = badge(bt, bl); est.name = 'Estado';
    const drv = AL('H', { name: 'Fila conductor', gap: 10, align: 'CENTER' });
    const av = I('Avatar', { 'Tamaño': 'S' }); img(av.findOne(n => n.name === 'Foto'), IMG.conductor1);
    const dt = AL('V', { name: 'Datos', gap: 0 });
    add(dt, await T('Juan Martínez', 'Cuerpo/M énfasis', 'texto/principal', { name: 'Conductor' }), await T('Conductor asignado', 'Cuerpo/S', 'texto/terciario', { name: 'Rol' }));
    add(drv, av, dt);
    const cap = AL('V', { name: 'Capacidad', gap: 6 });
    const cr = AL('H', { name: 'Textos', justify: 'SPACE_BETWEEN' });
    add(cr, await T('Capacidad usada', 'Cuerpo/S', 'texto/secundario', { name: 'Etiqueta' }), await T('80 %', 'Etiqueta/S', 'texto/principal', { name: 'Porcentaje' }));
    const track = AL('H', { name: 'Barra', h: 8, r: 999, fill: 'fondo/sutil' });
    add(track, rect(178, 8, barc, 999, 'Carga'));
    add(cap, cr, track);
    const meta = AL('H', { name: 'Fila ruta', justify: 'SPACE_BETWEEN', align: 'CENTER' });
    add(meta, await T('Ruta: Clúster 04', 'Cuerpo/S', 'texto/secundario', { name: 'Ruta' }), await T('14,2 km', 'Etiqueta/S', 'texto/principal', { name: 'Distancia' }));
    const dv = divider();
    add(f, top, est, drv, cap, dv, meta);
    fillW(top); fillW(cap); fillW(cr); fillW(track); fillW(dv); fillW(meta);
    tkv.push(toComp(f, `Estado=${st}`));
  }
  const tk = makeSet(tkv, cat, 'Tarjeta de camión', 'Estado de un camión de la flota con conductor, capacidad y ruta.', 1000);
  for (const [lbl, def] of [['Nombre', 'Camión 07'], ['Placa', 'Placa M3K-482'], ['Conductor', 'Juan Martínez'], ['Porcentaje', '80 %'], ['Ruta', 'Ruta: Clúster 04'], ['Distancia', '14,2 km']]) prop(tk, lbl, 'TEXT', def, lbl, 'characters');
  return cat;
}

// ---------- Atajos ----------
function sidebar(section) { const s = I('Menú lateral', { 'Sección': section }); s.name = 'Menú lateral'; return s; }
function topbar(ruta) { const t = I('Barra superior', { Ruta: ruta }); t.name = 'Barra superior'; return t; }
function kpi(tend, label, value, change, detail, ic, trendIcon) {
  const k = I('Tarjeta de indicador', { Tendencia: tend, Etiqueta: label, Valor: value, Cambio: change, Detalle: detail, Icono: ic });
  recolor(nested(k, 'Icono'), 'texto/marca');
  if (trendIcon) { const ti = nested(k, 'Icono de tendencia'); ti.swapComponent(IC[trendIcon]); recolor(ti, { Positiva: 'estado/resuelto-texto', Negativa: 'urgencia/alta-texto', Neutral: 'texto/secundario' }[tend]); }
  k.name = 'Indicador · ' + label;
  return k;
}
function swapBadge(inst, tipo, label) {
  inst.swapComponent(C['Insignia'].children.find(v => v.variantProperties['Tipo'] === tipo));
  if (label) setText(inst, 'Etiqueta', label);
  return inst;
}
const URG = { Alta: 'Urgencia alta', Media: 'Urgencia media', Baja: 'Urgencia baja' };
function incidentRow(d, selected = false) {
  const r = I('Fila de incidente', { Seleccionada: selected ? 'Sí' : 'No', ID: d.id, Fecha: d.fecha, Hora: d.hora, 'Dirección': d.dir, Zona: d.zona, 'Categoría': d.cat });
  swapBadge(nested(r, 'Urgencia'), URG[d.urg], d.urg);
  swapBadge(nested(r, 'Estado'), d.est, d.est);
  img(r.findOne(n => n.name === 'Foto'), d.foto);
  r.name = 'Fila · ' + d.id;
  return r;
}
async function pageHeader(title, desc, actions = []) {
  const h = AL('H', { name: 'Encabezado de página', gap: 16, align: 'MAX' });
  const t = AL('V', { name: 'Títulos', gap: 4 });
  add(t, await T(title, 'Título/L', 'texto/principal', { name: 'Título' }), await T(desc, 'Cuerpo/M', 'texto/secundario', { name: 'Descripción' }));
  const a = AL('H', { name: 'Acciones', gap: 12, align: 'CENTER' });
  for (const x of actions) add(a, x);
  add(h, t, a); t.layoutSizingHorizontal = 'FILL';
  return h;
}
async function card(title, o = {}) {
  const c = AL('V', { name: o.name || ('Tarjeta · ' + title), gap: o.gap != null ? o.gap : 16, px: o.px != null ? o.px : 24, py: o.py != null ? o.py : 24, r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado', w: o.w, h: o.h, clip: o.clip });
  if (title) {
    const hd = AL('H', { name: 'Cabecera', gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' });
    const tl = AL('V', { name: 'Títulos', gap: 2 });
    add(tl, await T(title, 'Título/S', 'texto/principal', { name: 'Título' }));
    if (o.sub) add(tl, await T(o.sub, 'Cuerpo/S', 'texto/secundario', { name: 'Subtítulo' }));
    add(hd, tl);
    if (o.right) { const r = AL('H', { name: 'Acciones', gap: 8, align: 'CENTER' }); for (const x of o.right) add(r, x); add(hd, r); }
    add(c, hd); fillW(hd);
  }
  return c;
}
