import { fullSkillDescription } from "./full-skill-descriptions.mjs";

const SOURCE = "Wandering Heroes of Ogre Gate";

function closed(group, key, name, description) {
  return { group, key, name, description: fullSkillDescription(key, description), source: `${SOURCE}, Chapter 1: Skills` };
}

function open(group, key, name, options, description, source = `${SOURCE}, Chapter 1: Skills`) {
  return options.map((option) => ({
    group,
    key: `${key}.${option.key}`,
    name: `${name}: ${option.name}`,
    description: fullSkillDescription(`${key}.${option.key}`, option.description ?? `${description} Focus: ${option.name}.`),
    source
  }));
}

function choices(values) {
  return values.map(([key, name, description]) => ({ key, name, description }));
}

const combat = [
  closed("combat", "armStrike", "Arm Strike", "Use this skill for punches, elbow strikes, palm strikes, and head-butts. Make the attack against the target's Parry. An Arm Strike has no reach and its damage is Muscle -1d10 unless a technique changes it."),
  closed("combat", "legStrike", "Leg Strike", "Use this skill for kicks, knee strikes, sweeps, and drop kicks. Make the attack against Parry. A kick normally has reach and causes Muscle damage, but the attack suffers -1d10 accuracy; knee strikes may not have that reach."),
  closed("combat", "grapple", "Grapple", "Use this skill to restrain, pin, disarm, redirect, or break free. A bare-hand grapple is rolled against Parry; on a success the opponent is restrained. Maintaining restraint normally requires a successful Grapple roll each round."),
  closed("combat", "throw", "Throw", "Use this skill to throw or sweep a foe you can reach. On a success you may put the target prone nearby or throw them up to ten feet; roll Muscle against Hardiness to determine damage. A total success makes standing again more costly."),
  closed("combat", "lightMelee", "Light Melee", "Use this skill with light weapons such as daggers, fans, needles, nets, sticks, and butterfly swords. Roll against Parry in melee, or Evade when throwing an appropriate weapon; after a hit, roll the weapon's damage against Hardiness."),
  closed("combat", "mediumMelee", "Medium Melee", "Use this skill with mid-sized weapons such as jian, ox-tail dao, hook swords, and staffs. Roll against Parry in melee, or Evade when throwing an appropriate weapon; after a hit, roll weapon damage against Hardiness."),
  closed("combat", "heavyMelee", "Heavy Melee", "Use this skill with heavy weapons such as hard whips, meteor hammers, thunderbolt balls, and halberds. Roll against Parry in melee, or Evade when thrown; after a hit, roll the weapon's damage against Hardiness."),
  closed("combat", "smallRanged", "Small Ranged", "Use this skill for bows, crossbows, fire lances, short bows, and similar small ranged weapons. Make attacks against the target's Evade; on a success, roll the weapon's damage against Hardiness."),
  closed("combat", "largeRanged", "Large Ranged", "Use this skill for large ranged engines such as whirlwind catapults and triple bow ballistae. Make attacks against the target's Evade; on a success, roll the weapon's damage against Hardiness.")
];

const specialist = [
  closed("specialist", "medicine", "Medicine", "Medicine covers healing methods, examination, acupuncture, pulse reading, disease, and poison treatment. Treating wounds takes one round: success stabilizes a dying target and total success also removes one Wound. Poison and disease treatment rolls use the TN and cadence listed for the affliction."),
  closed("specialist", "divination", "Divination", "Use this skill for astrology, feng shui, matchmaking, oracle bones, oracle sticks, and similar methods of interpreting fate or Heaven's will. A success yields an accurate but broad answer; a total success is more specific. These rolls are normally made secretly by the GM."),
  closed("specialist", "meditation", "Meditation", "Meditation is fundamental to Martial Heroes and is used by many Kung Fu Techniques. Use it to address Imbalance, resist Qi Spirit possession, and pursue cultivation. A dying character can attempt to stabilize themself with Meditation against TN 7.")
];

const talents = open("specialist", "talent", "Talent", choices([
  ["brewingAlcohol", "Brewing (Alcohol)"],
  ["calligraphy", "Calligraphy"],
  ["cooking", "Cooking"],
  ["dancing", "Dancing"],
  ["disguise", "Disguise", "Talent: Disguise creates a changed appearance using clothing, cosmetics, false hair, jewelry, and similar materials. Creating the disguise takes about one hour; its roll result becomes the TN for Detect attempts to see through it. Use Deception to impersonate someone in conversation or conduct."],
  ["hawkHandling", "Hawk Handling", "Talent: Hawk Handling represents training in controlling and befriending hawks. Use it in the same general manner as Snake Charming when influencing an appropriate animal, subject to the GM's judgment."],
  ["instrument", "Instrument (Choose Instrument)"],
  ["painting", "Painting"],
  ["poetry", "Poetry"],
  ["poisoning", "Poisoning", "Talent: Poisoning covers creating and administering poison as well as brewing herbal cures. Brewing generally takes at least one hour and uses the TN of the poison or remedy. A total success improves the result; a severe failed brewing roll can expose the brewer to the toxin."],
  ["reciting", "Reciting"],
  ["scribing", "Scribing"],
  ["sculpting", "Sculpting"],
  ["shadowPuppetry", "Shadow Puppetry"],
  ["singing", "Singing"],
  ["snakeCharming", "Snake Charming", "Talent: Snake Charming is used to handle and communicate with snakes. Roll against a snake's Resolve; on a success it becomes non-hostile and friendly, and a successfully charmed individual snake remains loyal."],
  ["tattooing", "Tattooing"],
  ["teaPreparation", "Tea Preparation"],
  ["theft", "Theft", "Talent: Theft represents practical theft techniques such as lock picking and purse snatching. The GM sets the TN based on the lock, victim, observation, and circumstances."],
  ["writing", "Writing"],
  ["custom", "Custom"]
]), "Talent is an open Skill for extensive training not addressed by other Specialist Skills, such as art, performance, brewing, deception craft, poison, or theft.");

const trades = open("specialist", "trade", "Trade", choices([
  ["architectureEngineering", "Architecture and Engineering"],
  ["alchemy", "Alchemy", "Trade: Alchemy works with minerals and other elements to create substances such as dye, ink, paint, perfumes, Divine Fire, and longevity preparations. Most special substances require a relevant Expertise and materials; manufacturing usually takes hours, shortened dramatically by total success."],
  ["fabric", "Fabric"],
  ["ceramics", "Ceramics"],
  ["glass", "Glass"],
  ["hide", "Hide"],
  ["jewelry", "Jewelry"],
  ["mechanical", "Mechanical", "Trade: Mechanical creates and repairs simple devices such as locks, automata, and water wheels, and is commonly used to disarm mechanical traps."],
  ["metal", "Metal", "Trade: Metal allows work with steel and other metals, including metal tools, fittings, and weapons."],
  ["paper", "Paper"],
  ["stone", "Stone"],
  ["wood", "Wood"],
  ["custom", "Custom"]
]), "Trade is an open Skill used to build, design, repair, modify, or rig objects made in the chosen medium. Repairing or building generally takes days, while modifying or sabotaging generally takes hours; total success makes the work substantially faster.");

const survival = open("specialist", "survival", "Survival", choices([
  ["cities", "Cities"],
  ["desert", "Desert"],
  ["mountainHill", "Mountain/Hill"],
  ["plains", "Plains"],
  ["sea", "Sea"],
  ["underground", "Underground"],
  ["wilderness", "Wilderness"],
  ["custom", "Custom"]
]), "Survival is an open Skill for navigating, finding resources, making shelter, identifying useful plants, tracking, and traveling through the chosen terrain. Travel rolls prevent becoming lost or delayed; total success can cut travel time in half.");

const rituals = open("specialist", "ritual", "Ritual", choices([
  ["activation", "Activation"],
  ["ancestorVeneration", "Ancestor Veneration"],
  ["cappingHairpinningCeremony", "Capping/Hairpinning Ceremony"],
  ["createPaperTalisman", "Create Paper Talisman"],
  ["spiritKeeping", "Spirit Keeping"],
  ["bindingDemon", "Binding Demon Ritual"],
  ["blazingHandsOfHenShi", "Blazing Hands of Hen-Shi"],
  ["bloodOfferingDemonEmperor", "Blood Offering for the Demon Emperor"],
  ["bloodPledgeDemonEmperor", "Blood Pledge for the Demon Emperor"],
  ["celestialSpirit", "Celestial Spirit Ritual"],
  ["createSealOfJiangnu", "Create Seal of Jiangnu"],
  ["createTalismanRedGeneral", "Create Talisman of the Red General"],
  ["curseOfTheSpirit", "Curse of the Spirit"],
  ["drawOutTheDemons", "Draw Out the Demons"],
  ["expulsionMalignantWinds", "Expulsion of the Malignant Winds"],
  ["extractPhoenixSpirit", "Extract Phoenix Spirit"],
  ["forcefulPetitionImmortals", "Forceful Petition to the Immortals"],
  ["greenGuardian", "Green Guardian"],
  ["harvestQiByBlood", "Harvest Qi by Blood"],
  ["heartTaking", "Heart Taking Ritual"],
  ["mindIllumination", "Mind Illumination"],
  ["paperTalismanCurseWarding", "Paper Talisman of Curse Warding"],
  ["petitionFiveGhosts", "Petition to the Five Ghosts"],
  ["boundlessDream", "Ritual of the Boundless Dream"],
  ["boundlessPerfection", "Ritual of the Boundless Perfection"],
  ["songOfGu", "The Song of Gu"],
  ["goldenFireball", "The Spell of the Golden Fireball"],
  ["stopTransformation", "Stop Transformation Ritual"],
  ["stormsOfGushan", "The Storms of Gushan"],
  ["swordRitualOfBao", "Sword Ritual of Bao"],
  ["tattooDemonKing", "Tattoo of the Demon King"],
  ["timelessStepsOfBao", "Timeless Steps of Bao"],
  ["wealthAttainment", "Wealth Attainment"],
  ["westernHeavens", "Western Heavens"],
  ["zheValleyHeart", "Zhe Valley Heart"],
  ["zunDemonMaster", "Zun Demon Master Ritual"],
  ["zunForestShaping", "Zun Forest Shaping Ritual"],
  ["custom", "Custom"]
]), "Ritual is an open Skill taken separately for each learned Rite or Magic practice. Perform this named ritual using the TN, time, materials, risks, and effects in its Chapter 4 entry.", `${SOURCE}, Chapter 4: Rituals`);

const mental = [
  closed("mental", "command", "Command", "Command is the ability to project authority through orders, threats, intimidation, or torture. Roll against the target's Resolve. Success influences behavior within the target's limits; total success can push the target somewhat beyond their normal willingness."),
  closed("mental", "persuade", "Persuade", "Persuade changes beliefs or longer-term behavior by appeal or argument. Roll against the target's Resolve. Success convinces someone of a plausible point within their outlook; total success allows a substantially harder persuasion while still respecting that outlook."),
  closed("mental", "deception", "Deception", "Deception covers lies, distortion, concealment, and acting as someone else, including after using a disguise. Roll against Wits. Success convinces the observer; total success grants an automatic success on the next related deception against that observer."),
  closed("mental", "empathy", "Empathy", "Empathy reads emotions, intentions, and motives from social cues; it is not mind reading or automatic lie detection. Roll against Wits. Success reveals partial insight; total success reveals subtler signs of the target's emotional state or purpose."),
  closed("mental", "reasoning", "Reasoning", "Reasoning measures logical thought, analysis, and the ability to work with information. Use it for puzzles, deductions, calculations, and situations where clear thought determines what can be learned or concluded."),
  closed("mental", "detect", "Detect", "Detect is used to perceive hidden details, danger, or concealed characters. When someone is hiding, roll Detect against their Stealth rating; meeting or exceeding it spots them and can prevent surprise.")
];

const physical = [
  closed("physical", "athletics", "Athletics", "Use Athletics for active physical feats such as climbing, jumping, balancing, and demanding movement where strength or speed alone is not enough. The GM sets a TN appropriate to the obstacle and conditions."),
  closed("physical", "swim", "Swim", "Use Swim to move in water and resist drowning. Water conditions determine whether a check is needed and its TN. In water, movement is 10 feet plus 5 feet per Swim Rank; Endurance limits how long safe swimming can continue without risk."),
  closed("physical", "speed", "Speed", "Speed measures reflexes and travel rate during combat. Land movement is 30 feet plus 10 feet per Speed Rank. At the start of combat, roll Speed for turn order; additional total successes raise the resulting initiative score."),
  closed("physical", "muscle", "Muscle", "Muscle measures physical strength for lifting, breaking, or throwing objects. Its Ranks are commonly added as damage dice for melee attacks, and some weapons or heavy equipment require sufficient Muscle to use without penalty."),
  closed("physical", "endurance", "Endurance", "Endurance measures stamina and conditioning against harsh environments and exhausting exertion. Success lets the character keep going; total success can carry through the same activity for the period; failure may force rest or unconsciousness.")
];

const ride = open("physical", "ride", "Ride", choices([
  ["camel", "Camel"],
  ["elephant", "Elephant"],
  ["horse", "Horse"],
  ["wagon", "Wagon"],
  ["custom", "Custom"]
]), "Ride is an open Skill for controlling this animal or land vehicle. Risky maneuvers and movement beyond handling speed require a roll against the mount or vehicle's Performance Rating; it is also used in races, chases, and vehicle attacks.");

const sail = open("physical", "sail", "Sail", choices([
  ["barge", "Barge"],
  ["junk", "Junk"],
  ["rowBoat", "Row Boat"],
  ["custom", "Custom"]
]), "Sail is an open Skill for piloting or commanding this watercraft and navigating by sea. Risky maneuvers and movement beyond handling speed use the craft's Performance Rating; it is also used in races, chases, and attacks between vessels.");

const knowledge = [
  ...open("knowledge", "history", "History", choices([
    ["thunderingMarch", "Era of the Thundering March"],
    ["greatEmperor", "Era of the Great Emperor"],
    ["compassionateDaughter", "Era of the Compassionate Daughter"],
    ["demonEmperor", "Era of the Demon Emperor"],
    ["fiveKingdoms", "Era of the Five Kingdoms"],
    ["twoKingdoms", "Era of the Two Kingdoms"],
    ["eastwardBoundInvaders", "Era of the Eastward Bound Invaders"],
    ["northernHorseRiders", "Era of the Northern Horse Riders"],
    ["dutifulState", "Era of the Dutiful State"],
    ["hundredPieces", "Era of 100 Pieces"],
    ["righteousEmperor", "Era of the Righteous Emperor"],
    ["gloriousEmperor", "Era of the Glorious Emperor"],
    ["custom", "Custom Period"]
  ]), "History is an open Knowledge Skill taken for a historical age. Use it to recall relevant events and figures; on a total success, the character can also draw deeper connections from what is known."),
  ...open("knowledge", "creatures", "Creatures", choices([
    ["animals", "Animals"],
    ["demons", "Demons"],
    ["humanity", "Humanity"],
    ["insects", "Insects"],
    ["monsters", "Monsters"],
    ["spirits", "Spirits"],
    ["custom", "Custom"]
  ]), "Creatures is an open Knowledge Skill for a broad class of beings. It covers biology, diet, behavior, and lore; a successful roll reveals important information, and a total success reveals several useful details."),
  ...open("knowledge", "placesCultures", "Places/Cultures", choices([
    ["chezouRiverValley", "Chezou River Valley"],
    ["daiBien", "Dai Bien"],
    ["emeraldCoast", "Emerald Coast"],
    ["haian", "Hai'an"],
    ["huQin", "Hu Qin"],
    ["jianShu", "Jian Shu"],
    ["kushenBasin", "Kushen Basin"],
    ["liFan", "Li Fan"],
    ["suk", "Suk"],
    ["yanGuPlains", "Yan Gu Plains"],
    ["zunRiverValley", "Zun River Valley"],
    ["custom", "Custom Region"]
  ]), "Places/Cultures is an open Knowledge Skill for a region. It covers customs, politics, food, traditions, and local facts; success gives an important piece of information, while total success provides several."),
  ...open("knowledge", "martialDisciplines", "Martial Disciplines", choices([
    ["waijia", "Waijia"],
    ["qinggong", "Qinggong"],
    ["neigong", "Neigong"],
    ["dianxue", "Dianxue"]
  ]), "Martial Disciplines is an open Knowledge Skill used to identify techniques and schools of this discipline. The GM sets the TN from how rare the technique is; common displays may be TN 6 and exceptionally rare ones may reach TN 10."),
  ...open("knowledge", "institutions", "Institutions", choices([
    ["criminalUnderworld", "Criminal Underworld"],
    ["imperialBureaucracy", "Imperial Bureaucracy"],
    ["militaryOrganization", "Military Organization"],
    ["religiousOrganizations", "Religious Organizations"],
    ["sects", "Sects"],
    ["societies", "Societies"],
    ["custom", "Custom"]
  ]), "Institutions is an open Knowledge Skill for important organizations. It reflects knowledge of structure, formalities, symbols, practices, and major members; total success yields multiple pertinent details."),
  ...open("knowledge", "language", "Language", choices([
    ["daoyun", "Daoyun"],
    ["haianese", "Hai'anese"],
    ["khubsi", "Khubsi"],
    ["kushen", "Kushen"],
    ["liFai", "Li Fai"],
    ["singh", "Singh"],
    ["yanli", "Yanli"],
    ["custom", "Custom"]
  ]), "Language is an open Knowledge Skill representing spoken proficiency. Ranks permit ordinary communication within the character's mastery; harder expression may require a roll. On total success, the speaker can pass as a native speaker."),
  ...open("knowledge", "readScript", "Read Script", choices([
    ["feishu", "Feishu"],
    ["sai", "Sai"],
    ["yanzi", "Yanzi"],
    ["yoshaic", "Yoshaic"],
    ["sectScript", "Sect Script (Choose Sect)"],
    ["custom", "Custom"]
  ]), "Read Script is an open Knowledge Skill for literacy in a writing system. It permits reading and writing languages using this script, but does not grant the ability to speak or understand those languages aloud."),
  ...open("knowledge", "religionGods", "Religion/Gods", choices([
    ["cultHenShi", "Cult of Hen-Shi"],
    ["dehua", "Dehua"],
    ["gushan", "Gushan"],
    ["qiZhao", "Qi Zhao"],
    ["majesticLionCult", "The Majestic Lion Cult"],
    ["yenLi", "Yen-Li"],
    ["custom", "Custom"]
  ]), "Religion/Gods is an open Knowledge Skill for a belief system. It covers doctrines, religious practice, clothing, history, and context; use Ritual instead when actually conducting ceremonies or rites."),
  ...open("knowledge", "classics", "Classics", choices([
    ["twentySixStratagems", "The 26 Stratagems of Jiang Laozi"],
    ["bookOfFortunes", "Book of Fortunes"],
    ["bookOfLaws", "Book of Laws"],
    ["gloriousHistories", "Glorious Histories"],
    ["ritesOfWanMei", "Rites of Wan Mei"],
    ["sayingsOfKongZhi", "Sayings of Kong Zhi"],
    ["scriptureOfSunMai", "Scripture of Sun Mai"],
    ["custom", "Custom"]
  ]), "Classics is an open Knowledge Skill for a foundational text and related works. It supports recall and interpretation of the text, and is particularly relevant to scholarship and the Imperial Exams.")
];

export const SKILL_CATALOG = [
  ...combat,
  ...specialist,
  ...talents,
  ...trades,
  ...survival,
  ...rituals,
  ...mental,
  ...physical,
  ...ride,
  ...sail,
  ...knowledge
];
