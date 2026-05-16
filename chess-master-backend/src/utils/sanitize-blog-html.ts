/** Strip tags that leak global styles/scripts into the page when rendered. */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  let out = html;
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<link[^>]*>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/<!DOCTYPE[^>]*>/gi, "");

  const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    out = bodyMatch[1];
  }

  out = out.replace(/<\/?(?:html|head|body)[^>]*>/gi, "");
  return out.trim();
}
