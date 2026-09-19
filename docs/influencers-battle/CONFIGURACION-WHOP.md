# Configuración de Whop — PY-STAR GAMES

La tienda abre enlaces oficiales de Whop desde el servidor. No necesita una API key para cobrar: necesita un `purchase_url` válido por artículo. Todos los planes son de pago único.

## Catálogo definitivo

| Producto          |   Precio | Metadata `game_sku` | Variable en Render        |
| ----------------- | -------: | ------------------- | ------------------------- |
| Arsenal guaraní   | USD 3.99 | `arsenal`           | `WHOP_CHECKOUT_ARSENAL`   |
| Tereré medicinal  | USD 3.99 | `terere`            | `WHOP_CHECKOUT_TERERE`    |
| Ayuda del Pombero | USD 4.99 | `pombero`           | `WHOP_CHECKOUT_POMBERO`   |
| Energía desatada  | USD 3.99 | `energia`           | `WHOP_CHECKOUT_ENERGIA`   |
| Poder político    | USD 7.99 | `inmunidad`         | `WHOP_CHECKOUT_INMUNIDAD` |
| Armadura de acero | USD 5.99 | `armadura`          | `WHOP_CHECKOUT_ARMADURA`  |
| Poder del Luizón  | USD 6.99 | `luison`            | `WHOP_CHECKOUT_LUISON`    |
| Avance relámpago  | USD 4.99 | `avance`            | `WHOP_CHECKOUT_AVANCE`    |

## Puesta en marcha

1. Entrá a tu negocio en Whop y completá la verificación y el método de cobro directamente en Whop.
2. Creá un producto por fila. En cada producto creá un plan con `One-time`, moneda `USD`, método `Buy now`, stock ilimitado y el precio indicado.
3. Si el editor permite metadata, agregá `game_sku` con el valor de la tabla. La metadata viaja en eventos de pago y permite acreditar el artículo correcto después.
4. Abrí **Dashboard → Checkout links → Create checkout link**, elegí el producto y creá el enlace. En la configuración del enlace podés dejar desactivado **Show on store page** si querés venderlo solamente desde el juego.
5. Copiá el `purchase_url` completo de cada plan. Tiene un formato similar a `https://whop.com/tu-producto/checkout/plan_...`; no inventes ni edites esa URL.
6. En Render abrí `influencers-battle-paraguay` → **Environment**. Pegá cada URL en la variable correspondiente y guardá. Render iniciará un despliegue nuevo.
7. Abrí `https://juego-paraguay.onrender.com`, entrá a **Tienda** y probá los ocho botones. Cada uno debe abrir el producto correcto y mostrar el mismo precio que el juego.

Guía oficial: [crear checkout links](https://docs.whop.com/payments/create-checkout-link). La API también devuelve el campo `purchase_url` para cada plan: [planes de Whop](https://docs.whop.com/api-reference/plans/retrieve-plan).

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
