import test from "node:test";
import assert from "node:assert/strict";
import { loadDescription, parsePullRequest } from "../src/bitbucket.js";

const pr = parsePullRequest(
  "https://bitbucket.org/example/sample/pull-requests/42/diff#file",
);

test("recognizes PR tabs and excludes unrelated origins and routes", () => {
  assert.equal(pr.id, "42");
  assert.equal(pr.key, "example/sample/42");
  assert.equal(
    parsePullRequest("https://bitbucket.org/example/sample/pull-requests"),
    null,
  );
  assert.equal(
    parsePullRequest("https://example.org/example/sample/pull-requests/42"),
    null,
  );
  assert.equal(
    parsePullRequest(
      "https://bitbucket.org/example/sample/pull-requests/42oops",
    ),
    null,
  );
});

function response(body, status = 200, contentType = "application/json") {
  return {
    ok: status === 200,
    status,
    headers: new Headers({ "content-type": contentType }),
    json: async () => body,
  };
}

test("requests only the current PR, using an uncached read and the existing session", async () => {
  const abort = new AbortController();
  const result = await loadDescription(
    pr,
    abort.signal,
    async (url, options) => {
      assert.equal(
        url,
        "/!api/2.0/repositories/example/sample/pullrequests/42?fields=id,title,description,rendered.description,summary",
      );
      assert.equal(options.method, "GET");
      assert.equal(options.credentials, "same-origin");
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      assert.equal(options.signal, abort.signal);
      assert.equal(options.headers.Authorization, undefined);
      return response({
        id: 42,
        title: "A sample change",
        description: "# Hello",
        rendered: { description: { html: "<h1>Hello</h1>" } },
      });
    },
  );
  assert.equal(result.html, "<h1>Hello</h1>");
  assert.equal(result.raw, "# Hello");
});

test("handles empty descriptions and summary responses without losing the distinction", async () => {
  assert.equal(
    (
      await loadDescription(pr, undefined, async () =>
        response({ id: 42, description: "" }),
      )
    ).raw,
    "",
  );
  assert.equal(
    (
      await loadDescription(pr, undefined, async () =>
        response({ id: 42, summary: { raw: "Hello", html: "<p>Hello</p>" } }),
      )
    ).raw,
    "Hello",
  );
});

test("rejects permission errors, sign-in HTML, missing description, and a different PR", async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    await assert.rejects(
      loadDescription(pr, undefined, async () => response({}, status)),
      /.+/,
    );
  }
  await assert.rejects(
    loadDescription(pr, undefined, async () => response({}, 200, "text/html")),
    /sign-in/,
  );
  await assert.rejects(
    loadDescription(pr, undefined, async () => response({ id: 42 })),
    /unexpected/,
  );
  await assert.rejects(
    loadDescription(pr, undefined, async () =>
      response({ id: 43, description: "Wrong PR" }),
    ),
    /unexpected/,
  );
});
