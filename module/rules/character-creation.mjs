import { OGRE_GATE } from "../config.mjs";

const GROUP_KEYS = Object.keys(OGRE_GATE.skillGroups);

function rankCost(rank = 0) {
  rank = Math.max(0, Number(rank ?? 0));
  return (rank * (rank + 1)) / 2;
}

function adjustedRankCost(actor, groupKey, skillKey, rank = 0) {
  const race = actor.system.creation.race;
  let adjustedRank = Math.max(0, Number(rank ?? 0));

  if (race === "kithiri" && (
    (groupKey === "mental" && ["empathy", "reasoning"].includes(skillKey))
    || (groupKey === "defenses" && skillKey === "wits")
  )) {
    adjustedRank = Math.max(0, adjustedRank - 1);
  }

  if (race === "juren" && groupKey === "physical" && skillKey === "muscle") {
    adjustedRank = Math.max(0, adjustedRank - 1);
  }

  let cost = rankCost(adjustedRank);
  if (race === "kithiri" && groupKey === "knowledge") cost /= 2;
  if (race === "juren" && groupKey === "defenses" && skillKey === "wits") cost *= 2;
  return cost;
}

function countItems(actor, type) {
  const types = Array.isArray(type) ? type : [type];
  return actor.items.filter((item) => types.includes(item.type)).length;
}

function sumItemValues(actor, type, path) {
  return actor.items
    .filter((item) => item.type === type)
    .reduce((total, item) => total + Number(foundry.utils.getProperty(item, path) ?? 0), 0);
}

function countCreationFlaws(actor) {
  return actor.items.filter((item) => {
    if (item.type !== "flaw") return false;
    if (!item.system.acquiredAtCreation) return false;
    return !item.system.exemptFromCreationLimit;
  }).length;
}

function countStartingClothing(actor) {
  return actor.items.filter((item) => item.type === "equipment" && item.system.category === "clothing").length;
}

function countStartingOtherItems(actor) {
  return actor.items.filter((item) => {
    if (item.type === "weapon") return false;
    if (!["armor", "equipment", "substance"].includes(item.type)) return false;
    return item.type !== "equipment" || item.system.category !== "clothing";
  }).length;
}

function getOpenSkillBaseKey(skillKey) {
  return skillKey.split(/[.:]/)[0].replace(/[0-9]+$/, "");
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getSkillRanks(actor, groupKey, skillKey) {
  const normalized = normalizeKey(skillKey);
  const item = actor.items.find((candidate) => {
    if (candidate.type !== "skills") return false;
    if (candidate.system.group !== groupKey) return false;
    return normalizeKey(candidate.system.skillKey || candidate.name) === normalized;
  });
  return Number(item?.system?.ranks ?? actor.system.skills?.[groupKey]?.[skillKey]?.ranks ?? 0);
}

function getExpertiseEntries(entry) {
  const entries = Array.from(entry?.expertiseList ?? [])
    .map((expertise) => ({
      name: String(expertise?.name ?? "").trim(),
      note: String(expertise?.note ?? "").trim()
    }))
    .filter((expertise) => expertise.name);
  const legacyName = String(entry?.expertise ?? "").trim();
  if (legacyName && !entries.some((expertise) => expertise.name === legacyName)) {
    entries.unshift({
      name: legacyName,
      note: String(entry?.expertiseNote ?? "").trim()
    });
  }
  return entries;
}

function getGroupBudget(creation, groupKey) {
  if (creation.scholarOption) {
    return groupKey === "knowledge" ? OGRE_GATE.creation.scholarKnowledgeBudget : OGRE_GATE.creation.secondaryBudget;
  }

  return [creation.primaryGroup1, creation.primaryGroup2].includes(groupKey)
    ? OGRE_GATE.creation.primaryBudget
    : OGRE_GATE.creation.secondaryBudget;
}

function getPrimaryGroupLabels(creation) {
  if (creation.scholarOption) return [OGRE_GATE.skillGroups.knowledge.label];
  return [creation.primaryGroup1, creation.primaryGroup2]
    .filter(Boolean)
    .map((key) => OGRE_GATE.skillGroups[key]?.label ?? key);
}

function getGroupSpent(actor, groupKey) {
  if (groupKey === "defenses") {
    return Object.entries(actor.system.defenses).reduce((total, [skillKey, defense]) => {
      return total + adjustedRankCost(actor, groupKey, skillKey, defense.ranks);
    }, 0);
  }

  return actor.items.filter((item) => item.type === "skills" && item.system.group === groupKey).reduce((total, item) => {
    return total + adjustedRankCost(actor, groupKey, item.system.skillKey || item.name, item.system.ranks);
  }, 0);
}

function getExpertiseSpent(actor, groupKey) {
  if (groupKey === "defenses") return Object.values(actor.system.defenses).filter((defense) => defense.expertise).length;
  return actor.items.filter((item) => item.type === "skills" && item.system.group === groupKey)
    .reduce((total, item) => total + getExpertiseEntries(item.system).length, 0);
}

function getMissingExpertiseWarnings(actor, groupKey) {
  if (groupKey === "defenses") {
    return Object.entries(actor.system.defenses)
      .filter(([, defense]) => defense.expertise)
      .map(([key]) => `${OGRE_GATE.skillGroups.defenses.skills[key]} has custom expertise; verify table approval.`);
  }

  return actor.items.filter((item) => item.type === "skills" && item.system.group === groupKey).flatMap((item) => {
    const entries = getExpertiseEntries(item.system);
    if (!entries.length) return [];
    const baseKey = getOpenSkillBaseKey(item.system.skillKey || item.name);
    const allowed = OGRE_GATE.expertiseOptions[baseKey] ?? [];
    if (allowed.length === 0) return entries.map((entry) => `${item.name} Expertise (${entry.name}) is custom; verify table approval.`);
    return [];
  });
}

function getDisciplineRanks(actor) {
  return Object.values(actor.system.disciplines).reduce((total, discipline) => total + Number(discipline.ranks ?? 0), 0);
}

function getDefenseQiBonus(actor) {
  return Object.values(actor.system.defenses).reduce((total, defense) => total + Number(defense.qiBonus ?? 0), 0);
}

function buildCheck(label, current, target, { mode = "exact", detail = "" } = {}) {
  let status = "ok";
  if (mode === "min") status = current >= target ? "ok" : "warn";
  else if (mode === "max") status = current <= target ? "ok" : "warn";
  else status = current === target ? "ok" : "warn";
  return { label, current, target, mode, status, detail };
}

export function prepareCharacterCreation(actor) {
  const creation = actor.system.creation;
  const primaryGroupLabels = getPrimaryGroupLabels(creation);
  const groupRows = GROUP_KEYS.map((groupKey) => {
    const budget = getGroupBudget(creation, groupKey);
    const skillSpent = getGroupSpent(actor, groupKey);
    const expertiseSpent = getExpertiseSpent(actor, groupKey);
    const spent = skillSpent;
    return {
      key: groupKey,
      label: OGRE_GATE.skillGroups[groupKey].label,
      budget,
      skillSpent,
      expertiseSpent,
      spent,
      remaining: budget - spent,
      over: spent > budget
    };
  });

  const totalOverage = groupRows.reduce((total, row) => total + Math.max(0, row.spent - row.budget), 0);
  const flawPoints = sumItemValues(actor, "flaw", "system.skillPointValue") + Number(creation.bonusSkillPoints ?? 0);
  const kungFuCount = countItems(actor, "technique");
  const combatTechniqueCount = countItems(actor, "combatTechnique");
  const creationFlawCount = countCreationFlaws(actor);
  const startingWeaponCount = countItems(actor, "weapon");
  const startingClothingCount = countStartingClothing(actor);
  const startingOtherItemCount = countStartingOtherItems(actor);
  const disciplineRanks = getDisciplineRanks(actor);
  const defenseQiBonus = getDefenseQiBonus(actor);
  const optionalRaceNeedsApproval = creation.race && creation.race !== "human" && !creation.optionalRaceApproved;
  const raceChecks = [];
  if (creation.race === "kithiri") {
    raceChecks.push(buildCheck("Kithiri Empathy free rank", getSkillRanks(actor, "mental", "empathy"), 1, { mode: "min" }));
    raceChecks.push(buildCheck("Kithiri Reasoning free rank", getSkillRanks(actor, "mental", "reasoning"), 1, { mode: "min" }));
    raceChecks.push(buildCheck("Kithiri Wits free rank", actor.system.defenses.wits.ranks, 1, { mode: "min" }));
  }
  if (creation.race === "juren") {
    raceChecks.push(buildCheck("Juren Muscle free rank", getSkillRanks(actor, "physical", "muscle"), 1, { mode: "min" }));
    raceChecks.push(buildCheck("Juren Wits cap", actor.system.defenses.wits.ranks, 2, { mode: "max" }));
  }
  const primaryCount = creation.scholarOption
    ? 1
    : new Set([creation.primaryGroup1, creation.primaryGroup2].filter(Boolean)).size;

  const checks = [
    buildCheck("Race selected", creation.race ? 1 : 0, 1, { mode: "min", detail: "Human is the default." }),
    buildCheck("Optional race approved", optionalRaceNeedsApproval ? 0 : 1, 1, { mode: "min" }),
    buildCheck("Primary skill groups", primaryCount, creation.scholarOption ? 1 : 2),
    buildCheck("Sect or Sifu", (actor.system.identity.sect || actor.system.identity.sifu) ? 1 : 0, 1, { mode: "min" }),
    buildCheck("Reputation", actor.system.identity.reputation ? 1 : 0, 1, { mode: "min" }),
    buildCheck("Martial discipline ranks", disciplineRanks, OGRE_GATE.creation.disciplineRanks),
    buildCheck("Starting kung fu techniques", kungFuCount, OGRE_GATE.creation.startingKungFuTechniques),
    buildCheck("Starting combat perk", combatTechniqueCount, OGRE_GATE.creation.startingCombatTechniques),
    buildCheck("Creation flaw limit", creationFlawCount, OGRE_GATE.flawLimit.standard, { mode: "max" }),
    buildCheck("Starting Qi", actor.system.qi.rank, OGRE_GATE.creation.startingQi, { mode: "min" }),
    buildCheck("Qi defense dots", defenseQiBonus, actor.system.qi.rank),
    buildCheck("Skill point overage covered by flaws", totalOverage, flawPoints, { mode: "max", detail: "Flaw item values plus manual bonus points." }),
    buildCheck("Starting spade coins", actor.system.money.spades, OGRE_GATE.creation.startingSpadeCoins, { mode: "min" }),
    buildCheck("Starting weapon", startingWeaponCount, 1, { mode: "min", detail: "Chapter 5 starting equipment includes one weapon." }),
    buildCheck("Starting clothes", startingClothingCount, 1, { mode: "min", detail: "Chapter 5 starting equipment includes one set of clothes." }),
    buildCheck("Starting other item", startingOtherItemCount, 1, { mode: "min", detail: "Chapter 5 starting equipment includes one additional item." }),
    ...raceChecks
  ];

  return {
    groupOptions: GROUP_KEYS.map((key) => ({ key, label: OGRE_GATE.skillGroups[key].label })),
    primaryGroupLabels,
    groupRows,
    checks,
    flawPoints,
    totalOverage,
    disciplineRanks,
    defenseQiBonus,
    kungFuCount,
    kungFuRemaining: OGRE_GATE.creation.startingKungFuTechniques - kungFuCount,
    combatTechniqueCount,
    combatTechniqueRemaining: OGRE_GATE.creation.startingCombatTechniques - combatTechniqueCount,
    creationFlawCount,
    startingWeaponCount,
    startingClothingCount,
    startingOtherItemCount,
    expertiseWarnings: GROUP_KEYS.flatMap((groupKey) => getMissingExpertiseWarnings(actor, groupKey)),
    raceRule: OGRE_GATE.raceRules[creation.race] ?? OGRE_GATE.raceRules.human,
    raceRollEffects: getRaceRollEffects(actor),
    nextSteps: getCreationNextSteps(actor, checks)
  };
}

export { rankCost };

function getRaceRollEffects(actor) {
  const race = actor.system.creation.race;
  if (race === "hechi") {
    return [
      "+1d10 Endurance rolls",
      "-2d10 Athletics and Speed rolls",
      "-1d10 Combat Skill rolls"
    ];
  }
  if (race === "juren") {
    return [
      "Free Muscle rank",
      "-2d10 Speed rolls",
      "-1d10 Mental Skill rolls",
      "+1d10 melee damage"
    ];
  }
  if (race === "ouyan") return ["-1d10 Physical Skill rolls"];
  if (race === "kithiri") {
    return [
      "Free Empathy, Reasoning, and Wits ranks",
      "Knowledge skills cost half",
      actor.system.creation.kithiriSocialPenalty ? "-1d10 Command, Deception, and Persuade against non-Kithiri" : "Kithiri social penalty disabled for current scene"
    ];
  }
  return ["No race roll modifiers"];
}

function getCreationNextSteps(actor, checks) {
  const nextSteps = checks
    .filter((check) => check.status !== "ok")
    .map((check) => check.label);
  if (actor.system.creation.race === "human") return nextSteps;
  if (!actor.system.creation.optionalRaceApproved) nextSteps.unshift("Confirm optional race approval with the GM");
  return Array.from(new Set(nextSteps));
}
