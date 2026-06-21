import { createHash } from "node:crypto";
import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { TECHNIQUE_CATALOG } from "../module/content/chapter-3-techniques.mjs";
import { packSourcePath, root } from "./pack-paths.mjs";

const destination = packSourcePath("techniques");
const systemManifest = JSON.parse(await readFile(path.join(root, "system.json"), "utf8"));

function documentStats(compendiumSource = null) {
  return {
    compendiumSource,
    duplicateSource: null,
    exportSource: null,
    coreVersion: "13.351",
    systemId: systemManifest.id,
    systemVersion: systemManifest.version,
    createdTime: 0,
    modifiedTime: 0,
    lastModifiedBy: null
  };
}

function documentId(key) {
  return createHash("sha256").update(`ogre-gate-chapter-three:${key}`).digest("hex").slice(0, 16);
}

function filename(entry) {
  const slug = entry.name.replaceAll(/[^A-Za-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
  return `${slug}-${entry.key}.json`;
}

function slug(value) {
  return String(value ?? "none").replaceAll(/[^A-Za-z0-9]+/g, "-").replaceAll(/^-|-$/g, "").toLowerCase() || "none";
}

const TIER_LABELS = {
  martial: "Martial Arts Techniques",
  profound: "Profound Techniques",
  evil: "Evil Techniques",
  immortal: "Immortal Techniques"
};

const DISCIPLINE_LABELS = {
  none: "No Discipline",
  multiple: "Multiple Disciplines",
  waijia: "Waijia",
  qinggong: "Qinggong",
  neigong: "Neigong",
  dianxue: "Dianxue"
};

function techniqueTier(entry) {
  if (entry.group === "evil") return "evil";
  if (entry.group === "profound") return "profound";
  if (entry.group === "immortal" || entry.techniqueType === "immortal") return "immortal";
  return "martial";
}

function disciplineKey(entry) {
  return entry.discipline || "none";
}

function techniqueFolderPath(entry) {
  const tier = techniqueTier(entry);
  const discipline = disciplineKey(entry);
  const qiRank = Number(entry.qiRank ?? 0);
  const tierFolderName = TIER_LABELS[tier] ?? tier;
  const disciplineFolderName = DISCIPLINE_LABELS[discipline] ?? discipline;
  const rankFolderName = `Qi Rank ${qiRank}`;
  const tierDirectory = slug(tierFolderName);
  const disciplineDirectory = path.join(tierDirectory, slug(disciplineFolderName));
  const rankDirectory = path.join(disciplineDirectory, slug(rankFolderName));
  return {
    tier,
    discipline,
    qiRank,
    tierFolderKey: `tier.${tier}`,
    disciplineFolderKey: `tier.${tier}.discipline.${discipline}`,
    rankFolderKey: `tier.${tier}.discipline.${discipline}.qi-${qiRank}`,
    tierFolderName,
    disciplineFolderName,
    rankFolderName,
    tierDirectory,
    disciplineDirectory,
    rankDirectory
  };
}

function folderDocument(key, name, parentId = null) {
  const id = documentId(`folder.${key}`);
  return {
    _id: id,
    name,
    type: "Item",
    sorting: "a",
    sort: 0,
    color: null,
    folder: parentId,
    description: "",
    flags: {},
    _stats: documentStats(`Folder.${id}`),
    _key: `!folders!${id}`
  };
}

function formationData(entry) {
  const formation = Boolean(entry.formation) || /Type:\s*Stance\s*\(Formation\)/i.test(entry.description ?? "");
  if (!formation) return {
    formation: false,
    formationParticipants: 0,
    formationNotes: ""
  };

  const text = `${entry.name} ${entry.description ?? ""}`;
  let participants = 0;
  if (/six people|six practitioners/i.test(text)) participants = 6;
  else if (/two practitioners|pair up|two or more participants|requires two/i.test(text)) participants = 2;
  const notes = entry.formationNotes
    || (participants ? `Requires at least ${participants} participant${participants === 1 ? "" : "s"}. Formation can be broken by a Total Success attack against it.` : "Formation can be broken by a Total Success attack against it.");
  return {
    formation: true,
    formationParticipants: participants,
    formationNotes: notes
  };
}

function prerequisiteData(entry) {
  const overrides = {
    iAmTheArrow: "Spear of the Infinite Emperor; Great Stride",
    oneArmedStrike: "One-Armed Swordsman",
    twinStrike: "One-Armed Swordsman"
  };
  if (overrides[entry.key]) return {
    combination: true,
    prerequisiteTechniques: overrides[entry.key]
  };

  return {
    combination: Boolean(entry.combination),
    prerequisiteTechniques: entry.prerequisiteTechniques ?? ""
  };
}

function actorRequirementData(entry) {
  const flaws = {
    oneArmedStrike: "Missing Limb",
    twinStrike: "Missing Limb"
  };
  const skillRanks = {
    phoenixPalm: "specialist.medicine:3",
    phoenixStarReversal: "specialist.medicine:2",
    tripleYangStrike: "specialist.medicine:1",
    whiteFlowerPalm: "specialist.medicine:1"
  };
  return {
    requiredFlaws: flaws[entry.key] ?? "",
    requiredSkillRanks: skillRanks[entry.key] ?? ""
  };
}

function sectionBeforeCathartic(text = "") {
  return String(text ?? "").split(/\bCathartic:/i)[0] ?? "";
}

function sectionAfterCathartic(text = "") {
  const parts = String(text ?? "").split(/\bCathartic:/i);
  return parts.length > 1 ? parts.slice(1).join(" Cathartic: ") : "";
}

function damageData(entry) {
  const normalText = `${entry.damage ?? ""} ${sectionBeforeCathartic(entry.description)}`;
  const catharticText = sectionAfterCathartic(entry.description);
  const normalOpen = /open damage|damage is open|do open damage|does open damage/i.test(normalText);
  const catharticOpen = /open damage|damage becomes open|becomes open|damage is open|do open damage|does open damage/i.test(catharticText);
  const normalExtra = fixedExtraWounds(normalText);
  const catharticExtraTotal = fixedExtraWounds(catharticText);
  const normalDamageModifier = damageModifier(normalText);
  const catharticDamageTotal = damageModifier(catharticText);
  return {
    openDamage: normalOpen,
    catharticOpenDamage: catharticOpen && !normalOpen,
    damageModifier: normalDamageModifier,
    catharticDamageModifier: catharticDamageTotal ? catharticDamageTotal - normalDamageModifier : 0,
    extraWounds: normalExtra,
    catharticExtraWounds: Math.max(0, catharticExtraTotal - normalExtra)
  };
}

function directWoundsData(entry) {
  const overrides = {
    floodOfWine: {
      totalSuccessDirectWounds: "1"
    },
    graspOfThePython: {
      catharticDirectWounds: "2",
      directWoundsNote: "Cathartic direct Wounds apply each maintained round only if the attacker's original attack missed."
    },
    kickOfTheGoldenElephant: {
      catharticDirectWounds: "1 per Rank of Qi"
    },
    oneArmedStrike: {
      directWounds: "2",
      totalSuccessDirectWounds: "4",
      catharticDirectWounds: "5"
    },
    roarOfTheLion: {
      catharticDirectWounds: "2",
      directWoundsNote: "Cathartic use affects everyone who hears it; the user also takes 2 Wounds due to internal injury."
    },
    spearingBlade: {
      directWounds: "2",
      catharticDirectWounds: "3"
    }
  };

  return {
    directWounds: "",
    totalSuccessDirectWounds: "",
    catharticDirectWounds: "",
    catharticTotalSuccessDirectWounds: "",
    directWoundsNote: "",
    ...(overrides[entry.key] ?? {})
  };
}

function consequenceData(entry) {
  const overrides = {
    floodOfWine: {
      consequenceNote: "On a successful strike, the user is drained of one Qi Rank, recovered at 1 per day; Cathartic use recovers at 1 per hour."
    },
    illuminatingIceClaw: {
      consequenceNote: "If the target of this attack is not killed within the hour, the user takes 2 Wounds and suffers wracking pain."
    },
    mercilessBlackClaw: {
      catharticImbalanceMultiplier: 2,
      consequenceNote: "After the power leaves, current and maximum Wounds are halved for the next two hours."
    },
    mercilessThirstOfTheRoot: {
      consequenceNote: "Non-castrated males take 4 Wounds and permanently lose 1 Hardiness after each use."
    },
    restoringPalm: {
      consequenceNote: "Restored Qi temporarily depletes the user's own Qi by the same amount; Cathartic restoration depletes it for one day per level restored."
    },
    roarOfTheLion: {
      selfWounds: 1,
      catharticSelfWounds: 2,
      consequenceNote: "The roar causes internal injury to the user."
    },
    willow: {
      consequenceNote: "A non-castrated male who uses this technique takes 7 Wounds and permanently loses 1 Hardiness when it is completed."
    }
  };

  return {
    selfWounds: 0,
    catharticSelfWounds: 0,
    catharticImbalanceMultiplier: 1,
    consequenceNote: "",
    ...(overrides[entry.key] ?? {})
  };
}

function drainData(entry) {
  const overrides = {
    crackOfTheHardWhip: {
      targetDrains: "defense.hardiness=1",
      catharticTargetDrains: "defense.hardiness=1",
      targetDrainsNote: "Normal drain recovers after 1 round per Rank of Waijia. Cathartic drain recovers after 1 day per Rank of Waijia, or 1 week per Rank of Waijia on a Total Success."
    },
    theCrushingLashOfLadyPlumBlossom: {
      catharticTargetDrains: "defense.hardiness=2",
      targetDrainsNote: "Cathartic Hardiness loss returns at 1 per day."
    },
    dogBashingStick: {
      targetDrains: "defense.hardiness=1",
      catharticTargetDrains: "defense.hardiness=2"
    },
    floodOfWine: {
      targetDrains: "skill.combat.armStrike=1; skill.combat.legStrike=1; skill.combat.grapple=1; skill.combat.throw=1; skill.combat.lightMelee=1; skill.combat.mediumMelee=1; skill.combat.heavyMelee=1; skill.combat.smallRanged=1; skill.combat.largeRanged=1",
      targetDrainsNote: "Drunkenness imposes -1d10 to Skills and Defenses except Hardiness and Resolve increase by 1 for 1 hour. The structured buttons cover combat skill penalties; adjudicate other Skills and defense increases manually."
    },
    theFourthFistOfYanshi: {
      targetDrains: "defense.hardiness=1",
      catharticTargetDrains: "defense.hardiness=2",
      targetDrainsNote: "Apply only after both the attack and damage rolls are successful. Normal drain returns at 1 per hour; Cathartic drain returns at 1 per month."
    },
    harmonizingStrike: {
      targetDrains: "defense.hardiness=1 per Rank of Neigong",
      catharticTargetDrains: "defense.hardiness=1 per Rank of Neigong",
      targetDrainsNote: "Normal drain is recovered in a single round. Cathartic drain recovers at the normal temporary-drain rate."
    },
    illuminatingIceClaw: {
      targetDrains: "defense.hardiness=1",
      catharticTargetDrains: "defense.hardiness=1 per Rank of Neigong",
      targetDrainsNote: "Cathartic use also removes one chosen emotion for 1 hour per Rank of Qi."
    },
    phoenixPalm: {
      catharticTargetDrains: "defense.hardiness=2 per Rank of Dianxue",
      catharticTotalSuccessTargetDrains: "defense.hardiness=2 per Rank of Dianxue; defense.hardiness=1",
      targetDrainsNote: "Also permanently drains all Physical Skills by the same base amount. This drain does not recover normally and can only be returned by suitable powerful aid."
    },
    phoenixStarReversal: {
      targetDrains: "defense.hardiness=1 per Rank of Dianxue",
      totalSuccessTargetDrains: "defense.hardiness=1 per Rank of Dianxue; defense.hardiness=1",
      catharticTargetDrains: "defense.hardiness=1 per Rank of Dianxue",
      catharticTotalSuccessTargetDrains: "defense.hardiness=1 per Rank of Dianxue; defense.hardiness=1",
      targetDrainsNote: "Cathartic use also drains all Physical Skills by 1 rank, or 2 ranks on a Total Success. Drain recovers at the usual rate."
    },
    phoenixStarStrike: {
      targetDrains: "defense.hardiness=1",
      totalSuccessTargetDrains: "defense.hardiness=2",
      catharticTargetDrains: "defense.hardiness=1",
      catharticTotalSuccessTargetDrains: "defense.hardiness=2",
      targetDrainsNote: "Normal drain lasts 1 minute per Rank of Dianxue. Cathartic drain lasts 1 hour per Rank of Dianxue, or 1 day per Rank of Dianxue during the Phoenix Moon."
    },
    tripleYangStrike: {
      catharticTargetDrains: "defense.stealth=1 per Rank of Qi; defense.evade=1 per Rank of Qi; defense.parry=1 per Rank of Qi",
      targetDrainsNote: "Normal use gives -1d10 to Athletics for 1 hour per Rank of Dianxue. Cathartic drains Stealth, Evade, and Parry per Qi level; these recover at 1 per hour."
    },
    whiteFlowerPalm: {
      targetDrains: "defense.hardiness=1 per Rank of Qi",
      catharticTargetDrains: "defense.hardiness=1 per Rank of Qi",
      targetDrainsNote: "Normal Hardiness drain lasts for rounds equal to Dianxue rank. Cathartic drain recovers at 1 per day under the Chapter 2 draining rules."
    },
    bloodlessSwordStrikeOfHenShi: {
      targetDrainsNote: "Roll 6d10 Open Damage against doubled Hardiness, but drain Qi instead of causing Wounds: 1 Qi per success, 2 per Total Success. Qi returns at 1 per round."
    },
    ruinousArrayOfTheArmillarySphere: {
      targetDrainsNote: "Roll 6d10 Open Damage against affected targets, but drain Qi levels equal to Wounds that would have been suffered. Qi returns at 1 per 10 minutes."
    }
  };

  return {
    targetDrains: "",
    totalSuccessTargetDrains: "",
    catharticTargetDrains: "",
    catharticTotalSuccessTargetDrains: "",
    targetDrainsNote: "",
    ...(overrides[entry.key] ?? {})
  };
}

function effectData(entry) {
  const overrides = {
    crackOfTheHardWhip: {
      totalSuccessTargetEffects: "Stunned for 2 rounds",
      catharticTotalSuccessTargetEffects: "Stunned for 2 rounds"
    },
    dogLiftingStick: {
      targetEffects: "Target is lifted and cannot move freely for 1 round per Rank of Waijia",
      catharticTargetEffects: "May throw target prone and deal 1d10 Damage per Rank of Waijia"
    },
    handsOfTheHawkBeak: {
      targetEffects: "Choose arm or leg injury for 1 round per Rank of Waijia",
      catharticTargetEffects: "Choose arm or leg fracture for 1 week per Rank of Waijia",
      targetEffectsNote: "Arm Injury: Parry -2, Arm Strike and Grapple -1d10, no two-handed melee weapons. Leg Injury: Speed -2d10, Leg Strike/Grapple/Athletics -1d10."
    },
    theHiddenFistOfYanshi: {
      catharticTargetEffects: "Stunned for 1 round"
    },
    invisibleWhipOfTheSpiderDemon: {
      targetEffects: "Entangled or tripped for 1 round; Athletics against original attack result to move",
      totalSuccessTargetEffects: "Entangled or tripped for 2 rounds; Athletics against original attack result to move",
      catharticTargetEffects: "As normal, larger area; targets must Detect TN 6 or suffer Evade -3 and Athletics -3d10 against this attack/effect"
    },
    mightyPawsOfTheLion: {
      targetEffects: "If target has fewer Qi Ranks, knocked prone and stunned for rounds equal to Qi Rank difference",
      totalSuccessTargetEffects: "As success, plus target is sent flying back and takes Damage equal to user's Waijia Rank"
    },
    ribbonsOfSteel: {
      catharticTargetEffects: "Resolve effect by target Qi table: possible death, limb loss, direct Wounds, or 3d10 Damage"
    },
    somersaultStrikeOfTheDrunkenMonkey: {
      targetEffects: "Target rolls Endurance TN 5 + user's Waijia Rank or is dazed for 1 round",
      totalSuccessTargetEffects: "Target rolls Endurance TN 5 + user's Waijia Rank or is dazed for 2 rounds"
    },
    spinningSteel: {
      catharticTargetEffects: "Resolve effect by target Qi table: possible decapitation, limb loss on Total Success, direct Wounds, normal Damage, 1d10 Damage, or no Damage"
    },
    stunningStickStrike: {
      targetEffects: "Stunned for 1 round",
      catharticTargetEffects: "Stunned for 2 rounds",
      targetEffectsNote: "On failure, the foe gets one free Attack against the user. Does not work against opponents 2 or more Qi Ranks higher than the user."
    },
    blastOfTheDragon: {
      targetEffects: "Thrown into the air by the red gust; resolve falling or thrown-position outcome from the entry"
    },
    cloudOfInebriation: {
      targetEffects: "Drunk for 10 minutes per Rank of Neigong: -1d10 to Skills and Defenses, except Resolve and Hardiness increase by 1",
      totalSuccessTargetEffects: "Drunk for 1 hour per Rank of Neigong: -1d10 to Skills and Defenses, except Resolve and Hardiness increase by 1",
      catharticTargetEffects: "Affected targets immediately pass out",
      targetEffectsNote: "Area affects allies too and only affects targets 2 Qi Ranks or more lower than the user."
    },
    eagleDescendsLoudly: {
      targetEffects: "Target is thrown a great distance or straight into the air; resolve landing, fall, and positioning from the entry"
    },
    theFirstSongOfShanLushan: {
      targetEffects: "Listener is filled with intense longing or desire; GM adjudicates behavior from the entry"
    },
    floodOfWine: {
      targetEffects: "Target becomes drunk for 1 hour; staff beam range is 30 feet per Rank of Neigong",
      totalSuccessTargetEffects: "Target becomes drunk for 1 hour and takes 1 direct Wound"
    },
    gazeOfTheLion: {
      targetEffects: "Target cannot land Total Successes against the user or allies for 1 round per Rank of Neigong",
      totalSuccessTargetEffects: "Target cannot land Total Successes against the user or allies for 2 rounds per Rank of Neigong",
      catharticTargetEffects: "As normal, but affects multiple targets: 2 per Rank of Qi"
    },
    illuminatingIceClaw: {
      catharticTargetEffects: "Choose one emotion to eliminate from the target for 1 hour per Rank of Qi"
    },
    jadeMaidenStrike: {
      targetEffects: "Qi 2 or lower targets turn to cold stone for 1 round per Rank of user's Qi",
      catharticTargetEffects: "Qi 5 or lower targets turn to cold stone for 1 round per Rank of user's Qi and take 3d10 Open Damage each round"
    },
    nagaPalm: {
      targetEffects: "Naga Palm affliction: shaking, Combat and Physical Skill penalties until cured",
      catharticTargetEffects: "Naga Palm affliction becomes lethal in 1d10 days unless cured by appropriate technique",
      targetEffectsNote: "Medicine TN is 1 + Qi + Neigong Ranks and requires an antidote; Cathartic use cannot be cured by mundane Medicine."
    },
    rageOfOneThousandGrievingWidows: {
      targetEffects: "Resolve weaker-foe death threshold and area effects from the entry"
    },
    heartStrike: {
      targetEffects: "Sluggish: -1d10 to all Mental Skill rolls for 1 hour per Rank of Dianxue",
      catharticTargetEffects: "If Hardiness reaches 0 from this technique, target enters coma and must roll Endurance TN 7 every hour to avoid death",
      catharticTotalSuccessTargetEffects: "Hardiness loss from Heart Strike is permanent; coma rule applies if Hardiness reaches 0"
    },
    infiniteCounterOfThePhoenix: {
      targetEffects: "After successful Medicine TN 6 follow-up, target is immobile for 1 round per Rank of Dianxue",
      catharticTargetEffects: "Can counter Kung Fu Techniques; after successful Medicine TN 6 follow-up, target is immobile for 2 rounds per Rank of Dianxue"
    },
    invertedThreePointStrike: {
      targetEffects: "Paralyzed for 1 round per Rank of Dianxue",
      totalSuccessTargetEffects: "Paralyzed for 1 round per Rank of Dianxue plus 1 additional round",
      catharticTargetEffects: "Immobilized for 1 hour per Rank of Dianxue",
      targetEffectsNote: "Against Martial Heroes, normal use only works when the target is surprised."
    },
    liverStagnationStrike: {
      targetEffects: "-1d10 to any skill requiring movement or exertion for 1 hour per Rank of Dianxue",
      catharticTargetEffects: "As normal, plus Athletics and Detect suffer -1d10 per Rank of Dianxue for 1 hour and target gains a random Mental Affliction for 1 day per Rank of Dianxue"
    },
    phoenixSpiritDisruption: {
      targetEffects: "Chosen Phoenix Spirit is disrupted for 10 minutes per Rank of Dianxue; apply corresponding Missing Phoenix Spirit flaw while active",
      totalSuccessTargetEffects: "Chosen Phoenix Spirit is disrupted for 20 minutes per Rank of Dianxue; apply corresponding Missing Phoenix Spirit flaw while active",
      catharticTargetEffects: "Chosen Phoenix Spirit is disrupted for 1 day per Rank of Dianxue; apply corresponding Missing Phoenix Spirit flaw while active"
    },
    strikeOfTheRagingTiger: {
      targetEffects: "Raging confusion for 2 rounds: +1d10 Damage, must attack nearest ally if possible",
      totalSuccessTargetEffects: "Raging confusion lasts 2 rounds plus 1 round per Rank of Dianxue",
      catharticTargetEffects: "Raging confusion lasts 10 minutes per Rank of Qi",
      catharticTotalSuccessTargetEffects: "Raging confusion lasts 10 minutes per Rank of Qi plus 10 minutes per Rank of Dianxue"
    },
    tremblingStrike: {
      targetEffects: "-1d10 to all Combat and Physical Skills for 1 round",
      totalSuccessTargetEffects: "-1d10 to all Combat and Physical Skills for 1 round plus 1 round per Rank of Dianxue",
      catharticTargetEffects: "Increasing -1d10 Combat and Physical Skill penalty each round until target succeeds at Meditation against original Arm Strike result"
    },
    roarOfTheDragon: {
      targetEffects: "Targets below user's Qi Rating are knocked prone and driven permanently mad; GM assigns the resulting Mental Affliction or personality change"
    },
    sleevesOfFrost: {
      targetEffects: "Freezing begins; Speed penalty increases by -1d10 each round until Speed reaches 0, then target is frozen and paralyzed",
      totalSuccessTargetEffects: "As success, and duration doubles",
      targetEffectsNote: "Duration and escape cadence depend on relative Qi Rank; see entry."
    },
    waveOfFrost: {
      targetEffects: "Targets enter frozen state: paralyzed and unaware, with duration based on relative Qi Rank",
      totalSuccessTargetEffects: "Frozen-state duration doubles",
      targetEffectsNote: "Does not work against opponents of equal or greater Qi Rank."
    },
    theHiddenHandsOfTheShadowPuppeteer: {
      targetEffects: "User controls target actions for 2 rounds",
      totalSuccessTargetEffects: "User controls target actions for 4 rounds",
      targetEffectsNote: "Affects targets with 2 Qi Ranks or less within the listed area and target count."
    }
  };

  return {
    targetEffects: "",
    totalSuccessTargetEffects: "",
    catharticTargetEffects: "",
    catharticTotalSuccessTargetEffects: "",
    targetEffectsNote: "",
    ...(overrides[entry.key] ?? {})
  };
}

function fixedExtraWounds(text = "") {
  const value = String(text ?? "");
  const matches = [
    ...value.matchAll(/\bplus\s+(\d+)\s+Extra Wounds?(?!\s+per)/gi),
    ...value.matchAll(/\bdoes\s+(\d+)\s+Extra Wounds?\b(?!\s+per)/gi),
    ...value.matchAll(/\bdo\s+(\d+)\s+Extra Wounds?\b(?!\s+per)/gi),
    ...value.matchAll(/\bdeals?\s+(\d+)\s+Extra Wounds?\b(?!\s+per)/gi)
  ];
  return matches.reduce((highest, match) => Math.max(highest, Number(match[1] ?? 0)), 0);
}

function damageModifier(text = "") {
  const value = String(text ?? "");
  const matches = [
    ...value.matchAll(/\badd\s+(\d+)d10\s+to\s+(?:your\s+)?Damage/gi),
    ...value.matchAll(/\+(\d+)d10\s+to\s+(?:your\s+)?Damage/gi)
  ];
  return matches.reduce((highest, match) => Math.max(highest, Number(match[1] ?? 0)), 0);
}

function attackModifier(entry) {
  const value = `${entry.activationSkill ?? ""} ${sectionBeforeCathartic(entry.description)}`;
  const penalties = [...value.matchAll(/(?:at|with|take|imposing)\s+a?\s*(-\d+)d10\s+penalty/gi)]
    .map((match) => Number(match[1] ?? 0));
  const bonuses = [...value.matchAll(/(?:at|with|gain|gains|add)\s+a?\s*\+(\d+)d10\s+(?:bonus\s+)?(?:to\s+)?(?:your\s+)?(?:Attack|roll)/gi)]
    .map((match) => Number(match[1] ?? 0));
  return [...penalties, ...bonuses].reduce((selected, value) => Math.abs(value) > Math.abs(selected) ? value : selected, 0);
}

function targetData(entry) {
  const value = `${entry.activationSkill ?? ""} ${entry.description ?? ""}`;
  const against = value.match(/\bagainst\s+(Parry|Evade|Hardiness|Resolve|Wits)\b/i)?.[1];
  if (against) {
    return {
      targetDefense: against.toLowerCase(),
      targetNumber: 6
    };
  }

  const tn = value.match(/\bTN\s*(\d+)/i)?.[1];
  return {
    targetDefense: tn ? "tn" : "none",
    targetNumber: tn ? Number(tn) : 6
  };
}

function requirementNotes(entry) {
  if (entry.requirementNotes) return entry.requirementNotes;
  if (entry.key === "iAmTheArrow") {
    return "Must be able to see the target, have at least 20 feet of space above the target, and have a clear descent path.";
  }

  const description = String(entry.description ?? "").replace(/\s+/g, " ").trim();
  const notes = [];
  const explicit = description.match(/\bRequirements?:\s*(.*?)(?=\s+Cathartic:|$)/i)?.[1]?.trim();
  if (explicit) notes.push(explicit);

  const normalText = sectionBeforeCathartic(description);
  const rules = [
    /\bThis Technique requires ([^.]+)\./gi,
    /\bThis requires ([^.]+)\./gi,
    /\bIn order to use this Technique, ([^.]+)\./gi,
    /\bTo perform this Technique ([^.]+)\./gi,
    /\bTo use this Technique, ([^.]+)\./gi,
    /\bThis can only be used ([^.]+)\./gi,
    /\bCan only be used ([^.]+)\./gi,
    /\bMust be used ([^.]+)\./gi,
    /\bYou must ([^.]+)\./gi
  ];
  for (const rule of rules) {
    for (const match of normalText.matchAll(rule)) {
      const value = match[0].trim();
      if (!notes.some((note) => note.toLowerCase() === value.toLowerCase())) notes.push(value);
    }
  }

  const cleaned = notes
    .map((note) => note.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return cleaned
    .filter((note, index, list) => {
      const current = note.toLowerCase();
      if (list.findIndex((candidate) => candidate.toLowerCase() === current) !== index) return false;
      return !list.some((candidate, candidateIndex) => (
        candidateIndex !== index
        && candidate.toLowerCase().includes(current)
        && candidate.length > note.length
      ));
    })
    .map((note) => note.replace(/^[a-z]/, (letter) => letter.toUpperCase()))
    .join(" ");
}

function accessNotes(entry) {
  const description = String(entry.description ?? "").replace(/\s+/g, " ").trim();
  const notes = [];
  const patterns = [
    /\bThis is a lost Technique[^.]*\./gi,
    /\bThis Technique was lost[^.]*\./gi,
    /\b[^.]*\blost ages ago[^.]*\./gi,
    /\b[^.]*\bmanual[^.]*\./gi,
    /\b[^.]*\bcontained in[^.]*\./gi,
    /\b[^.]*\bfound in[^.]*\./gi,
    /\b[^.]*\bknown only to[^.]*\./gi,
    /\b[^.]*\brumor(?:ed)?[^.]*\./gi,
    /\b[^.]*\bsect[^.]*\./gi,
    /\b[^.]*\bclan[^.]*\./gi
  ];
  for (const pattern of patterns) {
    for (const match of description.matchAll(pattern)) {
      const note = match[0].trim();
      if (note && !notes.some((existing) => existing.toLowerCase() === note.toLowerCase())) notes.push(note);
    }
  }

  return notes
    .filter((note, index, list) => {
      const current = note.toLowerCase();
      if (list.findIndex((candidate) => candidate.toLowerCase() === current) !== index) return false;
      return !list.some((candidate, candidateIndex) => (
        candidateIndex !== index
        && candidate.toLowerCase().includes(current)
        && candidate.length > note.length
      ));
    })
    .slice(0, 3)
    .join(" ");
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const folderIds = {};
const folders = new Map();

async function ensureFolder(key, name, parentId, directory) {
  if (folders.has(key)) return folders.get(key)._id;

  const doc = folderDocument(key, name, parentId);
  folders.set(key, doc);
  folderIds[key] = doc._id;
  const folderDirectory = path.join(destination, directory);
  await mkdir(folderDirectory, { recursive: true });
  await writeFile(path.join(folderDirectory, "_Folder.json"), `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  return doc._id;
}

for (const [tier, tierFolderName] of Object.entries(TIER_LABELS)) {
  await ensureFolder(`tier.${tier}`, tierFolderName, null, slug(tierFolderName));
}

for (const entry of TECHNIQUE_CATALOG) {
  const folderPath = techniqueFolderPath(entry);
  const tierId = await ensureFolder(
    folderPath.tierFolderKey,
    folderPath.tierFolderName,
    null,
    folderPath.tierDirectory
  );
  const disciplineId = await ensureFolder(
    folderPath.disciplineFolderKey,
    folderPath.disciplineFolderName,
    tierId,
    folderPath.disciplineDirectory
  );
  await ensureFolder(
    folderPath.rankFolderKey,
    folderPath.rankFolderName,
    disciplineId,
    folderPath.rankDirectory
  );
}

for (const entry of TECHNIQUE_CATALOG) {
  const id = documentId(entry.key);
  const folderPath = techniqueFolderPath(entry);
  const formation = formationData(entry);
  const prerequisites = prerequisiteData(entry);
  const actorRequirements = actorRequirementData(entry);
  const damage = damageData(entry);
  const directWounds = directWoundsData(entry);
  const drains = drainData(entry);
  const effects = effectData(entry);
  const consequences = consequenceData(entry);
  const target = targetData(entry);
  const attack = attackModifier(entry);
  const data = {
    _id: id,
    name: entry.name,
    type: "technique",
    img: "icons/svg/aura.svg",
    system: {
      description: entry.description,
      source: entry.source,
      cost: "",
      discipline: entry.discipline,
      techniqueType: entry.techniqueType,
      activationSkill: entry.activationSkill,
      targetDefense: target.targetDefense,
      targetNumber: target.targetNumber,
      qiRank: entry.qiRank,
      attackModifier: attack,
      catharticAttackModifier: 0,
      damage: entry.damage,
      damageModifier: damage.damageModifier,
      catharticDamageModifier: damage.catharticDamageModifier,
      directWounds: directWounds.directWounds,
      totalSuccessDirectWounds: directWounds.totalSuccessDirectWounds,
      catharticDirectWounds: directWounds.catharticDirectWounds,
      catharticTotalSuccessDirectWounds: directWounds.catharticTotalSuccessDirectWounds,
      directWoundsNote: directWounds.directWoundsNote,
      targetDrains: drains.targetDrains,
      totalSuccessTargetDrains: drains.totalSuccessTargetDrains,
      catharticTargetDrains: drains.catharticTargetDrains,
      catharticTotalSuccessTargetDrains: drains.catharticTotalSuccessTargetDrains,
      targetDrainsNote: drains.targetDrainsNote,
      targetEffects: effects.targetEffects,
      totalSuccessTargetEffects: effects.totalSuccessTargetEffects,
      catharticTargetEffects: effects.catharticTargetEffects,
      catharticTotalSuccessTargetEffects: effects.catharticTotalSuccessTargetEffects,
      targetEffectsNote: effects.targetEffectsNote,
      selfWounds: consequences.selfWounds,
      catharticSelfWounds: consequences.catharticSelfWounds,
      catharticImbalanceMultiplier: consequences.catharticImbalanceMultiplier,
      consequenceNote: consequences.consequenceNote,
      openDamage: damage.openDamage,
      catharticOpenDamage: damage.catharticOpenDamage,
      extraWounds: damage.extraWounds,
      catharticExtraWounds: damage.catharticExtraWounds,
      counter: entry.counter,
      secret: Boolean(entry.secret),
      accessNotes: accessNotes(entry),
      combination: prerequisites.combination,
      prerequisiteTechniques: prerequisites.prerequisiteTechniques,
      requirementNotes: requirementNotes(entry),
      requiredFlaws: actorRequirements.requiredFlaws,
      requiredSkillRanks: actorRequirements.requiredSkillRanks,
      catharticEffect: sectionAfterCathartic(entry.description).trim(),
      formation: formation.formation,
      formationParticipants: formation.formationParticipants,
      formationNotes: formation.formationNotes
    },
    effects: [],
    folder: folderIds[folderPath.rankFolderKey],
    flags: {
      ogregatefoundry: {
        chapter: 3,
        rulesKey: entry.key,
        originalDiscipline: entry.originalDiscipline,
        secret: entry.secret,
        group: entry.group
      }
    },
    ownership: {
      default: 0
    },
    _stats: documentStats(`Item.${id}`),
    _key: `!items!${id}`
  };
  await writeFile(path.join(destination, folderPath.rankDirectory, filename(entry)), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(`Created ${TECHNIQUE_CATALOG.length} Kung Fu Technique source documents in ${destination}.`);
