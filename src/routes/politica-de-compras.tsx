import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoLayout } from "@/seo/SeoLayout";
import { SITE_URL } from "@/seo/content";

const description =
  "Política de compras de Influencers Battle: precios, entrega de beneficios, pagos seguros con Whop, reembolsos y soporte.";

export const Route = createFileRoute("/politica-de-compras")({
  head: () => ({
    meta: [
      { title: "Política de compras y pagos | Influencers Battle" },
      { name: "description", content: description },
      { property: "og:url", content: `${SITE_URL}/politica-de-compras` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/politica-de-compras` }],
  }),
  component: Purchases,
});

function Purchases() {
  return (
    <SeoLayout>
      <section className="seo-prose-hero">
        <span className="seo-kicker">TIENDA PY-STAR · WHOP</span>
        <h1>Compras claras.</h1>
        <p>
          Cómo se cobran, entregan y administran las ventajas opcionales disponibles dentro de
          Influencers Battle.
        </p>
      </section>
      <article className="seo-content seo-article">
        <h2>Política de compras dentro de la aplicación</h2>
        <h3>Proveedor de pagos</h3>
        <p>
          Todos los pagos se completan en Whop. Antes de confirmar, Whop muestra el artículo,
          importe, moneda e información aplicable al pago. PY-STAR GAMES no almacena números
          completos de tarjeta.
        </p>
        <h3>Precios</h3>
        <p>
          Los precios visibles en la tienda están expresados en dólares estadounidenses. Whop puede
          mostrar una conversión estimada o cobrar en una moneda compatible según el método de pago
          y la ubicación del comprador.
        </p>
        <h3>Entrega del beneficio</h3>
        <p>
          Usá en Whop el mismo correo configurado en tu perfil del ranking. Después de un pago
          exitoso, un webhook firmado registra la compra y asigna el artículo a ese perfil. Si te
          registraste con teléfono, agregá el correo de compras en el formulario del ranking.
        </p>
        <h3>Artículos digitales</h3>
        <p>
          Los productos son ventajas digitales para Influencers Battle, como armamento especial,
          energía, armadura o poderes de una partida. No representan bienes físicos, inversiones,
          moneda de curso legal ni premios canjeables por dinero.
        </p>
        <h3>Problemas de entrega</h3>
        <p>
          Si Whop confirmó el pago pero el beneficio no aparece, verificá que el correo de Whop
          coincida con el correo de compras de tu perfil. Conservá el identificador de pago para que
          el soporte pueda localizar la operación sin solicitar datos de tarjeta.
        </p>
        <h3>Reembolsos</h3>
        <p>
          Las solicitudes se gestionan mediante Whop y están sujetas a las condiciones mostradas
          durante la compra y a la normativa aplicable. Cuando un reembolso se confirma, el webhook
          cambia el beneficio relacionado al estado reembolsado.
        </p>
        <h3>Compras de menores</h3>
        <p>
          Influencers Battle está orientado a mayores de 18 años. Quien realiza una compra declara
          tener capacidad para autorizar el método de pago utilizado.
        </p>
        <p>
          Para saber cómo se trata el correo utilizado en la asignación, consultá nuestra{" "}
          <Link to="/privacidad">política de privacidad</Link>.
        </p>
        <div className="seo-actions">
          <Link to="/" className="seo-button primary">
            Volver al juego
          </Link>
          <Link to="/como-jugar" className="seo-button">
            Cómo jugar
          </Link>
        </div>
      </article>
    </SeoLayout>
  );
}
