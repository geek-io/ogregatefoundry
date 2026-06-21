import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { OGRE_GATE } from "../module/config.mjs";
import { GOODS_CATALOG, MOUNT_TRANSPORT_CATALOG, WEAPON_CATALOG } from "../module/content/equipment-catalog.mjs";
import { packSourcePath } from "./pack-paths.mjs";

const source = "Wandering Heroes of Ogre Gate, Chapter 5: Equipment and Goods";

function documentId(key) {
  return createHash("sha256").update(`ogre-gate-equipment:${key}`).digest("hex").slice(0, 16);
}

function fileSafe(value = "") {
  return String(value)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function qualifiedDamageSkill(skillKey = "") {
  const key = String(skillKey ?? "").trim();
  if (!key) return "";
  if (key.includes(".")) return key;
  if (["athletics", "endurance", "muscle", "speed", "swim", "ride", "sail"].includes(key)) return `physical.${key}`;
  if (["reason", "reasoning"].includes(key)) return "mental.reasoning";
  return key;
}

async function writeFolder(destination, key, name, folder = null) {
  const id = documentId(`folder.${key}`);
  await writeFile(path.join(destination, "_Folder.json"), `${JSON.stringify({
    _id: id,
    name,
    type: "Item",
    sorting: "a",
    sort: 0,
    color: null,
    folder,
    flags: {},
    _key: `!folders!${id}`
  }, null, 2)}\n`, "utf8");
  return id;
}

async function buildWeapons() {
  const destination = packSourcePath("weapons");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  const usedCategories = Array.from(new Set(WEAPON_CATALOG.map((entry) => entry.category)));
  const folderIds = {};
  for (const skillKey of usedCategories) {
    const label = OGRE_GATE.skillGroups.combat.skills[skillKey] ?? skillKey;
    const folderPath = path.join(destination, fileSafe(label));
    await mkdir(folderPath, { recursive: true });
    folderIds[skillKey] = await writeFolder(folderPath, `weapons.${skillKey}`, label);
  }

  for (const entry of WEAPON_CATALOG) {
    const id = documentId(`weapon.${entry.name}`);
    const folderPath = path.join(destination, fileSafe(OGRE_GATE.skillGroups.combat.skills[entry.category] ?? "Weapons"));
    const targetDefense = entry.targetDefense ?? OGRE_GATE.combatSkillDefense[entry.attackSkill] ?? "parry";
    const document = {
      _id: id,
      name: entry.name,
      type: "weapon",
      img: "icons/weapons/swords/sword-broad-serrated-blue.webp",
      system: {
        description: entry.description ?? entry.qualities ?? "",
        source,
        cost: entry.cost ?? "",
        category: entry.category,
        attackSkill: entry.attackSkill ?? entry.category,
        targetDefense,
        damageSkill: qualifiedDamageSkill(entry.damageSkill ?? "physical.muscle"),
        damageDice: Number(entry.damageDice ?? 0),
        accuracyModifier: Number(entry.accuracyModifier ?? 0),
        equipped: false,
        parryBonus: Number(entry.parryBonus ?? 0),
        evadeBonus: Number(entry.evadeBonus ?? 0),
        muscleRequirement: Number(entry.muscleRequirement ?? 0),
        lethal: entry.lethal ?? true,
        damageType: entry.damageType ?? "special",
        reach: entry.reach ?? "normal",
        openDamage: Boolean(entry.openDamage),
        qualities: entry.qualities ?? ""
      },
      effects: [],
      folder: folderIds[entry.category] ?? null,
      flags: {},
      ownership: {
        default: 0
      },
      _key: `!items!${id}`
    };
    await writeFile(path.join(folderPath, `${fileSafe(entry.name)}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
  }

  return WEAPON_CATALOG.length;
}

async function buildArmor() {
  const destination = packSourcePath("armor");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  const armorPath = path.join(destination, "Armor");
  const shieldPath = path.join(destination, "Shields");
  await mkdir(armorPath, { recursive: true });
  await mkdir(shieldPath, { recursive: true });
  const armorFolder = await writeFolder(armorPath, "armor.armor", "Armor");
  const shieldFolder = await writeFolder(shieldPath, "armor.shields", "Shields");

  let count = 0;
  for (const [key, rule] of Object.entries(OGRE_GATE.armorRules)) {
    if (key === "custom") continue;
    count += 1;
    const id = documentId(`armor.${key}`);
    const destinationPath = rule.shield ? shieldPath : armorPath;
    const document = {
      _id: id,
      name: rule.label,
      type: "armor",
      img: rule.shield ? "icons/equipment/shield/buckler-wooden-boss-steel-brown.webp" : "icons/equipment/chest/breastplate-layered-steel.webp",
      system: {
        description: rule.notes,
        source,
        cost: rule.cost,
        armorKey: key,
        equipped: false,
        defenseModifier: 0,
        penalty: rule.speedPenalty,
        sharpReduction: rule.sharpReduction,
        bluntReduction: rule.bluntReduction,
        mightyReduction: rule.mightyReduction,
        arrowReduction: rule.arrowReduction,
        speedPenalty: rule.speedPenalty,
        parryBonus: rule.parryBonus,
        evadeBonus: rule.evadeBonus,
        muscleRequirement: rule.muscleRequirement,
        shield: Boolean(rule.shield),
        qualities: rule.notes
      },
      effects: [],
      folder: rule.shield ? shieldFolder : armorFolder,
      flags: {},
      ownership: {
        default: 0
      },
      _key: `!items!${id}`
    };
    await writeFile(path.join(destinationPath, `${fileSafe(rule.label)}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
  }
  return count;
}

async function buildGoods() {
  const destination = packSourcePath("goods");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  const entries = [
    ...MOUNT_TRANSPORT_CATALOG.map((entry) => ({
      ...entry,
      category: "mountTransport",
      description: entry.description ?? "Mount or transport entry from the Chapter 5 Mounts and Transports table."
    })),
    ...GOODS_CATALOG
  ];

  const usedCategories = Array.from(new Set(entries.map((entry) => entry.category ?? "general")));
  const folderIds = {};
  for (const category of usedCategories) {
    const label = OGRE_GATE.equipmentCategories[category] ?? category;
    const folderPath = path.join(destination, fileSafe(label));
    await mkdir(folderPath, { recursive: true });
    folderIds[category] = await writeFolder(folderPath, `goods.${category}`, label);
  }

  for (const entry of entries) {
    const category = entry.category ?? "general";
    const label = OGRE_GATE.equipmentCategories[category] ?? "General";
    const id = documentId(`goods.${entry.name}.${category}`);
    const document = {
      _id: id,
      name: entry.name,
      type: "equipment",
      img: category === "mountTransport" ? "icons/environment/settlement/wagon.webp" : "icons/containers/bags/pack-leather-white-tan.webp",
      system: {
        description: entry.description ?? "",
        source,
        cost: entry.cost ?? "",
        category,
        quantity: 1,
        weight: entry.weight ?? "",
        performanceRating: Number(entry.performanceRating ?? 0),
        handlingSpeed: entry.handlingSpeed ?? "",
        milesPerDay: entry.milesPerDay ?? "",
        speedScore: entry.speedScore ?? "",
        evade: Number(entry.evade ?? 0),
        hardiness: Number(entry.hardiness ?? 0),
        integrity: Number(entry.integrity ?? 0),
        damage: entry.damage ?? ""
      },
      effects: [],
      folder: folderIds[category] ?? null,
      flags: {
        ogregatefoundry: {
          categoryLabel: label
        }
      },
      ownership: {
        default: 0
      },
      _key: `!items!${id}`
    };
    const folderPath = path.join(destination, fileSafe(label));
    await writeFile(path.join(folderPath, `${fileSafe(entry.name)}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
  }

  return entries.length;
}

const weapons = await buildWeapons();
const armor = await buildArmor();
const goods = await buildGoods();
console.log(JSON.stringify({ weapons, armor, goods }, null, 2));
