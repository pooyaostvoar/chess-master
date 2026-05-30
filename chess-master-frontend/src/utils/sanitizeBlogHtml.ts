const DANGEROUS_SELECTORS = "iframe, object, embed, meta, base, title";

function removeDangerousElements(root: ParentNode): void {
  root.querySelectorAll(DANGEROUS_SELECTORS).forEach((el) => el.remove());
}

function isFullHtmlDocument(html: string): boolean {
  const trimmed = html.trim();
  return (
    /<!DOCTYPE\s/i.test(trimmed) ||
    /<html[\s>]/i.test(trimmed) ||
    (/<head[\s>]/i.test(trimmed) && /<body[\s>]/i.test(trimmed))
  );
}

function outerHtmlOf(elements: Iterable<Element>): string {
  return Array.from(elements)
    .map((el) => el.outerHTML)
    .join("");
}

/**
 * Full HTML documents are reduced to body markup inside a wrapper div.
 * Styles and scripts from head/body are kept so embedded posts render as intended.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (isFullHtmlDocument(html)) {
      removeDangerousElements(doc);

      const styles = doc.querySelectorAll(
        "head style, head link[rel='stylesheet' i], body style"
      );
      const scripts = doc.querySelectorAll("head script, body script");

      const bodyClone = doc.body.cloneNode(true) as HTMLElement;
      bodyClone.querySelectorAll("style, script").forEach((el) => el.remove());
      removeDangerousElements(bodyClone);

      const bodyContent = bodyClone.innerHTML.trim();
      const stylesHtml = outerHtmlOf(styles);
      const scriptsHtml = outerHtmlOf(scripts);

      return `${stylesHtml}<div class="blog-post-html-body">${bodyContent}</div>${scriptsHtml}`;
    }

    removeDangerousElements(doc.body);
    return doc.body.innerHTML.trim();
  }

  return stripUnsafeHtmlFallback(html);
}

function stripUnsafeHtmlFallback(html: string): string {
  let out = html;
  out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  out = out.replace(/<object[\s\S]*?<\/object>/gi, "");
  out = out.replace(/<embed[^>]*>/gi, "");
  out = out.replace(/<meta[^>]*>/gi, "");
  out = out.replace(/<base[^>]*>/gi, "");
  out = out.replace(/<!DOCTYPE[^>]*>/gi, "");

  if (isFullHtmlDocument(out)) {
    const styles: string[] = [];
    out.replace(/<style[\s\S]*?<\/style>/gi, (match) => {
      styles.push(match);
      return "";
    });
    out.replace(
      /<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi,
      (match) => {
        styles.push(match);
        return "";
      }
    );

    const scripts: string[] = [];
    out.replace(/<script[\s\S]*?<\/script>/gi, (match) => {
      scripts.push(match);
      return "";
    });

    const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : out;
    bodyContent = bodyContent.replace(/<\/?(?:html|head|body)[^>]*>/gi, "");
    bodyContent = bodyContent.trim();

    return `${styles.join("")}<div class="blog-post-html-body">${bodyContent}</div>${scripts.join("")}`;
  }

  return out.trim();
}

const loadedExternalScripts = new Set<string>();

function runInlineScripts(scripts: HTMLScriptElement[]): void {
  const code = scripts
    .map((s) => s.textContent ?? "")
    .join("\n")
    .trim();
  scripts.forEach((s) => s.remove());
  if (!code) return;

  try {
    const run = new Function(code);
    run();
  } catch (err) {
    console.error("Blog post inline script failed:", err);
  }
}

function runExternalScript(oldScript: HTMLScriptElement): void {
  const src = oldScript.getAttribute("src");
  if (!src) {
    oldScript.remove();
    return;
  }

  if (loadedExternalScripts.has(src)) {
    oldScript.remove();
    return;
  }
  loadedExternalScripts.add(src);

  const newScript = document.createElement("script");
  Array.from(oldScript.attributes).forEach((attr) => {
    newScript.setAttribute(attr.name, attr.value);
  });
  oldScript.replaceWith(newScript);
}

/** Activate <script> tags injected via dangerouslySetInnerHTML. */
export function runBlogPostScripts(container: HTMLElement): void {
  const scripts = Array.from(container.querySelectorAll("script"));
  if (scripts.length === 0) return;

  const inlineScripts = scripts.filter((s) => !s.getAttribute("src"));
  const externalScripts = scripts.filter((s) => s.getAttribute("src"));

  runInlineScripts(inlineScripts);
  externalScripts.forEach(runExternalScript);
}
