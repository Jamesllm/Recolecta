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
