// =====================================================================
// Fundamentos (documentación visual) y componentes base compartidos
// =====================================================================

async function buildFoundationsDoc(x, y) {
  const cat = await catalog('Fundamentos', 'Colores semánticos, tipografía, espaciado y radios. Todos los componentes y pantallas usan estas variables y estilos: no hay valores sueltos.', x, y, 1400);

  await catTitle(cat, 'Colores semánticos (colección "Color", alias de "Primitivos")');
  const grid = AL('H', { name: 'Muestras de color', gap: 16 });
  grid.layoutWrap = 'WRAP'; grid.counterAxisSpacing = 16;
  add(cat, grid); fillW(grid);
  for (const name of Object.keys(SEMANTICOS)) {
    const tile = AL('V', { name: name, gap: 8, w: 152 });
    const sw = rect(152, 56, name, 12, 'Muestra');
    stroke(sw, 'borde/predeterminado');
    add(tile, sw, await T(name, 'Etiqueta/S', 'texto/principal', { w: 152 }));
    add(grid, tile);
  }

  await catTitle(cat, 'Tipografía (estilos de texto)');
  const types = AL('V', { name: 'Escala tipográfica', gap: 12 });
  add(cat, types); fillW(types);
  for (const [name, family, style, size] of TEXT_STYLES) {
    const row = AL('H', { name, gap: 24, align: 'CENTER' });
    const lbl = await T(`${name} · ${family} ${style} ${size}`, 'Cuerpo/S', 'texto/terciario', { w: 320 });
    add(row, lbl, await T('Recolecta+ mantiene limpia tu ciudad', name, 'texto/principal'));
    add(types, row);
  }

  await catTitle(cat, 'Espaciado y radios (colección "Dimensiones")');
  const sp = AL('H', { name: 'Espaciado', gap: 24, align: 'MAX' });
  add(cat, sp);
  for (const [k, v] of Object.entries(DIMENSIONES)) {
    if (!k.startsWith('espacio')) continue;
    const col = AL('V', { name: k, gap: 8, align: 'CENTER' });
    add(col, rect(v, v, 'fondo/marca', 2, 'Muestra'), await T(`${k.replace('espacio/', 'esp-')} · ${v}`, 'Etiqueta/S', 'texto/secundario'));
    add(sp, col);
  }
  const rd = AL('H', { name: 'Radios', gap: 24, align: 'CENTER' });
  add(cat, rd);
  for (const [k, v] of Object.entries(DIMENSIONES)) {
    if (!k.startsWith('radio')) continue;
    const col = AL('V', { name: k, gap: 8, align: 'CENTER' });
    const r = rect(64, 64, 'fondo/marca-tenue', v, 'Muestra'); stroke(r, 'borde/marca');
    add(col, r, await T(`${k} · ${v === 999 ? 'completo' : v}`, 'Etiqueta/S', 'texto/secundario'));
    add(rd, col);
  }
  return cat;
}

const BTN_FG = { Primario: 'texto/inverso', Secundario: 'texto/marca', Contorno: 'texto/principal', Fantasma: 'texto/marca', Peligro: 'texto/inverso' };
const IBTN_FG = { Suave: 'texto/principal', Contorno: 'texto/principal', Marca: 'texto/inverso', Flotante: 'texto/principal', Transparente: 'texto/secundario' };
const FIELD_IC = { Predeterminado: 'texto/terciario', Completado: 'texto/secundario', Enfocado: 'texto/marca', Error: 'acento/peligro' };

async function buildBaseComponents(x, y) {
  const cat = await catalog('Componentes base', 'Botones, insignias, campos, controles y elementos del sistema compartidos por la app móvil y el panel.', x, y, 1400);

  // ---------- Botón ----------
  await catTitle(cat, 'Botón');
  const BT = { Primario: ['fondo/marca', null], Secundario: ['fondo/marca-suave', null], Contorno: ['fondo/superficie', 'borde/predeterminado'], Fantasma: [null, null], Peligro: ['acento/peligro', null] };
  const bv = [];
  for (const [tipo, [bg, bd]] of Object.entries(BT)) for (const tam of ['Grande', 'Mediano']) {
    const L = tam === 'Grande', fg = BTN_FG[tipo];
    const f = AL('H', { gap: 8, px: L ? 24 : 16, align: 'CENTER', justify: 'CENTER', r: L ? 12 : 8, h: L ? 52 : 40 });
    if (bg) fill(f, bg);
    if (bd) stroke(f, bd);
    if (tipo === 'Primario' && L) await shadow(f, 'Sombra/Botón marca');
    const il = icon('camara', L ? 20 : 18, fg); il.name = 'Icono izquierdo';
    const ir = icon('flecha-derecha', L ? 20 : 18, fg); ir.name = 'Icono derecho';
    add(f, il, await T('Continuar', L ? 'Botón/M' : 'Etiqueta/M', fg, { name: 'Etiqueta' }), ir);
    bv.push(toComp(f, `Tipo=${tipo}, Tamaño=${tam}`));
  }
  const btn = makeSet(bv, cat, 'Botón', 'Botón de acción. Grande (52px) para llamadas a la acción móviles; Mediano (40px) para el panel y acciones secundarias. Activa los iconos con las propiedades booleanas.');
  prop(btn, 'Etiqueta', 'TEXT', 'Continuar', 'Etiqueta', 'characters');
  prop(btn, 'Mostrar icono izquierdo', 'BOOLEAN', false, 'Icono izquierdo', 'visible');
  prop(btn, 'Mostrar icono derecho', 'BOOLEAN', false, 'Icono derecho', 'visible');
  prop(btn, 'Icono izquierdo', 'INSTANCE_SWAP', IC['camara'].id, 'Icono izquierdo', 'mainComponent');
  prop(btn, 'Icono derecho', 'INSTANCE_SWAP', IC['flecha-derecha'].id, 'Icono derecho', 'mainComponent');
  for (const v of btn.children) for (const n of v.findAll(n => n.name.startsWith('Icono '))) n.visible = false;

  // ---------- Botón de icono ----------
  await catTitle(cat, 'Botón de icono');
  const ibv = [];
  const IBS = { Suave: ['fondo/sutil', null], Contorno: ['fondo/superficie', 'borde/predeterminado'], Marca: ['fondo/marca', null], Flotante: ['fondo/superficie', null], Transparente: [null, null] };
  for (const [st, [bg, bd]] of Object.entries(IBS)) {
    const f = AL('H', { align: 'CENTER', justify: 'CENTER', w: 40, h: 40, r: 999 });
    if (bg) fill(f, bg);
    if (bd) stroke(f, bd);
    if (st === 'Flotante') await shadow(f, 'Sombra/Elevada');
    add(f, icon('campana', 20, IBTN_FG[st]));
    const dot = circle(10, 'acento/peligro', 'Aviso'); stroke(dot, 'fondo/superficie', 2);
    absolute(f, dot, 24, 7);
    ibv.push(toComp(f, `Estilo=${st}`));
  }
  const ib = makeSet(ibv, cat, 'Botón de icono', 'Botón circular de 40px con solo un icono. "Mostrar aviso" añade el punto rojo de notificación.');
  prop(ib, 'Icono', 'INSTANCE_SWAP', IC['campana'].id, 'Icono', 'mainComponent');
  prop(ib, 'Mostrar aviso', 'BOOLEAN', false, 'Aviso', 'visible');
  for (const v of ib.children) v.findOne(n => n.name === 'Aviso').visible = false;

  // ---------- Insignia ----------
  await catTitle(cat, 'Insignia');
  const BD = {
    'Pendiente': ['estado/pendiente-fondo', 'estado/pendiente-texto', 'acento/advertencia', 'Pendiente'],
    'En ruta': ['estado/ruta-fondo', 'estado/ruta-texto', 'acento/info', 'En ruta'],
    'Resuelto': ['estado/resuelto-fondo', 'estado/resuelto-texto', 'acento/exito', 'Resuelto'],
    'Urgencia alta': ['urgencia/alta-fondo', 'urgencia/alta-texto', 'acento/peligro', 'Alta'],
    'Urgencia media': ['estado/pendiente-fondo', 'estado/pendiente-texto', 'acento/advertencia', 'Media'],
    'Urgencia baja': ['estado/resuelto-fondo', 'estado/resuelto-texto', 'acento/exito', 'Baja'],
    'Neutral': ['fondo/sutil', 'texto/secundario', 'texto/terciario', 'Orgánico'],
    'Marca': ['fondo/marca-tenue', 'texto/marca-oscuro', 'acento/exito', 'Activo'],
    'Oscura': ['fondo/oscuro', 'texto/inverso', 'acento/exito', 'En vivo']
  };
  const bdv = [];
  for (const [tipo, [bg, fg, dc, label]] of Object.entries(BD)) {
    const f = AL('H', { gap: 6, px: 10, align: 'CENTER', fill: bg, r: 999 }); f.paddingTop = f.paddingBottom = 4;
    add(f, circle(6, dc, 'Punto'), await T(label, 'Etiqueta/S', fg, { name: 'Etiqueta' }));
    bdv.push(toComp(f, `Tipo=${tipo}`));
  }
  const bdg = makeSet(bdv, cat, 'Insignia', 'Etiqueta compacta (edita el texto directamente en la instancia). Estados oficiales: Pendiente, En ruta, Resuelto. Urgencia: Alta, Media, Baja. Usa siempre estos textos en español.');
  prop(bdg, 'Mostrar punto', 'BOOLEAN', true, 'Punto', 'visible');
  // Restaurar los textos por defecto de cada variante
  for (const v of bdg.children) { const t = v.findOne(n => n.name === 'Etiqueta'); t.characters = BD[v.variantProperties['Tipo']][3]; }

  // ---------- Campo de texto ----------
  await catTitle(cat, 'Campo de texto');
  const CF = {
    Predeterminado: ['fondo/superficie', 'borde/predeterminado', 1, 'texto/terciario', 'nombre@correo.com'],
    Completado: ['fondo/superficie', 'borde/predeterminado', 1, 'texto/principal', 'alex.rivera@correo.pe'],
    Enfocado: ['fondo/marca-suave', 'borde/marca', 2, 'texto/principal', 'alex.rivera@correo.pe'],
    Error: ['acento/peligro-suave', 'borde/peligro', 2, 'texto/principal', 'alex.rivera@correo']
  };
  const cfv = [];
  for (const [st, [bg, bd, w, vc, val]] of Object.entries(CF)) {
    const root = AL('V', { gap: 8, w: 354 });
    const box = AL('H', { name: 'Caja', gap: 12, px: 16, align: 'CENTER', fill: bg, stroke: bd, sw: w, r: 12, h: 52 });
    const v = await T(val, 'Cuerpo/L', vc, { name: 'Valor' });
    const ico = icon('correo', 20, FIELD_IC[st]); ico.name = 'Icono';
    const fin = icon('ojo', 20, 'texto/secundario'); fin.name = 'Icono final';
    add(box, ico, v, fin);
    const help = await T(st === 'Error' ? 'Introduce un correo válido.' : 'Texto de ayuda', 'Cuerpo/S', st === 'Error' ? 'acento/peligro' : 'texto/secundario', { name: 'Ayuda' });
    add(root, await T('Correo electrónico', 'Etiqueta/M', 'texto/principal', { name: 'Etiqueta' }), box, help);
    fillW(box); v.layoutSizingHorizontal = 'FILL';
    cfv.push(toComp(root, `Estado=${st}`));
  }
  const cf = makeSet(cfv, cat, 'Campo de texto', 'Campo de formulario. Predeterminado muestra el texto de ejemplo; Completado, el valor escrito; Enfocado y Error muestran el estado de interacción.');
  prop(cf, 'Etiqueta', 'TEXT', 'Correo electrónico', 'Etiqueta', 'characters');
  prop(cf, 'Ayuda', 'TEXT', 'Texto de ayuda', 'Ayuda', 'characters');
  prop(cf, 'Mostrar ayuda', 'BOOLEAN', false, 'Ayuda', 'visible');
  prop(cf, 'Icono', 'INSTANCE_SWAP', IC['correo'].id, 'Icono', 'mainComponent');
  prop(cf, 'Mostrar icono final', 'BOOLEAN', false, 'Icono final', 'visible');
  for (const v of cf.children) {
    v.findOne(n => n.name === 'Valor').characters = CF[v.variantProperties['Estado']][4];
    v.findOne(n => n.name === 'Icono final').visible = false;
    v.findOne(n => n.name === 'Ayuda').visible = v.variantProperties['Estado'] === 'Error';
  }

  // ---------- Selector ----------
  await catTitle(cat, 'Selector y búsqueda');
  {
    const f = AL('H', { gap: 8, px: 12, align: 'CENTER', fill: 'fondo/superficie', stroke: 'borde/predeterminado', r: 8, h: 40 });
    const ico = icon('calendario', 16, 'texto/secundario'); ico.name = 'Icono';
    const chev = icon('chevron-abajo', 16, 'texto/secundario'); chev.name = 'Chevron';
    add(f, ico, await T('Últimos 30 días', 'Etiqueta/M', 'texto/principal', { name: 'Texto' }), chev);
    const c = toComp(f, 'Selector', 'Menú desplegable compacto para filtros y opciones.'); cat.appendChild(c); C['Selector'] = c;
    prop(c, 'Texto', 'TEXT', 'Últimos 30 días', 'Texto', 'characters');
    prop(c, 'Mostrar icono', 'BOOLEAN', true, 'Icono', 'visible');
    prop(c, 'Icono', 'INSTANCE_SWAP', IC['calendario'].id, 'Icono', 'mainComponent');
  }
  {
    const f = AL('H', { gap: 10, px: 14, align: 'CENTER', fill: 'fondo/app', stroke: 'borde/predeterminado', r: 8, h: 40, w: 320 });
    const t = await T('Buscar incidentes, zonas o camiones…', 'Cuerpo/S', 'texto/terciario', { name: 'Texto' });
    add(f, icon('buscar', 18, 'texto/terciario'), t); t.layoutSizingHorizontal = 'FILL';
    const c = toComp(f, 'Búsqueda', 'Campo de búsqueda del panel.'); cat.appendChild(c); C['Búsqueda'] = c;
    prop(c, 'Texto', 'TEXT', 'Buscar incidentes, zonas o camiones…', 'Texto', 'characters');
  }

  // ---------- Controles ----------
  await catTitle(cat, 'Casilla e interruptor');
  const cbv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { align: 'CENTER', justify: 'CENTER', w: 20, h: 20, r: 6 });
    if (on === 'Sí') { fill(f, 'fondo/marca'); add(f, icon('check', 14, 'texto/inverso')); }
    else { fill(f, 'fondo/superficie'); stroke(f, 'borde/fuerte', 1.5); }
    cbv.push(toComp(f, `Marcada=${on}`));
  }
  makeSet(cbv, cat, 'Casilla', 'Casilla de verificación de 20px.', 300);
  const swv = [];
  for (const on of ['Sí', 'No']) {
    const f = AL('H', { align: 'CENTER', justify: on === 'Sí' ? 'MAX' : 'MIN', px: 2, w: 44, h: 24, r: 999, fill: on === 'Sí' ? 'fondo/marca' : 'texto/terciario' });
    const k = circle(20, 'fondo/superficie', 'Perilla'); await shadow(k, 'Sombra/Tarjeta');
    add(f, k);
    swv.push(toComp(f, `Activo=${on}`));
  }
  makeSet(swv, cat, 'Interruptor', 'Interruptor de encendido/apagado para ajustes.', 300);

  // ---------- Avatar ----------
  await catTitle(cat, 'Avatar');
  const avv = [];
  for (const [t, d] of [['S', 32], ['M', 40], ['L', 56], ['XL', 88]]) {
    const f = AL('H', { w: d, h: d });
    const e = circle(d, null, 'Foto'); img(e, IMG.vecino);
    add(f, e);
    avv.push(toComp(f, `Tamaño=${t}`));
  }
  makeSet(avv, cat, 'Avatar', 'Foto de perfil circular. Cambia la imagen en el relleno de la capa "Foto".', 500);

  // ---------- Logo ----------
  await catTitle(cat, 'Logotipo');
  const lgv = [];
  for (const tema of ['Claro', 'Oscuro']) {
    const f = AL('H', { gap: 10, align: 'CENTER' });
    const col = AL('V', { name: 'Marca', gap: 0 });
    add(col, await T('Recolecta+', 'Título/M', tema === 'Claro' ? 'texto/principal' : 'texto/inverso', { name: 'Nombre' }),
      await T('Panel municipal', 'Etiqueta/XS mayúsculas', 'acento/exito', { name: 'Subtítulo' }));
    add(f, iconBox('reciclaje', 36, 'fondo/marca', 'texto/inverso', 10, 20), col);
    if (tema === 'Oscuro') { f.paddingTop = f.paddingBottom = 8; f.paddingLeft = f.paddingRight = 8; fill(f, 'fondo/oscuro'); rad(f, 12); }
    lgv.push(toComp(f, `Tema=${tema}`));
  }
  const lg = makeSet(lgv, cat, 'Logotipo', 'Marca Recolecta+. Tema Oscuro para el menú lateral del panel.', 600);
  prop(lg, 'Mostrar subtítulo', 'BOOLEAN', false, 'Subtítulo', 'visible');
  prop(lg, 'Subtítulo', 'TEXT', 'Panel municipal', 'Subtítulo', 'characters');
  for (const v of lg.children) v.findOne(n => n.name === 'Subtítulo').visible = false;

  // ---------- Aviso ----------
  await catTitle(cat, 'Aviso');
  const AV = { Info: ['estado/ruta-fondo', 'estado/ruta-texto', 'info', 'acento/info'], 'Éxito': ['fondo/marca-suave', 'estado/resuelto-texto', 'check-circulo', 'acento/exito'], Advertencia: ['acento/advertencia-suave', 'estado/pendiente-texto', 'alerta', 'acento/advertencia'], Peligro: ['acento/peligro-suave', 'urgencia/alta-texto', 'alerta', 'acento/peligro'] };
  const avs = [];
  for (const [tipo, [bg, fg, ic, icc]] of Object.entries(AV)) {
    const f = AL('H', { gap: 12, px: 16, py: 14, fill: bg, r: 12, w: 354 });
    const t = await T('Clasifica el residuo y estima su tamaño para asignar el equipo de recolección adecuado.', 'Cuerpo/S', fg, { name: 'Texto' });
    add(f, icon(ic, 20, icc), t); wrap(t);
    avs.push(toComp(f, `Tipo=${tipo}`));
  }
  const av = makeSet(avs, cat, 'Aviso', 'Mensaje informativo dentro de una pantalla.');
  prop(av, 'Texto', 'TEXT', 'Clasifica el residuo y estima su tamaño para asignar el equipo de recolección adecuado.', 'Texto', 'characters');

  // ---------- Sistema iOS ----------
  await catTitle(cat, 'Sistema (iOS)');
  const sbv = [];
  for (const tema of ['Claro', 'Oscuro']) {
    const col = tema === 'Claro' ? 'texto/principal' : 'texto/inverso';
    const f = AL('H', { px: 28, align: 'CENTER', justify: 'SPACE_BETWEEN', w: 402, h: 50 }); f.paddingTop = 6;
    const icons = AL('H', { gap: 6, align: 'CENTER', name: 'Indicadores' });
    const svgs = [
      '<svg width="18" height="12" viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="8" width="3" height="4" rx="1" fill="#000"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#000"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#000"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#000"/></svg>',
      '<svg width="16" height="12" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2C13.2 1.9 10.7.8 8 .8S2.8 1.9.9 3.7L2 4.9c1.6-1.5 3.7-2.4 6-2.4Z"/><path fill="#000" d="M8 6c1.3 0 2.5.5 3.4 1.3l1.1-1.2C11.3 5 9.7 4.3 8 4.3S4.7 5 3.5 6.1l1.1 1.2C5.5 6.5 6.7 6 8 6Z"/><path fill="#000" d="M8 9.4c.5 0 1 .2 1.3.5L8 11.3 6.7 9.9c.3-.3.8-.5 1.3-.5Z"/></svg>',
      '<svg width="27" height="13" viewBox="0 0 27 13" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="#000"/><rect x="2" y="2" width="19" height="9" rx="2" fill="#000"/><path d="M24 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z" fill="#000"/></svg>'
    ];
    const names = ['Señal', 'Wifi', 'Batería'];
    svgs.forEach((s, k) => {
      const n = figma.createNodeFromSvg(s); n.name = names[k]; n.fills = [];
      for (const v of n.findAll(() => true)) {
        if ('fills' in v && v.fills.length) v.fills = [paint(col)];
        if ('strokes' in v && v.strokes.length) { v.strokes = [paint(col)]; v.opacity = 0.4; }
      }
      add(icons, n);
    });
    add(f, await T('9:41', 'Botón/M', col, { name: 'Hora' }), icons);
    sbv.push(toComp(f, `Tema=${tema}`));
  }
  makeSet(sbv, cat, 'Barra de estado', 'Barra de estado de iOS. Colócala en ancho FILL arriba de cada pantalla móvil.', 900);
  {
    const f = AL('H', { align: 'CENTER', justify: 'CENTER', w: 402, h: 34 });
    add(f, rect(134, 5, 'texto/principal', 0, 'Barra'));
    f.children[0].cornerRadius = 3;
    const c = toComp(f, 'Indicador de inicio', 'Indicador de gesto de inicio de iOS (34px).');
    cat.appendChild(c); C['Indicador de inicio'] = c;
  }
  return cat;
}

// ---------- Atajos para instancias base ----------
function btn(tipo, tam, label, o = {}) {
  const p = { Tipo: tipo, 'Tamaño': tam, Etiqueta: label };
  if (o.izq) { p['Mostrar icono izquierdo'] = true; p['Icono izquierdo'] = o.izq; }
  if (o.der) { p['Mostrar icono derecho'] = true; p['Icono derecho'] = o.der; }
  const b = I('Botón', p);
  if ((o.izq || o.der) && !o.google) for (const n of b.findAll(n => n.type === 'INSTANCE' && n.name.startsWith('Icono'))) recolor(n, BTN_FG[tipo]);
  b.name = 'Botón · ' + label;
  return b;
}
function ibtn(estilo, ic, o = {}) {
  const b = I('Botón de icono', { Estilo: estilo, Icono: ic, 'Mostrar aviso': !!o.aviso });
  recolor(nested(b, 'Icono'), o.color || IBTN_FG[estilo]);
  b.name = 'Botón de icono · ' + ic;
  return b;
}
function badge(tipo, label) {
  const b = I('Insignia', { Tipo: tipo });
  if (label) setText(b, 'Etiqueta', label);
  b.name = 'Insignia';
  return b;
}
function field(estado, label, value, ic, o = {}) {
  const p = { Estado: estado, Etiqueta: label, Icono: ic };
  if (o.help) { p['Mostrar ayuda'] = true; p['Ayuda'] = o.help; }
  if (o.eye) p['Mostrar icono final'] = true;
  const f = I('Campo de texto', p);
  setText(f, 'Valor', value);
  recolor(nested(f, 'Icono'), FIELD_IC[estado]);
  f.name = 'Campo · ' + label;
  return f;
}
function select(text, ic) {
  const s = I('Selector', ic ? { Texto: text, Icono: ic } : { Texto: text, 'Mostrar icono': false });
  if (ic) recolor(nested(s, 'Icono'), 'texto/secundario');
  s.name = 'Selector · ' + text;
  return s;
}
