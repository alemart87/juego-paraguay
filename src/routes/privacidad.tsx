import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoLayout } from "@/seo/SeoLayout";
import { SITE_URL } from "@/seo/content";

const description =
  "Política de privacidad de Influencers Battle y PY-STAR GAMES: ranking, datos de contacto, IA, pagos Whop y almacenamiento local.";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad | Influencers Battle" },
      { name: "description", content: description },
      { property: "og:url", content: `${SITE_URL}/privacidad` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacidad` }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SeoLayout>
      <section className="seo-prose-hero">
        <span className="seo-kicker">LEGAL · ACTUALIZADO 19/09/2026</span>
        <h1>Privacidad.</h1>
        <p>
          Qué información utiliza Influencers Battle, para qué se usa y cómo protegemos el contacto
          de quienes participan del ranking.
        </p>
      </section>
      <article className="seo-content seo-article">
        <h2>Información que tratamos</h2>
        <h3>Progreso local</h3>
        <p>
          El personaje elegido, ajustes, récords, recompensas gratuitas, inventario de prueba y
          preferencias se guardan en el almacenamiento local del navegador. Esta información
          permanece en el dispositivo hasta que el usuario borra los datos del sitio.
        </p>
        <h3>Ranking</h3>
        <p>
          Para crear un perfil solicitamos un apodo y un correo electrónico o número de teléfono. El
          contacto se normaliza y se transforma mediante HMAC antes de guardarse; no se muestra
          públicamente. Si elegís una foto, la recortamos en el navegador y la guardamos en el
          almacenamiento persistente del juego. El ranking publica la foto, apodo, personaje,
          episodio, tiempo, combo y puntaje.
        </p>
        <h3>Compras</h3>
        <p>
          Whop procesa el pago y nos envía el identificador de la transacción, producto, estado y
          correo del comprador mediante un webhook firmado. Usamos el correo transformado para
          relacionar el beneficio con el perfil correspondiente. No recibimos ni almacenamos datos
          completos de tarjetas.
        </p>
        <h3>Conversaciones con IA</h3>
        <p>
          Las conversaciones opcionales con personajes se envían a Venice AI para generar una
          respuesta dentro del juego. Evitá incluir información personal en esos mensajes. Aplicamos
          límites y reglas para conservar el tono ficticio.
        </p>
        <h3>Seguridad y conservación</h3>
        <p>
          Aplicamos verificación de firmas para webhooks, consultas parametrizadas y separación
          entre contacto privado y datos públicos. Conservamos registros de compra mientras sean
          necesarios para entregar el beneficio, gestionar reembolsos y prevenir duplicados.
        </p>
        <h3>Servicios externos</h3>
        <p>
          El juego utiliza Render para alojamiento, PostgreSQL para datos persistentes, Whop para
          pagos y Venice AI para conversaciones opcionales. Cada proveedor aplica sus propias
          políticas.
        </p>
        <h3>Decisiones del usuario</h3>
        <p>
          Participar del ranking, comprar artículos y conversar con la IA son funciones opcionales.
          Podés jugar sin publicar un contacto. Para consultas de privacidad podés utilizar los
          canales oficiales publicados por PY-STAR GAMES.
        </p>
        <p>
          Consultá también la{" "}
          <Link to="/politica-de-compras">política de compras dentro de la aplicación</Link>.
        </p>
      </article>
    </SeoLayout>
  );
}
