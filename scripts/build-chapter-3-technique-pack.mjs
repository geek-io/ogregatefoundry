import { createRequire } from "node:module";
import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("classic-level");

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "packs-src", "techniques");
const destination = path.join(root, "packs", "techniques");

function assertInsideRoot(target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error(`Refusing to write outside repository root: ${resolvedTarget}`);
  }
}

async function readJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const docs = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) docs.push(...await readJsonFiles(fullPath));
    else if (entry.name.endsWith(".json")) docs.push(JSON.parse(await readFile(fullPath, "utf8")));
  }
  return docs;
}

assertInsideRoot(destination);
await rm(destination, { recursive: true, force: true });

const docs = await readJsonFiles(source);
const db = new ClassicLevel(destination, { valueEncoding: "json" });
await db.open();
const batch = db.batch();
for (const doc of docs) {
  const { _key, ...stored } = doc;
  batch.put(_key, stored);
}
await batch.write();
await db.close();

const items = docs.filter((doc) => doc._key?.startsWith("!items!"));
const folders = docs.filter((doc) => doc._key?.startsWith("!folders!"));
console.log(JSON.stringify({
  items: items.length,
  folders: folders.length,
  strippedKeyField: true
}, null, 2));
