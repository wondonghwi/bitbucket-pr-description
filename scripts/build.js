import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const { version } = JSON.parse(
  await readFile("extension/manifest.json", "utf8"),
);
const packageInfo = JSON.parse(await readFile("package.json", "utf8"));
if (packageInfo.version !== version)
  throw new Error("Package and extension versions must match.");

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("extension", "dist", { recursive: true });
await build({
  entryPoints: ["src/content.js"],
  outfile: "dist/content.js",
  bundle: true,
  define: { __APP_VERSION__: JSON.stringify(version) },
  format: "iife",
  target: "chrome109",
  minify: true,
  loader: { ".css": "text" },
  legalComments: "eof",
});
const purifyPackage = JSON.parse(
  await readFile("node_modules/dompurify/package.json", "utf8"),
);
await writeFile(
  "dist/THIRD_PARTY_NOTICES.txt",
  `DOMPurify ${purifyPackage.version}\nLicensed under Apache-2.0 OR MPL-2.0.\n\n${await readFile("node_modules/dompurify/LICENSE", "utf8")}`,
);
await cp("LICENSE", "dist/LICENSE.txt");
console.log("Built dist/ — load this folder in chrome://extensions.");
