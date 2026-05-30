import { OGRE_GATE } from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function getInputValue(input) {
  if (input.type === "checkbox") return input.checked;
  if (input.type === "number") return Number(input.value || 0);
  return input.value;
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ITEM_HELP = {
  weaponCategory: "Weapon category determines the default combat skill family for attacks.",
  attackSkill: "Skill used when this weapon rolls an attack.",
  targetDefense: "Defense the target uses against this weapon, usually Parry for melee or Evade for ranged.",
  damageSkill: "Optional skill whose ranks add dice to this weapon's damage roll.",
  damageDice: "Damage dice added to the selected Damage Skill. This may be -1d10 for entries such as Arm Strike.",
  accuracyModifier: "Accuracy dice added to or subtracted from the weapon's attack roll.",
  muscleRequirement: "Minimum Muscle ranks needed to use the item effectively. Weapons apply -1d10 attack if unmet.",
  lethal: "Non-lethal weapons do not start dying when they wound an incapacitated target.",
  damageType: "Book weapon type: Sharp, Blunt, Mighty, Fire, or Special. This is used for armor damage reductions.",
  weaponReach: "This weapon's Chapter 2 reach category, shown in weapon attack results for adjudicating closing and close range.",
  openDamage: "Open damage counts every success, rather than only the kept die result.",
  specialRules: "Rules text for unusual traits such as disarming, parry bonuses, range quirks, or special damage behavior.",
  armorPreset: "Select a book armor or shield to fill its damage reductions, penalties, and bonuses.",
  equippedArmor: "Only equipped armor and shields are considered by sheet helpers.",
  armorReduction: "Damage dice penalty imposed on mundane attacks of this type. Kung Fu Techniques ignore armor unless a rule says otherwise.",
  armorArrowReduction: "Damage dice penalty against arrows, such as Paper Scale Armor.",
  armorSpeedPenalty: "Penalty to Speed rolls while equipped.",
  armorDefenseBonus: "Static Parry or Evade bonus from a shield.",
  skillGroup: "Primary skill group used to organize this skill on the actor sheet.",
  skillKey: "Rules key used for automation and duplicate checks. Open skill choices use keys such as talent.poisoning or language.daoyun.",
  techniqueDiscipline: "Martial discipline required or associated with this technique.",
  techniqueType: "Technique bucket used to organize it on the actor sheet.",
  activationSkill: "Skill used to activate or roll the technique when one is required.",
  qiRank: "Minimum Qi rank required to use the technique; using techniques does not spend Qi.",
  combatPerkGroup: "Combat Perk group this perk belongs to.",
  combatPerkSkill: "Specific skill or combat skill this perk modifies.",
  combatPerkBonus: "Rules text or dice bonus granted by this Combat Perk.",
  flawKey: "Choose a rules-listed flaw. The sheet will fill the name, category, point value, and limit exemption.",
  flawCategory: "Creation category for this flaw, such as standard or demon.",
  flawPoints: "Skill points gained from this flaw during character creation.",
  acquiredAtCreation: "Marks whether this flaw was selected during character creation.",
  exemptFromCreationLimit: "Marks flaws that do not count against the standard flaw limit.",
  requiresResolveTest: "Marks flaws that may require a Resolve test during play.",
  flawPenalty: "Mechanical penalty or reminder text for the flaw.",
  afflictionType: "Whether this Chapter 2 hazard is a poison or disease.",
  lethality: "Time increment before an untreated lethal affliction kills; it also sets treatment roll cadence.",
  speed: "How often the affliction advances its cumulative -1d10 penalties or stated effect.",
  medicineTn: "Target number for Medicine treatment. A value of 0 means standard Medicine treatment is not listed.",
  treatmentMode: "Standard treatment can cure; Stave Off Only is for effects such as Malignant Wind Disease, which Medicine cannot cure.",
  potency: "Dice rolled against a victim's Hardiness when exposed.",
  affectedSkills: "Skill categories affected by progressive penalties: Combat, Mental, or Physical.",
  brewRating: "Talent (Poison) TN required to brew a poison.",
  antidoteRequired: "Requires the listed antidote or remedy before Medicine can cure or stabilize it.",
  substanceType: "Rules category of this prepared substance.",
  brewSkill: "Skill used to create this substance when a creation TN is stated.",
  brewTn: "Target number required to create the substance, when stated.",
  targetAffliction: "Disease, poison, or condition this substance treats or affects.",
  substanceQuantity: "Number of prepared doses available when this Substance is stored on an actor. Applying an actor-owned dose reduces this value by one."
};

function isSkillOptionSelected(selected, groupKey, skillKey, label) {
  const normalized = normalizeKey(selected);
  if (!normalized) return false;
  const groupLabel = OGRE_GATE.skillGroups[groupKey]?.label ?? groupKey;
  return [
    skillKey,
    `${groupKey}.${skillKey}`,
    `${groupKey}:${skillKey}`,
    `${groupLabel}: ${label}`,
    `${groupLabel} ${label}`
  ].some((candidate) => normalizeKey(candidate) === normalized);
}

function skillOptions({ includeBlank = false, selected = "" } = {}) {
  const options = [];
  if (includeBlank) options.push({ key: "", label: "None", selected: !selected });
  for (const [groupKey, group] of Object.entries(OGRE_GATE.skillGroups)) {
    if (groupKey === "defenses") continue;
    for (const [skillKey, label] of Object.entries(group.skills)) {
      options.push({
        key: `${groupKey}.${skillKey}`,
        label: `${group.label}: ${label}`,
        selected: isSkillOptionSelected(selected, groupKey, skillKey, label)
      });
    }
  }
  return options;
}

function combatSkillOptions() {
  return Object.entries(OGRE_GATE.skillGroups.combat.skills).map(([key, label]) => ({
    key,
    label
  }));
}

function defenseOptions() {
  return Object.entries(OGRE_GATE.defenses).map(([key, defense]) => ({
    key,
    label: defense.label
  }));
}

export class OgreGateItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["ogre-gate", "item-sheet"],
    position: {
      width: 700,
      height: 620
    },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      resizable: true
    },
    form: {
      ...super.DEFAULT_OPTIONS.form,
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/ogregatefoundry/templates/item/item-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      item: this.item,
      system: this.item.system,
      config: OGRE_GATE,
      help: ITEM_HELP,
      skillGroups: Object.entries(OGRE_GATE.skillGroups).filter(([key]) => key !== "defenses").map(([key, group]) => ({
        key,
        label: group.label
      })),
      combatSkills: combatSkillOptions(),
      allSkills: skillOptions({ includeBlank: true, selected: this.item.system.activationSkill }),
      defenses: defenseOptions(),
      weaponDamageTypes: Object.entries(OGRE_GATE.weaponDamageTypes).map(([key, label]) => ({ key, label })),
      disciplines: Object.entries(OGRE_GATE.disciplines).map(([key, label]) => ({ key, label })),
      techniqueTypes: Object.entries(OGRE_GATE.techniqueTypes).map(([key, label]) => ({ key, label })),
      armorRules: Object.entries(OGRE_GATE.armorRules).map(([key, rule]) => ({
        key,
        ...rule,
        tooltip: rule.shield
          ? `${rule.label}: Parry +${rule.parryBonus}, Evade +${rule.evadeBonus}, Speed -${rule.speedPenalty}d10.`
          : `${rule.label}: Sharp -${rule.sharpReduction}d10, Blunt -${rule.bluntReduction}d10, Mighty -${rule.mightyReduction}d10, Arrows -${rule.arrowReduction}d10, Speed -${rule.speedPenalty}d10.`
      })),
      flawRules: Object.entries(OGRE_GATE.flawRules).map(([key, rule]) => ({
        key,
        ...rule,
        tooltip: `${rule.label}: ${rule.points} skill point(s), category ${rule.category}${rule.exemptFromCreationLimit ? ", exempt from creation flaw limit" : ""}.`
      })),
      combatTechniqueGroups: Object.entries(OGRE_GATE.combatTechniqueGroups).map(([key, label]) => ({
        key,
        label,
        tooltip: `Combat Perk group: ${label}.`
      })),
      reachOptions: Object.entries(OGRE_GATE.reachCategories).map(([key, label]) => ({
        key,
        label
      })),
      afflictionTypes: Object.entries(OGRE_GATE.afflictionTypes).map(([key, label]) => ({ key, label })),
      afflictionIntervals: Object.entries(OGRE_GATE.afflictionIntervals).map(([key, label]) => ({ key, label })),
      substanceTypes: Object.entries(OGRE_GATE.substanceTypes).map(([key, label]) => ({ key, label }))
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll("input[name], select[name], textarea[name]").forEach((input) => {
      if (input.disabled) return;
      if (input.name !== "name" && !input.name.startsWith("system.")) return;
      input.addEventListener("change", (event) => {
        return this.#onFieldChange(event);
      });
    });
  }

  #onFieldChange(event) {
    const field = event.currentTarget;
    const updates = { [field.name]: getInputValue(field) };

    if (this.item.type === "flaw" && field.name === "system.flawKey") {
      const rule = OGRE_GATE.flawRules[field.value];
      if (rule) {
        updates.name = rule.label;
        updates["system.skillPointValue"] = rule.points;
        updates["system.category"] = rule.category;
        updates["system.exemptFromCreationLimit"] = Boolean(rule.exemptFromCreationLimit);
      }
    }

    if (this.item.type === "weapon" && field.name === "system.category") {
      updates["system.attackSkill"] = field.value;
      updates["system.targetDefense"] = OGRE_GATE.combatSkillDefense[field.value] ?? this.item.system.targetDefense;
    }

    if (this.item.type === "armor" && field.name === "system.armorKey") {
      const rule = OGRE_GATE.armorRules[field.value];
      if (rule) {
        if (field.value !== "custom") updates.name = rule.label;
        if (rule.cost) updates["system.cost"] = rule.cost;
        updates["system.sharpReduction"] = rule.sharpReduction;
        updates["system.bluntReduction"] = rule.bluntReduction;
        updates["system.mightyReduction"] = rule.mightyReduction;
        updates["system.arrowReduction"] = rule.arrowReduction;
        updates["system.speedPenalty"] = rule.speedPenalty;
        updates["system.parryBonus"] = rule.parryBonus;
        updates["system.evadeBonus"] = rule.evadeBonus;
        updates["system.muscleRequirement"] = rule.muscleRequirement;
        updates["system.shield"] = Boolean(rule.shield);
        updates["system.qualities"] = rule.notes;
      }
    }

    return this.item.update(updates);
  }
}
