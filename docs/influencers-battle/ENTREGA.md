# Influencers Battle — entrega jugable

Fecha: 19 de septiembre de 2026.

## Estado

La primera campaña está implementada como juego web móvil y de escritorio. Parte de la base del repositorio original y mantiene su integración de conversaciones con Venice.

## Contenido terminado

- Seis personajes seleccionables: Masivo Bro, Onichan, ANATOMIC BLOGS, La Comadre, El Papu y La Secre.
- Tres episodios: Costanera de Asunción, Mercado 4 e IPS.
- Combate lateral con salto, dash, ocho armas, granadas, cajas, curación, combo, hype, poder propio y súper por personaje.
- Tres familias de secuaces y tres jefes con ataques anunciados y tres fases.
- Decisiones de diálogo, guion local y conversación opcional por IA.
- Guardado local de ajustes, puntuaciones, tiempos y medallas.
- Tarjeta vertical para compartir y enlace reproducible con personaje y semilla.
- Controles de teclado, táctiles simultáneos, modo zurdo, calidad liviana y pausa automática.
- Portada, retratos, sprites, escenarios, enemigos, favicon y piezas sociales propias.

Toda la historia se presenta como ficción satírica. Los rumores personales que no pudieron verificarse no se publican como hechos.

## Cómo abrirlo

Desde PowerShell:

```powershell
cd C:\Users\alema\OneDrive\Escritorio\juego-paraguay
.\start-game.ps1
```

Después, abrir `http://127.0.0.1:8080/`. La compilación validada queda disponible localmente en `http://127.0.0.1:8081/` mientras siga activo el proceso de vista previa.

## Validación ejecutada

- TypeScript sin errores.
- ESLint sin errores en todos los módulos modificados.
- 11 pruebas del motor: pasan las 18 combinaciones de personaje y episodio y validan los ataques propios de cada jefe.
- 55 pruebas heredadas del proyecto: pasan.
- Compilación de producción: completa.
- Navegador de producción: escritorio y móvil sin errores de consola ni desbordamiento.
- Flujo probado: selección, movimiento, salto, pausa, campaña, conversaciones, resultado, tarjeta y enlace.
- Control móvil probado con joystick y ataque simultáneos.
- Invariantes de autenticación conservadas.

## Jefes de campaña

- **Pastor Luison — Costanera:** rayos sagrados, zonas de castigo e invocación de criaturas sobrenaturales.
- **Lata Parara — Mercado 4:** proyectiles, lluvia y embestidas de latas poseídas sin marcas reales.
- **LULAX — IPS:** palabras censuradas, ondas oscuras e invocación de micrófonos poseídos.

Las tres representaciones y sus poderes pertenecen a la ficción satírica del videojuego.

## Dependencia pendiente de entorno

La conversación con Venice está integrada y falla de forma controlada cuando no existe una clave. Para obtener respuestas generadas en vivo hay que configurar `VENICE_API_KEY`; las opciones escritas del guion funcionan sin conexión.
