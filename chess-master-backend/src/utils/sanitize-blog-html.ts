/** Remove only unsafe embed tags; styles/scripts are handled on the frontend. */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  return html
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .trim();
}
