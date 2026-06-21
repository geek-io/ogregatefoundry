import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { AFFLICTION_CATALOG, AFFLICTION_RULES, SUBSTANCE_CATALOG } from "../module/content/chapter-2-substances.mjs";
import { packSourcePath } from "./pack-paths.mjs";

function documentId(key) {
  return createHash("sha256").update(`ogre-gate-chapter-two:${key}`).digest("hex").slice(0, 16);
}

function filename(name, key) {
  const slug = name.replaceAll(/[^A-Za-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
  return `${slug}-${key}.json`;
}

async function buildPack({ packName, entries, groups, type, systemFields }) {
  const destination = packSourcePath(packName);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  const folderIds = {};
  for (const [groupKey, groupLabel] of Object.entries(groups)) {
    const id = documentId(`${packName}.folder.${groupKey}`);
    folderIds[groupKey] = id;
    const directory = path.join(destination, groupKey);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "_Folder.json"), `${JSON.stringify({
      _id: id,
      name: groupLabel,
      type: "Item",
      sorting: "a",
      sort: 0,
      folder: null,
      flags: {},
      _key: `!folders!${id}`
    }, null, 2)}\n`, "utf8");
  }

  for (const entry of entries) {
    const id = documentId(`${packName}.${entry.key}`);
    const groupKey = type === "affliction" ? entry.afflictionType : entry.substanceType;
    const data = {
      _id: id,
      name: entry.name,
      type,
      img: "icons/svg/acid.svg",
      system: {
        description: entry.description,
        source: entry.source,
        cost: "",
        ...Object.fromEntries(systemFields.map((field) => [field, entry[field]]))
      },
      effects: [],
      folder: folderIds[groupKey],
      flags: {},
      ownership: { default: 0 },
      _key: `!items!${id}`
    };
    const directory = path.join(destination, groupKey);
    await writeFile(path.join(directory, filename(entry.name, entry.key)), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  console.log(`Created ${entries.length} ${type} source documents in ${destination}.`);
}

async function buildRulesReferencePack() {
  const destination = packSourcePath("chapter-2-rules");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  const id = documentId("chapter-2-rules.poisons-and-diseases");
  const pageId = documentId("chapter-2-rules.poisons-and-diseases.page");
  const content = AFFLICTION_RULES
    .split("\n\n")
    .map((paragraph, index) => index === 0 ? `<h2>${paragraph}</h2>` : `<p>${paragraph}</p>`)
    .join("");
  const data = {
    _id: id,
    name: "Poisons and Diseases",
    pages: [{
      _id: pageId,
      name: "Poisons and Diseases",
      type: "text",
      title: { show: true, level: 1 },
      image: {},
      text: { format: 1, content, markdown: "" },
      video: {},
      src: null,
      sort: 0,
      ownership: { default: 0 },
      flags: {},
      _key: `!journal.pages!${id}.${pageId}`
    }],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _key: `!journal!${id}`
  };
  await writeFile(path.join(destination, "Poisons-and-Diseases.json"), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Created Chapter 2 rules reference source document in ${destination}.`);
}

await buildPack({
  packName: "chapter-2-afflictions",
  entries: AFFLICTION_CATALOG,
  groups: { poison: "Poisons", disease: "Diseases" },
  type: "affliction",
  systemFields: [
    "rulesKey", "afflictionType", "lethality", "speed", "effect", "medicineTn", "treatmentMode",
    "brewRating", "potency", "affectedSkills", "contagious", "antidoteRequired", "remedy", "specialRules"
  ]
});

await buildPack({
  packName: "substances",
  entries: SUBSTANCE_CATALOG,
  groups: {
    herbalCure: "Herbal Cures",
    antidote: "Antidotes",
    longevity: "Longevity Substances",
    transformative: "Transformative Substances"
  },
  type: "substance",
  systemFields: ["rulesKey", "substanceType", "quantity", "brewSkill", "brewTn", "targetAffliction", "duration", "effects"]
});

await buildRulesReferencePack();
