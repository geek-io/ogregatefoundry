import { OGRE_GATE } from "./config.mjs";
import { OgreGateRoll } from "./rolls.mjs";
import { prepareCharacterCreation } from "./rules/character-creation.mjs";

const MELEE_SKILLS = new Set(["armStrike", "legStrike", "grapple", "throw", "lightMelee", "mediumMelee", "heavyMelee"]);

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

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getReachModifier(weaponReach = "normal", opponentReach = "normal", situation = "none") {
  const weapon = OGRE_GATE.reachValues[weaponReach] ?? OGRE_GATE.reachValues.normal;
  const opponent = OGRE_GATE.reachValues[opponentReach] ?? OGRE_GATE.reachValues.normal;
  if (situation === "closing") return Math.clamp(weapon - opponent, -1, 1);
  if (situation === "longAdjacent" && weaponReach === "long") return -1;
  if (situation === "insideLong" && weaponReach === "none" && opponentReach === "long") return 1;
  return 0;
}

export class OgreGateActor extends Actor {
  getRaceSkillModifier(groupKey, skillKey) {
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
    return this.system.skills?.[groupKey]?.[skillKey] ?? null;
  }

  findSkill(skillKey) {
    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      if (skillKey in group) return { groupKey, skillKey, skill: group[skillKey] };
    }
    return null;
  }

  async rollSkill(groupKey, skillKey, options = {}) {
    const skill = this.getSkill(groupKey, skillKey);
    if (!skill) return null;

    const label = options.label ?? skill.label ?? OGRE_GATE.skillGroups[groupKey]?.skills?.[skillKey] ?? skillKey;
    const illumination = OGRE_GATE.illumination[this.system.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const raceModifier = this.getRaceSkillModifier(groupKey, skillKey);
    return OgreGateRoll.skill({
      actor: this,
      label,
      ranks: effectiveRanks(skill),
      modifier: skill.modifier + raceModifier + Number(illumination.dice ?? 0) + Number(options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
      returnOutcome: Boolean(options.returnOutcome),
      extra: [
        skill.drain ? `<div class="ogre-gate-chat-row"><strong>Drain</strong><span>-${skill.drain} rank(s)</span></div>` : "",
        raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : "",
        options.extra ?? ""
      ].filter(Boolean).join("")
    });
  }

  async rollDefense(defenseKey, options = {}) {
    const defense = this.system.defenses?.[defenseKey];
    if (!defense) return null;

    return OgreGateRoll.skill({
      actor: this,
      label: defense.label,
      ranks: Math.max(0, Number(defense.ranks ?? 0) - Number(defense.drain ?? 0)),
      modifier: defense.modifier + (options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
      returnOutcome: Boolean(options.returnOutcome)
    });
  }

  async rollActiveDefense(defenseKey = "parry", options = {}) {
    const defense = this.system.defenses?.[defenseKey];
    if (!defense) return null;

    const result = await this.rollDefense(defenseKey, {
      tn: options.tn ?? 1,
      rollMode: options.rollMode,
      returnOutcome: true
    });
    const rating = Math.max(Number(defense.rating ?? 0), Number(result?.selected ?? 0));
    await this.update({
      "system.combat.activeDefense": defenseKey,
      "system.combat.activeDefenseRating": rating
    });
    ui.notifications.info(`${this.name}'s active ${defense.label} is ${rating}.`);
    return result?.message ?? result;
  }

  async rollAttackWithWeapon(item, options = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "weapon") return null;

    const skillKey = item.system.attackSkill || item.system.category || "mediumMelee";
    const skill = this.getSkill("combat", skillKey);
    if (!skill) return null;

    const defenseKey = item.system.targetDefense || OGRE_GATE.combatSkillDefense[skillKey] || "parry";
    const defenseLabel = OGRE_GATE.defenses[defenseKey]?.label ?? defenseKey;
    const action = OGRE_GATE.combatActions[this.system.combat.action] ?? OGRE_GATE.combatActions.skillAndMove;
    const attackMode = OGRE_GATE.attackModes[this.system.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    const illumination = OGRE_GATE.illumination[this.system.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const raceModifier = this.getRaceSkillModifier("combat", skillKey);
    const actionModifier = Number(action.skill ?? 0);
    const reachModifier = getReachModifier(item.system.reach, this.system.combat.opponentReach, this.system.combat.reachSituation);
    const totalModifier = skill.modifier
      + actionModifier
      + Number(attackMode.attack ?? 0)
      + raceModifier
      + reachModifier
      + Number(illumination.dice ?? 0)
      + Number(this.system.combat.situationalDice ?? 0)
      + Number(options.modifier ?? 0);

    return OgreGateRoll.attack({
      actor: this,
      label: `${item.name} Attack`,
      ranks: effectiveRanks(skill),
      modifier: totalModifier,
      defense: defenseLabel,
      mode: [
        attackMode.label,
        raceModifier ? `Race ${raceModifier > 0 ? "+" : ""}${raceModifier}d10` : "",
        reachModifier ? `Reach ${reachModifier > 0 ? "+" : ""}${reachModifier}d10` : "",
        attackMode.workflow ?? ""
      ].filter(Boolean).join(" | "),
      tn: options.tn ?? 6,
      deadlyTens: this.system.combat.deadlyTens,
      rollMode: options.rollMode
    });
  }

  async rollWeaponDamage(item, options = {}) {
    item = typeof item === "string" ? this.items.get(item) : item;
    if (!item || item.type !== "weapon") return null;

    const damageSkillKey = item.system.damageSkill;
    let skillRanks = 0;
    if (damageSkillKey) {
      const skill = this.findSkill(damageSkillKey)?.skill;
      skillRanks = effectiveRanks(skill);
    }

    const attackMode = OGRE_GATE.attackModes[this.system.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    const controlledStrike = Boolean(this.system.combat.controlledStrike);
    const modeExtraWounds = Number(attackMode.extraWounds ?? 0);
    const controlledReduction = controlledStrike ? -1 : 0;
    const raceDamageModifier = this.getRaceDamageModifier(item.system.attackSkill || item.system.category);
    const pendingDamageBonus = Math.max(0, Math.trunc(Number(options.damageBonus ?? this.system.combat.pendingDamageBonus ?? 0)));

    const message = await this.rollDamage({
      label: `${item.name} Damage`,
      dice: Number(item.system.damageDice ?? 0) + skillRanks,
      hardiness: options.hardiness ?? 6,
      open: item.system.openDamage || options.open || attackMode.openDamage,
      modifier: Number(options.modifier ?? 0) + Number(attackMode.damage ?? 0) + raceDamageModifier + pendingDamageBonus,
      extraWounds: Number(options.extraWounds ?? 0) + modeExtraWounds + controlledReduction,
      note: [
        attackMode.label,
        pendingDamageBonus ? `Attack bonus +${pendingDamageBonus}d10` : "",
        raceDamageModifier ? `Race +${raceDamageModifier}d10 damage` : "",
        attackMode.nonLethal ? "Non-lethal" : "",
        controlledStrike ? "Controlled Strike" : "",
        attackMode.damageDefense ? `Use target ${OGRE_GATE.defenses[attackMode.damageDefense]?.label ?? attackMode.damageDefense} as damage TN` : ""
      ].filter(Boolean).join(" | "),
      outcomeHint: attackMode.outcome ?? ""
    });

    if (pendingDamageBonus && options.consumeDamageBonus !== false) {
      await this.update({ "system.combat.pendingDamageBonus": 0 });
    }

    return message;
  }

  async rollTurnOrder(options = {}) {
    const speed = this.system.skills.physical.speed;
    const raceModifier = this.getRaceSkillModifier("physical", "speed");
    return OgreGateRoll.skill({
      actor: this,
      label: "Turn Order",
      ranks: effectiveRanks(speed),
      modifier: speed.modifier + raceModifier + Number(options.modifier ?? 0),
      tn: 1,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
      extra: raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : ""
    });
  }

  async rollDamage({ dice, hardiness, open = false, label = "Damage", modifier = 0, extraWounds = 0, note = "", outcomeHint = "" } = {}) {
    return OgreGateRoll.damage({
      actor: this,
      label,
      dice,
      hardiness,
      open,
      modifier,
      extraWounds,
      note,
      outcomeHint
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
    const endurance = this.system.skills.physical.endurance;
    const rounds = Math.max(0, Math.trunc(Number(roundsElapsed ?? 0)));
    const tn = Math.clamp(1 + (rounds * 4), 1, 10);
    return OgreGateRoll.skill({
      actor: this,
      label: `Suffocation/Drowning Round ${rounds + 1}`,
      ranks: effectiveRanks(endurance),
      modifier: endurance.modifier + Number(options.modifier ?? 0),
      tn,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
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
    const mountedBow = this.system.combat.mountedBowShot;
    const status = required ? (distance >= required ? "Ready" : "Review") : "No charge threshold";
    const outcomeClass = status === "Review" ? "failure" : "success";
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <section class="ogre-gate-chat-card">
          <h3>${this.name} ${label}</h3>
          <div class="ogre-gate-chat-row"><strong>Declared Distance</strong><span>${distance} ft</span></div>
          <div class="ogre-gate-chat-row"><strong>Required</strong><span>${required || "None"}${required ? " ft straight-line movement" : ""}</span></div>
          ${mountedBow ? `<div class="ogre-gate-chat-row"><strong>Mounted Bow</strong><span>Apply -1d10 unless Bow Rider or another rule overrides it.</span></div>` : ""}
          <div class="ogre-gate-chat-outcome ${outcomeClass}">${status}</div>
        </section>
      `
    });
  }

  async rollAfflictionTreatment() {
    const affliction = this.system.affliction;
    const name = affliction.name || (OGRE_GATE.afflictionTypes[affliction.type] ?? "Affliction");
    if (affliction.antidoteRequired && !affliction.antidoteApplied) {
      ui.notifications.warn(`${name} requires an antidote or specific remedy before Medicine can treat it.`);
      return null;
    }
    const result = await this.rollSkill("specialist", "medicine", {
      label: `Medicine: ${name}`,
      tn: affliction.medicineTn,
      returnOutcome: true,
      extra: [
        `<div class="ogre-gate-chat-row"><strong>Type</strong><span>${OGRE_GATE.afflictionTypes[affliction.type] ?? affliction.type}</span></div>`,
        `<div class="ogre-gate-chat-row"><strong>Cadence</strong><span>One recovery roll per ${OGRE_GATE.afflictionIntervals[affliction.interval] ?? affliction.interval}</span></div>`,
        affliction.antidoteRequired ? `<div class="ogre-gate-chat-row"><strong>Remedy</strong><span>${affliction.antidoteApplied ? "Applied" : "Required"}</span></div>` : ""
      ].filter(Boolean).join("")
    });
    const outcome = result?.outcome;
    const status = outcome?.totalSuccesses ? "cured" : outcome?.success ? "stabilized" : "resumed";
    await this.update({ "system.affliction.status": status });
    ui.notifications.info(`${name} treatment status: ${status}.`);
    return result?.message ?? result;
  }

  findSkillPath(search) {
    const normalized = normalizeKey(search);
    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (normalizeKey(skillKey) === normalized || normalizeKey(skill.label) === normalized) {
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
      if (match) updates[`system.skills.${match.groupKey}.${match.skillKey}.drain`] = Number(match.skill.drain ?? 0) + amount;
    }

    if (Object.keys(updates).length) await this.update(updates);
    return updates;
  }

  async recoverDrains(amount = 1) {
    amount = Math.max(0, Math.trunc(Number(amount ?? 0)));
    if (!amount) return {};

    const updates = {};
    if (this.system.qi.temporary) updates["system.qi.temporary"] = Math.max(0, this.system.qi.temporary - amount);
    for (const [key, defense] of Object.entries(this.system.defenses ?? {})) {
      if (defense.drain) updates[`system.defenses.${key}.drain`] = Math.max(0, defense.drain - amount);
    }
    for (const [groupKey, group] of Object.entries(this.system.skills ?? {})) {
      for (const [skillKey, skill] of Object.entries(group)) {
        if (skill.drain) updates[`system.skills.${groupKey}.${skillKey}.drain`] = Math.max(0, skill.drain - amount);
      }
    }
    if (Object.keys(updates).length) await this.update(updates);
    return updates;
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
    const race = this.system.creation.race;
    if (this.system.qi.rank < OGRE_GATE.creation.startingQi) updates["system.qi.rank"] = OGRE_GATE.creation.startingQi;
    if (this.system.money.spades < OGRE_GATE.creation.startingSpadeCoins) updates["system.money.spades"] = OGRE_GATE.creation.startingSpadeCoins;

    if (race === "kithiri") {
      if (this.system.skills.mental.empathy.ranks < 1) updates["system.skills.mental.empathy.ranks"] = 1;
      if (this.system.skills.mental.reasoning.ranks < 1) updates["system.skills.mental.reasoning.ranks"] = 1;
      if (this.system.defenses.wits.ranks < 1) updates["system.defenses.wits.ranks"] = 1;
    }

    if (race === "juren" && this.system.skills.physical.muscle.ranks < 1) {
      updates["system.skills.physical.muscle.ranks"] = 1;
    }

    if (Object.keys(updates).length) await this.update(updates);
    return updates;
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
