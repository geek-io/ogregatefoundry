import { OGRE_GATE } from "../config.mjs";
import { prepareCharacterCreation } from "../rules/character-creation.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class OgreGateActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["ogre-gate", "actor-sheet"],
    position: {
      width: 980,
      height: 820
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
      template: "systems/ogregatefoundry/templates/actor/actor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    return {
      ...context,
      actor,
      system: actor.system,
      config: OGRE_GATE,
      creation: prepareCharacterCreation(actor),
      skillGroups: this.#prepareSkillGroups(actor),
      defenses: this.#prepareDefenses(actor),
      techniques: actor.items.filter((item) => item.type === "technique"),
      combatTechniques: actor.items.filter((item) => item.type === "combatTechnique"),
      flaws: actor.items.filter((item) => item.type === "flaw"),
      equipment: actor.items.filter((item) => ["weapon", "armor", "equipment"].includes(item.type))
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll("[data-action='roll-skill']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollSkill(event));
    });
    this.element.querySelectorAll("[data-action='roll-defense']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollDefense(event));
    });
    this.element.querySelectorAll("[data-action='roll-turn-order']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollTurnOrder(event));
    });
    this.element.querySelectorAll("[data-action='roll-weapon-attack']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollWeaponAttack(event));
    });
    this.element.querySelectorAll("[data-action='roll-weapon-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollWeaponDamage(event));
    });
    this.element.querySelectorAll("[data-action='roll-falling-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollFallingDamage(event));
    });
    this.element.querySelectorAll("[data-action='roll-fire-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollFireDamage(event));
    });
    this.element.querySelectorAll("[data-action='roll-suffocation']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollSuffocation(event));
    });
    this.element.querySelectorAll("[data-action='roll-object-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollObjectDamage(event));
    });
    this.element.querySelectorAll("[data-action='tab']").forEach((tab) => {
      tab.addEventListener("click", (event) => this.#onChangeTab(event));
    });
  }

  #prepareDefenses(actor) {
    return Object.entries(OGRE_GATE.defenses).map(([key, definition]) => ({
      key,
      ...definition,
      data: actor.system.defenses[key]
    }));
  }

  #prepareSkillGroups(actor) {
    return Object.entries(OGRE_GATE.skillGroups).filter(([groupKey]) => groupKey !== "defenses").map(([groupKey, group]) => ({
      key: groupKey,
      label: group.label,
      skills: Object.entries(group.skills).map(([skillKey, label]) => ({
        key: skillKey,
        label,
        data: actor.system.skills[groupKey][skillKey]
      }))
    }));
  }

  #getTargetNumber() {
    const value = Number(this.element.querySelector("[name='roll-tn']")?.value ?? 6);
    return Math.clamp(value, 1, 10);
  }

  #getDamageTarget() {
    const value = Number(this.element.querySelector("[name='damage-tn']")?.value ?? 6);
    return Math.clamp(value, 1, 10);
  }

  #getNumberInput(name, initial = 0, { min = -Infinity, max = Infinity } = {}) {
    const value = Number(this.element.querySelector(`[name='${name}']`)?.value ?? initial);
    return Math.clamp(value, min, max);
  }

  #getRollModifier() {
    const action = OGRE_GATE.combatActions[this.actor.system.combat.action] ?? OGRE_GATE.combatActions.skillAndMove;
    return Number(this.actor.system.combat.situationalDice ?? 0) + Number(action.skill ?? 0);
  }

  #useExpertise() {
    return Boolean(this.element.querySelector("[name='roll-expertise']")?.checked);
  }

  #onRollSkill(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const skill = this.actor.getSkill(button.dataset.group, button.dataset.skill);
    const useExpertise = this.#useExpertise() && skill?.expertise;
    return this.actor.rollSkill(button.dataset.group, button.dataset.skill, {
      tn: this.#getTargetNumber(),
      modifier: this.#getRollModifier() + (useExpertise ? 1 : 0),
      label: useExpertise ? `${skill.label} (${skill.expertise})` : undefined
    });
  }

  #onRollDefense(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const defense = this.actor.system.defenses?.[button.dataset.defense];
    const useExpertise = this.#useExpertise() && defense?.expertise;
    return this.actor.rollDefense(button.dataset.defense, {
      tn: this.#getTargetNumber(),
      modifier: useExpertise ? 1 : 0
    });
  }

  #onRollTurnOrder(event) {
    event.preventDefault();
    return this.actor.rollTurnOrder({ modifier: this.actor.system.combat.situationalDice });
  }

  #onRollWeaponAttack(event) {
    event.preventDefault();
    return this.actor.rollAttackWithWeapon(event.currentTarget.dataset.itemId, {
      tn: this.#getTargetNumber()
    });
  }

  #onRollWeaponDamage(event) {
    event.preventDefault();
    return this.actor.rollWeaponDamage(event.currentTarget.dataset.itemId, {
      hardiness: this.#getDamageTarget(),
      open: Boolean(this.element.querySelector("[name='damage-open']")?.checked),
      modifier: Number(this.element.querySelector("[name='damage-modifier']")?.value ?? 0),
      extraWounds: Number(this.element.querySelector("[name='extra-wounds']")?.value ?? 0)
    });
  }

  #onRollFallingDamage(event) {
    event.preventDefault();
    return this.actor.rollFallingDamage(this.#getNumberInput("fall-distance", 10, { min: 1, max: 1000 }), {
      hardiness: this.#getDamageTarget()
    });
  }

  #onRollFireDamage(event) {
    event.preventDefault();
    return this.actor.rollFireDamage(this.element.querySelector("[name='fire-size']")?.value ?? "torch", {
      hardiness: this.#getDamageTarget()
    });
  }

  #onRollSuffocation(event) {
    event.preventDefault();
    return this.actor.rollSuffocation(this.#getNumberInput("suffocation-rounds", 0, { min: 0, max: 20 }));
  }

  #onRollObjectDamage(event) {
    event.preventDefault();
    return this.actor.rollObjectDamage({
      dice: this.#getNumberInput("object-damage-dice", 1, { min: 0, max: 12 }),
      objectTn: this.#getNumberInput("object-tn", 5, { min: 1, max: 10 }),
      open: Boolean(this.element.querySelector("[name='object-open']")?.checked)
    });
  }

  #onChangeTab(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const group = event.currentTarget.dataset.group;
    this.element.querySelectorAll(`.sheet-tabs [data-group='${group}']`).forEach((link) => {
      link.classList.toggle("active", link.dataset.tab === tab);
    });
    this.element.querySelectorAll(`.sheet-body .tab[data-group='${group}']`).forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tab === tab);
    });
  }
}
