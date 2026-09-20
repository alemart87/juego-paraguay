import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoLayout } from "@/seo/SeoLayout";
import { SITE_URL } from "@/seo/content";

const description =
  "Aprendé a jugar Influencers Battle en celular y PC: movimiento, armas, poderes, jefes, ranking, sonido y consejos para cada episodio.";

export const Route = createFileRoute("/como-jugar")({
  head: () => ({
    meta: [
      { title: "Cómo jugar Influencers Battle | Guía completa" },
      { name: "description", content: description },
      { property: "og:title", content: "Cómo jugar Influencers Battle" },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/como-jugar` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/como-jugar` }],
  }),
  component: HowToPlay,
});

function HowToPlay() {
  return (
    <SeoLayout>
      <section className="seo-prose-hero">
        <span className="seo-kicker">GUÍA OFICIAL</span>
        <h1>Entrá y peleá.</h1>
        <p>
          Todo lo necesario para dominar los controles, las armas, el hype y los cinco jefes desde
          un celular o una computadora.
        </p>
      </section>
      <article className="seo-content seo-article">
        <h2>Cómo empezar</h2>
        <div className="seo-steps">
          <div className="seo-step">
            <h3>Elegí un personaje</h3>
            <p>
              Cada combatiente cambia la vida, velocidad, poder y forma de controlar el escenario.
              Empezá con Masivo Bro si querés resistencia u Onichan si preferís velocidad.
            </p>
          </div>
          <div className="seo-step">
            <h3>Dominá el movimiento</h3>
            <p>
              En móvil usá el joystick izquierdo. Los botones derechos permiten saltar, atacar,
              hacer dash y activar el poder. En PC usá A/D, Espacio, J, Shift y R.
            </p>
          </div>
          <div className="seo-step">
            <h3>Combiná las armas</h3>
            <p>
              Alterná AK, escopeta, SMG, pistola, bate, cuchillo y puños. Q cambia el arma y G lanza
              granadas. Las cajas reponen recursos.
            </p>
          </div>
          <div className="seo-step">
            <h3>Cargá el hype</h3>
            <p>
              Golpear y mantener combos llena la barra especial. Al llegar al 100 %, el poder se
              transforma en el súper único del personaje.
            </p>
          </div>
          <div className="seo-step">
            <h3>Leé al jefe</h3>
            <p>
              Las señales de color anticipan rayos, ondas y cargas. No ataques sin parar: esquivá el
              patrón y respondé durante su recuperación.
            </p>
          </div>
        </div>
        <h3>Ranking nacional</h3>
        <p>
          Podés crear tu perfil desde el ranking con un apodo y correo o teléfono privado. Al
          finalizar una victoria se publica solamente el apodo, personaje, episodio, tiempo y
          puntaje.
        </p>
        <h3>Sonido en celular</h3>
        <p>
          Los navegadores móviles necesitan un toque para permitir audio. Tocá Entrar a la batalla o
          usá Probar sonido en Ajustes. El juego vuelve a activar el audio después de desbloquear el
          teléfono o regresar desde otra aplicación.
        </p>
        <h3>Compras y beneficios</h3>
        <p>
          Durante la partida, tocá Arsenal para pausar y activar una ventaja sin perder el avance.
          En cada episodio recibís pruebas gratuitas al superar 600, 1.800 y 3.500 puntos. Los
          artículos opcionales se pagan en Whop; usá el mismo correo guardado en tu perfil y tocá
          Sincronizar al volver para que el beneficio aparezca. Consultá la{" "}
          <Link to="/politica-de-compras">política de compras</Link> para conocer el proceso y los
          reembolsos.
        </p>
        <div className="seo-actions">
          <Link to="/" className="seo-button primary">
            Jugar gratis
          </Link>
          <Link to="/personajes" className="seo-button">
            Comparar personajes
          </Link>
        </div>
      </article>
    </SeoLayout>
  );
}
