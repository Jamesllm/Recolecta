# Sprint 2 · Criterios de aceptación

Historias del Sprint 2 según el Product Backlog del APF2: **US-01** (3 SP), **US-05** (5 SP) y **US-06** (5 SP), 13 SP en total.

Cada criterio sigue el formato **Dado / Cuando / Entonces** y cumple cuatro reglas:

1. Describe **un solo comportamiento** que se puede comprobar en la app o en el panel.
2. El **Entonces** dice qué ve el usuario (textos, pantallas, cantidades), no cómo está programado.
3. Usa **valores concretos** (8 caracteres, 30 minutos, «Últimos 7 días») en lugar de «rápido» o «válido».
4. Incluye los **casos de error** importantes, no solo el camino feliz.

El número entre paréntesis es la pantalla del prototipo en Figma (APF2, Tabla 17).

**Estado al 11/11/2026:** ✅ Hecho · 🟡 Parcial · ⏳ Pendiente

---

## US-01 · Registro e inicio de sesión del ciudadano

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-01 | E1 · Cuenta y acceso | Media | 3 | Sprint 2 |

**Como** ciudadano, **quiero** crear una cuenta con mi nombre, correo, contraseña y distrito, e iniciar sesión cuando lo necesite, **para** guardar mis reportes, hacerles seguimiento y recibir avisos de su atención.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el ciudadano está en «Crear cuenta» (05) sin sesión iniciada | ingresa su nombre completo, un correo que no está registrado, una contraseña de al menos 8 caracteres con una letra y un número, elige su departamento, provincia y distrito, marca «Acepto los Términos de uso y la Política de privacidad» y toca «Crear cuenta» | el sistema crea la cuenta, inicia la sesión, muestra «¡Bienvenido a Recolecta+, [nombre]!» y abre la pantalla de inicio (07) | ✅ |
| 2 | el ciudadano está en «Crear cuenta» (05) | toca «Crear cuenta» con un dato inválido (por ejemplo, una contraseña sin números, sin aceptar los términos o con un correo ya registrado) | el sistema no crea la cuenta y muestra el error debajo del campo, por ejemplo «Mínimo 8 caracteres, con al menos una letra y un número.» o «Este correo ya está registrado.» | ✅ |
| 3 | el ciudadano ya tiene una cuenta | en «Iniciar sesión» (04) ingresa su correo y su contraseña y toca «Iniciar sesión» | accede a la pantalla de inicio (07) con su sesión iniciada, y los reportes que envió como invitado desde ese teléfono pasan a su cuenta | ✅ |
| 4 | el ciudadano está en «Iniciar sesión» (04) | ingresa un correo o una contraseña incorrectos y toca «Iniciar sesión» | ve el mensaje «Correo o contraseña incorrectos.» y sigue en la misma pantalla sin sesión iniciada | ✅ |
| 5 | el ciudadano olvidó su contraseña | toca «¿Olvidaste tu contraseña?», escribe su correo y toca «Enviar enlace» (06) | la app muestra «Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña» y, si la cuenta existe, el sistema envía a ese correo un enlace que caduca en 30 minutos | ✅ |
| 6 | el ciudadano abrió el enlace del correo antes de que caduque | escribe dos veces una nueva contraseña válida y toca «Guardar contraseña» | ve «Tu contraseña se actualizó», puede iniciar sesión solo con la nueva contraseña, y si vuelve a abrir el mismo enlace ve «El enlace caducó o ya se usó» | ✅ |
| 7 | la regla «Enviar correo de bienvenida al crear una cuenta» está activa en «Configuración» (A8) | el ciudadano crea su cuenta (criterio 1) | recibe en su correo el mensaje «¡Bienvenido a Recolecta+!», que explica cómo reportar y cómo le llegarán los avisos | 🟡 |

**Notas**
- Criterio 5: verificado con Gmail (el correo de recuperación llega).
- Criterio 7 (🟡): el correo se envía al registrarse; falta comprobar que llegue con una cuenta de correo real.
- El mensaje del criterio 5 es el mismo exista o no la cuenta, para no revelar qué correos están registrados.
- Para abrir el enlace desde el teléfono, `PUBLIC_URL` debe apuntar a la IP de la PC en la red Wi-Fi.

---

## US-05 · Filtros y revisión de incidentes

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-05 | E4 · Gestión municipal | Media | 5 | Sprint 2 |

**Como** gestor municipal, **quiero** buscar y filtrar los incidentes por categoría, urgencia, estado y fecha, y revisar el detalle de cada uno, **para** decidir qué reportes asignar a una ruta de recolección.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el gestor está en «Incidentes» (A3) | escribe en la búsqueda (código, dirección, descripción, categoría o nombre del vecino) o elige la categoría, la urgencia, el estado o el periodo («Hoy», «Últimos 7 días» o «Últimos 30 días») | la tabla se actualiza al momento y muestra solo los incidentes que cumplen todos los criterios a la vez, y el pie indica cuántos quedan, por ejemplo «Mostrando 1 a 6 de 70 reportes (filtrados de 403)» | ✅ |
| 2 | el gestor aplicó filtros | ningún incidente cumple los criterios | la tabla muestra «No se encontraron incidentes que coincidan con los filtros.» | ✅ |
| 3 | el gestor aplicó uno o más filtros | toca «Limpiar filtros» | todos los filtros vuelven a su valor inicial y la tabla muestra la lista completa | ✅ |
| 4 | la tabla muestra incidentes | el gestor toca «Ver detalle» de uno de ellos | se abre un panel lateral (A4) con la foto, el estado, la urgencia, la categoría, el tamaño estimado, la dirección, las coordenadas, quién lo reportó («Invitado» si no tiene cuenta), las confirmaciones «Sigue ahí», el clúster sugerido por K-Means, la línea de seguimiento con la fecha de cada paso y las acciones «Asignar a ruta», «Marcar como resuelto» y «Rechazar» | ✅ |
| 5 | el gestor seleccionó uno o más incidentes en la tabla | revisa la barra de selección | la barra indica cuántos seleccionó («2 incidentes seleccionados») y ofrece «Cambiar estado…», «Asignar a ruta» y «Quitar selección» | ✅ |
| 6 | el gestor tiene incidentes seleccionados | toca «Asignar a ruta» o elige un estado en «Cambiar estado…» | todos los incidentes seleccionados cambian de estado, el panel confirma cuántos cambiaron (por ejemplo, «2 de 2 incidentes pasaron a «En ruta».») y la selección se limpia | ✅ |
| 7 | el gestor revisa en el detalle (A4) un incidente «Pendiente» o «En ruta» que no corresponde atender | toca «Rechazar», elige un motivo de la lista (reporte duplicado, la foto no muestra residuos, fuera del distrito, el punto ya estaba limpio o contenido inapropiado) y toca «Confirmar rechazo» | el incidente pasa a «Rechazado» con su motivo, deja de verse en el mapa de los vecinos, en el mapa de calor y en las rutas, y no se cuenta entre los incidentes abiertos. «Confirmar rechazo» no se activa hasta elegir un motivo | ✅ |

**Notas**
- El detalle también permite «Volver a «Pendiente»» si un incidente se asignó o se rechazó por error.
- «Rechazar» solo está en el detalle y no en la barra de selección, porque exige elegir un motivo para cada reporte.

---

## US-06 · Avisos sobre mis reportes

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-06 | E3 · Seguimiento ciudadano | Media | 5 | Sprint 2 |

**Como** ciudadano, **quiero** recibir avisos en la app y por correo cuando cambie el estado de mis reportes, **para** saber si ya fueron atendidos o están en proceso.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el ciudadano envió un reporte con su sesión iniciada | el municipio cambia el estado de ese reporte en el panel (a «En ruta», a «Resuelto», a «Rechazado» o de vuelta a «Pendiente») | se crea un aviso no leído y la campana del mapa (07) muestra la cantidad de avisos sin leer (hasta «9+») como máximo 30 segundos después, o en cuanto el ciudadano vuelve al mapa | ✅ |
| 2 | el ciudadano tiene avisos | toca la campana y abre «Notificaciones» (15) | ve sus avisos del más reciente al más antiguo, agrupados en «Hoy», «Esta semana» y «Anteriores», con los no leídos resaltados con un punto verde | ✅ |
| 3 | el ciudadano está en «Notificaciones» (15) | toca el aviso de uno de sus reportes | el aviso pasa a leído, baja el número de la campana y se abre el «Detalle del reporte» (14) con su línea de seguimiento: reporte recibido, agrupado en una zona prioritaria, asignado a una ruta y recolectado, con la fecha de cada paso cumplido | ✅ |
| 4 | el ciudadano tiene avisos sin leer | toca «Marcar leídas» en «Notificaciones» (15) | todos sus avisos pasan a leídos y la campana deja de mostrar el número | ✅ |
| 5 | la regla «Avisar al vecino por correo cuando se resuelva su reporte» está activa en «Configuración» (A8) | un reporte del ciudadano pasa a «Resuelto» | además del aviso en la app, el ciudadano recibe en el correo de su cuenta el mensaje «Tu reporte RL-XXXX fue atendido» | 🟡 |
| 6 | el municipio aplica a un reporte el estado que ya tenía, o el reporte se envió como invitado | guarda el cambio | no se genera ningún aviso (no hay avisos duplicados ni avisos para quien no tiene cuenta) | ✅ |

**Notas**
- Criterio 5 (🟡): el correo se envía solo al pasar a «Resuelto» y la regla se activa o desactiva en «Configuración» (A8). Falta comprobar que llegue con una cuenta de correo real.
- Si el reporte se rechaza, el aviso dice «Tu reporte RL-XXXX no fue aceptado» con el motivo, y el detalle (14) muestra «Rechazado por el municipio» en la línea de seguimiento.
- El invitado no recibe avisos (no hay a quién enviarlos), pero sigue viendo el estado de sus reportes en «Mis reportes».

---

## Cambios respecto a las fichas del APF2 (para la sección 1.1)

Son propuestas que debe aprobar el Product Owner antes de llevarlas al informe:

1. **Más criterios por historia** (de 3 a 6, y 7 en la US-05): se agregaron los casos de error (datos inválidos, credenciales incorrectas, búsqueda sin resultados, avisos duplicados), que antes no estaban cubiertos.
2. **US-06, criterio de la línea de seguimiento:** el paso «validación del municipio» se reemplazó por «agrupado en una zona prioritaria», porque el sistema no tiene un paso de validación y sí agrupa cada reporte con K-Means (US-04).
3. **US-06, aviso por correo:** se mantiene como en el APF2: depende de la regla «Avisar al vecino cuando se resuelva su reporte» de «Configuración» (A8). Para cumplirlo se adelantó esa parte de la pantalla A8, que pertenece a la US-10 (Sprint 3).
5. **US-01, correo de bienvenida (criterio 7):** no estaba en el APF2. Se agregó porque, al probar el registro, el equipo esperaba recibir un correo.
4. **US-05, «Rechazar»:** el APF2 solo la nombraba como acción del detalle. Ahora tiene su propio criterio (7): pide un motivo de una lista fija y avisa al vecino.

## Lo que falta para cerrar el Sprint 2

| Historia | Pendiente | Qué se necesita |
|---|---|---|
| US-01 y US-06 | Comprobar que llegan el correo de bienvenida y el de «Resuelto» | Crear una cuenta con un correo real y resolver uno de sus reportes |
| Todas | Verificar los criterios con un usuario y pasar las tareas a «Listo» en Jira | Lo hace el equipo (Definición de Terminado) |

---

## Trabajo adelantado del Sprint 3 y mejoras (no suman a la velocity del Sprint 2)

Se hizo durante el Sprint 2 a pedido del Product Owner. En el informe conviene presentarlo aparte para que la velocity del Sprint 2 siga contando solo US-01, US-05 y US-06.

| Pantalla | Historia | Qué incluye | Qué falta |
|---|---|---|---|
| A5 · Rutas con IA | Mejora de US-04 | Ruta por calles y avenidas con OSRM (OpenStreetMap): orden de paradas por distancia real, distancia y tiempo estimado (manejo + 3 min por parada) y asignación de camión | El servidor público de OSRM es de demostración; para uso real se instala uno propio (`OSRM_URL`) |
| A7 · Análisis | US-09 (Sprint 3) | Periodos de 7, 30 y 90 días; reportes recibidos, tiempo medio de resolución, toneladas recolectadas y vecinos participantes con su variación frente al periodo anterior; serie por día o semana; desglose por categoría y estado; cumplimiento (atendidos en 48 h o menos) y ranking de zonas | Validar los indicadores con el Product Owner |
| A6 · Flota | Sin historia (pantalla complementaria) | Registro de camiones (placa, conductor, capacidad), estados disponible / en ruta / mantenimiento, ruta asignada y capacidad usada. Seguimiento en tiempo real: el camión sale de la base de la flota (Configuración) y el mapa muestra la salida, el tramo recorrido, el que falta, la próxima parada, la velocidad y la hora estimada. Si el conductor tiene cuenta (rol «conductor», creada desde Flota) e inicia la ruta en la app («Mi ruta»), la posición es su GPS real y él marca «Recogido» en cada parada; si no, el recorrido se simula a 25 km/h con 3 min por parada | Crear las historias de usuario en el Product Backlog (seguimiento de la flota y perfil del conductor); GPS en segundo plano con una build propia de la app |
| A8 · Configuración | US-10 (Sprint 3), en parte | Parámetros de K-Means (K máximo y ponderación), reglas de correo y resumen de usuarios | Inicio de sesión del panel, roles (administrador, inspector, conductor) e «Invitar usuario» |
