import { OGRE_GATE } from "../config.mjs";
import { prepareCharacterCreation } from "../rules/character-creation.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function getInputValue(input) {
  if (input.type === "checkbox") return input.checked;
  if (input.type === "number") return Number(input.value || 0);
  return input.value;
}

function escapeHtml(value = "") {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

const ACTOR_HELP = {
  rollTn: "Target number for skill, defense, and attack rolls. A kept die equal to or above this number succeeds.",
  expertise: "When checked, defense rolls with a filled Expertise entry gain +1d10 and show the expertise name in chat. Skill Expertise is selected on each skill row.",
  damageTn: "Target number for damage rolls. This usually matches the target's Hardiness.",
  health: "Current Health / Max Health. Damage lowers current Health. Below half Health the actor is Bloodied; at 0 Health the actor is automatically Dying.",
  dyingRounds: "Track rounds spent Dying. The limit shown is based on current Hardiness.",
  qiRank: "Qi rank drives Health, Qi resource maximums, and many martial requirements.",
  imbalance: "Track current imbalance against the maximum. Imbalance Rating equals the highest current Martial Discipline rank.",
  karma: "Hidden GM-only stat from -10 to +10.",
  situationalDice: "Adds or subtracts dice from skill and attack rolls after action, race, and illumination modifiers.",
  situationalDefense: "Adds or subtracts from Parry and Evade after action, cover, and illumination modifiers.",
  damageModifier: "Adds or subtracts dice from the next damage roll.",
  extraWounds: "Adds fixed wounds after a successful damage calculation.",
  openDamage: "Open damage counts every success, rather than only the kept die result.",
  controlledStrike: "Marks the attack as controlled; weapon damage applies the controlled strike wound reduction.",
  deepPenalties: "When enabled, negative pools roll more than 2d10 and keep the lowest.",
  deadlyTens: "When enabled, total successes on attack rolls can add extra wounds.",
  optionalRaceApproved: "Marks the selected non-human race as approved for creation checks.",
  scholarOption: "Uses the scholar-style Knowledge budget during creation checks.",
  kithiriSocialPenalty: "Applies the Kithiri -1d10 penalty to Command, Deception, and Persuade against non-Kithiri targets.",
  ironHeroes: "Uses the Iron Heroes Health formula: Qi x 3 + 3.",
  bonusSkillPoints: "Manual extra skill points added to creation budget checks.",
  applyCreationDefaults: "Applies starting Qi, money, and race-granted ranks where this system can automate them.",
  postCreationSummary: "Posts the current creation checks and race/primary group summary to chat.",
  newFlaw: "Create an embedded Flaw item. Drag/drop flaw items onto the sheet to add them too.",
  newTechnique: "Create an embedded Kung Fu Technique item.",
  newCombatPerk: "Create an embedded Combat Perk item.",
  equipmentDrop: "Drop weapon, armor, and equipment items here. Right-click an item to edit or delete it.",
  editItem: "Open this embedded item for editing.",
  deleteItem: "Remove this embedded item from the actor.",
  rollTurnOrder: "Roll Speed for turn order, including race and situational dice modifiers.",
  falling: "Roll falling damage for the listed distance.",
  fire: "Roll fire damage for the selected fire size.",
  suffocation: "Roll Endurance for the listed suffocation or drowning round.",
  objectDamage: "Roll damage against an object's TN and composition.",
  weaponAttack: "Roll this weapon's attack skill against its target defense.",
  weaponDamage: "Roll this weapon's damage dice against the current Damage TN."
};

const MONEY_LABELS = {
  taels: "Taels",
  imperials: "Imperials",
  spades: "Spades",
  liangs: "Liangs",
  paperCurrency: "Paper Currency"
};

function signed(value, suffix = "") {
  const number = Number(value ?? 0);
  if (!number) return "0";
  return `${number > 0 ? "+" : ""}${number}${suffix}`;
}

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
    const creation = prepareCharacterCreation(actor);
    return {
      ...context,
      actor,
      system: actor.system,
      config: OGRE_GATE,
      help: ACTOR_HELP,
      isGM: game.user.isGM,
      familyRows: this.#prepareFamilyRows(actor),
      moneyRows: this.#prepareMoneyRows(actor),
      creation,
      skillGroups: this.#prepareSkillGroups(actor, creation),
      defenses: this.#prepareDefenses(actor),
      combatActions: this.#prepareCombatActions(),
      attackModes: this.#prepareAttackModes(),
      coverOptions: this.#prepareCoverOptions(),
      illuminationOptions: this.#prepareIlluminationOptions(),
      fireOptions: this.#prepareFireOptions(),
      objectTnOptions: this.#prepareObjectTnOptions(),
      raceOptions: this.#prepareRaceOptions(),
      techniques: actor.items.filter((item) => item.type === "technique"),
      combatTechniques: actor.items.filter((item) => item.type === "combatTechnique"),
      flaws: actor.items.filter((item) => item.type === "flaw"),
      equipment: actor.items.filter((item) => ["weapon", "armor", "equipment"].includes(item.type))
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll("input[name], select[name], textarea[name]").forEach((input) => {
      if (!this.#isActorField(input.name)) return;
      input.addEventListener("change", (event) => this.#onFieldChange(event));
    });
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
    this.element.querySelectorAll("[data-action='apply-creation-defaults']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onApplyCreationDefaults(event));
    });
    this.element.querySelectorAll("[data-action='post-creation-summary']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onPostCreationSummary(event));
    });
    this.element.querySelectorAll("[data-action='create-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onCreateItem(event));
    });
    this.element.querySelectorAll("[data-action='open-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onOpenItem(event));
    });
    this.element.querySelectorAll("[data-action='delete-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onDeleteItem(event));
    });
    this.element.querySelectorAll("[data-action='edit-expertise']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onEditExpertise(event));
    });
    this.element.querySelectorAll(".item-line[data-item-id], .combat-perk-row[data-item-id]").forEach((row) => {
      row.addEventListener("contextmenu", (event) => this.#onItemContextMenu(event));
    });
    this.element.addEventListener("dragover", (event) => event.preventDefault());
    this.element.addEventListener("drop", (event) => this.#onDropItem(event));
    this.element.querySelectorAll("[data-action='tab']").forEach((tab) => {
      tab.addEventListener("click", (event) => this.#onChangeTab(event));
    });
    this.#activateTab(this._activeTab ?? "front", "primary");
  }

  #prepareDefenses(actor) {
    return Object.entries(OGRE_GATE.defenses).map(([key, definition]) => ({
      key,
      ...definition,
      shortLabel: this.#shortSkillLabel(definition.label),
      tooltip: this.#defenseTooltip(definition, actor.system.defenses[key]),
      data: actor.system.defenses[key]
    }));
  }

  #prepareSkillGroups(actor, creation) {
    const budgetRows = Object.fromEntries((creation?.groupRows ?? []).map((row) => [row.key, row]));
    return Object.entries(OGRE_GATE.skillGroups).filter(([groupKey]) => groupKey !== "defenses").map(([groupKey, group]) => ({
      key: groupKey,
      label: group.label,
      budget: budgetRows[groupKey],
      skills: Object.entries(group.skills).map(([skillKey, label]) => ({
        key: skillKey,
        label,
        displayLabel: groupKey === "specialist" ? actor.system.skills[groupKey][skillKey].label : label,
        shortLabel: this.#shortSkillLabel(label),
        tooltip: this.#skillTooltip(actor, groupKey, skillKey, label),
        editableLabel: groupKey === "specialist",
        data: actor.system.skills[groupKey][skillKey]
      }))
    }));
  }

  #prepareCombatActions() {
    return Object.entries(OGRE_GATE.combatActions).map(([key, action]) => ({
      key,
      ...action,
      tooltip: `Action: ${action.label}. Skill dice ${action.skill === null ? "not allowed" : signed(action.skill, "d10")}; defense ${signed(action.defense)}; movement ${action.moves}.`
    }));
  }

  #prepareAttackModes() {
    return Object.entries(OGRE_GATE.attackModes).map(([key, mode]) => ({
      key,
      ...mode,
      tooltip: [
        `Attack mode: ${mode.label}.`,
        `Attack ${signed(mode.attack, "d10")}; damage ${signed(mode.damage, "d10")}; fixed wounds ${signed(mode.extraWounds)}.`,
        mode.openDamage ? "Uses open damage." : "Uses closed damage unless another rule opens it.",
        mode.nonLethal ? "Non-lethal." : "",
        mode.damageDefense ? `Damage TN can use ${OGRE_GATE.defenses[mode.damageDefense]?.label ?? mode.damageDefense}.` : ""
      ].filter(Boolean).join(" ")
    }));
  }

  #prepareCoverOptions() {
    return Object.entries(OGRE_GATE.cover).map(([key, cover]) => ({
      key,
      ...cover,
      tooltip: `Cover: ${cover.label}. Evade ${signed(cover.evade)}; Parry ${signed(cover.parry)}.`
    }));
  }

  #prepareIlluminationOptions() {
    return Object.entries(OGRE_GATE.illumination).map(([key, illumination]) => ({
      key,
      ...illumination,
      tooltip: `Illumination: ${illumination.label}. Skill dice ${signed(illumination.dice, "d10")}; defense ${signed(illumination.defense)}; Stealth ${signed(illumination.stealth)}.`
    }));
  }

  #prepareFireOptions() {
    return Object.entries(OGRE_GATE.fireDamage).map(([key, fire]) => ({
      key,
      ...fire,
      tooltip: `${fire.label}: ${fire.dice}d10 fire damage.`
    }));
  }

  #prepareObjectTnOptions() {
    return Object.entries(OGRE_GATE.objectTns).map(([tn, object]) => ({
      tn,
      ...object,
      tooltip: `Object TN ${tn}: ${object.composition}; Hardiness ${object.hardiness}; Integrity ${object.integrity}; Evade ${object.evade}.`
    }));
  }

  #prepareRaceOptions() {
    return Object.entries(OGRE_GATE.races).map(([key, label]) => {
      const rule = OGRE_GATE.raceRules[key] ?? {};
      return {
        key,
        label,
        tooltip: `${label}. Advantages: ${rule.advantages ?? "None"}. Penalties: ${rule.penalties ?? "None"}. Gift: ${rule.gift ?? "None"}.`
      };
    });
  }

  #prepareFamilyRows(actor) {
    const labels = {
      siblings: "Siblings",
      birthOrder: "Birth Order",
      mother: "Mother",
      father: "Father",
      sisters: "Sisters",
      brothers: "Brothers",
      swornFamily: "Sworn Family",
      others: "Others"
    };
    return Object.entries(labels).map(([key, label]) => ({
      key,
      label,
      value: actor.system.family[key] ?? ""
    }));
  }

  #prepareMoneyRows(actor) {
    return Object.entries(MONEY_LABELS).map(([key, label]) => ({
      key,
      label,
      value: actor.system.money[key] ?? "",
      type: key === "paperCurrency" ? "text" : "number"
    }));
  }

  #defenseTooltip(definition, defense) {
    return [
      `Roll ${definition.label}: ranks ${defense.ranks} + modifier ${signed(defense.modifier, "d10")}.`,
      `Rating is Base ${defense.base} + Rank ${defense.ranks} + Qi ${defense.qiBonus} + Mod ${signed(defense.modifier)} = ${defense.rating}.`,
      definition.relevant?.length ? `Relevant against: ${definition.relevant.join(", ")}.` : ""
    ].filter(Boolean).join(" ");
  }

  #skillTooltip(actor, groupKey, skillKey, label) {
    const skill = actor.system.skills[groupKey][skillKey];
    const raceModifier = actor.getRaceSkillModifier(groupKey, skillKey);
    const baseKey = skillKey.replace(/[0-9]+$/, "");
    const description = OGRE_GATE.skillDescriptions[baseKey] ?? OGRE_GATE.skillDescriptions[skillKey] ?? "Use this skill when the situation matches its specialty.";
    const expertise = skill.expertise ? `Expertise: ${skill.expertise}.` : "No Expertise selected yet.";
    return [
      `${label}: ${description}`,
      `Roll pool: ranks ${skill.ranks} + modifier ${signed(skill.modifier, "d10")}.`,
      raceModifier ? `Current race modifier: ${signed(raceModifier, "d10")}.` : "",
      expertise,
      "Situational dice, action, illumination, and Expertise may also modify the roll.",
      "At 0d10 or lower, roll 2d10 and keep the lowest unless Deep Penalties is enabled."
    ].filter(Boolean).join(" ");
  }

  #shortSkillLabel(label) {
    const words = String(label ?? "").split(/[ /-]+/).filter(Boolean);
    if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
    return String(label ?? "").slice(0, 3).toUpperCase();
  }

  #isActorField(name) {
    return name === "name" || name.startsWith("system.");
  }

  #getActorFieldUpdates() {
    const updates = {};
    this.element.querySelectorAll("input[name], select[name], textarea[name]").forEach((input) => {
      if (input.disabled || !this.#isActorField(input.name)) return;
      updates[input.name] = getInputValue(input);
    });
    return updates;
  }

  async #submitActorFields() {
    const updates = this.#getActorFieldUpdates();
    if (!Object.keys(updates).length) return {};
    await this.actor.update(updates);
    return updates;
  }

  #onFieldChange(event) {
    const input = event.currentTarget;
    return this.actor.update({ [input.name]: getInputValue(input) });
  }

  async #promptTargetNumber(label, initial = 6) {
    return new Promise((resolve) => {
      new Dialog({
        title: `${label} TN`,
        content: `
          <form class="ogre-gate-dialog">
            <label>Target Number
              <input type="number" name="tn" value="${Math.clamp(Number(initial ?? 6), 1, 10)}" min="1" max="10" autofocus />
            </label>
          </form>
        `,
        buttons: {
          roll: {
            label: "Roll",
            callback: (html) => {
              const root = html instanceof HTMLElement ? html : html?.[0];
              const value = Number(root?.querySelector("[name='tn']")?.value ?? initial);
              resolve(Math.clamp(value, 1, 10));
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }).render(true);
    });
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

  async #onRollSkill(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const button = event.currentTarget;
    const skill = this.actor.getSkill(button.dataset.group, button.dataset.skill);
    const useInlineExpertise = Boolean(this.element.querySelector(`[data-expertise-toggle='${button.dataset.group}.${button.dataset.skill}']`)?.checked);
    const useExpertise = useInlineExpertise && skill?.expertise;
    const label = button.dataset.label || skill?.label;
    const tn = await this.#promptTargetNumber(label, 6);
    if (!tn) return null;
    return this.actor.rollSkill(button.dataset.group, button.dataset.skill, {
      tn,
      modifier: this.#getRollModifier() + (useExpertise ? 1 : 0),
      label: useExpertise ? `${label} (${skill.expertise})` : label
    });
  }

  async #onRollDefense(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const button = event.currentTarget;
    const defense = this.actor.system.defenses?.[button.dataset.defense];
    const useExpertise = this.#useExpertise() && defense?.expertise;
    const tn = await this.#promptTargetNumber(defense?.label ?? "Defense", 6);
    if (!tn) return null;
    return this.actor.rollDefense(button.dataset.defense, {
      tn,
      modifier: useExpertise ? 1 : 0
    });
  }

  async #onRollTurnOrder(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.rollTurnOrder({ modifier: this.actor.system.combat.situationalDice });
  }

  async #onRollWeaponAttack(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    const tn = await this.#promptTargetNumber(item?.name ?? "Weapon Attack", 6);
    if (!tn) return null;
    return this.actor.rollAttackWithWeapon(event.currentTarget.dataset.itemId, {
      tn
    });
  }

  async #onRollWeaponDamage(event) {
    event.preventDefault();
    await this.#submitActorFields();
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

  async #onApplyCreationDefaults(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const updates = await this.actor.applyCreationDefaults();
    const count = Object.keys(updates).length;
    if (count) ui.notifications.info(`Applied ${count} creation default(s).`);
    else ui.notifications.info("Creation defaults were already satisfied.");
  }

  async #onPostCreationSummary(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.postCreationSummary();
  }

  async #onEditExpertise(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const groupKey = button.dataset.group;
    const skillKey = button.dataset.skill;
    const skill = this.actor.getSkill(groupKey, skillKey);
    if (!skill) return null;

    return new Promise((resolve) => {
      new Dialog({
        title: `${button.dataset.label ?? skill.label} Expertise`,
        content: `
          <form class="ogre-gate-dialog">
            <label>Expertise
              <input type="text" name="expertise" value="${escapeHtml(skill.expertise ?? "")}" autofocus />
            </label>
            <label>Note
              <input type="text" name="expertiseNote" value="${escapeHtml(skill.expertiseNote ?? "")}" />
            </label>
          </form>
        `,
        buttons: {
          save: {
            label: "Save",
            callback: async (html) => {
              const root = html instanceof HTMLElement ? html : html?.[0];
              await this.actor.update({
                [`system.skills.${groupKey}.${skillKey}.expertise`]: root?.querySelector("[name='expertise']")?.value ?? "",
                [`system.skills.${groupKey}.${skillKey}.expertiseNote`]: root?.querySelector("[name='expertiseNote']")?.value ?? ""
              });
              resolve(true);
            }
          },
          clear: {
            label: "Clear",
            callback: async () => {
              await this.actor.update({
                [`system.skills.${groupKey}.${skillKey}.expertise`]: "",
                [`system.skills.${groupKey}.${skillKey}.expertiseNote`]: ""
              });
              resolve(true);
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "save",
        close: () => resolve(false)
      }).render(true);
    });
  }

  async #onCreateItem(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    if (!type) return;

    const label = OGRE_GATE.itemTypes[type] ?? "Item";
    const [item] = await this.actor.createEmbeddedDocuments("Item", [{
      name: `New ${label}`,
      type
    }]);
    item?.sheet?.render(true);
  }

  #onOpenItem(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    return item?.sheet?.render(true);
  }

  async #onDeleteItem(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    if (!item) return;
    const confirmed = await Dialog.confirm({
      title: `Delete ${item.name}?`,
      content: `<p>Remove <strong>${item.name}</strong> from ${this.actor.name}?</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
    if (!confirmed) return;
    return item.delete();
  }

  async #onItemContextMenu(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    if (!item) return;
    return new Dialog({
      title: item.name,
      content: `<p>Choose an action for <strong>${item.name}</strong>.</p>`,
      buttons: {
        edit: {
          label: "Edit",
          callback: () => item.sheet.render(true)
        },
        delete: {
          label: "Delete",
          callback: async () => {
            const confirmed = await Dialog.confirm({
              title: `Delete ${item.name}?`,
              content: `<p>Remove <strong>${item.name}</strong> from ${this.actor.name}?</p>`,
              yes: () => true,
              no: () => false,
              defaultYes: false
            });
            if (confirmed) await item.delete();
          }
        }
      },
      default: "edit"
    }).render(true);
  }

  async #onDropItem(event) {
    event.preventDefault();
    const raw = event.dataTransfer?.getData("text/plain");
    if (!raw) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch (_error) {
      return;
    }

    if (data.type !== "Item") return;

    const item = await Item.implementation.fromDropData(data);
    if (!item) return;

    const itemData = item.toObject();
    delete itemData._id;
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info(`Added ${item.name} to ${this.actor.name}.`);
  }

  #activateTab(tab, group) {
    this.element.querySelectorAll(`.sheet-tabs [data-group='${group}']`).forEach((link) => {
      link.classList.toggle("active", link.dataset.tab === tab);
    });
    this.element.querySelectorAll(`.sheet-body .tab[data-group='${group}']`).forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tab === tab);
    });
  }

  #onChangeTab(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const group = event.currentTarget.dataset.group;
    this._activeTab = tab;
    this.#activateTab(tab, group);
  }
}
