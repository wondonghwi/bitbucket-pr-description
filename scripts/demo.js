import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const demoAdapter = fileURLToPath(
  new URL("../docs/demo-adapter.js", import.meta.url),
);
const { version } = JSON.parse(
  await readFile("extension/manifest.json", "utf8"),
);
const result = await build({
  entryPoints: ["src/content.js"],
  bundle: true,
  define: { __APP_VERSION__: JSON.stringify(version) },
  write: false,
  format: "iife",
  loader: { ".css": "text" },
  plugins: [
    {
      name: "local-demo-only",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/bitbucket\.js$/ }, (args) => {
          if (args.importer.endsWith("/src/content.js"))
            return { path: demoAdapter };
        });
      },
    },
  ],
});
const html = await readFile("docs/demo.html");
const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:4173");
  if (url.pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
  } else if (url.pathname === "/") {
    response.writeHead(302, {
      Location: "/example/sample-web/pull-requests/42/diff",
    });
    response.end();
  } else if (url.pathname === "/content.js") {
    response.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
    });
    response.end(result.outputFiles[0].text);
  } else if (url.pathname.startsWith("/example/sample-web/pull-requests/")) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
  } else {
    response.writeHead(404);
    response.end();
  }
});
server.listen(4173, "127.0.0.1", () =>
  console.log(
    "Demo: http://127.0.0.1:4173 — fictional data, no Bitbucket requests.",
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
