import { mkdir, rm, readFile, copyFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const { version } = JSON.parse(
  await readFile("extension/manifest.json", "utf8"),
);
const built = JSON.parse(await readFile("dist/manifest.json", "utf8"));
if (built.version !== version)
  throw new Error("Build version is stale. Run pnpm build first.");
await mkdir("release", { recursive: true });
const path = `release/bitbucket-pr-description-${version}.zip`;
await rm(path, { force: true });
execFileSync("zip", ["-q", "-r", `../${path}`, "."], { cwd: "dist" });
await copyFile(path, "release/bitbucket-pr-description.zip");
console.log(`Packaged ${path} and release/bitbucket-pr-description.zip`);
