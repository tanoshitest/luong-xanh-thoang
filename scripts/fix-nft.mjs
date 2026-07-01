// Vercel/Nitro build fix.
// `nf3` (used by nitro's vercel preset) ships a bundled, minified copy of
// @vercel/nft whose out/index.js can't be statically analyzed by Node's
// CJS→ESM lexer, so `import { nodeFileTrace } from "@vercel/nft"` fails with
// "does not provide an export named 'nodeFileTrace'" and the build dies.
// Removing the nested copy makes nf3 resolve the hoisted, working @vercel/nft.
import { rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const broken = resolve(root, "node_modules/nf3/dist/node_modules/@vercel/nft");

try {
  if (existsSync(broken)) {
    rmSync(broken, { recursive: true, force: true });
    console.log("[fix-nft] removed nested @vercel/nft so nf3 uses the hoisted copy");
  } else {
    console.log("[fix-nft] nothing to do (nested @vercel/nft not present)");
  }
} catch (err) {
  console.warn("[fix-nft] skipped:", err?.message ?? err);
}
