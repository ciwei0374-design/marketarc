const INTERNAL_ROUTES = new Set(["/", "/#question", "/today", "/map"]);

function externalUrl(href: string) {
  try {
    const url = new URL(href);
    if (!(["http:", "https:"].includes(url.protocol)) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function domainIdentity(value: string | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/^www\./, "");
  return normalized && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized) ? normalized : null;
}

export function isClickableSource(source: { name: string; publisher?: string; url?: string }) {
  if (!source.url) return false;
  const url = externalUrl(source.url);
  if (!url) return false;
  const identity = domainIdentity(source.publisher) ?? domainIdentity(source.name);
  if (!identity) return false;
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  return hostname === identity || hostname.endsWith(`.${identity}`);
}

export function isClickableStoryAction(href: string, validAnchorIds: ReadonlySet<string>) {
  if (externalUrl(href)) return true;
  if (INTERNAL_ROUTES.has(href)) return true;
  if (href.startsWith("/analysis?") && new URL(href, "https://marketarc.local").pathname === "/analysis") return true;
  if (href.startsWith("#")) return validAnchorIds.has(href.slice(1));
  return false;
}
