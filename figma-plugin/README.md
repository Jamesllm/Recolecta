# Recolecta+ · Generador de diseño v2 (plugin de Figma)

Este plugin construye dentro del archivo de Figma **Recolecta+** el sistema de diseño y todas las pantallas v2:

- **Fundamentos:** variables (`Primitivos`, `Color`, `Dimensiones`), 14 estilos de texto y 4 sombras. Si ya existen, los reutiliza.
- **Componentes con variantes y propiedades:** botón, botón de icono, insignia, campo de texto, selector, búsqueda, casilla, interruptor, avatar, logotipo, aviso, barra de estado, navegación inferior, encabezado, progreso de pasos, pin de mapa, tarjetas (reporte, tipo de residuo, tamaño, zona, clúster, camión, indicador), notificación, línea de seguimiento, menú lateral, barra superior y tabla de incidentes. También usa 57 iconos: reutiliza los 55 que ya estaban en el archivo y añade los que falten.
- **16 pantallas móviles**, en tres secciones:
  - Bienvenida y acceso: 3 pantallas de bienvenida, iniciar sesión, crear cuenta y recuperar contraseña.
  - Reportar residuos: mapa, detalle de un punto, paso 1, ajustar ubicación, paso 2 y reporte enviado.
  - Seguimiento y perfil: mis reportes, detalle con línea de tiempo, notificaciones y perfil.
- **8 pantallas del panel administrador rediseñado:** acceso, panel general, incidentes, detalle de incidente, rutas con IA, flota, análisis y configuración.
- **Prototipo navegable** con dos puntos de inicio: «App móvil · Vecino» y «Panel administrador».

Todo el texto está en español, y los datos (códigos `#RL-…`, direcciones de Chiclayo, fechas y estados) coinciden entre la app y el panel.

## Cómo ejecutarlo

1. Abre la **app de escritorio de Figma**. Los plugins en desarrollo no funcionan en el navegador.
2. Abre el archivo **Recolecta+**.
3. Ve a **Menú → Plugins → Desarrollo → Importar plugin desde manifiesto…** y elige `figma-plugin/manifest.json`.
4. Ejecútalo desde **Plugins → Desarrollo → Recolecta+ · Generador de diseño v2**.
5. Tarda uno o dos minutos. Al terminar aparece un mensaje con el número de pantallas, componentes y enlaces creados.

Si algo falla, el mensaje indica en qué etapa ocurrió. El detalle completo está en **Plugins → Desarrollo → Mostrar/ocultar consola**.

## Qué toca y qué no

- Solo usa 3 páginas, que es el máximo del plan Starter:
  - `🧩 Fundamentos y componentes`
  - `📱🖥️ Pantallas v2`
  - `🗄️ Archivo v1 (original)`, que conserva intactas las pantallas originales.
- Puedes ejecutarlo varias veces. Cada ejecución **vacía** las páginas `Pantallas v2` y `Fundamentos y componentes` y las vuelve a construir; en esta última conserva la sección «Iconos». No toca el archivo v1, las variables ni los estilos.
- Por eso, los cambios que hagas a mano en esas dos páginas se perderán si lo vuelves a ejecutar. Edita el código del generador o trabaja sobre una copia del archivo.

## Editar el generador

El código fuente está en `src/`, dividido por módulos:

| Archivo | Contenido |
|---|---|
| `00-core.js` | Utilidades, variables y estilos |
| `05-icons.js` | Iconos |
| `10-base.js` | Componentes base |
| `20-mobile-components.js` | Componentes de la app móvil |
| `30-admin-components.js` | Componentes del panel |
| `40-mobile-screens.js` | Pantallas móviles |
| `50-admin-screens.js` | Pantallas del panel |
| `90-main.js` | Organización y prototipo |

Después de editar, regenera `code.js`:

```bash
node build.js
```
