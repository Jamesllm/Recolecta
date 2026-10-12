// Archivo generado por build.js a partir de src/. No editar a mano.
// ---- 00-core.js ----
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

// ---- 05-icons.js ----
// =====================================================================
// Iconos (estilo Lucide, trazo 2px, 24×24). Se reutilizan si ya existen.
// =====================================================================
const ICON_SVGS = {
  'buscar': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'campana': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'ubicacion': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  'inicio': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  'mapa': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  'lista-reportes': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  'usuario': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'usuarios': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'camara': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  'imagen': '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'flecha-izquierda': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'flecha-derecha': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'chevron-izquierda': '<path d="m15 18-6-6 6-6"/>',
  'chevron-derecha': '<path d="m9 18 6-6-6-6"/>',
  'chevron-abajo': '<path d="m6 9 6 6 6-6"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'check-circulo': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'cerrar': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'ojo': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'editar': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  'asignar': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  'papelera': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  'alerta': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'hoja': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  'reciclaje': '<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',
  'martillo': '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
  'camion': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  'reloj': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'correo': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'candado': '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'destellos': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  'panel': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'ruta': '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  'grafico': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'ajustes': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'salir': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  'filtro': '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  'descargar': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  'mas': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'menos': '<path d="M5 12h14"/>',
  'capas': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'actualizar': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'fuego': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  'enviar': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  'calendario': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  'insignia': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'estrella': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  'tendencia': '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  'mira': '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>',
  'escudo': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'mas-opciones': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  'documento': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'telefono': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'tendencia-baja': '<path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/>',
  'compartir': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>'
};
const GOOGLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';

async function ensureIcons(page) {
  let sec = page.children.find(n => n.type === 'SECTION' && n.name === 'Iconos');
  if (!sec) { sec = figma.createSection(); sec.name = 'Iconos'; page.appendChild(sec); sec.x = 0; sec.y = 0; }
  const have = {};
  for (const c of sec.children) if (c.type === 'COMPONENT') have[c.name.replace('Icono/', '')] = c;
  const cols = 10, cell = 72;
  let i = Object.keys(have).length;
  const place = c => { sec.appendChild(c); c.x = 40 + (i % cols) * cell; c.y = 80 + Math.floor(i / cols) * cell; i++; };
  for (const [name, inner] of Object.entries(ICON_SVGS)) {
    if (have[name]) continue;
    const svg = figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
    const c = figma.createComponent(); c.name = 'Icono/' + name; c.resize(24, 24); c.fills = []; c.clipsContent = false;
    for (const ch of [...svg.children]) c.appendChild(ch);
    svg.remove();
    for (const v of c.findAll(() => true)) {
      if ('constraints' in v) v.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
      if ('strokes' in v && v.strokes.length) v.strokes = [paint('texto/principal')];
    }
    c.description = `Icono "${name}" (trazo 2px, 24×24). Cambia el color sobrescribiendo el trazo con una variable de color.`;
    place(c); have[name] = c;
  }
  if (!have['google']) {
    const g = figma.createNodeFromSvg(GOOGLE_SVG);
    const gc = figma.createComponent(); gc.name = 'Icono/google'; gc.resize(24, 24); gc.fills = [];
    for (const ch of [...g.children]) { gc.appendChild(ch); ch.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; }
    g.remove(); gc.description = 'Logotipo de Google (multicolor, no recolorear).';
    place(gc); have['google'] = gc;
  }
  const rows = Math.ceil(i / cols);
  sec.resizeWithoutConstraints(40 + cols * cell, 80 + rows * cell + 24);
  let title = sec.children.find(n => n.type === 'TEXT');
  if (!title) { title = figma.createText(); sec.appendChild(title); title.x = 40; title.y = 28; }
  await title.setTextStyleIdAsync(TS['Título/L'].id);
  title.characters = `Iconos — ${Object.keys(have).length} componentes`;
  IC = have;
  return sec;
}

// ---- 10-base.js ----
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

// ---- 20-mobile-components.js ----
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

// ---- 30-admin-components.js ----
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

// ---- 40-mobile-screens.js ----
// =====================================================================
// Pantallas de la app móvil (402 px de ancho)
// =====================================================================

const MW = 402;

function mobileScreen(key, name, h = 874, bg = 'fondo/app') {
  const f = figma.createFrame();
  f.name = name; f.resize(MW, h);
  f.layoutMode = 'VERTICAL'; f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.itemSpacing = 0; fill(f, bg); f.clipsContent = true;
  mark(f); SCR[key] = f;
  return f;
}
function freeScreen(key, name, h = 874, bg = 'fondo/app') {
  const f = figma.createFrame();
  f.name = name; f.resize(MW, h); fill(f, bg); f.clipsContent = true;
  mark(f); SCR[key] = f;
  return f;
}
// Añade un hijo a un contenedor de pantalla y lo estira a lo ancho
function put(parent, child, grow = false) {
  parent.appendChild(child);
  child.layoutSizingHorizontal = 'FILL';
  if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
  if (grow) child.layoutSizingVertical = 'FILL';
  return child;
}
function grow(parent) { const s = spacer(); parent.appendChild(s); s.layoutSizingVertical = 'FILL'; s.layoutSizingHorizontal = 'FILL'; return s; }
async function linkText(prefix, action, target) {
  const r = AL('H', { name: 'Enlace · ' + action, gap: 4, align: 'CENTER', justify: 'CENTER' });
  if (prefix) add(r, await T(prefix, 'Cuerpo/S', 'texto/secundario'));
  const a = await T(action, 'Etiqueta/M', 'texto/marca', { name: action });
  add(r, a);
  if (target) link(r, target);
  return r;
}
async function sectionTitle(text, right) {
  const r = AL('H', { name: 'Título de sección · ' + text, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  add(r, await T(text, 'Título/S', 'texto/principal'));
  if (right) add(r, right);
  return r;
}
function bottomBar(...children) {
  const b = AL('V', { name: 'Acciones inferiores', gap: 12, px: 20, fill: 'fondo/superficie' });
  b.paddingTop = 16;
  strokeSides(b, 'borde/predeterminado', { t: 1 });
  return b;
}
async function cloneIllustration() {
  try {
    const src = await figma.getNodeByIdAsync('2:13');
    if (!src || !('clone' in src)) return null;
    const cl = src.clone();
    try {
      for (const t of cl.findAll(n => n.type === 'TEXT')) {
        for (const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName);
        const up = t.characters.toUpperCase();
        if (up.includes('SMART')) t.characters = 'CONTENEDOR';
        else if (up.includes('READY')) t.characters = 'LISTO PARA SEPARAR';
      }
    } catch (e) { cl.remove(); return null; }
    cl.name = 'Ilustración · Ciudad limpia';
    cl.x = 0; cl.y = 0;
    return cl;
  } catch (e) { return null; }
}

// ---------------------------------------------------------------------
// 1 · Bienvenida y acceso
// ---------------------------------------------------------------------
async function onboarding(key, paso, title, text, illustration, primary, primaryTarget, showLogin) {
  const f = mobileScreen(key, `0${paso} · Bienvenida ${paso} de 3`, 874, 'fondo/superficie');
  put(f, statusbar());
  const top = AL('H', { name: 'Superior', justify: 'SPACE_BETWEEN', align: 'CENTER', px: 20, h: 48 });
  const brand = AL('H', { name: 'Marca', gap: 8, align: 'CENTER' });
  add(brand, iconBox('reciclaje', 28, 'fondo/marca', 'texto/inverso', 8, 16), await T('Recolecta+', 'Título/S', 'texto/principal'));
  add(top, brand);
  if (paso < 3) { const skip = btn('Fantasma', 'Mediano', 'Omitir'); link(skip, 'm04'); add(top, skip); }
  put(f, top);
  const ill = AL('H', { name: 'Ilustración', justify: 'CENTER', px: 24 }); ill.paddingTop = 8;
  add(ill, illustration); put(f, ill);
  const tx = AL('V', { name: 'Textos', gap: 12, px: 24 }); tx.paddingTop = 28;
  const t1 = await T(title, 'Título/L', 'texto/principal'); const t2 = await T(text, 'Cuerpo/L', 'texto/secundario');
  add(tx, t1, t2); put(f, tx); wrap(t1); wrap(t2);
  grow(f);
  const bot = AL('V', { name: 'Acciones', gap: 16, px: 24, align: 'CENTER' }); bot.paddingBottom = 4;
  const dots = I('Puntos de paginación', { Paso: String(paso) });
  const b = btn('Primario', 'Grande', primary, { der: 'flecha-derecha' }); link(b, primaryTarget);
  add(bot, dots, b); put(f, bot); fillW(b);
  if (showLogin) add(bot, await linkText('¿Ya tienes una cuenta?', 'Iniciar sesión', 'm04'));
  else add(bot, spacer());
  put(f, I('Indicador de inicio'));
  return f;
}

async function buildAccessScreens() {
  // Ilustración 1: la original (clonada del archivo v1), o una alternativa
  let ill1 = await cloneIllustration();
  if (!ill1) { ill1 = AL('V', { w: 354, h: 300, r: 24, fill: 'fondo/marca-suave', align: 'CENTER', justify: 'CENTER' }); add(ill1, iconBox('reciclaje', 96, 'fondo/marca', 'texto/inverso', 999, 48)); }
  const s1 = await onboarding('m01', 1, 'Reporta residuos en segundos', 'Toma una foto de los residuos acumulados, confirma la ubicación y el municipio se encarga del resto.', ill1, 'Siguiente', 'm02', true);
  {
    const stat = AL('H', { name: 'Dato del mes', gap: 12, px: 16, py: 14, align: 'CENTER', fill: 'fondo/marca-suave', r: 12 });
    const st = await T('Este mes los vecinos ayudaron a recolectar 12 480 toneladas de residuos.', 'Etiqueta/M', 'texto/marca-oscuro');
    add(stat, icon('check-circulo', 20, 'texto/marca'), st);
    const wrapS = AL('V', { name: 'Dato', px: 24 }); wrapS.paddingTop = 20;
    s1.insertChild(4, wrapS); wrapS.layoutSizingHorizontal = 'FILL';
    add(wrapS, stat); fillW(stat); wrap(st);
  }

  const ill2 = figma.createFrame(); ill2.name = 'Ilustración · Rutas'; ill2.resize(354, 300); rad(ill2, 24); ill2.clipsContent = true; img(ill2, IMG.mapa);
  const route = figma.createNodeFromSvg('<svg width="354" height="300" viewBox="0 0 354 300" xmlns="http://www.w3.org/2000/svg"><path d="M70 120 L150 205 L235 110 L285 235" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  route.name = 'Ruta'; route.fills = [];
  for (const v of route.findAll(n => n.type === 'VECTOR')) { v.strokes = [paint('fondo/marca')]; v.dashPattern = [10, 8]; }
  ill2.appendChild(route); route.x = 0; route.y = 0;
  for (const [st, x, y] of [['Crítico', 50, 72], ['Pendiente', 215, 62], ['En ruta', 130, 157], ['Resuelto', 265, 187]]) { const p = pin(st); ill2.appendChild(p); p.x = x; p.y = y; }
  const chip = AL('H', { name: 'Etiqueta de ruta', gap: 6, px: 12, py: 8, align: 'CENTER', r: 999, fill: 'fondo/superficie' });
  await shadow(chip, 'Sombra/Elevada');
  add(chip, icon('destellos', 16, 'texto/marca'), await T('Ruta optimizada · 32 % menos km', 'Etiqueta/S', 'texto/principal'));
  ill2.appendChild(chip); chip.x = 16; chip.y = 16;
  await onboarding('m02', 2, 'Rutas inteligentes para tu barrio', 'Agrupamos los reportes por zonas y calculamos la ruta más eficiente para los camiones municipales.', ill2, 'Siguiente', 'm03', false);

  const ill3 = AL('V', { name: 'Ilustración · Seguimiento', gap: 16, px: 20, py: 24, w: 354, h: 300, r: 24, fill: 'fondo/marca-suave', align: 'CENTER', justify: 'CENTER' });
  const rc = reportCard('Llantas en la vereda', 'Av. Salaverry 1205, Chiclayo', '1 oct 2026', 'Resuelto', IMG.llantas);
  add(ill3, rc); fillW(rc);
  const pts = AL('H', { name: 'Puntos ganados', gap: 8, px: 14, py: 10, align: 'CENTER', r: 999, fill: 'fondo/marca' });
  await shadow(pts, 'Sombra/Botón marca');
  add(pts, icon('estrella', 18, 'texto/inverso'), await T('+50 puntos verdes', 'Etiqueta/M', 'texto/inverso'));
  const ach = AL('H', { name: 'Logros', gap: 8, justify: 'CENTER' });
  for (const [l, ic] of [['Primer reporte', 'hoja'], ['Vecino activo', 'estrella'], ['Ojo atento', 'ojo']]) { const a = I('Logro', { Desbloqueado: 'Sí', Etiqueta: l, Icono: ic }); recolor(nested(a, 'Icono'), 'texto/marca'); add(ach, a); }
  add(ill3, pts, ach);
  await onboarding('m03', 3, 'Sigue tu reporte y gana puntos', 'Recibe avisos cuando tu reporte sea atendido, acumula puntos verdes y desbloquea insignias por cuidar tu barrio.', ill3, 'Crear mi cuenta', 'm05', true);

  // ---------- Iniciar sesión ----------
  {
    const f = mobileScreen('m04', '04 · Iniciar sesión', 874, 'fondo/superficie');
    put(f, statusbar());
    const h = header('Iniciar sesión'); put(f, h); link(nested(h, 'Atrás'), 'm01');
    const c = AL('V', { name: 'Formulario', gap: 20, px: 24 }); c.paddingTop = 12;
    put(f, c);
    const t1 = await T('¡Hola de nuevo!', 'Título/L', 'texto/principal');
    const t2 = await T('Ingresa para reportar residuos, seguir tus reportes y sumar puntos verdes.', 'Cuerpo/M', 'texto/secundario');
    const tb = AL('V', { name: 'Bienvenida', gap: 8 }); add(tb, t1, t2); put(c, tb); wrap(t1); wrap(t2);
    put(c, field('Completado', 'Correo electrónico', 'alex.rivera@correo.pe', 'correo'));
    put(c, field('Enfocado', 'Contraseña', '••••••••••', 'candado', { eye: true }));
    const fg = AL('H', { name: 'Olvido', justify: 'MAX' }); add(fg, await linkText(null, '¿Olvidaste tu contraseña?', 'm06')); put(c, fg);
    grow(f);
    const bot = AL('V', { name: 'Acciones', gap: 16, px: 24, align: 'CENTER' });
    put(f, bot);
    const b1 = btn('Primario', 'Grande', 'Iniciar sesión'); link(b1, 'm07'); put(bot, b1);
    const or = AL('H', { name: 'Separador', gap: 12, align: 'CENTER' }); put(bot, or);
    const l1 = divider(), l2 = divider(); add(or, l1, await T('o continúa con', 'Cuerpo/S', 'texto/terciario'), l2); l1.layoutSizingHorizontal = 'FILL'; l2.layoutSizingHorizontal = 'FILL';
    const g = btn('Contorno', 'Grande', 'Continuar con Google', { izq: 'google', google: true }); link(g, 'm07'); put(bot, g);
    add(bot, await linkText('¿No tienes cuenta?', 'Crear cuenta', 'm05'));
    const guest = btn('Fantasma', 'Mediano', 'Continuar como invitado'); link(guest, 'm07'); add(bot, guest);
    put(f, I('Indicador de inicio'));
  }

  // ---------- Crear cuenta ----------
  {
    const f = mobileScreen('m05', '05 · Crear cuenta', 874, 'fondo/superficie');
    put(f, statusbar());
    const h = header('Crear cuenta'); put(f, h); link(nested(h, 'Atrás'), 'm03');
    const c = AL('V', { name: 'Formulario', gap: 16, px: 24 }); c.paddingTop = 8;
    put(f, c);
    const t1 = await T('Únete a Recolecta+', 'Título/L', 'texto/principal');
    const t2 = await T('Crea tu cuenta para reportar residuos y ayudar a mantener limpio Chiclayo.', 'Cuerpo/M', 'texto/secundario');
    const tb = AL('V', { name: 'Bienvenida', gap: 8 }); add(tb, t1, t2); put(c, tb); wrap(t1); wrap(t2);
    put(c, field('Completado', 'Nombre completo', 'Alex Rivera', 'usuario'));
    put(c, field('Completado', 'Correo electrónico', 'alex.rivera@correo.pe', 'correo'));
    put(c, field('Enfocado', 'Contraseña', '••••••••••', 'candado', { eye: true, help: 'Mínimo 8 caracteres, con al menos una letra y un número.' }));
    put(c, field('Completado', 'Distrito', 'Chiclayo', 'ubicacion'));
    const terms = AL('H', { name: 'Términos', gap: 10, align: 'MIN' });
    const tt = await T('Acepto los Términos de uso y la Política de privacidad de Recolecta+.', 'Cuerpo/S', 'texto/secundario');
    add(terms, I('Casilla', { Marcada: 'Sí' }), tt); put(c, terms); wrap(tt);
    grow(f);
    const bot = AL('V', { name: 'Acciones', gap: 16, px: 24, align: 'CENTER' }); bot.paddingBottom = 4;
    put(f, bot);
    const b1 = btn('Primario', 'Grande', 'Crear cuenta'); link(b1, 'm07'); put(bot, b1);
    add(bot, await linkText('¿Ya tienes una cuenta?', 'Iniciar sesión', 'm04'));
    put(f, I('Indicador de inicio'));
  }

  // ---------- Recuperar contraseña ----------
  {
    const f = mobileScreen('m06', '06 · Recuperar contraseña', 874, 'fondo/superficie');
    put(f, statusbar());
    const h = header('Recuperar contraseña'); put(f, h); link(nested(h, 'Atrás'), 'm04');
    const c = AL('V', { name: 'Contenido', gap: 20, px: 24 }); c.paddingTop = 24;
    put(f, c);
    add(c, iconBox('candado', 64, 'fondo/marca-tenue', 'texto/marca', 999, 28));
    const t1 = await T('¿Olvidaste tu contraseña?', 'Título/L', 'texto/principal');
    const t2 = await T('Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva.', 'Cuerpo/M', 'texto/secundario');
    add(c, t1, t2); wrap(t1); wrap(t2);
    put(c, field('Completado', 'Correo electrónico', 'alex.rivera@correo.pe', 'correo'));
    const av = I('Aviso', { Tipo: 'Info', Texto: 'Revisa también tu carpeta de spam. El enlace caduca en 30 minutos.' }); put(c, av);
    grow(f);
    const bot = AL('V', { name: 'Acciones', gap: 12, px: 24, align: 'CENTER' });
    put(f, bot);
    const b1 = btn('Primario', 'Grande', 'Enviar enlace', { der: 'enviar' }); link(b1, 'm04'); put(bot, b1);
    const b2 = btn('Fantasma', 'Mediano', 'Volver a iniciar sesión'); link(b2, 'm04'); add(bot, b2);
    put(f, I('Indicador de inicio'));
  }
}

// ---------------------------------------------------------------------
// 2 · Reportar residuos
// ---------------------------------------------------------------------
function linkTabs(nav) {
  link(nested(nav, 'Pestaña Inicio'), 'm07');
  link(nested(nav, 'Pestaña Mis reportes'), 'm13');
  link(nested(nav, 'Pestaña Perfil'), 'm16');
}

async function buildReportScreens() {
  // ---------- Inicio · mapa ----------
  const home = freeScreen('m07', '07 · Inicio (mapa)');
  {
    const f = home;
    const map = rect(MW, 874, null, 0, 'Mapa'); img(map, IMG.mapa); f.appendChild(map);
    const sb = statusbar(); f.appendChild(sb); sb.x = 0; sb.y = 0;
    const search = I('Barra de búsqueda'); search.resize(262, 48); f.appendChild(search); search.x = 16; search.y = 56;
    const bell = ibtn('Flotante', 'campana', { aviso: true }); f.appendChild(bell); bell.x = 290; bell.y = 60; link(bell, 'm15');
    const av = I('Avatar', { 'Tamaño': 'M' }); f.appendChild(av); av.x = 342; av.y = 60; link(av, 'm16');
    const chips = AL('H', { name: 'Filtros', gap: 8 });
    [['Todos', 'Sí'], ['Pendientes', 'No'], ['En ruta', 'No'], ['Resueltos', 'No']].forEach(([l, a]) => add(chips, I('Chip de filtro', { Activo: a, Etiqueta: l })));
    f.appendChild(chips); chips.x = 16; chips.y = 116;
    const pins = [['Resuelto', 82, 300], ['Pendiente', 280, 236], ['En ruta', 300, 420], ['Crítico', 162, 470], ['Resuelto', 242, 572], ['Pendiente', 60, 520]];
    for (const [st, x, y] of pins) { const p = pin(st); f.appendChild(p); p.x = x; p.y = y; if (st === 'Crítico') link(p, 'm08'); }
    const loc = ibtn('Flotante', 'mira'); f.appendChild(loc); loc.x = 346; loc.y = 640;
    const cta = btn('Primario', 'Grande', 'Reportar residuos', { izq: 'camara' }); f.appendChild(cta); cta.x = Math.round((MW - cta.width) / 2); cta.y = 690; link(cta, 'm09');
    const nav = navbar('Inicio'); f.appendChild(nav); nav.x = 0; nav.y = 874 - nav.height; linkTabs(nav);
  }

  // ---------- Detalle de un punto del mapa ----------
  {
    const f = home.clone(); f.name = '08 · Detalle de punto (mapa)'; mark(f); SCR['m08'] = f;
    const ov = rect(MW, 874, 'fondo/oscuro', 0, 'Velo'); ov.opacity = 0.35; f.appendChild(ov); link(ov, 'm07');
    const sh = AL('V', { name: 'Hoja inferior', gap: 16, px: 20, w: MW, fill: 'fondo/superficie' });
    sh.topLeftRadius = sh.topRightRadius = 24; sh.paddingTop = 12;
    await shadow(sh, 'Sombra/Elevada');
    f.appendChild(sh);
    const hd = AL('H', { name: 'Asa', justify: 'CENTER' }); add(hd, rect(40, 4, 'borde/fuerte', 0, 'Asa')); put(sh, hd); hd.children[0].cornerRadius = 2;
    const ph = rect(100, 150, null, 16, 'Foto'); img(ph, IMG.contenedor); put(sh, ph);
    const tt = AL('H', { name: 'Título', justify: 'SPACE_BETWEEN', align: 'MIN' });
    const tv = AL('V', { name: 'Textos', gap: 2 });
    add(tv, await T('Contenedor desbordado', 'Título/M', 'texto/principal'), await T('Parque Principal de Chiclayo · a 350 m', 'Cuerpo/S', 'texto/secundario'));
    const close = ibtn('Suave', 'cerrar'); link(close, 'm07');
    add(tt, tv, close); put(sh, tt);
    const bd = AL('H', { name: 'Insignias', gap: 8 }); add(bd, badge('Pendiente'), badge('Urgencia alta', 'Urgencia alta'), badge('Neutral', 'Inorgánico')); put(sh, bd);
    const meta = AL('H', { name: 'Datos', gap: 16 });
    const m1 = AL('H', { gap: 6, align: 'CENTER' }); add(m1, icon('reloj', 16, 'texto/terciario'), await T('Reportado hace 2 h', 'Cuerpo/S', 'texto/secundario'));
    const m2 = AL('H', { gap: 6, align: 'CENTER' }); add(m2, icon('usuarios', 16, 'texto/terciario'), await T('3 vecinos lo confirmaron', 'Cuerpo/S', 'texto/secundario'));
    add(meta, m1, m2); put(sh, meta);
    const bt = AL('H', { name: 'Botones', gap: 12 }); put(sh, bt);
    const b1 = btn('Contorno', 'Grande', 'Sigue ahí', { izq: 'check-circulo' }); const b2 = btn('Primario', 'Grande', 'Reportar otro', { izq: 'camara' }); link(b2, 'm09');
    add(bt, b1, b2); fillW(b1); fillW(b2);
    put(sh, I('Indicador de inicio'));
    sh.x = 0; sh.y = 874 - sh.height;
  }

  // ---------- Paso 1 ----------
  {
    const f = mobileScreen('m09', '09 · Nuevo reporte · Paso 1');
    put(f, statusbar());
    const h = header('Nuevo reporte', { action: 'cerrar' }); put(f, h); link(nested(h, 'Atrás'), 'm07'); link(nested(h, 'Acción'), 'm07');
    put(f, I('Progreso de pasos', { Paso: '1' }));
    const c = AL('V', { name: 'Contenido', gap: 24, px: 20 }); c.paddingTop = 20; put(f, c);
    const s1 = AL('V', { name: 'Foto', gap: 12 }); put(c, s1);
    put(s1, await sectionTitle('Foto de los residuos', badge('Resuelto', '1 foto')));
    const photo = AL('V', { name: 'Vista previa', h: 200, r: 16, clip: true, justify: 'MAX', px: 12, py: 12 }); img(photo, IMG.escombros); put(s1, photo);
    const tag = AL('H', { name: 'Marca de tiempo', gap: 6, px: 10, py: 6, align: 'CENTER', r: 999, fill: 'fondo/oscuro' });
    add(tag, icon('reloj', 14, 'texto/inverso'), await T('Tomada hace 1 min', 'Etiqueta/S', 'texto/inverso')); add(photo, tag);
    const pb = AL('H', { name: 'Botones de foto', gap: 12 }); put(s1, pb);
    const r1 = btn('Secundario', 'Mediano', 'Volver a tomar', { izq: 'camara' }), r2 = btn('Contorno', 'Mediano', 'Elegir de galería', { izq: 'imagen' });
    add(pb, r1, r2); fillW(r1); fillW(r2);
    const s2 = AL('V', { name: 'Ubicación', gap: 12 }); put(c, s2);
    put(s2, await sectionTitle('Ubicación detectada'));
    const lc = AL('V', { name: 'Tarjeta de ubicación', gap: 14, px: 16, py: 16, r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado' });
    await shadow(lc, 'Sombra/Tarjeta'); put(s2, lc);
    const lr = AL('H', { name: 'Dirección', gap: 14, align: 'CENTER' }); put(lc, lr);
    const mm = rect(64, 64, null, 12, 'Mini mapa'); img(mm, IMG.miniMapa);
    const lt = AL('V', { name: 'Textos', gap: 4 });
    const ad = AL('H', { gap: 6, align: 'CENTER' }); add(ad, icon('ubicacion', 16, 'texto/marca'), await T('Av. Balta 450, Chiclayo', 'Cuerpo/M énfasis', 'texto/principal'));
    add(lt, ad, await T('GPS −6,7719 · −79,8388 · precisión 8 m', 'Cuerpo/S', 'texto/terciario'));
    add(lr, mm, lt); lt.layoutSizingHorizontal = 'FILL';
    put(lc, divider());
    const adj = AL('H', { name: 'Ajustar', justify: 'CENTER' }); put(lc, adj);
    const ab = btn('Fantasma', 'Mediano', 'Ajustar en el mapa', { izq: 'mira' }); add(adj, ab); link(ab, 'm10');
    grow(f);
    const bot = bottomBar(); put(f, bot);
    const nx = btn('Primario', 'Grande', 'Siguiente: detalles', { der: 'flecha-derecha' }); link(nx, 'm11'); put(bot, nx);
    put(bot, I('Indicador de inicio'));
  }

  // ---------- Ajustar ubicación ----------
  {
    const f = freeScreen('m10', '10 · Ajustar ubicación');
    const map = rect(MW, 874, null, 0, 'Mapa'); img(map, IMG.mapa); f.appendChild(map);
    const sb = statusbar(); f.appendChild(sb);
    const hc = AL('H', { name: 'Encabezado flotante', gap: 12, px: 8, py: 8, align: 'CENTER', r: 16, w: 370, fill: 'fondo/superficie' });
    await shadow(hc, 'Sombra/Elevada');
    const back = ibtn('Suave', 'chevron-izquierda'); link(back, 'm09');
    const ht = AL('V', { name: 'Textos', gap: 0 });
    add(ht, await T('Ajusta la ubicación', 'Título/S', 'texto/principal'), await T('Mueve el mapa para colocar el pin', 'Cuerpo/S', 'texto/secundario'));
    add(hc, back, ht); f.appendChild(hc); hc.x = 16; hc.y = 58;
    const acc = circle(140, 'fondo/marca', 'Precisión'); acc.opacity = 0.15; f.appendChild(acc); acc.x = 131; acc.y = 300;
    const p = pin('Seleccionado'); p.rescale(1.4); f.appendChild(p); p.x = Math.round(MW / 2 - p.width / 2); p.y = 370 - p.height;
    const loc = ibtn('Flotante', 'mira'); f.appendChild(loc); loc.x = 346; loc.y = 470;
    const sh = AL('V', { name: 'Hoja inferior', gap: 16, px: 20, w: MW, fill: 'fondo/superficie' });
    sh.topLeftRadius = sh.topRightRadius = 24; sh.paddingTop = 20;
    await shadow(sh, 'Sombra/Elevada'); f.appendChild(sh);
    const ar = AL('H', { name: 'Dirección', gap: 12, align: 'CENTER' }); put(sh, ar);
    const at = AL('V', { name: 'Textos', gap: 2 });
    add(at, await T('Av. Balta 450', 'Cuerpo/M énfasis', 'texto/principal'), await T('Cercado de Chiclayo, Lambayeque', 'Cuerpo/S', 'texto/secundario'));
    add(ar, iconBox('ubicacion', 44, 'fondo/marca-tenue', 'texto/marca', 12, 22), at);
    put(sh, field('Completado', 'Referencia (opcional)', 'Frente al Mercado Modelo', 'documento'));
    const ok = btn('Primario', 'Grande', 'Confirmar ubicación', { izq: 'check' }); link(ok, 'm09'); put(sh, ok);
    put(sh, I('Indicador de inicio'));
    sh.x = 0; sh.y = 874 - sh.height;
  }

  // ---------- Paso 2 ----------
  {
    const f = mobileScreen('m11', '11 · Nuevo reporte · Paso 2', 1160);
    put(f, statusbar());
    const h = header('Detalles del residuo', { action: 'cerrar' }); put(f, h); link(nested(h, 'Atrás'), 'm09'); link(nested(h, 'Acción'), 'm07');
    put(f, I('Progreso de pasos', { Paso: '2' }));
    const c = AL('V', { name: 'Contenido', gap: 24, px: 20 }); c.paddingTop = 20; put(f, c);
    put(c, I('Aviso', { Tipo: 'Info', Texto: 'Clasifica el residuo y estima su tamaño para asignar el equipo de recolección adecuado.' }));
    const s1 = AL('V', { name: 'Tipo de residuo', gap: 12 }); put(c, s1);
    put(s1, await sectionTitle('Tipo de residuo'));
    const types = [['Orgánico', 'hoja', true], ['Inorgánico', 'reciclaje', false], ['Escombros', 'martillo', false], ['Peligroso', 'alerta', false]];
    for (let r = 0; r < 2; r++) {
      const row = AL('H', { name: 'Fila ' + (r + 1), gap: 12 }); put(s1, row);
      for (const [l, ic, on] of types.slice(r * 2, r * 2 + 2)) {
        const p = { Seleccionado: on ? 'Sí' : 'No', Etiqueta: l, Icono: ic };
        if (l === 'Peligroso') { p['Mostrar nota'] = true; p['Nota'] = 'Requiere manejo especial'; }
        const t = I('Tarjeta de tipo de residuo', p);
        recolor(nested(t, 'Icono'), on ? 'texto/marca' : (l === 'Peligroso' ? 'acento/advertencia' : 'texto/secundario'));
        t.name = 'Tipo · ' + l;
        add(row, t); t.layoutSizingHorizontal = 'FILL';
      }
    }
    const s2 = AL('V', { name: 'Tamaño estimado', gap: 10 }); put(c, s2);
    put(s2, await sectionTitle('Tamaño estimado'));
    for (const [t, d, on] of [['Bolsa pequeña', 'Cabe en un tacho de basura público', false], ['Pila grande', 'Varias bolsas o residuos dispersos en un área pequeña', true], ['Camión completo', 'Desmonte, muebles o vertido de gran volumen', false]]) {
      const o = I('Opción de tamaño', { Seleccionado: on ? 'Sí' : 'No', 'Título': t, 'Descripción': d }); o.name = 'Tamaño · ' + t; put(s2, o);
    }
    const s3 = AL('V', { name: 'Descripción', gap: 12 }); put(c, s3);
    put(s3, await sectionTitle('Descripción adicional', badge('Neutral', 'Opcional')));
    const ta = AL('V', { name: 'Área de texto', gap: 8, px: 16, py: 14, r: 12, h: 120, fill: 'fondo/superficie', stroke: 'borde/predeterminado' }); put(s3, ta);
    const ph = await T('Describe el estado de los residuos, si bloquean el paso o cualquier detalle útil para el equipo…', 'Cuerpo/M', 'texto/terciario');
    add(ta, ph); wrap(ph); grow(ta);
    const cnt = await T('0 / 280', 'Cuerpo/S', 'texto/terciario', { align: 'RIGHT' }); add(ta, cnt); wrap(cnt);
    grow(f);
    const bot = bottomBar(); put(f, bot);
    const br = AL('H', { name: 'Botones', gap: 12 }); put(bot, br);
    const back = btn('Contorno', 'Grande', 'Atrás'); link(back, 'm09');
    const send = btn('Primario', 'Grande', 'Enviar reporte', { der: 'enviar' }); link(send, 'm12');
    add(br, back, send); send.layoutSizingHorizontal = 'FILL';
    put(bot, I('Indicador de inicio'));
  }

  // ---------- Reporte enviado ----------
  {
    const f = mobileScreen('m12', '12 · Reporte enviado', 874, 'fondo/superficie');
    put(f, statusbar());
    const c = AL('V', { name: 'Confirmación', gap: 20, px: 24, align: 'CENTER' }); c.paddingTop = 48; put(f, c);
    const ring = AL('H', { name: 'Éxito', align: 'CENTER', justify: 'CENTER', w: 120, h: 120, r: 999, fill: 'fondo/marca-tenue' });
    const inner = AL('H', { align: 'CENTER', justify: 'CENTER', w: 80, h: 80, r: 999, fill: 'fondo/marca' }); add(inner, icon('check', 40, 'texto/inverso')); add(ring, inner);
    add(c, ring);
    const t1 = await T('¡Reporte enviado!', 'Título/L', 'texto/principal', { align: 'CENTER' });
    const t2 = await T('Gracias, Alex. Lo incluiremos en la próxima ruta de recolección de tu zona.', 'Cuerpo/M', 'texto/secundario', { align: 'CENTER' });
    add(c, t1, t2); wrap(t1); wrap(t2);
    const code = AL('V', { name: 'Código', gap: 4, align: 'CENTER', px: 20, py: 16, r: 16, fill: 'fondo/app', stroke: 'borde/predeterminado' }); put(c, code);
    add(code, await T('Código de seguimiento', 'Etiqueta/XS mayúsculas', 'texto/terciario'), await T('#RL-0482', 'Dato/M', 'texto/principal'));
    const info = AL('H', { name: 'Tiempo estimado', gap: 14, px: 16, py: 16, align: 'CENTER', r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado' }); put(c, info);
    const it = AL('V', { gap: 2 }); add(it, await T('Tiempo estimado de atención', 'Cuerpo/S', 'texto/secundario'), await T('Entre 24 y 48 horas', 'Cuerpo/M énfasis', 'texto/principal'));
    add(info, iconBox('reloj', 44, 'fondo/marca-tenue', 'texto/marca', 12, 22), it);
    const pts = AL('H', { name: 'Puntos', gap: 8, px: 14, py: 8, align: 'CENTER', r: 999, fill: 'fondo/marca-suave' });
    add(pts, icon('estrella', 16, 'texto/marca'), await T('Ganaste 50 puntos verdes', 'Etiqueta/M', 'texto/marca-oscuro')); add(c, pts);
    grow(f);
    const bot = AL('V', { name: 'Acciones', gap: 12, px: 24 }); put(f, bot);
    const b1 = btn('Primario', 'Grande', 'Ver estado del reporte'); link(b1, 'm14'); put(bot, b1);
    const b2 = btn('Contorno', 'Grande', 'Volver al mapa'); link(b2, 'm07'); put(bot, b2);
    put(f, I('Indicador de inicio'));
  }
}

// ---------------------------------------------------------------------
// 3 · Seguimiento y perfil
// ---------------------------------------------------------------------
async function buildTrackingScreens() {
  // ---------- Mis reportes ----------
  {
    const f = mobileScreen('m13', '13 · Mis reportes');
    put(f, statusbar());
    const hd = AL('V', { name: 'Encabezado', gap: 4, px: 20 }); hd.paddingTop = 12; put(f, hd);
    add(hd, await T('Mis reportes', 'Título/L', 'texto/principal'), await T('4 reportes enviados · 1 resuelto', 'Cuerpo/M', 'texto/secundario'));
    const ch = AL('H', { name: 'Filtros', gap: 8, px: 20, clip: true }); ch.paddingTop = 16; ch.paddingBottom = 4; put(f, ch);
    [['Todos (4)', 'Sí'], ['Pendientes (2)', 'No'], ['En ruta (1)', 'No'], ['Resueltos (1)', 'No']].forEach(([l, a]) => add(ch, I('Chip de filtro', { Activo: a, Etiqueta: l })));
    const list = AL('V', { name: 'Lista', gap: 12, px: 20 }); list.paddingTop = 16; put(f, list);
    const items = [
      ['Escombros acumulados', 'Av. Balta 450, Chiclayo', 'Hoy, 09:12', 'Pendiente', IMG.escombros],
      ['Basural en callejón', 'Jr. Elías Aguirre 220, Chiclayo', '8 oct 2026', 'En ruta', IMG.callejon],
      ['Contenedor desbordado', 'Parque Principal de Chiclayo', '5 oct 2026', 'Pendiente', IMG.contenedor],
      ['Llantas en la vereda', 'Av. Salaverry 1205, Chiclayo', '1 oct 2026', 'Resuelto', IMG.llantas]
    ];
    items.forEach((d, k) => { const c = reportCard(...d); put(list, c); if (k === 0) link(c, 'm14'); });
    grow(f);
    const nav = navbar('Mis reportes'); put(f, nav); linkTabs(nav);
  }

  // ---------- Detalle del reporte ----------
  {
    const f = mobileScreen('m14', '14 · Detalle del reporte', 980);
    put(f, statusbar());
    const h = header('Reporte #RL-0482', { action: 'compartir' }); put(f, h); link(nested(h, 'Atrás'), 'm13');
    const c = AL('V', { name: 'Contenido', gap: 20, px: 20 }); c.paddingTop = 8; put(f, c);
    const ph = rect(100, 200, null, 16, 'Foto'); img(ph, IMG.escombros); put(c, ph);
    const tr = AL('H', { name: 'Título', justify: 'SPACE_BETWEEN', align: 'CENTER' }); put(c, tr);
    add(tr, await T('Escombros acumulados', 'Título/M', 'texto/principal'), badge('Pendiente'));
    const info = AL('V', { name: 'Datos del reporte', px: 16, r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado' }); put(c, info);
    const rows = [['Categoría', 'Escombros'], ['Tamaño estimado', 'Pila grande'], ['Ubicación', 'Av. Balta 450, Chiclayo'], ['Enviado', 'Hoy, 10 oct 2026 · 09:12']];
    for (let k = 0; k < rows.length; k++) {
      const r = AL('H', { name: rows[k][0], justify: 'SPACE_BETWEEN', align: 'CENTER', py: 12 });
      if (k < rows.length - 1) strokeSides(r, 'borde/predeterminado', { b: 1 });
      add(r, await T(rows[k][0], 'Cuerpo/S', 'texto/secundario'), await T(rows[k][1], 'Cuerpo/M énfasis', 'texto/principal', { align: 'RIGHT' }));
      put(info, r);
    }
    const tl = AL('V', { name: 'Seguimiento', gap: 12 }); put(c, tl);
    put(tl, await sectionTitle('Seguimiento'));
    const steps = AL('V', { name: 'Línea de tiempo', gap: 0 }); put(tl, steps);
    const S = [['Completado', 'Reporte recibido', 'Hoy, 09:12'], ['Actual', 'Validación del municipio', 'En revisión · suele tardar menos de 2 horas'], ['Pendiente', 'Asignación a una ruta', 'Te avisaremos cuando un camión lo tenga en su ruta'], ['Pendiente', 'Recolección', 'Estimada entre 24 y 48 horas']];
    S.forEach(([st, t, d], k) => { const s = I('Paso de seguimiento', { Estado: st, 'Título': t, Detalle: d, 'Mostrar línea': k < S.length - 1 }); put(steps, s); });
    grow(f);
  }

  // ---------- Notificaciones ----------
  {
    const f = mobileScreen('m15', '15 · Notificaciones', 874, 'fondo/superficie');
    put(f, statusbar());
    const h = header('Notificaciones', { action: 'check-circulo' }); put(f, h); link(nested(h, 'Atrás'), 'm07');
    const group = async (label) => { const g = AL('H', { name: 'Grupo · ' + label, px: 20 }); g.paddingTop = 16; g.paddingBottom = 8; add(g, await T(label, 'Etiqueta/XS mayúsculas', 'texto/terciario')); put(f, g); };
    const note = (read, ic, t, m, time, target) => { const n = I('Elemento de notificación', { 'Leído': read, 'Título': t, Mensaje: m, Tiempo: time, Icono: ic }); recolor(nested(n, 'Icono'), 'texto/marca'); put(f, n); if (target) link(n, target); };
    await group('Hoy');
    note('No', 'check-circulo', 'Recibimos tu reporte #RL-0482', 'Lo revisaremos y te avisaremos cuando se asigne a una ruta.', 'Hace 5 min', 'm14');
    note('No', 'camion', 'Un camión va hacia tu reporte', 'El camión 07 pasará por Jr. Elías Aguirre 220 hoy a las 10:30.', 'Hace 1 h');
    await group('Esta semana');
    note('Sí', 'estrella', 'Ganaste la insignia «Vecino activo»', 'Llevas 10 reportes enviados. ¡Gracias por cuidar tu barrio!', 'Lun 6 oct', 'm16');
    note('Sí', 'check', 'Reporte resuelto: llantas en la vereda', 'El equipo municipal retiró los residuos de Av. Salaverry 1205.', 'Sáb 4 oct');
    note('Sí', 'info', 'Nuevo horario de recolección en tu zona', 'Desde el lunes, el camión pasará de 06:00 a 08:00 en Cercado de Chiclayo.', 'Jue 2 oct');
    grow(f);
    put(f, I('Indicador de inicio'));
  }

  // ---------- Perfil ----------
  {
    const f = mobileScreen('m16', '16 · Perfil', 1200);
    put(f, statusbar());
    const c = AL('V', { name: 'Contenido', gap: 20, px: 20 }); c.paddingTop = 8; put(f, c);
    const top = AL('H', { name: 'Encabezado', justify: 'SPACE_BETWEEN', align: 'CENTER' }); put(c, top);
    add(top, await T('Mi perfil', 'Título/L', 'texto/principal'), ibtn('Suave', 'ajustes'));
    const who = AL('V', { name: 'Vecino', gap: 6, align: 'CENTER' }); put(c, who);
    add(who, I('Avatar', { 'Tamaño': 'XL' }), await T('Alex Rivera', 'Título/M', 'texto/principal'), await T('Vecino de Cercado de Chiclayo · desde marzo de 2026', 'Cuerpo/S', 'texto/secundario'));
    const pc = AL('V', { name: 'Puntos verdes', gap: 12, px: 20, py: 20, r: 20, fill: 'fondo/marca' });
    await shadow(pc, 'Sombra/Botón marca'); put(c, pc);
    const pr = AL('H', { name: 'Cabecera', justify: 'SPACE_BETWEEN', align: 'MIN' }); put(pc, pr);
    const pv = AL('V', { gap: 2 }); add(pv, await T('Puntos verdes', 'Cuerpo/S', 'texto/inverso'), await T('1 250', 'Dato/L', 'texto/inverso'));
    const lvl = AL('H', { name: 'Nivel', px: 10, py: 4, r: 999, fill: 'fondo/superficie' }); add(lvl, await T('Nivel 3 · Guardián del barrio', 'Etiqueta/S', 'texto/marca-oscuro'));
    add(pr, pv, lvl);
    const track = AL('H', { name: 'Progreso', h: 8, r: 999, fill: 'fondo/marca-hover' }); put(pc, track);
    add(track, rect(230, 8, 'fondo/superficie', 999, 'Avance'));
    const pn = await T('Te faltan 250 puntos para llegar al nivel 4', 'Cuerpo/S', 'texto/inverso'); add(pc, pn); wrap(pn);
    const ms = AL('H', { name: 'Métricas', gap: 12 }); put(c, ms);
    for (const [v, l] of [['12', 'Reportes'], ['9', 'Resueltos'], ['340 kg', 'Recolectados']]) { const m = I('Métrica', { Valor: v, Etiqueta: l }); add(ms, m); m.layoutSizingHorizontal = 'FILL'; }
    const ac = AL('V', { name: 'Insignias', gap: 12 }); put(c, ac);
    put(ac, await sectionTitle('Mis insignias', await T('Ver todas', 'Etiqueta/M', 'texto/marca')));
    const ar = AL('H', { name: 'Logros', justify: 'SPACE_BETWEEN' }); put(ac, ar);
    for (const [l, ic, on] of [['Primer reporte', 'hoja', true], ['Vecino activo', 'estrella', true], ['Ojo atento', 'ojo', true], ['Guardián verde', 'escudo', false]]) {
      const a = I('Logro', { Desbloqueado: on ? 'Sí' : 'No', Etiqueta: l, Icono: ic }); recolor(nested(a, 'Icono'), on ? 'texto/marca' : 'texto/terciario'); add(ar, a);
    }
    const st = AL('V', { name: 'Ajustes', r: 16, fill: 'fondo/superficie', stroke: 'borde/predeterminado', clip: true }); put(c, st);
    for (const [t, d, ic, target] of [['Datos personales', 'Nombre, correo y distrito', 'usuario'], ['Notificaciones', 'Avisos de tus reportes y rutas', 'campana', 'm15'], ['Privacidad y seguridad', 'Contraseña y permisos', 'escudo'], ['Ayuda y soporte', 'Preguntas frecuentes y contacto', 'info']]) {
      const r = I('Fila de lista', { 'Título': t, 'Descripción': d, Icono: ic }); put(st, r); if (target) link(r, target);
    }
    const lo = AL('H', { name: 'Cerrar sesión', gap: 8, justify: 'CENTER', align: 'CENTER', py: 16 }); strokeSides(lo, 'borde/predeterminado', { t: 1 }); put(st, lo);
    add(lo, icon('salir', 18, 'acento/peligro'), await T('Cerrar sesión', 'Etiqueta/M', 'acento/peligro')); link(lo, 'm04');
    grow(f);
    const nav = navbar('Perfil'); put(f, nav); linkTabs(nav);
  }
}

async function buildMobileScreens() {
  await buildAccessScreens();
  await buildReportScreens();
  await buildTrackingScreens();
}

// ---- 50-admin-screens.js ----
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

// ---- 90-main.js ----
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
