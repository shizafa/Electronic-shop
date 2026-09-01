function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

// Minimal, dependency-free Markdown renderer for admin-authored policy text: headings (#/##/###),
// bold/italic, links, unordered lists (-) and paragraphs. Raw input is HTML-escaped before any
// tag is generated, so pasted HTML/script in a policy field can't execute on the storefront.
export function renderMarkdown(source: string): string {
  const blocks = source.trim().split(/\n{2,}/);

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());

      const heading = lines.length === 1 ? lines[0].match(/^(#{1,3})\s+(.*)/) : null;
      if (heading) {
        const level = heading[1].length + 1; // # -> h2, ## -> h3, ### -> h4
        return `<h${level}>${renderInline(heading[2])}</h${level}>`;
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        const items = lines.map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ""))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${lines.map(renderInline).join("<br />")}</p>`;
    })
    .join("\n");
}
