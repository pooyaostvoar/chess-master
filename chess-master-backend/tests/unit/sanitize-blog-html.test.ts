import { sanitizeBlogHtml } from "../../src/utils/sanitize-blog-html";

describe("sanitizeBlogHtml", () => {
  it("removes style tags that would break global layout", () => {
    const html = `<!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; }</style></head><body><p>Hello</p></body></html>`;
    const result = sanitizeBlogHtml(html);
    expect(result).not.toContain("<style");
    expect(result).toContain("<p>Hello</p>");
  });

  it("strips script tags", () => {
    const html = `<p>Hi</p><script>alert(1)</script>`;
    expect(sanitizeBlogHtml(html)).toBe("<p>Hi</p>");
  });
});
