# Influencers Battle — Plan de diseño v1

Fecha: 19 de septiembre de 2026. Proyecto: juego-paraguay.
Estado: propuesta de campaña y dirección artística; no es una versión implementada ni una medición de rendimiento.
Repositorio local: C:\Users\alema\OneDrive\Escritorio\juego-paraguay.
Base revisada: commit 423939a. Remoto original conservado.

> [!success] Implementación actualizada
> La campaña ya está implementada. Una ampliación posterior sustituyó los encuentros finales genéricos por tres jefes satíricos: Pastor Luison con criaturas sobrenaturales en Costanera, Lata Parara con latas poseídas en Mercado 4 y LULAX con micrófonos poseídos en IPS. Cada uno tiene arte, secuaces, tres patrones y tres fases propias. Ver `ENTREGA.md` para el estado validado.

## 1. La propuesta

Un juego de acción lateral 2D para móvil, con seis personajes satíricos, tres episodios paraguayos y conversaciones de IA. La promesa: **elegí tu influencer, armá el quilombo y sobreviví al algoritmo**. Público adulto de 18 a 40 años; humor local, drama absurdo, armas arcade y rivalidades exageradas.

La portada puede tener el impacto de una ilustración de GTA, mientras la partida aprovecha el combate lateral existente. No necesitamos un mundo abierto 3D para lograr personalidad y acción. El primer objetivo es que moverse, esquivar y acertar resulte excelente.

Partidas de 3–5 minutos; revancha en dos toques; acción inicial en menos de 10 segundos después de cargar. Una campaña de unos 12–18 minutos debe dar ganas de repetirse con otro personaje. Estas duraciones son objetivos de diseño para validar, no resultados observados.

## 2. Investigación y tratamiento de los personajes

Las imágenes entregadas son referencias visuales aportadas por el usuario. No se usan para deducir identidades o biografías. Los nombres se asignan según su descripción. Los enfrentamientos, poderes y diálogos siguientes son ficción del juego, no afirmaciones sobre conductas reales.

| Personaje      | Evidencia y estado                                                                                                      | Uso en el juego                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Masivo Bro     | Crónica documenta una disputa pública con Onichan en agosto de 2026 [1].                                                | Competitividad, musculatura, tatuajes, ego de gimnasio y rivalidad teatral.                                                                             |
| Onichan        | La misma cobertura identifica su personaje público [1]. La estética anime proviene además de la referencia del usuario. | Personaje rosa, veloz, fan del anime; exageraciones otaku y pequeños remates en jopará.                                                                 |
| ANATOMIC BLOGS | No encontré una identificación fiable con ese nombre. Perfil exacto pendiente de respuesta del usuario.                 | Concepto provisional aportado por el usuario: remera negra, gafas, temática cripto. Su alianza sentimental con Onichan se trata como ficción del guion. |
| La Comadre     | Crónica recoge su actividad pública como cantante y figura de escenario [2].                                            | Diva de rojo, micrófono, dominio del escenario, rivalidad ficticia con todos y especialmente Masivo.                                                    |
| El Papu        | EPA recoge su promoción de pendrives musicales e incorpora el perfil @hectornanoelpapuof [3].                           | Comerciante musical fanfarrón, USB como arma fantástica y moto destartalada como gag inventado.                                                         |
| La Secre       | Una entrevista de La Nación explica que el personaje de Soy Elías parodia la atención sanitaria [4].                    | Ventanilla, sellos y turnos imposibles. La sátira apunta al sistema y la indiferencia burocrática.                                                      |

No se incorpora el rumor sexual sobre el origen del dinero de El Papu. Tampoco se afirma que Onichan tenga una cuenta actual de OnlyFans: no quedó verificado. Su monetización se representa mediante un club VIP ficticio sin contenido explícito. La frase física propuesta contra La Comadre se sustituye por una disputa de ego y espectáculo: mantiene el conflicto sin hacer del cuerpo el chiste central.

Ejemplos escritos para el juego, **no citas reales**:

- Masivo: «Mucho filtro, poco entrenamiento, bro.»
- Onichan: «Tu ego no entra ni en el episodio de relleno, uwu.»
- Anatomic: «Mi escudo está en corrección; no está roto.»
- La Comadre: «Vos levantás pesas. Yo levanto el rating.»
- Papu: «No se trabó: es la versión extendida.»
- La Secre: «Para reclamar que no hay sistema, sacá turno en el sistema.»

## 3. Seis personajes, seis maneras de pelear

Todos podrán jugar los tres episodios. Si un personaje elegido coincide con el rival del capítulo, una tabla de encuentros cambia al rival y sus diálogos; no se enfrenta a un duplicado sin explicación.

| Personaje      | Rol y silueta                                  | Poder activo inicial                                       | Súper, con medidor lleno                                                   | Debilidad y contraataque                               |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| Masivo Bro     | Peleador pesado; tatuajes, torso y pelo claro  | Embestida Masiva: rompe guardias; enfriamiento inicial 7 s | Modo Masivo: 5 s de golpes con ondas de impacto                            | Recuperación larga si falla; esquivar y castigar       |
| Onichan        | Movilidad; rosa y silueta ligera               | Paso UwU: desplazamiento con un señuelo, 6 s               | Arco de Temporada: tres ondas de energía anime                             | Poca resistencia; el señuelo se distingue por contorno |
| ANATOMIC BLOGS | Control a distancia; negro y verde             | Vela Verde: barrera corta, 9 s                             | Mercado Volátil: zonas de pulsos verdes y rojos anunciadas en el suelo     | La barrera dura poco; flanquear durante su recarga     |
| La Comadre     | Control de arena; rojo y micrófono             | Fuera de mi Live: cono sónico que empuja, 8 s              | La Reina del Feed: focos recorren la arena y crean huecos seguros          | Fuera del cono queda expuesta                          |
| El Papu        | Trampas y recorrido; azul eléctrico y USB      | Pendrive Remix: proyectil búmeran, 7 s                     | Moto con Subwoofer: pasada lateral telegrafiada                            | Giro lento; saltar la onda y aprovechar el retorno     |
| La Secre       | Defensa y control; blanco/rojo, lentes y sello | Falta Fotocopia: sello de ralentización, 9 s               | Sistema Caído: pausa los poderes enemigos 2 s, luego lluvia de formularios | Daño directo bajo; ataques normales siguen disponibles |

Estos números son puntos de partida para balance. Ningún poder bloquea todo el control del jugador; los jefes tienen resistencia al encadenamiento de estados. Todos usan las armas base; los poderes aportan identidad sin exigir aprender seis esquemas de botones.

## 4. Campaña: La guerra por el feed

Una plataforma ficticia, **Ñandutí Live**, anuncia el trofeo al influencer más visto del país. Un pendrive contiene el video completo que demuestra que una máquina recorta los clips para fabricar peleas. Todos quieren controlar ese archivo por motivos distintos. La campaña convierte la competencia inicial en una alianza incómoda.

### Nivel 1 — Costanera: En vivo y sin filtro

**Lugar:** recreación artística de la Costanera de Asunción y su frente hacia la bahía. La Costanera y el patrimonio del centro tienen referencias institucionales [5, 6]. La arena de espectáculo es ficticia.

**Arte:** atardecer cálido, barandas, paseo ribereño, carritos, termos, bicicletas y horizonte del Palacio de López. Tres capas de fondo para profundidad; agua simplificada y una sola dirección de luz. Los vendedores y peatones son ambiente, no blancos de combate.

**Recorrido:** paseo → zona de carritos → tarima de un evento ficticio. Tres pantallas de recorrido y una arena, con rutas superior e inferior claramente legibles.

**Historia:** Masivo y Onichan reciben invitaciones contradictorias: a cada uno le prometieron ser la estrella. Anatomic levanta un marcador cripto ficticio de popularidad. La Comadre interrumpe la transmisión y revela que ambos están reaccionando a clips cortados.

**Secuencia de 3–4 minutos:**

1. Llegada y provocación saltable de 8 segundos.
2. Tutorial integrado: avanzar, saltar un obstáculo y esquivar una carga anunciada.
3. Activar dos puntos de transmisión; cada uno abre una pequeña oleada de bots de comentarios.
4. Elegir una respuesta: desafiar, burlarse o negociar. Cambia una ayuda o un peligro, sin bloquear el combate.
5. Duelo contra Masivo; si el jugador es Masivo, duelo contra Onichan con patrón propio.

**Jefe:** fase 1, cargas anunciadas; fase 2, ondas y plataformas temporales; fase 3, arena más pequeña por focos móviles. Daño evitable y pausa de castigo después de cada combo. Meta: 50–70 segundos, no una barra de vida interminable.

**Giro:** el clip original está en un USB de Papu que acaba de salir hacia el Mercado 4.
**Recompensa:** desbloqueo del segundo episodio y una pose; tarjeta compartible con el rival vencido y la mejor esquiva.

### Nivel 2 — Mercado 4: El pendrive de oro

**Lugar:** recreación de pasillos comerciales inspirados en el Mercado Municipal N.º 4, referencia documentada por la Municipalidad [7]. No pretende ser un plano exacto de locales reales.

**Arte:** toldos de colores, cables elevados, cartelería pintada, puestos de electrónica, cajas, frutas y calle lateral con motos. Paleta verde/amarillo con toques fucsia; las superficies transitables tienen contraste propio. Sonido de mercado estilizado y música original de percusión y bajo.

**Recorrido:** entrada comercial → pasillo de electrónica → patio de carga. La estrechez genera decisiones de combate, no obstáculos invisibles.

**Historia:** Papu ofrece el «USB definitivo». Anatomic quiere convertirlo en un coleccionable digital y La Comadre reclama el video completo para demostrar quién se quedó con el protagonismo. Papu cambia tres veces de oferta mientras su moto no arranca.

**Secuencia de 4–5 minutos:**

1. Papu entrega tres cajas indistinguibles: dos contienen remixes, una el archivo.
2. Recuperar las cajas a través de arenas cortas con altavoces que anuncian ondas de sonido.
3. Elegir devolver un equipo a un vendedor ficticio o tomar un atajo. La primera opción concede ayuda; la segunda ahorra tiempo.
4. Persecución breve de la moto en el mismo motor lateral; sin cambiar a otro juego de conducción.
5. Jefa La Comadre, que intenta controlar el escenario del mercado. Si es el personaje jugador, Anatomic ocupa el encuentro con sus barreras y velas.

**Jefa:** micrófono direccional → focos que delimitan carriles → remix de patrones con pausas claras. Papu cruza la arena como peligro cómico anunciado. La música no debe tapar las señales de ataque.

**Giro:** el archivo está protegido por el «certificado de aptitud para hacerse viral». Todos deben pasar por la ventanilla más difícil del país.
**Recompensa:** tercer episodio, acabado de arma y opción de compartir «mi build del Mercado 4» con personaje, arma y tiempo.

### Nivel 3 — IPS: Turno para el apocalipsis

**Lugar:** exterior inspirado en el Hospital Central del IPS, usando su ubicación y referencias institucionales [8, 9]. El interior es una oficina fantástica inventada. No es una simulación médica ni la reproducción de una emergencia real.

**Arte:** acceso institucional, recepción, banco de espera, ventanillas, carteles administrativos, tubos fluorescentes, impresoras y un tablero de turnos que nunca avanza. Del blanco/verde cotidiano se pasa al rojo de las notificaciones de la máquina. Pacientes y personal sanitario quedan fuera de los objetivos de ataque; las arenas se sitúan en espacios administrativos ficticios.

**Recorrido:** acceso → ventanilla → archivo imposible → sala fantástica del servidor.

**Historia:** La Secre exige una fotocopia del certificado que todavía no existe. La Comadre intenta usar su fama; Masivo quiere saltarse el turno; Onichan transmite; Anatomic ofrece tokenizar la fila; Papu vende música de espera. La Secre reconoce que ni ella controla ya el tablero: **El Algoritmo** está produciendo enemistades infinitas.

**Secuencia de 4–5 minutos:**

1. Destruir sellos mecánicos y recuperar dos formularios del archivo; evitar una colección tediosa de recados.
2. Duelo de trámite contra La Secre: se pelea con papel, sellos y máquinas. Si ella es jugable, la recibe el Autorizador 3000, NPC completamente ficticio.
3. Conversación corta: aliarse con un rival y elegir su asistencia para el final.
4. Todos descubren que el trofeo era una máquina de fabricar conflicto.
5. Combate final contra El Algoritmo.

**Jefe final original:** una torre de monitores, ventanillas y brazos de fotocopiadora; rostro hecho de reacciones, sin representar a una persona real.

- Fase 1, «Siguiente»: imprime oleadas y proyectiles de notificaciones; cortar dos fuentes.
- Fase 2, «Contenido recomendado»: reproduce dos patrones aprendidos en Costanera y Mercado, con intervalos seguros.
- Fase 3, «Sistema caído»: núcleo expuesto; coordinar el súper propio con la asistencia elegida. Los aliados se muestran en intervenciones breves para preservar rendimiento.

**Desenlace:** el archivo sale completo y desmonta el conflicto ficticio. Silencio de un segundo. Los seis discuten inmediatamente quién se lleva el crédito. La Secre imprime: «Vuelva mañana».
**Recompensa:** selector de episodios y todos los personajes disponibles, modo revancha y tarjeta del equipo final.

## 5. Movimiento y combate para móvil

Orientación horizontal preferida para la acción lateral; menú y tarjetas adaptados también a vertical. No depender de que el navegador permita bloquear la orientación. En vertical usar cámara adaptada y HUD compacto, con sugerencia de girar que se puede cerrar.

**Controles:** pulgar izquierdo mueve; derecho dispone de ataque grande, salto y dash. Un botón de poder junto al ataque; con el medidor lleno ejecuta el súper. El arma se cambia tocando su icono. Granada mediante botón pequeño configurable. Interactuar aparece solo cerca de un NPC. Evitar gestos secretos o acciones críticas por pulsación larga.

- Áreas táctiles de 56–72 px CSS, separación mínima de 12 px y ajuste para zurdos.
- Multitáctil real: avanzar, atacar y saltar simultáneamente. Liberar estado en pointercancel, pérdida de foco y apertura del teclado.
- Movimiento con aceleración corta, frenada predecible, tolerancia de salto de 100 ms y buffer de 120 ms como valores iniciales.
- Dash inicial de 160 ms, recuperación 700 ms y ventana de invulnerabilidad indicada visualmente; ajustar en pruebas.
- Asistencia de puntería moderada al objetivo visible en dirección de mirada. No apuntar a enemigos tapados por obstáculos.
- Impacto con flash breve, retroceso, sonido diferenciable y vibración opcional. Sacudida desactivable; evitar destellos intensos.
- Animaciones coherentes de reposo, correr, saltar, caer, atacar, recibir impacto, dash y celebrar. Mantener pies y hitboxes estables entre frames.
- Derrota arcade, sin gore por defecto: ayuda a que capturas y clips sean legibles y compartibles.

**Armas que se conservan:** puño, cuchillo, bate, pistola, AK, escopeta, SMG y granada. Se mejoran por respuesta y utilidad, no dando daño infinito a todas. Puño con combo de tres golpes; cuchillo rápido; bate rompe guardias; pistola precisa; AK sostiene fuego con dispersión gradual; SMG favorece movimiento; escopeta domina cerca; granada desplaza enemigos de cobertura. Revisar las 1000 balas iniciales de AK actuales: hoy pueden borrar la necesidad de elegir armas. Probar primero munición generosa y cargadores claros, sin convertir el juego en administración de inventario.

**Meta de rendimiento:** 60 fps estables en móvil medio y opción de 30 fps estables en gama baja; entrada percibida por debajo de 100 ms. Presupuesto inicial: hasta 12 enemigos activos, 80 proyectiles y 120 partículas, con degradación gradual. Son hipótesis, no capacidades medidas. Pooling, atlas de sprites, resolución adaptativa y carga por episodio. La portada y los videos no deben viajar en el paquete crítico del combate.

## 6. Conversaciones con IA: conservar Venice y ampliar el contexto

La base usa `src/game/agent.ts` y `src/lib/venice.server.ts`. Hay conversación por personaje, historial de hasta diez turnos y mensajes limitados a 400 caracteres. El proveedor es Venice; no se propone cambiarlo ni llamar a su API durante esta etapa de planificación.

Separar tres capas:

1. **Guion:** introduce objetivos, enseña mecánicas y garantiza que siempre se pueda terminar el episodio.
2. **IA conversacional:** responde al jugador con personalidad y humor, recordando encuentro, rival, decisión anterior y estado del episodio.
3. **Reglas del juego:** validan cualquier consecuencia; un texto generado no concede monedas ni cambia salud o misiones directamente.

Ficha por personaje: voz, vocabulario, objetivos, rivalidades ficticias, frases originales, límites y memoria. Respuestas de una o dos frases; botones «Provocar», «Negociar» y «Pedir ayuda», más texto libre. Español paraguayo natural; revisión humana local del jopará antes de grabar voces. No clonar voces reales; usar texto y, en una fase posterior, interpretación original.

Pausar la acción en las charlas largas. Las réplicas durante pelea serán locales y breves para que la red no afecte la respuesta táctil. Si Venice falla, mostrar el estado y dejar continuar con guion identificado como tal. Agregar timeout, cancelación al cerrar el diálogo, límites de frecuencia y presupuesto por sesión. Las claves siguen en servidor.

Cambios prioritarios detectados: validar `who` mediante lista permitida; validar roles y longitud total del historial; no exponer cuerpo de errores del proveedor; eliminar el fallback que muestra `reasoning_content`; limitar el nombre del jugador; sustituir las personas del antiguo Team UPAP. Evitar que el chat invente acusaciones reales o reproduzca rumores íntimos. La UI debe identificar los personajes y las conversaciones como ficción satírica.

## 7. Compartir y rejugar

Primera versión: tarjeta de resultado de 1080×1920 con personaje, rival, tiempo, combo y una frase del guion; enlace para repetir el mismo desafío. Invocar compartir solo tras pulsación del jugador, con descarga de imagen o copia del enlace como alternativas. No publicar automáticamente.

Las respuestas de IA solo se incluyen si el jugador selecciona la frase y revisa la tarjeta; quitar su texto privado por defecto y conservar el rótulo de ficción. Un botón de compartir no debe tapar la revancha.

Segunda versión: repetición de 8–12 segundos mediante registro de eventos, no grabación continua del teléfono. Requiere una simulación reproducible o snapshots; hoy no está construida. No prometer exportación de video universal sin probar formatos y navegadores.

Rejugabilidad: tres medallas por nivel (terminar, rapidez, dominio), desafíos de combinaciones de personajes y armas, caminos de conversación y récord local. Sin esperas artificiales para volver a jugar. Retos diarios por semilla pueden añadirse después; el ranking global exige backend y validación contra trampas.

La viralidad no se garantiza: validar con jugadores paraguayos cuánto entienden en 30 segundos, si vuelven a jugar y qué momentos desean compartir. Medir finalización del tutorial, finalización de nivel, revancha y uso voluntario de compartir; no optimizar solo clics accidentales.

## 8. Base técnica: qué reutilizar y qué cambiar

| Archivo/sistema             | Hallazgo por lectura                                                         | Plan                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| src/game/world.ts           | Física lateral, proyectiles, colisiones, persecución y jefes; delta limitado | Conservar; separar poderes y patrones de jefe; evaluar paso fijo para futura repetición  |
| src/game/render.ts          | Render Canvas                                                                | Conservar; incorporar arte, atlas y límites de efectos                                   |
| src/game/input.ts           | Capa común de teclado, touch y gamepad                                       | Conservar y probar cancelación, multitáctil y cambios de orientación                     |
| src/game/Game.tsx           | HUD, botones táctiles, bucle RAF y resolución adaptativa                     | Reorganizar controles y menús; evitar crecer el componente monolítico                    |
| src/game/content.ts         | Héroes, enemigos, ocho armas y tres capítulos antiguos                       | Nuevos datos y tipos para los seis personajes, campaña y encuentros alternativos         |
| src/game/store.ts           | Flujo de pantallas, diálogos y eventos                                       | Mantener el flujo, añadir campaña y contexto de relación                                 |
| src/game/settings.ts        | Guardado local upap.* versión 1                                              | Nuevo espacio de guardado influencers-battle.v1; conservar el antiguo sin sobrescribirlo |
| agent.ts + venice.server.ts | Chat real por servidor con Venice                                            | Mantener proveedor; endurecer validación y definir nuevas personas                       |
| assets.ts + audio.ts        | Carga de assets y sonido                                                     | Carga por episodio, audio propio, interrupción al ocultar la pestaña                     |

No se instaló ni ejecutó la aplicación en esta etapa. La revisión es estática; autenticación, despliegue, compatibilidad Windows, claves y latencia real de Venice siguen sin comprobarse. Los documentos del repositorio incluyen supuestos de un sandbox Grok/Linux que no describen este entorno Windows; adaptar al implementar, sin eliminarlos a ciegas.

## 9. Producción en entregas verificables

1. **Prototipo de sensación:** arena gris, un personaje, las ocho armas, salto/dash/ataque y HUD móvil. Salida: cinco minutos de combate sin bloqueo de inputs en Android e iOS. No producir todo el arte antes de que esto funcione.
2. **Primer episodio completo:** Costanera, Masivo y Onichan, una conversación Venice, jefe y pantalla de resultado. Salida: se juega de inicio a fin, con red lenta y con IA no disponible.
3. **Elenco completo:** seis kits, retratos y animaciones; encuentro alternativo cuando el jugador es el jefe. Salida: todos pueden terminar el primer episodio y tienen fortalezas distintas.
4. **Campaña completa:** Mercado 4, IPS, relaciones y El Algoritmo. Salida: tres episodios sin bloqueos de progreso con los seis personajes.
5. **Compartir y pulido:** tarjetas, reto reproducible, accesibilidad, audio y ajuste con público local. Salida: flujo de compartir/cancelar probado y mediciones de frame time en dispositivos reales.

Criterios de aceptación: compilación y tipos correctos; render real sin errores; táctil probado a dos y tres dedos; todos los patrones de jefe evitables; sin softlocks al saltar diálogo; guardado tras recarga; continuidad al volver de segundo plano; alternativas de compartir; sin pérdida de controles al abrir y cerrar teclado; ensayos de 15 minutos para observar calor y caída de rendimiento. Pantallas objetivo: móvil compacto, móvil medio y tableta. No afirmar 60 fps en móviles solo con emulación de escritorio.

## 10. Dirección artística y paquete de assets

Portada conceptual: seis retratos ilustrados en paneles diagonales, título INFLUENCERS BATTLE, subtítulo PARAGUAY, luz de atardecer, rojo/rosa/violeta y fondos de Costanera, Mercado e interior administrativo. Tratamiento de cómic de acción inspirado en las portadas de GTA; identidad y logotipo propios. Pie «Ficción satírica». Es portada de propuesta, no captura del juego.

Assets de implementación: seis retratos; seis spritesheets con estados y anclajes consistentes; tres escenarios principales divididos en módulos y capas; una arena por nivel; ocho armas e iconos; seis poderes y sus señales; jefe final; HUD; tarjeta vertical. Los escenarios descritos arriba son briefs completos de diseño, aún no fondos de juego renderizados. La portada no sustituye los sprites ni valida sus hitboxes.

Pendiente editorial concreto: perfil exacto de ANATOMIC BLOGS. Se puede avanzar con el resto sin bloquear el prototipo.

## Fuentes consultadas

[1] Crónica, 13/08/2026: rivalidad pública Masivo–Onichan. https://www.cronica.com.py/2026/08/13/fuerte-respuesta-de-onichan-a-masivo-en-sus-redes-sociales/
[2] Crónica, 12/03/2023: presentación musical de La Comadre. https://www.cronica.com.py/2023/03/12/galeria-la-comadre-y-su-debut-oficial-como-vallenatera/
[3] EPA, 06/08/2025: promoción de pendrives de El Papu. https://epa.com.py/el-papu-explico-por-que-es-mejor-comprar-su-pendrive-que-suscribirse-a-una-plataforma/
[4] La Nación, 25/05/2024: entrevista a Soy Elías y origen de La Secre. https://www.lanacion.com.py/la-nacion-del-finde/2024/05/25/soy-elias-mis-fans-estan-mas-emocionados-que-yo-con-esta-nominacion/?outputType=amp
[5] Junta Municipal de Asunción: Costanera de Asunción. https://jma.gov.py/costanera-de-asuncion/
[6] Plan CHA: relación del frente costero y el patrimonio del centro. https://plancha.gov.py/sinopsis-del-plan-cha/
[7] Municipalidad de Asunción: 83.º aniversario del Mercado 4. https://www.asuncion.gov.py/mercados/mercado-no-4/el-mercado-municipal-no-4-celebro-su-83-aniversario-en-un-ambiente-de-alegria-y-optimismo
[8] IPS Maps: ubicación de establecimientos. https://servicios.ips.gov.py/IPSMaps/
[9] IPS, boletín institucional, Dirección de Hospitales del Área Central. https://portal.ips.gov.py/sistemas/ipsportal/archivos/boletines/1676637623.pdf

La investigación se limita a material público consultado el 19/09/2026. Los artículos sirven para rasgos públicos y contexto, no para validar cualquier comentario o rumor de redes. Las localizaciones son reales; la distribución de las arenas y todos los sucesos de la campaña son inventados.
