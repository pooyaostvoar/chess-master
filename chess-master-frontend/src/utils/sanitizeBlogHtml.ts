/**
 * Blog posts may be pasted as full HTML documents with <style> blocks.
 * Those rules apply document-wide and break the app layout/nav.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc
      .querySelectorAll(
        "style, script, link, meta, base, title, head, iframe, object, embed"
      )
      .forEach((el) => el.remove());

    const body = doc.body;
    body
      .querySelectorAll(
        "style, script, link, meta, base, title, iframe, object, embed"
      )
      .forEach((el) => el.remove());

    return body.innerHTML.trim();
  }

  return stripUnsafeHtml(html);
}

function stripUnsafeHtml(html: string): string {
  let out = html;
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<link[^>]*>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/<!DOCTYPE[^>]*>/gi, "");
  const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) out = bodyMatch[1];
  out = out.replace(/<\/?(?:html|head|body)[^>]*>/gi, "");
  return out.trim();
}
