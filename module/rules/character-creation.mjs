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
  return actor.items.filter((item) => item.type === type).length;
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

function getOpenSkillBaseKey(skillKey) {
  return skillKey.replace(/[0-9]+$/, "");
}

function getGroupBudget(creation, groupKey) {
  if (creation.scholarOption) {
    return groupKey === "knowledge" ? OGRE_GATE.creation.scholarKnowledgeBudget : OGRE_GATE.creation.secondaryBudget;
  }

  return [creation.primaryGroup1, creation.primaryGroup2].includes(groupKey)
    ? OGRE_GATE.creation.primaryBudget
    : OGRE_GATE.creation.secondaryBudget;
}

function getGroupSpent(actor, groupKey) {
  if (groupKey === "defenses") {
    return Object.entries(actor.system.defenses).reduce((total, [skillKey, defense]) => {
      return total + adjustedRankCost(actor, groupKey, skillKey, defense.ranks);
    }, 0);
  }

  return Object.entries(actor.system.skills[groupKey] ?? {}).reduce((total, [skillKey, skill]) => {
    return total + adjustedRankCost(actor, groupKey, skillKey, skill.ranks);
  }, 0);
}

function getExpertiseSpent(actor, groupKey) {
  if (groupKey === "defenses") return Object.values(actor.system.defenses).filter((defense) => defense.expertise).length;
  return Object.values(actor.system.skills[groupKey] ?? {}).filter((skill) => skill.expertise).length;
}

function getMissingExpertiseWarnings(actor, groupKey) {
  if (groupKey === "defenses") {
    return Object.entries(actor.system.defenses)
      .filter(([, defense]) => defense.expertise)
      .map(([key]) => `${OGRE_GATE.skillGroups.defenses.skills[key]} has custom expertise; verify table approval.`);
  }

  return Object.entries(actor.system.skills[groupKey] ?? {}).flatMap(([skillKey, skill]) => {
    if (!skill.expertise) return [];
    const baseKey = getOpenSkillBaseKey(skillKey);
    const allowed = OGRE_GATE.expertiseOptions[baseKey] ?? [];
    if (allowed.length === 0) return [`${skill.label} does not list standard Expertise in Chapter 1.`];
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
  const groupRows = GROUP_KEYS.map((groupKey) => {
    const budget = getGroupBudget(creation, groupKey);
    const skillSpent = getGroupSpent(actor, groupKey);
    const expertiseSpent = getExpertiseSpent(actor, groupKey);
    const spent = skillSpent + expertiseSpent;
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
  const disciplineRanks = getDisciplineRanks(actor);
  const defenseQiBonus = getDefenseQiBonus(actor);
  const optionalRaceNeedsApproval = creation.race && creation.race !== "human" && !creation.optionalRaceApproved;
  const raceChecks = [];
  if (creation.race === "kithiri") {
    raceChecks.push(buildCheck("Kithiri Empathy free rank", actor.system.skills.mental.empathy.ranks, 1, { mode: "min" }));
    raceChecks.push(buildCheck("Kithiri Reasoning free rank", actor.system.skills.mental.reasoning.ranks, 1, { mode: "min" }));
    raceChecks.push(buildCheck("Kithiri Wits free rank", actor.system.defenses.wits.ranks, 1, { mode: "min" }));
  }
  if (creation.race === "juren") {
    raceChecks.push(buildCheck("Juren Muscle free rank", actor.system.skills.physical.muscle.ranks, 1, { mode: "min" }));
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
    buildCheck("Starting combat technique", combatTechniqueCount, OGRE_GATE.creation.startingCombatTechniques),
    buildCheck("Creation flaw limit", creationFlawCount, OGRE_GATE.flawLimit.standard, { mode: "max" }),
    buildCheck("Starting Qi", actor.system.qi.rank, OGRE_GATE.creation.startingQi, { mode: "min" }),
    buildCheck("Qi defense dots", defenseQiBonus, actor.system.qi.rank),
    buildCheck("Skill point overage covered by flaws", totalOverage, flawPoints, { mode: "max", detail: "Flaw item values plus manual bonus points." }),
    buildCheck("Starting spade coins", actor.system.money.spades, OGRE_GATE.creation.startingSpadeCoins, { mode: "min" }),
    ...raceChecks
  ];

  return {
    groupOptions: GROUP_KEYS.map((key) => ({ key, label: OGRE_GATE.skillGroups[key].label })),
    groupRows,
    checks,
    flawPoints,
    totalOverage,
    disciplineRanks,
    defenseQiBonus,
    kungFuCount,
    combatTechniqueCount,
    creationFlawCount,
    expertiseWarnings: GROUP_KEYS.flatMap((groupKey) => getMissingExpertiseWarnings(actor, groupKey)),
    raceRule: OGRE_GATE.raceRules[creation.race] ?? OGRE_GATE.raceRules.human
  };
}

export { rankCost };
