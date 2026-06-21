import os from "node:os";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");
export const packSourceRoot = process.env.OGRE_GATE_PACK_SOURCE
  ? path.resolve(process.env.OGRE_GATE_PACK_SOURCE)
  : path.join(os.tmpdir(), "ogregatefoundry-pack-src");

export function packSourcePath(packName) {
  return path.join(packSourceRoot, packName);
}

export function assertInsideRoot(target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error(`Refusing to write outside repository root: ${resolvedTarget}`);
  }
}
