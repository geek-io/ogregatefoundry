import { OGRE_GATE } from "../config.mjs";
import { WEAPON_CATALOG } from "../content/equipment-catalog.mjs";
import { SKILL_CATALOG } from "../content/skill-catalog.mjs";

const DEFENSE_KEYS = {
  hardiness: "hardiness",
  parry: "parry",
  evade: "evade",
  stealth: "stealth",
  wits: "wits",
  resolve: "resolve"
};

const DISCIPLINE_KEYS = {
  none: "none",
  waijia: "waijia",
  qinggong: "qinggong",
  neigong: "neigong",
  dianxue: "dianxue"
};

const BOOK_FIELD_PATTERN = /^(Defenses|Key Skills|Skills|Qi Rank|Qi|Max Wounds|Wounds|Weapons|Weapon|Equipment|Combat Technique|Combat Techniques|Combat Perk|Combat Perks|Key Kung Fu Techniques|Kung Fu Techniques|Expertise|Reputation|Flaws|Powers)\b/i;

const WEAPON_ALIASES = {
  shortbow: "Bow, Short",
  compositebow: "Bow, Composite",
  heavyspear: "Qiang (Spear)",
  qiangheavyspear: "Qiang (Spear)",
  dagger: "Dagger",
  daggers: "Dagger",
  oxtaildao: "Ox Tail Dao",
  butterflysword: "Butterfly Swords",
  butterflyswords: "Butterfly Swords"
};

function escapeHtml(value = "") {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function normalizeKey(value = "") {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function techniqueMatchKey(value = "") {
  return normalizeKey(String(value ?? "").replace(/\s*\((secret|unorthodox)\)\s*$/i, ""));
}

function objectValue(source, keys, fallback = undefined) {
  if (!source || typeof source !== "object") return fallback;
  const entries = Object.entries(source);
  for (const key of keys) {
    const exact = entries.find(([candidate]) => candidate === key);
    if (exact) return exact[1];
    const normalized = normalizeKey(key);
    const loose = entries.find(([candidate]) => normalizeKey(candidate) === normalized);
    if (loose) return loose[1];
  }
  return fallback;
}

function splitList(value = "") {
  const entries = [];
  let current = "";
  let depth = 0;
  for (const char of String(value ?? "")) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      if (current.trim()) entries.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) entries.push(current.trim());
  return entries;
}

function displaySkillName(name = "") {
  const trimmed = String(name ?? "").trim();
  const parenthetical = trimmed.match(/^(.+?)\s*\((.+)\)$/);
  if (!parenthetical) return trimmed;
  const baseAliases = {
    language: "Language",
    languages: "Language",
    places: "Places/Cultures",
    religion: "Religion/Gods",
    religions: "Religion/Gods"
  };
  const base = parenthetical[1].trim();
  return `${baseAliases[normalizeKey(base)] ?? base}: ${parenthetical[2].trim()}`;
}

function customKey(base = "", specific = "") {
  return `${normalizeKey(base) || "custom"}.${normalizeKey(specific) || "custom"}`;
}

function findSkillCatalogEntry(name = "") {
  const display = displaySkillName(name);
  const normalized = normalizeKey(display);
  const compact = normalizeKey(name);
  return SKILL_CATALOG.find((entry) => (
    normalizeKey(entry.name) === normalized
    || normalizeKey(entry.name) === compact
    || normalizeKey(`${OGRE_GATE.skillGroups[entry.group]?.label ?? entry.group}: ${entry.name}`) === normalized
  )) ?? null;
}

function resolveSkill(name = "") {
  const display = displaySkillName(name);
  const catalog = findSkillCatalogEntry(display);
  if (catalog) {
    return {
      name: catalog.name,
      group: catalog.group,
      skillKey: catalog.key,
      description: catalog.description,
      source: catalog.source
    };
  }

  const normalized = normalizeKey(display);
  for (const [groupKey, group] of Object.entries(OGRE_GATE.skillGroups)) {
    if (groupKey === "defenses") continue;
    for (const [skillKey, label] of Object.entries(group.skills)) {
      if (normalizeKey(label) === normalized || normalizeKey(skillKey) === normalized) {
        return {
          name: label,
          group: groupKey,
          skillKey,
          description: OGRE_GATE.skillTooltips?.[skillKey] ?? "",
          source: "Imported statblock"
        };
      }
    }
  }

  const parenthetical = String(name).trim().match(/^(.+?)\s*\((.+)\)$/);
  if (parenthetical) {
    const base = parenthetical[1].trim();
    const specific = parenthetical[2].trim();
    const baseKey = normalizeKey(base);
    if (baseKey === "talent" || baseKey === "trade" || baseKey === "survival" || baseKey === "ritual") {
      return {
        name: `${base}: ${specific}`,
        group: "specialist",
        skillKey: customKey(base, specific),
        description: `Imported open Specialist Skill: ${base} (${specific}).`,
        source: "Imported statblock"
      };
    }
    return {
      name: `${base}: ${specific}`,
      group: "knowledge",
      skillKey: customKey(base, specific),
      description: `Imported open Knowledge Skill: ${base} (${specific}).`,
      source: "Imported statblock"
    };
  }

  return {
    name: display || "Imported Skill",
    group: "specialist",
    skillKey: normalizeKey(display) || "importedSkill",
    description: "Imported from statblock; assign a more specific skill group or rules key if needed.",
    source: "Imported statblock"
  };
}

function parseDice(value) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/(-?\d+)\s*d10/i);
  if (match) return Number(match[1]);
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function cleanBookText(text = "") {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/-\n(?=[a-z])/g, "")
    .replace(/\bMedium,\s+Melee\b/gi, "Medium Melee")
    .replace(/\bLan\s+guage(s?)\b/gi, "Language$1")
    .replace(/\bDecep\s+tion\b/gi, "Deception")
    .replace(/\bEndur\s+ance\b/gi, "Endurance")
    .replace(/\bTrap\s+ping\b/gi, "Trapping");
}

function textLines(text = "") {
  return cleanBookText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function looksLikeBookHeading(line = "") {
  const text = String(line ?? "").trim();
  if (!text || text.length > 80 || BOOK_FIELD_PATTERN.test(text)) return false;
  if (/^[()]/.test(text)) return false;
  if (/[.!?]$/.test(text)) return false;
  return /^[A-Z0-9 ,'\-’]+$/.test(text);
}

function mergeBookLines(lines = []) {
  const merged = [];
  for (const line of lines) {
    if (BOOK_FIELD_PATTERN.test(line) || !merged.length) {
      merged.push(line);
    } else {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${line}`.replace(/\s+/g, " ").trim();
    }
  }
  return merged;
}

function parsePowerText(value = "") {
  const text = String(value ?? "").trim();
  if (!text) return [];
  const match = text.match(/^([^:]{1,80}):\s*(.+)$/);
  if (match && normalizeKey(match[1]) !== "powers") {
    return [{
      name: match[1].trim(),
      description: match[2].trim()
    }];
  }
  return splitList(text).map((entry) => {
    const entryMatch = entry.match(/^([^:]{1,80}):\s*(.+)$/);
    return entryMatch
      ? { name: entryMatch[1].trim(), description: entryMatch[2].trim() }
      : { name: "Power", description: entry.trim() };
  }).filter((entry) => entry.description);
}

function parsePowerSection(lines = []) {
  const powers = [];
  let inPowers = false;
  let current = null;

  const commit = () => {
    if (current?.name || current?.description) {
      current.description = current.description.replace(/\s+/g, " ").trim();
      powers.push(current);
    }
    current = null;
  };

  for (const line of lines) {
    if (/^Powers\b:?\s*/i.test(line)) {
      inPowers = true;
      commit();
      const inline = line.replace(/^Powers\b:?\s*/i, "").trim();
      if (inline) {
        const parsedInline = parsePowerText(inline);
        powers.push(...parsedInline);
      }
      continue;
    }
    if (!inPowers) continue;
    if (BOOK_FIELD_PATTERN.test(line) && !/^Powers\b/i.test(line)) {
      commit();
      break;
    }

    const match = line.match(/^([^:]{1,80}):\s*(.+)$/);
    if (match) {
      commit();
      current = {
        name: match[1].trim(),
        description: match[2].trim()
      };
    } else if (current) {
      current.description = `${current.description} ${line}`.trim();
    }
  }

  commit();
  return powers;
}

function normalizePowerArray(value = []) {
  return normalizedArray(value).map((entry) => {
    if (typeof entry === "string") return parsePowerText(entry);
    const name = objectValue(entry, ["name", "Name", "title", "Title"], "Power");
    const description = objectValue(entry, ["description", "Description", "text", "Text", "effect", "Effect"], "");
    return [{ name, description }];
  }).flat().filter((entry) => entry.description || entry.name);
}

function powersHtml(powers = []) {
  if (!powers.length) return "";
  return powers.map((power) => `
    <section class="ogre-gate-power-entry">
      <h3>${escapeHtml(power.name || "Power")}</h3>
      <p>${escapeHtml(power.description ?? "")}</p>
    </section>
  `).join("");
}

function inferBookName(lines = []) {
  const defenseIndex = lines.findIndex((line) => /^Defenses\b/i.test(line));
  if (defenseIndex > 0) {
    for (let index = defenseIndex - 1; index >= 0; index -= 1) {
      const line = lines[index];
      if (looksLikeBookHeading(line)) {
        const parts = [line];
        for (let previous = index - 1; previous >= 0; previous -= 1) {
          if (!looksLikeBookHeading(lines[previous])) break;
          parts.unshift(lines[previous]);
        }
        return parts.join(" ").replace(/\s+/g, " ").trim();
      }
    }
  }
  return lines.find((line) => !BOOK_FIELD_PATTERN.test(line)) ?? "";
}

function parseSignedDiceModifier(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const match = text.match(/([+-]?\s*\d+)\s*d10/i);
  if (match) return Number(match[1].replace(/\s+/g, ""));
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseDefenseText(value = "") {
  const defenses = {};
  for (const entry of splitList(value)) {
    const match = entry.match(/^(.+?)\s+(-?\d+)$/);
    if (!match) continue;
    const key = DEFENSE_KEYS[normalizeKey(match[1])];
    if (key) defenses[key] = Number(match[2]);
  }
  return defenses;
}

function parseSkillText(value = "") {
  return splitList(value).map((entry) => {
    let match = entry.match(/^(.+?)(?::|\s)\s*(-?\d+\s*d10|-?\d+)(?:\s*\([^)]*\))?(?:\s+or\s+.+)?$/i);
    let name = match?.[1]?.trim() ?? "";
    let dice = match?.[2] ?? "";
    if (!match) {
      match = entry.match(/^(.+?):\s*\((.+?)\)\s*(-?\d+\s*d10|-?\d+)$/i);
      if (match) {
        name = `${match[1].trim()} (${match[2].trim()})`;
        dice = match[3];
      }
    }
    if (!match) {
      match = entry.match(/^(.+?)\s*\((-?\d+\s*d10|-?\d+)\)$/i);
      if (match) {
        name = match[1].trim();
        dice = match[2];
      }
    }
    if (!match) return null;
    return {
      name: normalizeKey(name) === "kick" ? "Leg Strike" : name,
      dice: parseDice(dice)
    };
  }).filter(Boolean);
}

function parseExpertiseText(value = "") {
  return splitList(value).map((entry) => {
    const [rawSkill, ...expertiseParts] = entry.split("-");
    const skill = String(rawSkill ?? "").trim();
    const expertise = expertiseParts.join("-").trim();
    return {
      skill,
      name: expertise || skill
    };
  }).filter((entry) => entry.name);
}

function addExpertiseToSkill(skill, expertise) {
  skill.expertise ??= [];
  if (!skill.expertise.some((entry) => normalizeKey(typeof entry === "string" ? entry : entry.name) === normalizeKey(expertise.name))) {
    skill.expertise.push(expertise);
  }
}

function applyImportedExpertise(data) {
  for (const expertise of data.expertise ?? []) {
    const skillKey = normalizeKey(expertise.skill);
    let skill = data.skills.find((entry) => normalizeKey(displaySkillName(entry.name)).startsWith(skillKey));
    if (!skill && skillKey) {
      skill = data.skills.find((entry) => normalizeKey(entry.name).includes(skillKey));
    }
    if (!skill) {
      const weapon = data.weapons.find((entry) => normalizeKey(entry.name) === normalizeKey(expertise.name));
      const catalog = weapon ? WEAPON_CATALOG.find((entry) => normalizeKey(entry.name) === normalizeKey(WEAPON_ALIASES[normalizeKey(weapon.name)] ?? weapon.name)) : null;
      if (catalog?.attackSkill) {
        skill = data.skills.find((entry) => normalizeKey(resolveSkill(entry.name).skillKey) === normalizeKey(catalog.attackSkill));
      }
    }
    if (skill) addExpertiseToSkill(skill, { name: expertise.name, note: "Imported Expertise" });
  }
  return data;
}

function parseDisciplineText(value = "") {
  const disciplines = {};
  for (const entry of splitList(value)) {
    const match = entry.match(/^(.+?)\s+(-?\d+)$/);
    if (!match) continue;
    const key = DISCIPLINE_KEYS[normalizeKey(match[1])];
    if (key && key !== "none") disciplines[key] = Number(match[2]);
  }
  return disciplines;
}

function parseWeaponText(value = "") {
  return splitList(value).map((entry) => {
    if (/^(none|varies)$/i.test(entry.trim())) return null;
    const match = entry.match(/^(.+?)(?:\s*\((.+)\))?$/);
    if (!match) return null;
    const name = match[1].trim().replace(/^(and|or)\s+/i, "");
    const detail = match[2] ?? "";
    const attack = detail.match(/(-?\d+\s*d10|-?\d+)\s+Attack/i);
    const damage = detail.match(/(-?\d+\s*d10|-?\d+)\s+Damage/i);
    const bareDice = detail.match(/^(-?\d+\s*d10|-?\d+)$/i);
    const accuracy = detail.match(/([+-]\s*\d+\s*d10|[+-]\s*\d+)\s+Accuracy/i);
    return {
      name,
      attackDice: attack ? parseDice(attack[1]) : null,
      damageDice: damage ? parseDice(damage[1]) : bareDice ? parseDice(bareDice[1]) : null,
      accuracyModifier: accuracy ? parseSignedDiceModifier(accuracy[1]) : null,
      notes: detail
    };
  }).filter((entry) => entry?.name);
}

function parseTextStatblock(text = "") {
  const rawLines = textLines(text);
  const lines = mergeBookLines(rawLines);
  const data = {
    name: inferBookName(rawLines),
    defenses: {},
    skills: [],
    disciplines: {},
    qi: 1,
    maxWounds: 0,
    weapons: [],
    equipment: [],
    combatTechniques: [],
    techniques: [],
    powers: parsePowerSection(rawLines),
    expertise: [],
    notes: [],
    raw: String(text ?? "").trim()
  };

  for (const line of lines) {
    const keyMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyMatch) {
      if (!data.name) data.name = line;
      continue;
    }
    const key = normalizeKey(keyMatch[1]);
    const value = keyMatch[2].trim();
    if (key === "name") data.name = value;
    else if (key === "defenses") data.defenses = { ...data.defenses, ...parseDefenseText(value) };
    else if (key === "keyskills" || key === "skills") data.skills.push(...parseSkillText(value));
    else if (key === "qi" || key === "qirank") data.qi = Number(value.match(/\d+/)?.[0] ?? data.qi);
    else if (key === "maxwounds" || key === "wounds") data.maxWounds = Number(value.match(/\d+/)?.[0] ?? 0);
    else if (["weapon", "weapons"].includes(key)) data.weapons.push(...parseWeaponText(value));
    else if (key === "equipment") {
      data.equipment.push(...splitList(value).map((entry) => entry.trim()).filter((entry) => entry && !/^(none|varies)$/i.test(entry)));
    }
    else if (key === "combattechnique" || key === "combattechniques" || key === "combatperk" || key === "combatperks") data.combatTechniques.push(...splitList(value));
    else if (key.startsWith("kungfutechniques") || key.startsWith("keykungfutechniques") || key === "techniques") {
      const disciplineBlock = keyMatch[1].match(/\((.+)\)/)?.[1] ?? "";
      data.disciplines = { ...data.disciplines, ...parseDisciplineText(disciplineBlock) };
      data.techniques.push(...splitList(value));
    } else if (key === "powers") {
      data.powers.push(...parsePowerText(value));
    } else if (key === "expertise") {
      data.expertise.push(...parseExpertiseText(value));
      data.notes.push(`${keyMatch[1].trim()}: ${value}`);
    } else if (["reputation", "flaws"].includes(key)) {
      data.notes.push(`${keyMatch[1].trim()}: ${value}`);
    }
  }

  return applyImportedExpertise(data);
}

function normalizedArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseDefenseArray(defenses = []) {
  return Object.fromEntries(defenses.map((entry) => {
    const name = objectValue(entry, ["name", "Name"], "");
    const key = DEFENSE_KEYS[normalizeKey(name)];
    if (!key) return null;
    const base = Number(objectValue(entry, ["base", "Base"], 0));
    const ranks = Number(objectValue(entry, ["ranks", "Ranks"], 0));
    const levelModifier = Number(objectValue(entry, ["levelModifier", "LevelModifier", "Level Modifier"], 0));
    return [key, base + ranks + levelModifier];
  }).filter(Boolean));
}

function parseSkillArray(skills = []) {
  return skills.map((entry) => ({
    name: objectValue(entry, ["name", "skill", "Name", "Skill"], ""),
    dice: parseDice(objectValue(entry, ["dice", "pool", "ranks", "Dice", "Pool", "Ranks"], 0)),
    expertise: normalizedArray(objectValue(entry, ["expertise", "Expertise"], []))
  })).filter((entry) => entry.name);
}

function parseEquipmentArray(equipment = []) {
  return equipment.map((entry) => ({
    name: objectValue(entry, ["name", "Name"], "Weapon"),
    attackDice: objectValue(entry, ["attackDice", "Attack Dice", "attack", "Attack"], null),
    damageDice: objectValue(entry, ["damageDice", "Damage Dice", "damageDiceTotal", "Damage Dice Total"], null),
    accuracyModifier: parseSignedDiceModifier(objectValue(entry, ["modifier", "Modifier"], "")),
    attackSkillName: objectValue(entry, ["skillUsed", "SkillUsed", "Skill Used"], ""),
    damageSkillName: objectValue(entry, ["damage", "Damage"], ""),
    notes: [
      objectValue(entry, ["notes", "Notes"], ""),
      normalizedArray(objectValue(entry, ["tags", "Tags"], [])).length ? `Tags: ${normalizedArray(objectValue(entry, ["tags", "Tags"], [])).join(", ")}` : ""
    ].filter(Boolean).join(" ")
  })).filter((entry) => entry.name);
}

function parseCombatTechniqueArray(entries = []) {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    const name = objectValue(entry, ["name", "Name"], "");
    const skill = objectValue(entry, ["skillUsed", "SkillUsed", "Skill Used"], "");
    return [skill, name].filter(Boolean).join(" - ");
  }).filter(Boolean);
}

function parseTechniqueNames(data) {
  const direct = normalizedArray(objectValue(data, ["techniques", "kungFuTechniques", "Kung Fu Techniques"], []));
  const companion = [
    ...normalizedArray(objectValue(data, ["techniqueNames", "TechniqueNames"], [])),
    ...normalizedArray(objectValue(data, ["profoundTechniqueNames", "ProfoundTechniqueNames"], [])),
    ...normalizedArray(objectValue(data, ["immortalPowerNames", "ImmortalPowerNames"], [])),
    ...normalizedArray(objectValue(data, ["insightNames", "InsightNames"], []))
  ];
  const names = direct.length ? direct : companion;
  return names.map((entry) => typeof entry === "string" ? entry : objectValue(entry, ["name", "Name"], "")).filter(Boolean);
}

function parseJsonStatblock(input) {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  const data = Array.isArray(parsed) ? parsed[0] : parsed;
  const rawSkills = normalizedArray(objectValue(data, ["skills", "keySkills", "KeySkills", "Key Skills"]));
  const rawWeapons = normalizedArray(objectValue(data, ["weapons", "weapon", "Weapons", "Weapon", "equipment", "Equipment"]));
  const rawCombatTechniques = normalizedArray(objectValue(data, ["combatTechniques", "combatTechnique", "combatPerks", "combatPerk", "Combat Technique"]));
  const rawPowers = objectValue(data, ["powers", "Powers", "specialAbilities", "SpecialAbilities", "specialAbilities", "Special Abilities"], []);
  const defenses = objectValue(data, ["defenses", "Defenses"], {});
  const disciplines = objectValue(data, ["disciplines", "Disciplines"], {});

  return {
    name: objectValue(data, ["name", "Name"], "Imported Ogre Gate NPC"),
    defenses: typeof defenses === "string"
      ? parseDefenseText(defenses)
      : Array.isArray(defenses)
        ? parseDefenseArray(defenses)
        : Object.fromEntries(Object.entries(defenses ?? {}).map(([key, value]) => [DEFENSE_KEYS[normalizeKey(key)] ?? key, Number(value)])),
    skills: typeof rawSkills[0] === "string"
      ? rawSkills.flatMap((entry) => parseSkillText(entry))
      : parseSkillArray(rawSkills),
    disciplines: typeof disciplines === "string"
      ? parseDisciplineText(disciplines)
      : Array.isArray(disciplines)
        ? parseDisciplineText(disciplines.map((entry) => `${objectValue(entry, ["name", "Name"], "")} ${objectValue(entry, ["ranks", "Ranks"], 0)}`).join(", "))
        : Object.fromEntries(Object.entries(disciplines ?? {}).map(([key, value]) => [DISCIPLINE_KEYS[normalizeKey(key)] ?? key, Number(value)])),
    qi: Number(objectValue(data, ["qi", "Qi", "qiRank", "QiRank"], 1)),
    maxWounds: Number(objectValue(data, ["maxWounds", "Max Wounds", "wounds", "Wounds", "currentWounds", "CurrentWounds"], 0))
      + Number(objectValue(data, ["maxWoundModifier", "MaxWoundModifier"], 0)),
    currentImbalance: Number(objectValue(data, ["currentImbalance", "CurrentImbalance"], 0)),
    weapons: typeof rawWeapons[0] === "string"
      ? rawWeapons.flatMap((entry) => parseWeaponText(entry))
      : parseEquipmentArray(rawWeapons),
    equipment: [],
    combatTechniques: parseCombatTechniqueArray(rawCombatTechniques),
    techniques: parseTechniqueNames(data),
    powers: normalizePowerArray(rawPowers),
    expertise: [],
    notes: [],
    raw: JSON.stringify(data, null, 2)
  };
}

function techniqueTypeKey(value = "") {
  const key = normalizeKey(value);
  if (key.includes("counter")) return "counter";
  if (key.includes("stance")) return "stance";
  if (key.includes("special")) return "special";
  if (key.includes("profound")) return "profound";
  if (key.includes("immortal")) return "immortal";
  return "normal";
}

function disciplineKey(value = "") {
  const key = DISCIPLINE_KEYS[normalizeKey(value)];
  return key && key !== "none" ? key : "";
}

function activationSkillKey(value = "") {
  const skillText = String(value ?? "")
    .replace(/\s+against\s+.+$/i, "")
    .trim();
  if (!skillText || /^none$/i.test(skillText)) return "";
  const resolved = resolveSkill(skillText);
  return `${resolved.group}.${resolved.skillKey}`;
}

function targetDefenseFromSkillLine(value = "") {
  const text = String(value ?? "").toLowerCase();
  if (/\bagainst\s+(?:the\s+)?attack\s+roll\b/.test(text)) return "attackRoll";
  const defense = Object.keys(DEFENSE_KEYS).find((key) => text.includes(`against ${key}`));
  return defense ? DEFENSE_KEYS[defense] : "tn";
}

function splitCompanionTechniqueBlocks(text = "") {
  const lines = textLines(text);
  const blocks = [];
  let current = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const startsTechnique = current.length
      && !/^[A-Za-z ]{2,24}:\s*/.test(line)
      && /^Discipline\s*:/i.test(lines[index + 1] ?? "");
    if (startsTechnique) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

function companionTechniqueItemData(lines = []) {
  const name = String(lines[0] ?? "").trim();
  if (!name) return null;
  const fields = {};
  const descriptionLines = [];
  let requirement = "";
  let cathartic = "";
  let activeSection = "description";

  for (const line of lines.slice(1)) {
    const fieldMatch = line.match(/^(Discipline|Skill|Type|Qi)\s*:\s*(.+)$/i);
    if (fieldMatch) {
      fields[normalizeKey(fieldMatch[1])] = fieldMatch[2].trim();
      activeSection = "description";
      continue;
    }
    const requirementMatch = line.match(/^Requirement\s*:\s*(.+)$/i);
    if (requirementMatch) {
      requirement = requirementMatch[1].trim();
      activeSection = "requirement";
      continue;
    }
    const catharticMatch = line.match(/^Cathartic\s*:\s*(.+)$/i);
    if (catharticMatch) {
      cathartic = catharticMatch[1].trim();
      activeSection = "cathartic";
      continue;
    }

    if (activeSection === "requirement") requirement = `${requirement} ${line}`.trim();
    else if (activeSection === "cathartic") cathartic = `${cathartic} ${line}`.trim();
    else descriptionLines.push(line);
  }

  const skillLine = fields.skill ?? "";
  const secret = /\(\s*secret\s*\)/i.test(name);
  const cleanName = name.replace(/\s*\(\s*Secret\s*\)\s*/i, "").trim();
  return {
    name: cleanName || name,
    type: "technique",
    system: {
      description: descriptionLines.join("\n").trim(),
      source: "Imported from Companion App",
      discipline: disciplineKey(fields.discipline) || "none",
      techniqueType: techniqueTypeKey(fields.type),
      activationSkill: activationSkillKey(skillLine),
      targetDefense: targetDefenseFromSkillLine(skillLine),
      targetNumber: 6,
      qiRank: Number(fields.qi?.match(/\d+/)?.[0] ?? 0),
      secret,
      requirementNotes: requirement,
      catharticEffect: cathartic,
      accessNotes: secret ? "Secret Technique" : ""
    }
  };
}

function parseCompanionTechniqueText(text = "") {
  if (!/^\s*Discipline\s*:/mi.test(text) || !/^\s*(Skill|Type|Qi)\s*:/mi.test(text)) return [];
  return splitCompanionTechniqueBlocks(text)
    .map(companionTechniqueItemData)
    .filter((item) => item?.name && item.system);
}

export function parseOgreGateStatblock(input = "") {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) throw new Error("No statblock text was provided.");
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parseJsonStatblock(trimmed);
  return parseTextStatblock(trimmed);
}

export function parseOgreGateTechniqueImport(input = "") {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) throw new Error("No technique text was provided.");

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const names = [];
    const itemData = [];
    for (const entry of entries) {
      if (entry?.type === "technique" || normalizeKey(entry?.Type) === "technique") {
        const data = entry.type === "technique"
          ? foundry.utils.deepClone(entry)
          : {
              name: objectValue(entry, ["name", "Name"], "Imported Technique"),
              type: "technique",
              system: objectValue(entry, ["system", "System"], {})
            };
        delete data._id;
        itemData.push(data);
        continue;
      }
      names.push(...parseTechniqueNames(entry));
      const directName = objectValue(entry, ["name", "Name"], "");
      if (directName && !names.some((name) => techniqueMatchKey(name) === techniqueMatchKey(directName))) names.push(directName);
    }
    return {
      names: Array.from(new Set(names.map((name) => String(name).trim()).filter(Boolean))),
      itemData
    };
  }

  const companionItems = parseCompanionTechniqueText(trimmed);
  if (companionItems.length) {
    return {
      names: [],
      itemData: companionItems
    };
  }

  const parsedStatblock = parseTextStatblock(trimmed);
  const statblockNames = parsedStatblock.techniques ?? [];
  if (statblockNames.length) {
    return {
      names: Array.from(new Set(statblockNames.map((name) => String(name).trim()).filter(Boolean))),
      itemData: []
    };
  }

  const names = textLines(trimmed)
    .flatMap((line) => splitList(line.replace(/^(?:Kung Fu Techniques|Key Kung Fu Techniques|Techniques)\s*(?:\([^)]*\))?\s*:\s*/i, "")))
    .map((name) => name.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  return {
    names: Array.from(new Set(names)),
    itemData: []
  };
}

function skillItemData(entry) {
  const resolved = resolveSkill(entry.name);
  const expertiseEntries = normalizedArray(entry.expertise).map((expertise) => ({
    name: typeof expertise === "string" ? expertise : objectValue(expertise, ["name", "Name"], ""),
    note: typeof expertise === "string" ? "" : objectValue(expertise, ["note", "Note"], "")
  })).filter((expertise) => expertise.name);
  const firstExpertise = expertiseEntries[0] ?? { name: "", note: "" };
  return {
    name: resolved.name,
    type: "skills",
    system: {
      description: resolved.description ?? "",
      source: resolved.source ?? "Imported statblock",
      group: resolved.group,
      skillKey: resolved.skillKey,
      ranks: Math.max(0, Number(entry.dice ?? 0)),
      modifier: 0,
      drain: 0,
      expertise: firstExpertise.name,
      expertiseNote: firstExpertise.note,
      expertiseList: expertiseEntries
    }
  };
}

function qualifiedDamageSkill(skillKey = "") {
  const key = String(skillKey ?? "").trim();
  if (!key) return "";
  if (key.includes(".")) return key;
  if (["athletics", "endurance", "muscle", "speed", "swim", "ride", "sail"].includes(key)) return `physical.${key}`;
  if (["reason", "reasoning"].includes(key)) return "mental.reasoning";
  return key;
}

function skillRank(skillRanks, key = "") {
  const normalized = normalizeKey(key);
  if (!normalized) return 0;
  return Number(skillRanks.get(normalized) ?? 0);
}

function findArmorRule(name = "") {
  const normalized = normalizeKey(name);
  return Object.entries(OGRE_GATE.armorRules ?? {}).find(([key, rule]) => (
    key !== "custom" && normalizeKey(rule.label) === normalized
  )) ?? null;
}

function armorItemData(entry) {
  const match = findArmorRule(entry.name);
  const [armorKey, rule] = match ?? ["custom", null];
  return {
    name: entry.name,
    type: "armor",
    system: {
      description: rule?.notes ?? entry.notes ?? "",
      source: rule ? "Wandering Heroes of Ogre Gate, Chapter 5: Equipment and Goods" : "Imported statblock",
      cost: rule?.cost ?? "",
      armorKey,
      equipped: true,
      defenseModifier: 0,
      penalty: Number(rule?.speedPenalty ?? 0),
      sharpReduction: Number(rule?.sharpReduction ?? 0),
      bluntReduction: Number(rule?.bluntReduction ?? 0),
      mightyReduction: Number(rule?.mightyReduction ?? 0),
      arrowReduction: Number(rule?.arrowReduction ?? 0),
      speedPenalty: Number(rule?.speedPenalty ?? 0),
      parryBonus: Number(rule?.parryBonus ?? 0),
      evadeBonus: Number(rule?.evadeBonus ?? 0),
      muscleRequirement: Number(rule?.muscleRequirement ?? 0),
      shield: Boolean(rule?.shield),
      qualities: [rule?.notes ?? "", entry.notes ? `Imported statblock: ${entry.notes}` : ""].filter(Boolean).join(" ")
    }
  };
}

function weaponItemData(entry, skillRanks = new Map()) {
  const alias = WEAPON_ALIASES[normalizeKey(entry.name)];
  const catalog = WEAPON_CATALOG.find((candidate) => normalizeKey(candidate.name) === normalizeKey(alias ?? entry.name));
  const importedAttackSkill = entry.attackSkillName ? resolveSkill(entry.attackSkillName).skillKey : "";
  const attackSkill = catalog?.attackSkill || importedAttackSkill || catalog?.category || "mediumMelee";
  const baseAccuracy = Number(catalog?.accuracyModifier ?? 0);
  const baseDamageDice = Number(catalog?.damageDice ?? 0);
  const attackDice = entry.attackDice == null ? null : parseDice(entry.attackDice);
  const importedDamageSkill = entry.damageSkillName && normalizeKey(entry.damageSkillName) !== "none"
    ? resolveSkill(entry.damageSkillName).skillKey
    : "";
  const damageSkill = qualifiedDamageSkill(catalog?.damageSkill ?? importedDamageSkill ?? "");
  const damageSkillRanks = damageSkill ? skillRank(skillRanks, damageSkill) : 0;
  const damageDice = entry.damageDice == null
    ? baseDamageDice
    : Math.max(-1, Math.min(10, parseDice(entry.damageDice) - damageSkillRanks));
  const attackSkillLabel = OGRE_GATE.skillGroups.combat.skills[attackSkill] ?? attackSkill;
  const attackRanks = skillRank(skillRanks, attackSkill);
  return {
    name: entry.name,
    type: "weapon",
    system: {
      description: catalog?.description ?? catalog?.qualities ?? entry.notes ?? "",
      source: catalog ? "Wandering Heroes of Ogre Gate, Chapter 5: Equipment and Goods" : "Imported statblock",
      cost: catalog?.cost ?? "",
      category: catalog?.category ?? attackSkill,
      attackSkill,
      targetDefense: catalog?.targetDefense ?? OGRE_GATE.combatSkillDefense[attackSkill] ?? "parry",
      damageSkill,
      damageDice,
      accuracyModifier: entry.accuracyModifier ?? (attackDice == null ? baseAccuracy : Math.max(-10, Math.min(10, attackDice - attackRanks))),
      equipped: true,
      parryBonus: Number(catalog?.parryBonus ?? 0),
      evadeBonus: Number(catalog?.evadeBonus ?? 0),
      muscleRequirement: Number(catalog?.muscleRequirement ?? 0),
      lethal: catalog?.lethal ?? true,
      damageType: catalog?.damageType ?? "special",
      reach: catalog?.reach ?? "normal",
      openDamage: Boolean(catalog?.openDamage),
      qualities: [
        catalog?.qualities ?? "",
        entry.notes ? `Imported statblock: ${entry.notes}` : "",
        attackDice == null ? "" : `Listed attack pool ${attackDice}d10 using ${attackSkillLabel}.`
      ].filter(Boolean).join(" ")
    }
  };
}

function gearItemData(entry, skillRanks = new Map()) {
  if (findArmorRule(entry.name)) return armorItemData(entry);
  return weaponItemData(entry, skillRanks);
}

function equipmentItemData(name = "") {
  return {
    name,
    type: "equipment",
    system: {
      description: "Imported book equipment entry.",
      source: "Imported statblock",
      category: "general",
      quantity: 1,
      weight: ""
    }
  };
}

function combatTechniqueItemData(name = "") {
  const parts = String(name ?? "").split(/\s+-\s+/);
  const skill = parts[0]?.trim() ?? "";
  return {
    name: String(name ?? "").trim(),
    type: "combatTechnique",
    system: {
      description: "Imported from statblock.",
      source: "Imported statblock",
      skill,
      group: skill,
      bonus: parts[1]?.trim() ?? "",
      xpCost: 0,
      damageEffect: ""
    }
  };
}

function powerItemData(power = {}) {
  const name = String(power.name ?? "Power").trim() || "Power";
  const description = String(power.description ?? "").trim();
  return {
    name,
    type: "power",
    system: {
      description,
      source: "Imported statblock",
      category: "special",
      trigger: "",
      rollSkill: "",
      targetDefense: "tn",
      targetNumber: 0,
      effect: description,
      mechanicalNotes: ""
    }
  };
}

async function techniqueItemData(name = "") {
  const pack = game.packs.get(`${OGRE_GATE.id}.techniques`);
  if (pack) {
    const index = await pack.getIndex({ fields: ["name", "type", "system"] });
    const incomingKey = techniqueMatchKey(name);
    const match = index.find((entry) => techniqueMatchKey(entry.name) === incomingKey);
    if (match) {
      const document = await pack.getDocument(match._id);
      const data = document.toObject();
      delete data._id;
      data.flags = {
        ...(data.flags ?? {}),
        [OGRE_GATE.id]: {
          ...(data.flags?.[OGRE_GATE.id] ?? {}),
          sourceUuid: document.uuid
        }
      };
      return data;
    }
  }

  return {
    name: String(name ?? "").trim(),
    type: "technique",
    system: {
      description: "Imported from statblock. No matching technique compendium entry was found.",
      source: "Imported statblock",
      discipline: "",
      techniqueType: "normal",
      qiRank: 0,
      activationSkill: "",
      targetDefense: "tn",
      targetNumber: 6
    }
  };
}

async function techniqueImportFolder() {
  const existing = game.folders.find((folder) => folder.type === "Item" && folder.name === "Imported Techniques");
  if (existing) return existing;
  return Folder.create({ name: "Imported Techniques", type: "Item", sorting: "a" });
}

function inferDisciplineRanks(itemData = []) {
  return itemData.reduce((disciplines, item) => {
    if (item.type !== "technique") return disciplines;
    const discipline = DISCIPLINE_KEYS[normalizeKey(item.system?.discipline)] ?? item.system?.discipline;
    if (!discipline || discipline === "none" || !OGRE_GATE.disciplines[discipline]) return disciplines;
    disciplines[discipline] = Math.max(Number(disciplines[discipline] ?? 0), Number(item.system?.qiRank ?? 0));
    return disciplines;
  }, {});
}

function actorUpdates(parsed) {
  const updates = {
    "system.qi.rank": Math.max(0, Number(parsed.qi ?? 1)),
    "system.creation.enabled": false
  };
  if (parsed.maxWounds) updates["system.resources.wounds.value"] = Number(parsed.maxWounds);
  if (Number.isFinite(Number(parsed.currentImbalance))) updates["system.imbalance.value"] = Math.max(0, Number(parsed.currentImbalance));
  for (const [key, value] of Object.entries(parsed.defenses ?? {})) {
    const defenseKey = DEFENSE_KEYS[normalizeKey(key)] ?? key;
    if (!OGRE_GATE.defenses[defenseKey]) continue;
    updates[`system.defenses.${defenseKey}.base`] = Math.max(0, Number(value));
    updates[`system.defenses.${defenseKey}.ranks`] = 0;
    updates[`system.defenses.${defenseKey}.qiBonus`] = 0;
    updates[`system.defenses.${defenseKey}.modifier`] = 0;
    updates[`system.defenses.${defenseKey}.drain`] = 0;
  }
  for (const [key, value] of Object.entries(parsed.disciplines ?? {})) {
    const disciplineKey = DISCIPLINE_KEYS[normalizeKey(key)] ?? key;
    if (!OGRE_GATE.disciplines[disciplineKey] || disciplineKey === "none") continue;
    updates[`system.disciplines.${disciplineKey}.ranks`] = Math.max(0, Number(value));
  }
  updates["system.notes.status"] = [
    "<p>Imported from Bedrock-style or book statblock.</p>",
    parsed.notes?.length ? `<p>${escapeHtml(parsed.notes.join(" | "))}</p>` : "",
    `<pre>${escapeHtml(parsed.raw ?? "")}</pre>`
  ].filter(Boolean).join("");
  return updates;
}

export async function importOgreGateStatblock(input, { actorType = "npc", renderSheet = true } = {}) {
  const parsed = parseOgreGateStatblock(input);
  if (!parsed.name) parsed.name = "Imported Ogre Gate NPC";
  const type = ["npc", "monster", "character"].includes(actorType) ? actorType : "npc";
  const actor = await Actor.create({ name: parsed.name, type }, { renderSheet: false });
  await actor.update(actorUpdates(parsed));

  const skillItems = parsed.skills.map(skillItemData);
  const skillRanks = new Map();
  for (const item of skillItems) {
    skillRanks.set(normalizeKey(item.system.skillKey), Number(item.system.ranks ?? 0));
    skillRanks.set(normalizeKey(`${item.system.group}.${item.system.skillKey}`), Number(item.system.ranks ?? 0));
    skillRanks.set(normalizeKey(item.name), Number(item.system.ranks ?? 0));
  }
  const itemData = [
    ...skillItems,
    ...parsed.weapons.map((weapon) => gearItemData(weapon, skillRanks)),
    ...parsed.equipment.map(equipmentItemData),
    ...parsed.combatTechniques.map(combatTechniqueItemData),
    ...(parsed.powers ?? []).map(powerItemData)
  ];
  for (const technique of parsed.techniques) itemData.push(await techniqueItemData(technique));
  const inferredDisciplines = inferDisciplineRanks(itemData);
  const disciplineUpdates = {};
  for (const [discipline, ranks] of Object.entries(inferredDisciplines)) {
    if (Number(parsed.disciplines?.[discipline] ?? 0) > 0) continue;
    disciplineUpdates[`system.disciplines.${discipline}.ranks`] = ranks;
  }
  if (Object.keys(disciplineUpdates).length) await actor.update(disciplineUpdates);
  if (itemData.length) await actor.createEmbeddedDocuments("Item", itemData);

  ui.notifications.info(`Imported ${actor.name} with ${itemData.length} item(s).`);
  if (renderSheet) actor.sheet?.render(true);
  return actor;
}

export async function importOgreGateTechniques(input, { renderSheets = false } = {}) {
  const parsed = parseOgreGateTechniqueImport(input);
  const folder = await techniqueImportFolder();
  const existing = new Set(game.items.filter((item) => item.type === "technique").map((item) => techniqueMatchKey(item.name)));
  const itemData = [];
  for (const data of parsed.itemData ?? []) {
    const name = String(data.name ?? "").trim();
    if (!name || existing.has(techniqueMatchKey(name))) continue;
    existing.add(techniqueMatchKey(name));
    itemData.push({
      ...data,
      folder: folder.id,
      type: "technique",
      system: {
        ...(data.system ?? {}),
        source: data.system?.source || "Imported technique"
      }
    });
  }
  for (const name of parsed.names ?? []) {
    if (existing.has(techniqueMatchKey(name))) continue;
    const data = await techniqueItemData(name);
    data.folder = folder.id;
    data.system = {
      ...(data.system ?? {}),
      source: data.system?.source || "Imported technique"
    };
    existing.add(techniqueMatchKey(data.name));
    itemData.push(data);
  }
  if (!itemData.length) {
    ui.notifications.info("No new techniques were found to import.");
    return [];
  }
  const items = await Item.createDocuments(itemData, { renderSheet: false });
  ui.notifications.info(`Imported ${items.length} technique item(s).`);
  if (renderSheets) items.forEach((item) => item.sheet?.render(true));
  return items;
}

export function showOgreGateStatblockImporter({ defaultImportType = "character" } = {}) {
  const importingTechniques = defaultImportType === "techniques";
  return new Dialog({
    title: "Import Ogre Gate",
    content: `
      <form class="ogre-gate-import-dialog">
        <p>Paste a Bedrock-style plaintext statblock, equivalent JSON, or a list of technique names.</p>
        <label>Import Type
          <select name="importType">
            <option value="character" ${importingTechniques ? "" : "selected"}>Character / NPC</option>
            <option value="techniques" ${importingTechniques ? "selected" : ""}>Techniques</option>
          </select>
        </label>
        <label>Actor Type
          <select name="actorType">
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
            <option value="character">Character</option>
          </select>
        </label>
        <textarea name="statblock" placeholder="Ruang Yuancheng&#10;Defenses: Hardiness 4, Parry 4...&#10;&#10;Or:&#10;Biting Blade&#10;Spinning Back Kick"></textarea>
      </form>
    `,
    buttons: {
      import: {
        label: "Import",
        callback: async (html) => {
          const root = html[0] ?? html;
          const statblock = root.querySelector("[name='statblock']")?.value ?? "";
          const actorType = root.querySelector("[name='actorType']")?.value ?? "npc";
          const importType = root.querySelector("[name='importType']")?.value ?? "character";
          try {
            if (importType === "techniques") await importOgreGateTechniques(statblock);
            else await importOgreGateStatblock(statblock, { actorType });
          } catch (error) {
            console.error("Ogre Gate | Import failed", error);
            ui.notifications.error(`Ogre Gate import failed: ${error.message}`);
          }
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "import"
  }).render(true);
}

export function injectOgreGateStatblockImporter(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector("[data-action='ogre-gate-import-statblock']")) return;
  const header = root.querySelector(".directory-header .header-actions")
    ?? root.querySelector(".directory-header")
    ?? root.querySelector("header")
    ?? root;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = "ogre-gate-import-statblock";
  button.innerText = "Import Character";
  button.title = "Import a Bedrock-style character statblock or save JSON.";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showOgreGateStatblockImporter();
  });
  header.append(button);
}

export function injectOgreGateTechniqueImporter(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector("[data-action='ogre-gate-import-techniques']")) return;
  const header = root.querySelector(".directory-header .header-actions")
    ?? root.querySelector(".directory-header")
    ?? root.querySelector("header")
    ?? root;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = "ogre-gate-import-techniques";
  button.innerText = "Import Techniques";
  button.title = "Import Kung Fu Technique items from a pasted list, statblock, or JSON.";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showOgreGateStatblockImporter({ defaultImportType: "techniques" });
  });
  header.append(button);
}
