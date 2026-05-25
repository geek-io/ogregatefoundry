const join = (...sections) => sections.filter(Boolean).join("\n\n");

const COMBAT = {
  armStrike: `This is used to punch, elbow, palm strike and even to head-butt your foe. Attacks made using this skill have no reach and do Muscle -1d10 for Damage. When using Arm Strike, roll against the target's Parry. On a Success you can roll damage against their Hardiness as usual.`,
  legStrike: `This is used to kick, knee strike, and drop kick your enemy. Attacks made using Leg Strike generally do Muscle in Damage, have reach (provided it is kicking and not knees) and take -1d10 accuracy penalty to Attack. When using Leg Strike, roll against the target's Parry. On a Success you can roll damage against their Hardiness as usual.`,
  grapple: `This is used to restrain, pin, and disarm. This includes grappling techniques but also redirection, some basic throws and breaking free if someone else has restrained you.

When you Grapple someone with your bare hands, make a Grapple Skill roll against the person's Parry score. If you succeed, you restrain your opponent.

RESTRAINING

If you restrain a foe, you manage to grab and control their body. Your foe cannot move, though he can attack with small weapons like a dagger, or with one of the Arm Strike, Leg Strike, Grapple, or Throw Skills. Your movement is reduced to five feet while you are restraining your foe. Wherever you go, you take your foe with you.

To maintain a Restrain, you must make a successful Grapple roll each round. Characters who are restrained can attempt to break free on their turn by making a Grapple Skill roll against their attacker's Parry (breaking free on a Success). Breaking free from a Grapple takes up a Skill Action (it is a free action if you are trying to break free from an opponent whose Qi level is lower than your own).

If you rolled a Total Success on your initial Grapple Skill, in addition to restraining your foe, you can also opt to perform one of the Restrain Maneuvers below:

Disarm: You remove a weapon from your opponent's grip. Possession of the weapon transfers to you, but takes an action to ready.

Pin: You gain complete control, preventing your foe from moving, attacking, or taking physical skill actions (including attempting to break free). Your foe is pinned until you let them go.

Throw: You throw your foe onto the ground up to five feet away from you. If you choose, you can deal Muscle+0d10 Damage to your target. In addition, he lands on his back and must spend one move to get up (treat as prone position).

Wound: You use an unarmed Technique to bring harm to your opponent, inflicting one Wound.`,
  throw: `This is used to throw and sweep your enemies. It functions like the Throw maneuver of the restrain rule except it is more effective.

You can try to throw anyone as long as you are close enough to reach them (adjacent or within five feet). On a Success you unbalance the target and place them on the ground, or you throw your foe onto the ground up to ten feet away from you. Roll your Muscle against his Hardiness to see if he takes Damage. In addition, he lands on his back and must spend one move to get up (treat as prone position). On a Total Success the person is conclusively thrown or tripped and must use a Move and Skill action to return to a standing position (in addition to the other effects).`,
  lightMelee: `You know how to use light Melee weapons effectively. These include butterfly swords, daggers, fans, fly-whisks, iron hats, needles, nets, and sticks. When you attack with such a weapon, make a Light Melee Skill roll against your opponent's Parry Score. If you are throwing the weapon, roll against Evade instead. On a Success, roll Damage Dice based on the weapon against your foe's Hardiness.`,
  mediumMelee: `You know how to use mid-sized Melee weapons effectively. These include gentlemen swords (Jian), ox tail daos, hook swords and staffs (gun). When you attack with such a weapon, make a Medium Melee Skill roll against your opponent's Parry score. If you are throwing the weapon, roll against Evade instead. On a Success, roll Damage Dice based on the weapon against your foe's Hardiness.`,
  heavyMelee: `You know how to use heavier melee weapons effectively. These include hard whips (bian), meteor hammers, thunderbolt balls and halberds (Ji). When you attack with such a weapon, make a Heavy Melee Skill roll against your opponent's Parry score. If you are throwing the weapon, roll against Evade instead. On a Success, roll Damage Dice based on the weapon against your foe's Hardiness.`,
  smallRanged: `You know how to use smaller ranged weapons effectively. These include bows, crossbows, fire lances, and short bows. When you attack with such a weapon, make a Small Ranged Skill roll against your opponent's Evade. On a Success, roll Damage Dice against the Target's Hardiness based on the weapon.`,
  largeRanged: `You know to use larger ranged weapons effectively. These include the whirlwind catapult and triple bow ballista. When you attack with such a weapon, make a Large Ranged Skill roll against your opponent's Evade. On a Success, roll Damage Dice against the Target's Hardiness based on the weapon.`
};

const SPECIALIST = {
  medicine: `Medicine is a crucial Skill. Medicine is highly advanced in Qi Xien after being honed and developed over the course of centuries. The Medicine Skill represents training in healing Techniques and the ideas underpinning this tradition. It can be used to heal, to diagnose and cure a Disease, to counter Poison, and to stop a person from dying.

Medicine indicates proficiency with acupuncture, pulse reading, physical examination and application of cures. For proficiency in brewing herbal cures characters should also take Talent (Poison).

TREATING WOUNDS

Treating a wounded character takes one round. On a Normal Success, the target is stabilized, meaning he does not die if he has started dying. On a Total Success, the target is stabilized and improves, removing one Wound. Characters cannot be healed this way more than once a day (though they can be stabilized multiple times).

DIAGNOSING AND CURING POISON/DISEASE

You can determine a person's condition by taking their pulse and examining their skin and external features. The pulse can tell you about the state of their internal organs, toxins in their body, even their emotional state. Likewise, external signifiers reveal the condition of internal organs as well. For example, the tip of the tongue can tell you information about the heart while the eyes reveal the state of the liver.

Diagnosing a Disease or Poison takes 1d10 minutes. On a Normal Success, you accurately identify the problem. On a Total Success, you diagnose the problem and gain a +1d10 on your roll to cure or counter it.

To cure a Disease or counter a Poison, use the following method: Make a Medicine Skill roll. The Target Number for this roll is listed under the individual Poison and Disease entries in CHAPTER TWO: RULES as Medicine Skill TN and is the Target Number to stop the effects. On a Success, the person stabilizes but continues to suffer the penalties associated with the Disease or Poison (it does not progress). However, they must continue to make regular Medicine rolls to see if they recover (on a Total Success), remain stabilized (Success) or slip back into illness (Failure). On a Failure, the Disease or Poison resumes or continues. On a Total Success, the person is cured or fully recovered and the penalties associated with the Disease or Poison go away (unless they are listed as permanent in the chart, in which case they remain forever). Note poisons usually require a specific antidote, which you need to use with your Medicine Skill for it to work. Some diseases will also require specific remedies for treatment to be effective.

Diseases and Poisons kill characters in increments of time (minutes, hours, days, weeks, etc.) listed under Lethality. The number of Medicine rolls you can make for a Disease is determined by the Lethality increment in its entry on the Disease and Poisons Tables in CHAPTER TWO: RULES. You can make one Medicine roll to recover per the increment of time identified in its lethality. Meaning, a Disease that lists Minutes under Lethality, allows one Medicine roll every minute, while a Disease that has Weeks for Lethality allows a Medicine roll every week. Many Diseases and Poisons require a specific substance or antidote for the Medicine Skill roll to even be attempted. These can be found, purchased or created with the Talent: Poison Skill. Occasionally specific poisons or diseases will function differently from this system (if so, this will be stated in the individual entry).

ASSESSING KUNG FU

Characters that know Kung Fu Techniques and have Ranks in Qi can use the Medicine Skill to assess a person's Kung Fu potential and to sense things like internal injuries (loss of Qi for example). To do this, they must feel the person's pulse for at least a few seconds. Doing this they can make a Medicine roll TN 6. If they succeed, they learn in very general terms the character's current Qi level and if the person has recently been drained of Qi or suffered any specific internal injury related to their meridians. The GM should not give a specific number like "Qi 5" but rather say something that the character would understand such as "You sense that Strange Phoenix is a little more powerful than you". This can also be used similarly to assess a person's potential in the different martial disciplines, so you could gauge if a person would be good at Waijia or Neigong.`,
  divination: `Divination is a broad range of techniques used to either interpret the will of heaven or see into the future (as well as the past and present). Diviners draw on practices such as astrology, burning bones or turtle shells, casting lots, and many other methods. Most of these require at least two hours of effort (in some cases much more). The Diviner must also have the necessary materials available.

The effects of a Divination roll vary depending on what kind of questions the person is trying to answer. But Divination is real and works in the Wandering Heroes of Ogre Gate setting. Though Divination is not an open Skill (any character with Divination knows the following Techniques) there are different Divination Techniques and the user must specify which she is employing for a given task. Unlike other Skill rolls, Divination rolls should always be made by the GM in secret. A success reveals a vague but accurate result, a failure indicates an inaccurate result, and a Total Success indicates a more specific and accurate result.

Astrology: This involves assessing star alignment, planet alignment, days and years of birth, and other celestial features (such as the appearance of omens) to determine whether a particular day is auspicious or inauspicious (or neither). This is quite important in the world of Qi Xien and astrologers are regularly consulted to determine whether a given day is auspicious for marriage or building a home. This can also be used to find the ideal name for a newly born child. Another use of Astrology is to assess a person's Fate or personality.

Feng Shui: This is a form of geomancy that senses and interprets the flow of Qi over landscape in order to maximize health and spiritual benefit. It can be used for everything from finding an ideal camping site for the evening to the best place and orientation to build a new house, to knowing where to erect a tomb for a relative. This is primarily about avoiding bad Qi flow, which can cause health problems, create ghosts, and so forth.

Matchmaking: This practice predicts the future happiness of couples by comparing their days of birth and drawing on other fortune telling Techniques to determine their fate. Matchmakers are commonly used by families to find ideal partners for their children. The matchmaker does not uncover specifics but gets a general sense of whether they will have future luck in happiness, children and wealth.

Oracle Bones: This ancient divination Technique uses turtle shells or bones. The objects are first washed, and then the diviner must write a question to the Enlightened Goddess (or other deity) about a future course of action. The question needs to be somewhat specific, such as "Will we be victorious if we fight the Kushen today?" This does not need to be phrased as a question. It could also be phrased as a statement, for instance "the Enlightened Goddess approves of the Emperor". Once the question is rendered on the bone or shell, it is placed in a fire and heated until it cracks. The crack lines reveal a general answer or statement, usually as a negative or positive confirmation ("It is inauspicious to fight the Kushen today" or "the Enlightened Goddess does not favor the Emperor").

Oracle Sticks: This is a practice common among Yen-Li and Dehuan adherents where one inscribes numbers on 100 flat sticks after making an offering to a particular spirit or deity. The sticks are then placed in a tall bamboo cup which is shaken until one falls out. While shaking the cup, the diviner asks a question to the spirit or deity. The number then corresponds to a passage in the final section of the Book of Fortunes, which predicts a person's personal fate in their realm of inquiry for the coming year (or in relation to a particular challenge). This is good for helping characters figure out when they have acquired Fate or arriving at a better sense of their personal fate as it relates to a Fate flaw. A Yen-Li variation of this uses different configurations of phoenix and dragon symbols (usually represented as rows of broken or unbroken circles).`,
  meditation: `This is a basic skill for any Martial Hero. It is used in many Kung Fu Techniques, but perhaps most importantly, for recovering and eliminating Imbalance Points when you overexert yourself. It also is used for staving off the effects of Qi Spirit Possession (TN 7+Imbalance Rating). Characters can also use Meditation to stabilize themselves when they are dying, on a Meditation Skill roll TN 7. Meditation is also used for certain abilities and rituals related to Internal Alchemy and Cultivation.`
};

const TALENT = `Talent is a Skill acquired through extensive training not covered by the other Specialist Skills. It includes such things as playing a musical instrument, brewing Poison, thievery and appreciating fine food.

Below is a list of potential talents, but Gamemasters and players can elaborate or make new ones. Because it is so vital to play, the Poisoning Talent Sub-Skill is fully described after the list. Disguise and Snake Charming are also described in some detail.

- Brewing (Alcohol)
- Calligraphy
- Cooking
- Dancing
- Disguise
- Hawk Handling
- Instrument (simply name the instrument)
- Painting
- Poetry
- Poisoning
- Reciting
- Scribing
- Sculpting
- Shadow Puppetry
- Singing
- Snake Charming
- Tattooing
- Tea Preparation
- Theft (lock picking and purse snatching)
- Writing

Disguise (Talent): This is for putting together a disguise to change a person's appearance (for yourself or another person). It uses make-up, false hair, clothing, jewelry, and so on. It can make someone look exactly like another person or like a member of the opposite sex. It takes one hour to achieve and the result is the TN for Detect rolls to discern the disguise. This is just for the disguise itself. To actively pretend to be another person one must use the Deception Skill.

Poison (Talent): This includes the art of creating and administering deadly Poisons, as well as the art of brewing herbal cures. It can be used to make a Poison or cure. Brewing takes at least an hour and requires a Talent: Poison roll (TN set by the Poison or Herbal Remedy). On a Normal Success, the Poison functions as desired. On a Total Success, the Poison is more effective than normal, so its Lethality and Speed increase by an increment. On a Failure, the Poison has no effect but the brewer risks being harmed by the raw materials. If you roll all 1s on the dice on your failed result, then you accidentally ingested or inhaled enough of the raw components to suffer the Poison's effects. Creating a cure or salve is similar to making a Poison. On a Success, the cure works as intended and can be administered in congress with a Medicine roll. On a Total Success, the cure is so potent that it bestows a +1d10 to any Medicine rolls made while administering it.

Talent (Snake Charming): This allows one to control snakes through various means. If rolled against the Resolve of a Snake, on a Success it is non-hostile and even friendly toward the Snake Charmer. Once charmed, an individual snake will remain loyal. While some use music or other means in these efforts, this is mainly a matter of knowing how to handle and communicate with the snakes. Variations on this talent are possible for different animals. Hawk Handling functions like Snake Charming for example.`;

const TRADE = `Trade is an open Skill, meaning that each time you take it you must specify which Trade Sub-Skill you want. Each Trade Sub-Skill is based around a particular medium. Characters use Trade to make or design things. Trade Skills can also be used to disarm traps of the correct medium.

Trade can be used to build (or create), design, repair or to modify existing structures or objects.

Repairing/building a simple object or device takes 1d10 days. On a Normal Success, you repair/build the object in question. On a Total Success, you do so at a much faster rate (hours instead of days).

To modify an object or device, or rig it for Failure, takes 1d10 hours. On a Normal Success, you adjust the object accordingly. On a Total Success, you do so at a much faster rate (1d10 minutes).

These are the trade Sub-Skills:

Architecture and Engineering: You can devise plans for structures of impressive size.

Alchemy: You work with minerals and other elements to produce important chemicals like dye, Divine Fire, ink, paint, and perfumes. With the exception of simple things like certain dyes and paints, to use Alchemy to create these substances, you must have the Expertise for the substance (you do still get a bonus from the Expertise). Only Alchemy uses Expertise in this way. Alchemy also is used to make longevity substances, often using metals like mercury to prolong life. When used in this way it is usually called External Alchemy, which is contrasted with Internal Alchemy (a process that also attempts to achieve longevity but through meditation and cultivation of Qi).

When using the Alchemy Sub-Skill to create chemicals, you must have the relevant Expertise and any necessary materials. It takes 1d10 hours to manufacture a substance through Alchemy. On a Success, you create the substance desired. On a Total Success, you make it in minutes instead of hours. On a Failure, you do not achieve the desired effect.

Fabric: You are a skilled weaver and understand the basics of fabric production.

Ceramics: You know how to work with materials like clay and make porcelain wares. You can create bottles, cups, bowls and other such objects.

Glass: Somewhat rare in Qi Xien, this is often used to make beads, Bi discs and similar objects.

Hide: You know how to tan leather.

Jewelry: You know how to work with precious stones and to make fine jewelry.

Mechanical: You can create simple mechanical devices like automata, locks, and water wheels. This is frequently used to disarm mechanical traps.

Metal: You can shape steel and other metals. This includes everything from harmless metal parts to weapons.

Paper: You know how to make and work with paper. You also know how to make lanterns (from paper and similar material). This can also be used to make windows.

Stone: You know the craft of stonemasonry and can work with stone and concrete to create structures.

Wood: You can perform carpentry to create wooden objects or structures.`;

const SURVIVAL = `Survival is your ability to navigate and find resources in the wilderness and to thrive in a given environment (including cities). It covers things like agriculture, travel, and fire-building. It can be used to plant crops, travel safely, chart a course across the sea, and identify important plants.

When you take Survival, you select from the following list of Sub-Skills:

Cities: For any large settlement, particularly navigating slums.

Desert: The hot arid wastes, where water is scarce.

Mountain/Hill: The hills and highlands.

Plains: The flat lands.

Sea: This applies to oceans and seas. The focus of this Sub-Skill is navigation, although it also includes fishing and surviving in the open water. For the purposes of fishing it can include rivers and lakes.

Underground: This is used for underground structures like caverns.

Wilderness: This includes forests and jungles.

USING SURVIVAL FOR FOOD AND SHELTER

When using Survival Skills for agriculture, make a Survival Skill roll for the appropriate terrain against a TN set by the Gamemaster. On a Normal Success, you reap a good yield at harvest time. On a Total Success, you reap an abundant yield at harvest.

When using Survival Skill to fish on a Normal Success, you catch enough to feed yourself and your family. On a Total Success, you catch enough fish to sell and make a small profit. On a Failure, you find no fish.

When used to forage or find shelter (as well as water), make a Survival Skill roll for the appropriate terrain against a Target Number set by the GM. On a Normal Success, you find enough food or shelter for one person. On a Total Success, you find food and shelter for many people.

Survival can also be used to track people and animals. This may be against a flat TN set by the GM or done as an opposed Survival roll.

USING SURVIVAL FOR TRAVEL

When using Survival to travel, roll for the appropriate terrain against a Target Number set by the terrain. If traveling in a group, have the person with the highest Ranking make the roll. On a Success, you manage to make it safely without getting lost. On a Total Success, you make it through in half the normal time (by short cuts and a bit of luck). On a Failure, you are lost, impeded or have an encounter. Checks are made daily, hourly or every twenty minutes depending upon the circumstances.

The TN for traveling is set by the Terrain:

Civilized Road: 4
Civilized Rural: 5
Road: 6
Hills/Rural: 7
Coastal Waters: 7
Forest/Frontier: 8
Mountains/Ocean: 9`;

const RITUAL_SKILL = `These are a range of practices that involve mudra, offerings, recitations and the creation of various focus objects or talismans. Most religions have Rituals of some form, but they are largely associated with Yen-Li. The Ritual Skill in Wandering Heroes of Ogre Gate is open, meaning you take it multiple times allowing for Ranks in individual Rituals (see Rituals in CHAPTER FOUR: RITUALS for a listing of available Rituals). You must take ranks in each Ritual separately.

Ritual includes forms of sorcery but also more common rites such as ancestor veneration. The Ritual Skill is also powerful and dangerous, as spirits, demons, ancestors and other magical forces respond to users who perform Rituals correctly. However, Rituals almost always take at least an hour to perform (many rituals take longer and this is stated in their entry). Unless otherwise stated Ritual rolls are TN 6.`;

const RITUAL_RULES = `Rituals are divided into two basic types: Rites and Magic. Rites are common rituals performed for regular religious observance or tradition such as venerating ancestors. Magic is more dangerous and taps into potentially unstable sources of power. All rituals take time to perform to achieve magical effect and can be done by anyone who knows them.

Unless stated otherwise in the individual Ritual entry, Rituals take one hour to perform. They can be learned in hours from manuals or a teacher. All Rites and Magic use the Ritual Skill. Some Rituals require the use of other Skills like Meditation or Talent, in addition to the original Ritual roll.

Performing Rites is generally safe (though failing to perform them in the right circumstances can have consequences) but Magic poses a danger to the user. There are various forms of Magic, some good, some evil, but all Magic potentially exposes users to dangerous mental effects as the powers they draw on warp their mind. Anytime you fail a Ritual roll for Magic by rolling all 3 or less on all your dice (any combination of 3s, 2s, or 1s) you gain a mental affliction from the MENTAL AFFLICTION chart (pg 164).`;

const RITUALS = {
  activation: `ACTIVATION (TN 6)

This is used to activate the power of talismans and certain magic objects. The precise method will vary depending on what it is used for.`,
  ancestorVeneration: `ANCESTOR VENERATION (TN 5)

This usually involves lighting incense at a shrine to the spirit of the family ancestors and takes about twenty minutes. It is always performed by the head of the household and failing to do so on a regular basis can result in the whole family acquiring the Fated Flaw. If the Rite is performed incorrectly (if the Skill roll fails) it should be performed again from the beginning. On a Success the Rite is performed correctly. On a Total Success the Rite brings good luck to the entire family, giving everyone a +1d10 on any Skill made in the next day.`,
  cappingHairpinningCeremony: `CAPPING/HAIRPINNING CEREMONY (TN 6)

These are coming of age ceremonies for men and women. They usually involve giving a speech and assigning a courtesy name (this simply replaces their existing personal name). In the case of boys, they don a cap at the end of the ceremony while girls put their hair up with a pin.`,
  createPaperTalisman: `CREATE PAPER TALISMAN (TN 6)

This is a basic ritual for creating a paper talisman or fu scroll. These are long strips of paper with beneficial or harmful characters rendered on them that confer some minor effect (such as a bonus or penalty). They can be used to ward away harmful spirits, provide a small bonus to attack rolls when dealing with particular types of creatures, and similar effects.

The talismans are normally pinned to an object, person, or creature and last about a day. More powerful paper talismans require use of specific rituals.`,
  spiritKeeping: `SPIRIT KEEPING (TN 5)

This is a very important ritual that must be performed on dead bodies between death and burial. Failure to do this can result in a portion of the spirit to remain in the body and animate as a Hopping Ghost or other creature. The Spirit Keeping Ritual must be performed at least once each day until the body is properly buried. It involves writing prayers on a paper talisman and asking the spirit to depart. The paper talisman is then placed on the body.`,
  bindingDemon: `BINDING DEMON RITUAL (TN 6)

This ritual first requires the user to entangle or grab the demon with rope, chain, or a net (the exact material can vary). Once this is achieved, the person holds forth a potential container such as a gourd. The user chants and draws in the spirit of the demon, trapping it in the container. Unlike most Rituals, this only takes 1d10 rounds to perform. This is really a temporary measure, as the creature can get out with a Meditation TN 10 roll (allowed once a day).`,
  blazingHandsOfHenShi: `BLAZING HANDS OF HEN-SHI (TN 6)

This odd ritual is a Yen-Li corruption of a little known Hen-Shi sutra. It functions quickly, taking only seconds to perform in the hands of a skilled practitioner (just a Move action). You prick your hands and quickly dab the blood in your palms forming the first and last character of Hen-Shi's name. Then any Demon or Spirit you strike with your hands for the next two rounds takes 2 Extra wounds as contact with your blood burns their skin. With each strike you must quickly recite the sutra for this to work.`,
  bloodOfferingDemonEmperor: `BLOOD OFFERING FOR THE DEMON EMPEROR (TN 7)

You offer up the remains of an enemy you have killed. The enemy must be your equal or more powerful than you. You present the body before a shrine dedicated to the Demon Emperor. In exchange the Demon Emperor bestows one of his gifts upon you.

Gifts can be tailored to the specific recipient. Roll 1d10. On a result of 1-4 the Demon Emperor asks you to pledge a part of yourself in exchange for the gift (a hand, a foot, an eye, 2 points of hardiness, 2 points of resolve or wits, etc). On a result of 5-10 he demands a task in exchange for the gift. A task is usually a very difficult mission that can take up to two months. If you fail, then the Demon Emperor takes a piece of you.`,
  bloodPledgeDemonEmperor: `BLOOD PLEDGE FOR THE DEMON EMPEROR (TN 7)

This is similar to Blood Offering for the Demon Emperor, but it requires that the caster cut off one of his own limbs (or sacrifice something of equal or greater significance) as a sign of loyalty to the Demon Emperor. Before making the sacrifice the caster must indulge in meat, wine and other pleasures for a full month, to de-purify his or her body. Then he or she writes a formal request onto the flesh of the offered limb, asking for an office in the Demon Emperor's hierarchy and for a gift that will help him or her serve in that office. The office is usually a title similar to those found in the imperial government. The request is written in formal Feishu script and must also include symbolic writing below the request to empower the talisman. The limb is then sliced off during the hour of the Demon, cooked and eaten by the caster. Due to the extreme nature of this act, an assistant and physician are often called upon to cook the meat and ensure the survival of the caster. If the casting is successful the Demon Emperor bestows a title and a gift. The exact nature of the gift depends on the significance of the sacrifice. It is often a very powerful ability with limited use or a great cost. For example one might gain the ability to expel a vast wind that washes over an entire army doing 1 Wound to everyone it reaches (but only be able to do this during an actual battle and requiring ten full days of rest after).`,
  celestialSpirit: `CELESTIAL SPIRIT RITUAL (TN 9)

This ritual involves visualizing the Bureaucracy of Heaven and the Enlightened Goddess and submitting a written request for some kind of action (rain, good harvest, bad weather, good fortune, etc). Petitions should be addressed to the correct deity or spirit. While this is often effective and can achieve good results when successfully performed it is more of an exchange, nothing is given without a price. The price is based entirely on the nature of the request. A person, who asks for good harvest and receives it one year, might expect a poor harvest at some later time for example.`,
  createSealOfJiangnu: `CREATE SEAL OF JIANGNU (TN 8)

This is a powerful ritual that creates a seal that wards a particular area. The seal is in the form of a written petition to the thunder goddess Jiangnu, asking her to strike down trespassers and prevent passage. It can be etched into stone, written onto paper or any other medium. The effect is to create a barrier large enough to block a doorway, passage or seal off a room. Anyone trying to get through is immediately attacked by Lightning (3d10 against Evade; 6d10 Open Damage) and is physically unable to pass through the area. There are ways around seals, the most common being petitions to other deities. Another way is to strike the seal with the sword, Blue Thunder. Every seal created in this manner is weakest in the month of the Dragon. The lightning only does 3d10 Open Damage during that month.`,
  createTalismanRedGeneral: `CREATE TALISMAN OF THE RED GENERAL (TN 8)

This ritual is complex and involves three Skill rolls to be successfully performed. First the user must repeat several chants dedicated to the Red General; this requires a Ritual Skill roll TN 8. Then the user must enter into a trance and become one with the spirit of the Red General. This requires a Meditation roll (TN 6). If successful, the practitioner can then begin to create a Talisman from any kind of metal, making a Trade (Metal) TN 6 roll. If successful the Talisman is empowered by the Red General and will function so long as the person wearing it is motived by love. The talisman lasts for a week before losing its power. The wearer gains the following benefits: +1d10 to all Combat Skills, +2 Wounds, and +1d10 to all Physical Skills, +2 to Hardiness. However the wearer also suffers the following penalty: -1d10 to all Mental Skills.`,
  curseOfTheSpirit: `CURSE OF THE SPIRIT (TN 8)

This requires writing the character "remain" on a slip of paper while reciting prayers. If the paper is placed onto (or inside of) the body of a dead person, they will come back as a ghost or undead. The only thing that can prevent this from working is to find and remove the paper or perform a Spirit Keeping Ritual on the body. However the caster of any Spirit Keeping Ritual on a cursed body takes one Wound for each casting and the TN rises to 10.`,
  drawOutTheDemons: `DRAW OUT THE DEMONS (TN 6)

You swing a sword and throw out your hands, causing a wave of blasts and explosions that force demons and spirits from their hiding places. This functions as a skill action and is made against the resolve of any demons suspected of being in the area (whether they are hiding in water, in a building, in foliage, etc). If the roll beats their resolve they are forced out into plain view. On a Total Success they take 3d10 damage from the explosions.`,
  expulsionMalignantWinds: `EXPULSION OF THE MALIGNANT WINDS (TN 8)

This ritual is meant to cure Malignant Wind Disease. It requires use of a cauldron and the caster must beseech Hen-Shi to drive out the malignant wind from the body of the afflicted. If successful it cures the illness entirely.`,
  extractPhoenixSpirit: `EXTRACT PHOENIX SPIRIT (TN 8)

This is an ancient ritual known only to a handful of practitioners throughout the world. You can use it to extract one of the five phoenix spirits that form part of a person's soul.

Extracting a spirit from someone is time consuming, taking six hours and requiring that they be still the entire time. This also requires the use of a tripod cauldron. You must write the name of the person and the phoenix spirit you want to extract on a long piece of paper or wood, then burn it into the cauldron. You then must repeat the name and phoenix spirit for the next six hours. As you do, the spirit is drawn into the cauldron then transferred into an object of your choice. There it remains until you or someone else performs the ritual again. The affected person should take the Missing Phoenix Spirit Flaw while under the effect of the ritual (they have ten days before this becomes permanent). The Phoenix Spirit can be restored by performing the Extract Phoenix Spirit Ritual in reverse.`,
  forcefulPetitionImmortals: `FORCEFUL PETITION TO THE IMMORTALS (TN 10)

With this you write a request to any Immortal of your choosing upon a piece of paper and place it on the body of a Zhen Bird (which must then ascend to the Heavens). If you succeed on your Ritual roll the Immortal experiences a deeply frustrating headache that imposes -1d10 to all its Mental Skills until it responds to the request. Note that the death of the caster also has the effect of ending the headache.`,
  greenGuardian: `GREEN GUARDIAN (TN 9)

This ritual turns someone into a devoted guardian, who retains some intelligence but no memories and follows a lifelong general command. To perform it, you must feed the person a pound of Zhe Valley Chrysanthemums, and bury the person alive for three days while chanting prayers to the earth. On the third day the person emerges, transformed. Their body is wreathed in plant-life and they slowly take on the characteristics of the local environment. They lose their memories, retain whatever abilities they had in life, and follow whatever lifelong command you give them upon their awakening. Their Max Wounds increase by four and their Stealth is 10 whenever they are surrounded by plants and greenery. Resolve increases to 10 and Hardiness increases by 3. See GREEN GUARDIAN in CHAPTER NINE for more information.`,
  harvestQiByBlood: `HARVEST QI BY BLOOD (TN 7)

This ritual allows you to harvest the Qi energy of others to use in Qi Rituals. This way you can cast Qi Rituals without draining your own Qi. To perform the ritual you must drain a person of 1 cup of blood for every Qi level you wish to Harvest. The method for this doesn't matter, so long as you gain the blood. Then you must put the blood into a Jade receptacle, which will hold the Qi energy until you wish to draw upon it. See QI RITUALS later in this chapter for more information.`,
  heartTaking: `HEART TAKING RITUAL (TN 10)

This ritual is known only to Cai Yuanyu, the Senior Grand Councilor of the emperor. To perform it one needs a small red-colored stone (no bigger than a fist), a bell and a knife. The ritual master carves out the person's heart while invoking the name of the Bold King; he then places the heart beside the stone and rings the bell (with the intention of transferring some of the person's spirit into the stone). After this he whispers the name of the emperor to the stone and places it where the person's heart was. The heart itself continues to survive out of the body if the ritual is completed properly and the target becomes a Yao (see YAO in CHAPTER TEN: THREATS AND MONSTERS). Variations of this ritual, where the heart is replaced with that of a Spirited Beast or other Demon are rumored to exist (but having much different effects).`,
  mindIllumination: `MIND ILLUMINATION (TN 7)

This ritual removes any enchantments that cause people to misperceive reality or be captivated. It is particularly well suited to the charms of demons. To perform it requires at least five other ritual masters who know Mind Illumination. You then form a ring around the person and must chant sutras to Henshi or Hedra for at least ten hours. If successful the enchantment is broken.`,
  paperTalismanCurseWarding: `PAPER TALISMAN OF CURSE WARDING (TN 6)

These paper talismans can temporarily stave off the effects of a curse, powerful magical item or similar effect on a large area. The Talismans only last six hours each and must be placed on all entrances (doors, windows, gates) to the area you intend to protect. The larger the area the more Talismans required in total (roughly 1 Talisman for every 20 foot area). This could, for example, stave off the effects of magic device that causes people to rise from the dead or drains their Qi.`,
  petitionFiveGhosts: `PETITION TO THE FIVE GHOSTS (TN 9)

This ritual is associated with the Five Ghost sect, a Yen-Li cult. It is performed by making a written request to one of the five ghosts to complete a task on one's behalf. The petition is then burned in a tripod cauldron or similar device, whereupon it ascends to the air in a golden flash of light. This petition request could be anything from murdering an enemy to spreading rumors. The petition should be made to the appropriate ghost. If stats for the ghost are needed, use one of the Gui entries. Typically the Ghost expects that his favor will be returned two-fold.`,
  boundlessDream: `RITUAL OF THE BOUNDLESS DREAM (TN 9)

This Ritual takes six hours to perform and requires use of a tripod cauldron. First you must write the name of each individual you wish to target on a red slip of paper to signify their Dragon Spirit, then on a blue piece of paper to signify their Phoenix Spirit. These are then burned over the tripod cauldron and the spirits of the target are drawn into a focus object where they are kept safe. The Dragon Spirit papers are always burned first and if the ritual master fails to draw in the Phoenix Spirits, the affected targets are splintered existing in both the focus object while their bodies remain behind as Phoenix Ghosts.`,
  boundlessPerfection: `RITUAL OF THE BOUNDLESS PERFECTION (TN 8)

The name of this ritual is perhaps an overstatement, but its existence is rumored among certain Yen-Li practitioners. This is dark magic, and comes with a higher risk than most rituals. To perform it is actually quite simple, the caster makes a food offering to a particular kind of Gui spirit, and promises to temporarily trade places. The effect is the user transforms into a Gui for 1d10 hour, while the Gui gains control of the caster's body. In additional to the normal consequences of casting such a spell, the user invites some amount of danger by making the transformation. Once a Gui has returned to physical form, it is reluctant to give it up and they have been known to seek ways of making the transformation permanent.`,
  songOfGu: `THE SONG OF GU (TN 8)

This is an exorcism ritual. It requires a number of steps. First the performer must make several offerings to deities of her choosing, then sing an ancient verse intended to coax the spirit or deity from the possessed person's body. The first step is a simple ritual roll, followed by a Talent (Singing) roll TN 6. If both steps are successful, the person is no longer possessed.`,
  goldenFireball: `THE SPELL OF THE GOLDEN FIREBALL (TN 7)

The caster assumes several mudra postures and declares the might of Sunan against all demons and spirits. At that moment a luminous orb of golden light ascends into the air and toward any nearby demons or spirits. There is the sound of war drums and clashing steel as the ball passes through the enemies inflicting 6d10 Open Damage against any such creatures.`,
  stopTransformation: `STOP TRANSFORMATION RITUAL (TN 6)

This ritual stops any supernatural transformation before it is complete. It takes 12 hours to perform and requires that you ritually cleanse the person with a cloth and recite mantras to Hen-Shi. If you succeed the transformation does not occur and the person is cured.`,
  stormsOfGushan: `THE STORMS OF GUSHAN (TALENT: MUSICAL INSTRUMENT TN 6)

This is a potentially powerful ritual that summons a potent storm. However it grows in power for every person who performs the melody. A single person performing it creates a small local wind with enough force to knock down a weak wall or tree. Every additional person adds strength to it. They must perform the melody at the same time but not necessarily in unison. Only those who venerate Gushan may use this ritual.`,
  swordRitualOfBao: `SWORD RITUAL OF BAO (TN 6)

This Ritual can be performed to channel the spirit of Bao and wage battle against demons and spirits. It requires use of an altar dedicated to Bao (or both Sunan and Bao). The user must make an appropriate offering and cleanse a sword, then enter a trance and achieve union with the mind of Bao. This also requires a successful Meditation roll (TN 6). This takes approximately ten minutes. Once this is achieved, then the performer of the Ritual is able to fight with the grace and power of Bao, channeling her Qi to fend off demons and spirits. The effect lasts for one hour, during which time the caster gains a +2d10 to his or her Medium Melee Skill, and also inflicts 2 Extra Wounds against Demons and Spirits on any successful Attack.`,
  tattooDemonKing: `TATTOO OF THE DEMON KING (TN 7)

This is an ancient ritual known among the Zun (particularly the forest dwellers). In order to perform this ritual, one must prepare the ink, chanting prayers to the Demon King, then one must apply a tattoo to the intended target's skin. This requires a Talent (Tattooing) Skill roll (TN 6). If both succeed then you render the characters for Demon King on the person. The Tattoo itself lasts for 1d10 months before fading. During that time, if you (and only you) ever speak the words Demon King, the target dies instantly.`,
  timelessStepsOfBao: `TIMELESS STEPS OF BAO (TN 7)

This ritual takes the user outside time itself, preventing anyone from seeing her. She can then choose any point within the next hour to reappear. This is particularly useful for evading powerful foes such as demons or gods. It takes only about 1 minute to perform, but you requires a series of sword steps, snaking in a southerly direction. This requires an additional Athletics roll (TN 6). To onlookers, this seems nothing more than a graceful sword form. If successful, you blink out of time and reappear anywhere you wish within the next hour and within one mile. Even to a god, you seem to have vanished from existence. This is found deep inside the ruins of Yao Gong Palace.`,
  wealthAttainment: `WEALTH ATTAINMENT (TN 7)

This Ritual recruits the work of a Gui or other supernatural entity to help the caster increase his or her personal wealth. The Gui does so unseen as a guiding force, creating new opportunities for the beneficiary of the ritual. A person can grow quite rich by use of this magic but it comes with some risk and requires a terrible act to be performed.

First the caster must create the Gui or spirit. This can only be done by killing another human being. Once this is achieved, the ritual requires the creation of special scrolls to be placed on the body, then the body placed somewhere no one will find it. If the ritual is successful the caster will encounter a golden opportunity in the next month to increase his or her wealth. If the casting is not successful, the victim becomes a Gui hostile to the caster (the type of Gui the victim becomes should be determined by the GM based on the manner in which the person died). Also if the body is ever discovered or disturbed it rises as a Gui and seeks to destroy the caster or take his or her wealth.`,
  westernHeavens: `WESTERN HEAVENS (TN TARGET'S EVADE)

The caster assumes three long mudra postures and recites an ancient sutra in a forgotten tongue. While doing this, the caster must write a character on a piece of paper that represents the intended target, then burn the paper. The target must also be within a one-mile area. On a success, the target is drained of 2 Ranks of Qi for one hour.`,
  zheValleyHeart: `ZHE VALLEY HEART (TN 8)

This ritual takes 10 hours to perform and can bring the dead back to life. To perform it, you must take the body of the person you intend to resurrect and place the heart of a living victim inside their chest. As long as the Ritual is being performed the victim whose heart has been removed will remain alive and be capable of defending themselves. Then the caster must walk in circle around both the victim and the beneficiary while chanting ancient Li Fai words. If the Ritual Skill is a success, the victim dies and the beneficiary is restored to life. If the ritual fails, the victim transforms into a Demon (any random type) until the death of the caster is achieved (and the demon desires nothing more than the caster's death). Each performance of Zhe Valley Heart demands some vitality from the caster, depleting his or her Qi for a full month.`,
  zunDemonMaster: `ZUN DEMON MASTER RITUAL (TN 8)

This ritual takes two days to perform but transforms the caster into a Demon temporarily. To perform the Zun Demon Master Ritual, one must first kill a human and create a small hut from the skin. Then within this hut, prayers and offerings must be made to the Demon King. The caster asks to be turned into a particular type of demon and if the ritual is successfully performed, he turns into the desired creature for a day.`,
  zunForestShaping: `ZUN FOREST SHAPING RITUAL (TN 7)

This ritual requires that the Demon Master recite prayers to local forest spirits, while someone assists by banging a bronze drum. If successful the caster can shape nearby forest and earth temporarily as desired for about ten minutes. This is a subtle effect that is primarily good for eluding trackers or setting up an ambush.`
};

const MENTAL = {
  command: `This is your ability to get other people to do things. It indicates how much authority you project. Use this to order soldiers, bark commands at your social inferiors or to intimidate the weak-willed. It includes a broad range of Techniques from aggressive shouting, to threats and torture.

To make a Command attempt, roll against your opponent's Resolve. On a Normal Success, you can influence your Target's behavior, within their personal limits (they will do something they consider reasonable). On a Total Success, you can influence a Target's behavior slightly beyond their normal limits. They will not ruin their own lives but they will do what they can and even bend or break a few rules to appease you.`,
  persuade: `You are adept at the art of persuasion. While Command seeks to change peoples' immediate behavior, you seek to alter ways of thinking and long term behavior. You cannot undo a person's entire worldview in a single Persuade roll, but you can work within that worldview to convince them of things.

To make a Persuade attempt, roll against your opponent's Resolve. On a Normal Success, you convince the target to believe something that he is already likely to believe with a little persuasion. On a Total Success, you can convince the target of something he is much less likely to believe. Again, though, this would have to be within the worldview of the person you are trying to convince.`,
  deception: `This is the art of lying and distorting the truth but it also includes things like pretending to be someone you are not. This skill is also used when you disguise yourself using the Talent (Disguise) Skill or in attempts to pass as being a different gender or social class (use the Disguise Talent for the initial change of appearance, however).

To make a Deception attempt, roll against your opponent's Wits. On a Normal Success, you convince the target you are telling truth (or at the very least, you convince the Target you believe you are telling the truth). On a Total Success, you are so convincing that you achieve an automatic Success with the same Target on your next attempt.

If used to assume another identity, on a Normal Success you remain convincing to observers. On a Total Success, you are so convincing you get an automatic Success on your next roll for those same observers.`,
  empathy: `This reflects how well you can read other peoples' intentions or Emotions. It can be used to decipher the motives of another character or to detect hostility. This is not a Mind-Reading Skill, but merely a Skill for interpreting social cues. GMs should not reveal what the NPC or creature is thinking when this Skill is used. Rather the PC will see signs or symptoms of the NPC's internal thoughts (a twitch, a downward look, and so forth). A GM can say what this likely suggests but it is absolutely not lie detection or thought reading.

To make an Empathy attempt, roll against your opponent's Wits. On a Normal Success, you achieve partial insight, sensing social cues that point to the person's mood or state of mind. On a Total Success, you sense subtle signs that point to the target's emotions, intentions or motives. The GM should describe what cues the player picks up on and not simply give a list of things going on in the NPC's head (for instance, "She glances at the curtain behind you when you step closer to her").`,
  reasoning: `This is your ability to think logically and analyze pieces of information. It also represents your character's memory recall and can be used for things like recognizing a face you have seen only once before or recalling the precise wording of a previous conversation. Gamemasters can allow players to make Reasoning rolls when they fail to put together clues their characters may have stitched together.

Reasoning Skill rolls are usually against a TN, though in some cases it may make sense to employ opposed reasoning Skill rolls when two characters are pitting wits against one another and it cannot be resolved in game through roleplaying. On a Normal Success, you reach a valid conclusion/recollection in 1d10 minutes. On a Total Success, you reach a valid conclusion/recollection in 1d10 seconds. If the test of reason is between you and another, simply roll and whoever gets the single highest result wins. In the event of a tie, neither side can claim victory (effective stalemate or no clear winner).`,
  detect: `This reflects how well you observe your environment. It is used to search, gather evidence and to spot stealthy opponents. At its core, this is the ability to find things amid other things.

When used for finding clues or a search, the Gamemaster should set the Target Number based on the Difficulty. On a Normal Success, you find something of significance within an hour. On a Total Success, you find something of significance in minutes.

To spot someone sneaking or hiding, make a Detect roll against the target's Stealth Score. On a Success, you spot the person, taking away the element of surprise.

Detect involves all the senses and sometimes focuses on one of them. It should be used broadly and creatively to cover a wide range of possibilities. For example someone who uses Detect to taste a specially prepared meal at a restaurant and gets a Success might be able to discern the ingredients in the dish. A person who scores a Total Success could potentially learn the chef's state of mind while preparing the meal.`
};

const PHYSICAL = {
  athletics: `Athletics is your ability to do things like jump, climb or participate in sports. Characters use this Skill for Athletic feats not covered by the other Physical Skills. For example, when trying to leap from one moving horse to another, you would make an Athletics roll.

When you attempt to perform a simple Athletic feat, make an Athletics roll against a Target Number chosen by the GM (the number is based on the difficulty of the task). On a Normal Success, you accomplish the task without any problems. On a Total Success, you achieve your goal in an exceptional way or (if appropriate) gain a free Skill Action.

Jumping: When you try to jump the Target Number is set by height or distance. For standing long jumps, the Target Number equals distance in feet (with ten feet being TN 10). For running long jumps, the TN is equal to half the distance in feet (so 20 feet for a running jump is TN 10). For vertical jumps, the TN is equal to height multiplied by 2. So to jump five feet in the air is TN 10.`,
  swim: `Swim represents your ability to tread water. It is used to check for drowning and to determine your movement speed in the water.

Movement in the water is set by your Swim Rank (in the same way Speed governs land movement). You can swim 10 feet plus 5 feet per Rank of Swim. So, a Character with two Ranks in Swim moves 20 feet in a round when in the water.

You may occasionally need to make Swim rolls for chases or races in water. When trying to out-swim someone, make contested Swim rolls. Whoever gets the single highest result out-swims the other. When chasing someone in the water, make contested rolls in the same way. If the pursuer meets or exceeds the roll of the person in flight, then he catches up to him and can attempt to make a Restrain roll. If the person trying to flee rolls higher, then he creates substantial distance between himself and the pursuer.

Sometimes you make a Swim roll to avoid drowning. If you had to make a roll every time you set foot in water, every character would drown eventually. So your Swim Rank determines under what conditions you must roll to avoid drowning. When you enter water, compare it to the Drowning conditions in the WATER CONDITIONS AND DROWNING table to see if a roll is called for (or just use common sense). See the Swim Check column of the chart to determine whether you need to roll to avoid drowning or not.

To check for drowning, make a Swim roll. On a Failure, you begin to drown (See SUFFOCATION AND DROWNING in CHAPTER TWO: RULES). On a Success, you stay afloat. On a Total Success, you stay afloat and do not need to make a check the following round.

Even conditions that do not require a Drowning check for your Rank become dangerous after a while (in which case you do need to make a Swim roll to avoid drowning). Your Endurance Rank determines how many hours you can spend swimming in safe conditions before needing to make a Drowning check. Each Rank gives you one hour. So, a character with Rank 2 Swim can spend two hours in open sea conditions before making a check.

WATER CONDITIONS AND DROWNING

Swim TN 3: Calm waters; Swim Check Rank 0.
Swim TN 6: Rough Waters; Swim Check Rank 1 or lower.
Swim TN 9: Stormy Waters; Swim Check Rank 2 or lower.
Swim TN 10: Hurricane or Tsunami; Swim Check Rank 3 or lower.`,
  speed: `Speed is a very important Skill in Wandering Heroes of Ogre Gate. It reflects how fast your reflexes are and how quickly you can get around. Its key functions are to set your movement in feet during combat and to determine your Turn Order in Combat.

You can move 30 feet plus an additional 10 feet per Rank of Speed (so with 2 Ranks in Speed you can move 50 feet in one combat round). For speed in water, use your Swim Skill instead (in water the rate of movement is 10 feet plus 5 for each Rank of Swim).

For Turn Order, when combat begins, everyone makes a Speed Skill roll and keeps their single highest result. For every Total Success after the first, add 1 to your Turn Order Score (so one Total Success is 10, two total successes is 11). Turn Order proceeds from highest to lowest. The GM counts down from the highest number each round, and you go on the round equal to your Speed roll result. If there is ever a tie, compare Speed Skill Ranks, and the person with the highest goes first. If there is still a tie, both characters go at the same time. When two characters go at the same time, they each declare their intentions and roll, and the GM determines how things unfold based on the results.`,
  muscle: `Muscle represents your physical strength and has several important uses in Wandering Heroes of Ogre Gate. With a Muscle Skill roll you can lift, break or throw objects for instance. Perhaps more importantly, you often add your Muscle to Melee Weapon Damage, usually a number of d10 equal to your Ranks in the skill. In addition, certain items require base Muscle Ranks in order to be used without penalties. So Muscle is a crucial Skill.

For more detailed information on Muscle and lifting objects see LIFTING AND MOVING OBJECTS in CHAPTER TWO: RULES.`,
  endurance: `Endurance represents your stamina and conditioning. Enduring harsh elements or running a long distance requires an Endurance roll. This is the skill to use when something might cause a character to collapse or pass out. The Target Number should be set by the Gamemaster.

When pushing your body to the limit, make an Endurance Skill roll. On a Normal Success, you remain active without resting. A Total Success imparts an automatic success for the same activity in the same period. A Failure indicates your body must rest or pass out in a number of rounds equal to your Hardiness (passing out lasts 1d10 minutes).`
};

const RIDE_AND_SAIL = `Ride and Sail are two open Skills that can be taken multiple times for each type of vessel, animal or vehicle. For example, if you know how to drive a Wagon you take Ride (Wagon) and assign the desired Ranks.

Each time you take either of these Skills select from the following lists (these are not exhaustive).

Ride: Camel, Elephant, Horse, and Wagon.

Sail: Barges, Junks, and Row Boats.

The Ride and Sail skills can be used to evade, give chase, escape dangerous conditions or avoid sudden obstacles. In the case of sailing vessels, it can be used to pilot or captain a ship and to navigate.

All modes of transportation have a Performance Rating (and many have something called a handling speed). Anytime you try to perform a risky maneuver or exceed handling speed, you must make a Ride or Sail Skill roll with a TN equal to the mode of transport's Performance Rating.

For more information on Performance Ratings and Handling Speeds of Vehicles see CARTS, HORSES AND BOATS in CHAPTER TWO. See their respective entries in CHAPTER FIVE: EQUIPMENT as well.

RACES AND PURSUIT

This functions the same as it does for characters using their Speed roll to race when on foot (See SPEED SKILL). When you are racing vehicles or horses, simply roll their Speed (listed in each entry in the MOUNTS AND TRANSPORT in CHAPTER FIVE: EQUIPMENT). This is a contested roll between all participants. For a Race, whoever rolls higher wins, wins that segment of the race, or pulls ahead. On a Total Success, you can exceed your Handling Speed that round without making a Ride/Sail roll. For chases, the pursuer needs to meet or exceed the roll of the transport in flight to catch up. If the person running away rolls higher, then he creates substantial distance between himself and the pursuer (at least his transport's movement in feet).

MANEUVERS

On a Normal Success for any Ride/Sail Skill roll, you maintain control. On a Total Success, you can perform maneuvers or move at the Handling Speed without making another roll for one round. Maneuvers include: exceeding handling speed, sharp turns, jumping, sudden stop, and cutting off.

COMBAT

For combat on vehicles use the following rules. The rider or captain makes attacks using his Ride or Sail against the other vehicle's Evade Score. On a Success, he rolls his vehicle's Damage against the target Craft's Hardiness and deducts any Wounds from its Integrity. For ship combat we recommend using the Armies and War rules in CHAPTER TWO: RULES. Ship combat operates the same, except the person coordinating the attacks will occasionally use other skills like Large Ranged for ballista or cannons. This is explained in greater detail in CHAPTER FIVE: EQUIPMENT.`;

const KNOWLEDGE_RULES = `Knowledge Skills encompass the things you know and understand. They include worldly knowledge and academic knowledge. This is an important category for anyone seeking to pass the Imperial Exams.

In most cases, Knowledge Skill rolls are made to determine whether you know a specific or relevant piece of information. Because knowledge is a reflection of what you already understand, you do not need to make as many rolls for them as with other skills. From time to time you will be called upon to do so, but often you can simply judge by your Rank if you know something. It is primarily when you try to operate beyond your Rank in a subject that a roll is required.

The only time you need to roll for knowledge is when the information you are after is more advanced than your level of understanding in the subject (i.e. if you want information that requires 2 Ranks in a subject but you only have one) and you attempt to make an educated guess based on what you know (and when taking exams). This level of understanding is called mastery.

Therefore, it is important to understand what different Ranks signify in terms of your mastery of a subject. There are five basic levels of mastery (plus two additional levels that are obtainable at the Profound and Immortal levels). Always be sure to add in any relevant Expertise when gauging your level in a particular subject:

0 Ranks (Untrained): You have no knowledge of the subject.

1 Rank (Novice): You are just starting to learn about the subject and only know very basic things.

2 Ranks (Student): You have spent a great deal of time learning about the subject but are far from a master. You have good general understanding of its major topics, though you do not know the finer details.

3 Ranks (Scholar): You have devoted yourself to the study of the subject and possess in-depth knowledge. You know the finer details but some obscure facts elude you.

4 Ranks (Master): This is only possible with an Expertise and three Ranks in a Knowledge (or when you become a Profound Master or Immortal). You are one of the world's leading masters of the subject. If you do not know something about it, chances are that information is not available. You even know obscure tidbits that few have heard.

5 Ranks (Earthly Authority): Your knowledge of all earthly matters on the subject is complete. There is nothing recorded that exists in the world of man that you do not know about it.

6 Ranks (Celestial Authority): Your knowledge on all earthly matters on the subject is complete but you also know information recorded on the subject in the various celestial and demon realms. Only a few obscure details elude you.

When you attempt to use one of your Knowledge Skills, for example, to see if you know whether Zhen Birds are venomous, the GM will decide what level mastery that information requires. If your Rank is that level or greater, there is no roll required. If the information is deemed beyond that level, then you must roll to make an educated guess.

Languages follow a slightly different format than the one provided above, but this is explained in the Language Skill entry.

In addition to being used for determining what you already know, Knowledge rolls are made when conducting research through texts or artifacts to obtain new knowledge. This reflects your ability to navigate a subject and find the information you want quickly.

All Knowledges are open Skills, so you specify a Sub-Skill each time you select one and take up to three Ranks in it. You can take each Knowledge multiple times for different Sub-Skills. For example, you could take Places/Cultures (Chezou River) at 3 Ranks, Places/Cultures (The Kushen Basin) at 2 Ranks, and Places/Cultures (The Zun River Valley) at 2 Ranks.`;

const KNOWLEDGE = {
  history: `HISTORY

This reflects your knowledge of a region's past. It can be taken multiple times, for a broad historical period. The Gamemaster should set the Target Number for any History Skill rolls. On a Normal Success, you know relevant information about the region's history. On a Total Success, you know relevant information but can go a step beyond and make deeper connections.

Each time you take this Skill, choose which Sub-Skill you want Ranks in. History Sub-Skills are by historical age, rather than place. The Historical Ages are: the Era of the Thundering March, the Era of the Great Emperor, the Era of the Compassionate Daughter, the Era of the Demon Emperor, the Era of the Five Kingdoms, the Era of the Two Kingdoms, the Era of the Eastward Bound Invaders, the Era of the Northern Horse Riders, the Era of the Dutiful State, the Era of 100 Pieces, the Era of the Righteous Emperor, and the Era of the Glorious Emperor (present age).`,
  creatures: `CREATURES

This is your knowledge of animals, powerful beings and monsters. It is an important Skill if you want to know a creature's weakness or its key characteristics. When selecting this Skill take from the group of broad classes listed below each time. You can add another level of mastery by selecting an Expertise in specific creatures. This Skill imparts understanding of basic biology, diet, behavior, lore, and so on.

When making a Creatures Skill roll, the GM should set the TN based on difficulty. On a Success, you know an important piece of information about the creature. On a Total Success, you know several important pieces of information. Keep in mind that you do not need to roll if the information you hope to know is within your level of mastery.

Each time you take this Skill, choose which Sub-Skill you want Ranks in. The Creatures Sub-Skills are: Animals, Demons (includes Spirited Beasts), Humanity, Insects, Monsters, and Spirits (includes Ghosts and Undead).`,
  placesCultures: `PLACES/CULTURES

This Skill involves knowledge of places and cultures. It means you understand customs, politics, food, traditions, etc. You can take it multiple times.

The Gamemaster should set the TN for any Places/Cultures Skill roll. On a Normal Success, you know an important bit of information about the region. On a Total Success, you know multiple pieces of information about the place.

Each time you take this Skill, choose which Sub-Skill you want Ranks in. Sub-Skills are by region. The regions in Qi Xien are: Chezou River Valley, Dai Bien, the Emerald Coast, Hai'an, Hu Qin, Jian Shu, the Kushen Basin, Li Fan, Suk, the Yan Gu Plains, and Zun River Valley. Acquiring ranks in regions not listed here requires travel to them.`,
  martialDisciplines: `MARTIAL DISCIPLINES

The Martial Disciplines Skill is your knowledge of various Kung Fu Techniques and the broad categories they belong to. You can use it to identify a Technique or school's style. This is your knowledge of the different martial disciplines.

The TN for a Martial Discipline Skill is set by the GM. It should be based on the rarity of the Technique. So, something that is quite commonly performed should have a TN of 6, while an extremely rare Technique could be as high as 10.

Each time you take this skill, choose which Sub-Skill you want Ranks in. The Sub-Skills are: Waijia, Qinggong, Neigong, and Dianxue. You are able to use the skill to identify Kung Fu Techniques within that Discipline.`,
  institutions: `INSTITUTIONS

This Knowledge Skill is for important institutions. It reflects your working knowledge of things like armies or sects.

Like other Knowledge Skills, Target Numbers for Institutions rolls should be set by the GM. On a Normal Success, you know a relevant piece of information about the Institution. On a Total Success, you know several important bits of information.

Each time you take this skill, choose which Sub-Skill you want Ranks in. The institution Sub-Skills are: Criminal Underworld, the Imperial Bureaucracy, Military Organization, Religious Organizations, Sects, and Societies.`,
  language: `LANGUAGES

This represents your mastery of speaking different languages. It does not allow you to read scripts, however. Language can be taken multiple times, and all characters start with 3 Ranks in their native language. Daoyun, Hai'anese, and Li Fai are all related dialects of a broader tongue called Fei. All Fei speakers can communicate with one another, though with some difficulty.

Languages are quite simple and there are four basic levels of mastery. To speak within the scope of your Rank, you do not need to roll. For example, if you have 1 Rank in Daoyun and simply want to thank someone for being friendly, no roll is required. Should you then attempt to discuss your plans to revolutionize the silk trade, with just 1 Rank in the language, you would need to make a roll (with a high Target Number).

When making a Language Skill roll, you can communicate and understand on a Success. On a Total Success, you can pass as a native speaker. On a Failure, you fail to comprehend or communicate successfully.

Here are the basic levels of language mastery.

0 Ranks: You cannot speak a single word of the language

1 Rank (poor): You know basic words and conversational phrases, but cannot form complex or meaningful sentences.

2 Ranks (average): You can communicate in the language but with some trouble.

3 Ranks (fluent): You can communicate with competence in the language and speak on complex subjects.

You can take Ranks in multiple languages. Always start with 3 Ranks in your native tongue. When choosing a language, select from the list below (script is noted in parenthesis):

Daoyun (Feishu): The official language of the Zhan Dao Empire, spoken by most people north of the River Fei to the Yu River.

Hai'anese (Feishu): Spoken in Hai'an and by the Suk.

Khubsi (Yoshaic): A language from the far west spoken by the Khus. There are also traces of it in the Banyan region for some reason.

Kushen (Yanzi): Spoken in the Kushen Basin.

Li Fai (Feishu): Spoken in Li Fan and Hu Qin. Also spoken in the Banyan region.

Singh (Sai): Spoken by some in the South.

Yanli (Yanzi): Spoken in the Yan Gu Plains and the Emerald Coast.`,
  readScript: `READ SCRIPT

This is your ability to read and write a language's script. It does not grant you the ability to communicate in a language you do not have. It simply allows you to understand the language's letters. This must be taken for any language that you wish to be literate in. Groupings of languages have their own script plus sects have secret scripts as well.

Language Scripts: Feishu (Hai'anese, Li Fai, Daoyun), Sai (Singh), Yanzi* (Yanli and Kushen), and Yoshaic (Khubsi).

Sect Scripts: Each sect has its own script. These are just codes and symbols used to communicate with their own members. Scripts are only taught to members of a sect and extremely difficult for outsiders to learn. Characters gain 1 Free Rank in their Sects script at Character Creation.

*This script is a relatively recent invention.`,
  religionGods: `RELIGION/GODS

This is your knowledge about the different religious practices in the world. It represents your familiarity with the religion's beliefs and principles. Religion/Gods is an open Skill so you take it separately each time, allowing for different Ranks in different religions. This Skill is useful for identifying certain religious practices, dress, and so on. For rites and ceremonies, use the Ritual Skill.

Qi Xien has many belief systems. The major ones relevant to the Banyan region are described in the RELIGIONS AND PHILOSOPHIES section of CHAPTER SEVEN: THE WORLD OF QI XIEN.

Each time you take the Religion Skill, pick from one of the following or one of the less common entries from Chapter Seven (for example Hedra).

Cult of Hen-Shi: Some people venerate a figure named Hen-Shi, a woman believed to be the daughter of the Enlightened Goddess. She is known for her compassion and mercy, ideals her followers embrace.

Dehua: This is the most traditional and widespread religion of Qi Xien. It is both a faith and a philosophy. The great teacher, Kong Zhi, established it and its core belief is that the world of man (Qi Xien) is imperfect, but that we can aspire to perfection by emulating the principles of the Perfect Realm (Wan Mei) and by following the will of Xian Nu Shen (the Enlightened Goddess). The core values of Dehua are Filial Piety, Integrity, Loyalty, Propriety, Righteousness, Social Order, Tradition, and Wisdom.

Gushan: This is the Suk wind god of the South. According to those who worship Gushan he is the supreme reality that absorbs all. They acknowledge the existence of Xian Nu Shen and her realms, but in their view these are pale echoes of Gushan's magnificence.

Qi Zhao: This is an outgrowth of Dehua but blends practices from other religions. While they believe in similar core principles, they reject the path laid out by Dehua. Practitioners believe that the distinction between the Realm of Man (Qi Xien) and the Perfect Realm (Wan Mei) is an illusion, that the Perfect Realm can be achieved here on earth by living in harmony with nature. Their values can vary depending upon the lineage but often include Bravery, Individuality, Innovation, Passion, Truth and a healthy skepticism of the Orthodox. Many practitioners of Qi Zhao also hold Hen-Shi in high regard.

The Majestic Lion Cult: This religion originated in the West but accepts much of the cosmology shared by Dehua, Yen-Li and Qi Zhao. They believe in a figure called the Majestic Lion, who carries souls to paradise in the afterlife. According to their system of belief, to enter paradise one must be free of outstanding grudges. This means you must spill the blood of your enemies before you die. Only then will the Majestic Lion deliver you to Paradise.

Yen-Li: A system of folk beliefs that emerged around the phenomena of Qi and its presence in Qi Xien. Practitioners venerate spirits, immortals and other beings including Sunan and Bao. Like Dehuans they believe in the Perfect Realm (Wan Mei) but they regard it as one of countless worlds, all porous and interconnected.`,
  classics: `CLASSICS

This is your knowledge of the classic texts in Qi Xien. The classics are the foundational texts of Daolin civilization and are important for anyone seeking official positions (memorizing them is key to passing the Imperial Exams). This is an open Skill like all Knowledges. Each time you take it, you take Ranks in one of the following works. While there are other works of note, these are the major ones, and possessing a Rank in one of them reflects broader knowledge of similar texts on the subject. The classics are all written in Daoyun.

The 26 Stratagems of Jiang Laozi: Jiang Laozi was a famous general during the Era of 100 Pieces and helped bring the Righteous Emperor to the throne. This text was written by Shang Fei who served under Jiang as a soldier. After his service, Shang Fei passed the Imperial Exams and rose to prominence as a poet and historian. The text is about the importance of unconventional tactics in war, and uses 26 examples used by General Jiang Laozi to overcome more powerful opponents.

Book of Fortunes: This is a Dehuan book of divination methods for determining the will of the Goddess Xian Nu Shen (who dwells in the Perfect Realm). It is also used by some Yen-Li practitioners. It includes methods such as reading hexagrams by drawing short and long stalks and arranging them into patterns. It also includes more ancient methods such as applying heat to shells to create cracks, which can then be interpreted. The book of Fortunes was written by Li Zhongyan.

Book of Laws: This is a text explaining principles of state power and its relationship with the people. Sometimes it appears at odds with the tenets of Dehua, yet some Dehuan scholars have synthesized it with their philosophy. The text goes in and out of favor, partly due to its emphasis on rigid and uncompromising implementation of law, and its sometimes cruel application by tyrants. However, it lays out some significant concepts and traditions that have been essential to maintaining a stable government. Most imperial bureaucracies have been modeled on the blueprint contained in the Book of Laws. This is believed to have been written in the Era of the Great Emperor by Minister Guan Dao.

Glorious Histories: Written by the highly respected court official and historian, Fan Qi, its original title was The Righteous Histories, in honor of Zhao Dao Huangdi, the Righteous Emperor. When Zhao Dao Huangdi's son came to power he executed Fan Qi and had his own court scholars revise the text to make it seem that history had prepared for his reign. This is a lengthy book, and though the text has been altered, much of it remains a reliable account of the Empire's political history. It should be noted that unaltered versions of the book are still widely read and studied in Hai'an.

Rites of Wan Mei: This is a Dehuan book, written by its founder, Kong Zhi. Dehua is an important philosophy and religion in Qi Xien. The Rites of Wan Mei are guidelines for etiquette and proper religious observances meant to bring one in alignment with the Perfect Realm (Wan Mei).

Sayings of Kong Zhi: This is another Dehuan book that contains dialogues between Kong Zhi and his students. It expresses the philosophical underpinnings of Dehua, its key moral principles (Filial Piety, Integrity, Loyalty, Propriety, Righteousness, Social Order, Tradition, and Wisdom), the importance of social roles, and the function of the state and its leadership. The core teaching of Dehua is that all things should strive to align themselves with the Perfect Realm (Wan Mei) and improve.

Scripture of Sun Mai: Technically this classic is not a Dehuan text, but it was based on the teachings of a great Dehuan Scholar whose ideas developed into Qi Zhao. Qi Zhao holds that the perfect Realm is a state of mind. The scripture of Sun Mai is a collection of 12 books that explains this idea and promotes dialogue, debate, meditation and clarity of judgment.`
};

export function fullSkillDescription(key, fallback = "") {
  if (COMBAT[key]) return COMBAT[key];
  if (SPECIALIST[key]) return SPECIALIST[key];
  if (MENTAL[key]) return MENTAL[key];
  if (PHYSICAL[key]) return PHYSICAL[key];
  if (key === "ride" || key === "sail" || key.startsWith("ride.") || key.startsWith("sail.")) {
    return RIDE_AND_SAIL;
  }
  if (key === "talent" || key.startsWith("talent.")) return TALENT;
  if (key === "trade" || key.startsWith("trade.")) return TRADE;
  if (key === "survival" || key.startsWith("survival.")) return SURVIVAL;
  if (key === "ritual") return join(RITUAL_SKILL, RITUAL_RULES);
  if (key.startsWith("ritual.")) {
    const ritualKey = key.slice("ritual.".length);
    return join(RITUAL_SKILL, RITUAL_RULES, RITUALS[ritualKey]);
  }

  const knowledgeKey = key.split(".")[0];
  if (KNOWLEDGE[knowledgeKey]) return join(KNOWLEDGE_RULES, KNOWLEDGE[knowledgeKey]);

  return fallback;
}
