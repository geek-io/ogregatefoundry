import { OGRE_GATE } from "./config.mjs";
import { OgreGateRoll } from "./rolls.mjs";

export class OgreGateActor extends Actor {
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
    return OgreGateRoll.skill({
      actor: this,
      label,
      ranks: skill.ranks,
      modifier: skill.modifier + Number(illumination.dice ?? 0) + Number(options.modifier ?? 0),
      tn: options.tn ?? 6,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties
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
    const actionModifier = Number(action.skill ?? 0);
    const totalModifier = skill.modifier
      + actionModifier
      + Number(attackMode.attack ?? 0)
      + Number(illumination.dice ?? 0)
      + Number(this.system.combat.situationalDice ?? 0)
      + Number(options.modifier ?? 0);

    return OgreGateRoll.attack({
      actor: this,
      label: `${item.name} Attack`,
      ranks: skill.ranks,
      modifier: totalModifier,
      defense: defenseLabel,
      mode: attackMode.label,
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

    return this.rollDamage({
      label: `${item.name} Damage`,
      dice: Number(item.system.damageDice ?? 0) + skillRanks,
      hardiness: options.hardiness ?? 6,
      open: item.system.openDamage || options.open || attackMode.openDamage,
      modifier: Number(options.modifier ?? 0) + Number(attackMode.damage ?? 0),
      extraWounds: Number(options.extraWounds ?? 0) + modeExtraWounds + controlledReduction,
      note: [
        attackMode.label,
        attackMode.nonLethal ? "Non-lethal" : "",
        controlledStrike ? "Controlled Strike" : "",
        attackMode.damageDefense ? `Use target ${OGRE_GATE.defenses[attackMode.damageDefense]?.label ?? attackMode.damageDefense} as damage TN` : ""
      ].filter(Boolean).join(" | ")
    });
  }

  async rollTurnOrder(options = {}) {
    const speed = this.system.skills.physical.speed;
    return OgreGateRoll.skill({
      actor: this,
      label: "Turn Order",
      ranks: speed.ranks,
      modifier: speed.modifier + Number(options.modifier ?? 0),
      tn: 1,
      rollMode: options.rollMode,
      deepPenalties: this.system.combat.deepPenalties
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
    const next = wounds.value + amount;
    const updates = { "system.resources.wounds.value": Math.min(wounds.max, next) };
    if (next > wounds.max) updates["system.combat.dying"] = true;
    return this.update(updates);
  }

  async healWounds(amount = 1) {
    amount = Math.max(0, Math.trunc(amount));
    const wounds = this.system.resources.wounds;
    return this.update({ "system.resources.wounds.value": Math.max(wounds.min, wounds.value - amount) });
  }
}

export class OgreGateItem extends Item {
  get isTechnique() {
    return this.type === "technique";
  }
}
