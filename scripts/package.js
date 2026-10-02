import { mkdir, rm, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const { version } = JSON.parse(
  await readFile("extension/manifest.json", "utf8"),
);
await mkdir("release", { recursive: true });
const path = `release/bitbucket-pr-description-${version}.zip`;
await rm(path, { force: true });
execFileSync("zip", ["-q", "-r", `../${path}`, "."], { cwd: "dist" });
console.log(`Packaged ${path}`);
