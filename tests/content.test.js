import { before, test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

let script;
before(async () => {
  const result = await build({
    entryPoints: ["src/content.js"],
    bundle: true,
    define: { __APP_VERSION__: JSON.stringify("0.1.1") },
    write: false,
    format: "iife",
    loader: { ".css": "text" },
  });
  script = result.outputFiles[0].text;
});
const tick = () => new Promise((resolve) => setTimeout(resolve, 50));
function setup(
  t,
  fetcher,
  markup = '<div id="actions"><button id="approve" aria-label="Approve pull request">Approve</button><button>Merge</button></div>',
) {
  const dom = new JSDOM(
    `<html data-color-mode="dark"><head></head><body>${markup}</body></html>`,
    {
      url: "https://bitbucket.org/example/sample/pull-requests/42/diff",
      pretendToBeVisual: true,
      runScripts: "outside-only",
    },
  );
  t.after(() => dom.window.close());
  dom.window.HTMLElement.prototype.getClientRects = function () {
    return this.hidden ? [] : [{}];
  };
  dom.window.fetch = fetcher;
  dom.window.eval(script);
  const root = () =>
    dom.window.document.querySelector("#bbpd-extension").shadowRoot;
  const toggle = () =>
    dom.window.document
      .querySelector("#bbpd-action")
      .shadowRoot.querySelector("button");
  return { win: dom.window, doc: dom.window.document, root, toggle };
}
const response = (id, raw = "Sample description") => ({
  ok: true,
  status: 200,
  headers: new Headers({ "content-type": "application/json" }),
  json: async () => ({
    id,
    title: `Sample PR ${id}`,
    description: raw,
    rendered: { description: { html: `<p>${raw}</p>` } },
  }),
});

test("inserts beside Approve, loads on demand, toggles Markdown, resizes, and closes with Escape", async (t) => {
  let calls = 0;
  const { doc, win, root, toggle } = setup(t, async () => {
    calls++;
    return response(42);
  });
  assert.equal(
    doc.querySelector("#bbpd-action").nextElementSibling.id,
    "approve",
  );
  assert.equal(calls, 0);
  toggle().click();
  await tick();
  assert.equal(calls, 1);
  assert.equal(
    root().querySelector("article").textContent,
    "Sample description",
  );
  assert.equal(doc.documentElement.hasAttribute("data-bbpd-docked"), false);
  win.innerWidth = 1440;
  win.dispatchEvent(new win.Event("resize"));
  assert.equal(doc.documentElement.hasAttribute("data-bbpd-docked"), true);
  root()
    .querySelector(".resize")
    .dispatchEvent(new win.KeyboardEvent("keydown", { key: "ArrowLeft" }));
  assert.equal(
    doc.documentElement.style.getPropertyValue("--bbpd-width"),
    "444px",
  );
  root().querySelectorAll(".tab")[1].click();
  assert.equal(
    root().querySelector(".markdown").textContent,
    "Sample description",
  );
  doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(root().querySelector("aside").hidden, true);
  assert.equal(doc.documentElement.hasAttribute("data-bbpd-docked"), false);
  assert.equal(toggle().getAttribute("aria-expanded"), "false");
  toggle().click();
  await tick();
  assert.equal(calls, 1, "uses in-memory result until refresh or PR change");
  root().querySelector('[aria-label="Refresh description"]').click();
  await tick();
  assert.equal(calls, 2);
});

test("ignores stale PR responses on client-side navigation and removes action on non-PR pages", async (t) => {
  let resolveOld;
  let calls = 0;
  const { win, doc, root, toggle } = setup(t, async () => {
    calls++;
    if (calls === 1)
      return new Promise((resolve) => {
        resolveOld = resolve;
      });
    return response(43, "New PR description");
  });
  toggle().click();
  win.history.pushState({}, "", "/example/sample/pull-requests/43/diff");
  win.dispatchEvent(new win.PopStateEvent("popstate"));
  await tick();
  assert.match(root().querySelector("article").textContent, /New PR/);
  resolveOld(response(42, "Stale PR description"));
  await tick();
  assert.match(root().querySelector("article").textContent, /New PR/);
  assert.equal(
    root().querySelector("footer a").getAttribute("href"),
    "/example/sample/pull-requests/43/overview",
  );
  win.history.pushState({}, "", "/example/sample/src/main");
  win.dispatchEvent(new win.PopStateEvent("popstate"));
  await tick();
  assert.equal(doc.querySelector("#bbpd-action"), null);
  assert.equal(root().querySelector("aside").hidden, true);
});

test("reattaches after toolbar rerender and does not duplicate when reinjected", async (t) => {
  const { win, doc } = setup(t, async () => response(42));
  doc.querySelector("#actions").replaceChildren();
  await tick();
  assert.equal(
    doc.querySelector("#bbpd-action").hasAttribute("data-floating"),
    true,
  );
  const approve = doc.createElement("button");
  approve.textContent = "Unapprove";
  doc.querySelector("#actions").append(approve);
  await tick();
  assert.equal(doc.querySelector("#bbpd-action").nextElementSibling, approve);
  win.eval(script);
  assert.equal(doc.querySelectorAll("#bbpd-extension").length, 1);
  assert.equal(doc.querySelectorAll("#bbpd-action").length, 1);
});

test("error, retry, empty state and aborted close all leave a usable panel", async (t) => {
  let calls = 0;
  const { root, toggle } = setup(t, async () => {
    calls++;
    if (calls === 1) return { ok: false, status: 403 };
    return response(42, "");
  });
  toggle().click();
  await tick();
  assert.match(root().querySelector(".status").textContent, /cannot access/);
  assert.equal(
    root().querySelector('[aria-label="Refresh description"]').disabled,
    false,
  );
  root().querySelector('[aria-label="Refresh description"]').click();
  await tick();
  assert.match(root().querySelector(".status").textContent, /no description/);
});

test("closing during fetch cancels it and reopening retries", async (t) => {
  let calls = 0;
  let signal;
  const { root, toggle } = setup(t, async (url, options) => {
    calls++;
    if (calls > 1) return response(42);
    signal = options.signal;
    return new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("aborted")));
    });
  });
  toggle().click();
  root().querySelector('[aria-label="Close description"]').click();
  assert.equal(signal.aborted, true);
  toggle().click();
  await tick();
  assert.equal(calls, 2);
  assert.equal(
    root().querySelector("article").textContent,
    "Sample description",
  );
});

test("search navigates matches, survives format changes and resets on a different PR", async (t) => {
  const { root, win, toggle } = setup(t, async () =>
    response(42, "API request, api response"),
  );
  toggle().click();
  await tick();
  const search = root().querySelector('input[type="search"]');
  search.value = "api";
  search.dispatchEvent(new win.Event("input"));
  assert.equal(root().querySelectorAll("mark").length, 2);
  assert.equal(root().querySelector(".search-count").textContent, "1 / 2");
  root().querySelector('[aria-label="Next match"]').click();
  assert.equal(root().querySelector(".search-count").textContent, "2 / 2");
  search.dispatchEvent(
    new win.KeyboardEvent("keydown", { key: "Enter", shiftKey: true }),
  );
  assert.equal(root().querySelector(".search-count").textContent, "1 / 2");
  root().querySelectorAll(".tab")[1].click();
  assert.equal(root().querySelectorAll(".markdown mark").length, 2);
  search.value = "absent";
  search.dispatchEvent(new win.Event("input"));
  assert.equal(root().querySelector(".search-count").textContent, "No matches");
  assert.equal(
    root().querySelector('[aria-label="Next match"]').disabled,
    true,
  );
  win.history.pushState({}, "", "/example/sample/pull-requests/43/diff");
  win.dispatchEvent(new win.PopStateEvent("popstate"));
  await tick();
  assert.equal(search.value, "");
  assert.equal(root().querySelectorAll("mark").length, 0);
});

test("copies raw Markdown only on user action and handles denied clipboard access", async (t) => {
  const { root, win, toggle } = setup(t, async () =>
    response(42, "**Markdown**"),
  );
  const copied = [];
  win.navigator.clipboard = { writeText: async (value) => copied.push(value) };
  const copy = root().querySelector('[aria-label="Copy Markdown"]');
  assert.equal(copy.disabled, true);
  assert.equal(copied.length, 0);
  toggle().click();
  await tick();
  assert.equal(copied.length, 0);
  copy.click();
  await tick();
  assert.deepEqual(copied, ["**Markdown**"]);
  assert.match(root().querySelector(".notice").textContent, /copied/);
  win.navigator.clipboard.writeText = async () => {
    throw new Error("denied");
  };
  copy.click();
  await tick();
  assert.match(root().querySelector(".notice").textContent, /copy it manually/);
  assert.equal(copy.disabled, false);
  const release = root().querySelector("footer a:last-child");
  assert.match(release.textContent, /v0.1.1/);
  assert.equal(
    release.href,
    "https://github.com/wondonghwi/bitbucket-pr-description/releases/latest",
  );
});

test("a late clipboard completion cannot overwrite a new PR or leave copying disabled on reopen", async (t) => {
  const { root, win, toggle } = setup(t, async () => response(42));
  let complete;
  win.navigator.clipboard = {
    writeText: () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  };
  toggle().click();
  await tick();
  root().querySelector('[aria-label="Copy Markdown"]').click();
  toggle().click();
  complete();
  await tick();
  toggle().click();
  assert.equal(
    root().querySelector('[aria-label="Copy Markdown"]').disabled,
    false,
  );
  assert.equal(root().querySelector(".notice").hidden, true);
});
