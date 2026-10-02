import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nextPatch, prepareRelease } from "../scripts/prepare-release.js";

async function fixture(t) {
  const cwd = await mkdtemp(join(tmpdir(), "bbpd-release-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init", "--initial-branch=main");
  git("config", "user.name", "Release Test");
  git("config", "user.email", "release-test@example.invalid");
  for (const path of ["extension", "src"]) await mkdir(join(cwd, path));
  await writeFile(
    join(cwd, "package.json"),
    JSON.stringify({ name: "fixture", version: "0.1.0" }) + "\n",
  );
  await writeFile(
    join(cwd, "extension/manifest.json"),
    JSON.stringify({ manifest_version: 3, version: "0.1.0" }) + "\n",
  );
  await writeFile(join(cwd, "src/content.js"), "original\n");
  const commit = (message) => {
    git("add", ".");
    git("commit", "-m", message);
  };
  commit("initial");
  git("tag", "v0.1.0");
  const run = (
    fetcher = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ draft: false }),
    }),
  ) =>
    prepareRelease({
      cwd,
      repository: "example/fixture",
      token: "test-placeholder",
      fetcher,
    });
  return { cwd, git, commit, run };
}

test("patch versions are valid for Chrome and reject malformed or overflowing input", () => {
  assert.equal(nextPatch("0.1.9"), "0.1.10");
  for (const version of [
    "v1.2.3",
    "1.2",
    "1.2.3-beta",
    "01.2.3",
    "1.2.65535",
    "65536.0.0",
  ])
    assert.throws(() => nextPatch(version));
});

test("a functional change prepares exactly one new version; docs-only pushes skip", async (t) => {
  const { cwd, git, commit, run } = await fixture(t);
  await writeFile(join(cwd, "README.md"), "documentation\n");
  commit("docs");
  assert.equal((await run()).mode, "skip");
  await writeFile(join(cwd, "src/content.js"), "improved\n");
  commit("feature");
  const result = await run();
  assert.deepEqual(result, { mode: "bump", version: "0.1.1", draft: false });
  for (const file of ["package.json", "extension/manifest.json"])
    assert.equal(JSON.parse(await readFile(join(cwd, file))).version, "0.1.1");
  assert.equal(git("tag", "--list", "v0.1.1"), "", "no tag before validation");
  commit("version");
  git("tag", "v0.1.1");
  assert.equal((await run()).mode, "skip", "no duplicate bump after success");
});

test("missing or draft releases resume at the same version; API failures never become new releases", async (t) => {
  const { run } = await fixture(t);
  assert.deepEqual(await run(async () => ({ status: 404 })), {
    mode: "retry",
    version: "0.1.0",
    draft: false,
  });
  assert.deepEqual(
    await run(async () => ({
      status: 200,
      ok: true,
      json: async () => ({ draft: true }),
    })),
    { mode: "retry", version: "0.1.0", draft: true },
  );
  await assert.rejects(
    run(async () => ({ status: 403 })),
    /403/,
  );
  await assert.rejects(
    run(async () => {
      throw new Error("network unavailable");
    }),
    /network/,
  );
});

test("version mismatches, dirty checkouts and existing candidate tags stop release preparation", async (t) => {
  const { cwd, git, commit, run } = await fixture(t);
  await writeFile(join(cwd, "src/content.js"), "improved\n");
  await assert.rejects(run(), /clean checkout/);
  commit("feature");
  git("tag", "v0.1.1");
  await assert.rejects(run(), /latest source tag/);
  await writeFile(
    join(cwd, "package.json"),
    JSON.stringify({ version: "0.2.0" }),
  );
  commit("mismatch");
  await assert.rejects(run(), /versions must match/);
});
