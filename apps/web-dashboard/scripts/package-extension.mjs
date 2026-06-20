import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(__dirname, "..");
const repoRoot = resolve(webDir, "../..");
const extensionDir = resolve(repoRoot, "apps/extension");
const extensionDist = resolve(extensionDir, "dist");
const publicDir = resolve(webDir, "public");
const packageName = "legitmate-extension";
const packagePath = resolve(publicDir, `${packageName}.zip`);
const isIfMissing = process.argv.includes("--if-missing");

if (isIfMissing && existsSync(packagePath)) {
  console.log(`Extension package already exists: ${packagePath}`);
  process.exit(0);
}

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: "inherit",
    ...options
  });
}

function buildExtension() {
  try {
    run("npm", ["run", "build", "--workspace", "apps/extension"], { cwd: repoRoot });
    return;
  } catch {
    console.warn("Workspace extension build failed; trying standalone extension install/build.");
  }

  run("npm", ["install"], { cwd: extensionDir });
  run("npm", ["run", "build"], { cwd: extensionDir });
}

buildExtension();

if (!existsSync(resolve(extensionDist, "manifest.json"))) {
  throw new Error(`Extension build output is missing: ${extensionDist}`);
}

mkdirSync(publicDir, { recursive: true });
rmSync(packagePath, { force: true });

const tempDir = mkdtempSync(resolve(tmpdir(), "legitmate-extension-"));
const stagedExtension = resolve(tempDir, packageName);

try {
  cpSync(extensionDist, stagedExtension, { recursive: true });
  run("zip", ["-r", "-q", packagePath, packageName], { cwd: tempDir });
  console.log(`Packaged extension -> ${packagePath}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
