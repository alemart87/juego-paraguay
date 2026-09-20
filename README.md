# Influencers Battle — Paraguay

Juego de acción satírica para móvil ambientado en Paraguay. Nueve personajes jugables atraviesan cinco episodios, conversan con NPC mediante Venice AI y enfrentan jefes imposibles en escenarios reconocibles del país.

![Portada de Influencers Battle](public/battle/cover-v2.webp)

> Obra de ficción y parodia. No existe afiliación, respaldo ni participación de las personas representadas.

## Qué incluye

- Campaña de cinco episodios: Templo del último avivamiento, Mercado 4, IPS, Asunción infestada y ROSE vs SEBASTIÁN en Ameri Store.
- Niveles ampliados cerca de 30%, con más recorrido, oleadas y acción.
- Arsenal ampliado con Lanzacohetes Ka'aru, Lanzallamas Mbareté y Cañón de Itaipú, cada uno con proyectiles, daño y efectos propios.
- Nueve combatientes con estadísticas, movimiento y poderes propios; ROSE pelea siempre junto a Masivo, y Pablito y Marito son premium con prueba jugable de 10 segundos.
- Marito despliega el Tomahawk PY-01 ilustrado, autónomo, con seguimiento de blancos, rotor animado y salvas explosivas.
- Cuatro jefes, secuaces y lenguajes de ataque; El Dictador tiene dos vidas y hondita paraguaya.
- Marketplace móvil con ocho power-ups y dos personajes premium de pago único, precios visibles y checkouts seguros de Whop.
- Controles multitáctiles, teclado, pausa y modo para zurdos.
- Música procedural por episodio, mezcla dinámica para parlantes móviles y gritos de combate en español.
- Intro cinematográfica de 4,2 segundos con montaje de jefes, rayos y presentación premium.
- Identidad de estudio **PY-STAR GAMES** animada en intro, finales, ranking y tarjetas sociales.
- Ranking PostgreSQL acumulativo e idempotente: cada victoria suma una vez y el récord individual se conserva aparte.
- Panel privado `/admin` con visitantes, jugadores, partidas, victorias, niveles, personajes, compras e ingresos.
- Tarjeta vertical de resultado para descargar o compartir desde el teléfono.
- Desafíos reproducibles por URL con episodio, personaje y semilla.
- Conversaciones dinámicas con Venice AI y respuestas locales de respaldo.
- SEO técnico para `www.influencerspy.pro`: canonical, Open Graph 1200×630, Twitter Card, JSON-LD `VideoGame`, sitemap y robots.
- PWA instalable, Docker multi-stage, `render.yaml`, health check y disco `/persistent`.

## Stack

React 19, TanStack Start, TypeScript, Nitro, Canvas 2D, PostgreSQL/PGLite, Playwright y Venice AI.

## Desarrollo local

Requiere Node.js 22.

```bash
npm ci
copy .env.example .env
npm run dev
```

Abrí `http://localhost:8080`. Sin `DATABASE_URL`, el desarrollo usa PGLite en memoria y aplica automáticamente las migraciones de `migrations/`.

Para habilitar las conversaciones generativas, completá `VENICE_API_KEY` en `.env`. La clave permanece en el servidor.

## Variables de entorno

| Variable               | Uso                                                                           |
| ---------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`         | Conexión PostgreSQL. Render la inyecta desde la base administrada.            |
| `LEADERBOARD_SECRET`   | Secreto HMAC para convertir correo/teléfono en identificador irreversible.    |
| `VENICE_API_KEY`       | Clave privada de Venice AI.                                                   |
| `VENICE_MODEL`         | Modelo de conversación; el valor de ejemplo conserva la configuración actual. |
| `PERSISTENT_DIR`       | Directorio persistente de personajes; en Render es `/persistent`.             |
| `PUBLIC_SITE_URL`      | URL pública: `https://www.influencerspy.pro`.                                 |
| `VITE_AUTH_ENABLED`    | Debe permanecer `false`; el ranking usa registro opcional propio.             |
| `WHOP_API_KEY`         | Account API key privada para crear checkouts de Whop desde el servidor.       |
| `WHOP_WEBHOOK_SECRET`  | Secreto `ws_…` que verifica cada evento firmado de Whop.                      |
| `WHOP_CHECKOUT_*`      | Overrides opcionales para enlaces existentes; ya no son obligatorios.         |
| `SUPERADMIN_EMAIL`     | Correo de acceso al panel privado `/admin`.                                   |
| `SUPERADMIN_PASSWORD`  | Contraseña de acceso al panel privado `/admin`.                               |
| `ADMIN_SESSION_SECRET` | Secreto de firma de la cookie de administración.                              |

Nunca subas `.env`; el repositorio solo contiene [.env.example](.env.example).

### Activar la tienda Whop

1. En Whop creá una **Account API key** del negocio con el scope `checkout_configuration:create`.
2. En Render → Web Service → **Environment**, cargá la clave como `WHOP_API_KEY` y guardá.
3. Ejecutá `npm run whop:provision` para crear los diez checkouts, o entrá a la tienda: el primer clic de cada SKU crea el plan `one_time` inline y obtiene su `purchase_url`.
4. El resultado se guarda en `/persistent/whop-checkouts.json`; los siguientes clics reutilizan el mismo checkout.

La clave nunca llega al navegador. Los `WHOP_CHECKOUT_*` siguen aceptándose como overrides, pero no hace falta crear ocho productos manualmente.

### Webhook de compras

Creá un webhook `v1` en [Whop Dashboard → Developer](https://whop.com/dashboard/developer) con esta URL:

```text
https://www.influencerspy.pro/api/webhooks/whop
```

Suscribilo a `payment.succeeded`, `payment.failed` y `refund.updated`. Whop muestra el secreto de firma `ws_…` al crear el endpoint; guardalo como `WHOP_WEBHOOK_SECRET` tanto en `.env` como en Render. El endpoint verifica el cuerpo crudo con `@whop/sdk/helpers`, rechaza firmas inválidas, descarta reintentos por `webhook-id` y registra compras/reembolsos en PostgreSQL mediante `migrations/0003_whop_commerce.sql`.

## Docker local

```bash
docker compose up --build
```

El juego queda en `http://localhost:8080`, PostgreSQL en el puerto `5432` y las fotos se copian al volumen `juego_paraguay_media`, montado como `/persistent`. El arranque ejecuta las migraciones y luego `scripts/seed-persistent.mjs` de forma idempotente.

## Render

El archivo [render.yaml](render.yaml) crea un Web Service Docker, una base PostgreSQL y un disco persistente de 1 GB. En el Dashboard de Render:

1. Elegí **New → Blueprint** y conectá este repositorio.
2. Confirmá el plan del servicio y de PostgreSQL.
3. Cargá `VENICE_API_KEY`, `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` cuando Render lo solicite. `ADMIN_SESSION_SECRET` se genera automáticamente.
4. Desplegá y comprobá `https://TU-SERVICIO.onrender.com/health`.

Render monta el disco en `/persistent`; el contenedor solo persiste archivos ubicados debajo de ese punto. Este proyecto sirve los personajes desde `/media/characters/:archivo`, primero buscando `/persistent/characters` y usando el recurso empaquetado como respaldo. Un servicio con disco persistente queda limitado a una instancia y pierde el despliegue sin interrupción, según la documentación oficial de [Persistent Disks](https://render.com/docs/disks). La definición del Blueprint sigue la [Blueprint YAML Reference](https://render.com/docs/blueprint-spec), usa la URL interna de [Render Postgres](https://render.com/docs/postgresql-creating-connecting) y ejecuta el contenedor según la guía de [Docker on Render](https://render.com/docs/docker).

Encontrás el procedimiento completo y las decisiones de arquitectura en [docs/influencers-battle/DESPLIEGUE-RENDER.md](docs/influencers-battle/DESPLIEGUE-RENDER.md).

## Verificación

```bash
npm run typecheck
npm run lint
npm run test:battle
npm run build
node scripts/battle-smoke.mjs http://127.0.0.1:8081/
```

Las pruebas cubren física, salto, dash, armas, poderes, campaña, jefes, determinismo, guardado, normalización de contactos y el flujo real de ranking y tarjeta social en escritorio y móvil.

## Estructura principal

```text
src/battle/                    juego, UI, ranking y tarjeta social
src/game/                      audio y conversación con Venice AI
migrations/                     ranking, episodio 4 y compras Whop
server/routes/health.ts        health check de Render
server/routes/api/webhooks/    receptor firmado de eventos Whop
server/routes/media/           imágenes desde /persistent
server/routes/api/quick-start* inicio directo: el superadmin elige episodio y personaje
                               y el link entra a jugar sin chisme, intro ni menús (?menu=1 los muestra)
public/battle/                 recursos fuente empaquetados
public/brand/                  identidad visual de PY-STAR GAMES
scripts/seed-persistent.mjs    copia idempotente al disco
Dockerfile                     imagen de producción Node/Nitro
render.yaml                    infraestructura como código
```

## Seguridad del ranking

El servidor valida los datos, limita intentos por IP y nunca guarda el correo o teléfono en claro. Genera `HMAC-SHA-256(tipo:contacto)` con `LEADERBOARD_SECRET`; el contacto permite acumular partidas para una persona. Cada partida lleva un identificador único para impedir sumas duplicadas. El ranking devuelve exclusivamente posición, apodo, personaje, cantidad de partidas, récord y puntaje total.

Para una competencia con premios conviene sumar autenticación fuerte, verificación de contacto y validación autoritativa de partidas. El ranking actual está diseñado para juego social casual.

## Licencia y derechos

El código del prototipo se distribuye como parte de este repositorio. Las referencias fotográficas y nombres de terceros conservan los derechos de sus titulares; revisá permisos, derecho a la imagen y marcas antes de un lanzamiento comercial.
