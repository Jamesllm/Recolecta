// =====================================================================
// Recolecta+ · Generador de sistema de diseño y pantallas v2
// Núcleo: constantes, utilidades, fundamentos (variables, estilos) e iconos.
// =====================================================================

const GEN = 'recolecta-gen';
const PAGE_COMP = '🧩 Fundamentos y componentes';
const PAGE_SCREENS = '📱🖥️ Pantallas v2';
const PAGE_ARCHIVE = '🗄️ Archivo v1 (original)';

// Imágenes que ya existen en el archivo (se reutilizan por hash).
const IMG = {
  mapa: 'd0cb6f0b9497395dd942f51e475fdedf84d5ab80',
  mapaCalor: '5fcb53d3baca0ee3636f72105e490cc645a6baa5',
  miniMapa: '6315712996e579be96c04b543513cec6c6619cc6',
  vecino: '914e9d5618c5d67188053db0538c188f9e906098',
  admin: '264f94fa4cc0cc7cf5f0686617ac9474249ca3d1',
  conductor1: '4861a58d7701a00ba8ed8aec438a06049a6206cc',
  conductor2: 'ce61ad54439dc2aa78213aa11aff9e2bebcfcee7',
  conductor3: '32104757032ed79abc4a3b1cc7dcf2eaa91942c0',
  escombros: '9937cb12b1773090846cfacf3ae827d9b80cf16f',
  callejon: '399d65c55beb75ee1eeb7b4095dfb4e050885cc6',
  contenedor: '3ffb97042c86a7774334e59c65d5108e3f7291df',
  llantas: 'cc9f22e5ff0bdb888ffecda9b98c6b0b312833d3',
  tabla: [
    'ad92a195234d8e217ed3e4931758e65dea27f23a', 'b55564d9d5835ba1b75cc67e21b2384d492fe3d0',
    'af7f00e3a6fcff7a7756264d4f2b1dbc69ae2e26', 'a663020aa8f06771e285a1e219fa31f5c26efb86',
    '4abc40c993dc4298614da8265da4b18bfefd665f', '786adbc403a7b8024a354612861bd0ebc450e34c',
    '6ec3d6b751db5f8e8580b37bf6b0bc3a29769a25'
  ]
};

// Estado global (se rellena en main)
let VARS = {}, TS = {}, ES = {}, IC = {};
const C = {};        // componentes generados por nombre
const SCR = {};      // pantallas generadas por clave
const LINKS = [];    // enlaces de prototipo pendientes [nodo, clavePantallaDestino]

// ---------------------------------------------------------------------
// Utilidades básicas
// ---------------------------------------------------------------------
const hexToRgb = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const mark = n => { n.setPluginData(GEN, '1'); return n; };
const paint = name => {
  const v = VARS[name];
  if (!v) throw new Error('Variable inexistente: ' + name);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
};
const fill = (n, c) => { n.fills = c ? [paint(c)] : []; return n; };
const stroke = (n, c, w = 1) => { n.strokes = [paint(c)]; n.strokeWeight = w; n.strokeAlign = 'INSIDE'; return n; };
const strokeSides = (n, c, sides) => {
  n.strokes = [paint(c)]; n.strokeAlign = 'INSIDE';
  n.strokeTopWeight = sides.t || 0; n.strokeBottomWeight = sides.b || 0;
  n.strokeLeftWeight = sides.l || 0; n.strokeRightWeight = sides.r || 0;
  return n;
};
const SP = { 4: 'espacio/1', 8: 'espacio/2', 12: 'espacio/3', 16: 'espacio/4', 20: 'espacio/5', 24: 'espacio/6', 32: 'espacio/8', 40: 'espacio/10', 48: 'espacio/12' };
const bindN = (n, prop, val) => { const k = SP[val]; if (k && VARS[k]) n.setBoundVariable(prop, VARS[k]); else n[prop] = val; };
const RD = { 6: 'radio/sm', 8: 'radio/md', 12: 'radio/lg', 16: 'radio/xl', 24: 'radio/2xl', 999: 'radio/completo' };
const rad = (n, v) => {
  const k = RD[v];
  for (const p of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
    if (k && VARS[k]) n.setBoundVariable(p, VARS[k]); else n[p] = v;
  }
  return n;
};
async function shadow(n, style) { await n.setEffectStyleIdAsync(ES[style].id); return n; }

// Marco con auto-layout. dir: 'H' | 'V'
function AL(dir, o = {}) {
  const H = dir === 'H';
  const f = figma.createFrame();
  f.layoutMode = H ? 'HORIZONTAL' : 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.fills = [];
  f.clipsContent = false;
  f.name = o.name || (H ? 'Fila' : 'Columna');
  if (o.gap != null) bindN(f, 'itemSpacing', o.gap);
  if (o.px != null) { bindN(f, 'paddingLeft', o.px); bindN(f, 'paddingRight', o.px); }
  if (o.py != null) { bindN(f, 'paddingTop', o.py); bindN(f, 'paddingBottom', o.py); }
  if (o.pt != null) bindN(f, 'paddingTop', o.pt);
  if (o.pb != null) bindN(f, 'paddingBottom', o.pb);
  if (o.pl != null) bindN(f, 'paddingLeft', o.pl);
  if (o.pr != null) bindN(f, 'paddingRight', o.pr);
  if (o.fill) fill(f, o.fill);
  if (o.stroke) stroke(f, o.stroke, o.sw || 1);
  if (o.r != null) rad(f, o.r);
  if (o.align) f.counterAxisAlignItems = o.align;
  if (o.justify) f.primaryAxisAlignItems = o.justify;
  if (o.w || o.h) {
    f.resize(o.w || 100, o.h || 100);
    f.primaryAxisSizingMode = (H ? o.w : o.h) ? 'FIXED' : 'AUTO';
    f.counterAxisSizingMode = (H ? o.h : o.w) ? 'FIXED' : 'AUTO';
  }
  if (o.clip) f.clipsContent = true;
  return f;
}

// Texto con estilo y color por variable
async function T(chars, style, color, o = {}) {
  const t = figma.createText();
  const st = TS[style];
  if (!st) throw new Error('Estilo de texto inexistente: ' + style);
  await t.setTextStyleIdAsync(st.id);
  t.characters = chars;
  if (color) fill(t, color);
  t.name = o.name || chars.slice(0, 32);
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.w) { t.resize(o.w, t.height); t.textAutoResize = 'HEIGHT'; }
  if (o.trunc) { if (!o.w) t.resize(160, t.height); t.textAutoResize = 'HEIGHT'; t.textTruncation = 'ENDING'; t.maxLines = 1; }
  return t;
}

const add = (p, ...cs) => { for (const c of cs) if (c) p.appendChild(c); return p; };
const fillW = n => { n.layoutSizingHorizontal = 'FILL'; return n; };
const fillH = n => { n.layoutSizingVertical = 'FILL'; return n; };
const wrap = t => { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; return t; };
function spacer(name = 'Espaciador') { const s = figma.createFrame(); s.name = name; s.fills = []; s.resize(1, 1); return s; }
function rect(w, h, color, r = 0, name = 'Rectángulo') {
  const n = figma.createRectangle(); n.name = name; n.resize(w, h);
  if (color) fill(n, color); else n.fills = [];
  if (r) rad(n, r);
  return n;
}
function circle(d, color, name = 'Círculo') { const e = figma.createEllipse(); e.name = name; e.resize(d, d); if (color) fill(e, color); return e; }
function img(n, hash, color = 'fondo/sutil') {
  let ok = false;
  try { ok = !!(hash && figma.getImageByHash(hash)); } catch (e) { ok = false; }
  if (ok) n.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
  else fill(n, color);
  return n;
}
function absolute(parent, child, x, y) {
  parent.appendChild(child);
  if (parent.layoutMode && parent.layoutMode !== 'NONE') child.layoutPositioning = 'ABSOLUTE';
  child.x = x; child.y = y;
  return child;
}
function divider(color = 'borde/predeterminado', name = 'Divisor') {
  const d = figma.createRectangle(); d.name = name; d.resize(100, 1); fill(d, color); return d;
}

// Iconos: instancia y color
function recolor(root, color) {
  const nodes = root.type === 'VECTOR' ? [root] : root.findAll(n => n.type === 'VECTOR' || n.type === 'ELLIPSE' || n.type === 'RECTANGLE' || n.type === 'BOOLEAN_OPERATION');
  for (const v of nodes) if (v.strokes && v.strokes.length) v.strokes = [paint(color)];
}
function icon(name, size = 24, color = 'texto/principal') {
  const comp = IC[name];
  if (!comp) throw new Error('Icono inexistente: ' + name);
  const i = comp.createInstance();
  if (size !== 24) i.rescale(size / 24);
  if (color && name !== 'google') recolor(i, color);
  i.name = 'Icono';
  return i;
}
// Contenedor cuadrado con icono centrado
function iconBox(name, size, boxColor, iconColor, r = 12, iconSize = 20) {
  const b = AL('H', { name: 'Contenedor de icono', align: 'CENTER', justify: 'CENTER', w: size, h: size, fill: boxColor, r });
  add(b, icon(name, iconSize, iconColor));
  return b;
}

// Componentes: instancias y propiedades
function setP(inst, props) {
  const defs = inst.componentProperties;
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    const key = Object.keys(defs).find(d => d.split('#')[0] === k);
    if (!key) throw new Error(`La propiedad "${k}" no existe en "${inst.name}"`);
    let val = v;
    if (defs[key].type === 'INSTANCE_SWAP' && typeof v === 'string' && IC[v]) val = IC[v].id;
    out[key] = val;
  }
  inst.setProperties(out);
  return inst;
}
function I(name, props = {}) {
  const node = C[name];
  if (!node) throw new Error('Componente inexistente: ' + name);
  let comp = node;
  const vp = {}, op = {};
  if (node.type === 'COMPONENT_SET') {
    const defs = node.componentPropertyDefinitions;
    for (const [k, v] of Object.entries(props)) (defs[k] && defs[k].type === 'VARIANT' ? vp : op)[k] = v;
    comp = node.children.find(c => Object.entries(vp).every(([k, v]) => c.variantProperties[k] === v));
    if (!comp) throw new Error(`Variante no encontrada en ${name}: ${JSON.stringify(vp)}`);
  } else Object.assign(op, props);
  const i = comp.createInstance();
  if (Object.keys(op).length) setP(i, op);
  return i;
}
// Busca una instancia anidada por nombre y le aplica propiedades.
// Al intercambiar un icono con una propiedad, Figma renombra la capa con el nombre
// del nuevo componente ("Icono/inicio"), así que "Icono" también acepta ese patrón.
function nested(inst, name, props) {
  let n = inst.findOne(x => x.type === 'INSTANCE' && x.name === name);
  if (!n && name === 'Icono') n = inst.findOne(x => x.type === 'INSTANCE' && x.name.startsWith('Icono/'));
  if (!n) throw new Error(`No se encontró "${name}" dentro de "${inst.name}"`);
  if (props) setP(n, props);
  return n;
}
function setText(root, layerName, chars) {
  const t = root.findOne(n => n.type === 'TEXT' && n.name === layerName);
  if (t) t.characters = chars;
  return t;
}

// Prototipo: registrar enlace (se aplica al final cuando existen todas las pantallas)
function link(node, target) { LINKS.push([node, target]); return node; }

// Catálogo: marco documental con título donde viven los componentes
async function catalog(title, desc, x, y, w = 1400) {
  const f = AL('V', { name: 'Catálogo · ' + title, gap: 32, px: 48, py: 48, fill: 'fondo/superficie', r: 24, w });
  stroke(f, 'borde/predeterminado');
  mark(f);
  f.x = x; f.y = y;
  const head = AL('V', { name: 'Encabezado', gap: 8 });
  add(head, await T(title, 'Título/L', 'texto/principal'), await T(desc, 'Cuerpo/M', 'texto/secundario', { w: w - 96 }));
  add(f, head); fillW(head);
  return f;
}
async function catTitle(cat, s) { const t = await T(s, 'Título/S', 'texto/secundario'); cat.appendChild(t); return t; }
function toComp(frame, name, desc) {
  const c = figma.createComponentFromNode(frame);
  c.name = name;
  if (desc) c.description = desc;
  return c;
}
function makeSet(variants, parent, name, desc, w = 1300) {
  const set = figma.combineAsVariants(variants, parent);
  set.name = name;
  if (desc) set.description = desc;
  set.layoutMode = 'HORIZONTAL';
  set.layoutWrap = 'WRAP';
  set.primaryAxisSizingMode = 'FIXED';
  set.counterAxisSizingMode = 'AUTO';
  set.resize(w, 100);
  set.itemSpacing = 24; set.counterAxisSpacing = 24;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 24;
  set.counterAxisAlignItems = 'MIN';
  set.fills = [{ type: 'SOLID', color: hexToRgb('#FAF5FF') }];
  set.strokes = [{ type: 'SOLID', color: hexToRgb('#9747FF') }];
  set.dashPattern = [8, 4];
  set.cornerRadius = 16;
  C[name] = set;
  return set;
}
// Enlaza capas de texto / visibilidad / intercambio a propiedades del set o componente
function prop(owner, label, type, def, layerName, field) {
  const key = owner.addComponentProperty(label, type, def);
  const targets = owner.type === 'COMPONENT_SET' ? owner.children : [owner];
  for (const v of targets) {
    const nodes = v.findAll(n => n.name === layerName);
    for (const n of nodes) {
      const refs = Object.assign({}, n.componentPropertyReferences || {});
      refs[field] = key;
      n.componentPropertyReferences = refs;
    }
  }
  return key;
}

// ---------------------------------------------------------------------
// Fundamentos: variables y estilos (se crean solo si faltan)
// ---------------------------------------------------------------------
const PRIMITIVOS = {
  'verde/50': '#ECFDF5', 'verde/100': '#D1FAE5', 'verde/200': '#A7F3D0', 'verde/500': '#10B981', 'verde/600': '#059669', 'verde/700': '#047857', 'verde/800': '#065F46',
  'gris/0': '#FFFFFF', 'gris/50': '#F8FAFC', 'gris/100': '#F1F5F9', 'gris/200': '#E2E8F0', 'gris/300': '#CBD5E1', 'gris/400': '#94A3B8', 'gris/500': '#64748B', 'gris/600': '#475569', 'gris/700': '#334155', 'gris/800': '#1E293B', 'gris/900': '#0F172A',
  'ambar/50': '#FFFBEB', 'ambar/100': '#FEF3C7', 'ambar/500': '#F59E0B', 'ambar/600': '#D97706', 'ambar/800': '#92400E',
  'rojo/50': '#FEF2F2', 'rojo/100': '#FEE2E2', 'rojo/500': '#EF4444', 'rojo/600': '#DC2626', 'rojo/800': '#991B1B',
  'azul/100': '#DBEAFE', 'azul/500': '#3B82F6', 'azul/800': '#1E40AF'
};
const BGS = ['FRAME_FILL', 'SHAPE_FILL'], ANY = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'], BDS = ['STROKE_COLOR'];
const SEMANTICOS = {
  'fondo/app': ['gris/50', BGS], 'fondo/superficie': ['gris/0', BGS], 'fondo/sutil': ['gris/100', BGS], 'fondo/marca': ['verde/600', BGS], 'fondo/marca-hover': ['verde/700', BGS], 'fondo/marca-suave': ['verde/50', BGS], 'fondo/marca-tenue': ['verde/100', BGS],
  'fondo/oscuro': ['gris/900', BGS], 'fondo/oscuro-elevado': ['gris/800', BGS],
  'texto/principal': ['gris/900', ANY], 'texto/secundario': ['gris/600', ANY], 'texto/terciario': ['gris/400', ANY], 'texto/inverso': ['gris/0', ANY], 'texto/marca': ['verde/600', ANY], 'texto/marca-oscuro': ['verde/800', ANY], 'texto/inverso-suave': ['gris/400', ANY],
  'borde/predeterminado': ['gris/200', BDS], 'borde/fuerte': ['gris/300', BDS], 'borde/marca': ['verde/500', BDS], 'borde/oscuro': ['gris/800', BDS], 'borde/peligro': ['rojo/500', BDS],
  'estado/pendiente-fondo': ['ambar/100', BGS], 'estado/pendiente-texto': ['ambar/800', ANY], 'estado/ruta-fondo': ['azul/100', BGS], 'estado/ruta-texto': ['azul/800', ANY], 'estado/resuelto-fondo': ['verde/100', BGS], 'estado/resuelto-texto': ['verde/800', ANY],
  'urgencia/alta-fondo': ['rojo/100', BGS], 'urgencia/alta-texto': ['rojo/800', ANY],
  'acento/exito': ['verde/500', ANY], 'acento/advertencia': ['ambar/500', ANY], 'acento/peligro': ['rojo/500', ANY], 'acento/info': ['azul/500', ANY],
  'acento/advertencia-suave': ['ambar/50', BGS], 'acento/peligro-suave': ['rojo/50', BGS]
};
const DIMENSIONES = {
  'espacio/1': 4, 'espacio/2': 8, 'espacio/3': 12, 'espacio/4': 16, 'espacio/5': 20, 'espacio/6': 24, 'espacio/8': 32, 'espacio/10': 40, 'espacio/12': 48,
  'radio/sm': 6, 'radio/md': 8, 'radio/lg': 12, 'radio/xl': 16, 'radio/2xl': 24, 'radio/completo': 999
};
const TEXT_STYLES = [
  ['Display/XL', 'Outfit', 'Bold', 36, 120, 0], ['Título/L', 'Outfit', 'Bold', 28, 120, 0], ['Título/M', 'Outfit', 'SemiBold', 22, 125, 0], ['Título/S', 'Inter', 'Semi Bold', 17, 130, 0],
  ['Cuerpo/L', 'Inter', 'Regular', 16, 150, 0], ['Cuerpo/M', 'Inter', 'Regular', 14, 150, 0], ['Cuerpo/M énfasis', 'Inter', 'Semi Bold', 14, 145, 0], ['Cuerpo/S', 'Inter', 'Regular', 13, 145, 0],
  ['Etiqueta/M', 'Inter', 'Semi Bold', 13, 130, 0], ['Etiqueta/S', 'Inter', 'Semi Bold', 12, 130, 0], ['Etiqueta/XS mayúsculas', 'Inter', 'Semi Bold', 11, 130, 6],
  ['Botón/M', 'Inter', 'Semi Bold', 15, 120, 0], ['Dato/L', 'Outfit', 'Bold', 32, 110, 0], ['Dato/M', 'Outfit', 'SemiBold', 20, 120, 0]
];
const FONTS = [['Outfit', 'Bold'], ['Outfit', 'SemiBold'], ['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'Semi Bold'], ['Inter', 'Bold']];

async function ensureCollection(name, modeName) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let c = cols.find(x => x.name === name);
  if (!c) { c = figma.variables.createVariableCollection(name); c.renameMode(c.modes[0].modeId, modeName); }
  return c;
}
async function ensureFoundations() {
  const all = await figma.variables.getLocalVariablesAsync();
  const byName = (col, n) => all.find(v => v.name === n && v.variableCollectionId === col.id);

  const prim = await ensureCollection('Primitivos', 'Valor');
  const pm = prim.modes[0].modeId;
  const pv = {};
  for (const [k, h] of Object.entries(PRIMITIVOS)) {
    let v = byName(prim, k);
    if (!v) { v = figma.variables.createVariable(k, prim, 'COLOR'); v.setValueForMode(pm, hexToRgb(h)); v.scopes = []; v.setVariableCodeSyntax('WEB', `var(--${k.replace('/', '-')})`); }
    pv[k] = v;
  }
  const col = await ensureCollection('Color', 'Claro');
  const cm = col.modes[0].modeId;
  for (const [k, [ref, sc]] of Object.entries(SEMANTICOS)) {
    let v = byName(col, k);
    if (!v) { v = figma.variables.createVariable(k, col, 'COLOR'); v.setValueForMode(cm, { type: 'VARIABLE_ALIAS', id: pv[ref].id }); v.scopes = sc; v.setVariableCodeSyntax('WEB', `var(--${k.replace(/\//g, '-')})`); }
  }
  const dim = await ensureCollection('Dimensiones', 'Valor');
  const dm = dim.modes[0].modeId;
  for (const [k, val] of Object.entries(DIMENSIONES)) {
    let v = byName(dim, k);
    if (!v) { v = figma.variables.createVariable(k, dim, 'FLOAT'); v.setValueForMode(dm, val); v.scopes = k.startsWith('radio') ? ['CORNER_RADIUS'] : ['GAP']; v.setVariableCodeSyntax('WEB', `var(--${k.replace('/', '-')})`); }
  }
  VARS = Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v => [v.name, v]));

  for (const [family, style] of FONTS) await figma.loadFontAsync({ family, style });
  let tstyles = await figma.getLocalTextStylesAsync();
  for (const [name, family, style, size, lh, ls] of TEXT_STYLES) {
    if (tstyles.find(s => s.name === name)) continue;
    const s = figma.createTextStyle(); s.name = name; s.fontName = { family, style }; s.fontSize = size;
    s.lineHeight = { unit: 'PERCENT', value: lh }; s.letterSpacing = { unit: 'PERCENT', value: ls };
    if (name.includes('mayúsculas')) s.textCase = 'UPPER';
  }
  TS = Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s => [s.name, s]));

  const sh = (y, r, hex, a) => ({ type: 'DROP_SHADOW', color: Object.assign(hexToRgb(hex), { a }), offset: { x: 0, y }, radius: r, spread: 0, visible: true, blendMode: 'NORMAL' });
  const E = [['Sombra/Tarjeta', [sh(1, 2, '#0F172A', 0.04), sh(4, 12, '#0F172A', 0.05)]], ['Sombra/Elevada', [sh(8, 24, '#0F172A', 0.10)]], ['Sombra/Botón marca', [sh(8, 20, '#059669', 0.22)]], ['Sombra/Barra inferior', [sh(-4, 16, '#0F172A', 0.06)]]];
  const estyles = await figma.getLocalEffectStylesAsync();
  for (const [name, effects] of E) {
    if (estyles.find(s => s.name === name)) continue;
    const s = figma.createEffectStyle(); s.name = name; s.effects = effects;
  }
  ES = Object.fromEntries((await figma.getLocalEffectStylesAsync()).map(s => [s.name, s]));
}

// ---------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------
async function ensurePages() {
  const pages = figma.root.children;
  let comp = pages.find(p => p.name === PAGE_COMP);
  let scr = pages.find(p => p.name === PAGE_SCREENS);
  const arch = pages.find(p => p.name === PAGE_ARCHIVE) || pages.find(p => p.name === 'Page 1');
  if (arch && arch.name !== PAGE_ARCHIVE) arch.name = PAGE_ARCHIVE;
  if (!comp) { comp = figma.createPage(); comp.name = PAGE_COMP; }
  if (!scr) { scr = figma.createPage(); scr.name = PAGE_SCREENS; }
  return { comp, scr, arch };
}

// Vacía las páginas que pertenecen al generador antes de reconstruir.
// · Pantallas v2: se borra todo.
// · Fundamentos y componentes: se borra todo excepto la sección "Iconos".
// (El archivo v1, las variables y los estilos no se tocan.)
async function cleanup(pages) {
  for (const p of [pages.scr, pages.comp]) {
    await p.loadAsync();
    const ids = p.children.map(n => n.id);
    for (const id of ids) {
      const n = await figma.getNodeByIdAsync(id);
      if (!n || n.removed) continue;
      if (p === pages.comp && n.type === 'SECTION' && n.name === 'Iconos') continue;
      try { n.remove(); } catch (e) { /* ya eliminado junto con otro nodo */ }
    }
  }
}
