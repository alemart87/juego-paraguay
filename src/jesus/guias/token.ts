/** Token del comprador en el navegador: el de WhatsApp si vino por el link de Jesús, o uno propio. */
const KEY = "jesus-guias-token-v1";
const WA_KEY = "jesus-te-ama-wa-token-v1";
const TOKEN_RE = /^[a-f0-9]{24,64}$/;

export function buyerToken(fromUrl?: string | null): string {
  let token = fromUrl && TOKEN_RE.test(fromUrl) ? fromUrl : "";
  try {
    if (!token) token = localStorage.getItem(KEY) || sessionStorage.getItem(WA_KEY) || "";
    if (!TOKEN_RE.test(token)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    localStorage.setItem(KEY, token);
  } catch {
    if (!TOKEN_RE.test(token)) token = `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.padEnd(32, "0").slice(0, 32);
  }
  return token;
}
