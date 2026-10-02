// Search text nodes only: preserve sanitized links, formatting and literal input.
export function highlightMatches(article, query) {
  for (const mark of article.querySelectorAll("mark[data-bbpd-match]"))
    mark.replaceWith(article.ownerDocument.createTextNode(mark.textContent));
  article.normalize();
  if (!query) return [];
  const document = article.ownerDocument;
  const walker = document.createTreeWalker(article, 4); // SHOW_TEXT
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const expression = new RegExp(
    query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "giu",
  );
  const matches = [];
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of node.textContent.matchAll(expression)) {
      fragment.append(
        document.createTextNode(node.textContent.slice(offset, match.index)),
      );
      const mark = document.createElement("mark");
      mark.dataset.bbpdMatch = "";
      mark.textContent = match[0];
      fragment.append(mark);
      matches.push(mark);
      offset = match.index + match[0].length;
    }
    if (!offset) continue;
    fragment.append(document.createTextNode(node.textContent.slice(offset)));
    node.replaceWith(fragment);
  }
  return matches;
}
