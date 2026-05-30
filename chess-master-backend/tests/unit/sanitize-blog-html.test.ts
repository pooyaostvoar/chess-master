import { sanitizeBlogHtml } from "../../src/utils/sanitize-blog-html";

describe("sanitizeBlogHtml", () => {
  it("preserves style and script tags for frontend rendering", () => {
    const html = `<!DOCTYPE html><html><head><style>* { margin: 0; }</style></head><body><p>Hello</p></body></html>`;
    const result = sanitizeBlogHtml(html);
    expect(result).toContain("<style");
    expect(result).toContain("<p>Hello</p>");
  });

  it("preserves script tags", () => {
    const html = `<p>Hi</p><script>alert(1)</script>`;
    expect(sanitizeBlogHtml(html)).toContain("<script");
    expect(sanitizeBlogHtml(html)).toContain("<p>Hi</p>");
  });

  it("removes iframe embeds", () => {
    const html = `<p>Hi</p><iframe src="https://evil.com"></iframe>`;
    expect(sanitizeBlogHtml(html)).not.toContain("<iframe");
    expect(sanitizeBlogHtml(html)).toContain("<p>Hi</p>");
  });
});
