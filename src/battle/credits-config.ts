/**
 * Reglas del saldo de golpes y los referidos. Compartido por cliente y servidor.
 *
 * - Un golpe = un puñetazo con un arma paga (guantes, mazo, hacha, magnum)
 *   cuando no la compraste suelta.
 * - El amigo que entra con tu link arranca con SIGNUP_BONUS golpes.
 * - Cada vez que ese amigo carga saldo, vos recibís REFERRAL_RATE de esa carga en golpes.
 */
export const SIGNUP_BONUS = 500;
export const REFERRAL_RATE = 0.3;
/** localStorage: código del amigo que te trajo, hasta que creás tu perfil. */
export const REF_KEY = "ib-ref-v1";

export function readStoredRef(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = localStorage.getItem(REF_KEY)?.trim().toUpperCase();
    return value && /^[A-Z0-9]{4,12}$/.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Guarda el ?ref= de la URL para cuando la persona cree su perfil. */
export function captureRef(search: string) {
  if (typeof window === "undefined") return;
  const ref = new URLSearchParams(search).get("ref")?.trim().toUpperCase();
  if (!ref || !/^[A-Z0-9]{4,12}$/.test(ref)) return;
  try {
    localStorage.setItem(REF_KEY, ref);
  } catch {
    /* private mode */
  }
}

export function referralLink(code: string, siteUrl = "https://www.influencerspy.pro") {
  return `${siteUrl.replace(/\/$/, "")}/hernan-rivas-abogado?ref=${code}`;
}

export function whatsappShare(link: string) {
  const text = `Entrá a pegarle a Hernán Rivas con mi link y arrancás con ${SIGNUP_BONUS} golpes gratis 🥊 ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
