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
  pendingDamageBonus: "Damage bonus dice from attack total successes. Use the button on an attack chat card to fill this, or enter it manually. The next weapon damage roll consumes it.",
  preparedStrike: "Ready one attack against a designated zone and trigger. The system tracks whether it is armed and posts the reminder to chat.",
  charge: "Checks charge distance, straight-line movement, mounted charge follow-through, mounted bow penalties, and moving-mount Cathartic Imbalance.",
  drain: "Temporary drains reduce skill ranks, defense ratings, or effective Qi. Temporary drain usually recovers one point per day unless a rule says otherwise.",
  healing: "Heal a manual amount, apply natural healing, or roll Medicine/Meditation to stabilize a dying character.",
  affliction: "Drop Poisons or Diseases anywhere on this sheet to track them. Select one affliction here for exposure, progression, treatment, and remedies; other tracked afflictions remain active and their penalties still apply.",
  health: "Current Health / Max Health. Damage lowers current Health. Below half Health the actor is Bloodied; at 0 Health the actor is automatically Dying.",
  dyingRounds: "Track rounds spent Dying. The limit shown is based on current Hardiness.",
  qiRank: "Qi rank drives Health, Qi resource maximums, and many martial requirements.",
  imbalance: "Imbalance Rating equals your highest Martial Discipline rank. Cathartic Kung Fu use adds points; at 12 + Qi you risk Qi Spirit Possession.",
  meditateImbalance: "Meditation removes 1 Imbalance per Qi level per hour without a roll. With zero Meditation ranks, it removes 1 point per two hours.",
  possession: "At maximum Imbalance, roll for a Qi Spirit. While possessed, you cannot recover Imbalance until purged and must roll Meditation each day against TN 7 + Imbalance Rating.",
  demonFlaw: "Roll 1d100 on the Demon Flaw Table when mastering an Evil Technique. Demon Flaws gained this way are permanent.",
  useTechnique: "Roll the technique's Activation Skill normally. Counters are off-turn reactions; target the attacker to enforce the Qi rule.",
  catharticTechnique: "Use the technique Cathartically. Success gains Imbalance equal to Rating, failure gains Rating + 2, and Total Success gains none. Counters against equal-or-higher Qi attackers require Cathartic use unless the entry says otherwise.",
  qiDuel: "Target an opposing actor and resolve one Qi Duel round. A Qi disparity greater than 1 prevents a duel; tied rounds add 2 Extra Wounds to the eventual result.",
  karma: "Hidden GM-only stat from -10 to +10.",
  situationalDice: "Adds or subtracts dice from skill and attack rolls after action, race, and illumination modifiers.",
  situationalDefense: "Adds or subtracts from Parry and Evade after action, cover, and illumination modifiers.",
  damageModifier: "Adds or subtracts dice from the next damage roll.",
  extraWounds: "Adds fixed wounds after a successful damage calculation.",
  openDamage: "Open damage counts every success, rather than only the kept die result.",
  controlledStrike: "Marks the attack as controlled; weapon damage applies the controlled strike wound reduction.",
  systemRules: "These are world-level system settings configured by the GM in Foundry settings.",
  optionalRaceApproved: "Marks the selected non-human race as approved for creation checks.",
  scholarOption: "Uses the scholar-style Knowledge budget during creation checks.",
  kithiriSocialPenalty: "Applies the Kithiri -1d10 penalty to Command, Deception, and Persuade against non-Kithiri targets.",
  ironHeroes: "Uses the Iron Heroes Health formula: Qi x 3 + 3.",
  bonusSkillPoints: "Manual extra skill points added to creation budget checks.",
  applyCreationDefaults: "Applies starting Qi, money, and race-granted ranks where this system can automate them.",
  postCreationSummary: "Posts the current creation checks and race/primary group summary to chat.",
  newFlaw: "Create an embedded Flaw item. Drag/drop flaw items onto the sheet to add them too.",
  newSkill: "Create an embedded Skill item in this group. Drag/drop Skills items onto the sheet to add them too.",
  newGear: "Create an embedded Equipment item.",
  newSubstance: "Create an embedded Substance item with prepared dose tracking.",
  longevity: "Life Prolonging Pill use inflicts 1 Wound and 1d10 Imbalance. Ten consecutive days grant 1d10 additional years; every later use reduces life expectancy by one year.",
  newTechnique: "Create an embedded Kung Fu Technique item.",
  newCombatPerk: "Create an embedded Combat Perk item.",
  equipmentDrop: "Drop weapon, armor, equipment, and substance items here. Right-click an item to edit or delete it.",
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

function stripHtml(value = "") {
  const div = document.createElement("div");
  div.innerHTML = String(value ?? "");
  return div.textContent?.trim() ?? "";
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stanceNeedsActivationRoll(item, cathartic = false) {
  return Boolean(cathartic) || /requires a skill roll to use non-Cathartically|requires a skill roll/i.test(item?.system?.description ?? "");
}

function techniqueRequiresCatharticUse(item) {
  const type = normalizeKey(item?.system?.techniqueType ?? "");
  const group = normalizeKey(item?.flags?.ogregatefoundry?.group ?? "");
  return ["profound", "immortal"].includes(type) || ["profound", "evil", "immortal"].includes(group);
}

function isEvilTechnique(itemOrData) {
  return normalizeKey(itemOrData?.flags?.[OGRE_GATE.id]?.group ?? itemOrData?.flags?.ogregatefoundry?.group ?? "") === "evil";
}

function techniqueDisciplineRequirement(actor, item) {
  const disciplineKey = item?.system?.discipline ?? "";
  if (!["waijia", "qinggong", "neigong", "dianxue"].includes(disciplineKey)) return null;
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

function formationParticipants(item) {
  const listed = Number(item?.system?.formationParticipants ?? 0);
  if (listed) return listed;
  const text = `${item?.name ?? ""} ${item?.system?.description ?? ""}`;
  if (/six people|six practitioners/i.test(text)) return 6;
  if (/two practitioners|pair up|two or more participants|requires two/i.test(text)) return 2;
  return 0;
}

function formationTooltip(item) {
  if (!isFormationTechnique(item)) return "";
  const participants = formationParticipants(item);
  return item?.system?.formationNotes
    || (participants ? `Requires at least ${participants} participants. Formation can be broken by a Total Success attack against it.` : "Formation can be broken by a Total Success attack against it.");
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

function actorHasFlaw(actor, flawName) {
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
    if (!actorHasFlaw(actor, flaw)) missing.push(`Flaw: ${flaw}`);
  }
  for (const requirement of techniqueRequiredSkillRanks(item)) {
    const skill = actor.findSkillPath(requirement.skillRef);
    const ranks = effectiveRanks(skill?.skill);
    if (ranks < requirement.ranks) missing.push(`${requirement.skillRef} ${requirement.ranks}`);
  }
  return missing;
}

function getFirstTargetActor() {
  return Array.from(game.user?.targets ?? []).find((token) => token?.actor)?.actor ?? null;
}

function getSkillIdentity(itemData) {
  const system = itemData?.system ?? {};
  return `${system.group ?? ""}:${normalizeKey(system.skillKey || itemData?.name || "")}`;
}

function resolveDroppedSkillGroup(itemData, fallbackGroup = "") {
  const currentGroup = itemData?.system?.group ?? "";
  if (currentGroup && currentGroup !== "defenses" && OGRE_GATE.skillGroups[currentGroup]) return currentGroup;

  const normalizedSkill = normalizeKey(itemData?.system?.skillKey || itemData?.name || "");
  for (const [groupKey, group] of Object.entries(OGRE_GATE.skillGroups)) {
    if (groupKey === "defenses") continue;
    const match = Object.entries(group.skills).some(([skillKey, label]) => (
      normalizeKey(skillKey) === normalizedSkill || normalizeKey(label) === normalizedSkill
    ));
    if (match) return groupKey;
  }

  if (fallbackGroup && fallbackGroup !== "defenses" && OGRE_GATE.skillGroups[fallbackGroup]) return fallbackGroup;
  return "specialist";
}

function effectiveRanks(entry) {
  return Math.max(0, Number(entry?.ranks ?? 0) - Number(entry?.drain ?? 0));
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
    this._collapsedSkillGroups ??= new Set();
    return {
      ...context,
      actor,
      system: actor.system,
      config: OGRE_GATE,
      martialDisciplines: Object.entries(OGRE_GATE.disciplines)
        .filter(([key]) => !["none", "multiple"].includes(key))
        .map(([key, label]) => ({ key, label })),
      help: ACTOR_HELP,
      isGM: game.user.isGM,
      familyRows: this.#prepareFamilyRows(actor),
      moneyRows: this.#prepareMoneyRows(actor),
      creation,
      defenseBudget: creation.groupRows.find((row) => row.key === "defenses"),
      systemRules: {
        deepPenalties: game.settings.get(OGRE_GATE.id, "deepPenalties"),
        deadlyTens: game.settings.get(OGRE_GATE.id, "deadlyTens")
      },
      skillGroups: this.#prepareSkillGroups(actor, creation),
      defenses: this.#prepareDefenses(actor),
      combatActions: this.#prepareCombatActions(),
      attackModes: this.#prepareAttackModes(),
      selectedAttackMode: this.#prepareSelectedAttackMode(actor),
      preparedStrikeStatus: actor.system.preparedStrike.ready ? "Armed" : "Not Armed",
      activeStance: this.#prepareActiveStance(actor),
      coverOptions: this.#prepareCoverOptions(),
      illuminationOptions: this.#prepareIlluminationOptions(),
      afflictionTypes: this.#prepareAfflictionTypes(),
      afflictionIntervals: this.#prepareAfflictionIntervals(),
      activeDrains: this.#prepareActiveDrains(actor),
      fireOptions: this.#prepareFireOptions(),
      objectTnOptions: this.#prepareObjectTnOptions(),
      raceOptions: this.#prepareRaceOptions(),
      techniqueGroups: this.#prepareTechniqueGroups(actor),
      possessionTn: 7 + Number(actor.system.status.imbalanceRating ?? 0),
      qiDuelStoredWounds: Number(actor.system.qiDuel.ties ?? 0) * 2,
      possessionControlLabel: {
        unchecked: "Not Rolled",
        self: "Character in Control",
        spirit: "Spirit in Control"
      }[actor.system.imbalance.possessionControl] ?? "Not Rolled",
      combatTechniques: actor.items.filter((item) => item.type === "combatTechnique"),
      flaws: actor.items.filter((item) => item.type === "flaw"),
      equipment: actor.items.filter((item) => ["weapon", "armor", "equipment", "substance"].includes(item.type))
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._ogreGateListeners?.abort();
    this._ogreGateListeners = new AbortController();
    const listenerOptions = { signal: this._ogreGateListeners.signal };
    this.element.querySelectorAll("input[name], select[name], textarea[name]").forEach((input) => {
      if (!this.#isActorField(input.name)) return;
      input.addEventListener("change", (event) => this.#onFieldChange(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-item-field]").forEach((input) => {
      input.addEventListener("change", (event) => this.#onItemFieldChange(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-skill']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollSkill(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-defense']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollDefense(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-turn-order']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollTurnOrder(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-weapon-attack']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollWeaponAttack(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-weapon-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollWeaponDamage(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-technique']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollTechnique(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='maintain-stance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onMaintainStance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='end-stance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onEndStance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='meditate-imbalance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onMeditateImbalance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='check-possession']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onCheckPossession(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-possession-control']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollPossessionControl(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='purge-possession']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onPurgePossession(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-demon-flaw']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollDemonFlaw(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='resolve-qi-duel']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onResolveQiDuel(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='clear-qi-duel']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onClearQiDuel(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='apply-substance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onApplySubstance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-falling-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollFallingDamage(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-fire-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollFireDamage(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-suffocation']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollSuffocation(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-object-damage']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollObjectDamage(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='arm-prepared-strike']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onArmPreparedStrike(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='clear-prepared-strike']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onClearPreparedStrike(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='validate-charge']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onValidateCharge(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='treat-affliction']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onTreatAffliction(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='roll-affliction-exposure']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRollAfflictionExposure(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='advance-affliction-progression']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onAdvanceAfflictionProgression(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='advance-affliction-lethality']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onAdvanceAfflictionLethality(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='clear-affliction-substances']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onClearAfflictionSubstances(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='expire-affliction-substance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onExpireAfflictionSubstance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='select-affliction']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onSelectAffliction(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='remove-selected-affliction']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRemoveSelectedAffliction(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='remove-additional-affliction']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRemoveAdditionalAffliction(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='expire-active-substance']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onExpireActiveSubstance(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='reset-life-pill-streak']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onResetLifePillStreak(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='heal-wounds']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onHealWounds(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='natural-healing']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onNaturalHealing(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='stabilize-dying']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onStabilizeDying(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='apply-drain']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onApplyDrain(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='recover-drain']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onRecoverDrain(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='toggle-skill-group']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onToggleSkillGroup(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='apply-creation-defaults']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onApplyCreationDefaults(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='post-creation-summary']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onPostCreationSummary(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='create-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onCreateItem(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='open-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onOpenItem(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='delete-item']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onDeleteItem(event), listenerOptions);
    });
    this.element.querySelectorAll("[data-action='edit-expertise']").forEach((button) => {
      button.addEventListener("click", (event) => this.#onEditExpertise(event), listenerOptions);
    });
    this.element.querySelectorAll(".item-line[data-item-id], .combat-perk-row[data-item-id]").forEach((row) => {
      row.addEventListener("contextmenu", (event) => this.#onItemContextMenu(event), listenerOptions);
    });
    this.element.addEventListener("dragover", (event) => event.preventDefault(), listenerOptions);
    this.element.addEventListener("drop", (event) => this.#onDropItem(event), { ...listenerOptions, capture: true });
    this.element.querySelectorAll("[data-action='tab']").forEach((tab) => {
      tab.addEventListener("click", (event) => this.#onChangeTab(event), listenerOptions);
    });
    this.#activateTab(this._activeTab ?? "front", "primary");
    this.#restoreSheetScroll();
  }

  #prepareDefenses(actor) {
    return Object.entries(OGRE_GATE.defenses).map(([key, definition]) => {
      const data = actor.system.defenses[key];
      const armorBonus = actor.getArmorDefenseBonus(key);
      const substanceModifier = actor.getActiveSubstanceDefenseModifier(key);
      const rating = Math.clamp(Number(data.rating ?? 0) + armorBonus + substanceModifier, 0, 10);
      return {
        key,
        ...definition,
        shortLabel: this.#shortSkillLabel(definition.label),
        tooltip: this.#defenseTooltip(definition, data, armorBonus, substanceModifier, rating),
        rating,
        armorBonus,
        substanceModifier,
        data
      };
    });
  }

  #prepareSkillGroups(actor, creation) {
    const budgetRows = Object.fromEntries((creation?.groupRows ?? []).map((row) => [row.key, row]));
    return Object.entries(OGRE_GATE.skillGroups).filter(([groupKey]) => groupKey !== "defenses").map(([groupKey, group]) => ({
      key: groupKey,
      label: group.label,
      collapsed: this._collapsedSkillGroups?.has(groupKey) ?? false,
      budget: budgetRows[groupKey],
      skills: Array.from(new Map(actor.items
        .filter((item) => item.type === "skills" && item.system.group === groupKey)
        .map((item) => [getSkillIdentity(item.toObject()), item])).values()).map((item) => {
        const skill = item.system;
        const expertiseEntries = getExpertiseEntries(skill).map((expertise) => ({
          ...expertise,
          toggleKey: item.id
        }));
        const description = stripHtml(skill.description);
        return {
          item,
          key: item.id,
          label: item.name,
          displayLabel: item.name,
          shortLabel: this.#shortSkillLabel(item.name),
          tooltip: this.#skillTooltip(item, description),
          expertiseEntries,
          hasExpertise: expertiseEntries.length > 0,
          data: skill
        };
      })
    }));
  }

  #prepareCombatActions() {
    return Object.entries(OGRE_GATE.combatActions).map(([key, action]) => ({
      key,
      ...action,
      tooltip: `Action: ${action.label}. Skill dice ${action.skill === null ? "not allowed" : signed(action.skill, "d10")}; defense ${signed(action.defense)}; movement ${action.moves}.`
    }));
  }

  #prepareTechniqueGroups(actor) {
    const techniques = actor.items.filter((item) => item.type === "technique");
    return Object.entries(OGRE_GATE.techniqueTypes).map(([key, label]) => ({
      key,
      label,
      items: techniques.filter((item) => (item.system.techniqueType || "normal") === key)
        .map((item) => {
          const prerequisites = techniquePrerequisites(item);
          const missingPrerequisites = missingTechniquePrerequisites(actor, item);
          const requiredFlaws = techniqueRequiredFlaws(item);
          const requiredSkillRanks = techniqueRequiredSkillRanks(item);
          const missingActorRequirements = missingTechniqueActorRequirements(actor, item);
          const disciplineRequirement = techniqueDisciplineRequirement(actor, item);
          return {
            item,
            damage: this.#prepareTechniqueDamage(item, actor),
            catharticOnly: techniqueRequiresCatharticUse(item),
            demonFlaw: isEvilTechnique(item),
            disciplineRequirement,
            missingDiscipline: disciplineRequirement?.missing,
            disciplineTooltip: disciplineRequirement
              ? `${disciplineRequirement.label} ${disciplineRequirement.ranks} rank${disciplineRequirement.ranks === 1 ? "" : "s"}; at least 1 rank is required to use this technique.`
              : "",
            formation: isFormationTechnique(item),
            formationParticipants: formationParticipants(item),
            formationTooltip: formationTooltip(item),
            combination: isCombinationTechnique(item),
            prerequisiteTooltip: prerequisites.length ? `Requires: ${prerequisites.join(", ")}` : "",
            missingPrerequisites,
            missingPrerequisiteTooltip: missingPrerequisites.length ? `Missing: ${missingPrerequisites.join(", ")}` : "",
            requiredFlaws,
            requiredSkillRanks,
            actorRequirementTooltip: [
              requiredFlaws.length ? `Required Flaws: ${requiredFlaws.join(", ")}` : "",
              requiredSkillRanks.length ? `Required Skill Ranks: ${requiredSkillRanks.map((entry) => `${entry.skillRef} ${entry.ranks}`).join(", ")}` : ""
            ].filter(Boolean).join(" | "),
            missingActorRequirements,
            missingActorRequirementTooltip: missingActorRequirements.length ? `Missing: ${missingActorRequirements.join(", ")}` : "",
            requirementNotes: techniqueRequirementNotes(item),
            secret: Boolean(item.system.secret ?? item.flags?.ogregatefoundry?.secret),
            accessNotes: techniqueAccessNotes(item)
          };
        })
    }));
  }

  #prepareActiveStance(actor) {
    const name = actor.system.combat.activeStanceName;
    if (!name) return null;
    const item = actor.system.combat.activeStanceId ? actor.items.get(actor.system.combat.activeStanceId) : null;
    return {
      id: actor.system.combat.activeStanceId,
      name,
      cathartic: Boolean(actor.system.combat.activeStanceCathartic),
      rounds: Number(actor.system.combat.activeStanceRounds ?? 0),
      notes: actor.system.combat.activeStanceNotes,
      formation: isFormationTechnique(item),
      formationParticipants: formationParticipants(item),
      formationTooltip: formationTooltip(item),
      itemMissing: Boolean(actor.system.combat.activeStanceId && !item),
      tooltip: item ? stripHtml(item.system.description) : actor.system.combat.activeStanceNotes
    };
  }

  #prepareTechniqueDamage(item, actor) {
    const raw = String(item.system.damage ?? "").trim();
    const directWounds = String(item.system.directWounds ?? "").trim();
    const totalSuccessDirectWounds = String(item.system.totalSuccessDirectWounds ?? "").trim();
    const catharticDirectWounds = String(item.system.catharticDirectWounds ?? "").trim();
    const catharticTotalSuccessDirectWounds = String(item.system.catharticTotalSuccessDirectWounds ?? "").trim();
    const directWoundsNote = String(item.system.directWoundsNote ?? "").trim();
    const targetDrains = String(item.system.targetDrains ?? "").trim();
    const totalSuccessTargetDrains = String(item.system.totalSuccessTargetDrains ?? "").trim();
    const catharticTargetDrains = String(item.system.catharticTargetDrains ?? "").trim();
    const catharticTotalSuccessTargetDrains = String(item.system.catharticTotalSuccessTargetDrains ?? "").trim();
    const targetDrainsNote = String(item.system.targetDrainsNote ?? "").trim();
    const targetEffects = String(item.system.targetEffects ?? "").trim();
    const totalSuccessTargetEffects = String(item.system.totalSuccessTargetEffects ?? "").trim();
    const catharticTargetEffects = String(item.system.catharticTargetEffects ?? "").trim();
    const catharticTotalSuccessTargetEffects = String(item.system.catharticTotalSuccessTargetEffects ?? "").trim();
    const targetEffectsNote = String(item.system.targetEffectsNote ?? "").trim();
    const selfWounds = Number(item.system.selfWounds ?? 0);
    const catharticSelfWounds = Number(item.system.catharticSelfWounds ?? 0);
    const catharticImbalanceMultiplier = Number(item.system.catharticImbalanceMultiplier ?? 1);
    const consequenceNote = String(item.system.consequenceNote ?? "").trim();
    const directWoundsLabel = [
      directWounds ? `Direct ${directWounds} W` : "",
      totalSuccessDirectWounds ? `TS ${totalSuccessDirectWounds} W` : "",
      catharticDirectWounds ? `Cathartic ${catharticDirectWounds} W` : "",
      catharticTotalSuccessDirectWounds ? `Cathartic TS ${catharticTotalSuccessDirectWounds} W` : ""
    ].filter(Boolean).join(" | ");
    const consequenceLabel = [
      selfWounds ? `User ${selfWounds} W` : "",
      catharticSelfWounds ? `Cathartic User ${catharticSelfWounds} W` : "",
      catharticImbalanceMultiplier > 1 ? `Cathartic Imbalance x${catharticImbalanceMultiplier}` : ""
    ].filter(Boolean).join(" | ");
    const targetDrainsLabel = [
      targetDrains ? `Drain ${targetDrains}` : "",
      totalSuccessTargetDrains ? `TS Drain ${totalSuccessTargetDrains}` : "",
      catharticTargetDrains ? `Cathartic Drain ${catharticTargetDrains}` : "",
      catharticTotalSuccessTargetDrains ? `Cathartic TS Drain ${catharticTotalSuccessTargetDrains}` : ""
    ].filter(Boolean).join(" | ");
    const targetEffectsLabel = [
      targetEffects ? `Effect: ${targetEffects}` : "",
      totalSuccessTargetEffects ? `TS Effect: ${totalSuccessTargetEffects}` : "",
      catharticTargetEffects ? `Cathartic Effect: ${catharticTargetEffects}` : "",
      catharticTotalSuccessTargetEffects ? `Cathartic TS Effect: ${catharticTotalSuccessTargetEffects}` : ""
    ].filter(Boolean).join(" | ");
    if (!raw) {
      if (directWoundsLabel || targetDrainsLabel || targetEffectsLabel || consequenceLabel) {
        return {
          label: [directWoundsLabel, targetDrainsLabel, targetEffectsLabel, consequenceLabel].filter(Boolean).join(" | "),
          tooltip: [directWoundsLabel, directWoundsNote, targetDrainsLabel, targetDrainsNote, targetEffectsLabel, targetEffectsNote, consequenceLabel, consequenceNote].filter(Boolean).join(" | ")
        };
      }
      return {
        label: "No Damage",
        tooltip: `${item.name} does not list a damage roll.`
      };
    }

    const parsed = this.#resolveTechniqueDamageDice(raw, actor);
    if (!parsed) {
      return {
        label: "Damage: See Text",
        tooltip: raw
      };
    }

    if (parsed.normal) {
      const damageModifier = Number(item.system.damageModifier ?? 0);
      const catharticDamageModifier = Number(item.system.catharticDamageModifier ?? 0);
      const extraWounds = Number(item.system.extraWounds ?? 0);
      const catharticExtraWounds = Number(item.system.catharticExtraWounds ?? 0);
      const modifiers = [
        damageModifier ? ` ${damageModifier > 0 ? "+" : ""}${damageModifier}d10` : "",
        catharticDamageModifier ? ` (${catharticDamageModifier > 0 ? "+" : ""}${catharticDamageModifier} Cathartic d10)` : "",
        extraWounds ? ` + ${extraWounds} W` : "",
        catharticExtraWounds ? ` (+${catharticExtraWounds} Cathartic W)` : ""
      ].filter(Boolean).join("");
      return {
        label: `Damage: Normal${modifiers}${directWoundsLabel ? ` | ${directWoundsLabel}` : ""}${targetDrainsLabel ? ` | ${targetDrainsLabel}` : ""}${targetEffectsLabel ? ` | ${targetEffectsLabel}` : ""}${consequenceLabel ? ` | ${consequenceLabel}` : ""}`,
        tooltip: [
          raw,
          parsed.note,
          damageModifier ? `Applies ${damageModifier > 0 ? "+" : ""}${damageModifier}d10 to the normal damage roll.` : "",
          catharticDamageModifier ? `Applies ${catharticDamageModifier > 0 ? "+" : ""}${catharticDamageModifier}d10 more damage when used Cathartically.` : "",
          extraWounds ? `Adds ${extraWounds} fixed Extra Wound${extraWounds === 1 ? "" : "s"}.` : "",
          catharticExtraWounds ? `Adds ${catharticExtraWounds} more fixed Extra Wound${catharticExtraWounds === 1 ? "" : "s"} when used Cathartically.` : "",
          directWoundsLabel,
          directWoundsNote,
          targetDrainsLabel,
          targetDrainsNote,
          targetEffectsLabel,
          targetEffectsNote,
          consequenceLabel,
          consequenceNote
        ].filter(Boolean).join(" | ")
      };
    }

    const normalOpen = Boolean(item.system.openDamage);
    const catharticOpen = Boolean(item.system.catharticOpenDamage);
    const damageModifier = Number(item.system.damageModifier ?? 0);
    const catharticDamageModifier = Number(item.system.catharticDamageModifier ?? 0);
    const openLabel = normalOpen
      ? " Open"
      : catharticOpen
        ? " (Cathartic Open)"
        : "";
    const extraWounds = Number(item.system.extraWounds ?? 0);
    const catharticExtraWounds = Number(item.system.catharticExtraWounds ?? 0);
    const woundsLabel = [
      damageModifier ? ` ${damageModifier > 0 ? "+" : ""}${damageModifier}d10` : "",
      catharticDamageModifier ? ` (${catharticDamageModifier > 0 ? "+" : ""}${catharticDamageModifier} Cathartic d10)` : "",
      extraWounds ? ` + ${extraWounds} W` : "",
      catharticExtraWounds ? ` (+${catharticExtraWounds} Cathartic W)` : ""
    ].filter(Boolean).join("");
    return {
      label: `Damage: ${parsed.dice}d10${openLabel}${woundsLabel}${directWoundsLabel ? ` | ${directWoundsLabel}` : ""}${targetDrainsLabel ? ` | ${targetDrainsLabel}` : ""}${targetEffectsLabel ? ` | ${targetEffectsLabel}` : ""}${consequenceLabel ? ` | ${consequenceLabel}` : ""}`,
      tooltip: [
        raw,
        parsed.note,
        catharticOpen && !normalOpen ? "Damage becomes Open when used Cathartically." : "",
        damageModifier ? `Applies ${damageModifier > 0 ? "+" : ""}${damageModifier}d10 to technique damage.` : "",
        catharticDamageModifier ? `Applies ${catharticDamageModifier > 0 ? "+" : ""}${catharticDamageModifier}d10 more damage when used Cathartically.` : "",
        extraWounds ? `Adds ${extraWounds} fixed Extra Wound${extraWounds === 1 ? "" : "s"}.` : "",
        catharticExtraWounds ? `Adds ${catharticExtraWounds} more fixed Extra Wound${catharticExtraWounds === 1 ? "" : "s"} when used Cathartically.` : "",
        directWoundsLabel,
        directWoundsNote,
        targetDrainsLabel,
        targetDrainsNote,
        targetEffectsLabel,
        targetEffectsNote,
        consequenceLabel,
        consequenceNote
      ].filter(Boolean).join(" | ")
    };
  }

  #resolveTechniqueDamageDice(text, actor) {
    const value = String(text ?? "");
    const skillDamage = value.match(/\b(Arm Strike|Leg Strike|Grapple|Throw|Light Melee|Medium Melee|Heavy Melee|Small Ranged|Large Ranged|Athletics|Speed|Muscle|Endurance|Reason)\b\s*([+-]\s*\d+)?\s*d10/i);
    if (skillDamage) {
      const skillName = skillDamage[1];
      const modifier = Number(String(skillDamage[2] ?? "+0").replace(/\s+/g, ""));
      const skill = actor.findSkillPath(skillName);
      const dice = Math.max(0, effectiveRanks(skill?.skill) + modifier);
      const groupLabel = skill ? OGRE_GATE.skillGroups[skill.groupKey]?.label ?? skill.groupKey : "Skill";
      return {
        dice,
        note: `${groupLabel}: ${skillName} ${modifier >= 0 ? "+" : ""}${modifier}d10.`
      };
    }

    const perRank = value.match(/(?:(\d+)\s*d10\s*)?per\s+Rank\s+of\s+(Waijia|Qinggong|Neigong|Dianxue)/i);
    if (perRank) {
      const multiplier = Number(perRank[1] ?? 1);
      const disciplineKey = normalizeKey(perRank[2]);
      const disciplineRanks = Number(actor.system.disciplines?.[disciplineKey]?.ranks ?? 0);
      return {
        dice: multiplier * disciplineRanks,
        note: `${multiplier}d10 per Rank of ${perRank[2]} Martial Discipline (rank ${disciplineRanks}).`
      };
    }

    const perQi = value.match(/(?:(\d+)\s*d10\s*)?(?:per\s+Rank\s+of\s+Qi|per\s+Qi\s+Rank|per\s+Rank\s+Qi)/i);
    if (perQi) {
      const multiplier = Number(perQi[1] ?? 1);
      return {
        dice: multiplier * Number(actor.system.status.effectiveQi ?? actor.system.qi.rank ?? 0),
        note: `${multiplier}d10 per Rank of Qi.`
      };
    }

    const diceMatch = value.match(/(\d+)\s*d10/i);
    if (diceMatch) {
      return {
        dice: Number(diceMatch[1]),
        note: "Fixed damage dice."
      };
    }

    if (/normal\s+damage/i.test(value)) {
      return {
        dice: 0,
        normal: true,
        note: "Use the normal weapon or unarmed damage for this technique."
      };
    }

    return null;
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
        mode.damageDefense ? `Damage TN can use ${OGRE_GATE.defenses[mode.damageDefense]?.label ?? mode.damageDefense}.` : "",
        mode.workflow ?? ""
      ].filter(Boolean).join(" ")
    }));
  }

  #prepareSelectedAttackMode(actor) {
    const mode = OGRE_GATE.attackModes[actor.system.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    return {
      ...mode,
      workflow: mode.workflow ?? "No special workflow reminder for this attack mode."
    };
  }

  #prepareAfflictionTypes() {
    return Object.entries(OGRE_GATE.afflictionTypes).map(([key, label]) => ({ key, label }));
  }

  #prepareAfflictionIntervals() {
    return Object.entries(OGRE_GATE.afflictionIntervals).map(([key, label]) => ({ key, label }));
  }

  #prepareActiveDrains(actor) {
    const drains = [];
    if (actor.system.qi.temporary) {
      drains.push({
        label: "Qi",
        amount: actor.system.qi.temporary,
        note: actor.system.status.effectiveQi <= 0 ? "No Kung Fu Techniques while Qi is 0." : `Effective Qi ${actor.system.status.effectiveQi}`
      });
    }
    for (const [key, defense] of Object.entries(actor.system.defenses ?? {})) {
      if (!defense.drain) continue;
      const note = key === "hardiness" && defense.rating <= 0
        ? "At 0 Hardiness, roll Endurance TN 7 every hour or die."
        : key === "wits" && defense.rating <= 0
          ? "At 0 Wits, roll Reasoning TN 7 to communicate or act."
          : key === "resolve" && defense.rating <= 0
            ? "At 0 Resolve, the character responds positively to requests."
            : `Rating ${defense.rating}`;
      drains.push({ label: defense.label, amount: defense.drain, note });
    }
    for (const [groupKey, group] of Object.entries(actor.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (!skill.drain) continue;
        drains.push({
          label: skill.label || OGRE_GATE.skillGroups[groupKey]?.skills?.[skillKey] || skillKey,
          amount: skill.drain,
          note: `${OGRE_GATE.skillGroups[groupKey]?.label ?? groupKey} skill`
        });
      }
    }
    for (const item of actor.items.filter((candidate) => candidate.type === "skills" && candidate.system.drain)) {
      drains.push({
        label: item.name,
        amount: item.system.drain,
        note: `${OGRE_GATE.skillGroups[item.system.group]?.label ?? item.system.group} skill`
      });
    }
    return drains;
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

  #defenseTooltip(definition, defense, armorBonus = 0, substanceModifier = 0, rating = defense.rating) {
    return [
      `Roll ${definition.label}: ranks ${defense.ranks} + modifier ${signed(defense.modifier, "d10")}.`,
      `Rating is Base ${defense.base} + Rank ${defense.ranks} + Qi ${defense.qiBonus} + Mod ${signed(defense.modifier)}${defense.drain ? ` - Drain ${defense.drain}` : ""}${armorBonus ? ` + Armor/Shield ${armorBonus}` : ""}${substanceModifier ? ` + Active Effect ${substanceModifier}` : ""} = ${rating}.`,
      definition.relevant?.length ? `Relevant against: ${definition.relevant.join(", ")}.` : ""
    ].filter(Boolean).join(" ");
  }

  #skillTooltip(item, description = "") {
    return description || `${item.name}: No skill description entered yet.`;
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
    if (Object.keys(updates).length) await this.actor.update(updates);
    const itemUpdates = Array.from(this.element.querySelectorAll("[data-item-field]")).map((input) => {
      if (input.disabled) return null;
      const item = this.actor.items.get(input.dataset.itemId);
      if (!item) return null;
      return item.update({ [input.dataset.itemField]: getInputValue(input) });
    }).filter(Boolean);
    if (itemUpdates.length) await Promise.all(itemUpdates);
    return updates;
  }

  #onFieldChange(event) {
    const input = event.currentTarget;
    this.#captureSheetScroll();
    return this.actor.update({ [input.name]: getInputValue(input) });
  }

  async #onItemFieldChange(event) {
    const input = event.currentTarget;
    const item = this.actor.items.get(input.dataset.itemId);
    if (!item) return null;
    this.#captureSheetScroll();
    return item.update({ [input.dataset.itemField]: getInputValue(input) });
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
    const item = this.actor.items.get(button.dataset.itemId);
    if (!item) return null;
    const selectedExpertise = Array.from(this.element.querySelectorAll(`[data-expertise-toggle='${item.id}']:checked`))
      .map((input) => input.dataset.expertiseName)
      .filter(Boolean);
    const useExpertise = selectedExpertise.length > 0;
    const label = button.dataset.label || item.name;
    const tn = await this.#promptTargetNumber(label, 6);
    if (!tn) return null;
    return this.actor.rollSkillItem(item, {
      tn,
      modifier: this.#getRollModifier() + (useExpertise ? 1 : 0),
      label: useExpertise ? `${label} (${selectedExpertise.join(", ")})` : label
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
    const button = event.currentTarget;
    const itemId = button?.dataset?.itemId;
    try {
      await this.#submitActorFields();
      const item = this.actor.items.get(itemId);
      const tn = await this.#promptTargetNumber(item?.name ?? "Weapon Attack", 6);
      if (!tn) return null;
      return this.actor.rollAttackWithWeapon(itemId, { tn });
    } catch (error) {
      console.error("Ogre Gate | Weapon attack failed", error);
      ui.notifications.error("Weapon attack failed. See the console for details.");
      return null;
    }
  }

  async #onRollWeaponDamage(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button?.dataset?.itemId;
    try {
      await this.#submitActorFields();
      const item = this.actor.items.get(itemId);
      const hardiness = await this.#promptTargetNumber(`${item?.name ?? "Weapon"} Damage TN`, this.actor.system.defenses.hardiness.rating);
      if (!hardiness) return null;
      return this.actor.rollWeaponDamage(itemId, {
        hardiness,
        open: Boolean(this.element.querySelector("[name='damage-open']")?.checked),
        damageBonus: Number(this.actor.system.combat.pendingDamageBonus ?? 0),
        consumeDamageBonus: true,
        modifier: Number(this.actor.system.combat.pendingDamageModifier ?? 0),
        extraWounds: Number(this.actor.system.combat.pendingExtraWounds ?? 0)
      });
    } catch (error) {
      console.error("Ogre Gate | Weapon damage failed", error);
      ui.notifications.error("Weapon damage failed. See the console for details.");
      return null;
    }
  }

  async #onRollTechnique(event) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget;
    const itemId = button?.dataset?.itemId || button?.closest?.("[data-item-id]")?.dataset?.itemId;
    const cathartic = button?.dataset?.cathartic === "true";
    try {
      await this.#submitActorFields();
      const item = this.actor.items.get(itemId);
      if (!item) {
        ui.notifications.warn("That Kung Fu Technique could not be found on this actor. Reopen the sheet and try again.");
        return null;
      }
      const needsRoll = item.system.techniqueType !== "stance" || stanceNeedsActivationRoll(item, cathartic);
      if (needsRoll && !this.actor.findSkillPath(item.system.activationSkill)) {
        const configured = await this.#promptTechniqueActivationSkill(item);
        if (!configured) return null;
      }
      const tn = needsRoll ? await this.#promptTargetNumber(item.name, this.#techniqueDefaultTargetNumber(item)) : 6;
      if (!tn) return null;
      return this.actor.rollTechnique(item, {
        cathartic,
        tn,
        modifier: 0
      });
    } catch (error) {
      console.error("Ogre Gate | Technique roll failed", error);
      ui.notifications.error("Kung Fu Technique roll failed. See the console for details.");
      return null;
    }
  }

  async #onMaintainStance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const name = this.actor.system.combat.activeStanceName || "Cathartic Stance";
    const tn = await this.#promptTargetNumber(`${name} Maintenance`, 6);
    if (!tn) return null;
    return this.actor.maintainCatharticStance({ tn });
  }

  async #onEndStance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.endActiveStance();
  }

  async #promptTechniqueActivationSkill(item) {
    const skills = this.#techniqueActivationOptions();
    if (!skills.length) {
      ui.notifications.warn(`Add a Skill to ${this.actor.name} before using ${item.name}.`);
      return false;
    }

    const options = skills.map((skill) => {
      return `<option value="${escapeHtml(skill.key)}">${escapeHtml(skill.label)}</option>`;
    }).join("");
    return new Promise((resolve) => {
      new Dialog({
        title: `Set Activation Skill: ${item.name}`,
        content: `
          <form class="ogre-gate-dialog">
            <p class="form-note">This technique needs a Skill listed in its entry. Choose one of this character's owned Skills.</p>
            <label>Activation Skill
              <select name="activationSkill" autofocus>${options}</select>
            </label>
          </form>
        `,
        buttons: {
          save: {
            label: "Save and Roll",
            callback: async (html) => {
              const root = html instanceof HTMLElement ? html : html?.[0];
              const activationSkill = root?.querySelector("[name='activationSkill']")?.value ?? "";
              if (!activationSkill) return resolve(false);
              await item.update({ "system.activationSkill": activationSkill });
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

  #techniqueDefaultTargetNumber(item) {
    const targetDefense = item?.system?.targetDefense ?? "tn";
    if (targetDefense && !["tn", "none"].includes(targetDefense)) {
      const targetActor = getFirstTargetActor();
      const rating = Number(targetActor?.system?.defenses?.[targetDefense]?.rating ?? 0);
      if (rating) return rating;
    }
    return Number(item?.system?.targetNumber ?? 6) || 6;
  }

  #techniqueActivationOptions() {
    const owned = this.actor.items
      .filter((candidate) => candidate.type === "skills")
      .map((skill) => {
        const key = skill.system.skillKey || skill.name;
        const groupKey = skill.system.group ?? "specialist";
        const group = OGRE_GATE.skillGroups[skill.system.group]?.label ?? skill.system.group ?? "Skill";
        return {
          key: `${groupKey}.${key}`,
          label: `${group}: ${skill.name}`
        };
      });
    const existing = new Set(owned.map((skill) => normalizeKey(skill.key)));
    const fallback = Object.entries(this.actor.system.skills ?? {}).flatMap(([groupKey, group]) => {
      const groupLabel = OGRE_GATE.skillGroups[groupKey]?.label ?? groupKey;
      return Object.entries(group).map(([skillKey, skill]) => ({
        key: `${groupKey}.${skillKey}`,
        label: `${groupLabel}: ${skill.label ?? OGRE_GATE.skillGroups[groupKey]?.skills?.[skillKey] ?? skillKey}`
      }));
    }).filter((skill) => {
      const key = normalizeKey(skill.key);
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });
    return [...owned, ...fallback].sort((a, b) => a.label.localeCompare(b.label));
  }

  async #onMeditateImbalance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return new Promise((resolve) => {
      new Dialog({
        title: "Meditate to Remove Imbalance",
        content: `
          <form class="ogre-gate-dialog">
            <label>Hours Meditated
              <input type="number" name="hours" value="1" min="1" max="999" autofocus />
            </label>
          </form>
        `,
        buttons: {
          meditate: {
            label: "Meditate",
            callback: async (html) => {
              const root = html instanceof HTMLElement ? html : html?.[0];
              const hours = Number(root?.querySelector("[name='hours']")?.value ?? 1);
              resolve(await this.actor.meditateImbalance(hours));
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "meditate",
        close: () => resolve(null)
      }).render(true);
    });
  }

  async #onCheckPossession(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.checkQiSpiritPossession("Imbalance Threshold");
  }

  async #onRollPossessionControl(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.rollPossessionControl();
  }

  async #onPurgePossession(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const confirmed = await Dialog.confirm({
      title: `Purge ${this.actor.system.imbalance.spirit || "Qi Spirit"}?`,
      content: "<p>Only mark this complete when a Kung Fu Technique that purges spirits has been used successfully.</p>",
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
    if (!confirmed) return null;
    return this.actor.purgeQiSpirit();
  }

  async #onRollDemonFlaw(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.rollDemonFlaw();
  }

  async #onResolveQiDuel(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.resolveQiDuel();
  }

  async #onClearQiDuel(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.clearQiDuelBuildup();
  }

  async #onRollFallingDamage(event) {
    event.preventDefault();
    const hardiness = await this.#promptTargetNumber("Falling Damage TN", this.actor.system.defenses.hardiness.rating);
    if (!hardiness) return null;
    return this.actor.rollFallingDamage(this.#getNumberInput("fall-distance", 10, { min: 1, max: 1000 }), {
      hardiness
    });
  }

  async #onRollFireDamage(event) {
    event.preventDefault();
    const hardiness = await this.#promptTargetNumber("Fire Damage TN", this.actor.system.defenses.hardiness.rating);
    if (!hardiness) return null;
    return this.actor.rollFireDamage(this.element.querySelector("[name='fire-size']")?.value ?? "torch", {
      hardiness
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

  async #onArmPreparedStrike(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.armPreparedStrike();
  }

  async #onClearPreparedStrike(event) {
    event.preventDefault();
    await this.#submitActorFields();
    await this.actor.clearPreparedStrike();
    ui.notifications.info(`${this.actor.name}'s prepared strike is cleared.`);
  }

  async #onValidateCharge(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.postChargeValidation();
  }

  async #onTreatAffliction(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.rollAfflictionTreatment();
  }

  async #onRollAfflictionExposure(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.rollAfflictionExposure();
  }

  async #onAdvanceAfflictionProgression(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.advanceAfflictionProgression();
  }

  async #onAdvanceAfflictionLethality(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.advanceAfflictionLethality();
  }

  async #onClearAfflictionSubstances(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.clearAfflictionSubstances();
  }

  async #onExpireAfflictionSubstance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.expireAfflictionSubstance(Number(event.currentTarget.dataset.index));
  }

  async #onSelectAffliction(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.selectAdditionalAffliction(Number(event.currentTarget.dataset.index));
  }

  async #confirmAfflictionRemoval(name) {
    return Dialog.confirm({
      title: `Discard ${name}?`,
      content: `<p>Remove <strong>${escapeHtml(name)}</strong> from ${escapeHtml(this.actor.name)}'s tracked afflictions? This does not represent treatment or restore effects already applied.</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
  }

  async #onRemoveSelectedAffliction(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const name = this.actor.system.affliction.name || "selected affliction";
    if (!await this.#confirmAfflictionRemoval(name)) return null;
    return this.actor.removeSelectedAffliction();
  }

  async #onRemoveAdditionalAffliction(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const index = Number(event.currentTarget.dataset.index);
    const name = this.actor.system.additionalAfflictions?.[index]?.name || "tracked affliction";
    if (!await this.#confirmAfflictionRemoval(name)) return null;
    return this.actor.removeAdditionalAffliction(index);
  }

  async #onApplySubstance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    return this.actor.useSubstanceItem(item);
  }

  async #onExpireActiveSubstance(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.expireActiveSubstance(Number(event.currentTarget.dataset.index));
  }

  async #onResetLifePillStreak(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.resetLifeProlongingPillStreak();
  }

  async #onHealWounds(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.healWounds(this.actor.system.combat.healingAmount);
  }

  async #onNaturalHealing(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.applyNaturalHealing();
  }

  async #onStabilizeDying(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return this.actor.stabilizeDying(event.currentTarget.dataset.method);
  }

  async #onApplyDrain(event) {
    event.preventDefault();
    await this.#submitActorFields();
    return new Promise((resolve) => {
      new Dialog({
        title: "Apply Drain",
        content: `
          <form class="ogre-gate-dialog">
            <label>Type
              <select name="type">
                <option value="skill">Skill</option>
                <option value="defense">Defense</option>
                <option value="qi">Qi</option>
              </select>
            </label>
            <label>Key or Name
              <input type="text" name="key" placeholder="speed, hardiness, parry, medicine..." />
            </label>
            <label>Amount
              <input type="number" name="amount" value="1" min="1" max="20" />
            </label>
          </form>
        `,
        buttons: {
          apply: {
            label: "Apply",
            callback: async (html) => {
              const root = html instanceof HTMLElement ? html : html?.[0];
              const updates = await this.actor.applyDrain({
                type: root?.querySelector("[name='type']")?.value ?? "skill",
                key: root?.querySelector("[name='key']")?.value ?? "",
                amount: root?.querySelector("[name='amount']")?.value ?? 1
              });
              if (!Object.keys(updates).length) ui.notifications.warn("No matching drain target found.");
              resolve(true);
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "apply",
        close: () => resolve(false)
      }).render(true);
    });
  }

  async #onRecoverDrain(event) {
    event.preventDefault();
    await this.#submitActorFields();
    const updates = await this.actor.recoverDrains(1);
    if (Object.keys(updates).length) ui.notifications.info(`Recovered 1 drain point for ${this.actor.name}.`);
    else ui.notifications.info(`${this.actor.name} has no active drains.`);
    return updates;
  }

  #onToggleSkillGroup(event) {
    event.preventDefault();
    const groupKey = event.currentTarget.dataset.group;
    if (!groupKey) return;
    this.#captureSheetScroll();
    this._collapsedSkillGroups ??= new Set();
    if (this._collapsedSkillGroups.has(groupKey)) this._collapsedSkillGroups.delete(groupKey);
    else this._collapsedSkillGroups.add(groupKey);
    this.render({ force: false });
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
    this.#captureSheetScroll();
    const button = event.currentTarget;
    const item = this.actor.items.get(button.dataset.itemId);
    if (!item) return null;
    const skill = item.system;
    const expertiseText = getExpertiseEntries(skill)
      .map((entry) => `${entry.name}${entry.note ? ` | ${entry.note}` : ""}`)
      .join("\n");

    return new Promise((resolve) => {
      new Dialog({
        title: `${button.dataset.label ?? item.name} Expertise`,
        content: `
          <form class="ogre-gate-dialog">
            <label>Expertise Entries
              <textarea name="expertiseList" autofocus placeholder="Expertise name | Optional note">${escapeHtml(expertiseText)}</textarea>
            </label>
            <p class="form-note">Enter one Expertise per line. Use a vertical bar to add an optional note.</p>
          </form>
        `,
        buttons: {
          save: {
            label: "Save",
            callback: async (html) => {
              this.#captureSheetScroll();
              const root = html instanceof HTMLElement ? html : html?.[0];
              const entries = String(root?.querySelector("[name='expertiseList']")?.value ?? "")
                .split(/\r?\n/)
                .map((line) => {
                  const [name, ...noteParts] = line.split("|");
                  return {
                    name: String(name ?? "").trim(),
                    note: noteParts.join("|").trim()
                  };
                })
                .filter((entry) => entry.name);
              const first = entries[0] ?? { name: "", note: "" };
              await item.update({
                "system.expertise": first.name,
                "system.expertiseNote": first.note,
                "system.expertiseList": entries
              });
              resolve(true);
            }
          },
          clear: {
            label: "Clear",
            callback: async () => {
              this.#captureSheetScroll();
              await item.update({
                "system.expertise": "",
                "system.expertiseNote": "",
                "system.expertiseList": []
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
    event.stopPropagation();
    this.#captureSheetScroll();
    const type = event.currentTarget.dataset.type;
    if (!type) return;

    const label = type === "skills" ? "Skill" : OGRE_GATE.itemTypes[type] ?? "Item";
    const groupKey = event.currentTarget.dataset.group;
    const baseName = type === "skills" && groupKey
      ? `New ${OGRE_GATE.skillGroups[groupKey]?.label ?? ""} Skill`.trim()
      : `New ${label}`;
    const itemData = {
      name: this.#getUniqueItemName(baseName, type, groupKey),
      type
    };
    if (groupKey) itemData.system = { group: groupKey };
    const [item] = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    item?.sheet?.render(true);
  }

  #getUniqueItemName(baseName, type, groupKey = "") {
    const used = new Set(this.actor.items
      .filter((item) => item.type === type && (!groupKey || item.system?.group === groupKey))
      .map((item) => item.name));
    if (!used.has(baseName)) return baseName;
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseName} ${index}`;
      if (!used.has(candidate)) return candidate;
    }
    return `${baseName} ${Date.now()}`;
  }

  #findExistingSkillItem(itemData) {
    const identity = getSkillIdentity(itemData);
    if (!identity || identity.endsWith(":")) return null;
    return this.actor.items.find((item) => item.type === "skills" && getSkillIdentity(item.toObject()) === identity) ?? null;
  }

  #onOpenItem(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    return item?.sheet?.render(true);
  }

  async #onDeleteItem(event) {
    event.preventDefault();
    this.#captureSheetScroll();
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
    event.stopImmediatePropagation();
    this.#captureSheetScroll();
    const raw = event.dataTransfer?.getData("text/plain");
    if (!raw) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch (_error) {
      return;
    }

    if (data.type === "Folder") {
      const folder = await fromUuid(data.uuid);
      if (!folder || folder.type !== "Item") {
        ui.notifications.warn("Only folders of Item documents can be dropped onto an Ogre Gate sheet.");
        return;
      }
      return this.#onDropItemFolder(folder, event.target);
    }

    if (data.type !== "Item") return;

    const item = await Item.implementation.fromDropData(data);
    if (!item) return;

    if (item.type === "affliction") {
      await this.actor.loadAfflictionItem(item);
      this._activeTab = "rules";
      this.#activateTab("rules", "primary");
      ui.notifications.info(`Loaded ${item.name} into ${this.actor.name}'s treatment tracker.`);
      return;
    }

    if (event.target?.closest?.(".affliction-drop-zone")) {
      if (item.type === "substance") return this.actor.applySubstanceItem(item);
      ui.notifications.warn("Drop a Poison, Disease, or Substance item onto the treatment tracker.");
      return;
    }

    const skillGroup = event.target?.closest?.("[data-skill-group]")?.dataset?.skillGroup;
    return this.#addDroppedItem(item, skillGroup);
  }

  async #addDroppedItem(item, skillGroup = "") {
    const itemData = item.toObject();
    delete itemData._id;
    if (itemData.type === "skills") {
      itemData.system = {
        ...itemData.system,
        group: resolveDroppedSkillGroup(itemData, skillGroup)
      };
    }
    const techniqueSource = itemData.type === "technique" ? String(item.uuid ?? "") : "";
    if (techniqueSource) {
      itemData.flags = {
        ...(itemData.flags ?? {}),
        [OGRE_GATE.id]: {
          ...(itemData.flags?.[OGRE_GATE.id] ?? {}),
          sourceUuid: techniqueSource
        }
      };
    }
    const existing = itemData.type === "skills"
      ? this.#findExistingSkillItem(itemData)
      : itemData.type === "technique"
        ? this.#findExistingTechniqueItem(item, techniqueSource)
        : null;
    if (existing) {
      ui.notifications.info(`${existing.name} is already on ${this.actor.name}.`);
      return existing.sheet?.render(true);
    }
    const pendingKey = itemData.type === "technique"
      ? `${itemData.type}:${techniqueSource || normalizeKey(item.name)}`
      : "";
    this._ogreGatePendingDrops ??= new Set();
    if (pendingKey && this._ogreGatePendingDrops.has(pendingKey)) return null;
    if (pendingKey) this._ogreGatePendingDrops.add(pendingKey);
    try {
      await this.actor.createEmbeddedDocuments("Item", [itemData]);
      ui.notifications.info(`Added ${item.name} to ${this.actor.name}.`);
      if (itemData.type === "technique" && isEvilTechnique(itemData)) {
        ui.notifications.warn(`${item.name} is an Evil Technique. Roll on the Demon Flaw Table when it is mastered.`);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <section class="ogre-gate-chat-card">
              <h3>${escapeHtml(this.actor.name)} Masters ${escapeHtml(item.name)}</h3>
              <div class="ogre-gate-chat-row"><strong>Evil Technique</strong><span>Use the Martial tab's Roll Demon Flaw button. Demon Flaws gained from mastering Evil Techniques are permanent.</span></div>
            </section>
          `
        });
      }
    } finally {
      if (pendingKey) this._ogreGatePendingDrops.delete(pendingKey);
    }
    return null;
  }

  #findExistingTechniqueItem(item, sourceUuid = "") {
    const incomingName = normalizeKey(item.name);
    return this.actor.items.find((candidate) => {
      if (candidate.type !== "technique") return false;
      const existingSource = String(candidate.flags?.[OGRE_GATE.id]?.sourceUuid ?? "");
      if (sourceUuid && existingSource === sourceUuid) return true;
      return normalizeKey(candidate.name) === incomingName
        && String(candidate.system.discipline ?? "") === String(item.system.discipline ?? "")
        && String(candidate.system.activationSkill ?? "") === String(item.system.activationSkill ?? "");
    }) ?? null;
  }

  async #onDropItemFolder(folder, target) {
    const skillGroup = target?.closest?.("[data-skill-group]")?.dataset?.skillGroup ?? "";
    const items = await this.#collectFolderItems(folder);
    const skills = items.filter((item) => item?.type === "skills");
    if (!skills.length) {
      ui.notifications.warn(`${folder.name} does not contain Ogre Gate Skill items.`);
      return;
    }

    const itemData = [];
    const seen = new Set(this.actor.items.filter((item) => item.type === "skills").map((item) => getSkillIdentity(item.toObject())));
    for (const item of skills) {
      const data = item.toObject();
      delete data._id;
      data.system = {
        ...data.system,
        group: resolveDroppedSkillGroup(data, skillGroup)
      };
      const identity = getSkillIdentity(data);
      if (seen.has(identity)) continue;
      seen.add(identity);
      itemData.push(data);
    }

    if (!itemData.length) {
      ui.notifications.info(`All Skills in ${folder.name} are already on ${this.actor.name}.`);
      return;
    }
    await this.actor.createEmbeddedDocuments("Item", itemData);
    ui.notifications.info(`Added ${itemData.length} Skill item(s) from ${folder.name} to ${this.actor.name}.`);
  }

  async #collectFolderItems(folder) {
    const entries = [...(folder.contents ?? [])];
    for (const child of folder.getSubfolders?.() ?? []) {
      entries.push(...await this.#collectFolderItems(child));
    }
    return Promise.all(entries.map(async (entry) => {
      if (entry?.documentName === "Item" && typeof entry.toObject === "function") return entry;
      if (entry?.uuid) return fromUuid(entry.uuid);
      return null;
    }));
  }

  #activateTab(tab, group) {
    this.element.querySelectorAll(`.sheet-tabs [data-group='${group}']`).forEach((link) => {
      link.classList.toggle("active", link.dataset.tab === tab);
    });
    this.element.querySelectorAll(`.sheet-body .tab[data-group='${group}']`).forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tab === tab);
    });
  }

  #captureSheetScroll() {
    const body = this.element?.querySelector(".sheet-body");
    if (!body) return;
    this._savedSheetScroll = {
      top: body.scrollTop,
      left: body.scrollLeft,
      time: Date.now()
    };
  }

  #restoreSheetScroll() {
    const saved = this._savedSheetScroll;
    if (!saved) return;
    if (Date.now() - saved.time > 5000) return;
    window.requestAnimationFrame(() => {
      const body = this.element?.querySelector(".sheet-body");
      if (!body) return;
      body.scrollTop = Math.min(saved.top, body.scrollHeight);
      body.scrollLeft = Math.min(saved.left, body.scrollWidth);
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
