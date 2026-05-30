const SOURCE = "Wandering Heroes of Ogre Gate, Chapter 2: Rules";

export const AFFLICTION_RULES = `POISON AND DISEASES

When a character comes into contact with a Disease or a Poison, you roll Potency against his Hardiness. If the roll equals or beats the character's Hardiness Score, he suffers the effects of the Disease or Poison. Both Diseases and Poisons are potentially lethal when they take hold, and their crippling effects are expressed as a cumulative -1d10 Skill Penalty. In addition individual Poisons and Diseases have specific effects described in their entries. Once a Poison or Disease takes hold, if it is lethal, it kills the victim within the time increment listed under its Lethality column on the Diseases and Poisons Tables. If no successful treatment is given before this time elapses, the character dies.

To recover from a Disease or Poison, characters can make a Medicine roll against the TN listed for it on the Diseases and Poisons charts. This roll can be made by the sufferer or by another character. You can make one Medicine roll to recover per the amount of time listed under the Disease's or Poison's lethality. Meaning a Disease that lists minutes under Lethality allows one Medicine roll every minute, while a Disease that has weeks for Lethality allows a Medicine roll every week. Many Diseases require a specific substance or antidote for the Medicine Skill roll to even be attempted.

Poisons can be cured through antidotes combined with a Medicine Skill roll. Other than that the only way to cure poison is through Neigong Techniques. Antidotes can be made using the poison as a base and making a Talent: Poison roll against the Brew result of the poisoner's original roll.`;

function affliction(data) {
  return {
    source: SOURCE,
    rulesKey: data.key,
    treatmentMode: "standard",
    brewRating: 0,
    contagious: false,
    antidoteRequired: false,
    remedy: "",
    specialRules: "",
    ...data,
    description: data.description ?? ""
  };
}

export const AFFLICTION_CATALOG = [
  affliction({
    key: "standardPoison",
    name: "Standard Poison",
    afflictionType: "poison",
    lethality: "hours",
    speed: "hours",
    effect: "Temporary",
    medicineTn: 4,
    brewRating: 5,
    potency: "1d10",
    affectedSkills: "All",
    antidoteRequired: true,
    remedy: "Corresponding antidote"
  }),
  affliction({
    key: "cyanide",
    name: "Cyanide",
    afflictionType: "poison",
    lethality: "hours",
    speed: "minutes",
    effect: "Temporary",
    medicineTn: 8,
    brewRating: 8,
    potency: "3d10",
    affectedSkills: "All",
    antidoteRequired: true,
    remedy: "Corresponding antidote",
    description: `Cyanide: This Poison is extremely lethal, taking effect in minutes and killing in hours. It comes from a chemical usually extracted from bitter almonds, though it appears elsewhere in nature. It works by preventing the body from using the air it breathes. This ultimately leads to unconsciousness and death. It can be ingested or made into a powder or smoke and inhaled. When inhaled its Lethality and Speed increase by one increment each. Finding the raw ingredients for cyanide is a TN 5 Talent (Poison) roll or TN 7 Survival roll.`
  }),
  affliction({
    key: "firePoison",
    name: "Fire Poison",
    afflictionType: "poison",
    lethality: "days",
    speed: "days",
    effect: "Permanent",
    medicineTn: 6,
    brewRating: 5,
    potency: "2d10",
    affectedSkills: "Mental, Physical",
    antidoteRequired: true,
    remedy: "Lotus Oil",
    description: `Fire Poison: This poison is so named for the burning sensation it produces when ingested or injected. It causes nausea and weakens the muscles over the next few days. Soon madness takes hold, affecting the person's senses and their ability to process information. This makes communication very difficult, as the sufferer grows increasingly withdrawn and paranoid. If untreated it kills the victim in 1d10 days. Treatment requires the use of Lotus Oil. Even after treatment the scars it leaves are permanent. The venom is created by crushing a rare beetle found only in Suk lands and in certain large scorpions.`
  }),
  affliction({
    key: "hellebore",
    name: "Hellebore",
    afflictionType: "poison",
    lethality: "minutes",
    speed: "seconds",
    effect: "Temporary",
    medicineTn: 7,
    brewRating: 6,
    potency: "4d10",
    affectedSkills: "Combat, Physical",
    antidoteRequired: true,
    remedy: "Yellow Phoenix Pills or corresponding antidote",
    description: `Hellebore: This black flower causes swelling and eventually leads to cardiac arrest. It is quite potent, prompting symptoms in seconds and death in just 1d10 minutes. Hellebore must be consumed. Hellebore is easy to find and grows around the Yao Yun Sea. It requires a TN 4 Talent (Poison) roll or TN 6 Survival roll.`
  }),
  affliction({
    key: "mandrake",
    name: "Mandrake",
    afflictionType: "poison",
    lethality: "days",
    speed: "hours",
    effect: "Temporary",
    medicineTn: 6,
    brewRating: 6,
    potency: "2d10",
    affectedSkills: "Mental",
    antidoteRequired: true,
    remedy: "Yellow Phoenix Pills or corresponding antidote",
    description: `Mandrake: This root is found throughout Naqan and can be used to brew a Poison that is slow but causes terrible delirium. It kills in 1d10 days and causes symptoms in hours. Those affected become confused and lethargic, slipping into a coma prior to death. Locating mandrake is a TN 5 Talent (Poison) roll or a TN 7 Survival roll.`
  }),
  affliction({
    key: "nagaVenom",
    name: "Naga Venom",
    afflictionType: "poison",
    lethality: "days",
    speed: "minutes",
    effect: "Temporary",
    medicineTn: 9,
    brewRating: 9,
    potency: "3d10",
    affectedSkills: "Combat, Physical",
    antidoteRequired: true,
    remedy: "Corresponding antidote",
    description: `Naga Venom: This Poison needs to be injected to be effective. It is naturally produced by a type of snake common in the west in a gland near their jaw, but this can be removed and used by others. Dipping a weapon into Naga venom is sufficient for one dose. It causes violent shaking once it takes hold, within minutes and kills in 1d10 days.`
  }),
  affliction({
    key: "purpleSpiritVenom",
    name: "Purple Spirit Venom",
    afflictionType: "poison",
    lethality: "none",
    speed: "hours",
    effect: "Temporary",
    medicineTn: 10,
    brewRating: 10,
    potency: "3d10",
    affectedSkills: "None; affects Qi only",
    antidoteRequired: true,
    remedy: "Purple Spirit Venom Antidote",
    specialRules: "Reduces Qi by 1 each hour until Qi reaches 1; Qi cannot be restored until purged.",
    description: `Purple Spirit Venom: This is a powerful poison that is extraordinarily difficult to make. Its primary ingredients include the venom of various hard to find insects and reptiles, rare tree saps and 32 medicines (arranged to the taste and desire of the poisoner). When ingested it does not cause any skill penalties, but works by blocking Qi. This effectively reduces the imbibers Qi by 1 with each hour that passes, until Qi reaches 1. Qi cannot be restored until the poison has been purged from the system. This is only possible through either an antidote or a high level Kung Fu Technique (specified in the entry of such Techniques). Purple Spirit Venom causes no other harm to the victim, it simply lowers Qi. Its effects are not permanent if the antidote is taken.`
  }),
  affliction({
    key: "spinyToadVenom",
    name: "Spiny Toad Venom",
    afflictionType: "poison",
    lethality: "weeks",
    speed: "hours",
    effect: "Temporary",
    medicineTn: 7,
    brewRating: 7,
    potency: "1d10",
    affectedSkills: "Mental, Physical",
    antidoteRequired: true,
    remedy: "Corresponding antidote",
    specialRules: "Make an Endurance roll every hour; each seizure causes a progressive -1d10 Mental and Physical penalty.",
    description: `Spiny Toad Venom: This venom takes a long time to kill but will do so if the antidote is not administered. It causes symptoms within an hour involving both mild hallucinations and seizures. Make an Endurance roll every hour to see if a seizure occurs. With every seizure that happens, the character suffers a progressive -1d10 penalty to Physical and Mental Skills (not permanent).`
  }),
  affliction({
    key: "toadDemonVenom",
    name: "Toad Demon Venom",
    afflictionType: "poison",
    lethality: "weeks",
    speed: "hours",
    effect: "Temporary",
    medicineTn: 7,
    brewRating: 7,
    potency: "3d10",
    affectedSkills: "Mental, Physical",
    antidoteRequired: true,
    remedy: "Corresponding antidote"
  }),
  affliction({
    key: "viperThorn",
    name: "Viper Thorn",
    afflictionType: "poison",
    lethality: "none",
    speed: "seconds",
    effect: "Temporary",
    medicineTn: 0,
    potency: "4d10",
    affectedSkills: "Special",
    specialRules: "On exposure, suffer one Wound and gain +2d10 Muscle for 3 hours.",
    description: `Viper Thorn: These are the thorns of the Zhe Valley Chrysanthemum, which come in two types: viper and water. Half of all Zhe Valley Chrysanthemums carry Viper Thorns. It is impossible to tell the difference between Viper and Water Thorns. Anyone pricked by a Viper Thorn suffers a single Wound, experiences wracking pain with rage and gains a +2d10 bonus to Muscle for 3 hours.`
  }),
  affliction({
    key: "waterThorn",
    name: "Water Thorn",
    afflictionType: "poison",
    lethality: "none",
    speed: "seconds",
    effect: "Temporary",
    medicineTn: 0,
    potency: "4d10",
    affectedSkills: "Special",
    specialRules: "On exposure, heal one Wound, suffer -4 Resolve and -2d10 Speed and Athletics for 10 hours.",
    description: `Water Thorn: These are the water thorns of the Zhe Valley Chrysanthemum. Half of all Zhe Valley Chrysanthemums carry Water Thorns and they are impossible to distinguish from Viper Thorns. Anyone pricked by a Water Thorn heals a single Wound, experiences profound euphoria and suffers a -4 Penalty to Resolve and -2d10 to Speed and Athletics for 10 hours as the venom of the thorn affects coordination.`
  }),
  affliction({
    key: "xiKangsSpleenFreezingWine",
    name: "Xi Kang's Spleen Freezing Wine",
    afflictionType: "poison",
    lethality: "none",
    speed: "minutes",
    effect: "Temporary",
    medicineTn: 8,
    brewRating: 7,
    potency: "2d10",
    affectedSkills: "Special",
    antidoteRequired: true,
    remedy: "Xi Kang's Spleen Freezing Wine Antidote",
    specialRules: "Causes full paralysis for 1d10 minutes shortly after ingestion.",
    description: `Xi Kang's Spleen Freezing Wine: This poison is made using alcohol (preferably rice wine) as a base blended with Deathstalker Scorpion venom, peach seed (to ensure even distribution through the system), gypsum, skullcap, cinnamon bark and two other ingredients. It tastes like normal wine (only on a Detect roll TN 10 would someone notice anything unusual) and causes full paralysis for 1d10 minutes shortly after ingestion.`
  }),
  affliction({
    key: "zhenBirdVenom",
    name: "Zhen Bird Venom",
    afflictionType: "poison",
    lethality: "hours",
    speed: "seconds",
    effect: "Temporary",
    medicineTn: 7,
    brewRating: 10,
    potency: "4d10",
    affectedSkills: "All",
    antidoteRequired: true,
    remedy: "Ground rhinoceros horn, human tooth, and 27 other ingredients",
    description: `Zhen Bird Venom: As soon as a person is exposed roll 4d10 against their Hardiness. If it meets or exceeds their Hardiness rating they are affected, suffering cumulative -1d10 penalties every 10 seconds as their body and mind are overwhelmed with violent tremors and a profound mental fatigue. The Poison of the Zhen Bird is incredibly lethal, killing in hours. The antidote requires the use of ground rhinoceros horn and a human tooth (in addition to 27 other ingredients).`
  }),
  affliction({
    key: "bloodFire",
    name: "Blood Fire",
    afflictionType: "disease",
    lethality: "weeks",
    speed: "days",
    effect: "Temporary",
    medicineTn: 7,
    potency: "3d10 take lowest",
    affectedSkills: "Combat, Mental, Physical",
    remedy: "Golden Phoenix Pills grant +1d10 to Medicine",
    specialRules: "Optional: Medicine TN is 7 +1 per Wound; use only in gritty campaigns.",
    description: `Blood Fire (Optional): This is caused by an excess of heat in the blood usually introduced from an external source (such as poison or a Wound). Any character whose skin is broken causing a Wound risks succumbing to Blood Fire. When this happens roll 6d10 against Hardiness taking the single lowest result. If the result meets or exceeds the Hardiness then the character develops Blood Fire. It can be treated with a Medicine roll with the physician working to expel the heat and the toxin in the blood through acupuncture. Using Golden Phoenix Pills can bestow a +1d10 to any Medicine roll attempting to cure Blood Fire. This should only be used in gritty campaigns.`
  }),
  affliction({
    key: "burningPlague",
    name: "Burning Plague",
    afflictionType: "disease",
    lethality: "weeks",
    speed: "weeks",
    effect: "Temporary",
    medicineTn: 8,
    potency: "1d10",
    affectedSkills: "Combat, Physical",
    contagious: true,
    description: `Burning Plague: This first appeared in the time of the Demon Emperor. Those exposed experience a fiery rash and itching. This is simply annoying but it progresses and eventually causes the sufferer to experience a massive increase in heat in their internal organs. The sensation is overwhelming and builds until blisters erupt on the skin. The rash then turns into black and blue welts. After this point most die in one or two days. Burning Plague is carried in the air from person to person, or animal to person. Roll 1d10 against Hardiness to see if airborne infection occurs.`
  }),
  affliction({
    key: "heartFire",
    name: "Heart Fire",
    afflictionType: "disease",
    lethality: "months",
    speed: "days",
    effect: "Temporary",
    medicineTn: 6,
    potency: "1d10",
    affectedSkills: "Mental, Physical",
    specialRules: "If not already affected each hour, roll 1d10 against Resolve for extreme emotion; on 10 the sufferer becomes violent, followed by 1d10 hours of depression.",
    description: `Heart Fire: This is a disease caused by an overabundance of heat and dampness in the heart. It can arise from the environment itself (simply overexerting oneself in a humid and hot climate) or when a person experiences deep frustration in love. The problem with Heart Fire is it produces extreme behavior, rage and depression. Every hour that the patient is not already enraged or depressed by Heart Fire, roll 1d10 against the Resolve of the person suffering from it. If the result meets or exceeds their resolve score, they become extremely emotional, even hostile for about an hour. If the result is a 10 they even become violent. This is always followed by 1d10 hours of depression. In addition to these symptoms, Heart Fire causes agitation of the body. Heart Fire can be cured through acupuncture (Medicine roll against TN 6).`
  }),
  affliction({
    key: "heatAndDampnessOfTheLung",
    name: "Heat and Dampness of the Lung",
    afflictionType: "disease",
    lethality: "weeks",
    speed: "days",
    effect: "Temporary",
    medicineTn: 6,
    potency: "1d10",
    affectedSkills: "Combat, Physical",
    description: `Heat and Dampness of the Lung: This is an illness caused by excess heat and humidity in the lung and is usually acquired after spending excessive time in the rain or a body of water (particularly when it is warm). Those suffering from it experience heavy cough, lethargy and shiver with cold. If it is not treated in a timely manner it can be deadly.`
  }),
  affliction({
    key: "iceOfTheHeart",
    name: "Ice of the Heart",
    afflictionType: "disease",
    lethality: "minutes",
    speed: "seconds",
    effect: "Permanent",
    medicineTn: 8,
    potency: "3d10",
    affectedSkills: "All",
    description: `Ice of the Heart: This disease is caused by an excess of cold in the heart. It is most commonly the result of the northern feast beetle, which is parasitic and burrows into the human body until it reaches the heart. Once there, it waits until the person consumes water. As soon as water is consumed the beetle draws it into the heart and releases a terrible poison throughout the system that causes the body to literally freeze. When this occurs the person's limbs become stiff like ice and they die within minutes. The beetle then consumes the frozen flesh slowly over the course of months.`
  }),
  affliction({
    key: "malignantWindDisease",
    name: "Malignant Wind Disease",
    afflictionType: "disease",
    lethality: "days",
    speed: "hours",
    effect: "Permanent",
    medicineTn: 6,
    treatmentMode: "staveOnly",
    potency: "2d10",
    affectedSkills: "Mental",
    remedy: "Expulsion of the Malignant Winds Ritual cures the illness",
    specialRules: "Medicine only staves off effects and prolongs life for one day; each failed attempt causes one Wound.",
    description: `Malignant Wind Disease: This is an illness caused by evil spirits. It is carried in the air in a cloud and anyone who inhales it risks exposure. It affects the mind within hours, causing outbursts of emotion and an inability to focus, and kills within 1d10 days. The sign of Malignant Wind Disease is a dark spot on the tip of the tongue. It kills by producing an overflow of heat and wetness in the heart, and eventually the full reversal of blood flow. This cannot be cured by medicine but must be cured by the correct Ritual. However a successful Medicine roll can stave off the effects (and prolong life) for one day (but each failed attempt causes one Wound).`
  })
];

function substance(data) {
  return {
    source: SOURCE,
    rulesKey: data.key,
    quantity: 1,
    brewSkill: "talent.poisoning",
    brewTn: 0,
    targetAffliction: "",
    duration: "",
    effects: "",
    ...data
  };
}

export const SUBSTANCE_CATALOG = [
  substance({
    key: "bitterOrangeRemedy",
    name: "Bitter Orange Remedy",
    substanceType: "herbalCure",
    brewTn: 6,
    targetAffliction: "Imbalance",
    duration: "20 minutes after brewing",
    effects: "Eliminates 5 Imbalance Points per sip.",
    description: `Bitter Orange Remedy: This is prepared using a combination of bitter orange and magnolia bark as well as 13 other ingredients. It produces a liquid, one sip of which will restore balance to Qi (it eliminates 5 Imbalance Points per sip). However it is quite unstable, lasting only twenty minutes after brewing. Brew Rating: TN 6.`
  }),
  substance({
    key: "bluePhoenixPills",
    name: "Blue Phoenix Pills",
    substanceType: "herbalCure",
    targetAffliction: "Poison or heat-related disease",
    duration: "One day per pill",
    effects: "Lowers the speed of an applicable poison or heat-related disease by one increment.",
    description: `Blue Phoenix Pills: These round pills are made from red sage root, blackberry lily, gold thread, and green chiretta. They are not a cure for anything but can eliminate heat from the body and help stifle toxins in the blood. If you take one pill daily it lowers the speed of any poison or heat related disease you are suffering from by one increment (so something that kills you in days, kills you in weeks for example).`
  }),
  substance({
    key: "celestialSpiritPills",
    name: "Celestial Spirit Pills",
    substanceType: "herbalCure",
    targetAffliction: "Missing Phoenix Spirit",
    duration: "One day per dose",
    effects: "Removes Resolve Tests for condition triggers that day; does not stop other effects.",
    description: `Celestial Spirit Pills: These round pills are made from cinnabar, jujube seeds and ground oyster shells. They induce calm and can muffle the outbursts of a person suffering from Missing Phoenix Spirit (see the FLAWS entry in CHAPTER ONE). Taken daily these reduce outbursts but do not stop the other effects. Each day a person takes Celestial Spirit Pills he or she is not subject to Resolve Tests when their condition would be triggered.`
  }),
  substance({
    key: "longzhiBonePowder",
    name: "Longzhi Bone Powder",
    substanceType: "herbalCure",
    brewTn: 9,
    targetAffliction: "Strength enhancement",
    duration: "1d10 days",
    effects: "+1d10 Muscle.",
    description: `Longzhi Bone Powder: The bones of the Longzhi (a human-eating creature with nine heads and nine tails) can be ground into a fine powder and boiled with ginseng and lily bulb. If drunk while still hot it greatly enhances strength, bestowing a +1d10 to Muscle for 1d10 days. However the rarity of the Longzhi makes this exceptionally expensive when it is available. Brew Rating: TN 9.`
  }),
  substance({
    key: "lotusOil",
    name: "Lotus Oil",
    substanceType: "antidote",
    targetAffliction: "Fire Poison",
    effects: "Required to treat Fire Poison.",
    description: `Lotus Oil: Taken from the Red Lotus flower this oil can cure Fire Poison. Without this Fire Poison cannot be treated.`
  }),
  substance({
    key: "masterLisCure",
    name: "Master Li's Cure",
    substanceType: "herbalCure",
    brewTn: 7,
    targetAffliction: "Diseases",
    duration: "One day",
    effects: "Lowers disease Medicine TN by 2 for one day.",
    description: `Master Li's Cure: This is a well-known concoction, attributed to the great doctor Li. It contains 18 substances, including ginseng and fish bones. The ingredients are combined and brewed over heat for several hours then served as a bitter hot drink. It helps in the treatment of diseases, lowering their Medicine TN by 2 for a day. The Brew Rating: TN 7.`
  }),
  substance({
    key: "numinousMushroom",
    name: "Numinous Mushroom",
    substanceType: "herbalCure",
    brewTn: 8,
    targetAffliction: "Wounds",
    duration: "Mental and Knowledge penalty lasts one day",
    effects: "Restores up to three Wounds; -1d10 Mental and Knowledge Skills for one day.",
    description: `Numinous Mushroom: This is brilliant gold colored mushroom is rare and considered a good Omen. Numinous Mushroom serves a few functions. When properly prepared, it can reveal the numinous world of spirits and gods to human eyes. See Master Ren's Eye Opening Concoction in the Longevity Substance list below for an example. Its other more pedestrian purpose is as a healing agent. Numinous Mushroom can be ground into a powder and made into a bitter drink. The effect is it can restore up to three Wounds but imposes a -1d10 Penalty to all Mental and Knowledge Skills for a day. Brew Rating: TN 8. According to legend these are guarded by stone-throwing creatures called Jufu.`
  }),
  substance({
    key: "purpleJellyFungus",
    name: "Purple Jelly Fungus",
    substanceType: "herbalCure",
    targetAffliction: "Nutrition",
    effects: "One handful provides nourishment comparable to a bowl of rice and green leafy vegetables.",
    description: `Purple Jelly Fungus: Jelly Fungus is an edible mold. There is a subtype that grows in the Purple Caverns that is particularly healthy. This is a colorful gelatinous fruit-bearing mold that can be consumed as a meal. One handful of Jelly Fungus is about as nutritious as a bowl of rice and green leafy vegetables.`
  }),
  substance({
    key: "purpleSapphireMushroom",
    name: "Purple Sapphire Mushroom",
    substanceType: "herbalCure",
    brewTn: 7,
    targetAffliction: "Any poison",
    duration: "One day per pill",
    effects: "Staves off the effect of any poison for one day.",
    description: `Purple Sapphire Mushroom: This unique mushroom only grows in the Purple Caverns. When crushed and formed into a pill using 14 other ingredients it can stave off the effect of any poison for one day. As long as one takes a Purple Sapphire Mushroom pill each day it continues to stave off the effects. Brew Rating: TN 7.`
  }),
  substance({
    key: "purpleSpiritVenomAntidote",
    name: "Purple Spirit Venom Antidote",
    substanceType: "antidote",
    targetAffliction: "Purple Spirit Venom",
    effects: "Purges Purple Spirit Venom so Qi may be restored.",
    description: `Purple Spirit Venom Antidote: Like the poison it treats, Purple Spirit Venom Antidote is very hard to create. It requires the same raw venoms and saps, plus a specific combination of 32 medicines to match the poison. This means you must either be the person who made the original venom, or find out what combination of 32 medicines the original poisoner employed.`
  }),
  substance({
    key: "redRuFishMeat",
    name: "Red Ru-Fish Meat",
    substanceType: "herbalCure",
    targetAffliction: "Insects, lice, and scabies",
    duration: "24 hours",
    effects: "Insects do not bite or attack; cures conditions such as lice and scabies.",
    description: `Red Ru-Fish Meat: Eating the flesh of a Red Ru-Fish protects against insects for 24 hours. Insects will not bite or attack anyone who has eaten such a creature. This also cures conditions like lice and scabies.`
  }),
  substance({
    key: "snakeDemonAntidote",
    name: "Snake Demon Antidote",
    substanceType: "antidote",
    brewTn: 8,
    targetAffliction: "Demon Snake Venom",
    effects: "Cures anyone affected by Demon Snake Venom.",
    description: `Snake Demon Antidote: This cures anyone affected by Demon Snake Venom. To make it one must boil Snake Demon scales and combine them with various roots and flower petals. Brew Rating TN 8.`
  }),
  substance({
    key: "xiKangsAntidote",
    name: "Xi Kang's Spleen Freezing Wine Antidote",
    substanceType: "antidote",
    brewTn: 9,
    targetAffliction: "Xi Kang's Spleen Freezing Wine",
    effects: "Nullifies the effects of Xi Kang's Spleen Freezing Wine.",
    description: `Xi Kang's Spleen Freezing Wine Antidote: This antidote nullifies the effects of Xi Kang's Spleen Freezing Wine. It is made with 24 total ingredients, including peonies, fresh ginger, lotus seed, and long pepper. Brew Rating: TN 9.`
  }),
  substance({
    key: "yellowPhoenixPills",
    name: "Yellow Phoenix Pills",
    substanceType: "antidote",
    targetAffliction: "Hellebore, Mandrake, and Blood Fire",
    effects: "Antidote for Hellebore and Mandrake; +1d10 Medicine rolls to treat Blood Fire.",
    description: `Yellow Phoenix Pills: These are effective at eliminating heat from the body and eliminating many toxins. It is an effective antidote for Hellebore and Mandrake but most known for its treatment of Blood Fire, giving a +1d10 bonus for Medicine rolls to treat the disease.`
  }),
  substance({
    key: "forgettingSubstance",
    name: "Forgetting Substance",
    substanceType: "transformative",
    brewSkill: "trade.alchemy",
    targetAffliction: "Memory",
    effects: "Extinguishes memories; usually aimed at a specific emotion or traumatic event.",
    description: `Forgetting Substance (Transformative Substance): This is created to extinguish a person's memories. Usually it is aimed at something very specific (a particular emotion attached to an individual or a traumatic event). The more specific the emotion, the higher the TN for creating the substance, and in turn the less specific the lower the TN.`
  }),
  substance({
    key: "humanFormingEssence",
    name: "Human Forming Essence",
    substanceType: "transformative",
    brewSkill: "trade.alchemy",
    brewTn: 7,
    targetAffliction: "Non-human transformation",
    duration: "24 hours, increasing by one hour with each use",
    effects: "Allows a non-human creature to become human and shift between human and beast form.",
    description: `Human Forming Essence (Transformative Substance): This is used by some demons (or Spirited Beasts) to take human form (particularly snake demons). Most versions of this require human Qi energy or blood. It requires daily preparation and use, and allows any non-human creature that ingests it to become human for 24 hours. The effect increases by an hour each time they take it. During the 24 hour period they can shift between human and beast form as desired. The TN for making it is TN 7.`
  }),
  substance({
    key: "lifeProlongingPill",
    name: "Life Prolonging Pill",
    substanceType: "longevity",
    brewSkill: "trade.alchemy",
    brewTn: 10,
    targetAffliction: "Lifespan",
    effects: "Each use inflicts 1 Wound and 1d10 Imbalance Points; ten consecutive days prolong life by 1d10 years, further use reduces life expectancy.",
    description: `Life Prolonging Pill (Longevity Substance): This is rumored to be produced through a process involving gold and mercury. Ingesting it harms the liver. Anyone drinking it takes 1d10 Imbalance Points and suffers 1 Wound. The imbiber also becomes restless and aggressive for an hour. However drinking this over time can prolong life. If someone successfully drinks this over the course of ten consecutive days, they will live an additional 1d10 years. Further use after this point will reduce life expectancy by a year for each use. The TN for making it is TN 10.`
  }),
  substance({
    key: "masterRensEyeOpeningConcoction",
    name: "Master Ren's Eye Opening Concoction",
    substanceType: "transformative",
    brewSkill: "trade.alchemy",
    targetAffliction: "Spiritual perception",
    effects: "Allows sight of spirits, concealed creature nature, possession, and enchantments.",
    description: `Master Ren's Eye Opening Concoction (Transformative Substance): This requires the use of Numinous Mushroom and a cauldron or pot to prepare 23 other ingredients by flame. When drunk it opens perceptions to the spiritual realms, allowing the drinker to see spirits and discern the true nature of creatures that are disguised by illusion. It also enables one to see when a person is possessed by a spirit and to see through enchantments.`
  })
];
