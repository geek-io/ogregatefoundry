import { OGRE_GATE } from "./config.mjs";
import { OgreGateRoll } from "./rolls.mjs";
import { prepareCharacterCreation } from "./rules/character-creation.mjs";

const MELEE_SKILLS = new Set(["armStrike", "legStrike", "grapple", "throw", "lightMelee", "mediumMelee", "heavyMelee"]);
const RANGED_SKILLS = new Set(["smallRanged", "largeRanged"]);
const MARTIAL_DISCIPLINE_KEYS = new Set(["waijia", "qinggong", "neigong", "dianxue"]);
const HEAT_RELATED_DISEASES = new Set(["bloodfire", "burningplague", "heartfire", "heatanddampnessofthelung"]);
const SLOWER_AFFLICTION_INTERVAL = {
  seconds: "minutes",
  minutes: "hours",
  hours: "days",
  days: "weeks",
  weeks: "months",
  months: "years",
  years: "years",
  none: "none"
};

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function effectiveRanks(entry) {
  return Math.max(0, Number(entry?.ranks ?? 0) - Number(entry?.drain ?? 0));
}

function systemRule(key) {
  return game.settings.get(OGRE_GATE.id, key);
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function skillSearchKeys(value = "") {
  const raw = String(value ?? "").trim();
  const beforeDefense = cleanSkillReference(raw);
  return Array.from(new Set([
    normalizeKey(raw),
    normalizeKey(beforeDefense)
  ].filter(Boolean)));
}

function cleanSkillReference(value = "") {
  return String(value ?? "")
    .trim()
    .replace(/\b(roll|skill|using|with)\b/gi, " ")
    .split(/\b(?:against|versus|vs\.?|v\.)\b/i)[0]
    .trim();
}

function itemSkillKey(item) {
  return normalizeKey(item?.system?.skillKey || item?.name || "");
}

function resolveSkillGroupKey(value = "") {
  const normalized = normalizeKey(value);
  return Object.entries(OGRE_GATE.skillGroups).find(([groupKey, group]) => (
    normalizeKey(groupKey) === normalized || normalizeKey(group.label) === normalized
  ))?.[0] ?? null;
}

function resolveSkillKeyInGroup(groupKey, value = "") {
  const normalized = normalizeKey(value);
  const skills = OGRE_GATE.skillGroups[groupKey]?.skills ?? {};
  return Object.entries(skills).find(([skillKey, label]) => (
    normalizeKey(skillKey) === normalized || normalizeKey(label) === normalized
  ))?.[0] ?? null;
}

function parseQualifiedSkillReference(value = "") {
  const clean = cleanSkillReference(value);
  if (!clean) return null;

  const delimited = clean.split(/[:.]/).map((part) => part.trim()).filter(Boolean);
  if (delimited.length >= 2) {
    const groupKey = resolveSkillGroupKey(delimited[0]);
    const skillKey = groupKey ? resolveSkillKeyInGroup(groupKey, delimited.slice(1).join(" ")) : null;
    if (groupKey && skillKey) return { groupKey, skillKey };
  }

  const normalized = normalizeKey(clean);
  for (const [groupKey, group] of Object.entries(OGRE_GATE.skillGroups)) {
    if (groupKey === "defenses") continue;
    const groupKeys = [groupKey, group.label].map(normalizeKey);
    for (const [skillKey, label] of Object.entries(group.skills)) {
      const skillKeys = [skillKey, label].map(normalizeKey);
      const qualifiedKeys = groupKeys.flatMap((groupPart) => skillKeys.map((skillPart) => `${groupPart}${skillPart}`));
      if (qualifiedKeys.includes(normalized)) return { groupKey, skillKey };
    }
  }
  return null;
}

function skillLabel(groupKey, skillKey, skill) {
  return skill?.label ?? OGRE_GATE.skillGroups[groupKey]?.skills?.[skillKey] ?? skillKey;
}

function parseTechniqueDamagePool(text = "", actor) {
  const value = String(text ?? "");
  let dice = 0;
  let note = "";
  const skillDamage = value.match(/\b(Arm Strike|Leg Strike|Grapple|Throw|Light Melee|Medium Melee|Heavy Melee|Small Ranged|Large Ranged|Athletics|Speed|Muscle|Endurance|Reason)\b\s*([+-]\s*\d+)?\s*d10/i);
  if (skillDamage) {
    const skillName = skillDamage[1];
    const modifier = Number(String(skillDamage[2] ?? "+0").replace(/\s+/g, ""));
    const skill = actor.findSkillPath(skillName)?.skill;
    dice = effectiveRanks(skill) + modifier;
    note = `${skillName} ${modifier >= 0 ? "+" : ""}${modifier}d10`;
  }
  const perRank = value.match(/(?:(\d+)\s*d10\s*)?per\s+Rank\s+of\s+(Waijia|Qinggong|Neigong|Dianxue)/i);
  if (perRank) {
    const multiplier = Number(perRank[1] ?? 1);
    const disciplineKey = normalizeKey(perRank[2]);
    const disciplineRanks = Number(actor.system.disciplines?.[disciplineKey]?.ranks ?? 0);
    dice = multiplier * disciplineRanks;
    note = `${multiplier}d10 per Rank of ${perRank[2]} Martial Discipline (rank ${disciplineRanks})`;
  }
  const perQi = value.match(/(?:(\d+)\s*d10\s*)?(?:per\s+Rank\s+of\s+Qi|per\s+Qi\s+Rank|per\s+Rank\s+Qi)/i);
  if (perQi) {
    const multiplier = Number(perQi[1] ?? 1);
    dice = multiplier * Number(actor.system.status.effectiveQi ?? actor.system.qi.rank ?? dice);
    note = `${multiplier}d10 per Rank of Qi`;
  }
  const diceMatch = value.match(/(\d+)\s*d10/i);
  if (!note && diceMatch) {
    dice = Number(diceMatch[1]);
    note = "fixed damage dice";
  }
  const normal = /normal\s+damage/i.test(value);
  return {
    dice: Math.max(0, Math.trunc(dice)),
    note,
    normal
  };
}

function snapshotAffliction(source = {}) {
  return {
    rulesKey: source.rulesKey ?? "",
    name: source.name ?? "",
    type: source.type ?? "poison",
    lethality: source.lethality ?? "hours",
    speed: source.speed ?? "hours",
    baseSpeed: source.baseSpeed ?? source.speed ?? "hours",
    effect: source.effect ?? "temporary",
    potency: source.potency ?? "",
    affectedSkills: source.affectedSkills ?? "",
    brewRating: Number(source.brewRating ?? 0),
    contagious: Boolean(source.contagious),
    medicineTn: Number(source.medicineTn ?? 6),
    baseMedicineTn: Number(source.baseMedicineTn ?? source.medicineTn ?? 6),
    medicineDiceBonus: Number(source.medicineDiceBonus ?? 0),
    treatmentMode: source.treatmentMode ?? "standard",
    interval: source.interval ?? source.lethality ?? "hours",
    antidoteRequired: Boolean(source.antidoteRequired),
    antidoteApplied: Boolean(source.antidoteApplied),
    remedy: source.remedy ?? "",
    status: source.status ?? "untreated",
    notes: source.notes ?? "",
    contracted: Boolean(source.contracted),
    progression: Number(source.progression ?? 0),
    lethalityLimit: Number(source.lethalityLimit ?? 0),
    lethalityElapsed: Number(source.lethalityElapsed ?? 0),
    qiDrainApplied: Number(source.qiDrainApplied ?? 0),
    appliedSubstances: Array.from(source.appliedSubstances ?? []).map((application) => ({
      rulesKey: application.rulesKey ?? "",
      name: application.name ?? "",
      effect: application.effect ?? "",
      duration: application.duration ?? ""
    }))
  };
}

function newAfflictionFromItem(item) {
  const data = item.system;
  return snapshotAffliction({
    rulesKey: data.rulesKey,
    name: item.name,
    type: data.afflictionType,
    lethality: data.lethality,
    speed: data.speed,
    baseSpeed: data.speed,
    effect: data.effect,
    potency: data.potency,
    affectedSkills: data.affectedSkills,
    brewRating: data.brewRating,
    contagious: data.contagious,
    medicineTn: data.medicineTn,
    baseMedicineTn: data.medicineTn,
    treatmentMode: data.treatmentMode,
    interval: data.lethality,
    antidoteRequired: data.antidoteRequired,
    remedy: data.remedy,
    notes: data.specialRules
  });
}

function isMentalAffliction(affliction = {}) {
  if (!affliction?.name) return false;
  if (["cured", "purged", "resisted", "nullified"].includes(normalizeKey(affliction.status))) return false;
  const directType = normalizeKey(affliction.type);
  if (["mental", "mentalaffliction"].includes(directType)) return true;
  const explicitText = normalizeKey([
    affliction.rulesKey,
    affliction.name,
    affliction.effect,
    affliction.notes
  ].filter(Boolean).join(" "));
  return explicitText.includes("mentalaffliction");
}

function purgeAfflictionSnapshot(source = {}) {
  const affliction = snapshotAffliction(source);
  affliction.status = "purged";
  affliction.contracted = false;
  affliction.progression = 0;
  affliction.lethalityLimit = 0;
  affliction.lethalityElapsed = 0;
  affliction.qiDrainApplied = 0;
  affliction.appliedSubstances = [];
  return affliction;
}

function requiresCatharticStance(item) {
  return item.system.techniqueType === "stance"
    && /must be used Cathartically|has no effect unless used Cathartically/i.test(item.system.description ?? "");
}

function normalStanceRequiresRoll(item) {
  return item.system.techniqueType === "stance"
    && /requires a skill roll to use non-Cathartically|requires a skill roll/i.test(item.system.description ?? "");
}

function isCounterTechnique(item) {
  return item?.system?.techniqueType === "counter" || Boolean(item?.system?.counter);
}

function techniqueRequiresCatharticUse(item) {
  const type = normalizeKey(item?.system?.techniqueType ?? "");
  const group = normalizeKey(item?.flags?.ogregatefoundry?.group ?? "");
  return ["profound", "immortal"].includes(type) || ["profound", "evil", "immortal"].includes(group);
}

function isEvilTechnique(item) {
  return normalizeKey(item?.flags?.ogregatefoundry?.group ?? "") === "evil";
}

function techniqueCatharticImbalanceRating(actor, item) {
  return techniqueRequiresCatharticUse(item)
    ? 2
    : Number(actor.system.status.imbalanceRating ?? 0);
}

function techniqueDisciplineRequirement(actor, item) {
  const disciplineKey = item?.system?.discipline ?? "";
  if (!MARTIAL_DISCIPLINE_KEYS.has(disciplineKey)) return null;
  const ranks = Number(actor?.system?.disciplines?.[disciplineKey]?.ranks ?? 0);
  const label = OGRE_GATE.disciplines[disciplineKey] ?? disciplineKey;
  return {
    key: disciplineKey,
    label,
    ranks,
    missing: ranks <= 0
  };
}

function isFormationTechnique(item) {
  return Boolean(item?.system?.formation)
    || /Type:\s*Stance\s*\(Formation\)/i.test(item?.system?.description ?? "");
}

function techniquePrerequisites(item) {
  return String(item?.system?.prerequisiteTechniques ?? "")
    .split(/[;\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function isCombinationTechnique(item) {
  return Boolean(item?.system?.combination) || techniquePrerequisites(item).length > 0;
}

function techniqueRequirementNotes(item) {
  return String(item?.system?.requirementNotes ?? "").trim();
}

function techniqueRequiredFlaws(item) {
  return String(item?.system?.requiredFlaws ?? "")
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function techniqueRequiredSkillRanks(item) {
  return String(item?.system?.requiredSkillRanks ?? "")
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [skillRef, rankRef] = entry.split(/[:=]/).map((part) => part.trim());
      return {
        skillRef,
        ranks: Math.max(0, Math.trunc(Number(rankRef ?? 0)))
      };
    })
    .filter((entry) => entry.skillRef && entry.ranks > 0);
}

function techniqueAccessNotes(item) {
  return String(item?.system?.accessNotes ?? "").trim();
}

function techniqueCatharticEffect(item) {
  return String(item?.system?.catharticEffect ?? "").trim();
}

function techniqueUsesOpenDamage(item, cathartic = false) {
  return Boolean(item?.system?.openDamage) || (Boolean(cathartic) && Boolean(item?.system?.catharticOpenDamage));
}

function techniqueExtraWounds(item, cathartic = false) {
  return Number(item?.system?.extraWounds ?? 0) + (cathartic ? Number(item?.system?.catharticExtraWounds ?? 0) : 0);
}

function techniqueAttackModifier(item, cathartic = false) {
  return Number(item?.system?.attackModifier ?? 0) + (cathartic ? Number(item?.system?.catharticAttackModifier ?? 0) : 0);
}

function techniqueDamageModifier(item, cathartic = false) {
  return Number(item?.system?.damageModifier ?? 0) + (cathartic ? Number(item?.system?.catharticDamageModifier ?? 0) : 0);
}

function techniqueDirectWoundsExpression(item, cathartic = false, totalSuccess = false) {
  const system = item?.system ?? {};
  if (cathartic && totalSuccess && system.catharticTotalSuccessDirectWounds) return system.catharticTotalSuccessDirectWounds;
  if (cathartic && system.catharticDirectWounds) return system.catharticDirectWounds;
  if (totalSuccess && system.totalSuccessDirectWounds) return system.totalSuccessDirectWounds;
  return system.directWounds ?? "";
}

function techniqueDirectWoundsNote(item) {
  return String(item?.system?.directWoundsNote ?? "").trim();
}

function techniqueTargetDrainsExpression(item, cathartic = false, totalSuccess = false) {
  const system = item?.system ?? {};
  if (cathartic && totalSuccess && system.catharticTotalSuccessTargetDrains) return system.catharticTotalSuccessTargetDrains;
  if (cathartic && system.catharticTargetDrains) return system.catharticTargetDrains;
  if (totalSuccess && system.totalSuccessTargetDrains) return system.totalSuccessTargetDrains;
  return system.targetDrains ?? "";
}

function techniqueTargetDrainsNote(item) {
  return String(item?.system?.targetDrainsNote ?? "").trim();
}

function techniqueTargetEffectsExpression(item, cathartic = false, totalSuccess = false) {
  const system = item?.system ?? {};
  if (cathartic && totalSuccess && system.catharticTotalSuccessTargetEffects) return system.catharticTotalSuccessTargetEffects;
  if (cathartic && system.catharticTargetEffects) return system.catharticTargetEffects;
  if (totalSuccess && system.totalSuccessTargetEffects) return system.totalSuccessTargetEffects;
  return system.targetEffects ?? "";
}

function techniqueTargetEffectsNote(item) {
  return String(item?.system?.targetEffectsNote ?? "").trim();
}

function techniqueSelfWounds(item, cathartic = false) {
  const normal = Number(item?.system?.selfWounds ?? 0);
  const catharticValue = Number(item?.system?.catharticSelfWounds ?? 0);
  return Math.max(0, cathartic && catharticValue ? catharticValue : normal);
}

function techniqueConsequenceNote(item) {
  return String(item?.system?.consequenceNote ?? "").trim();
}

function techniqueCatharticImbalanceMultiplier(item) {
  return Math.max(1, Number(item?.system?.catharticImbalanceMultiplier ?? 1));
}

function resolveDirectWoundsExpression(actor, expression = "") {
  const value = String(expression ?? "").trim();
  if (!value) return { wounds: 0, label: "" };

  const flatNumber = value.match(/^(\d+)$/)?.[1];
  if (flatNumber) return { wounds: Number(flatNumber), label: value };

  const perQi = value.match(/^(\d+)\s+per\s+(?:Rank\s+of\s+Qi|Qi\s+Rank)$/i)?.[1];
  if (perQi) {
    const qi = Number(actor.system.status.effectiveQi ?? actor.system.qi.rank ?? 0);
    return { wounds: Number(perQi) * qi, label: `${value} (Qi ${qi})` };
  }

  const perDiscipline = value.match(/^(\d+)\s+per\s+Rank\s+of\s+(Waijia|Qinggong|Neigong|Dianxue)$/i);
  if (perDiscipline) {
    const disciplineKey = normalizeKey(perDiscipline[2]);
    const ranks = Number(actor.system.disciplines?.[disciplineKey]?.ranks ?? 0);
    return { wounds: Number(perDiscipline[1]) * ranks, label: `${value} (${perDiscipline[2]} ${ranks})` };
  }

  return { wounds: 0, label: value };
}

function resolveTechniqueDrainAmount(actor, expression = "") {
  const value = String(expression ?? "").trim();
  if (!value) return { amount: 0, label: "" };

  const flatNumber = value.match(/^(\d+)$/)?.[1];
  if (flatNumber) return { amount: Number(flatNumber), label: value };

  const perQi = value.match(/^(\d+)\s+per\s+(?:Rank\s+of\s+Qi|Qi\s+Rank|level\s+of\s+Qi)$/i)?.[1];
  if (perQi) {
    const qi = Number(actor.system.status.effectiveQi ?? actor.system.qi.rank ?? 0);
    return { amount: Number(perQi) * qi, label: `${value} (Qi ${qi})` };
  }

  const perDiscipline = value.match(/^(\d+)\s+per\s+Rank\s+of\s+(Waijia|Qinggong|Neigong|Dianxue)$/i);
  if (perDiscipline) {
    const disciplineKey = normalizeKey(perDiscipline[2]);
    const ranks = Number(actor.system.disciplines?.[disciplineKey]?.ranks ?? 0);
    return { amount: Number(perDiscipline[1]) * ranks, label: `${value} (${perDiscipline[2]} ${ranks})` };
  }

  return { amount: 0, label: value };
}

function techniqueDrainTargetLabel(type, key) {
  if (type === "qi") return "Qi";
  if (type === "defense") {
    const normalized = normalizeKey(key);
    const match = Object.entries(OGRE_GATE.defenses).find(([defenseKey, defense]) => (
      normalizeKey(defenseKey) === normalized || normalizeKey(defense.label) === normalized
    ));
    return match?.[1]?.label ?? key;
  }
  const qualified = parseQualifiedSkillReference(key);
  if (qualified) return `${OGRE_GATE.skillGroups[qualified.groupKey]?.label ?? qualified.groupKey}: ${OGRE_GATE.skillGroups[qualified.groupKey]?.skills?.[qualified.skillKey] ?? qualified.skillKey}`;
  return key;
}

function parseTechniqueTargetDrains(actor, expression = "") {
  return String(expression ?? "")
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [targetRef, amountRef = "1"] = entry.split("=").map((part) => part.trim());
      const targetParts = targetRef.split(/[.:]/).map((part) => part.trim()).filter(Boolean);
      let type = targetParts.shift() ?? "";
      let key = targetParts.join(".");
      if (!["qi", "defense", "skill"].includes(type)) {
        key = targetRef;
        type = "skill";
      }
      if (type === "qi") key = "qi";
      const resolved = resolveTechniqueDrainAmount(actor, amountRef);
      return {
        type,
        key,
        amount: resolved.amount,
        amountLabel: resolved.label || amountRef,
        label: techniqueDrainTargetLabel(type, key)
      };
    })
    .filter((entry) => entry.amount > 0 && entry.label);
}

function missingTechniquePrerequisites(actor, item) {
  const prerequisites = techniquePrerequisites(item);
  if (!prerequisites.length) return [];
  const owned = new Set(actor.items
    .filter((candidate) => ["technique", "combatTechnique"].includes(candidate.type))
    .flatMap((candidate) => [
      normalizeKey(candidate.name),
      normalizeKey(candidate.name.replace(/\s*\(Secret\)\s*/gi, "")),
      normalizeKey(candidate.flags?.ogregatefoundry?.rulesKey ?? "")
    ])
    .filter(Boolean));
  return prerequisites.filter((name) => {
    const normalized = normalizeKey(name);
    const withoutSecret = normalizeKey(name.replace(/\s*\(Secret\)\s*/gi, ""));
    return !owned.has(normalized) && !owned.has(withoutSecret);
  });
}

function hasFlaw(actor, flawName) {
  const normalized = normalizeKey(flawName);
  return actor.items.some((candidate) => {
    if (candidate.type !== "flaw") return false;
    return [
      candidate.name,
      candidate.system?.flawKey,
      OGRE_GATE.flaws?.[candidate.system?.flawKey]?.label
    ].some((value) => normalizeKey(value) === normalized);
  });
}

function missingTechniqueActorRequirements(actor, item) {
  const missing = [];
  for (const flaw of techniqueRequiredFlaws(item)) {
    if (!hasFlaw(actor, flaw)) missing.push(`Flaw: ${flaw}`);
  }

  for (const requirement of techniqueRequiredSkillRanks(item)) {
    const skill = actor.findSkillPath(requirement.skillRef);
    const ranks = effectiveRanks(skill?.skill);
    if (ranks < requirement.ranks) {
      const label = skill?.item?.name ?? skillLabel(skill?.groupKey, skill?.skillKey, skill?.skill) ?? requirement.skillRef;
      missing.push(`${label} ${requirement.ranks} rank${requirement.ranks === 1 ? "" : "s"}`);
    }
  }
  return missing;
}

function formationParticipants(item) {
  const listed = Number(item?.system?.formationParticipants ?? 0);
  if (listed) return listed;
  const text = `${item?.name ?? ""} ${item?.system?.description ?? ""}`;
  if (/six people|six practitioners/i.test(text)) return 6;
  if (/two practitioners|pair up|two or more participants|requires two/i.test(text)) return 2;
  return 0;
}

function formationNotes(item) {
  if (item?.system?.formationNotes) return item.system.formationNotes;
  const participants = formationParticipants(item);
  return participants
    ? `Requires at least ${participants} participant${participants === 1 ? "" : "s"}. Formation can be broken by a Total Success attack against it.`
    : "Formation can be broken by a Total Success attack against it.";
}

function getFirstTargetActor() {
  return Array.from(game.user?.targets ?? []).find((token) => token?.actor)?.actor ?? null;
}

function getRollValues(roll) {
  return roll.dice.flatMap((die) => die.results.map((result) => result.result));
}

function renderRollValues(results) {
  return results.map((result) => `<span class="ogre-gate-die${result === 10 ? " total-success" : ""}">${result}</span>`).join("");
}

export class OgreGateActor extends Actor {
  getRaceSkillModifier(groupKey, skillKey) {
    skillKey = normalizeKey(skillKey);
    const race = this.system.creation.race;
    if (race === "hechi") {
      if (groupKey === "physical" && skillKey === "endurance") return 1;
      if (groupKey === "physical" && ["athletics", "speed"].includes(skillKey)) return -2;
      if (groupKey === "combat") return -1;
    }

    if (race === "juren") {
      if (groupKey === "physical" && skillKey === "speed") return -2;
      if (groupKey === "mental") return -1;
    }

    if (race === "ouyan" && groupKey === "physical") return -1;

    if (race === "kithiri" && this.system.creation.kithiriSocialPenalty && groupKey === "mental" && ["command", "deception", "persuade"].includes(skillKey)) {
      return -1;
    }

    return 0;
  }

  getRaceDamageModifier(skillKey) {
    if (this.system.creation.race === "juren" && MELEE_SKILLS.has(skillKey)) return 1;
    return 0;
  }

  getSkill(groupKey, skillKey) {
    const normalized = normalizeKey(skillKey);
    const item = this.items.find((candidate) => {
      if (candidate.type !== "skills") return false;
      if (candidate.system.group !== groupKey) return false;
      return itemSkillKey(candidate) === normalized;
    });
    return item?.system ?? this.system.skills?.[groupKey]?.[skillKey] ?? null;
  }

  getSkillItem(groupKey, skillKey) {
    const normalized = normalizeKey(skillKey);
    return this.items.find((candidate) => {
      if (candidate.type !== "skills") return false;
      if (candidate.system.group !== groupKey) return false;
      return itemSkillKey(candidate) === normalized;
    }) ?? null;
  }

  getEquippedArmorEffects() {
    return this.items
      .filter((item) => item.type === "armor" && item.system.equipped)
      .reduce((effects, item) => {
        effects.speedPenalty += Number(item.system.speedPenalty ?? item.system.penalty ?? 0);
        effects.parryBonus += Number(item.system.parryBonus ?? 0);
        effects.evadeBonus += Number(item.system.evadeBonus ?? 0);
        return effects;
      }, {
        speedPenalty: 0,
        parryBonus: 0,
        evadeBonus: 0
      });
  }

  getArmorRollModifier(groupKey, skillKey) {
    if (groupKey === "physical" && skillKey === "speed") return -this.getEquippedArmorEffects().speedPenalty;
    return 0;
  }

  getArmorDefenseBonus(defenseKey) {
    const effects = this.getEquippedArmorEffects();
    if (defenseKey === "parry") return effects.parryBonus;
    if (defenseKey === "evade") return effects.evadeBonus;
    return 0;
  }

  getActiveSubstanceSkillModifier(groupKey, skillKey) {
    const normalized = normalizeKey(skillKey);
    return Array.from(this.system.activeSubstances ?? []).reduce((modifier, effect) => {
      const key = normalizeKey(effect.rulesKey || effect.name);
      if (key === "longzhibonepowder" && groupKey === "physical" && normalized === "muscle") return modifier + 1;
      if (key === "numinousmushroom" && ["mental", "knowledge"].includes(groupKey)) return modifier - 1;
      if (key === "viperthorn" && groupKey === "physical" && normalized === "muscle") return modifier + 2;
      if (key === "waterthorn" && groupKey === "physical" && ["athletics", "speed"].includes(normalized)) return modifier - 2;
      return modifier;
    }, 0);
  }

  getActiveSubstanceDefenseModifier(defenseKey) {
    return Array.from(this.system.activeSubstances ?? []).reduce((modifier, effect) => {
      const key = normalizeKey(effect.rulesKey || effect.name);
      if (key === "waterthorn" && defenseKey === "resolve") return modifier - 4;
      return modifier;
    }, 0);
  }

  getTrackedAfflictions() {
    return [
      this.system.affliction,
      ...Array.from(this.system.additionalAfflictions ?? [])
    ].filter((affliction) => Boolean(affliction?.name));
  }

  getAfflictionSkillModifier(groupKey) {
    return this.getTrackedAfflictions().reduce((modifier, affliction) => {
      const progression = Math.max(0, Number(affliction.progression ?? 0));
      if (!progression) return modifier;
      const affected = normalizeKey(affliction.affectedSkills);
      const applies = affected === "all"
        ? ["combat", "mental", "physical"].includes(groupKey)
        : affected.includes(normalizeKey(groupKey));
      return applies ? modifier - progression : modifier;
    }, 0);
  }

  getArmorDamageReduction(weapon) {
    const damageType = weapon?.system?.damageType ?? "special";
    const attackSkill = weapon?.system?.attackSkill ?? weapon?.system?.category ?? "";
    return this.items
      .filter((item) => item.type === "armor" && item.system.equipped)
      .reduce((total, armor) => {
        if (RANGED_SKILLS.has(attackSkill) && damageType === "sharp") total += Number(armor.system.arrowReduction ?? 0);
        if (damageType === "sharp") total += Number(armor.system.sharpReduction ?? 0);
        else if (damageType === "blunt") total += Number(armor.system.bluntReduction ?? 0);
        else if (damageType === "mighty") total += Number(armor.system.mightyReduction ?? 0);
        return total;
      }, 0);
  }

  findSkill(skillKey) {
    const normalized = normalizeKey(skillKey);
    const item = this.items.find((candidate) => candidate.type === "skills" && itemSkillKey(candidate) === normalized);
    if (item) return { groupKey: item.system.group, skillKey: item.system.skillKey || item.name, skill: item.system, item };

    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      if (skillKey in group) return { groupKey, skillKey, skill: group[skillKey] };
    }
    return null;
  }

  async rollSkillItem(item, options = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "skills") return null;

    const groupKey = item.system.group || "specialist";
    const skillKey = item.system.skillKey || item.name;
    const illumination = OGRE_GATE.illumination[this.system.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const raceModifier = this.getRaceSkillModifier(groupKey, skillKey);
    const armorModifier = this.getArmorRollModifier(groupKey, skillKey);
    const substanceModifier = this.getActiveSubstanceSkillModifier(groupKey, skillKey);
    const afflictionModifier = this.getAfflictionSkillModifier(groupKey);
    return OgreGateRoll.skill({
      actor: this,
      label: options.label ?? item.name,
      ranks: effectiveRanks(item.system),
      modifier: Number(item.system.modifier ?? 0) + raceModifier + armorModifier + substanceModifier + afflictionModifier + Number(illumination.dice ?? 0) + Number(options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: systemRule("deepPenalties"),
      returnOutcome: Boolean(options.returnOutcome),
      extra: [
        item.system.drain ? `<div class="ogre-gate-chat-row"><strong>Drain</strong><span>-${item.system.drain} rank(s)</span></div>` : "",
        raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : "",
        armorModifier ? `<div class="ogre-gate-chat-row"><strong>Armor Penalty</strong><span>${armorModifier}d10</span></div>` : "",
        substanceModifier ? `<div class="ogre-gate-chat-row"><strong>Substance Effect</strong><span>${substanceModifier > 0 ? "+" : ""}${substanceModifier}d10</span></div>` : "",
        afflictionModifier ? `<div class="ogre-gate-chat-row"><strong>Affliction Penalty</strong><span>${afflictionModifier}d10</span></div>` : "",
        options.extra ?? ""
      ].filter(Boolean).join("")
    });
  }

  async rollSkill(groupKey, skillKey, options = {}) {
    const skill = this.getSkill(groupKey, skillKey);
    if (!skill) return null;

    const label = options.label ?? skill.label ?? OGRE_GATE.skillGroups[groupKey]?.skills?.[skillKey] ?? skillKey;
    const illumination = OGRE_GATE.illumination[this.system.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const raceModifier = this.getRaceSkillModifier(groupKey, skillKey);
    const armorModifier = this.getArmorRollModifier(groupKey, skillKey);
    const substanceModifier = this.getActiveSubstanceSkillModifier(groupKey, skillKey);
    const afflictionModifier = this.getAfflictionSkillModifier(groupKey);
    return OgreGateRoll.skill({
      actor: this,
      label,
      ranks: effectiveRanks(skill),
      modifier: skill.modifier + raceModifier + armorModifier + substanceModifier + afflictionModifier + Number(illumination.dice ?? 0) + Number(options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: systemRule("deepPenalties"),
      returnOutcome: Boolean(options.returnOutcome),
      extra: [
        skill.drain ? `<div class="ogre-gate-chat-row"><strong>Drain</strong><span>-${skill.drain} rank(s)</span></div>` : "",
        raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : "",
        armorModifier ? `<div class="ogre-gate-chat-row"><strong>Armor Penalty</strong><span>${armorModifier}d10</span></div>` : "",
        substanceModifier ? `<div class="ogre-gate-chat-row"><strong>Substance Effect</strong><span>${substanceModifier > 0 ? "+" : ""}${substanceModifier}d10</span></div>` : "",
        afflictionModifier ? `<div class="ogre-gate-chat-row"><strong>Affliction Penalty</strong><span>${afflictionModifier}d10</span></div>` : "",
        options.extra ?? ""
      ].filter(Boolean).join("")
    });
  }

  async rollTechnique(item, { cathartic = false, tn = 6, modifier = 0 } = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "technique") return null;
    const techniqueKey = normalizeKey(item.flags?.ogregatefoundry?.rulesKey || item.name);
    const isStance = item.system.techniqueType === "stance";
    const isCounter = isCounterTechnique(item);
    const missingPrerequisites = missingTechniquePrerequisites(this, item);
    if (missingPrerequisites.length) {
      ui.notifications.warn(`${item.name} requires: ${missingPrerequisites.join(", ")}.`);
      return null;
    }
    const missingActorRequirements = missingTechniqueActorRequirements(this, item);
    if (missingActorRequirements.length) {
      ui.notifications.warn(`${item.name} requires: ${missingActorRequirements.join(", ")}.`);
      return null;
    }

    const disciplineRequirement = techniqueDisciplineRequirement(this, item);
    if (disciplineRequirement?.missing) {
      ui.notifications.warn(`${this.name} needs at least 1 rank in ${disciplineRequirement.label} to use ${item.name}.`);
      return null;
    }

    if (techniqueRequiresCatharticUse(item) && !cathartic) {
      ui.notifications.warn(`${item.name} is a Profound, Evil, or Immortal Technique and must be used Cathartically.`);
      return null;
    }

    const requiredQi = Number(item.system.qiRank ?? 0);
    const availableQi = Number(this.system.status.effectiveQi ?? this.system.qi.rank ?? 0);
    if (availableQi < requiredQi) {
      ui.notifications.warn(`${this.name} needs current Qi ${requiredQi} to use ${item.name}.`);
      return null;
    }

    if (isStance && !cathartic && requiresCatharticStance(item)) {
      ui.notifications.warn(`${item.name} must be used Cathartically.`);
      return null;
    }

    if (isStance && !cathartic && !normalStanceRequiresRoll(item)) {
      return this.activateStance(item, { cathartic: false });
    }

    const targetActor = getFirstTargetActor();
    if (isCounter && !cathartic && targetActor) {
      const ownQi = Number(this.system.status.effectiveQi ?? this.system.qi.rank ?? 0);
      const targetQi = Number(targetActor.system.status.effectiveQi ?? targetActor.system.qi.rank ?? 0);
      if (targetQi >= ownQi) {
        ui.notifications.warn(`${item.name} must be used Cathartically against ${targetActor.name}, whose Qi equals or exceeds ${this.name}'s Qi.`);
        return null;
      }
    }
    if (techniqueKey === "purgeaffliction") {
      if (!cathartic) {
        ui.notifications.warn("Purge Affliction must be used Cathartically.");
        return null;
      }
      if (!targetActor) {
        ui.notifications.warn("Target the actor with a mental affliction before using Purge Affliction.");
        return null;
      }
      if (!targetActor.hasMentalAffliction()) {
        ui.notifications.warn(`${targetActor.name} has no tracked mental affliction for Purge Affliction to remove.`);
        return null;
      }
    }
    if (techniqueKey === "purgespirit") {
      if (!cathartic) {
        ui.notifications.warn("Purge Spirit must be used Cathartically.");
        return null;
      }
      if (!targetActor) {
        ui.notifications.warn("Target the possessed actor before using Purge Spirit.");
        return null;
      }
      if (!targetActor.system.imbalance?.possessed) {
        ui.notifications.warn(`${targetActor.name} is not currently possessed by a Qi Spirit.`);
        return null;
      }
    }

    const skill = this.findSkillPath(item.system.activationSkill);
    if (!skill) {
      ui.notifications.warn(`${item.name} needs an Activation Skill that ${this.name} possesses.`);
      return null;
    }

    const mode = cathartic ? "Cathartic" : "Normal";
    const techniqueDamage = parseTechniqueDamagePool(item.system.damage, this);
    const techniqueDamageDice = techniqueDamage.dice;
    const hasTechniqueDamage = techniqueDamageDice > 0;
    const hasNormalDamage = Boolean(techniqueDamage.normal);
    const openTechniqueDamage = techniqueUsesOpenDamage(item, cathartic);
    const fixedExtraWounds = techniqueExtraWounds(item, cathartic);
    const attackModifier = techniqueAttackModifier(item, cathartic);
    const damageModifier = techniqueDamageModifier(item, cathartic);
    const requirementNotes = techniqueRequirementNotes(item);
    const requiredFlaws = techniqueRequiredFlaws(item);
    const requiredSkillRanks = techniqueRequiredSkillRanks(item);
    const accessNotes = techniqueAccessNotes(item);
    const catharticEffect = cathartic ? techniqueCatharticEffect(item) : "";
    const directWoundsPreview = techniqueDirectWoundsExpression(item, cathartic, false);
    const totalSuccessDirectWoundsPreview = techniqueDirectWoundsExpression(item, cathartic, true);
    const directWoundsNote = techniqueDirectWoundsNote(item);
    const hasDirectWounds = Boolean(directWoundsPreview || totalSuccessDirectWoundsPreview);
    const targetDrainsPreview = techniqueTargetDrainsExpression(item, cathartic, false);
    const totalSuccessTargetDrainsPreview = techniqueTargetDrainsExpression(item, cathartic, true);
    const targetDrainsNote = techniqueTargetDrainsNote(item);
    const hasTargetDrains = Boolean(targetDrainsPreview || totalSuccessTargetDrainsPreview);
    const targetEffectsPreview = techniqueTargetEffectsExpression(item, cathartic, false);
    const totalSuccessTargetEffectsPreview = techniqueTargetEffectsExpression(item, cathartic, true);
    const targetEffectsNote = techniqueTargetEffectsNote(item);
    const hasTargetEffects = Boolean(targetEffectsPreview || totalSuccessTargetEffectsPreview);
    const selfWounds = techniqueSelfWounds(item, cathartic);
    const consequenceNote = techniqueConsequenceNote(item);
    const catharticImbalanceMultiplier = cathartic ? techniqueCatharticImbalanceMultiplier(item) : 1;
    const activationRanks = effectiveRanks(skill.skill);
    const activationModifier = Number(skill.skill?.modifier ?? 0);
    const activationGroupLabel = OGRE_GATE.skillGroups[skill.groupKey]?.label ?? skill.groupKey;
    const activationLabel = skill.item?.name ?? skillLabel(skill.groupKey, skill.skillKey, skill.skill);
    const options = {
      label: `${item.name} (${mode})`,
      tn,
      modifier: Number(modifier ?? 0) + attackModifier,
      returnOutcome: cathartic || hasTechniqueDamage || hasNormalDamage || hasDirectWounds || hasTargetDrains || hasTargetEffects || isStance,
      extra: [
        `<div class="ogre-gate-chat-row"><strong>Activation Skill</strong><span>${escapeHtml(activationGroupLabel)}: ${escapeHtml(activationLabel)} (${activationRanks} rank${activationRanks === 1 ? "" : "s"}${activationModifier ? `, ${activationModifier > 0 ? "+" : ""}${activationModifier}d10 skill modifier` : ""})</span></div>`,
        `<div class="ogre-gate-chat-row"><strong>Technique Use</strong><span>${isStance ? "Stance" : isCounter ? "Counter Reaction" : mode}${cathartic ? "; resolve Imbalance from this result" : ""}</span></div>`,
        disciplineRequirement ? `<div class="ogre-gate-chat-row"><strong>Discipline</strong><span>${escapeHtml(disciplineRequirement.label)} ${disciplineRequirement.ranks} rank${disciplineRequirement.ranks === 1 ? "" : "s"}</span></div>` : "",
        techniqueRequiresCatharticUse(item) ? `<div class="ogre-gate-chat-row"><strong>Cathartic Required</strong><span>Profound, Evil, and Immortal Techniques are performed Cathartically and use Imbalance Rating 2.</span></div>` : "",
        isEvilTechnique(item) ? `<div class="ogre-gate-chat-row"><strong>Evil Technique</strong><span>Mastering this technique requires a Demon Flaw Table roll; any Demon Flaw gained is permanent.</span></div>` : "",
        item.system.targetDefense && item.system.targetDefense !== "tn" ? `<div class="ogre-gate-chat-row"><strong>Rolled Against</strong><span>${escapeHtml(OGRE_GATE.defenses[item.system.targetDefense]?.label ?? item.system.targetDefense)}</span></div>` : "",
        attackModifier ? `<div class="ogre-gate-chat-row"><strong>Technique Attack Modifier</strong><span>${attackModifier > 0 ? "+" : ""}${attackModifier}d10</span></div>` : "",
        isCombinationTechnique(item) ? `<div class="ogre-gate-chat-row"><strong>Prerequisites</strong><span>${techniquePrerequisites(item).map(escapeHtml).join(", ") || "Combination Technique"}</span></div>` : "",
        requiredFlaws.length ? `<div class="ogre-gate-chat-row"><strong>Required Flaws</strong><span>${requiredFlaws.map(escapeHtml).join(", ")}</span></div>` : "",
        requiredSkillRanks.length ? `<div class="ogre-gate-chat-row"><strong>Required Skill Ranks</strong><span>${requiredSkillRanks.map((entry) => `${escapeHtml(entry.skillRef)} ${entry.ranks}`).join(", ")}</span></div>` : "",
        (item.system.secret || accessNotes) ? `<div class="ogre-gate-chat-row"><strong>Access</strong><span>${item.system.secret ? "Secret Technique" : ""}${item.system.secret && accessNotes ? ": " : ""}${escapeHtml(accessNotes)}</span></div>` : "",
        requirementNotes ? `<div class="ogre-gate-chat-row"><strong>Requirements</strong><span>${escapeHtml(requirementNotes)}</span></div>` : "",
        catharticEffect ? `<div class="ogre-gate-chat-row"><strong>Cathartic Effect</strong><span>${escapeHtml(catharticEffect)}</span></div>` : "",
        isCounter ? `<div class="ogre-gate-chat-row"><strong>Counter Rule</strong><span>Off-turn free action; one counter per incoming attack. ${targetActor ? `Attacker Qi ${Number(targetActor.system.status.effectiveQi ?? targetActor.system.qi.rank ?? 0)} checked against ${this.name} Qi ${availableQi}.` : "No attacker targeted; verify Qi and trigger condition manually."}</span></div>` : "",
        isCounter && item.system.counter ? `<div class="ogre-gate-chat-row"><strong>Trigger</strong><span>${escapeHtml(item.system.counter)}</span></div>` : "",
        hasTechniqueDamage ? `<div class="ogre-gate-chat-row"><strong>Technique Damage</strong><span>${techniqueDamageDice}d10${damageModifier ? ` ${damageModifier > 0 ? "+" : ""}${damageModifier}d10` : ""}${openTechniqueDamage ? " Open" : ""}${fixedExtraWounds ? ` + ${fixedExtraWounds} Wound${fixedExtraWounds === 1 ? "" : "s"}` : ""}</span></div>` : "",
        hasNormalDamage ? `<div class="ogre-gate-chat-row"><strong>Normal Damage</strong><span>On success, roll the appropriate weapon or unarmed damage.${damageModifier ? ` ${damageModifier > 0 ? "+" : ""}${damageModifier}d10 damage modifier.` : ""}${fixedExtraWounds ? ` +${fixedExtraWounds} Extra Wound${fixedExtraWounds === 1 ? "" : "s"}.` : ""}</span></div>` : "",
        hasDirectWounds ? `<div class="ogre-gate-chat-row"><strong>Direct Wounds</strong><span>${escapeHtml(directWoundsPreview || totalSuccessDirectWoundsPreview)}${totalSuccessDirectWoundsPreview && totalSuccessDirectWoundsPreview !== directWoundsPreview ? `; Total Success ${escapeHtml(totalSuccessDirectWoundsPreview)}` : ""}</span></div>` : "",
        directWoundsNote ? `<div class="ogre-gate-chat-row"><strong>Direct Wounds Note</strong><span>${escapeHtml(directWoundsNote)}</span></div>` : "",
        hasTargetDrains ? `<div class="ogre-gate-chat-row"><strong>Target Drain</strong><span>${escapeHtml(targetDrainsPreview || totalSuccessTargetDrainsPreview)}${totalSuccessTargetDrainsPreview && totalSuccessTargetDrainsPreview !== targetDrainsPreview ? `; Total Success ${escapeHtml(totalSuccessTargetDrainsPreview)}` : ""}</span></div>` : "",
        targetDrainsNote ? `<div class="ogre-gate-chat-row"><strong>Target Drain Note</strong><span>${escapeHtml(targetDrainsNote)}</span></div>` : "",
        hasTargetEffects ? `<div class="ogre-gate-chat-row"><strong>Target Effect</strong><span>${escapeHtml(targetEffectsPreview || totalSuccessTargetEffectsPreview)}${totalSuccessTargetEffectsPreview && totalSuccessTargetEffectsPreview !== targetEffectsPreview ? `; Total Success ${escapeHtml(totalSuccessTargetEffectsPreview)}` : ""}</span></div>` : "",
        targetEffectsNote ? `<div class="ogre-gate-chat-row"><strong>Target Effect Note</strong><span>${escapeHtml(targetEffectsNote)}</span></div>` : "",
        selfWounds ? `<div class="ogre-gate-chat-row"><strong>User Cost</strong><span>${selfWounds} Wound${selfWounds === 1 ? "" : "s"} to ${escapeHtml(this.name)}</span></div>` : "",
        catharticImbalanceMultiplier > 1 ? `<div class="ogre-gate-chat-row"><strong>Imbalance Multiplier</strong><span>x${catharticImbalanceMultiplier} Cathartic Imbalance</span></div>` : "",
        consequenceNote ? `<div class="ogre-gate-chat-row"><strong>Consequence</strong><span>${escapeHtml(consequenceNote)}</span></div>` : ""
      ].filter(Boolean).join("")
    };
    const result = skill.item
      ? await this.rollSkillItem(skill.item, options)
      : await this.rollSkill(skill.groupKey, skill.skillKey, options);

    const outcome = result?.outcome;
    if (cathartic && outcome) {
      const rating = techniqueCatharticImbalanceRating(this, item);
      const baseGained = outcome.totalSuccesses
        ? 0
        : outcome.success
          ? rating
          : rating + 2;
      const mountedImbalance = this.system.combat.movingMount ? 1 : 0;
      const multipliedGained = baseGained * catharticImbalanceMultiplier;
      await this.gainImbalance(multipliedGained + mountedImbalance, {
        source: `${item.name} (Cathartic)`,
        reason: [
          outcome.totalSuccesses ? "Total Success" : outcome.success ? "Success" : "Failure",
          catharticImbalanceMultiplier > 1 ? `Technique multiplier x${catharticImbalanceMultiplier}` : "",
          mountedImbalance ? "Moving mount +1" : ""
        ].filter(Boolean).join("; ")
      });
    }

    if (hasTechniqueDamage && outcome?.success) {
      await this.rollDamage({
        label: `${item.name} Damage`,
        dice: techniqueDamageDice,
        targetActor,
        hardiness: targetActor?.system?.defenses?.hardiness?.rating ?? 6,
        open: openTechniqueDamage,
        modifier: damageModifier,
        extraWounds: fixedExtraWounds,
        note: [
          `Technique damage from ${item.name}`,
          techniqueDamage.note,
          damageModifier ? `${damageModifier > 0 ? "+" : ""}${damageModifier}d10 technique damage modifier` : "",
          fixedExtraWounds ? `${fixedExtraWounds} fixed Extra Wound${fixedExtraWounds === 1 ? "" : "s"}` : "",
          targetActor ? `Target Hardiness: ${targetActor.name}` : "No target selected; TN 6 used"
        ].filter(Boolean).join(" | ")
      });
    }

    if (hasNormalDamage && outcome?.success) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(item.name)} Normal Damage</h3>
            <div class="ogre-gate-chat-row"><strong>Next Step</strong><span>Roll the weapon or unarmed damage this technique uses.</span></div>
            ${damageModifier ? `<div class="ogre-gate-chat-row"><strong>Damage Modifier</strong><span>${damageModifier > 0 ? "+" : ""}${damageModifier}d10</span></div>` : ""}
            ${fixedExtraWounds ? `<div class="ogre-gate-chat-row"><strong>Extra Wounds</strong><span>+${fixedExtraWounds}</span></div>` : ""}
            <div class="ogre-gate-chat-row"><strong>TN Reminder</strong><span>If the technique changes the target's Hardiness or damage TN, adjust the damage TN prompt manually.</span></div>
            ${damageModifier || fixedExtraWounds ? `<button type="button" class="ogre-gate-chat-button" data-action="ogre-bank-technique-normal-damage" data-actor-uuid="${this.uuid ?? ""}" data-actor-id="${this.id ?? ""}" data-damage-modifier="${damageModifier}" data-extra-wounds="${fixedExtraWounds}" data-label="${escapeHtml(item.name)}">Load Technique Damage Modifiers</button>` : ""}
          </section>
        `
      });
    }

    if (hasDirectWounds && outcome?.success) {
      const expression = techniqueDirectWoundsExpression(item, cathartic, Boolean(outcome.totalSuccesses));
      if (expression) {
        const direct = resolveDirectWoundsExpression(this, expression);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: `
            <section class="ogre-gate-chat-card">
              <h3>${escapeHtml(item.name)} Direct Wounds</h3>
              <div class="ogre-gate-chat-row"><strong>Expression</strong><span>${escapeHtml(direct.label || expression)}</span></div>
              <div class="ogre-gate-chat-row"><strong>Wounds</strong><span>${direct.wounds || "Review note"}</span></div>
              ${targetActor ? `<div class="ogre-gate-chat-row"><strong>Target</strong><span>${escapeHtml(targetActor.name)}</span></div>` : ""}
              ${directWoundsNote ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${escapeHtml(directWoundsNote)}</span></div>` : ""}
              ${direct.wounds ? `<button type="button" class="ogre-gate-chat-button" data-action="ogre-apply-wounds" ${targetActor ? `data-actor-uuid="${targetActor.uuid ?? ""}" data-actor-id="${targetActor.id ?? ""}"` : ""} data-wounds="${direct.wounds}">Apply ${direct.wounds} Wound${direct.wounds === 1 ? "" : "s"}${targetActor ? ` to ${escapeHtml(targetActor.name)}` : ""}</button>` : ""}
            </section>
          `
        });
      }
    }

    if (hasTargetDrains && outcome?.success) {
      const expression = techniqueTargetDrainsExpression(item, cathartic, Boolean(outcome.totalSuccesses));
      const drains = parseTechniqueTargetDrains(this, expression);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(item.name)} Target Drain</h3>
            <div class="ogre-gate-chat-row"><strong>Expression</strong><span>${escapeHtml(expression)}</span></div>
            ${targetActor ? `<div class="ogre-gate-chat-row"><strong>Target</strong><span>${escapeHtml(targetActor.name)}</span></div>` : `<div class="ogre-gate-chat-row"><strong>Target</strong><span>No target selected when rolled.</span></div>`}
            ${targetDrainsNote ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${escapeHtml(targetDrainsNote)}</span></div>` : ""}
            ${drains.map((drain) => `
              <div class="ogre-gate-chat-row"><strong>${escapeHtml(drain.label)}</strong><span>-${drain.amount} (${escapeHtml(drain.amountLabel)})</span></div>
              ${targetActor ? `<button type="button" class="ogre-gate-chat-button" data-action="ogre-apply-drain" data-actor-uuid="${targetActor.uuid ?? ""}" data-actor-id="${targetActor.id ?? ""}" data-drain-type="${escapeHtml(drain.type)}" data-drain-key="${escapeHtml(drain.key)}" data-drain-amount="${drain.amount}" data-drain-label="${escapeHtml(drain.label)}">Apply ${drain.amount} ${escapeHtml(drain.label)} Drain to ${escapeHtml(targetActor.name)}</button>` : ""}
            `).join("")}
            ${!drains.length ? `<div class="ogre-gate-chat-row"><strong>Review</strong><span>Resolve this drain from the technique text.</span></div>` : ""}
          </section>
        `
      });
    }

    if (hasTargetEffects && outcome?.success) {
      const effect = techniqueTargetEffectsExpression(item, cathartic, Boolean(outcome.totalSuccesses));
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(item.name)} Target Effect</h3>
            ${targetActor ? `<div class="ogre-gate-chat-row"><strong>Target</strong><span>${escapeHtml(targetActor.name)}</span></div>` : `<div class="ogre-gate-chat-row"><strong>Target</strong><span>No target selected when rolled.</span></div>`}
            <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(effect)}</span></div>
            ${targetEffectsNote ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${escapeHtml(targetEffectsNote)}</span></div>` : ""}
          </section>
        `
      });
    }

    if (selfWounds) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(item.name)} User Cost</h3>
            <div class="ogre-gate-chat-row"><strong>Actor</strong><span>${escapeHtml(this.name)}</span></div>
            <div class="ogre-gate-chat-row"><strong>Wounds</strong><span>${selfWounds}</span></div>
            ${consequenceNote ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${escapeHtml(consequenceNote)}</span></div>` : ""}
            <button type="button" class="ogre-gate-chat-button" data-action="ogre-apply-wounds" data-actor-uuid="${this.uuid ?? ""}" data-actor-id="${this.id ?? ""}" data-wounds="${selfWounds}">Apply ${selfWounds} Wound${selfWounds === 1 ? "" : "s"} to ${escapeHtml(this.name)}</button>
          </section>
        `
      });
    } else if (consequenceNote) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(item.name)} Consequence Reminder</h3>
            <div class="ogre-gate-chat-row"><strong>Note</strong><span>${escapeHtml(consequenceNote)}</span></div>
          </section>
        `
      });
    }

    if (isStance && outcome?.success) {
      await this.activateStance(item, { cathartic });
    }

    if (techniqueKey === "purgespirit" && outcome) {
      if (outcome.success) {
        await targetActor.purgeQiSpirit({
          clearImbalance: Boolean(outcome.totalSuccesses),
          source: item.name
        });
      } else {
        await this.gainImbalance(3, {
          source: `${item.name} Failure`,
          reason: "Purge Spirit adds 3 additional Imbalance Points on failure"
        });
      }
    }

    if (techniqueKey === "purgeaffliction" && outcome) {
      if (outcome.success) {
        await targetActor.purgeMentalAfflictions(outcome.totalSuccesses ? 2 : 1, {
          source: item.name
        });
      } else {
        await this.gainImbalance(3, {
          source: `${item.name} Failure`,
          reason: "Purge Affliction adds 3 additional Imbalance Points on failure"
        });
      }
    }

    return result?.message ?? result;
  }

  async activateStance(item, { cathartic = false } = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "technique" || item.system.techniqueType !== "stance") return null;
    const formation = isFormationTechnique(item);
    const participants = formationParticipants(item);
    const formationNote = formation ? formationNotes(item) : "";
    const note = cathartic
      ? "Cathartic stance active. Roll maintenance each round; no additional Move action is required."
      : "Normal stance active. It remains until ended or replaced by another stance.";
    await this.update({
      "system.combat.activeStanceId": item.id,
      "system.combat.activeStanceName": item.name,
      "system.combat.activeStanceCathartic": Boolean(cathartic),
      "system.combat.activeStanceRounds": cathartic ? 1 : 0,
      "system.combat.activeStanceNotes": [note, formationNote].filter(Boolean).join(" ")
    });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Assumes ${escapeHtml(item.name)}</h3>
          <div class="ogre-gate-chat-row"><strong>Mode</strong><span>${cathartic ? "Cathartic" : "Normal"}</span></div>
          <div class="ogre-gate-chat-row"><strong>Action</strong><span>Move Action</span></div>
          <div class="ogre-gate-chat-row"><strong>Duration</strong><span>${cathartic ? "Maintained with a Skill roll each round." : "Until ended or replaced by another stance."}</span></div>
          ${formation ? `<div class="ogre-gate-chat-row"><strong>Formation</strong><span>${participants ? `${participants}+ participant${participants === 1 ? "" : "s"}. ` : ""}${escapeHtml(formationNote)}</span></div>` : ""}
        </section>
      `
    });
  }

  async endActiveStance() {
    const name = this.system.combat.activeStanceName;
    if (!name) return null;
    await this.update({
      "system.combat.activeStanceId": "",
      "system.combat.activeStanceName": "",
      "system.combat.activeStanceCathartic": false,
      "system.combat.activeStanceRounds": 0,
      "system.combat.activeStanceNotes": ""
    });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Ends ${escapeHtml(name)}</h3>
          <div class="ogre-gate-chat-row"><strong>Stance</strong><span>No stance active.</span></div>
        </section>
      `
    });
  }

  async maintainCatharticStance({ tn = 6 } = {}) {
    const stanceId = this.system.combat.activeStanceId;
    const item = stanceId ? this.items.get(stanceId) : null;
    if (!item || item.system.techniqueType !== "stance") {
      ui.notifications.warn(`${this.name} has no active stance to maintain.`);
      return null;
    }
    if (!this.system.combat.activeStanceCathartic) {
      ui.notifications.warn(`${item.name} is active normally and does not require maintenance rolls.`);
      return null;
    }
    const skill = this.findSkillPath(item.system.activationSkill);
    if (!skill) {
      ui.notifications.warn(`${item.name} needs an Activation Skill that ${this.name} possesses.`);
      return null;
    }

    const activationGroupLabel = OGRE_GATE.skillGroups[skill.groupKey]?.label ?? skill.groupKey;
    const activationLabel = skill.item?.name ?? skillLabel(skill.groupKey, skill.skillKey, skill.skill);
    const result = skill.item
      ? await this.rollSkillItem(skill.item, {
        label: `${item.name} Maintenance`,
        tn,
        returnOutcome: true,
        extra: `<div class="ogre-gate-chat-row"><strong>Stance</strong><span>Cathartic maintenance; no Move action required.</span></div>`
      })
      : await this.rollSkill(skill.groupKey, skill.skillKey, {
        label: `${item.name} Maintenance`,
        tn,
        returnOutcome: true,
        extra: `<div class="ogre-gate-chat-row"><strong>Activation Skill</strong><span>${escapeHtml(activationGroupLabel)}: ${escapeHtml(activationLabel)}</span></div>`
      });

    const outcome = result?.outcome;
    if (!outcome) return result?.message ?? result;
    const rating = Number(this.system.status.imbalanceRating ?? 0);
    const baseGained = outcome.totalSuccesses
      ? 0
      : outcome.success
        ? rating
        : rating + 2;
    const mountedImbalance = this.system.combat.movingMount ? 1 : 0;
    await this.gainImbalance(baseGained + mountedImbalance, {
      source: `${item.name} Maintenance`,
      reason: [
        outcome.totalSuccesses ? "Total Success" : outcome.success ? "Success" : "Failure",
        mountedImbalance ? "Moving mount +1" : ""
      ].filter(Boolean).join("; ")
    });
    if (outcome.success) {
      await this.update({ "system.combat.activeStanceRounds": Number(this.system.combat.activeStanceRounds ?? 0) + 1 });
    } else {
      await this.endActiveStance();
    }
    return result?.message ?? result;
  }

  async gainImbalance(amount, { source = "Imbalance", reason = "" } = {}) {
    const gained = Math.max(0, Math.trunc(Number(amount ?? 0)));
    const current = Number(this.system.imbalance.value ?? 0);
    const maximum = Number(this.system.imbalance.max ?? 12 + Number(this.system.qi.rank ?? 0));
    const next = Math.min(maximum, current + gained);
    if (next !== current) await this.update({ "system.imbalance.value": next });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Gains Imbalance</h3>
          <div class="ogre-gate-chat-row"><strong>Source</strong><span>${escapeHtml(source)}</span></div>
          ${reason ? `<div class="ogre-gate-chat-row"><strong>Result</strong><span>${escapeHtml(reason)}</span></div>` : ""}
          <div class="ogre-gate-chat-row"><strong>Points</strong><span>+${gained}; ${next} / ${maximum}</span></div>
        </section>
      `
    });

    if (next >= maximum) await this.checkQiSpiritPossession(source);
    return { gained, value: next, maximum };
  }

  async checkQiSpiritPossession(source = "Imbalance Threshold") {
    const current = Number(this.system.imbalance.value ?? 0);
    const maximum = Number(this.system.imbalance.max ?? 12 + Number(this.system.qi.rank ?? 0));
    if (current < maximum) {
      ui.notifications.warn(`${this.name} has not reached the Imbalance limit for Qi Spirit Possession.`);
      return null;
    }
    if (this.system.imbalance.possessed) {
      ui.notifications.info(`${this.name} is already possessed by ${this.system.imbalance.spirit || "a Qi Spirit"}.`);
      return null;
    }

    const roll = await new Roll("1d10").evaluate();
    const result = Number(roll.total ?? 1);
    const spirit = OGRE_GATE.qiSpirits[result] ?? "Unique Spirit";
    await this.update({
      "system.imbalance.possessed": true,
      "system.imbalance.spirit": spirit,
      "system.imbalance.possessionControl": "unchecked",
      "system.imbalance.possessionControlDays": 0
    });
    ui.notifications.warn(`${this.name} is possessed by a ${spirit}.`);
    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} Qi Spirit Possession`,
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Is Possessed</h3>
          <div class="ogre-gate-chat-row"><strong>Cause</strong><span>${escapeHtml(source)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Imbalance</strong><span>${current} / ${maximum}</span></div>
          <div class="ogre-gate-chat-row"><strong>Qi Spirit Roll</strong><span>${result}: ${escapeHtml(spirit)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Recovery</strong><span>Points cannot be recovered until the spirit is purged.</span></div>
        </section>
      `
    });
  }

  async rollDemonFlaw(source = "Evil Technique Mastery") {
    const roll = await new Roll("1d100").evaluate();
    const result = Number(roll.total ?? 1);
    const entry = OGRE_GATE.demonFlawTable.find((row) => result >= row.min && result <= row.max);
    const flaw = entry?.label ?? "GM Choice";
    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} Demon Flaw`,
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Rolls a Demon Flaw</h3>
          <div class="ogre-gate-chat-row"><strong>Source</strong><span>${escapeHtml(source)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Roll</strong><span>${result}</span></div>
          <div class="ogre-gate-chat-row"><strong>Result</strong><span>${escapeHtml(flaw)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Mastery</strong><span>Demon Flaws from mastering Evil Techniques are permanent. Re-roll repeated or conflicting results only at GM discretion.</span></div>
        </section>
      `
    });
  }

  async meditateImbalance(hours = 1) {
    const elapsed = Math.max(1, Math.trunc(Number(hours ?? 1)));
    if (this.system.imbalance.possessed) {
      ui.notifications.warn(`${this.name} cannot recover Imbalance until ${this.system.imbalance.spirit || "the Qi Spirit"} is purged.`);
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>${escapeHtml(this.name)} Meditates</h3>
            <div class="ogre-gate-chat-row"><strong>Duration</strong><span>${elapsed} hour${elapsed === 1 ? "" : "s"}</span></div>
            <div class="ogre-gate-chat-row"><strong>Recovery</strong><span>No Imbalance recovered while possessed.</span></div>
          </section>
        `
      });
    }

    const meditation = this.findSkillPath("meditation")?.skill;
    const meditationRanks = effectiveRanks(meditation);
    const recovery = meditationRanks > 0
      ? Number(this.system.qi.rank ?? 0) * elapsed
      : Math.floor(elapsed / 2);
    const current = Number(this.system.imbalance.value ?? 0);
    const removed = Math.min(current, recovery);
    const next = current - removed;
    if (removed) await this.update({ "system.imbalance.value": next });
    const rate = meditationRanks > 0
      ? `${this.system.qi.rank} per hour (Qi level)`
      : "1 per two hours (zero Meditation ranks)";
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Meditates</h3>
          <div class="ogre-gate-chat-row"><strong>Duration</strong><span>${elapsed} hour${elapsed === 1 ? "" : "s"}</span></div>
          <div class="ogre-gate-chat-row"><strong>Rate</strong><span>${escapeHtml(rate)}; no Skill roll required</span></div>
          <div class="ogre-gate-chat-row"><strong>Recovery</strong><span>-${removed} Imbalance; ${next} remaining</span></div>
        </section>
      `
    });
  }

  async rollPossessionControl() {
    if (!this.system.imbalance.possessed) {
      ui.notifications.warn(`${this.name} is not possessed by a Qi Spirit.`);
      return null;
    }
    const tn = 7 + Number(this.system.status.imbalanceRating ?? 0);
    const result = await this.rollSkill("specialist", "meditation", {
      label: "Meditation: Control Qi Spirit Possession",
      tn,
      returnOutcome: true,
      extra: `<div class="ogre-gate-chat-row"><strong>Possession TN</strong><span>7 + Imbalance Rating = ${tn}</span></div>`
    });
    if (!result?.outcome) {
      ui.notifications.warn(`${this.name} needs Meditation available to make the possession control roll.`);
      return null;
    }

    const inControl = result.outcome.success;
    const days = inControl && result.outcome.totalSuccesses ? 2 : 1;
    await this.update({
      "system.imbalance.possessionControl": inControl ? "self" : "spirit",
      "system.imbalance.possessionControlDays": days
    });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Possession Control</h3>
          <div class="ogre-gate-chat-row"><strong>Spirit</strong><span>${escapeHtml(this.system.imbalance.spirit || "Qi Spirit")}</span></div>
          <div class="ogre-gate-chat-row"><strong>Control</strong><span>${inControl ? `${escapeHtml(this.name)} remains in control` : "The spirit is in control"} for ${days} day${days === 1 ? "" : "s"}.</span></div>
        </section>
      `
    });
    return result.message;
  }

  async purgeQiSpirit({ clearImbalance = false, source = "purging Kung Fu Technique" } = {}) {
    if (!this.system.imbalance.possessed) return null;
    const spirit = this.system.imbalance.spirit || "Qi Spirit";
    const updates = {
      "system.imbalance.possessed": false,
      "system.imbalance.spirit": "",
      "system.imbalance.possessionControl": "unchecked",
      "system.imbalance.possessionControlDays": 0
    };
    if (clearImbalance) updates["system.imbalance.value"] = 0;
    await this.update(updates);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Is Purged</h3>
          <div class="ogre-gate-chat-row"><strong>Spirit</strong><span>${escapeHtml(spirit)} removed by ${escapeHtml(source)}.</span></div>
          <div class="ogre-gate-chat-row"><strong>Imbalance</strong><span>${clearImbalance ? "All Imbalance Points removed by Total Success." : "Existing points remain until removed by meditation or another effect."}</span></div>
        </section>
      `
    });
  }

  hasMentalAffliction() {
    return this.getTrackedAfflictions().some(isMentalAffliction);
  }

  async purgeMentalAfflictions(limit = 1, { source = "Purge Affliction" } = {}) {
    const maximum = Math.max(1, Math.trunc(Number(limit ?? 1)));
    const current = snapshotAffliction(this.system.affliction);
    const additional = Array.from(this.system.additionalAfflictions ?? []).map(snapshotAffliction);
    const purged = [];

    const updates = {};
    if (isMentalAffliction(current) && purged.length < maximum) {
      purged.push(current.name);
      updates["system.affliction"] = purgeAfflictionSnapshot(current);
    }

    const nextAdditional = additional.map((affliction) => {
      if (purged.length >= maximum || !isMentalAffliction(affliction)) return affliction;
      purged.push(affliction.name);
      return purgeAfflictionSnapshot(affliction);
    });

    if (!purged.length) {
      ui.notifications.warn(`${this.name} has no tracked mental affliction to purge.`);
      return null;
    }

    updates["system.additionalAfflictions"] = nextAdditional;
    await this.update(updates);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Mental Affliction Purged</h3>
          <div class="ogre-gate-chat-row"><strong>Technique</strong><span>${escapeHtml(source)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Purged</strong><span>${purged.map(escapeHtml).join(", ")}</span></div>
          <div class="ogre-gate-chat-row"><strong>Limit</strong><span>${maximum === 1 ? "Success purges one Mental Affliction." : "Total Success purges up to two Mental Afflictions."}</span></div>
        </section>
      `
    });
  }

  async resolveQiDuel(opponent = getFirstTargetActor()) {
    if (!opponent || opponent === this) {
      ui.notifications.warn("Target one opposing actor before resolving a Qi Duel.");
      return null;
    }

    const ownQi = Number(this.system.status.effectiveQi ?? this.system.qi.rank ?? 0);
    const opponentQi = Number(opponent.system.status.effectiveQi ?? opponent.system.qi.rank ?? 0);
    const disparity = Math.abs(ownQi - opponentQi);
    if (disparity > 1) {
      ui.notifications.warn("A Qi Duel cannot begin when opponents differ by more than one Qi Rank.");
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>Qi Duel Cannot Begin</h3>
            <div class="ogre-gate-chat-row"><strong>${escapeHtml(this.name)}</strong><span>Qi ${ownQi}</span></div>
            <div class="ogre-gate-chat-row"><strong>${escapeHtml(opponent.name)}</strong><span>Qi ${opponentQi}</span></div>
            <div class="ogre-gate-chat-row"><strong>Rule</strong><span>Qi disparity cannot exceed 1 Rank for a Qi Duel.</span></div>
          </section>
        `
      });
    }

    const ownNeigong = Number(this.system.disciplines.neigong.ranks ?? 0);
    const opponentNeigong = Number(opponent.system.disciplines.neigong.ranks ?? 0);
    const ownPenalty = (ownQi === opponentQi - 1 ? -2 : 0) + (ownNeigong < opponentNeigong ? -1 : 0);
    const opponentPenalty = (opponentQi === ownQi - 1 ? -2 : 0) + (opponentNeigong < ownNeigong ? -1 : 0);
    const ownPool = OgreGateRoll.resolvePool(ownQi, ownPenalty, { deepPenalties: systemRule("deepPenalties") });
    const opponentPool = OgreGateRoll.resolvePool(opponentQi, opponentPenalty, { deepPenalties: systemRule("deepPenalties") });
    const ownRoll = await new Roll(ownPool.formula).evaluate();
    const opponentRoll = await new Roll(opponentPool.formula).evaluate();
    const ownResults = getRollValues(ownRoll);
    const opponentResults = getRollValues(opponentRoll);
    const ownResult = ownPool.keep === "lowest" ? Math.min(...ownResults) : Math.max(...ownResults);
    const opponentResult = opponentPool.keep === "lowest" ? Math.min(...opponentResults) : Math.max(...opponentResults);
    const existingTies = Number(this.system.qiDuel.ties ?? 0);

    if (ownResult === opponentResult) {
      const ties = existingTies + 1;
      await this.update({ "system.qiDuel.ties": ties });
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <section class="ogre-gate-chat-card">
            <h3>Qi Duel: Energy Builds</h3>
            <div class="ogre-gate-chat-row"><strong>${escapeHtml(this.name)}</strong><span>${ownPool.label} / Neigong ${ownNeigong}${ownPenalty ? ` / ${ownPenalty}d10` : ""}</span></div>
            <div class="ogre-gate-chat-dice">${renderRollValues(ownResults)}</div>
            <div class="ogre-gate-chat-row"><strong>${escapeHtml(opponent.name)}</strong><span>${opponentPool.label} / Neigong ${opponentNeigong}${opponentPenalty ? ` / ${opponentPenalty}d10` : ""}</span></div>
            <div class="ogre-gate-chat-dice">${renderRollValues(opponentResults)}</div>
            <div class="ogre-gate-chat-row"><strong>Tie</strong><span>Both kept ${ownResult}; continue the duel.</span></div>
            <div class="ogre-gate-chat-row"><strong>Stored Energy</strong><span>+${ties * 2} Extra Wounds on the eventual result.</span></div>
          </section>
        `
      });
    }

    const victor = ownResult > opponentResult ? this : opponent;
    const loser = victor === this ? opponent : this;
    const victorResult = Math.max(ownResult, opponentResult);
    const isTotalSuccess = victorResult === 10;
    const outcomeWounds = isTotalSuccess ? 2 : ownQi + opponentQi;
    const tieWounds = existingTies * 2;
    const totalWounds = outcomeWounds + tieWounds;
    await this.update({ "system.qiDuel.ties": 0 });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>Qi Duel: ${escapeHtml(victor.name)} Victorious</h3>
          <div class="ogre-gate-chat-row"><strong>${escapeHtml(this.name)}</strong><span>${ownPool.label} / Neigong ${ownNeigong}${ownPenalty ? ` / ${ownPenalty}d10` : ""}</span></div>
          <div class="ogre-gate-chat-dice">${renderRollValues(ownResults)}</div>
          <div class="ogre-gate-chat-row"><strong>${escapeHtml(opponent.name)}</strong><span>${opponentPool.label} / Neigong ${opponentNeigong}${opponentPenalty ? ` / ${opponentPenalty}d10` : ""}</span></div>
          <div class="ogre-gate-chat-dice">${renderRollValues(opponentResults)}</div>
          <div class="ogre-gate-chat-row"><strong>Outcome</strong><span>${isTotalSuccess ? "Total Success: 2 Extra Wounds" : `Normal Success: ${ownQi + opponentQi} Extra Wounds (combined Qi)`}</span></div>
          ${tieWounds ? `<div class="ogre-gate-chat-row"><strong>Tie Buildup</strong><span>+${tieWounds} Extra Wounds</span></div>` : ""}
          <div class="ogre-gate-chat-row"><strong>Loser</strong><span>${escapeHtml(loser.name)} suffers ${totalWounds} Wound${totalWounds === 1 ? "" : "s"}.</span></div>
          <button type="button" class="ogre-gate-chat-button" data-action="ogre-apply-wounds" data-actor-uuid="${loser.uuid ?? ""}" data-actor-id="${loser.id ?? ""}" data-wounds="${totalWounds}">Apply ${totalWounds} Wound${totalWounds === 1 ? "" : "s"} to ${escapeHtml(loser.name)}</button>
        </section>
      `
    });
  }

  async clearQiDuelBuildup() {
    if (!Number(this.system.qiDuel.ties ?? 0)) {
      ui.notifications.info(`${this.name} has no stored Qi Duel tie buildup.`);
      return null;
    }
    await this.update({ "system.qiDuel.ties": 0 });
    ui.notifications.info(`${this.name}'s Qi Duel tie buildup has been cleared.`);
    return null;
  }

  async rollDefense(defenseKey, options = {}) {
    const defense = this.system.defenses?.[defenseKey];
    if (!defense) return null;

    return OgreGateRoll.skill({
      actor: this,
      label: defense.label,
      ranks: Math.max(0, Number(defense.ranks ?? 0) - Number(defense.drain ?? 0)),
      modifier: defense.modifier + this.getArmorDefenseBonus(defenseKey) + (options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: systemRule("deepPenalties"),
      returnOutcome: Boolean(options.returnOutcome)
    });
  }

  async rollAttackWithWeapon(item, options = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "weapon") {
      ui.notifications.warn("That weapon could not be found on this actor.");
      return null;
    }

    const skillKey = item.system.attackSkill || item.system.category || "mediumMelee";
    const skillMatch = this.findSkillPath(`combat.${skillKey}`) ?? this.findSkillPath(skillKey);
    const skill = skillMatch?.skill;
    if (!skill) {
      const skillLabel = OGRE_GATE.skillGroups.combat.skills[skillKey] ?? item.system.attackSkill ?? item.system.category ?? "Combat Skill";
      ui.notifications.warn(`${this.name} needs the ${skillLabel} Skill item before attacking with ${item.name}.`);
      return null;
    }

    const defenseKey = item.system.targetDefense || OGRE_GATE.combatSkillDefense[skillKey] || "parry";
    const defenseLabel = OGRE_GATE.defenses[defenseKey]?.label ?? defenseKey;
    const action = OGRE_GATE.combatActions[this.system.combat.action] ?? OGRE_GATE.combatActions.skillAndMove;
    const attackModeKey = this.system.combat.attackMode;
    const attackMode = OGRE_GATE.attackModes[attackModeKey] ?? OGRE_GATE.attackModes.normal;
    const preparedStrikeReady = attackModeKey === "prepared" && Boolean(this.system.preparedStrike.ready);
    const preparedStrikeWarning = attackModeKey === "prepared" && !preparedStrikeReady;
    if (preparedStrikeWarning) {
      ui.notifications.warn(`${this.name} is using Prepared Strike attack mode, but no prepared strike is armed.`);
    }
    const illumination = OGRE_GATE.illumination[this.system.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const raceModifier = this.getRaceSkillModifier("combat", skillKey);
    const afflictionModifier = this.getAfflictionSkillModifier("combat");
    const actionModifier = Number(action.skill ?? 0);
    const muscle = this.getSkill("physical", "muscle");
    const muscleRequirementPenalty = Number(muscle?.ranks ?? 0) < Number(item.system.muscleRequirement ?? 0) ? -1 : 0;
    const totalModifier = skill.modifier
      + actionModifier
      + Number(item.system.accuracyModifier ?? 0)
      + Number(attackMode.attack ?? 0)
      + raceModifier
      + afflictionModifier
      + muscleRequirementPenalty
      + Number(illumination.dice ?? 0)
      + Number(this.system.combat.situationalDice ?? 0)
      + Number(options.modifier ?? 0);

    const message = await OgreGateRoll.attack({
      actor: this,
      label: `${item.name} Attack`,
      ranks: effectiveRanks(skill),
      modifier: totalModifier,
      defense: defenseLabel,
      mode: [
        attackMode.label,
        Number(item.system.accuracyModifier ?? 0) ? `Accuracy ${Number(item.system.accuracyModifier) > 0 ? "+" : ""}${item.system.accuracyModifier}d10` : "",
        raceModifier ? `Race ${raceModifier > 0 ? "+" : ""}${raceModifier}d10` : "",
        afflictionModifier ? `Affliction ${afflictionModifier}d10` : "",
        `Reach: ${OGRE_GATE.reachCategories[item.system.reach] ?? item.system.reach}`,
        muscleRequirementPenalty ? `Muscle requirement ${item.system.muscleRequirement} unmet: -1d10` : "",
        preparedStrikeReady ? `Prepared Strike triggered: ${this.system.preparedStrike.trigger || "declared trigger"} in ${this.system.preparedStrike.zone || "the designated zone"}` : "",
        preparedStrikeReady ? "Prepared Strike spent after this attack" : "",
        preparedStrikeWarning ? "Prepared Strike attack mode selected without an armed strike" : "",
        attackMode.workflow ?? ""
      ].filter(Boolean).join(" | "),
      tn: options.tn ?? 6,
      deadlyTens: systemRule("deadlyTens"),
      deepPenalties: systemRule("deepPenalties"),
      rollMode: options.rollMode
    });
    if (preparedStrikeReady) await this.clearPreparedStrike();
    return message;
  }

  async rollWeaponDamage(item, options = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "weapon") {
      ui.notifications.warn("That weapon could not be found on this actor.");
      return null;
    }

    const damageSkillKey = item.system.damageSkill;
    let skillRanks = 0;
    let missingDamageSkill = "";
    if (damageSkillKey) {
      const skillMatch = this.findSkillPath(`physical.${damageSkillKey}`) ?? this.findSkillPath(damageSkillKey);
      skillRanks = effectiveRanks(skillMatch?.skill);
      if (!skillMatch) missingDamageSkill = OGRE_GATE.skillGroups.physical.skills[damageSkillKey] ?? damageSkillKey;
    }
    const substanceDamageModifier = this.getActiveSubstanceSkillModifier("physical", damageSkillKey);
    const afflictionDamageModifier = this.getAfflictionSkillModifier("physical");

    const attackMode = OGRE_GATE.attackModes[this.system.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    const controlledStrike = Boolean(this.system.combat.controlledStrike);
    const modeExtraWounds = Number(attackMode.extraWounds ?? 0);
    const controlledReduction = controlledStrike ? -1 : 0;
    const raceDamageModifier = this.getRaceDamageModifier(item.system.attackSkill || item.system.category);
    const pendingDamageBonus = Math.max(0, Math.trunc(Number(options.damageBonus ?? this.system.combat.pendingDamageBonus ?? 0)));
    const pendingDamageModifier = Math.trunc(Number(options.modifier ?? this.system.combat.pendingDamageModifier ?? 0));
    const pendingExtraWounds = Math.max(0, Math.trunc(Number(options.extraWounds ?? this.system.combat.pendingExtraWounds ?? 0)));
    const targetActor = getFirstTargetActor();
    const armorReduction = targetActor?.getArmorDamageReduction?.(item) ?? 0;

    const message = await this.rollDamage({
      label: `${item.name} Damage`,
      dice: Number(item.system.damageDice ?? 0) + skillRanks,
      targetActor,
      hardiness: options.hardiness ?? 6,
      open: item.system.openDamage || options.open || attackMode.openDamage,
      modifier: pendingDamageModifier + Number(attackMode.damage ?? 0) + raceDamageModifier + substanceDamageModifier + afflictionDamageModifier + pendingDamageBonus - armorReduction,
      extraWounds: pendingExtraWounds + modeExtraWounds + controlledReduction,
      note: [
        attackMode.label,
        missingDamageSkill ? `${missingDamageSkill} Skill missing: using weapon dice only` : "",
        pendingDamageBonus ? `Attack bonus +${pendingDamageBonus}d10` : "",
        pendingDamageModifier ? `Pending damage modifier ${pendingDamageModifier > 0 ? "+" : ""}${pendingDamageModifier}d10` : "",
        pendingExtraWounds ? `Pending ${pendingExtraWounds} Extra Wound${pendingExtraWounds === 1 ? "" : "s"}` : "",
        armorReduction ? `${targetActor.name} armor -${armorReduction}d10` : "",
        raceDamageModifier ? `Race +${raceDamageModifier}d10 damage` : "",
        substanceDamageModifier ? `Substance ${substanceDamageModifier > 0 ? "+" : ""}${substanceDamageModifier}d10 damage` : "",
        afflictionDamageModifier ? `Affliction ${afflictionDamageModifier}d10 damage` : "",
        attackMode.nonLethal ? "Non-lethal" : "",
        controlledStrike ? "Controlled Strike" : "",
        attackMode.damageDefense ? `Use target ${OGRE_GATE.defenses[attackMode.damageDefense]?.label ?? attackMode.damageDefense} as damage TN` : ""
      ].filter(Boolean).join(" | "),
      outcomeHint: attackMode.outcome ?? ""
    });

    if ((pendingDamageBonus || pendingDamageModifier || pendingExtraWounds) && options.consumeDamageBonus !== false) {
      await this.update({
        "system.combat.pendingDamageBonus": 0,
        "system.combat.pendingDamageModifier": 0,
        "system.combat.pendingExtraWounds": 0
      });
    }

    return message;
  }

  async rollTurnOrder(options = {}) {
    const speed = this.getSkill("physical", "speed") ?? this.system.skills.physical.speed;
    const raceModifier = this.getRaceSkillModifier("physical", "speed");
    const armorModifier = this.getArmorRollModifier("physical", "speed");
    const substanceModifier = this.getActiveSubstanceSkillModifier("physical", "speed");
    const afflictionModifier = this.getAfflictionSkillModifier("physical");
    return OgreGateRoll.skill({
      actor: this,
      label: "Turn Order",
      ranks: effectiveRanks(speed),
      modifier: speed.modifier + raceModifier + armorModifier + substanceModifier + afflictionModifier + Number(options.modifier ?? 0),
      tn: 1,
      rollMode: options.rollMode,
      deepPenalties: systemRule("deepPenalties"),
      extra: [
        raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : "",
        armorModifier ? `<div class="ogre-gate-chat-row"><strong>Armor Penalty</strong><span>${armorModifier}d10</span></div>` : "",
        substanceModifier ? `<div class="ogre-gate-chat-row"><strong>Substance Effect</strong><span>${substanceModifier}d10</span></div>` : "",
        afflictionModifier ? `<div class="ogre-gate-chat-row"><strong>Affliction Penalty</strong><span>${afflictionModifier}d10</span></div>` : ""
      ].filter(Boolean).join("")
    });
  }

  async rollDamage({ dice, hardiness, targetActor = null, open = false, label = "Damage", modifier = 0, extraWounds = 0, note = "", outcomeHint = "" } = {}) {
    return OgreGateRoll.damage({
      actor: this,
      targetActor,
      label,
      dice,
      hardiness,
      open,
      modifier,
      extraWounds,
      note,
      outcomeHint,
      deepPenalties: systemRule("deepPenalties")
    });
  }

  async rollFallingDamage(distance = 10, options = {}) {
    const feet = Math.max(0, Math.trunc(Number(distance ?? 0)));
    const dice = Math.clamp(Math.ceil(feet / 10), 1, 6);
    const extraWounds = Math.max(0, Math.ceil((feet - 60) / 10));
    return this.rollDamage({
      label: `Falling Damage (${feet} ft)`,
      dice,
      hardiness: options.hardiness ?? this.system.defenses.hardiness.rating,
      open: true,
      extraWounds,
      note: "Open damage; +1 wound per 10 ft beyond 60 ft."
    });
  }

  async rollFireDamage(size = "torch", options = {}) {
    const fire = OGRE_GATE.fireDamage[size] ?? OGRE_GATE.fireDamage.torch;
    return this.rollDamage({
      label: `${fire.label} Damage`,
      dice: fire.dice,
      hardiness: options.hardiness ?? this.system.defenses.hardiness.rating,
      open: false,
      note: "Fire damage is rolled when exposure or burning calls for it."
    });
  }

  async rollSuffocation(roundsElapsed = 0, options = {}) {
    const endurance = this.getSkill("physical", "endurance") ?? this.system.skills.physical.endurance;
    const rounds = Math.max(0, Math.trunc(Number(roundsElapsed ?? 0)));
    const tn = Math.clamp(1 + (rounds * 4), 1, 10);
    return OgreGateRoll.skill({
      actor: this,
      label: `Suffocation/Drowning Round ${rounds + 1}`,
      ranks: effectiveRanks(endurance),
      modifier: endurance.modifier + Number(options.modifier ?? 0),
      tn,
      rollMode: options.rollMode,
      deepPenalties: systemRule("deepPenalties"),
      extra: `<div class="ogre-gate-chat-row"><strong>Failure</strong><span>1 Wound</span></div>`
    });
  }

  async rollObjectDamage({ dice = 1, objectTn = 5, open = false } = {}) {
    const tn = Math.clamp(Number(objectTn ?? 5), 1, 10);
    const object = OGRE_GATE.objectTns[tn];
    return this.rollDamage({
      label: `Object Damage (${object?.composition ?? `TN ${tn}`})`,
      dice: Number(dice ?? 1),
      hardiness: object?.hardiness ?? tn,
      open,
      note: `Object integrity ${object?.integrity ?? tn}; Evade ${object?.evade ?? tn}.`
    });
  }

  async stabilizeDying(method = "medicine") {
    const skillKey = method === "meditation" ? "meditation" : "medicine";
    const label = skillKey === "medicine" ? "Medicine: Treat Wounds" : "Meditation: Stabilize Dying";
    const result = await this.rollSkill("specialist", skillKey, {
      label,
      tn: 7,
      returnOutcome: true
    });
    const outcome = result?.outcome;
    if (!outcome?.success) return result?.message ?? result;

    if (skillKey === "medicine" && outcome.totalSuccesses) {
      await this.healWounds(1);
      ui.notifications.info(`${this.name} is stabilized and heals 1 Health from a Medicine total success.`);
    } else {
      await this.update({
        "system.combat.stabilized": true,
        "system.combat.dyingRoundsElapsed": 0
      });
      ui.notifications.info(`${this.name} is stabilized.`);
    }
    return result?.message ?? result;
  }

  async applyNaturalHealing() {
    const amount = this.system.qi.rank > 0 ? this.system.qi.rank : 1;
    await this.healWounds(amount);
    ui.notifications.info(`${this.name} heals ${amount} Health from natural healing.`);
  }

  async armPreparedStrike() {
    const zone = escapeHtml(this.system.preparedStrike.zone || "the designated zone");
    const trigger = escapeHtml(this.system.preparedStrike.trigger || "a target enters");
    await this.update({ "system.preparedStrike.ready": true });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${this.name} Prepared Strike</h3>
          <div class="ogre-gate-chat-row"><strong>Zone</strong><span>${zone}</span></div>
          <div class="ogre-gate-chat-row"><strong>Trigger</strong><span>${trigger}</span></div>
          <div class="ogre-gate-chat-row"><strong>Reminder</strong><span>Forgo the normal attack; interrupt with one attack when the trigger occurs.</span></div>
        </section>
      `
    });
  }

  async clearPreparedStrike() {
    return this.update({ "system.preparedStrike.ready": false });
  }

  async postChargeValidation() {
    const mode = this.system.combat.attackMode;
    const distance = Number(this.system.combat.chargeDistance ?? 0);
    const required = mode === "mountedCharge" ? 25 : mode === "charge" ? 20 : 0;
    const label = OGRE_GATE.attackModes[mode]?.label ?? "Current attack mode";
    const straightLine = Boolean(this.system.combat.chargeStraightLine);
    const continues = Boolean(this.system.combat.mountedChargeContinues);
    const mountedBow = Boolean(this.system.combat.mountedBowShot);
    const movingMount = Boolean(this.system.combat.movingMount);
    const targetUnmounted = Boolean(this.system.combat.targetUnmounted);
    const needsStraightLine = mode === "charge" || mode === "mountedCharge";
    const problems = [];
    if (required && distance < required) problems.push(`needs at least ${required} ft`);
    if (needsStraightLine && !straightLine) problems.push("must be straight-line movement");
    if (mode === "mountedCharge" && !continues) problems.push("must continue in that direction after the attack");
    const status = problems.length ? "Review" : required ? "Ready" : "Reminder";
    const outcomeClass = problems.length ? "failure" : "success";
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${this.name} ${label}</h3>
          <div class="ogre-gate-chat-row"><strong>Declared Distance</strong><span>${distance} ft</span></div>
          <div class="ogre-gate-chat-row"><strong>Required</strong><span>${required || "None"}${required ? " ft" : ""}</span></div>
          ${needsStraightLine ? `<div class="ogre-gate-chat-row"><strong>Straight Line</strong><span>${straightLine ? "Confirmed" : "Not confirmed"}</span></div>` : ""}
          ${mode === "mountedCharge" ? `<div class="ogre-gate-chat-row"><strong>Continue Past Target</strong><span>${continues ? "Confirmed" : "Not confirmed"}</span></div>` : ""}
          ${mode === "mounted" || mode === "mountedCharge" ? `<div class="ogre-gate-chat-row"><strong>Opponent Mounted?</strong><span>${targetUnmounted ? "Opponent unmounted: mounted attack bonus applies and opponent takes -1d10." : "Opponent mounted: review whether mounted advantage applies."}</span></div>` : ""}
          ${mountedBow ? `<div class="ogre-gate-chat-row"><strong>Mounted Bow</strong><span>Apply -1d10 unless Bow Rider or another rule overrides it.</span></div>` : ""}
          ${movingMount ? `<div class="ogre-gate-chat-row"><strong>Cathartic Technique</strong><span>Moving mount adds 1 extra Imbalance Point.</span></div>` : ""}
          ${problems.length ? `<ul class="ogre-gate-chat-checklist">${problems.map((problem) => `<li>${escapeHtml(problem)}</li>`).join("")}</ul>` : ""}
          <div class="ogre-gate-chat-outcome ${outcomeClass}">${status}</div>
        </section>
      `
    });
  }

  async rollAfflictionExposure() {
    const affliction = this.system.affliction;
    const name = affliction.name || "";
    if (!name || !affliction.potency) {
      ui.notifications.warn("Load a Poison or Disease with Potency before rolling exposure.");
      return null;
    }
    const hardiness = Number(this.system.defenses.hardiness.rating ?? 0);
    const result = await OgreGateRoll.potency({
      actor: this,
      label: `${name} Exposure`,
      potency: affliction.potency,
      hardiness,
      extra: `<div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(affliction.effect)}; ${escapeHtml(affliction.affectedSkills || "Special")}</span></div>`
    });
    if (!result?.outcome?.success) {
      await this.update({
        "system.affliction.contracted": false,
        "system.affliction.status": "resisted",
        "system.affliction.progression": 0,
        "system.affliction.lethalityLimit": 0,
        "system.affliction.lethalityElapsed": 0,
        "system.affliction.qiDrainApplied": 0
      });
      ui.notifications.info(`${this.name} resists ${name}.`);
      return result.message;
    }

    const updates = {
      "system.affliction.contracted": true,
      "system.affliction.status": "active",
      "system.affliction.progression": 0,
      "system.affliction.lethalityElapsed": 0,
      "system.affliction.qiDrainApplied": 0
    };
    let deadline = "Not lethal";
    if (affliction.lethality !== "none") {
      const lethalityRoll = await new Roll("1d10").evaluate();
      updates["system.affliction.lethalityLimit"] = Number(lethalityRoll.total ?? 0);
      deadline = `${lethalityRoll.total} ${OGRE_GATE.afflictionIntervals[affliction.lethality] ?? affliction.lethality}`;
    } else {
      updates["system.affliction.lethalityLimit"] = 0;
    }

    const key = normalizeKey(affliction.rulesKey || name);
    const active = Array.from(this.system.activeSubstances ?? []).filter((effect) => normalizeKey(effect.rulesKey || effect.name) !== key);
    let special = "";
    if (key === "viperthorn") {
      await this.applyWounds(1);
      updates["system.activeSubstances"] = [...active, {
        rulesKey: affliction.rulesKey,
        name,
        effect: "Wracking pain and rage; +2d10 to Muscle rolls.",
        duration: "3 hours"
      }];
      special = "Suffer 1 Wound and gain +2d10 Muscle for 3 hours.";
    } else if (key === "waterthorn") {
      await this.healWounds(1);
      updates["system.activeSubstances"] = [...active, {
        rulesKey: affliction.rulesKey,
        name,
        effect: "Profound euphoria; -4 Resolve and -2d10 to Speed and Athletics.",
        duration: "10 hours"
      }];
      special = "Heal 1 Wound; suffer -4 Resolve and -2d10 Speed and Athletics for 10 hours.";
    } else if (key === "xikangsspleenfreezingwine") {
      const paralysisRoll = await new Roll("1d10").evaluate();
      updates["system.activeSubstances"] = [...active, {
        rulesKey: affliction.rulesKey,
        name,
        effect: "Full paralysis.",
        duration: `${paralysisRoll.total} minute${paralysisRoll.total === 1 ? "" : "s"}`
      }];
      special = `Full paralysis for ${paralysisRoll.total} minute${paralysisRoll.total === 1 ? "" : "s"}.`;
    }
    await this.update(updates);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Contracts ${escapeHtml(name)}</h3>
          <div class="ogre-gate-chat-row"><strong>Lethality Deadline</strong><span>${escapeHtml(deadline)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Speed</strong><span>Advance effects each ${escapeHtml(OGRE_GATE.afflictionIntervals[affliction.speed] ?? affliction.speed)}</span></div>
          ${special ? `<div class="ogre-gate-chat-row"><strong>Special</strong><span>${escapeHtml(special)}</span></div>` : ""}
        </section>
      `
    });
    ui.notifications.info(`${this.name} contracts ${name}.`);
    return result.message;
  }

  async advanceAfflictionProgression() {
    const affliction = this.system.affliction;
    const name = affliction.name || "Active affliction";
    if (!affliction.contracted || !["active", "resumed"].includes(affliction.status)) {
      ui.notifications.warn(`${name} is not currently progressing.`);
      return null;
    }
    const key = normalizeKey(affliction.rulesKey || name);
    let effect = "";
    const updates = {};
    if (key === "purplespiritvenom") {
      const currentDrain = Number(this.system.qi.temporary ?? 0);
      const maximumDrain = Math.max(0, Number(this.system.qi.rank ?? 1) - 1);
      const nextDrain = Math.min(maximumDrain, currentDrain + 1);
      updates["system.qi.temporary"] = nextDrain;
      updates["system.affliction.qiDrainApplied"] = Number(affliction.qiDrainApplied ?? 0) + (nextDrain > currentDrain ? 1 : 0);
      effect = nextDrain > currentDrain
        ? "Qi is reduced by 1. It cannot be restored until the venom is purged."
        : "Qi is already at 1; Purple Spirit Venom causes no further reduction.";
    } else if (["viperthorn", "waterthorn", "xikangsspleenfreezingwine"].includes(key)) {
      ui.notifications.warn(`${name}'s special timed effect is tracked under Active Substances; expire it there when its duration ends.`);
      return null;
    } else {
      const progression = Number(affliction.progression ?? 0) + 1;
      updates["system.affliction.progression"] = progression;
      effect = key === "spinytoadvenom"
        ? `A seizure applies a cumulative -${progression}d10 penalty to Mental and Physical Skills.`
        : `Cumulative -${progression}d10 penalty applies to ${affliction.affectedSkills || "the listed Skills"}.`;
    }
    await this.update(updates);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(name)} Effect Advances</h3>
          <div class="ogre-gate-chat-row"><strong>Speed Interval</strong><span>${escapeHtml(OGRE_GATE.afflictionIntervals[affliction.speed] ?? affliction.speed)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(effect)}</span></div>
        </section>
      `
    });
  }

  async advanceAfflictionLethality() {
    const affliction = this.system.affliction;
    const name = affliction.name || "Active affliction";
    if (!affliction.contracted || !["active", "resumed"].includes(affliction.status)) {
      ui.notifications.warn(`${name} is not currently advancing toward lethality.`);
      return null;
    }
    if (affliction.lethality === "none") {
      ui.notifications.warn(`${name} has no lethality clock.`);
      return null;
    }
    const limit = Number(affliction.lethalityLimit ?? 0);
    if (!limit) {
      ui.notifications.warn(`Roll ${name} exposure first to establish its 1d10 lethality deadline.`);
      return null;
    }
    const elapsed = Math.min(limit, Number(affliction.lethalityElapsed ?? 0) + 1);
    const fatal = elapsed >= limit;
    const updates = {
      "system.affliction.lethalityElapsed": elapsed,
      "system.affliction.status": fatal ? "fatal" : affliction.status
    };
    if (fatal) {
      updates["system.resources.wounds.value"] = 0;
      updates["system.combat.stabilized"] = false;
    }
    await this.update(updates);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(name)} Lethality Advances</h3>
          <div class="ogre-gate-chat-row"><strong>Clock</strong><span>${elapsed} / ${limit} ${escapeHtml(OGRE_GATE.afflictionIntervals[affliction.lethality] ?? affliction.lethality)}</span></div>
          <div class="ogre-gate-chat-outcome ${fatal ? "failure" : "success"}">${fatal ? "Deadline Reached: Character Dies" : "Treatment Time Remains"}</div>
        </section>
      `
    });
  }

  async rollAfflictionTreatment() {
    const affliction = this.system.affliction;
    const name = affliction.name || (OGRE_GATE.afflictionTypes[affliction.type] ?? "Affliction");
    if (!Number(affliction.medicineTn ?? 0)) {
      ui.notifications.warn(`${name} does not list standard Medicine treatment.`);
      return null;
    }
    if (affliction.antidoteRequired && !affliction.antidoteApplied) {
      const remedy = affliction.remedy || "an antidote or specific remedy";
      ui.notifications.warn(`${name} requires ${remedy} before Medicine can treat it.`);
      return null;
    }
    const result = await this.rollSkill("specialist", "medicine", {
      label: `Medicine: ${name}`,
      tn: affliction.medicineTn,
      modifier: Number(affliction.medicineDiceBonus ?? 0),
      returnOutcome: true,
      extra: [
        `<div class="ogre-gate-chat-row"><strong>Type</strong><span>${OGRE_GATE.afflictionTypes[affliction.type] ?? affliction.type}</span></div>`,
        `<div class="ogre-gate-chat-row"><strong>Lethality</strong><span>${OGRE_GATE.afflictionIntervals[affliction.lethality] ?? affliction.lethality}</span></div>`,
        `<div class="ogre-gate-chat-row"><strong>Speed</strong><span>${OGRE_GATE.afflictionIntervals[affliction.speed] ?? affliction.speed}</span></div>`,
        `<div class="ogre-gate-chat-row"><strong>Cadence</strong><span>One recovery roll per ${OGRE_GATE.afflictionIntervals[affliction.interval] ?? affliction.interval}</span></div>`,
        affliction.potency ? `<div class="ogre-gate-chat-row"><strong>Potency</strong><span>${affliction.potency} against Hardiness</span></div>` : "",
        affliction.affectedSkills ? `<div class="ogre-gate-chat-row"><strong>Affected Skills</strong><span>${affliction.affectedSkills}</span></div>` : "",
        affliction.antidoteRequired ? `<div class="ogre-gate-chat-row"><strong>Remedy</strong><span>${affliction.antidoteApplied ? "Applied" : "Required"}</span></div>` : "",
        affliction.medicineDiceBonus ? `<div class="ogre-gate-chat-row"><strong>Substance Bonus</strong><span>+${affliction.medicineDiceBonus}d10 Medicine</span></div>` : "",
        affliction.treatmentMode === "staveOnly" ? `<div class="ogre-gate-chat-row"><strong>Treatment Limit</strong><span>Medicine can stave off effects, not cure this affliction.</span></div>` : "",
        affliction.notes ? `<div class="ogre-gate-chat-row"><strong>Special</strong><span>${affliction.notes}</span></div>` : ""
      ].filter(Boolean).join("")
    });
    const outcome = result?.outcome;
    if (!outcome) {
      ui.notifications.warn("Add a Medicine Skill item to the actor before attempting treatment.");
      return null;
    }
    const status = affliction.treatmentMode === "staveOnly"
      ? (outcome?.success ? "staved off" : "resumed")
      : (outcome?.totalSuccesses ? "cured" : outcome?.success ? "stabilized" : "resumed");
    const updates = { "system.affliction.status": status };
    if (status === "cured") {
      updates["system.affliction.contracted"] = false;
      updates["system.affliction.lethalityLimit"] = 0;
      updates["system.affliction.lethalityElapsed"] = 0;
      if (normalizeKey(affliction.effect) !== "permanent") updates["system.affliction.progression"] = 0;
    }
    if (affliction.treatmentMode === "staveOnly" && !outcome?.success) {
      await this.applyWounds(1);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `<section class="ogre-gate-chat-card"><h3>${escapeHtml(name)} Treatment Failure</h3><div class="ogre-gate-chat-outcome failure">Malignant Wind Disease inflicts 1 Wound.</div></section>`
      });
    }
    await this.update(updates);
    ui.notifications.info(`${name} treatment status: ${status}.`);
    return result?.message ?? result;
  }

  async loadAfflictionItem(item) {
    if (item?.type !== "affliction") return null;
    const key = normalizeKey(item.system.rulesKey || item.name);
    const additional = Array.from(this.system.additionalAfflictions ?? []).map(snapshotAffliction);
    const matchingIndex = additional.findIndex((affliction) => normalizeKey(affliction.rulesKey || affliction.name) === key);
    if (matchingIndex >= 0) return this.selectAdditionalAffliction(matchingIndex);

    const current = snapshotAffliction(this.system.affliction);
    const updates = { "system.affliction": newAfflictionFromItem(item) };
    if (current.name && normalizeKey(current.rulesKey || current.name) !== key) {
      updates["system.additionalAfflictions"] = [...additional, current];
    }
    return this.update(updates);
  }

  async selectAdditionalAffliction(index) {
    const additional = Array.from(this.system.additionalAfflictions ?? []).map(snapshotAffliction);
    const selected = additional[index];
    if (!selected) return null;
    const remaining = additional.filter((_affliction, entryIndex) => entryIndex !== index);
    const current = snapshotAffliction(this.system.affliction);
    if (current.name) remaining.push(current);
    return this.update({
      "system.affliction": selected,
      "system.additionalAfflictions": remaining
    });
  }

  async removeAdditionalAffliction(index) {
    const additional = Array.from(this.system.additionalAfflictions ?? []).map(snapshotAffliction);
    if (!additional[index]) return null;
    return this.update({
      "system.additionalAfflictions": additional.filter((_affliction, entryIndex) => entryIndex !== index)
    });
  }

  async removeSelectedAffliction() {
    const additional = Array.from(this.system.additionalAfflictions ?? []).map(snapshotAffliction);
    if (additional.length) {
      return this.update({
        "system.affliction": additional[0],
        "system.additionalAfflictions": additional.slice(1)
      });
    }
    return this.update({ "system.affliction": snapshotAffliction() });
  }

  async applySubstanceItem(item) {
    if (item?.type !== "substance") return null;

    const affliction = this.system.affliction;
    const name = affliction.name || "";
    if (!name) {
      ui.notifications.warn("Load a Poison or Disease before applying a substance to its treatment tracker.");
      return null;
    }

    const data = item.system;
    const activeKey = normalizeKey(affliction.rulesKey || name);
    const itemKey = normalizeKey(data.rulesKey || item.name);
    const applied = Array.from(affliction.appliedSubstances ?? []);
    if (applied.some((application) => normalizeKey(application.rulesKey || application.name) === itemKey)) {
      ui.notifications.warn(`${item.name} is already recorded for the active ${name} treatment.`);
      return null;
    }

    const updates = {};
    let effect = "";
    const duration = data.duration || "";

    if (itemKey === "lotusoil" && activeKey === "firepoison") {
      updates["system.affliction.antidoteApplied"] = true;
      updates["system.affliction.status"] = "ready for treatment";
      effect = "Lotus Oil applied; Fire Poison can now be treated with Medicine.";
    } else if (itemKey === "purplespiritvenomantidote" && activeKey === "purplespiritvenom") {
      updates["system.affliction.antidoteApplied"] = true;
      updates["system.affliction.status"] = "purged";
      updates["system.affliction.contracted"] = false;
      updates["system.affliction.lethalityLimit"] = 0;
      updates["system.affliction.lethalityElapsed"] = 0;
      updates["system.qi.temporary"] = Math.max(0, Number(this.system.qi.temporary ?? 0) - Number(affliction.qiDrainApplied ?? 0));
      updates["system.affliction.qiDrainApplied"] = 0;
      effect = "Purple Spirit Venom is purged; blocked Qi may now be restored.";
    } else if (itemKey === "xikangsantidote" && activeKey === "xikangsspleenfreezingwine") {
      updates["system.affliction.antidoteApplied"] = true;
      updates["system.affliction.status"] = "nullified";
      updates["system.affliction.contracted"] = false;
      updates["system.affliction.lethalityLimit"] = 0;
      updates["system.affliction.lethalityElapsed"] = 0;
      updates["system.activeSubstances"] = Array.from(this.system.activeSubstances ?? []).filter((active) => normalizeKey(active.rulesKey || active.name) !== activeKey);
      effect = "The effects of Xi Kang's Spleen Freezing Wine are nullified.";
    } else if (itemKey === "yellowphoenixpills" && ["hellebore", "mandrake"].includes(activeKey)) {
      updates["system.affliction.antidoteApplied"] = true;
      updates["system.affliction.status"] = "ready for treatment";
      effect = `Yellow Phoenix Pills applied as the antidote for ${name}; Medicine treatment is now available.`;
    } else if (itemKey === "yellowphoenixpills" && activeKey === "bloodfire") {
      updates["system.affliction.medicineDiceBonus"] = Number(affliction.medicineDiceBonus ?? 0) + 1;
      effect = "Yellow Phoenix Pills grant +1d10 to Medicine rolls against Blood Fire.";
    } else if (itemKey === "bluephoenixpills" && (affliction.type === "poison" || HEAT_RELATED_DISEASES.has(activeKey))) {
      const baseSpeed = applied.length ? affliction.baseSpeed : affliction.speed;
      updates["system.affliction.baseSpeed"] = baseSpeed;
      updates["system.affliction.speed"] = SLOWER_AFFLICTION_INTERVAL[baseSpeed] ?? affliction.speed;
      effect = `Blue Phoenix Pills lower the Speed of ${name} by one increment.`;
    } else if (itemKey === "masterliscure" && affliction.type === "disease") {
      const baseMedicineTn = applied.length ? Number(affliction.baseMedicineTn) : Number(affliction.medicineTn);
      updates["system.affliction.baseMedicineTn"] = baseMedicineTn;
      updates["system.affliction.medicineTn"] = Math.max(0, baseMedicineTn - 2);
      effect = `Master Li's Cure reduces the Medicine TN for ${name} by 2.`;
    } else if (itemKey === "purplesapphiremushroom" && affliction.type === "poison") {
      updates["system.affliction.status"] = "staved off";
      effect = `Purple Sapphire Mushroom staves off the effects of ${name} for one day.`;
    } else if (data.substanceType === "antidote" && normalizeKey(data.targetAffliction) === activeKey) {
      updates["system.affliction.antidoteApplied"] = true;
      updates["system.affliction.status"] = "ready for treatment";
      effect = `${item.name} applied; Medicine treatment is now available for ${name}.`;
    }

    if (!effect) {
      ui.notifications.warn(`${item.name} has no active treatment effect for ${name}.`);
      return null;
    }

    const doseText = await this.consumeSubstanceDose(item);
    if (!doseText) return null;
    updates["system.affliction.appliedSubstances"] = [
      ...applied.map((application) => ({
        rulesKey: application.rulesKey,
        name: application.name,
        effect: application.effect,
        duration: application.duration
      })),
      {
        rulesKey: data.rulesKey || item.name,
        name: item.name,
        effect,
        duration
      }
    ];
    await this.update(updates);
    ui.notifications.info(`${item.name} applied to ${name}.`);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Substance Applied</h3>
          <div class="ogre-gate-chat-row"><strong>Substance</strong><span>${escapeHtml(item.name)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Affliction</strong><span>${escapeHtml(name)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(effect)}</span></div>
          ${duration ? `<div class="ogre-gate-chat-row"><strong>Duration</strong><span>${escapeHtml(duration)}</span></div>` : ""}
          <div class="ogre-gate-chat-row"><strong>Dose</strong><span>${escapeHtml(doseText)}</span></div>
        </section>
      `
    });
  }

  async consumeSubstanceDose(item) {
    if (item.parent !== this) return "Not tracked; administer from Gear to spend a stored dose.";
    const availableDoses = Number(item.system.quantity ?? 1);
    if (availableDoses < 1) {
      ui.notifications.warn(`${item.name} has no doses remaining.`);
      return null;
    }
    const remaining = availableDoses - 1;
    await item.update({ "system.quantity": remaining });
    return `1 dose consumed; ${remaining} remaining.`;
  }

  async useSubstanceItem(item) {
    if (item?.type !== "substance") return null;
    const data = item.system;
    const key = normalizeKey(data.rulesKey || item.name);
    const afflictionKeys = new Set([
      "bluephoenixpills", "lotusoil", "masterliscure", "purplesapphiremushroom",
      "purplespiritvenomantidote", "snakedemonantidote", "xikangsantidote", "yellowphoenixpills"
    ]);
    if (afflictionKeys.has(key) || data.substanceType === "antidote") return this.applySubstanceItem(item);

    const active = Array.from(this.system.activeSubstances ?? []);
    const previousApplication = active.find((application) => normalizeKey(application.rulesKey || application.name) === key);
    let effect = data.effects || "Apply the item description as directed by the GM.";
    let duration = data.duration || "";
    const updates = {};
    let trackEffect = Boolean(data.duration);
    if (key === "bitterorangeremedy") {
      const reduced = Math.min(5, Number(this.system.imbalance.value ?? 0));
      updates["system.imbalance.value"] = Math.max(0, Number(this.system.imbalance.value ?? 0) - 5);
      effect = `Restores Qi balance by eliminating ${reduced} Imbalance Point${reduced === 1 ? "" : "s"}.`;
      duration = "";
      trackEffect = false;
    } else if (key === "numinousmushroom") {
      const currentHealth = Number(this.system.resources.wounds.value ?? 0);
      const maximumHealth = Number(this.system.resources.wounds.max ?? currentHealth);
      const restored = Math.min(3, Math.max(0, maximumHealth - currentHealth));
      updates["system.resources.wounds.value"] = currentHealth + restored;
      effect = `Restores ${restored} Health and imposes -1d10 to all Mental and Knowledge Skill rolls for one day.`;
      trackEffect = true;
    } else if (key === "longzhibonepowder") {
      const durationRoll = await new Roll("1d10").evaluate();
      duration = `${durationRoll.total} day${durationRoll.total === 1 ? "" : "s"}`;
      effect = `Gain +1d10 to Muscle rolls for ${duration}.`;
      trackEffect = true;
    } else if (key === "lifeprolongingpill") {
      const imbalanceRoll = await new Roll("1d10").evaluate();
      const gainedImbalance = Number(imbalanceRoll.total ?? 0);
      const imbalanceMax = Number(this.system.imbalance.max ?? gainedImbalance);
      const regimen = this.system.longevity.lifeProlongingPill;
      updates["system.imbalance.value"] = Math.min(imbalanceMax, Number(this.system.imbalance.value ?? 0) + gainedImbalance);
      updates["system.resources.wounds.value"] = Math.max(Number(this.system.resources.wounds.min ?? 0), Number(this.system.resources.wounds.value ?? 0) - 1);
      updates["system.combat.stabilized"] = false;
      duration = "1 hour";
      if (regimen.completed) {
        const additionalUses = Number(regimen.additionalUses ?? 0) + 1;
        const yearsLost = Number(regimen.yearsLost ?? 0) + 1;
        const netYears = Number(regimen.yearsAdded ?? 0) - yearsLost;
        updates["system.longevity.lifeProlongingPill.additionalUses"] = additionalUses;
        updates["system.longevity.lifeProlongingPill.yearsLost"] = yearsLost;
        updates["system.longevity.lifeProlongingPill.netYears"] = netYears;
        effect = `Suffer 1 Wound and ${gainedImbalance} Imbalance Points; restless and aggressive for one hour. Further use after the completed course reduces life expectancy by 1 year. Net lifespan adjustment: ${netYears >= 0 ? "+" : ""}${netYears} years.`;
      } else {
        const consecutiveDays = Math.min(10, Number(regimen.consecutiveDays ?? 0) + 1);
        updates["system.longevity.lifeProlongingPill.consecutiveDays"] = consecutiveDays;
        if (consecutiveDays === 10) {
          const lifespanRoll = await new Roll("1d10").evaluate();
          const yearsAdded = Number(lifespanRoll.total ?? 0);
          updates["system.longevity.lifeProlongingPill.completed"] = true;
          updates["system.longevity.lifeProlongingPill.yearsAdded"] = yearsAdded;
          updates["system.longevity.lifeProlongingPill.netYears"] = yearsAdded;
          effect = `Suffer 1 Wound and ${gainedImbalance} Imbalance Points; restless and aggressive for one hour. Completing ten consecutive days prolongs life by ${yearsAdded} year${yearsAdded === 1 ? "" : "s"}.`;
        } else {
          effect = `Suffer 1 Wound and ${gainedImbalance} Imbalance Points; restless and aggressive for one hour. Consecutive regimen: day ${consecutiveDays} of 10.`;
        }
      }
      trackEffect = true;
    } else if (key === "celestialspiritpills") {
      effect = "No Resolve Tests from Missing Phoenix Spirit triggers for one day; other effects continue.";
    } else if (key === "redrufishmeat") {
      effect = "Protected from insect bites and attacks for 24 hours; lice and scabies are cured.";
    } else if (key === "humanformingessence") {
      const previousHours = Number(previousApplication?.duration?.match(/\d+/)?.[0] ?? 23);
      const hours = previousApplication ? previousHours + 1 : 24;
      duration = `${hours} hours`;
      effect = `Can take human form and shift between human and beast form for ${duration}.`;
    } else if (key === "masterrenseyeopeningconcoction") {
      duration = "Until the preparation's effect ends (GM adjudication)";
      effect = "Can see spirits, concealed creature nature, possession, and enchantments.";
      trackEffect = true;
    }

    const doseText = await this.consumeSubstanceDose(item);
    if (!doseText) return null;
    if (trackEffect) {
      const retainedEffects = key === "lifeprolongingpill"
        ? active
        : active.filter((application) => normalizeKey(application.rulesKey || application.name) !== key);
      updates["system.activeSubstances"] = [
        ...retainedEffects.map((application) => ({
          rulesKey: application.rulesKey,
          name: application.name,
          effect: application.effect,
          duration: application.duration
        })),
        { rulesKey: data.rulesKey || item.name, name: item.name, effect, duration }
      ];
    }
    if (Object.keys(updates).length) await this.update(updates);
    if (key === "lifeprolongingpill"
      && !this.system.imbalance.possessed
      && Number(this.system.imbalance.value ?? 0) >= Number(this.system.imbalance.max ?? 0)) {
      await this.checkQiSpiritPossession(item.name);
    }
    ui.notifications.info(`${item.name} used by ${this.name}.`);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Uses ${escapeHtml(item.name)}</h3>
          <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(effect)}</span></div>
          ${duration ? `<div class="ogre-gate-chat-row"><strong>Duration</strong><span>${escapeHtml(duration)}</span></div>` : ""}
          <div class="ogre-gate-chat-row"><strong>Dose</strong><span>${escapeHtml(doseText)}</span></div>
        </section>
      `
    });
  }

  async expireActiveSubstance(index) {
    const active = Array.from(this.system.activeSubstances ?? []);
    const application = active[index];
    if (!application) return null;
    await this.update({ "system.activeSubstances": active.filter((_entry, effectIndex) => effectIndex !== index) });
    ui.notifications.info(`${application.name} has expired for ${this.name}.`);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Substance Effect Expired</h3>
          <div class="ogre-gate-chat-row"><strong>Substance</strong><span>${escapeHtml(application.name)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(application.effect)} no longer applies.</span></div>
        </section>
      `
    });
  }

  async resetLifeProlongingPillStreak() {
    const regimen = this.system.longevity.lifeProlongingPill;
    if (regimen.completed) {
      ui.notifications.warn("The completed Life Prolonging Pill course and its lifespan result remain recorded.");
      return null;
    }
    if (!Number(regimen.consecutiveDays ?? 0)) {
      ui.notifications.info(`${this.name} has no active Life Prolonging Pill streak.`);
      return null;
    }
    await this.update({ "system.longevity.lifeProlongingPill.consecutiveDays": 0 });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Breaks the Life Prolonging Pill Course</h3>
          <div class="ogre-gate-chat-row"><strong>Regimen</strong><span>The consecutive-day count returns to 0 / 10.</span></div>
        </section>
      `
    });
  }

  async expireAfflictionSubstance(index) {
    const affliction = this.system.affliction;
    const applied = Array.from(affliction.appliedSubstances ?? []);
    const application = applied[index];
    if (!application) return null;

    const retained = applied.filter((_entry, applicationIndex) => applicationIndex !== index);
    const key = normalizeKey(application.rulesKey || application.name);
    const updates = { "system.affliction.appliedSubstances": retained };
    if (key === "bluephoenixpills") updates["system.affliction.speed"] = affliction.baseSpeed || affliction.speed;
    if (key === "masterliscure") updates["system.affliction.medicineTn"] = Number(affliction.baseMedicineTn ?? affliction.medicineTn);
    if (key === "purplesapphiremushroom" && affliction.status === "staved off") updates["system.affliction.status"] = "resumed";
    await this.update(updates);
    ui.notifications.info(`${application.name} has expired for ${affliction.name || "the active affliction"}.`);
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${escapeHtml(this.name)} Substance Expired</h3>
          <div class="ogre-gate-chat-row"><strong>Substance</strong><span>${escapeHtml(application.name)}</span></div>
          <div class="ogre-gate-chat-row"><strong>Affliction</strong><span>${escapeHtml(affliction.name || "Active affliction")}</span></div>
          <div class="ogre-gate-chat-row"><strong>Effect</strong><span>${escapeHtml(application.effect)} no longer applies.</span></div>
        </section>
      `
    });
  }

  async clearAfflictionSubstances() {
    const affliction = this.system.affliction;
    const status = ["ready for treatment", "staved off"].includes(affliction.status)
      ? "untreated"
      : affliction.status;
    await this.update({
      "system.affliction.speed": affliction.baseSpeed || affliction.speed,
      "system.affliction.medicineTn": Number(affliction.baseMedicineTn ?? affliction.medicineTn),
      "system.affliction.medicineDiceBonus": 0,
      "system.affliction.antidoteApplied": false,
      "system.affliction.status": status,
      "system.affliction.appliedSubstances": []
    });
    ui.notifications.info(`${affliction.name || "Active affliction"} substance applications cleared.`);
  }

  findSkillPath(search) {
    const qualified = parseQualifiedSkillReference(search);
    if (qualified) {
      const item = this.getSkillItem(qualified.groupKey, qualified.skillKey);
      if (item) return { groupKey: qualified.groupKey, skillKey: qualified.skillKey, skill: item.system, item };

      const skill = this.system.skills?.[qualified.groupKey]?.[qualified.skillKey];
      if (skill) return { groupKey: qualified.groupKey, skillKey: qualified.skillKey, skill };
    }

    const searchKeys = skillSearchKeys(search);
    if (!searchKeys.length) return null;
    const exactMatches = (candidate) => searchKeys.some((key) => candidate === key);
    const item = this.items.find((candidate) => candidate.type === "skills" && (
      exactMatches(itemSkillKey(candidate)) || exactMatches(normalizeKey(candidate.name))
    ));
    if (item) return { groupKey: item.system.group, skillKey: item.system.skillKey || item.name, skill: item.system, item };

    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (exactMatches(normalizeKey(skillKey)) || exactMatches(normalizeKey(skill.label))) {
          return { groupKey, skillKey, skill };
        }
      }
    }

    const matches = (candidate) => searchKeys.some((key) => candidate.length > 2 && key.includes(candidate));
    const fuzzyItem = this.items.find((candidate) => candidate.type === "skills" && (
      matches(itemSkillKey(candidate)) || matches(normalizeKey(candidate.name))
    ));
    if (fuzzyItem) return { groupKey: fuzzyItem.system.group, skillKey: fuzzyItem.system.skillKey || fuzzyItem.name, skill: fuzzyItem.system, item: fuzzyItem };

    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (matches(normalizeKey(skillKey)) || matches(normalizeKey(skill.label))) {
          return { groupKey, skillKey, skill };
        }
      }
    }
    return null;
  }

  async applyDrain({ type = "skill", key = "", amount = 1 } = {}) {
    amount = Math.max(0, Math.trunc(Number(amount ?? 0)));
    if (!amount) return {};

    const updates = {};
    const applied = {};
    if (type === "qi") {
      updates["system.qi.temporary"] = Math.min(this.system.qi.rank, Number(this.system.qi.temporary ?? 0) + amount);
    } else if (type === "defense") {
      const normalized = normalizeKey(key);
      const defenseKey = Object.keys(this.system.defenses ?? {}).find((candidate) => {
        const label = OGRE_GATE.defenses[candidate]?.label ?? candidate;
        return normalizeKey(candidate) === normalized || normalizeKey(label) === normalized;
      });
      if (defenseKey) updates[`system.defenses.${defenseKey}.drain`] = Number(this.system.defenses[defenseKey].drain ?? 0) + amount;
    } else if (type === "skill") {
      const match = this.findSkillPath(key);
      if (match?.item) {
        await match.item.update({ "system.drain": Number(match.skill.drain ?? 0) + amount });
        applied[`items.${match.item.id}.drain`] = amount;
      }
      else if (match) updates[`system.skills.${match.groupKey}.${match.skillKey}.drain`] = Number(match.skill.drain ?? 0) + amount;
    }

    if (Object.keys(updates).length) await this.update(updates);
    return { ...updates, ...applied };
  }

  async recoverDrains(amount = 1) {
    amount = Math.max(0, Math.trunc(Number(amount ?? 0)));
    if (!amount) return {};

    const updates = {};
    const applied = {};
    const qiBlocked = this.getTrackedAfflictions().some((affliction) => normalizeKey(affliction.rulesKey || affliction.name) === "purplespiritvenom"
      && affliction.contracted
      && affliction.status !== "purged");
    if (this.system.qi.temporary && !qiBlocked) updates["system.qi.temporary"] = Math.max(0, this.system.qi.temporary - amount);
    if (this.system.qi.temporary && qiBlocked) ui.notifications.warn("Purple Spirit Venom prevents Qi recovery until the venom is purged.");
    for (const [key, defense] of Object.entries(this.system.defenses ?? {})) {
      if (defense.drain) updates[`system.defenses.${key}.drain`] = Math.max(0, defense.drain - amount);
    }
    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (skill.drain) updates[`system.skills.${groupKey}.${skillKey}.drain`] = Math.max(0, skill.drain - amount);
      }
    }
    for (const item of this.items.filter((candidate) => candidate.type === "skills" && candidate.system.drain)) {
      await item.update({ "system.drain": Math.max(0, Number(item.system.drain ?? 0) - amount) });
      applied[`items.${item.id}.drain`] = amount;
    }
    if (Object.keys(updates).length) await this.update(updates);
    return { ...updates, ...applied };
  }

  async applyWounds(amount = 1) {
    amount = Math.max(0, Math.trunc(amount));
    const wounds = this.system.resources.wounds;
    return this.update({
      "system.resources.wounds.value": Math.max(wounds.min, wounds.value - amount),
      "system.combat.stabilized": false
    });
  }

  async healWounds(amount = 1) {
    amount = Math.max(0, Math.trunc(amount));
    const wounds = this.system.resources.wounds;
    const next = Math.min(wounds.max, wounds.value + amount);
    const updates = { "system.resources.wounds.value": next };
    if (next > 0) {
      updates["system.combat.dyingRoundsElapsed"] = 0;
      updates["system.combat.stabilized"] = false;
    }
    return this.update(updates);
  }

  async applyCreationDefaults() {
    const updates = {};
    const applied = {};
    const race = this.system.creation.race;
    if (this.system.qi.rank < OGRE_GATE.creation.startingQi) updates["system.qi.rank"] = OGRE_GATE.creation.startingQi;
    if (this.system.money.spades < OGRE_GATE.creation.startingSpadeCoins) updates["system.money.spades"] = OGRE_GATE.creation.startingSpadeCoins;

    const ensureSkillMinimum = async (groupKey, skillKey, label, ranks = 1) => {
      const item = this.getSkillItem(groupKey, skillKey);
      if (item) {
        if (Number(item.system.ranks ?? 0) < ranks) {
          await item.update({ "system.ranks": ranks });
          applied[`skills.${skillKey}`] = ranks;
        }
        return;
      }
      await this.createEmbeddedDocuments("Item", [{
        name: label,
        type: "skills",
        system: {
          group: groupKey,
          skillKey,
          ranks
        }
      }]);
      applied[`skills.${skillKey}`] = ranks;
    };

    if (race === "kithiri") {
      await ensureSkillMinimum("mental", "empathy", "Empathy", 1);
      await ensureSkillMinimum("mental", "reasoning", "Reasoning", 1);
      if (this.system.defenses.wits.ranks < 1) updates["system.defenses.wits.ranks"] = 1;
    }

    if (race === "juren") await ensureSkillMinimum("physical", "muscle", "Muscle", 1);

    if (Object.keys(updates).length) await this.update(updates);
    return { ...updates, ...applied };
  }

  async postCreationSummary() {
    const creation = prepareCharacterCreation(this);
    const checks = creation.checks.map((check) => `
      <div class="ogre-gate-chat-row"><strong>${check.label}</strong><span>${check.current} / ${check.target} ${check.status === "ok" ? "OK" : "Review"}</span></div>
    `).join("");
    const content = `
      <section class="ogre-gate-chat-card">
        <h3>${this.name} Creation Summary</h3>
        <div class="ogre-gate-chat-row"><strong>Race</strong><span>${OGRE_GATE.races[this.system.creation.race] ?? this.system.creation.race}</span></div>
        <div class="ogre-gate-chat-row"><strong>Primary Groups</strong><span>${creation.primaryGroupLabels.join(", ")}</span></div>
        <div class="ogre-gate-chat-row"><strong>Flaw Points</strong><span>${creation.flawPoints}</span></div>
        ${checks}
      </section>
    `;

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content
    });
  }
}

export class OgreGateItem extends Item {
  get isTechnique() {
    return this.type === "technique";
  }
}
