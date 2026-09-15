// Keeps post-login/signup redirects on this site. `next` comes straight from the URL
// (/login?next=...), so without this a link like /login?next=https://evil.example would send
// the user off-site the moment they sign in.
const FALLBACK = "/";
const BASE = "http://internal.invalid";

export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return FALLBACK;

  // Exactly one leading slash — browsers treat "//host" and "/\host" as protocol-relative.
  if (!next.startsWith("/") || next[1] === "/" || next[1] === "\\") return FALLBACK;

  // No scheme-like prefix ("javascript:", "data:") before the first path segment. Already
  // implied by the leading-slash check; kept in case that check is ever loosened.
  if (/^[^/?#]*:/.test(next)) return FALLBACK;

  // Backstop: resolve it the way the browser will. The URL parser strips tabs/newlines and
  // reads "\" as "/", so "/\t/evil.example" passes the checks above but resolves off-site.
  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return FALLBACK;
  }
  if (url.origin !== BASE) return FALLBACK;

  // The original, not url.pathname: normalizing turns "/..//evil.example" into "//evil.example".
  return next;
}
