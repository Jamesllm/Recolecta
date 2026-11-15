# Sprint 2 · Criterios de aceptación

El Sprint 2 se planificó con tres historias del Product Backlog del APF2, que suman **13 SP**:

- **US-01** (3 SP)
- **US-05** (5 SP)
- **US-06** (5 SP)

Durante el sprint, el Product Owner amplió el alcance con seis historias nuevas de la épica **E5 · Operación de la flota**, de **US-11** a **US-16**, que suman **29 SP** (ver «Ampliación del Sprint 2»). El total del sprint es **42 SP**.

Cada criterio sigue el formato **Dado / Cuando / Entonces** y cumple cuatro reglas:

1. Describe **un solo comportamiento** que se puede comprobar en la app o en el panel.
2. El **Entonces** dice qué ve el usuario (textos, pantallas, cantidades), no cómo está programado.
3. Usa **valores concretos** (8 caracteres, 30 minutos, «Últimos 7 días») en lugar de «rápido» o «válido».
4. Incluye los **casos de error** importantes, no solo el camino feliz.

El número entre paréntesis es la pantalla del prototipo en Figma (APF2, Tabla 17). Las pantallas del conductor (C1 a C3) son nuevas.

**Estado al 14/11/2026:** ✅ Hecho · 🟡 Parcial · ⏳ Pendiente

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
| 7 | la regla «Enviar correo de bienvenida al crear una cuenta» está activa en «Configuración» (A8) | el ciudadano crea su cuenta (criterio 1) | recibe en su correo el mensaje «¡Bienvenido a Recolecta+!», que explica cómo reportar y cómo le llegarán los avisos | ✅ |

**Notas**
- Criterio 5: verificado con Gmail (el correo de recuperación llega).
- Criterio 7: verificado el 14/11/2026 por el Product Owner con una cuenta de correo real.
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
| 5 | la regla «Avisar al vecino por correo cuando se resuelva su reporte» está activa en «Configuración» (A8) | un reporte del ciudadano pasa a «Resuelto» | además del aviso en la app, el ciudadano recibe en el correo de su cuenta el mensaje «Tu reporte RL-XXXX fue atendido» | ✅ |
| 6 | el municipio aplica a un reporte el estado que ya tenía, o el reporte se envió como invitado | guarda el cambio | no se genera ningún aviso (no hay avisos duplicados ni avisos para quien no tiene cuenta) | ✅ |

**Notas**
- Criterio 5: verificado el 14/11/2026 por el Product Owner con una cuenta de correo real. El correo se envía solo al pasar a «Resuelto» y la regla se activa o desactiva en «Configuración» (A8).
- Si el reporte se rechaza, el aviso dice «Tu reporte RL-XXXX no fue aceptado» con el motivo, y el detalle (14) muestra «Rechazado por el municipio» en la línea de seguimiento.
- El invitado no recibe avisos (no hay a quién enviarlos), pero sigue viendo el estado de sus reportes en «Mis reportes».

---

## Ampliación del Sprint 2 · E5 · Operación de la flota

A mitad del Sprint 2 el Product Owner sumó seis historias nuevas. Todas son de la épica nueva **E5 · Operación de la flota**, que cubre a quien asigna los camiones y a quien los maneja:

- **US-11** (3 SP): registrar los camiones de la flota.
- **US-12** (8 SP): asignar un camión a una zona y seguir su recorrido en vivo.
- **US-13** (2 SP): modo kiosko del panel general.
- **US-14** (3 SP): dar acceso a la app al conductor.
- **US-15** (8 SP): «Mi ruta», iniciar la ruta y compartir la ubicación.
- **US-16** (5 SP): marcar las paradas recogidas y terminar la ruta.

Suman **29 SP**. Los SP son una propuesta según lo que costó construir cada historia; el equipo los confirma en el Planning Poker.

| ID | Historia | Rol | SP | Por qué ese tamaño |
|---|---|---|---|---|
| US-11 | Registrar los camiones de la flota | Gestor municipal | 3 | Un formulario con validaciones y una tabla con estados |
| US-12 | Asignar un camión a una zona y seguir su recorrido en vivo | Gestor municipal | 8 | Ruta por calles (OSRM), simulación en tiempo real, mapa en vivo con paradas y la base de la flota |
| US-13 | Modo kiosko del panel general | Gestor municipal | 2 | Reutiliza el mapa y los indicadores; solo cambia lo que se muestra |
| US-14 | Dar acceso a la app al conductor | Gestor municipal | 3 | Rol nuevo, cuenta con contraseña temporal y enlace con el camión |
| US-15 | «Mi ruta»: iniciar la ruta y compartir mi ubicación | Conductor | 8 | Pantalla nueva en la app, GPS del teléfono y proyección sobre la ruta |
| US-16 | Marcar las paradas recogidas y terminar la ruta | Conductor | 5 | Acciones sobre cada parada, casos de error y cierre de la ruta |

Los códigos de pantalla con «C» (C1 a C3) son nuevos, porque el prototipo del APF2 no tenía pantallas para el conductor. Hay que agregarlos a la tabla de pantallas del informe:

- **C1:** «Mi ruta» sin ruta asignada.
- **C2:** «Mi ruta» lista para salir.
- **C3:** «Mi ruta» en curso.

---

## US-11 · Registrar los camiones de la flota

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-11 | E5 · Operación de la flota | Media | 3 | Sprint 2 (ampliación) |

**Como** gestor municipal, **quiero** registrar los camiones de recolección con su placa, conductor y capacidad, y cambiar su estado, **para** saber con qué camiones cuento antes de asignar las rutas.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el gestor está en «Flota de recogida» (A6) | toca «Registrar camión», ingresa una placa con el formato ABC-123 o A1B-234, el conductor (opcional) y una capacidad entre 0,1 y 40 toneladas, y toca «Registrar» | el camión aparece en «Camiones registrados» con el estado «Disponible». El panel muestra «Camión ABC-123 registrado.» y los indicadores «Camiones», «Disponibles» y «Capacidad total» se actualizan | ✅ |
| 2 | el gestor llena el formulario de «Registrar camión» | ingresa una placa con otro formato, una capacidad fuera del rango o una placa que ya existe | el camión no se registra y el error aparece debajo del campo: «Ingrese una placa válida, por ejemplo ABC-123.», «La capacidad debe estar entre 0,1 y 40 toneladas.» o «Esta placa ya está registrada.» | ✅ |
| 3 | un camión está «Disponible» o «En ruta» | el gestor toca el botón de mantenimiento (llave) de ese camión | el camión pasa a «En mantenimiento», deja la ruta que tenía asignada y no se puede asignar a una zona hasta que el gestor toque «Disponible» | ✅ |
| 4 | el camión ya no forma parte de la flota | el gestor toca «Eliminar» y confirma «¿Eliminar el camión ABC-123?» | el camión desaparece de la tabla y el panel muestra «Camión ABC-123 eliminado.» | ✅ |

**Notas**
- La placa se guarda en mayúsculas y con guion: «abc123» queda como «ABC-123».

---

## US-12 · Asignar un camión a una zona y seguir su recorrido en vivo

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-12 | E5 · Operación de la flota | Alta | 8 | Sprint 2 (ampliación) |

**Como** gestor municipal, **quiero** asignar un camión a una zona prioritaria y ver en el mapa por dónde va, a qué velocidad y qué paradas le faltan, **para** controlar la recolección sin llamar al conductor.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el gestor está en «Configuración» (A8), en «Base de la flota» | hace clic en el mapa, escribe el nombre del punto (por ejemplo, «Depósito municipal») y toca «Guardar base» | los camiones que se asignen desde ese momento salen de ese punto. Si no hay base, salen de la primera parada de la ruta y «Flota de recogida» (A6) muestra «Aún no hay base de la flota: los camiones salen de la primera parada de su ruta.» | ✅ |
| 2 | hay un camión «Disponible» y una zona activa sin camión | el gestor la elige en «Asignar a zona…» (A6), o elige el camión en la tarjeta de la zona del panel general (A1) y toca «Asignar camión a la ruta» | el camión pasa a «En ruta» y los reportes «Pendientes» de la zona pasan a «En ruta», con aviso a sus vecinos (US-06). El panel muestra, por ejemplo, «Camión ABC-123 asignado a la ruta C-11; 58 reportes pasaron a «En ruta».» | ✅ |
| 3 | el gestor intenta asignar un camión | la zona ya tiene otro camión o el camión está en mantenimiento | la asignación no se hace y el panel muestra «La ruta ya tiene asignado el camión ABC-123.» o «El camión ABC-123 está en mantenimiento.» | ✅ |
| 4 | un camión está «En ruta» | el gestor abre «Flota de recogida» (A6) o el panel general (A1) | el mapa muestra el camión con su placa y su velocidad (por ejemplo, «ABC-123 · 25 km/h»), la salida, el tramo recorrido en gris y el que falta en azul por calles y avenidas, y todas las paradas en orden: numeradas, la próxima en azul, las recogidas con un check verde y las saltadas atenuadas. La posición se actualiza cada 3 segundos sin recargar | ✅ |
| 5 | un camión está «En ruta» | el gestor revisa la tarjeta del camión en «Camiones en ruta» (A6) o en «En ruta ahora» (A1) | ve si va «En camino» o «Recogiendo», los kilómetros recorridos del total («2,0 km de 12,5 km»), su velocidad («0 km/h» en ámbar si está detenido), las paradas recogidas («6/58 paradas»), de dónde salió y a qué hora, y la próxima parada con su hora estimada de llegada. En el panel general, al tocar el camión el mapa va hacia él | ✅ |
| 6 | el camión asignado no tiene conductor con cuenta en la app (US-14) | pasa el tiempo | el recorrido se simula: el camión avanza por la ruta a 25 km/h y se detiene 3 minutos en cada parada, y esa parada pasa a «Resuelto» con aviso al vecino. Al terminar, el camión vuelve a «Disponible» y el mapa lo muestra como «Ruta completada» durante 1 hora | ✅ |
| 7 | el camión asignado sí tiene conductor con cuenta (US-14) y este aún no inicia la ruta | el gestor revisa «Camiones en ruta» (A6) | el camión sigue en la salida, con la etiqueta «Esperando que el conductor inicie la ruta». Desde que el conductor pulsa «Iniciar ruta» (US-15), la etiqueta cambia a «GPS del conductor» | ✅ |
| 8 | el gestor está viendo cualquier mapa del panel | toca el botón de capas y elige «Calles», «Claro», «Relieve», «Satélite» u «Oscuro» | el mapa cambia de estilo («Satélite» lleva los nombres de las calles encima) y el navegador recuerda la elección para la próxima vez | ✅ |
| 9 | un camión está «En ruta» | el gestor toca «Detener y liberar» (A6) | el camión vuelve a «Disponible» sin ruta y deja de verse en el mapa en vivo | ✅ |

**Notas**
- La ruta por calles se calcula con el servidor público de OSRM, que es de demostración. Para un uso real se instala un servidor propio (`OSRM_URL`).
- El orden de las paradas lo da OSRM: sale de la base y termina en la parada más lejana.
- Criterio 9: los reportes del camión liberado siguen «En ruta», para asignarlos a otro camión.

---

## US-13 · Modo kiosko del panel general

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-13 | E5 · Operación de la flota | Baja | 2 | Sprint 2 (ampliación) |

**Como** gestor municipal, **quiero** mostrar en una pantalla fija de la central solo el mapa con los camiones en vivo y los indicadores clave, **para** que el equipo siga la recolección de un vistazo sin manipular el panel.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el gestor está en el panel general (A1) | toca «Modo kiosko» | el panel pasa a pantalla completa y oculta el menú lateral, la búsqueda, la tarjeta de la zona y la hoja de zonas. Quedan el mapa, la hora, cuatro indicadores («abiertos», «críticos sin asignar», «camiones en ruta» y «recolectado hoy»), la tarjeta «En ruta ahora» y la leyenda del mapa | ✅ |
| 2 | el panel está en modo kiosko y hay camiones en ruta | se abre el modo o cambia la cantidad de camiones en ruta | el mapa dibuja los recorridos de todos los camiones a la vez y se encuadra sobre ellos. Si no hay camiones, se encuadra sobre las zonas y la tarjeta dice «No hay camiones en ruta en este momento.» | ✅ |
| 3 | la pantalla de la central abre la dirección del panel con `?kiosko=1` | carga la página | el panel abre directamente en modo kiosko | ✅ |
| 4 | el panel está en modo kiosko | el gestor toca «Salir» o pulsa la tecla Esc | el panel vuelve a su vista normal con todas las opciones | ✅ |
| 5 | el panel queda abierto en modo kiosko | pasa el tiempo | los camiones se actualizan cada 3 segundos. Los indicadores se actualizan cada 45 segundos y cada vez que un camión recoge una parada | ✅ |

**Notas**
- Criterio 3: el navegador no permite abrir en pantalla completa sin que alguien toque la pantalla. En una pantalla fija se usa el modo quiosco del propio navegador (por ejemplo, `chrome --kiosk`).

---

## US-14 · Dar acceso a la app al conductor

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-14 | E5 · Operación de la flota | Alta | 3 | Sprint 2 (ampliación) |

**Como** gestor municipal, **quiero** crear la cuenta del conductor de cada camión desde la flota, **para** que él vea su ruta en la app y la central reciba su ubicación real.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | un camión de «Flota de recogida» (A6) no tiene cuenta de conductor | el gestor toca «Dar acceso a la app», ingresa el nombre y el correo del conductor y toca «Crear acceso» | se crea una cuenta con el rol de conductor, enlazada a ese camión. El panel muestra **una sola vez** el correo y una contraseña temporal de 8 letras y 2 números, con el botón «Copiar datos», y la columna «Conductor» muestra el correo con un ícono de teléfono | ✅ |
| 2 | el gestor llena «Dar acceso a la app» | usa un correo inválido, el correo de un vecino o de un gestor, el de un conductor de otro camión, o el camión ya tiene cuenta | no se crea la cuenta y el panel muestra «Ingrese un correo válido.», «Ese correo ya es de una cuenta de vecino o de gestor.», «Esa cuenta ya conduce el camión ABC-123.» o «El camión ABC-123 ya tiene la cuenta …» | ✅ |
| 3 | el conductor perdió su contraseña temporal | el gestor toca «Nueva contraseña» y confirma | el panel muestra una contraseña temporal nueva y la anterior deja de funcionar | ✅ |
| 4 | el conductor deja de manejar ese camión | el gestor toca «Quitar acceso» y confirma | la cuenta deja de estar enlazada al camión, y en la app el conductor ve «Tu cuenta aún no tiene camión» | ✅ |
| 5 | el conductor recibió su correo y su contraseña | inicia sesión en la app (04) | la app abre «Mi ruta» (C1) en lugar de las pestañas del vecino, y no le muestra las opciones para reportar. Una cuenta de vecino no puede abrir «Mi ruta» | ✅ |

**Notas**
- La contraseña temporal no se envía por correo: el gestor la entrega al conductor. El conductor puede cambiarla con «¿Olvidaste tu contraseña?» (US-01, criterios 5 y 6).
- Las cuentas de conductor se registran en el distrito de Chiclayo (`140101`), porque toda cuenta necesita un distrito. Se cambia con `DRIVER_UBIGEO` en `backend/.env`.

---

## US-15 · «Mi ruta»: iniciar la ruta y compartir mi ubicación

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-15 | E5 · Operación de la flota | Alta | 8 | Sprint 2 (ampliación) |

**Como** conductor de un camión de recolección, **quiero** ver en la app las paradas de mi ruta en orden e iniciarla compartiendo mi ubicación, **para** saber a dónde ir y que la central sepa dónde estoy sin llamarme.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | el conductor inició sesión y su camión no tiene una ruta asignada | abre «Mi ruta» (C1) | ve «Sin ruta asignada», con la explicación «Cuando la central asigne tu camión a una zona, verás aquí las paradas en orden y podrás iniciar la ruta.» y el botón «Actualizar» | ✅ |
| 2 | el panel asignó una zona a su camión (US-12) | el conductor abre «Mi ruta» (C2) | ve el mapa con el recorrido y las paradas numeradas, la zona, el avance («0/58 paradas · 0,0 km de 12,5 km · sale de Depósito municipal») y el botón «Iniciar ruta». La ruta aparece sola como máximo 10 segundos después de asignarla | ✅ |
| 3 | el conductor está en «Mi ruta» (C2) con una ruta asignada | toca «Iniciar ruta», confirma y permite el acceso a su ubicación | la app muestra «Compartiendo ubicación · hace N s · ±N m» y envía su posición cada 5 segundos. En el panel (A1 y A6), el camión se mueve con su posición real, con la etiqueta «GPS del conductor» y su velocidad real | ✅ |
| 4 | el conductor tocó «Iniciar ruta» | no permite el acceso a su ubicación | la app muestra «Sin permiso de ubicación: la central no puede ver tu camión. Actívalo en los ajustes del teléfono.» | ✅ |
| 5 | la ruta está en curso (C3) | el conductor se aleja más de 80 m del recorrido | la app muestra «Estás a N m de la ruta. Vuelve al recorrido azul para que el avance se registre.», el panel muestra «Fuera de ruta · N m» y el avance no sube hasta que vuelva a la ruta | ✅ |
| 6 | la ruta está en curso | el panel deja de recibir la ubicación por más de 60 segundos (sin señal o con la app cerrada) | el panel muestra «GPS sin señal hace N min» y la velocidad en 0 km/h | ✅ |
| 7 | la ruta está en curso (C3) | el conductor revisa la tarjeta de la próxima parada | ve el número de la parada de un total («Próxima parada · 13 de 58»), el código, la categoría, la dirección y la distancia («A 120 m», o «Estás en la parada» si está a 60 m o menos). «Cómo llegar» abre Google Maps con la ruta en auto hasta esa parada | ✅ |

**Notas**
- Criterios 3, 5 y 7: verificados el 14/11/2026 por el Product Owner en un teléfono con GPS real. Antes se probaron contra la API con posiciones de prueba.
- El GPS solo se envía con la app abierta. Para que siga enviándose con la pantalla apagada hace falta una build propia de la app (development build o APK); Expo Go no lo permite. Queda para el Sprint 3.
- Al tocar «Iniciar ruta», el recorrido de ese camión deja de ser simulado (US-12, criterio 6).

---

## US-16 · Marcar las paradas recogidas y terminar la ruta

| ID | Épica | Prioridad | SP | Sprint |
|---|---|---|---|---|
| US-16 | E5 · Operación de la flota | Alta | 5 | Sprint 2 (ampliación) |

**Como** conductor de un camión de recolección, **quiero** marcar en la app cada parada que recojo y terminar la ruta al final, **para** que el vecino sepa que su reporte fue atendido y la central vea el avance real.

| # | Dado | Cuando | Entonces | Estado |
|---|---|---|---|---|
| 1 | la ruta está en curso y el conductor está a 60 m o menos de la próxima parada | toca «Recogido» | la parada pasa a un check verde, el reporte pasa a «Resuelto» y el vecino recibe el aviso «Tu reporte RL-XXXX fue atendido» (US-06). La app muestra «Parada #RL-XXXX recogida. El vecino recibió el aviso.», el avance sube («13/58 paradas») y la tarjeta pasa a la siguiente parada | ✅ |
| 2 | el conductor está a más de 60 m de la parada, o la app aún no tiene su ubicación | toca «Recogido» | la app pregunta «¿Recogiste la parada N?» con la distancia a la que está, y solo la marca si confirma con «Sí, recogido» | ✅ |
| 3 | la ruta está en curso | el conductor toca «Recogido» en otra parada de la lista, fuera de orden | esa parada se marca como recogida y la próxima parada no cambia | ✅ |
| 4 | el municipio ya resolvió o rechazó el reporte de una parada | el conductor la marca como recogida | la app muestra «La parada #RL-XXXX ya no estaba abierta y se saltó.» y la parada aparece atenuada como «Saltada: ya no estaba abierta» | ✅ |
| 5 | una parada ya fue recogida o saltada | el conductor intenta marcarla otra vez | la app muestra «La parada #RL-XXXX ya fue atendida.» y no cambia nada | ✅ |
| 6 | la ruta está en curso | el conductor toca «Terminar ruta» y confirma | la app muestra «Ruta terminada. ¡Buen trabajo!», o «Ruta terminada. Quedaron N paradas sin recoger; el gestor las verá en el panel.» si faltaron paradas. El camión vuelve a «Disponible», la app deja de enviar la ubicación y «Mi ruta» muestra el resumen «Recogiste X de Y paradas» | ✅ |

**Notas**
- Criterio 1: verificado el 14/11/2026 por el Product Owner en un teléfono con GPS real: estando a 60 m o menos, la parada se marca sin preguntar.
- Con cada «Recogido», la app guarda a qué distancia estaba el conductor de la parada. Eso sirve para revisar después si se marcó desde lejos.
- Las paradas que quedan sin recoger al terminar la ruta siguen «En ruta» en el panel, para asignarlas a otro camión.
- Criterios 4, 5 y 6: probados contra la API con el camión de prueba TST-002. El criterio 3 se probó en la versión web de la app.

---

## Cambios respecto a las fichas del APF2 (para la sección 1.1)

Son propuestas que debe aprobar el Product Owner antes de llevarlas al informe:

1. **Más criterios por historia** (de 3 a 6, y 7 en la US-05): se agregaron los casos de error (datos inválidos, credenciales incorrectas, búsqueda sin resultados, avisos duplicados), que antes no estaban cubiertos.
2. **US-06, criterio de la línea de seguimiento:** el paso «validación del municipio» se reemplazó por «agrupado en una zona prioritaria», porque el sistema no tiene un paso de validación y sí agrupa cada reporte con K-Means (US-04).
3. **US-06, aviso por correo:** se mantiene como en el APF2: depende de la regla «Avisar al vecino cuando se resuelva su reporte» de «Configuración» (A8). Para cumplirlo se adelantó esa parte de la pantalla A8, que pertenece a la US-10 (Sprint 3).
4. **US-05, «Rechazar»:** el APF2 solo la nombraba como acción del detalle. Ahora tiene su propio criterio (7): pide un motivo de una lista fija y avisa al vecino.
5. **US-01, correo de bienvenida (criterio 7):** no estaba en el APF2. Se agregó porque, al probar el registro, el equipo esperaba recibir un correo.
6. **Ampliación del Sprint 2 (US-11 a US-16, 29 SP):** el Product Owner sumó a mitad del sprint la épica nueva E5 · Operación de la flota. En la Sprint Review hay que explicar el cambio de alcance: el sprint pasó de 13 a 42 SP.
7. **Rol nuevo, «conductor»:** el APF2 tenía dos roles, vecino y gestor municipal. Con la US-14 se agrega el de conductor, que usa la misma app con otra pantalla («Mi ruta»).
8. **Pantallas nuevas sin prototipo:** «Flota de recogida» (A6) ya estaba en el prototipo, pero sin seguimiento en vivo. «Mi ruta» (C1 a C3) y el modo kiosko no estaban en Figma: hay que agregarlos al prototipo o mostrarlos con capturas de la app.

## Lo que falta para cerrar el Sprint 2

Todos los criterios de las nueve historias están en ✅ (verificados por el Product Owner el 14/11/2026). Falta el trabajo del equipo en Jira:

| Historia | Pendiente | Qué se necesita |
|---|---|---|
| US-11 a US-16 | Registrarlas en Jira (épica E5) y confirmar los SP propuestos | Lo hace el equipo en el Planning Poker |
| Todas | Pasar las tareas a «Listo» en Jira y presentar las nueve historias en la Sprint Review | Lo hace el equipo (Definición de Terminado) |

## Alcance y velocity del Sprint 2

La velocity solo cuenta las historias que tienen todos sus criterios en ✅.

| Historia | SP | Criterios ✅ | ¿Suma a la velocity hoy? |
|---|---|---|---|
| US-01 · Registro e inicio de sesión | 3 | 7 de 7 | Sí |
| US-05 · Filtros y revisión de incidentes | 5 | 7 de 7 | Sí |
| US-06 · Avisos sobre mis reportes | 5 | 6 de 6 | Sí |
| US-11 · Registrar los camiones | 3 | 4 de 4 | Sí |
| US-12 · Asignar y seguir en vivo | 8 | 9 de 9 | Sí |
| US-13 · Modo kiosko | 2 | 5 de 5 | Sí |
| US-14 · Acceso del conductor | 3 | 5 de 5 | Sí |
| US-15 · «Mi ruta» y GPS | 8 | 7 de 7 | Sí |
| US-16 · Paradas y fin de ruta | 5 | 6 de 6 | Sí |
| **Total** | **42** | **56 de 56** | **42 SP** |

- **Comprometido al inicio:** 13 SP.
- **Agregado a mitad del sprint:** 29 SP.
- **Terminado:** 42 SP, las nueve historias.
- **Velocity del Sprint 2:** 42 SP. De esos, 13 SP son del compromiso inicial y 29 SP de la ampliación; conviene mostrarlos por separado en el burndown y en la Review.

---

## Trabajo adelantado del Sprint 3 y mejoras (no suman a la velocity del Sprint 2)

Se hizo durante el Sprint 2 a pedido del Product Owner. Este trabajo no tiene historia en el sprint: la flota y el conductor pasaron a las historias US-11 a US-16.

| Pantalla | Historia | Qué incluye | Qué falta |
|---|---|---|---|
| A5 · Rutas con IA | Mejora de US-04 | Ruta por calles y avenidas con OSRM (OpenStreetMap): orden de paradas por distancia real, distancia y tiempo estimado (manejo + 3 min por parada) y asignación de camión | El servidor público de OSRM es de demostración; para uso real se instala uno propio (`OSRM_URL`) |
| A7 · Análisis | US-09 (Sprint 3) | Periodos de 7, 30 y 90 días; reportes recibidos, tiempo medio de resolución, toneladas recolectadas y vecinos participantes con su variación frente al periodo anterior; serie por día o semana; desglose por categoría y estado; cumplimiento (atendidos en 48 h o menos) y ranking de zonas | Validar los indicadores con el Product Owner |
| A8 · Configuración | US-10 (Sprint 3), en parte | Parámetros de K-Means (K máximo y ponderación), reglas de correo y resumen de usuarios. La base de la flota de esta pantalla es parte de la US-12 | Inicio de sesión del panel, roles (administrador, inspector) e «Invitar usuario». El rol de conductor ya existe (US-14) |
| A1 · Panel general | Mejora del panel | Rediseño «Mapa primero» y selector de tipo de mapa (calles, claro, relieve, satélite y oscuro). El modo kiosko es la US-13 | — |
| Sprint 3 | Pendiente de la E5 | GPS con la app en segundo plano (build propia) y cambio de contraseña obligatorio en el primer ingreso del conductor | Que el Product Owner decida si entran al Sprint 3 |
