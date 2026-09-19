# Configuración de Whop — PY-STAR GAMES

La tienda usa el SDK oficial `@whop/sdk` exclusivamente en el servidor. Al primer clic de cada artículo crea una configuración de checkout reutilizable con un plan de pago único inline, recibe el `purchase_url` y lo guarda en `/persistent/whop-checkouts.json`. No hace falta crear ocho productos manualmente.

## Catálogo definitivo

| Producto          |   Precio | Metadata `game_sku` |
| ----------------- | -------: | ------------------- |
| Arsenal guaraní   | USD 3.99 | `arsenal`           |
| Tereré medicinal  | USD 3.99 | `terere`            |
| Ayuda del Pombero | USD 4.99 | `pombero`           |
| Energía desatada  | USD 3.99 | `energia`           |
| Poder político    | USD 7.99 | `inmunidad`         |
| Armadura de acero | USD 5.99 | `armadura`          |
| Poder del Luizón  | USD 6.99 | `luison`            |
| Avance relámpago  | USD 4.99 | `avance`            |

## Puesta en marcha

1. Entrá a tu negocio en Whop y completá la verificación y el método de cobro directamente allí.
2. Abrí **Developer → Account API Keys → Create**. Para el primer setup elegí el rol **Admin**, como recomienda el quickstart para empezar; después podés sustituirlo por una política más limitada que permita crear checkout configurations y planes, y leer los recursos resultantes.
3. Copiá la clave una sola vez. En Render abrí `influencers-battle-paraguay` → **Environment**, agregá `WHOP_API_KEY` y guardá. Nunca uses esta clave en una variable `VITE_*`.
4. Confirmá `PUBLIC_SITE_URL=https://www.influencerspy.pro` y `PERSISTENT_DIR=/persistent`.
5. Abrí `https://www.influencerspy.pro`, entrá a **Tienda** y tocá cada producto. El primer clic puede tardar un instante mientras el servidor crea el checkout; después reutiliza la URL guardada.

La guía oficial confirma que una sola llamada a `checkoutConfigurations.create` puede recibir un plan inline `one_time` y devolver un checkout en `purchase_url`: [Quickstart de Whop](https://docs.whop.com/developer/quickstart). El SDK también aplica la versión fechada de la API automáticamente.

Los enlaces `WHOP_CHECKOUT_*` permanecen como overrides opcionales para migrar checkouts ya existentes. Si están vacíos, se usa el SDK.

## Acreditación automática dentro del juego

Los enlaces habilitan el cobro. Para entregar el poder comprado sin intervención manual hace falta una cuenta vinculada al jugador y un webhook de Whop. La implementación segura debe:

1. Recibir el evento de pago en una ruta HTTPS del servidor.
2. Verificar `webhook-id`, `webhook-timestamp` y `webhook-signature` antes de confiar en el cuerpo.
3. Rechazar eventos repetidos usando el identificador único del mensaje.
4. Leer `game_sku` de la metadata del plan y acreditar el artículo en PostgreSQL al jugador asociado.
5. Registrar reembolsos o revocaciones y retirar el beneficio cuando corresponda.

No se debe conceder un poder por una redirección del navegador ni por parámetros de URL: el servidor solo debe confiar en un webhook firmado. Whop documenta los encabezados y exige responder `200` cuando el evento fue procesado.

## Conexión opcional para administrar Whop con IA

El MCP oficial de la API de Whop es `https://mcp.whop.com/mcp`; requiere inicio de sesión y autorización en el navegador. El MCP de documentación es `https://docs.whop.com/mcp`. Instalar una guía o skill no conecta la cuenta ni concede permisos.
