import { OGRE_GATE } from "./config.mjs";

const fields = foundry.data.fields;
const {
  ArrayField,
  BooleanField,
  HTMLField,
  NumberField,
  SchemaField,
  StringField
} = fields;

function numberField(initial = 0, options = {}) {
  return new NumberField({ required: true, integer: true, initial, ...options });
}

function textField(initial = "") {
  return new StringField({ required: true, blank: true, initial });
}

function resourceSchema(value = 0, max = 0) {
  return new SchemaField({
    value: numberField(value, { min: 0 }),
    min: numberField(0, { min: 0 }),
    max: numberField(max, { min: 0 })
  });
}

function expertiseEntrySchema() {
  return new SchemaField({
    name: textField(""),
    note: textField("")
  });
}

function rankSchema(label = "", max = 6, hardMax = 10) {
  return new SchemaField({
    label: textField(label),
    ranks: numberField(0, { min: 0, max: hardMax }),
    modifier: numberField(0, { min: -10, max: 10 }),
    drain: numberField(0, { min: 0, max: 20 }),
    expertise: textField(""),
    expertiseNote: textField(""),
    expertiseList: new ArrayField(expertiseEntrySchema()),
    max: numberField(max, { min: 0, max: hardMax })
  });
}

function defenseSchema(key) {
  const defense = OGRE_GATE.defenses[key];
  return new SchemaField({
    label: textField(defense.label),
    base: numberField(defense.base, { min: 0, max: 10 }),
    ranks: numberField(0, { min: 0, max: 10 }),
    qiBonus: numberField(0, { min: 0, max: 10 }),
    modifier: numberField(0, { min: -10, max: 10 }),
    drain: numberField(0, { min: 0, max: 20 }),
    expertise: textField(""),
    expertiseNote: textField(""),
    rating: numberField(defense.base, { min: 0, max: 10 })
  });
}

function skillGroupSchema(groupKey) {
  const group = OGRE_GATE.skillGroups[groupKey];
  return new SchemaField(
    Object.fromEntries(Object.entries(group.skills).map(([key, label]) => [key, rankSchema(label)]))
  );
}

function skillSchema() {
  return new SchemaField(
    Object.fromEntries(Object.keys(OGRE_GATE.skillGroups).map((key) => [key, skillGroupSchema(key)]))
  );
}

function disciplineSchema() {
  return new SchemaField(
    Object.fromEntries(Object.entries(OGRE_GATE.disciplines).map(([key, label]) => [key, rankSchema(label, 12, 12)]))
  );
}

function identitySchema() {
  return new SchemaField({
    martialTier: textField("martialHero"),
    nickname: textField(""),
    martialName: textField(""),
    celestialTitle: textField(""),
    sifu: textField(""),
    player: textField(""),
    height: textField(""),
    heightWeight: textField(""),
    weight: textField(""),
    sex: textField(""),
    titles: textField(""),
    campaign: textField(""),
    homelandClan: textField(""),
    sect: textField(""),
    occupation: textField(""),
    family: textField(""),
    reputation: textField(""),
    age: textField("")
  });
}

function creationSchema() {
  return new SchemaField({
    race: textField("human"),
    subgroup: textField(""),
    optionalRaceApproved: new BooleanField({ required: true, initial: false }),
    scholarOption: new BooleanField({ required: true, initial: false }),
    kithiriSocialPenalty: new BooleanField({ required: true, initial: true }),
    primaryGroup1: textField("combat"),
    primaryGroup2: textField("physical"),
    bonusSkillPoints: numberField(0, { min: 0 }),
    ironHeroes: new BooleanField({ required: true, initial: false })
  });
}

function notesSchema() {
  return new SchemaField({
    biography: new HTMLField({ required: true, blank: true }),
    family: new HTMLField({ required: true, blank: true }),
    grudges: new HTMLField({ required: true, blank: true }),
    experience: new HTMLField({ required: true, blank: true }),
    goals: new HTMLField({ required: true, blank: true }),
    status: new HTMLField({ required: true, blank: true }),
    description: new HTMLField({ required: true, blank: true }),
    special: new HTMLField({ required: true, blank: true })
  });
}

function moneySchema() {
  return new SchemaField({
    taels: numberField(0, { min: 0 }),
    imperials: numberField(0, { min: 0 }),
    spades: numberField(0, { min: 0 }),
    liangs: numberField(0, { min: 0 }),
    paperCurrency: textField("")
  });
}

function combatSchema() {
  return new SchemaField({
    action: textField("skillAndMove"),
    attackMode: textField("normal"),
    pendingDamageBonus: numberField(0, { min: 0, max: 20 }),
    chargeDistance: numberField(0, { min: 0, max: 1000 }),
    mountedBowShot: new BooleanField({ required: true, initial: false }),
    situationalDice: numberField(0, { min: -10, max: 10 }),
    situationalDefense: numberField(0, { min: -10, max: 10 }),
    cover: textField("none"),
    illumination: textField("normal"),
    dying: new BooleanField({ required: true, initial: false }),
    stabilized: new BooleanField({ required: true, initial: false }),
    dyingRoundsElapsed: numberField(0, { min: 0 }),
    fasterHealing: new BooleanField({ required: true, initial: false }),
    healingAmount: numberField(1, { min: 1, max: 99 }),
    controlledStrike: new BooleanField({ required: true, initial: false })
  });
}

function preparedStrikeSchema() {
  return new SchemaField({
    ready: new BooleanField({ required: true, initial: false }),
    zone: textField(""),
    trigger: textField("")
  });
}

function afflictionSchema() {
  return new SchemaField({
    name: textField(""),
    type: textField("poison"),
    medicineTn: numberField(6, { min: 1, max: 10 }),
    interval: textField("hours"),
    antidoteRequired: new BooleanField({ required: true, initial: false }),
    antidoteApplied: new BooleanField({ required: true, initial: false }),
    status: textField("untreated"),
    notes: textField("")
  });
}

function techniqueEntrySchema() {
  return new SchemaField({
    name: textField(""),
    type: textField("normal"),
    discipline: textField(""),
    notes: textField("")
  });
}

function trackerEntrySchema() {
  return new SchemaField({
    name: textField(""),
    introduction: textField(""),
    status: textField(""),
    goal: textField("")
  });
}

class OgreGateBaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identity: identitySchema(),
      creation: creationSchema(),
      resources: new SchemaField({
        wounds: resourceSchema(3, 3),
        qi: resourceSchema(1, 6)
      }),
      qi: new SchemaField({
        rank: numberField(1, { min: 0, max: 12 }),
        temporary: numberField(0, { min: 0, max: 99 })
      }),
      imbalance: new SchemaField({
        value: numberField(0, { min: 0 }),
        max: numberField(13, { min: 0 }),
        autoMax: new BooleanField({ required: true, initial: true })
      }),
      karma: new SchemaField({
        value: numberField(0, { min: -10, max: 10 })
      }),
      defenses: new SchemaField(
        Object.fromEntries(Object.keys(OGRE_GATE.defenses).map((key) => [key, defenseSchema(key)]))
      ),
      skills: skillSchema(),
      disciplines: disciplineSchema(),
      movement: new SchemaField({
        land: numberField(30, { min: 0 }),
        swim: numberField(10, { min: 0 }),
        climb: numberField(10, { min: 0 }),
        fly: numberField(0, { min: 0 })
      }),
      combat: combatSchema(),
      preparedStrike: preparedStrikeSchema(),
      affliction: afflictionSchema(),
      status: new SchemaField({
        woundState: textField("healthy"),
        effectiveQi: numberField(1, { min: 0 }),
        imbalanceRating: numberField(0, { min: 0 }),
        dyingRoundsMax: numberField(0, { min: 0 })
      }),
      notes: notesSchema(),
      family: new SchemaField({
        siblings: textField(""),
        birthOrder: textField(""),
        mother: textField(""),
        father: textField(""),
        sisters: textField(""),
        brothers: textField(""),
        swornFamily: textField(""),
        others: textField("")
      }),
      money: moneySchema(),
      equipmentNotes: new HTMLField({ required: true, blank: true }),
      flaws: new HTMLField({ required: true, blank: true }),
      techniques: new ArrayField(techniqueEntrySchema()),
      npcTracker: new ArrayField(trackerEntrySchema())
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.status.effectiveQi = Math.max(0, this.qi.rank - this.qi.temporary);
    this.resources.qi.value = this.status.effectiveQi;
    this.resources.qi.max = Math.max(6, this.qi.rank);
    this.resources.wounds.max = this.creation.ironHeroes
      ? (this.qi.rank * 3) + 3
      : Math.max(1, (this.qi.rank * 2) + 1);
    this.resources.wounds.value = Math.clamp(this.resources.wounds.value, this.resources.wounds.min, this.resources.wounds.max);

    if (this.imbalance.autoMax) this.imbalance.max = 12 + this.qi.rank;
    this.imbalance.value = Math.clamp(this.imbalance.value, 0, this.imbalance.max);

    for (const defense of Object.values(this.defenses)) {
      defense.rating = Math.clamp(defense.base + defense.ranks + defense.qiBonus + defense.modifier - defense.drain, 0, 10);
    }

    const action = OGRE_GATE.combatActions[this.combat.action] ?? OGRE_GATE.combatActions.skillAndMove;
    const attackMode = OGRE_GATE.attackModes[this.combat.attackMode] ?? OGRE_GATE.attackModes.normal;
    const cover = OGRE_GATE.cover[this.combat.cover] ?? OGRE_GATE.cover.none;
    const illumination = OGRE_GATE.illumination[this.combat.illumination] ?? OGRE_GATE.illumination.normal;
    const defenseModifier = Number(action.defense ?? 0)
      + Number(attackMode.defense ?? 0)
      + Number(this.combat.situationalDefense ?? 0)
      + Number(illumination.defense ?? 0);
    this.defenses.parry.rating = Math.clamp(this.defenses.parry.rating + defenseModifier + cover.parry, 0, 10);
    this.defenses.evade.rating = Math.clamp(this.defenses.evade.rating + defenseModifier + cover.evade, 0, 10);
    this.defenses.stealth.rating = Math.clamp(this.defenses.stealth.rating + Number(illumination.stealth ?? 0), 0, 10);

    const speed = Math.max(0, this.skills.physical.speed.ranks - this.skills.physical.speed.drain) + this.skills.physical.speed.modifier;
    const swim = Math.max(0, this.skills.physical.swim.ranks - this.skills.physical.swim.drain) + this.skills.physical.swim.modifier;
    const athletics = Math.max(0, this.skills.physical.athletics.ranks - this.skills.physical.athletics.drain) + this.skills.physical.athletics.modifier;
    this.movement.land = 30 + (Math.max(0, speed) * 10);
    this.movement.swim = 10 + (Math.max(0, swim) * 5);
    this.movement.climb = 10 + (Math.max(0, athletics) * 5);
    this.status.imbalanceRating = Math.max(...Object.values(this.disciplines).map((discipline) => discipline.ranks));
    this.status.dyingRoundsMax = this.defenses.hardiness.rating;
    if (this.resources.wounds.value > 0) this.combat.stabilized = false;
    this.combat.dying = this.resources.wounds.value <= 0 && !this.combat.stabilized;
    if (this.combat.dying) this.status.woundState = "dying";
    else if (this.resources.wounds.value <= 0) this.status.woundState = "incapacitated";
    else if (this.resources.wounds.value < (this.resources.wounds.max / 2)) this.status.woundState = "bloodied";
    else if (this.resources.wounds.value < this.resources.wounds.max) this.status.woundState = "wounded";
    else this.status.woundState = "healthy";
  }
}

export class OgreGateCharacterData extends OgreGateBaseActorData {}

export class OgreGateNpcData extends OgreGateBaseActorData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      quickReference: new SchemaField({
        fate: textField(""),
        flaws: textField(""),
        exploits: textField(""),
        crimes: textField(""),
        partyFate: textField(""),
        guidesServants: textField(""),
        allies: textField(""),
        enemies: textField("")
      })
    };
  }
}

export class OgreGateMonsterData extends OgreGateNpcData {}

class OgreGateBaseItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: textField(""),
      cost: textField("")
    };
  }
}

export class OgreGateWeaponData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      category: textField("mediumMelee"),
      attackSkill: textField("mediumMelee"),
      targetDefense: textField("parry"),
      damageSkill: textField("muscle"),
      damageDice: numberField(1, { min: -1, max: 10 }),
      accuracyModifier: numberField(0, { min: -10, max: 10 }),
      muscleRequirement: numberField(0, { min: 0, max: 10 }),
      lethal: new BooleanField({ required: true, initial: true }),
      damageType: textField("sharp"),
      reach: textField("normal"),
      openDamage: new BooleanField({ required: true, initial: false }),
      qualities: textField("")
    };
  }
}

export class OgreGateArmorData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      armorKey: textField("custom"),
      equipped: new BooleanField({ required: true, initial: false }),
      defenseModifier: numberField(0, { min: -10, max: 10 }),
      penalty: numberField(0, { min: -10, max: 10 }),
      sharpReduction: numberField(0, { min: 0, max: 10 }),
      bluntReduction: numberField(0, { min: 0, max: 10 }),
      mightyReduction: numberField(0, { min: 0, max: 10 }),
      arrowReduction: numberField(0, { min: 0, max: 10 }),
      speedPenalty: numberField(0, { min: 0, max: 10 }),
      parryBonus: numberField(0, { min: 0, max: 10 }),
      evadeBonus: numberField(0, { min: 0, max: 10 }),
      muscleRequirement: numberField(0, { min: 0, max: 10 }),
      shield: new BooleanField({ required: true, initial: false }),
      qualities: textField("")
    };
  }
}

export class OgreGateEquipmentData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      quantity: numberField(1, { min: 0 }),
      weight: textField("")
    };
  }
}

export class OgreGateTechniqueData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      discipline: textField("waijia"),
      techniqueType: textField("normal"),
      activationSkill: textField(""),
      qiRank: numberField(1, { min: 0, max: 12 }),
      qiCost: numberField(0, { min: 0, max: 99 }),
      damage: textField(""),
      openDamage: new BooleanField({ required: true, initial: false }),
      counter: textField("")
    };
  }
}

export class OgreGateCombatTechniqueData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      skill: textField(""),
      group: textField(""),
      bonus: textField("+1d10"),
      xpCost: numberField(12, { min: 0 }),
      damageEffect: textField("")
    };
  }
}

export class OgreGateSkillData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      group: textField("combat"),
      skillKey: textField(""),
      ranks: numberField(0, { min: 0, max: 10 }),
      modifier: numberField(0, { min: -10, max: 10 }),
      drain: numberField(0, { min: 0, max: 20 }),
      expertise: textField(""),
      expertiseNote: textField(""),
      expertiseList: new ArrayField(expertiseEntrySchema())
    };
  }
}

export class OgreGateRitualData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      activation: textField(""),
      requirements: textField(""),
      effects: textField("")
    };
  }
}

export class OgreGateFlawData extends OgreGateBaseItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      flawKey: textField(""),
      category: textField("standard"),
      skillPointValue: numberField(1, { min: 0, max: 10 }),
      acquiredAtCreation: new BooleanField({ required: true, initial: true }),
      exemptFromCreationLimit: new BooleanField({ required: true, initial: false }),
      requiresResolveTest: new BooleanField({ required: true, initial: false }),
      penalty: textField("")
    };
  }
}
