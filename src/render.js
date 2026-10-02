import createDOMPurify from "dompurify";

export function renderDescription(win, html, raw, baseUrl) {
  const doc = win.document;
  if (!html) {
    const text = doc.createElement("div");
    text.className = "plain-text";
    text.textContent = raw;
    return text;
  }
  const fragment = createDOMPurify(win).sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "del",
      "blockquote",
      "pre",
      "code",
      "ul",
      "ol",
      "li",
      "a",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "details",
      "summary",
      "input",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "colspan",
      "rowspan",
      "start",
      "type",
      "checked",
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  for (const link of fragment.querySelectorAll("a")) {
    try {
      const url = new URL(link.getAttribute("href"), baseUrl);
      if (!["https:", "http:", "mailto:"].includes(url.protocol)) {
        link.removeAttribute("href");
        continue;
      }
      if (!link.hasAttribute("href")) continue;
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.referrerPolicy = "no-referrer";
    } catch {
      link.removeAttribute("href");
    }
  }
  for (const input of fragment.querySelectorAll("input")) {
    if (input.getAttribute("type") !== "checkbox") input.remove();
    else input.disabled = true;
  }
  if (!fragment.textContent.trim() && !fragment.querySelector("input, hr")) {
    const text = doc.createElement("div");
    text.className = "plain-text";
    text.textContent = raw;
    return text;
  }
  return fragment;
}
