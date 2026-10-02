import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { highlightMatches } from "../src/search.js";

test("search treats punctuation literally and preserves safe formatting across repeated searches", (t) => {
  const dom = new JSDOM(
    '<article><p><a href="https://example.com">API [v1]</a> and api [v1]</p><pre>API [v1]</pre></article>',
  );
  t.after(() => dom.window.close());
  const article = dom.window.document.querySelector("article");
  const original = article.textContent;
  assert.equal(highlightMatches(article, "api [v1]").length, 3);
  assert.equal(article.textContent, original);
  assert.equal(article.querySelector("a").href, "https://example.com/");
  assert.equal(highlightMatches(article, "no result").length, 0);
  assert.equal(article.querySelectorAll("mark").length, 0);
  assert.equal(highlightMatches(article, "API").length, 3);
  highlightMatches(article, "");
  assert.equal(article.querySelectorAll("mark").length, 0);
  assert.equal(article.textContent, original);
});
