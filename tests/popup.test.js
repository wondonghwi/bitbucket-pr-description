import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const html = readFileSync("extension/popup.html", "utf8");
const script = readFileSync("extension/popup.js", "utf8");
async function popup(t, installType, updateUrl, fail = false) {
  const dom = new JSDOM(html, { runScripts: "outside-only" });
  t.after(() => dom.window.close());
  dom.window.chrome = {
    runtime: {
      id: "example-extension-id",
      getManifest: () => ({ version: "2.3.4", update_url: updateUrl }),
    },
    management: {
      getSelf: async () => {
        if (fail) throw new Error("unavailable");
        return { installType };
      },
    },
  };
  dom.window.eval(script);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return dom.window.document;
}

test("popup displays Chrome's installed version and explicit fresh-folder instructions for a development install", async (t) => {
  const doc = await popup(t, "development");
  assert.equal(doc.querySelector("#version").textContent, "v2.3.4");
  assert.match(doc.querySelector("#install-mode").textContent, /시험 설치/);
  assert.match(
    doc.querySelector("#update-help").textContent,
    /자동 업데이트되지/,
  );
  assert.match(doc.querySelector("#update-help").textContent, /덮어쓰지/);
  assert.match(doc.querySelector("#update-link").href, /github.com/);
});

test("store installs offer the real item link, while unknown sources never claim automatic updates", async (t) => {
  const store = await popup(
    t,
    "normal",
    "https://clients2.google.com/service/update2/crx",
  );
  assert.match(store.querySelector("#install-mode").textContent, /웹스토어/);
  assert.match(
    store.querySelector("#update-help").textContent,
    /자동으로 업데이트/,
  );
  assert.equal(
    store.querySelector("#update-link").href,
    "https://chromewebstore.google.com/detail/example-extension-id",
  );
  const unknown = await popup(
    t,
    "normal",
    "https://example.invalid/update.xml",
  );
  assert.doesNotMatch(
    unknown.querySelector("#update-help").textContent,
    /자동/,
  );
});

test("version remains visible if install-type inspection fails, without requiring broad extension permissions", async (t) => {
  const doc = await popup(t, undefined, undefined, true);
  assert.equal(doc.querySelector("#version").textContent, "v2.3.4");
  assert.match(doc.querySelector("#install-mode").textContent, /확인 불가/);
  const manifest = JSON.parse(readFileSync("extension/manifest.json", "utf8"));
  assert.equal(manifest.permissions, undefined);
  assert.equal(manifest.action.default_popup, "popup.html");
});
