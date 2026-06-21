import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { SKILL_CATALOG } from "../module/content/skill-catalog.mjs";
import { packSourcePath } from "./pack-paths.mjs";

const destination = packSourcePath("skills");
const groupLabels = {
  combat: "Combat",
  specialist: "Specialist",
  mental: "Mental",
  physical: "Physical",
  knowledge: "Knowledge"
};

function documentId(key) {
  return createHash("sha256").update(`ogre-gate-skill:${key}`).digest("hex").slice(0, 16);
}

function filename(entry) {
  return `${entry.group}-${entry.key.replaceAll(".", "-")}.json`;
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const groupIds = {};
for (const [group, label] of Object.entries(groupLabels)) {
  const id = documentId(`folder.${group}`);
  groupIds[group] = id;
  const directory = path.join(destination, group);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "_Folder.json"), `${JSON.stringify({
    _id: id,
    name: label,
    type: "Item",
    sorting: "a",
    sort: 0,
    color: null,
    folder: null,
    flags: {},
    _key: `!folders!${id}`
  }, null, 2)}\n`, "utf8");
}

for (const entry of SKILL_CATALOG) {
  const id = documentId(entry.key);
  const data = {
    _id: id,
    name: entry.name,
    type: "skills",
    img: "icons/svg/book.svg",
    system: {
      description: entry.description,
      source: entry.source,
      cost: "",
      group: entry.group,
      skillKey: entry.key,
      ranks: 0,
      modifier: 0,
      drain: 0,
      expertise: "",
      expertiseNote: "",
      expertiseList: []
    },
    effects: [],
    folder: groupIds[entry.group],
    flags: {},
    ownership: {
      default: 0
    },
    _key: `!items!${id}`
  };
  await writeFile(path.join(destination, entry.group, filename(entry)), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(`Created ${SKILL_CATALOG.length} Skill source documents in ${destination}.`);
