import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { renderDescription } from "../src/render.js";

const base = "https://bitbucket.org/example/sample/pull-requests/42";

test("preserves readable Markdown markup, code, tables, and disabled tasks", () => {
  const { window } = new JSDOM();
  const fragment = renderDescription(
    window,
    '<h2>Change</h2><pre><code>const x = 1;</code></pre><table><tr><td>Pass</td></tr></table><input type="checkbox" checked><input type="text" value="secret">',
    "raw",
    base,
  );
  assert.equal(fragment.querySelector("h2").textContent, "Change");
  assert.equal(fragment.querySelector("code").textContent, "const x = 1;");
  assert.equal(fragment.querySelector("td").textContent, "Pass");
  assert.equal(fragment.querySelectorAll("input").length, 1);
  assert.equal(fragment.querySelector("input").disabled, true);
  window.close();
});

test("removes executable HTML, CSS, embedded frames, images and unsafe URLs", () => {
  const { window } = new JSDOM();
  const fragment = renderDescription(
    window,
    '<script>alert(1)</script><style>body{display:none}</style><iframe src="https://example.org"></iframe><img src="https://example.org/pixel" onerror="alert(1)"><svg onload="alert(1)"></svg><p onclick="alert(1)" style="color:red" id="collision">Safe</p><a href="javascript:alert(1)">Bad</a><a href="data:text/html,bad">Data</a><a href="/example/sample">Good</a>',
    "raw",
    base,
  );
  assert.equal(fragment.querySelector("script, style, iframe, img, svg"), null);
  assert.equal(fragment.querySelector("[onclick], [style], [id], [src]"), null);
  const links = fragment.querySelectorAll("a");
  assert.equal(links[0].hasAttribute("href"), false);
  assert.equal(links[1].hasAttribute("href"), false);
  assert.equal(links[2].href, "https://bitbucket.org/example/sample");
  assert.equal(links[2].rel, "noopener noreferrer");
  assert.equal(links[2].referrerPolicy, "no-referrer");
  window.close();
});

test("plain-text fallback never interprets raw Markdown as HTML", () => {
  const { window } = new JSDOM();
  const text = renderDescription(
    window,
    "",
    "<img src=x onerror=alert(1)>",
    base,
  );
  assert.equal(text.textContent, "<img src=x onerror=alert(1)>");
  assert.equal(text.querySelector("img"), null);
  window.close();
});
