import { OGRE_GATE } from "./config.mjs";
import { OgreGateRoll } from "./rolls.mjs";
import { prepareCharacterCreation } from "./rules/character-creation.mjs";

const MELEE_SKILLS = new Set(["armStrike", "legStrike", "grapple", "throw", "lightMelee", "mediumMelee", "heavyMelee"]);

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
      ranks: skill.ranks,
      modifier: skill.modifier + raceModifier + Number(illumination.dice ?? 0) + Number(options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
      extra: [
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
      ranks: defense.ranks,
      modifier: defense.modifier + (options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties
    });
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
    const totalModifier = skill.modifier
      + actionModifier
      + Number(attackMode.attack ?? 0)
      + raceModifier
      + Number(illumination.dice ?? 0)
      + Number(this.system.combat.situationalDice ?? 0)
      + Number(options.modifier ?? 0);

    return OgreGateRoll.attack({
      actor: this,
      label: `${item.name} Attack`,
      ranks: skill.ranks,
      modifier: totalModifier,
      defense: defenseLabel,
      mode: [
        attackMode.label,
        raceModifier ? `Race ${raceModifier > 0 ? "+" : ""}${raceModifier}d10` : ""
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
      skillRanks = Number(skill?.ranks ?? 0);
    }

    const attackMode = OGRE_GATE.attackModes[this.system.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    const controlledStrike = Boolean(this.system.combat.controlledStrike);
    const modeExtraWounds = Number(attackMode.extraWounds ?? 0);
    const controlledReduction = controlledStrike ? -1 : 0;
    const raceDamageModifier = this.getRaceDamageModifier(item.system.attackSkill || item.system.category);

    return this.rollDamage({
      label: `${item.name} Damage`,
      dice: Number(item.system.damageDice ?? 0) + skillRanks,
      hardiness: options.hardiness ?? 6,
      open: item.system.openDamage || options.open || attackMode.openDamage,
      modifier: Number(options.modifier ?? 0) + Number(attackMode.damage ?? 0) + raceDamageModifier,
      extraWounds: Number(options.extraWounds ?? 0) + modeExtraWounds + controlledReduction,
      note: [
        attackMode.label,
        raceDamageModifier ? `Race +${raceDamageModifier}d10 damage` : "",
        attackMode.nonLethal ? "Non-lethal" : "",
        controlledStrike ? "Controlled Strike" : "",
        attackMode.damageDefense ? `Use target ${OGRE_GATE.defenses[attackMode.damageDefense]?.label ?? attackMode.damageDefense} as damage TN` : ""
      ].filter(Boolean).join(" | ")
    });
  }

  async rollTurnOrder(options = {}) {
    const speed = this.system.skills.physical.speed;
    const raceModifier = this.getRaceSkillModifier("physical", "speed");
    return OgreGateRoll.skill({
      actor: this,
      label: "Turn Order",
      ranks: speed.ranks,
      modifier: speed.modifier + raceModifier + Number(options.modifier ?? 0),
      tn: 1,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties,
      extra: raceModifier ? `<div class="ogre-gate-chat-row"><strong>Race Modifier</strong><span>${raceModifier > 0 ? "+" : ""}${raceModifier}d10</span></div>` : ""
    });
  }

  async rollDamage({ dice, hardiness, open = false, label = "Damage", modifier = 0, extraWounds = 0, note = "" } = {}) {
    return OgreGateRoll.damage({
      actor: this,
      label,
      dice,
      hardiness,
      open,
      modifier,
      extraWounds,
      note
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
      ranks: endurance.ranks,
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

  async applyWounds(amount = 1) {
    amount = Math.max(0, Math.trunc(amount));
    const wounds = this.system.resources.wounds;
    return this.update({ "system.resources.wounds.value": Math.max(wounds.min, wounds.value - amount) });
  }

  async healWounds(amount = 1) {
    amount = Math.max(0, Math.trunc(amount));
    const wounds = this.system.resources.wounds;
    const next = Math.min(wounds.max, wounds.value + amount);
    const updates = { "system.resources.wounds.value": next };
    if (next > 0) updates["system.combat.dyingRoundsElapsed"] = 0;
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
