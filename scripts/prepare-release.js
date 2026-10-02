import { execFileSync } from "node:child_process";
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const releasePaths = [
  "src",
  "extension",
  "scripts",
  "tests",
  "package.json",
  "pnpm-lock.yaml",
  ".npmrc",
  ".nvmrc",
  ".github/workflows",
];

export function nextPatch(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version))
    throw new Error("Expected a three-part version.");
  const parts = version.split(".").map(Number);
  if (parts.some((part) => !Number.isSafeInteger(part) || part > 65535))
    throw new Error("Version exceeds Chrome's supported range.");
  if (parts[2] === 65535)
    throw new Error("Patch limit reached; choose a new minor version.");
  parts[2]++;
  return parts.join(".");
}

// Prepare locally, validate in the workflow, then publish the commit and tag together.
export async function prepareRelease({
  cwd = process.cwd(),
  repository,
  token,
  fetcher = fetch,
}) {
  const git = (...args) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const read = async (path) =>
    JSON.parse(await readFile(`${cwd}/${path}`, "utf8"));
  const packageInfo = await read("package.json");
  const manifest = await read("extension/manifest.json");
  if (packageInfo.version !== manifest.version)
    throw new Error("Package and extension versions must match.");
  // Validate even on retry, before using the version as a tag or file name.
  nextPatch(manifest.version);
  if (git("status", "--porcelain"))
    throw new Error("Release preparation requires a clean checkout.");
  const tags = git("tag", "--merged", "HEAD", "--sort=-version:refname").split(
    "\n",
  );
  const baseline = tags.find((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
  if (!baseline) throw new Error("An initial version tag is required.");
  const changes = git(
    "diff",
    "--name-only",
    baseline,
    "HEAD",
    "--",
    ...releasePaths,
  );
  if (baseline !== `v${manifest.version}`)
    throw new Error("Version does not match the latest source tag.");
  if (!changes) {
    const response = await fetcher(
      `https://api.github.com/repos/${repository}/releases/tags/${baseline}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (response.status === 404)
      return { mode: "retry", version: manifest.version, draft: false };
    if (!response.ok)
      throw new Error(`Could not inspect the release (${response.status}).`);
    const release = await response.json();
    return {
      mode: release.draft ? "retry" : "skip",
      version: manifest.version,
      draft: release.draft,
    };
  }
  const version = nextPatch(manifest.version);
  if (tags.includes(`v${version}`) || git("tag", "--list", `v${version}`))
    throw new Error(
      "Next version tag already exists. Inspect the repository before retrying.",
    );
  packageInfo.version = manifest.version = version;
  await writeFile(
    `${cwd}/package.json`,
    `${JSON.stringify(packageInfo, null, 2)}\n`,
  );
  await writeFile(
    `${cwd}/extension/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return { mode: "bump", version, draft: false };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    !process.env.GITHUB_REPOSITORY ||
    !process.env.GH_TOKEN ||
    !process.env.GITHUB_OUTPUT
  )
    throw new Error("Run release preparation in GitHub Actions.");
  const result = await prepareRelease({
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GH_TOKEN,
  });
  for (const [key, value] of Object.entries(result))
    await appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  console.log(`Release ${result.version}: ${result.mode}`);
}
