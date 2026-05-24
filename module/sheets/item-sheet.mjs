import { OGRE_GATE } from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function getInputValue(input) {
  if (input.type === "checkbox") return input.checked;
  if (input.type === "number") return Number(input.value || 0);
  return input.value;
}

const ITEM_HELP = {
  weaponCategory: "Weapon category determines the default combat skill family for attacks.",
  attackSkill: "Skill key used when this weapon rolls an attack, such as mediumMelee or smallRanged.",
  targetDefense: "Defense the target uses against this weapon, usually Parry for melee or Evade for ranged.",
  damageSkill: "Optional skill key whose ranks add dice to this weapon's damage roll.",
  damageDice: "Base damage dice rolled by this weapon before skill ranks and modifiers.",
  weaponReach: "Reach category used by the Chapter 2 closing and reach helper.",
  openDamage: "Open damage counts every success, rather than only the kept die result.",
  techniqueDiscipline: "Martial discipline required or associated with this technique.",
  techniqueType: "Technique bucket used to organize it on the actor sheet.",
  activationSkill: "Skill used to activate or roll the technique when one is required.",
  qiRank: "Minimum or associated Qi rank for the technique.",
  qiCost: "Qi spent to use the technique when the rules call for a cost.",
  combatPerkGroup: "Combat Perk group this perk belongs to.",
  combatPerkSkill: "Specific skill or combat skill this perk modifies.",
  combatPerkBonus: "Rules text or dice bonus granted by this Combat Perk.",
  flawKey: "Choose a rules-listed flaw. The sheet will fill the name, category, point value, and limit exemption.",
  flawCategory: "Creation category for this flaw, such as standard or demon.",
  flawPoints: "Skill points gained from this flaw during character creation.",
  acquiredAtCreation: "Marks whether this flaw was selected during character creation.",
  exemptFromCreationLimit: "Marks flaws that do not count against the standard flaw limit.",
  requiresResolveTest: "Marks flaws that may require a Resolve test during play.",
  flawPenalty: "Mechanical penalty or reminder text for the flaw."
};

export class OgreGateItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["ogre-gate", "item-sheet"],
    position: {
      width: 620,
      height: 560
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
      }))
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

    return this.item.update(updates);
  }
}
