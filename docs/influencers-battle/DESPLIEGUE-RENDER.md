# Despliegue en Render con Docker, PostgreSQL y `/persistent`

## Arquitectura elegida

```text
Internet
   │
   ▼
Render Web Service (Docker / Node 22 / Nitro)
   ├── PostgreSQL interno ── ranking y consentimiento
   ├── Venice AI ─────────── conversaciones del juego
   └── /persistent ───────── fotos y manifiesto de personajes
```

Se tomó como referencia el patrón funcional encontrado en `C:\Users\alema\OneDrive\Escritorio\laburo`: Docker multi-stage, Web Service, base administrada, migraciones al iniciar y disco montado en `/persistent`. La implementación se adaptó a un único servidor Node/Nitro para evitar un proxy y otro proceso dentro del contenedor.

## Qué ocurre durante el arranque

`docker-start.sh` ejecuta, en este orden:

1. `scripts/migrate.mjs`, que aplica todas las migraciones pendientes contra `DATABASE_URL`.
2. `scripts/seed-persistent.mjs`, que copia portada, héroes, jefes y atlas a `/persistent/characters`.
3. `.output/server/index.mjs`, que escucha en `0.0.0.0:$PORT`.

La copia es idempotente. `manifest.json` registra la versión, fecha y archivos disponibles. La ruta `/media/characters/:name` lee primero el disco y, si un archivo todavía no está allí, usa `public/battle` como respaldo.

## Creación con Blueprint

1. Subir el repositorio a GitHub.
2. En Render, elegir **New → Blueprint**.
3. Autorizar el repositorio y seleccionar la rama `main`.
4. Render detectará `render.yaml` y propondrá:
   - `influencers-battle-paraguay`, Web Service Docker con plan Starter.
   - `influencers-battle-db`, PostgreSQL 16.
   - disco `influencers-battle-media` de 1 GB montado en `/persistent`.
5. Ingresar el secreto `VENICE_API_KEY`.
6. Crear los recursos y esperar el primer deploy.
7. Probar `/health`; debe responder `{"ok":true,"database":"postgres"}`.

`DATABASE_URL` se toma de `connectionString` de la base del Blueprint. `LEADERBOARD_SECRET` se genera una sola vez por Render y `VENICE_API_KEY` usa `sync: false`, por lo que no queda escrito en Git.

## Límites del disco de Render

Render mantiene únicamente los cambios escritos debajo del punto de montaje. El build, el pre-deploy y otras instancias no pueden ver ese disco. Además, un Web Service con disco solo puede ejecutar una instancia y sus despliegues tienen un breve corte. Estas condiciones vienen de la documentación de [Persistent Disks](https://render.com/docs/disks) y [Deploys](https://render.com/docs/deploys).

Las fotos son recursos pequeños, por lo que 1 GB deja margen amplio. PostgreSQL no se guarda en ese disco: usa el servicio administrado y su URL interna dentro de la misma región, tal como recomienda [Connecting to Render Postgres](https://render.com/docs/postgresql-creating-connecting).

## Prueba local equivalente

```bash
copy .env.example .env
docker compose up --build
curl http://localhost:8080/health
```

Respuesta esperada:

```json
{ "ok": true, "service": "influencers-battle", "database": "postgres" }
```

Inspección del volumen:

```bash
docker compose exec game ls -lah /persistent/characters
```

## Actualización

Cada push a `main` dispara un nuevo deploy si el servicio conserva el auto-deploy activo. El contenedor vuelve a ejecutar migraciones y copia los recursos actualizados. Los datos del ranking permanecen en PostgreSQL y los archivos quedan en el disco.

## Recuperación

- Si `/health` devuelve `503`, revisar `DATABASE_URL` y los logs de migración.
- Si una foto devuelve `404`, revisar el log `[persistent]` y el contenido de `/persistent/characters`.
- Si Venice falla, el juego mantiene sus opciones escritas de respaldo; revisar `VENICE_API_KEY` sin exponerla en logs.
- Si el servicio no enlaza, confirmar que Render inyecte `PORT`; Nitro usa `HOST=0.0.0.0`.

## Fuentes oficiales

- [Docker on Render](https://render.com/docs/docker)
- [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Infrastructure as Code](https://render.com/docs/infrastructure-as-code)
- [Persistent Disks](https://render.com/docs/disks)
- [Web Services](https://render.com/docs/web-services)
- [Render Postgres](https://render.com/docs/postgresql-creating-connecting)
