import { createRequire } from "node:module";
import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { assertInsideRoot, packSourcePath, root } from "./pack-paths.mjs";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("classic-level");

const packs = [
  "skills",
  "techniques",
  "weapons",
  "armor",
  "goods",
  "chapter-2-afflictions",
  "substances",
  "chapter-2-rules",
  "npcs"
];

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

const results = {};
for (const pack of packs) {
  const source = packSourcePath(pack);
  const destination = path.join(root, "packs", pack);
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

  results[pack] = {
    items: docs.filter((doc) => doc._key?.startsWith("!items!")).length,
    actors: docs.filter((doc) => doc._key?.startsWith("!actors!")).length,
    journals: docs.filter((doc) => doc._key?.startsWith("!journal!")).length,
    folders: docs.filter((doc) => doc._key?.startsWith("!folders!")).length
  };
}

console.log(JSON.stringify(results, null, 2));
