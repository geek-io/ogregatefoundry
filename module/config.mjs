export const OGRE_GATE = {
  id: "ogregatefoundry",
  shortName: "Ogre Gate",
  skillCap: 6,
  hardCap: 10,
  creation: {
    primaryBudget: 12,
    secondaryBudget: 6,
    scholarKnowledgeBudget: 24,
    disciplineRanks: 4,
    startingKungFuTechniques: 6,
    startingCombatTechniques: 1,
    startingQi: 1,
    startingSpadeCoins: 2000
  },
  flawLimit: {
    standard: 2,
    exemptFromLimit: ["fated"]
  },
  conditionModifiers: {
    worst: { label: "Worst", dice: -3, defense: -3 },
    awful: { label: "Awful", dice: -2, defense: -2 },
    bad: { label: "Bad", dice: -1, defense: -1 },
    average: { label: "Average", dice: 0, defense: 0 },
    good: { label: "Good", dice: 1, defense: 1 },
    ideal: { label: "Ideal", dice: 2, defense: 2 },
    perfect: { label: "Perfect", dice: 3, defense: 3 }
  },
  targetNumbers: {
    1: "Routine",
    3: "Simple",
    5: "Challenging",
    7: "Hard",
    9: "Extremely Difficult",
    10: "Exceptional"
  },
  combatActions: {
    skillAndMove: { label: "Skill Roll and Move", skill: 0, defense: 0, moves: 1 },
    moveAndSkill: { label: "Move and Skill Roll", skill: 0, defense: 0, moves: 1 },
    moveTwice: { label: "Move Twice; No Skill Roll", skill: null, defense: 0, moves: 2 },
    moveDefend: { label: "One Move; No Skill Roll; +1 Defense", skill: null, defense: 1, moves: 1 },
    focusSkill: { label: "No Move; +1d10 Skill Roll", skill: 1, defense: 0, moves: 0 },
    fullDefense: { label: "No Move; No Skill Roll; +2 Defense", skill: null, defense: 2, moves: 0 }
  },
  attackModes: {
    normal: { label: "Normal Attack", attack: 0, damage: 0, extraWounds: 0, openDamage: false, nonLethal: false },
    prepared: { label: "Prepared Strike", attack: 0, damage: 0, extraWounds: 0, openDamage: false, nonLethal: false, workflow: "Forgo your normal attack to ready one attack against an anticipated zone; interrupt when a target enters it." },
    targetedVital: { label: "Targeted Strike: Vital", attack: -1, damage: 1, extraWounds: 0, openDamage: false, nonLethal: false },
    targetedNonVital: { label: "Targeted Strike: Non-Vital", attack: -1, damage: 0, extraWounds: 0, openDamage: false, nonLethal: true },
    aimed: { label: "Aimed Strike", attack: 1, damage: 0, extraWounds: 0, openDamage: false, nonLethal: false, workflow: "Spend a full round aiming; if uninterrupted, attack next round with +1d10." },
    maim: { label: "Maiming", attack: -1, damage: 0, extraWounds: 0, openDamage: false, nonLethal: false, outcome: "maim", workflow: "Declare before attacking. If the attack succeeds and damage rolls two total successes, apply an appropriate flaw such as Blind or Missing Limb." },
    disarm: { label: "Disarm", attack: 0, damage: 0, extraWounds: 0, openDamage: false, nonLethal: true, damageDefense: "parry", outcome: "disarm", workflow: "Roll damage against Parry instead of Hardiness. If the weapon is not suited for disarming, add a -3d10 attack penalty manually." },
    surprise: { label: "Surprise", attack: 0, damage: 0, extraWounds: 0, openDamage: true, nonLethal: false },
    mounted: { label: "Mounted Attack", attack: 1, damage: 0, extraWounds: 0, openDamage: false, nonLethal: false, workflow: "Mounted attackers gain +1d10 against unmounted foes; mounted bow shots take -1d10 unless a rule overrides it." },
    mountedCharge: { label: "Mounted Charge", attack: 1, damage: 0, extraWounds: 1, openDamage: false, nonLethal: false, workflow: "Move at least 25 feet in a straight line and continue past the target; add one extra wound if damage succeeds." },
    charge: { label: "Charge on Foot", attack: 0, damage: 1, defense: -1, extraWounds: 0, openDamage: false, nonLethal: false, workflow: "Move at least 20 feet in a straight line and engage; reach rules still apply." }
  },
  cover: {
    none: { label: "None", evade: 0, parry: 0 },
    slight: { label: "Slight Cover", evade: 1, parry: 0 },
    medium: { label: "Medium Cover", evade: 2, parry: 0 },
    full: { label: "Full Cover", evade: 3, parry: 0 },
    prone: { label: "Prone", evade: 1, parry: -1 }
  },
  reachCategories: {
    none: "No Reach",
    normal: "Normal Reach",
    long: "Long Reach"
  },
  reachValues: {
    none: 0,
    normal: 1,
    long: 2
  },
  weaponDamageTypes: {
    none: "None",
    sharp: "Sharp",
    blunt: "Blunt",
    mighty: "Mighty",
    fire: "Fire",
    special: "Special"
  },
  reachSituations: {
    none: { label: "No Reach Adjustment", tooltip: "No closing or inside-reach modifier applies." },
    closing: { label: "Closing This Round", tooltip: "Compare weapon reach categories when combatants first close. Higher reach gains +1d10; lower reach takes -1d10." },
    longAdjacent: { label: "Long Reach Adjacent", tooltip: "A long-reach weapon attacking an adjacent foe after closing takes -1d10." },
    insideLong: { label: "No Reach Inside Long Reach", tooltip: "A no-reach attacker adjacent to a long-reach weapon gains +1d10." }
  },
  combatSkillDefense: {
    armStrike: "parry",
    legStrike: "parry",
    grapple: "parry",
    throw: "parry",
    lightMelee: "parry",
    mediumMelee: "parry",
    heavyMelee: "parry",
    smallRanged: "evade",
    largeRanged: "evade"
  },
  objectTns: {
    1: { evade: "Cannot Miss", composition: "Fragile", hardiness: 1, integrity: 1 },
    2: { evade: "Large Stationary", composition: "Thin Wood", hardiness: 2, integrity: 2 },
    3: { evade: "Medium Stationary", composition: "Thin Stone", hardiness: 3, integrity: 3 },
    4: { evade: "Small Stationary", composition: "Thin Metal", hardiness: 4, integrity: 4 },
    5: { evade: "Large Moving", composition: "Thick Wood", hardiness: 5, integrity: 5 },
    6: { evade: "Medium Moving", composition: "Thick Stone", hardiness: 6, integrity: 6 },
    7: { evade: "Small Moving", composition: "Thick Metal", hardiness: 7, integrity: 7 },
    8: { evade: "Large Fast-Moving", composition: "Reinforced Wood", hardiness: 8, integrity: 8 },
    9: { evade: "Medium Fast-Moving", composition: "Reinforced Stone", hardiness: 9, integrity: 9 },
    10: { evade: "Small Fast-Moving", composition: "Reinforced Metal", hardiness: 10, integrity: 10 }
  },
  fireDamage: {
    candleLamp: { label: "Candle/Lamp", dice: 0 },
    torch: { label: "Torch", dice: 1 },
    campfire: { label: "Campfire", dice: 2 },
    bonfire: { label: "Bonfire", dice: 3 },
    houseFire: { label: "House Fire", dice: 4 },
    forestFire: { label: "Forest Fire", dice: 5 },
    conflagration: { label: "Conflagration", dice: 6 }
  },
  afflictionTypes: {
    poison: "Poison",
    disease: "Disease"
  },
  afflictionIntervals: {
    none: "None",
    seconds: "Seconds",
    minutes: "Minutes",
    hours: "Hours",
    days: "Days",
    weeks: "Weeks",
    months: "Months",
    years: "Years"
  },
  substanceTypes: {
    herbalCure: "Herbal Cure",
    antidote: "Antidote",
    longevity: "Longevity Substance",
    transformative: "Transformative Substance"
  },
  illumination: {
    normal: { label: "Normal", dice: 0, defense: 0, stealth: 0 },
    dim: { label: "Dim", dice: -1, defense: -1, stealth: 1 },
    dark: { label: "Dark", dice: -2, defense: -2, stealth: 2 },
    lightsOut: { label: "Lights-Out", dice: -3, defense: -3, stealth: 3 }
  },
  defenses: {
    hardiness: { label: "Hardiness", base: 3, relevant: ["Damage"] },
    parry: { label: "Parry", base: 3, relevant: ["Arm Strike", "Throw", "Leg Strike", "Grapple", "Light Melee", "Medium Melee", "Heavy Melee"] },
    evade: { label: "Evade", base: 3, relevant: ["Small Ranged", "Large Ranged", "Thrown Melee"] },
    stealth: { label: "Stealth", base: 6, relevant: ["Detect"] },
    wits: { label: "Wits", base: 6, relevant: ["Empathy", "Deception"] },
    resolve: { label: "Resolve", base: 6, relevant: ["Persuade", "Command"] }
  },
  skillGroups: {
    defenses: {
      label: "Defenses",
      skills: {
        hardiness: "Hardiness",
        parry: "Parry",
        evade: "Evade",
        stealth: "Stealth",
        wits: "Wits",
        resolve: "Resolve"
      }
    },
    combat: {
      label: "Combat",
      skills: {
        armStrike: "Arm Strike",
        legStrike: "Leg Strike",
        grapple: "Grapple",
        throw: "Throw",
        lightMelee: "Light Melee",
        mediumMelee: "Medium Melee",
        heavyMelee: "Heavy Melee",
        smallRanged: "Small Ranged",
        largeRanged: "Large Ranged"
      }
    },
    specialist: {
      label: "Specialist",
      skills: {
        medicine: "Medicine",
        divination: "Divination",
        meditation: "Meditation",
        talent1: "Talent",
        talent2: "Talent",
        trade1: "Trade",
        trade2: "Trade",
        survival1: "Survival",
        survival2: "Survival",
        ritual1: "Ritual",
        ritual2: "Ritual",
        ritual3: "Ritual"
      }
    },
    mental: {
      label: "Mental",
      skills: {
        command: "Command",
        persuade: "Persuade",
        deception: "Deception",
        empathy: "Empathy",
        reasoning: "Reasoning",
        detect: "Detect"
      }
    },
    physical: {
      label: "Physical",
      skills: {
        athletics: "Athletics",
        swim: "Swim",
        speed: "Speed",
        muscle: "Muscle",
        endurance: "Endurance",
        ride: "Ride",
        sail: "Sail"
      }
    },
    knowledge: {
      label: "Knowledge",
      skills: {
        history1: "History",
        history2: "History",
        creatures1: "Creatures",
        creatures2: "Creatures",
        placesCultures1: "Places/Cultures",
        placesCultures2: "Places/Cultures",
        martialDisciplines1: "Martial Disc.",
        martialDisciplines2: "Martial Disc.",
        institutions1: "Institutions",
        institutions2: "Institutions",
        language1: "Language",
        language2: "Language",
        readScript1: "Read Script",
        readScript2: "Read Script",
        religionGods1: "Religion/Gods",
        religionGods2: "Religion/Gods",
        classics1: "Classics",
        classics2: "Classics"
      }
    }
  },
  skillDescriptions: {
    hardiness: "Resist wounds, harsh punishment, and damage effects.",
    parry: "Defend against melee attacks and close combat strikes.",
    evade: "Avoid ranged attacks, thrown weapons, and attacks you dodge instead of meet.",
    stealth: "Avoid notice, hide movement, and oppose attempts to detect you.",
    wits: "React quickly in social or perceptive situations and resist deception.",
    resolve: "Stand firm against pressure, fear, persuasion, and command.",
    armStrike: "Unarmed hand, fist, palm, elbow, and arm-based attacks.",
    legStrike: "Unarmed kicks, knees, sweeps, and leg-based attacks.",
    grapple: "Seize, hold, restrain, and struggle in close quarters.",
    throw: "Throw, trip, or redirect a foe using body mechanics.",
    lightMelee: "Use fast or light hand weapons.",
    mediumMelee: "Use standard melee weapons.",
    heavyMelee: "Use large or heavy melee weapons.",
    smallRanged: "Use small ranged weapons.",
    largeRanged: "Use large ranged weapons.",
    medicine: "Diagnose, treat, perform surgery, and handle medical care.",
    divination: "Read omens, tell fortunes, and interpret the will of Heaven.",
    meditation: "Recover, center yourself, and pursue insight through meditative practice.",
    talent: "Perform or create with a chosen artistic or unusual talent.",
    trade: "Practice a craft, profession, or practical livelihood.",
    survival: "Forage, shelter, harvest, fish, travel, and endure the wild.",
    ritual: "Perform or understand ritual procedures.",
    command: "Lead, intimidate, extract obedience, and direct others.",
    persuade: "Convince, charm, bargain, and influence through sincerity or appeal.",
    deception: "Lie, disguise, deny, misdirect, and tell convincing falsehoods.",
    empathy: "Read emotion, intention, and social cues.",
    reasoning: "Analyze information, recall conclusions, and solve intellectual problems.",
    detect: "Notice hidden things, sense danger, and spot details.",
    athletics: "Climb, leap, balance, and perform athletic movement.",
    swim: "Swim, dive, and move quickly in water.",
    speed: "Act quickly, pursue, elude, and determine turn order.",
    muscle: "Lift, break, shove, and apply raw strength.",
    endurance: "Withstand exposure, fatigue, long exertion, and bodily stress.",
    ride: "Control mounts and race or maneuver while mounted.",
    sail: "Handle boats and ships, including navigation and battle handling.",
    history: "Know historical events, eras, people, and places.",
    creatures: "Know animals, monsters, and unusual beings.",
    placesCultures: "Know regions, cities, peoples, customs, and cultures.",
    martialDisciplines: "Know martial traditions, techniques, and their reputations.",
    institutions: "Know organizations, formalities, symbols, and important members.",
    language: "Speak or understand a selected language.",
    readScript: "Read a selected script.",
    religionGods: "Know religious history, teachings, gods, and practices.",
    classics: "Know classical texts, commentaries, and memorized passages."
  },
  disciplines: {
    waijia: "Waijia",
    qinggong: "Qinggong",
    neigong: "Neigong",
    dianxue: "Dianxue"
  },
  techniqueTypes: {
    normal: "Normal",
    counter: "Counter",
    stance: "Stance",
    special: "Special",
    profound: "Profound",
    immortal: "Immortal",
    other: "Other"
  },
  qiSpirits: {
    1: "Fox Spirit",
    2: "Ogre Spirit",
    3: "Water Spirit/Snake Spirit",
    4: "Vulture Spirit",
    5: "Compassionate Spirit",
    6: "Swallow Spirit",
    7: "Bull Spirit",
    8: "Wolf Spirit",
    9: "Unique Spirit",
    10: "Pig Spirit"
  },
  itemTypes: {
    weapon: "Weapon",
    armor: "Armor",
    equipment: "Equipment",
    skills: "Skills",
    technique: "Kung Fu Technique",
    combatTechnique: "Combat Perk",
    ritual: "Ritual",
    flaw: "Flaw",
    affliction: "Poison or Disease",
    substance: "Substance"
  },
  races: {
    human: "Human",
    kithiri: "Kithiri",
    hechi: "Hechi",
    juren: "Juren",
    ouyan: "Ouyan"
  },
  raceRules: {
    human: {
      advantages: "None",
      penalties: "None",
      gift: "None"
    },
    hechi: {
      advantages: "+1d10 Endurance",
      penalties: "-2d10 Athletics and Speed; -1d10 Combat Skills",
      gift: "Horn of Truth"
    },
    juren: {
      advantages: "Beast Strength x2; free Muscle rank; +1d10 melee damage",
      penalties: "-2d10 Speed; -1d10 Mental Skills; Wits costs double and caps at 2",
      gift: "Four Arms"
    },
    ouyan: {
      advantages: "None",
      penalties: "-1d10 Physical Skills",
      gift: "Third Eye"
    },
    kithiri: {
      advantages: "Free rank in Empathy, Reasoning, and Wits; half-cost Knowledge",
      penalties: "-1d10 Command, Deception, and Persuade against non-Kithiri; Multi-Ego",
      gift: "Flexible Mind"
    }
  },
  expertiseOptions: {
    armStrike: [],
    legStrike: [],
    grapple: [],
    throw: [],
    lightMelee: ["Select Weapon"],
    mediumMelee: ["Select Weapon"],
    heavyMelee: ["Select Weapon"],
    smallRanged: ["Select Weapon"],
    largeRanged: ["Select Weapon"],
    medicine: ["Diagnose", "Surgery", "Treat"],
    divination: ["Fortune Telling", "Will of Heaven"],
    meditation: ["Recover Health", "Insight"],
    talent: ["Perform", "Composition"],
    trade: ["Medium"],
    survival: ["Forage/Shelter", "Harvest/Fish", "Travel"],
    ritual: [],
    athletics: ["Climb", "Leap", "Sports"],
    swim: ["Diving", "Fast"],
    speed: ["Elude", "Initiative", "Pursue"],
    muscle: ["Break", "Lift"],
    endurance: ["Exposure", "Marathon"],
    ride: ["Maneuver", "Race"],
    sail: ["Battle", "Navigation"],
    command: ["Lead", "Extract"],
    persuade: ["Charm", "Convince"],
    deception: ["Denial", "Disguise", "Tall Tale"],
    empathy: ["Emotion", "Intention"],
    reasoning: ["Information", "Recollection", "Wits"],
    detect: ["Sense"],
    history: ["City/Topic"],
    creatures: ["Specific"],
    placesCultures: ["City or Tribe"],
    martialDisciplines: ["Specific Technique"],
    institutions: ["Formalities", "People", "Symbols"],
    language: [],
    readScript: [],
    religionGods: ["History", "Teachings"],
    classics: ["Commentary", "Rote Memorization"]
  },
  flawRules: {
    awkward: { label: "Awkward", points: 1, category: "standard" },
    blind: { label: "Blind", points: 2, category: "standard" },
    blockedAccupoints: { label: "Blocked Accupoints", points: 1, category: "standard" },
    cowardly: { label: "Cowardly", points: 1, category: "standard" },
    enemy: { label: "Enemy", points: 1, category: "standard" },
    fated: { label: "Fated", points: 2, category: "standard", exemptFromCreationLimit: true },
    foulTempered: { label: "Foul-Tempered", points: 1, category: "standard" },
    greedy: { label: "Greedy", points: 1, category: "standard" },
    hedonist: { label: "Hedonist", points: 1, category: "standard" },
    lame: { label: "Lame", points: 1, category: "standard" },
    lazy: { label: "Lazy", points: 2, category: "standard" },
    missingLimb: { label: "Missing Limb", points: 2, category: "standard" },
    phoenixSpirit: { label: "Missing/Disrupted Phoenix Spirit", points: 1, category: "standard" },
    secret: { label: "Secret", points: 1, category: "standard" },
    secretlyEvil: { label: "Secretly Evil", points: 3, category: "standard" },
    sickly: { label: "Sickly", points: 1, category: "standard" },
    ungainly: { label: "Ungainly", points: 1, category: "standard" },
    unintelligent: { label: "Unintelligent", points: 1, category: "standard" },
    weakWilled: { label: "Weak-Willed", points: 1, category: "standard" },
    whiteHair: { label: "White Hair", points: 1, category: "standard" },
    demon: { label: "Demon Flaw", points: 0, category: "demon" }
  },
  combatTechniqueGroups: {
    unarmed: "Arm Strike, Leg Strike, Grappling, Throwing",
    generalMelee: "General Melee",
    lightMelee: "Light Melee",
    mediumMelee: "Medium Melee",
    heavyMelee: "Heavy Melee",
    smallRanged: "Small Ranged",
    largeRanged: "Large Ranged"
  },
  armorRules: {
    custom: {
      label: "Custom",
      cost: "",
      sharpReduction: 0,
      bluntReduction: 0,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 0,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: ""
    },
    cordPlaqueAncient: {
      label: "Cord and Plaque Armor (Ancient)",
      cost: "5000",
      sharpReduction: 2,
      bluntReduction: 2,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 3,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Restrictive heavy armor. Protects only against mundane attacks."
    },
    ironLamellar: {
      label: "Iron Lamellar",
      cost: "2500",
      sharpReduction: 1,
      bluntReduction: 1,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 1,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Protects only against mundane attacks."
    },
    lacqueredIronPlates: {
      label: "Lacquered Iron Plates",
      cost: "8000",
      sharpReduction: 2,
      bluntReduction: 2,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 2,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Protects only against mundane attacks."
    },
    leatherLamellar: {
      label: "Leather Lamellar",
      cost: "500",
      sharpReduction: 0,
      bluntReduction: 1,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 0,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Protects only against mundane attacks."
    },
    paperScale: {
      label: "Paper Scale Armor",
      cost: "3000",
      sharpReduction: 0,
      bluntReduction: 0,
      mightyReduction: 0,
      arrowReduction: 2,
      speedPenalty: 0,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Arrows suffer -2d10 damage. Protects only against mundane attacks."
    },
    scale: {
      label: "Scale Armor",
      cost: "4000",
      sharpReduction: 0,
      bluntReduction: 2,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 1,
      parryBonus: 0,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: false,
      notes: "Protects only against mundane attacks."
    },
    wickerShield: {
      label: "Wicker Shield",
      cost: "100",
      sharpReduction: 0,
      bluntReduction: 0,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 0,
      parryBonus: 1,
      evadeBonus: 0,
      muscleRequirement: 0,
      shield: true,
      notes: "Shields do not protect against Kung Fu Techniques."
    },
    combatShield: {
      label: "Combat Shield",
      cost: "325",
      sharpReduction: 0,
      bluntReduction: 0,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 0,
      parryBonus: 2,
      evadeBonus: 0,
      muscleRequirement: 1,
      shield: true,
      notes: "Shields do not protect against Kung Fu Techniques."
    },
    siegeShield: {
      label: "Siege Shield",
      cost: "600",
      sharpReduction: 0,
      bluntReduction: 0,
      mightyReduction: 0,
      arrowReduction: 0,
      speedPenalty: 2,
      parryBonus: 0,
      evadeBonus: 3,
      muscleRequirement: 2,
      shield: true,
      notes: "Evade bonus represents cover. Shields do not protect against Kung Fu Techniques."
    }
  }
};
