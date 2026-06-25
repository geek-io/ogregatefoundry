import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { OGRE_GATE } from "../module/config.mjs";
import { WEAPON_CATALOG } from "../module/content/equipment-catalog.mjs";
import { parseOgreGateStatblock, statblockItemData } from "../module/rules/statblock-importer.mjs";
import { packSourcePath } from "./pack-paths.mjs";

const source = packSourcePath("npcs");
const FOLDERS = {
  humanThreats: {
    id: "a7413dcd71f3b7a0",
    name: "Human Threats",
    directory: "human-threats",
    section: "Human Threats"
  },
  chapter9Named: {
    id: "b83f0a7c9d2e6145",
    name: "Chapter 9 Named NPCs",
    directory: "chapter-9-named-npcs",
    section: "Chapter 9 Named NPCs"
  },
  monsters: {
    id: "f9c4a6d84503b812",
    name: "Monsters",
    directory: "monsters",
    section: "Monsters"
  }
};

const STATBLOCKS = [
  {
    id: "c9abbessxhbio001",
    name: "Abbess Xiong-Hua",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Abbess Xiong-Hua was born into the Tree-Dwelling Nun sect, her mother being a respected Senior Nun and her father an Initiate. The Abbess is called the Ferocious Flower, because she adorns herself in lotus flowers and has an unrelenting fighting style. Her chief personality traits are stubbornness and bravery.

She is friendly with Abbot Huan Dai of the Nature Loving Monk sect and has a long-standing grudge with Lady Plum Blossom of the Purple Cavern sect (who poisoned one of her junior disciples). She also has a grudge against The Gentle Demon for marrying her disciple, Huifing. Above all she despises the Dehua sect because of their haughtiness. For this reason, she immediately hates anyone who appears to be friendly with Dehua.`,
    text: `Abbess Xiong-Hua
Abbess Xiong-Hua was born into the Tree-Dwelling Nun sect, her mother being a respected Senior Nun and her father an Initiate. The Abbess is called the Ferocious Flower, because she adorns herself in lotus flowers and has an unrelenting fighting style.
Defenses: Hardiness 5, Evade 8, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 3d10, Arm Strike: 2d10, Throw: 1d10, Kick: 1d10, Light Melee: 3d10 or 5d10 with Butterfly Swords, Medium Melee: 2d10, Heavy Melee: 1d10, Athletics: 3d10, Speed: 2d10, Muscle: 2d10, Endurance: 3d10, Meditation: 3d10, Ritual (Spirit Keeping): 3d10, Ritual (Zun Forest Shaping): 2d10, Ritual (Activation): 2d10, Ritual (Binding Demon): 2d10, Divination: 3d10, Detect: 3d10, Languages (Daoyun): 3d10, Language (Li Fai): 3d10, Language (Hai'anese): 2d10, Institutions (Sects): 3d10, Institutions (Criminal Underworld): 2d10, Places (Dai Bien and Zun River Valley): 3d10, Survival (Wilderness): 3d10, Survival (Mountains): 2d10, Religion (Yen-Li): 3d10, Religion (Qi Zhao): 2d10, Creatures (Spirits): 3d10, Read Script (Tree-Dwelling Nun): 3d10
Qi: 6
Max Wounds: 13
Weapons: Net, Butterfly Swords (3d10 Damage, +1d10 Accuracy), and Daggers (2d10 Damage)
Expertise: Butterfly Swords
Reputation: Brave-Ferocious
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Blasting Blade, Drift of the Butterfly Fish, Flight of the Hawk, Great Stride, Tree Bounding Stride, Tree Bounding Strike, Horizontal Sidestep, Ferocious Flower's Storming Petals, Breath of the Lotus Petal, Lashing Dragon, Leap of the Swan, Purge Spirit, Great Stride, Storming Needles, Trapping Wind, Finger Flick, Storming Daggers, Weapon Hunts for Food, Blazing Net, Horizontal Sidestep (Counter), Whirling Dodge (Counter), Interception Arrow (Counter)`
  },
  {
    id: "c9bronzebio00001",
    name: "Bronze Master",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The Bronze Master is the most influential member of the Golden Dragon sect's council of Six Masters. Throughout the martial world he is respected and held in high esteem for his profound Kung Fu and impeccable character. While he projects this image of himself to the world, inside he is selfish and will do anything to advance his own interest. Bronze Master is the martial world's supreme hypocrite. He values his reputation and is not above stooping to murder to stamp out gossip or rumor.

Thirty years ago, the Bronze Master was deeply in love with another member of the council, Lady Sapphire, but romance between members of the sect was forbidden. He learned that Lady Sapphire and Master Emerald had already consummated a love affair and was filled with jealous rage. Though an archaic and often overlooked rule, the Bronze Master made a point of having it enforced. However he feared that if both Master Emerald and Lady Sapphire were ejected from the sect, they would continue as lovers. Therefore he put all the guilt on Sapphire, accusing her of seducing Master Emerald with sorcery. The punishment for this was death.

When Emerald pleaded with him for Lady Sapphire's life, Bronze Master agreed to let her leave the sect in peace so long as Master Emerald remained and continued to atone for his crimes. If he ever tried to leave the sect, Bronze Master vowed to have Lady Sapphire killed. Later, Bronze Master disguised himself as Master Emerald and told Lady Sapphire his position in the sect meant more to him than their love. Lady Sapphire left the sect, and changed her name to Lady Plum Blossom.

To this day Bronze Master loves Lady Plum Blossom and has exerted his influence from time to time to protect her from harm. He is the sort of man who usually feels no remorse for things he has done. However, thinking of Lady Plum Blossom brings regret and remorse. He is not worthy of her love and knows it.`,
    text: `Bronze Master
The Bronze Master is the most influential member of the Golden Dragon sect's council of Six Masters. Throughout the martial world he is respected and held in high esteem for his profound Kung Fu and impeccable character.
Defenses: Hardiness 10, Evade 4, Parry 4, Stealth 6, Wits 8, Resolve 7
Key Skills: Grapple: 3d10, Arm Strike: 3d10, Throw: 2d10, Kick: 3d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Athletics: 1d10, Speed: 1d10, Muscle: 3d10, Endurance: 3d10, Medicine: 1d10, Meditation: 3d10, Detect: 3d10, Deception: 3d10, Persuade: 2d10, Languages (Daoyun): 3d10, Languages (Li Fai): 2d10, Languages (Hai'anese): 3d10, Read Script (Feishu): 3d10, Read Script (Golden Dragon): 3d10, History (Era of the Demon Emperor): 3d10, History (Era of the Righteous Emperor): 3d10, Institutions (Sects): 3d10, Creatures (Demons): 3d10, Creatures (Spirits): 2d10
Qi: 5
Max Wounds: 11
Weapons: Qiang (5d10 Damage)
Reputation: Righteous-Unjust
Flaws: Secretly Evil
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Calm of Sunan, Drift of the Butterfly Fish, Flaming Dragon, Fluttering Kicks, Inverted Three-Point Strike, Lashing Dragon, Leap of the Swan, Palm of the Dragon, Rising Dragon Stance, Shift of the Chameleon, Spear of the Infinite Emperor, Spear Swipe, Spinning Back Kick (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "c9caiyuanyubio001",
    name: "Cai Yuanyu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Cai Yuanyu is the Senior Grand Councilor of the Zhan Dao Empire and the close adviser of Emperor Zhan. He appears to be no older than his early fifties but is actually 134 years old. Cai Yuanyu stopped aging when he was 54 after the Yao recovered the Heart of Yao-Feng. While the object is supposed to prolong the life of the person who wears it, currently Emperor Zhan Dao, for some reason it appears to have benefited Cai Yuanyu as well.

Cai Yuanyu has an unusual background. He was originally a Yen-Li priest of Five Ghost Lineage in the Banyan region, but left after having relentless dreams about the Demon Emperor. He became convinced that in a former life he had served the Demon Emperor in some capacity and secretly began to venerate the spirit of Yao-Feng. He studied the history of the emperor's reign and devised his own rituals to draw on the Demon Emperor's power.

Though he never took the Imperial Exams, he was appointed to a position in the Department of the Censorate by a sponsor, Cai Yanbo, who saw promise in him. Yuanyu took his sponsor's surname and entered his household. It was from Cai Yanbo that Yuanyu learned about the Bold King and the Heart of Yao-Feng. Cai Yanbo ensured he had a good career path in the Department of the Censorate. He regarded Cai Yuanyu as his own son, bestowing his wealth and property on him when he died.

Yuanyu came to the emperor's attention by hinting at the existence of the Heart of Yao-Feng and using his knowledge as a surveillance official to help the emperor improve the Bureau of Inward and Outward Righteousness. Because of his hard work, he was ultimately made director of this institution. As director, Yuanyu introduced the Heart Taking Ritual to ensure the loyalty of their Martial Heroes. He also led the mission nearly 80 years ago to obtain the Heart of Yao-Feng.

Cai Yuanyu is feared and respected by other Imperial officials. His temperament is cool but curious and friendly if his interest is piqued. Though he comes from a humble background, decades of palace life have spoiled him. Yuanyu's knowledge of certain topics is encyclopedic but no one would describe him as naturally intelligent; his accomplishments are a product of determination more than inherent ability. This has led to several notable weaknesses, particularly in subjects he has little interest in.`,
    text: `Cai Yuanyu
Cai Yuanyu is the Senior Grand Councilor of the Zhan Dao Empire and the close adviser of Emperor Zhan. He appears to be no older than his early fifties but is actually 134 years old.
Defenses: Hardiness 4, Evade 6, Parry 9, Stealth 7, Wits 6, Resolve 10
Key Skills: Throw: 2d10, Grapple: 3d10, Arm Strike: 3d10, Leg Strike: 3d10, Medium Melee: 2d10, Light Melee: 3d10, Speed: 3d10 (60 feet), Muscle: 1d10, Detect: 2d10, Athletics: 1d10, Endurance: 1d10, Trade (Alchemy): 3d10, Ritual (Wealth Attainment): 3d10, Ritual (Spirit Keeping): 3d10, Ritual (Heart Taking): 3d10, Ritual (Extract Phoenix Spirit): 2d10, Ritual (Activation): 2d10, Ritual (Zun Demon Master Ritual): 2d10, Ritual (Tattoo of the Demon King): 2d10, Ritual (Petition to the Five Ghosts): 3d10, Ritual (Blood Offering for the Demon Emperor): 3d10, Ritual (Blood Pledge of the Demon Emperor): 3d10, Ritual (Binding Demon): 2d10, Medicine: 3d10, Meditation: 2d10, Talent (Poetry): 0d10, Talent (Poison): 3d10, Persuade: 2d10, Deception: 3d10, Empathy: 3d10, The Classics (All): 1d10, History (Era of the Demon Emperor): 3d10, History (Era of the Glorious Emperor): 3d10, History (Era of the Righteous Emperor): 3d10, History (Era of the Two Kingdoms): 2d10, History (Era of The Eastward Bound Invaders): 2d10, Places/Cultures (All): 3d10, Languages (Singh, Daoyun, Khubsi): 3d10, Read Script (Feishu, Sai): 3d10, Institutions (Imperial Bureaucracy): 3d10, Religion (Yen-Li): 3d10, Religion (Bold King): 3d10, Creatures (Demons): 3d10
Qi: 4
Max Wounds: 9
Weapons: Fan (4d10 Damage)
Expertise: Alchemy-Longevity Substances, Alchemy-Transformative Substances
Reputation: Cunning-Shameful
Key Kung Fu Techniques (Waijia 1, Neigong 3): Absorbing Palm, Curing Palm, Gust of the Fan Blade, Naga Palm, Purge Spirit, Ringing Strike of the Divine Ram, Trapping Wind, Swift Rebuttal (Counter)
Powers
Immortality: The Heart of Yao-Feng bestows its powers of immortality on Cai Yuanyu as well as the emperor. As long as the Emperor lives, so will Cai Yuanyu.`
  },
  {
    id: "c9caobaibio00001",
    name: "Cao Bai",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Cao Bai is a well respected scholar in his early 70s, from Hai'an. He is an expert on the Age of the Demon Emperor, with an interest in Sunan and Bao, and a special devotion to the Wind Sabre and Phoenix Crown.

Cao Bai is both admired and ridiculed for his honesty. This recently got him into trouble with General Qiang of Rong-Yao, his former patron. He offered too frank an assessment of the General's thorough methods of justice and is now in flight. He is currently looking for a group of martial heroes to travel with so they can protect him.`,
    text: `Cao Bai
Cao Bai is a well respected scholar in his early 70s, from Hai'an. He is an expert on the Age of the Demon Emperor, with an interest in Sunan and Bao, and a special devotion to the Wind Sabre and Phoenix Crown.
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 9, Resolve 6
Key Skills: Combat Skills: 0d10, Speed: 1d10, Muscle: 0d10, Endurance: 1d10, Divination: 2d10, Medicine: 2d10, Meditation: 1d10, Talent (Poetry): 2d10, Persuade: 2d10, Deception: 2d10, Detect: 1d10, Institutions (Sects): 2d10, Places (Jian Shu and Dai Bien): 3d10, History (Era of the Demon Emperor): 3d10, History (Era of the Righteous Emperor): 3d10, History (Era of the Five Kingdoms): 3d10, Languages (Li Fai): 3d10, Languages (Daoyun): 3d10, Language (Hai'anese): 3d10, The Classics (All): 3d10, Creatures (Demons): 1d10, Creatures (Spirits): 2d10
Max Wounds: 1
Expertise: History-City/Topic-Wind Sabre of Sunan, History-City/Topic-Phoenix Crown of Bao
Reputation: Truthful-Truthful`
  },
  {
    id: "c9compmonkbio001",
    name: "Compassionate Monkey",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Compassionate Monkey is a monkey who learned Kung Fu by spying on great masters then using it on his fellow apes. In the process he became an intelligent but cruel spirited beast, and eventually learned to talk. In the Kushen Basin he marauded local populations for sport and came to lead a small gang of men.

One day, Hen-Shi appeared before him and told Compassionate Monkey to repent and become a force of benevolence in the world. He attacked her and she disappeared. Struck by her beauty, every time he attacked someone Hen-Shi's words echoed in his mind. This continues to build into a great crescendo until he stifles it with a good deed. Though his nature is still cruel, Compassionate Monkey performs good services to silence the echoes of Hen-Shi in his head. He considers himself a devotee of Hen-Shi but is also angry with her. His relationship to the deity is like that of a child who does not understand a parent's authority.

Though cruel by nature, Compassionate Monkey works to improve himself. He simply lapses into his aggressive and violent past when stressed. Once he gives in, Compassionate Monkey delights in causing harm. One redeeming quality Compassionate Monkey possesses is honesty. Sometimes this gets him in trouble, but it also means he does not go back on his promises; if he does, he is genuinely remorseful.

Compassionate Monkey has two disciples, Xun and Anzhi. Xun is missing his left arm, while Anzhi is missing his right. They were ripped out by Compassionate Monkey in a rage when the two initially refused to devote themselves to Hen-Shi. Xun and Anzhi are all that remain of his gang from the Kushen Basin. Compassionate Monkey came to Red Mountain Villa following rumors of a great treasure, but was defeated by the Immortals and forced to take a vow to watch the mountain bridge. Taking the vow seriously, he guards the bridge and has his disciples protect the path up the mountain.`,
    text: `Compassionate Monkey
Compassionate Monkey is a monkey who learned Kung Fu by spying on great masters then using it on his fellow apes. In the process he became an intelligent but cruel spirited beast, and eventually learned to talk.
Defenses: Hardiness 4, Evade 6, Parry 8, Stealth 9, Wits 6, Resolve 8
Key Skills: Bite: 1d10 (Damage 4d10), Throw: 2d10, Grapple: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Medium Melee: 2d10 or 4d10 with Jian, Speed: 3d10 (60 feet), Muscle: 4d10, Detect: 3d10, Athletics: 3d10, Talent (Flute): 2d10, Empathy: 1d10
Qi: 4
Max Wounds: 10
Weapons: Jian (5d10 Damage, +2d10 Accuracy)
Reputation: Loyal-Cruel
Flaws: Foul Tempered
Mental Affliction: Explosive Rage
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Breath of Fury, Crawling Tiger, Mighty Paws of the Lion, Swan Taming Strike, Weapon Stride (Counter)
Powers
The Ripping Arms of Compassion: This must be used Cathartically. When used Cathartically Monkey needs only 1 Total Success on a Maiming attempt to tear out a person's arms.
Climb: Monkeys can use their Athletics Skill to climb trees and craggy surfaces at their full speed.
Beast Strength: x2`
  },
  {
    id: "c9dancinghawk001",
    name: "Dancing Hawk",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Dancing Hawk is the nephew of Master Ta and is madly in love with Madame Hamaya, who does not return his affection but encourages it. Dancing Hawk is known for his flirtatious ways and a hot temper. However his heart belongs to Madame Hamaya and he sometimes spends weeks drinking or going to brothels in the face of her unreciprocated affection.

He is also a local bully who likes to spend his time gambling and causing problems in Wu Pen. When not in Wu Pen, he is typically at his uncle's villa or at the Fragrant Petal. Though he boasts modest martial arts abilities himself, Dancing Hawk is routinely finding himself in grudges or disputes with equal or better experts. To escape such situations intact he resorts to paying other Martial Heroes to do the job for him. On more than one occasion he has put out a call for great champions to compete for position as one of his bodyguards or servants.`,
    text: `Dancing Hawk
Defenses: Hardiness 3, Evade 6, Parry 4, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 2d10 or 4d10 with Jian/Gun, Heavy Melee: 0d10, Small Ranged: 1d10, Speed: 2d10, Muscle: 1d10, Language (Daoyun): 3d10
Qi: 2
Max Wounds: 5
Weapons: Wooden Gun Staff (1d10 Damage, +2d10 Accuracy), Jian (2d10 Damage, +2d10 Accuracy)
Reputation: Too Reckless-Shameful
Key Kung Fu Techniques (Waijia 1, Qinggong 3): Dancing Hawk Sword Stance, Drift of the Butterfly Fish, Hands of the Hawk Beak, Stunning Stick Strike, Tai Lan's Staff Strike, Spinning Back Kick (Counter), Clutch of the Hawk (Counter)`
  },
  {
    id: "c9fearlessrival1",
    name: "Fearless Rival of Dai Bien",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Seniang was called the Fearless Rival of Dai Bien because she challenged great Kung Fu experts with no fear, eagerly becoming their nemesis. Known for her rigid adherence to the Xia Code, her devotion to truth, and her endless compassion for those in need, she became a much-adored hero in Dai Bien. However, she practiced her Kung Fu too recklessly while fighting with the Nature Loving Monks and began to transform into a Vulture Spirit. Now she wanders the Banyan aimlessly destroying anything in her path, including people.

Se Seniang is lean and wiry, with overly long limbs. Her features are smooth but striking. The proportions just seem too long and her nose curved down to her lower lip. Her eyes have the vacant black stare of a vulture. Her hands are bony and end in lengthy talons. These are the effects of her transformation into a Vulture Spirit. The most obvious sign of this change is a large pair of black wings from her back, which she conceals under heavy capes and shawls.`,
    text: `Fearless Rival of Dai Bien
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 3d10, Muscle: 2d10, Medium Melee: 3d10, Heavy Melee: 2d10, Fly: 6d10 (90 feet), Speed: 3d10, Bite: 2d10 (3d10), Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Knowledge (Varies): 2d10
Qi: 3
Max Wounds: 7
Weapons: Jian, Spear
Reputation: Brave-Ferocious
Key Kung Fu Techniques (Waijia 2, Qinggong 2): Fearless Reply of the Spear, Flight of the Hawk, Pounce of the Lion, Slashing Blade, Spear of the Infinite Emperor, Spear Swipe, Sword Stance, Whirling Dodge (Counter)
Powers
Flight: Se Seniang can fly using the Fly skill because she has wings.
Burning Gaze: Se Seniang causes terrible pain by looking at a person. Roll Command against Resolve. On a success she imposes a -1d10 pain penalty for 2 rounds.
Claws of the Vulture: Se Seniang's Claws expose anyone struck by them to a disease of the spirit. Roll 2d10 against Hardiness. On a success the person is afflicted with terrible nightmares filled with scenes of gore and violence. This makes sleep all but impossible. Only a concoction of Ginseng and Mild Poison can purge the body of this affliction.
Limb Breaking Beak: This is normally not visible but appears as a ghostly beak when she chooses to strike. It does 3d10 Damage. On a Total Success it breaks bones and these take two weeks to heal.
Piercing Wail: Se Seniang can release a loud shriek that causes 2d10 Damage to everyone in a 20-foot radius. This is a Move action.`
  },
  {
    id: "c9firelancebros1",
    name: "Firelance Brothers",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The Firelance Brothers are identical twins who work for Red Claw Demon and are important leaders in the Red Claw Gang. They both have foul tempers, being prone to outbursts and bullying at the slightest provocation. Generally they don't get along with others or follow rules well.

While loyal to Red Claw they freely bend his orders to gain the most for themselves personally. Physically impressive, they prefer to go bare-chested and are always seen with their firelances.`,
    text: `Firelance Brothers
Defenses: Hardiness 5, Evade 8, Parry 5, Stealth 8, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 1d10, Heavy Melee: 2d10, Small Ranged: 2d10, Athletics: 1d10, Speed: 1d10, Muscle: 2d10, Meditation: 1d10, Read Script (Red Claw Gang): 2d10
Qi: 2
Max Wounds: 5
Weapons: Fire Lance (4d10 or 3d10 Fire Damage 20 feet), Fly Whisk (1d10 disarm, roll Damage against Parry)
Reputation: Ferocious-Unjust
Combat Technique: Hefty Crush
Key Kung Fu Techniques (Waijia 3, Neigong 1): Guiding the Crashing Wave, Iron Foot Stance, Lash of the Fly-whisk, Spear Swipe, Iron Spirit Resistance (Counter)`
  },
  {
    id: "c9immortalji0001",
    name: "Ji, Immortal of Red Mountain Villa",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Ji is one of the Five Immortals of Red Mountain Villa, the immortal guardians tasked with watching over Zhehu, the Ogre Demon who possesses the Key of Feng. The Five Immortals resemble one another but are different sizes, with Ji being the smallest and Hong the largest. Though they are immortal guardians, they consider themselves cultivated gentlemen and present as such to the world.

Ji is an expert in poetry. The Five Immortals spend most of their leisure time pursuing their respective interests. They are confined to Red Mountain Villa, with only one or two at a time occasionally leaving when an important matter demands attention. They are hospitable to visitors who demonstrate an interest and aptitude for the pleasures they enjoy, but will not allow those who do not possess such talents to enter the villa grounds.`,
    text: `Ji, Immortal of Red Mountain Villa
Defenses: Hardiness 3, Evade 6, Parry 6, Stealth 6, Wits 9, Resolve 6
Key Skills: Arm Strike: 2d10, Leg Strike: 5d10, Light Melee: 4d10, Medium Melee: 2d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Meditation: 3d10, Talent (Poetry): 5d10 or 6d10 (with Expertise), Talent (Calligraphy): 2d10, Persuade: 5d10, Deception: 2d10, Detect: 2d10, Read Scripts (All): 3d10, Languages (All): 3d10, Classics (All): 2d10
Qi: 15
Max Wounds: 31
Weapons: Bamboo Fan, Needle
Expertise: Talent-Composition
Combat Technique: Light Melee-Counter
Key Kung Fu Techniques (Waijia 2, Qinggong 2): Arms of Silk, Blood Letting Thorns, Gust of the Fan Blade, Spinning Back Kick, Storming Needles, Whirling Dodge (Counter), Horizontal Sidestep (Counter)
Profound Techniques: Burning Array, Thundering Palm of the Heavens
Powers
Insight - All are One: Insight possessed by Ji.
Shape Change: Ji can change his appearance at will to anything he wants, provided it is the same size as himself.`
  },
  {
    id: "c9immortalzhu001",
    name: "Zhu, Immortal of Red Mountain Villa",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Zhu is one of the Five Immortals of Red Mountain Villa, the immortal guardians tasked with watching over Zhehu, the Ogre Demon who possesses the Key of Feng. The Five Immortals resemble one another but are different sizes, with Ji being the smallest and Hong the largest. Though they are immortal guardians, they consider themselves cultivated gentlemen and present as such to the world.

Zhu knows about statecraft and Dehuan philosophy. The Five Immortals spend most of their leisure time pursuing their respective interests. They are confined to Red Mountain Villa, with only one or two at a time occasionally leaving when an important matter demands attention. They are hospitable to visitors who demonstrate an interest and aptitude for the pleasures they enjoy, but will not allow those who do not possess such talents to enter the villa grounds.`,
    text: `Zhu, Immortal of Red Mountain Villa
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 8, Wits 9, Resolve 10
Key Skills: Light Melee: 3d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 2d10, Muscle: 1d10, Endurance: 1d10, Meditation: 1d10, Divination: 3d10, Ritual: 5d10, Talent (Poetry): 1d10, Talent (Poison): 2d10, Persuade: 3d10 or 4d10 (with Expertise), Deception: 6d10, Detect: 3d10, Read Scripts (All): 3d10, Languages (All): 3d10, Classics (All): 3d10, Religion (Dehua): 6d10, Institutions (Imperial Bureaucracy): 3d10, Institutions (Religious Organizations): 4d10, Institutions (Sects): 2d10
Qi: 14
Max Wounds: 29
Weapons: Fly-whisk
Expertise: Persuade-Convince
Combat Technique: Light Melee-From the Shadows
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Crushing Lash of Lady Plum Blossom, Choking Lash of Lady Plum Blossom, Lash of the Fly-whisk, Venom of the Fly-whisk, Graceful Retreat (Counter), Horizontal Sidestep (Counter)
Profound Techniques: Demon Strike
Powers
Insight - Detect Weakness: Insight possessed by Zhu.
Enchanting Whisper: With a gentle word Zhu can convince anyone, even enemies, that he is their friend. Roll Persuade against Resolve.`
  },
  {
    id: "c9immortalli0001",
    name: "Li, Immortal of Red Mountain Villa",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Li is one of the Five Immortals of Red Mountain Villa, the immortal guardians tasked with watching over Zhehu, the Ogre Demon who possesses the Key of Feng. The Five Immortals resemble one another but are different sizes, with Ji being the smallest and Hong the largest. Though they are immortal guardians, they consider themselves cultivated gentlemen and present as such to the world.

Li is a painter and expert swordsman. The Five Immortals spend most of their leisure time pursuing their respective interests. They are confined to Red Mountain Villa, with only one or two at a time occasionally leaving when an important matter demands attention. They are hospitable to visitors who demonstrate an interest and aptitude for the pleasures they enjoy, but will not allow those who do not possess such talents to enter the villa grounds.`,
    text: `Li, Immortal of Red Mountain Villa
Defenses: Hardiness 8, Evade 3, Parry 10, Stealth 6, Wits 6, Resolve 6
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 4d10, Medium Melee: 5d10, Heavy Melee: 4d10, Speed: 3d10, Muscle: 2d10, Endurance: 3d10, Meditation: 2d10, Talent (Calligraphy): 2d10, Talent (Painting): 5d10, Detect: 2d10, Read Scripts (All): 3d10, Languages (All): 3d10, Classics (All): 1d10
Qi: 13
Max Wounds: 27
Weapons: Jian, Ox Tail Dao
Expertise: Medium Melee-Jian
Combat Technique: Medium Melee-Press
Key Kung Fu Techniques (Waijia 3, Qinggong 1): Blasting Blade, Drift of the Butterfly Fish, Grudge-Bearing Sword Strike, Phantom Phoenix Sword, Slashing Blade, Swan Taming Strike, Sword Whipping Strike, Horizontal Side Step (Counter), Whirling Dodge (Counter)
Profound Techniques: Great Transference
Powers
Insight - All Passions Blaze: Insight possessed by Li.
Control Wind: Li can summon winds and storms with the swing of his sword.`
  },
  {
    id: "c9immortalshuang",
    name: "Shuang, Immortal of Red Mountain Villa",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Shuang is one of the Five Immortals of Red Mountain Villa, the immortal guardians tasked with watching over Zhehu, the Ogre Demon who possesses the Key of Feng. The Five Immortals resemble one another but are different sizes, with Ji being the smallest and Hong the largest. Though they are immortal guardians, they consider themselves cultivated gentlemen and present as such to the world.

Shuang is a musician. The Five Immortals spend most of their leisure time pursuing their respective interests. They are confined to Red Mountain Villa, with only one or two at a time occasionally leaving when an important matter demands attention. They are hospitable to visitors who demonstrate an interest and aptitude for the pleasures they enjoy, but will not allow those who do not possess such talents to enter the villa grounds.`,
    text: `Shuang, Immortal of Red Mountain Villa
Defenses: Hardiness 3, Evade 10, Parry 5, Stealth 6, Wits 8, Resolve 6
Key Skills: Arm Strike: 5d10, Throw: 2d10, Heavy Melee: 2d10, Speed: 3d10, Muscle: 1d10, Athletics: 2d10, Endurance: 3d10, Meditation: 3d10, Medicine: 3d10, Talent (Instrument-Guzheng): 4d10, Talent (Instrument-Pipa): 4d10, Talent (Instrument-Yangqin): 6d10, Talent (Instrument-Dizi): 5d10, Detect: 6d10, Read Scripts (All): 3d10, Languages (All): 3d10, Classics (All): 2d10, Religion (Dehua): 3d10, Institutions (Imperial Bureaucracy): 3d10, Institutions (Religious Organizations): 2d10, Institutions (Sects): 2d10
Qi: 13
Max Wounds: 27
Weapons: Hands, Instruments or Bian
Expertise: Talent-Perform
Combat Technique: Light-Opportunity
Key Kung Fu Techniques (Qinggong 1, Neigong 3): Absorbing Palm, Cherry Blossom Palm, Curing Palm, Drift of the Butterfly Fish, First Song of Shan Lushan, Flaming Dragon, Flight of the Hawk, Harmonizing Strike, Ringing Strike of the Divine Ram, Weapon Stride (Counter)
Profound Techniques: Sleeves of Frost
Powers
Insight - Natural Understanding: Insight possessed by Shuang.
Perfect Hearing: Shuang's hearing is so perfect he is unaffected by total darkness and rolls 6d10 for Detect. In addition he can hear at extraordinary distance, and is capable of eavesdropping on any conversation anywhere in a fifty-mile radius.`
  },
  {
    id: "c9immortalhong01",
    name: "Hong, Immortal of Red Mountain Villa",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Hong is one of the Five Immortals of Red Mountain Villa, the immortal guardians tasked with watching over Zhehu, the Ogre Demon who possesses the Key of Feng. The Five Immortals resemble one another but are different sizes, with Ji being the smallest and Hong the largest. Though they are immortal guardians, they consider themselves cultivated gentlemen and present as such to the world.

Hong is the senior of the five immortals. Hong is a master of food, able to decipher a great deal of information from smells and flavors alone, has an abiding interest in ancient relics, and a profound appreciation of wine. The Five Immortals spend most of their leisure time pursuing their respective interests. They are confined to Red Mountain Villa, with only one or two at a time occasionally leaving when an important matter demands attention.`,
    text: `Hong, Immortal of Red Mountain Villa
Defenses: Hardiness 3, Evade 10, Parry 5, Stealth 6, Wits 8, Resolve 6
Key Skills: Arm Strike: 2d10, Kick: 4d10, Throw: 3d10, Heavy Melee: 3d10, Medium Melee: 3d10, Speed: 1d10, Muscle: 6d10, Athletics: 2d10, Endurance: 4d10, Meditation: 3d10, Medicine: 2d10, Divination: 2d10, Talent (Cooking): 5d10, Talent (Tea Preparation): 6d10, Talent (Poison): 3d10, Survival (Wilderness): 3d10, Trade (Architecture and Engineering): 2d10, Detect: 5d10 or 6d10 (Tasting), Read Scripts (All): 3d10, Languages (All): 3d10, Classics (All): 3d10, Religion (Dehua): 3d10, History (All): 3d10, Institutions (Imperial Bureaucracy): 3d10, Institutions (Religious Organizations): 2d10, Institutions (Sects): 2d10
Qi: 15
Max Wounds: 31
Weapons: Qiang, Ox Tail Dao
Expertise: Detect-Taste
Combat Technique: Heavy Melee-Hefty Crush
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Calm of Sunan, Double Thrust, Eight Divine Snake Strike, Gaze of the Lion, Heart Smashing Palm, Heart Strike, Inverted Three-Point Strike, Iron Body, Iron Spirit, Kick of the Golden Elephant, Lung Strike, Majesty of the Lion, Pounce of the Lion, Spearing Blade, Iron Spirit Reversal (Counter), Iron Spirit Resistance (Counter)
Profound Techniques: Thundering Palm of the Heavens
Powers
Insight - Dew Upon the Lily: Insight possessed by Hong.
Incredible Strength: Hong is stronger than any mortal, with 6d10 Muscle and Beast Strength (x20). This means he can lift heavy objects with ease, multiplying his base lift by 20.`
  },
  {
    id: "c9frowningeagle",
    name: "Frowning Eagle",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `An orphan who was raised by Li Sou Chao, the Witch of Zhaoze Zhou, Bang Run became the leader of the Zun River Gang. Though a criminal, Frowning Eagle likes to think he is fair and brings a certain amount of order to the region. His nickname stems from his demeanor and the eternal expression of displeasure on his face, even when supremely happy or laughing.

He is loyal to Li Sou Chao and regards her as a mother. Frowning Eagle is married to E'hua. His brother-in-law, Sheng, runs the Ornamental Pearl in Bouzhou.`,
    text: `Frowning Eagle
Defenses: Hardiness 4, Evade 3, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 2d10, Throw: 2d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 1d10, Speed: 2d10, Muscle: 2d10, Endurance: 1d10, Meditation: 2d10, Detect: 2d10
Qi: 2
Max Wounds: 5
Weapons: None
Reputation: Trustworthy-Unjust
Key Kung Fu Techniques (Waijia 1, Neigong 3): Eagle Descends Loudly, Finger Flick, Iron Foot Stance, Red Claw Strike, Ringing Strike of the Divine Ram, Whirling Dodge (Counter)`
  },
  {
    id: "c9galganbaatar1",
    name: "Gal Ganbaatar Khagan",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Ganbaatar is the son of Gal Batu Khan. He united the tribes of the Kushen and is planning in the future to invade the Empire by way of Li Fan. He is also a great martial hero in his own right and something of a reformer, granting more freedom to female tribesmen, especially his wives.

Ganbaatar has seven wives, all of whom are his personal bodyguards, though this is not known beyond his immediate circle. Three of his wives have been made Commanders of 10,000. He had one daughter, Princess Sarnai, and five sons: Mengettu, Galsuren, Togu, Dobun, and Jungsai. He distrusts all his sons, ever since Togu allied with Ganbaatar's brother Urgi to overthrow him. He exiled Togu and has since executed Dobun and Jungsai. Unlike other Khans and Khagans, Ganbaatar emphasizes personal loyalty and only trusts command to those who have earned it, refusing to give his children positions of power with the exception of Princess Sarnai.

Ganbaatar is fiercely opposed to human slavery, particularly of women, but this quality is often overlooked by his enemies due to his ferocious tactics in warfare.`,
    text: `Gal Ganbaatar Khagan
Defenses: Hardiness 5, Evade 6, Parry 8, Stealth 6, Wits 8, Resolve 7
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 2d10, Leg Strike: 3d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 2d10, Small Ranged: 3d10 (4d10 with Composite Bow), Ride: 3d10, Speed: 2d10, Muscle: 3d10, Deception: 2d10, Persuade: 2d10, Command: 3d10, Reason: 3d10, Meditation: 3d10, Talent (Hawk Handling): 3d10, Survival (Plains): 3d10, Survival (Mountains): 2d10, Languages (Kushen): 3d10, Languages (Daoyun): 3d10, Read Script (Yanzi): 3d10
Qi: 7
Max Wounds: 15
Weapons: Kushen Sabre (4d10 Damage), Bow of Loma (3d10 Damage plus 2 Extra Wounds)
Reputation: Loyal-Cunning
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Slicing Arrow, Life Taking Hand, Cleave of the Sabre, Kick of the Swan, Flying Swan Kick, Whirling Blade, Whirling Dodge (Counter)
Profound Techniques: Thundering Palm of the Heavens
Powers
Slicing Arrow: Small Ranged against Evade for a powerful arrow strike that does 6d10 damage. Cathartic: Strikes anyone in a 60-foot area line, which can take a crescent shaped path, passing through each target. Each target it passes through reduces damage by 1d10.
Life Taking Hand: Arm Strike against Evade on one target. Then roll 3d10 against Resolve. On a success all their defenses reduce by 1 per rank of Neigong. Cathartic: Target ages 10 years, or 5 years per rank of Neigong.
Cleave of the Sabre: Normal Sabre attack, 1 extra wound. Cathartic: Cuts deep into a meridian line and rattles the target, reducing Parry and Evade by 1 for one hour, plus 1 hour for every rank of Waijia.`
  },
  {
    id: "c9generaldee001",
    name: "General Dee",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `General Dee is a loyal servant of the Demon Emperor and a disciple of Cai Yuanyu. He has command of the army in Hu Qin and is the effective ruler of the city of Yu Zhing, but his main goal is to help restore the Demon Emperor and enable him to take over heaven. He hopes to be rewarded for his efforts with immortality or deification.

General Dee appears to be in his early 50s. He is sadistic and merciless. He surrounds himself with equally terrible people and admires those who demonstrate both intelligence and ruthlessness. In such company he enjoys watching as all try to outdo one another with tales of their own cruelty. He is missing his left hand but has replaced it with an iron fist. Some call him Iron Fisted General, but he hates this nickname and kills anyone known to utter it.

He has had two great loves. The first was a Nun of Heiping he once seduced to learn some of her techniques, but he fell in love. She was kicked out of the sect and came after him for revenge. He killed her reluctantly during a confrontation and erected a shrine to her in his residence.

He also was once married to a woman named Pei Xinyu, ages ago before he became cruel. In his past, General Dee was a well-respected and decent man. However Cai Yuanyu seduced him with offers of power, and his mastery of rituals dedicated to the Demon Emperor changed his nature, making him sadistic. He also acquired the ability to take a terrible new ogre demon form. Xinyu left him and retreated to Snake Peak after his temperament and personality changed.`,
    text: `General Dee
Defenses: Hardiness 7, Evade 7, Parry 7, Stealth 6, Wits 6, Resolve 10
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 3d10, Meditation: 3d10, Athletics: 1d10, Detect: 2d10, Empathy: 2d10, Ritual (Blood Offering of the Demon Emperor): 3d10, Read Script (Feishu): 3d10, Language (Daoyun): 3d10, Institutions (Imperial Bureaucracy): 3d10, Classics (All): 2d10, Creatures (Demons): 2d10, History (Era of the Demon Emperor): 2d10, Ritual (Activation): 2d10, Ritual (Binding Demon Ritual): 2d10, Ritual (Blood Pledge for the Demon Emperor): 1d10, Ritual (Tattoo of the Demon King): 1d10, Ritual (Petition to the Five Ghosts): 1d10
Qi: 5
Max Wounds: 11
Weapons: Ox Tail Dao (5d10 Damage), Fist (4d10 Damage)
Combat Technique: None
Affliction: Sadism
Flaws: Lame (Missing left hand; replaced with iron fist)
Key Kung Fu Techniques (Neigong 1, Waijia 2, Qinggong 1): Phantom Phoenix Sword, Spearing Blade, Sword Whipping Strike, Swan Taming Strike, Whirling Dodge (Counter), Weapon Stride (Counter), Stern Rebuke of Heiping (Counter)
Powers
Gift of Discernment: Can tell if someone is lying with a successful Empathy roll.
Gift of Ogre Kind: When reduced to 0 health, General Dee transforms into an Ogre Demon. If he can eat human flesh by the end of the day, he can turn back; otherwise he is permanently in Ogre Demon Form.`
  },
  {
    id: "c9deedemonform1",
    name: "Ogre Demon Form of General Dee",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `In this form, General Dee is eight feet tall and has purple skin. If his human body dies, he immediately changes to his demon form with full health.`,
    text: `Ogre Demon Form of General Dee
Defenses: Hardiness 9, Evade 5, Parry 8, Stealth 7, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 3d10, Kick: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 1d10, Muscle: 4d10, Endurance: 2d10, Detect: 3d10
Max Wounds: 10
Powers
Qi Immunity: 25%.
Qi Disruption: Ogre Demon attacks can disrupt Qi and blood flow.
Beast Strength: x2.
Might: Mighty physical attacks.
Weakness: Snake Venom and Snake Skin.`
  },
  {
    id: "c9generalqiang01",
    name: "General Qiang",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `A former commander in the army of the Zhan Dao Empire, General Qiang led his men into the Ghezong River region in search of glory. They conquered the city of Dao-Yu and renamed it Rong-Yao. Qiang is an effective if tough leader, who has brought his city to new heights and established order in its streets.

He is fond of his position, of the adoration and acclaim it brings him. He is kind to his friends and allies but ruthless against his foes. In particular, he despises the Nature Loving Monk sect, because it has a foothold among the beggars in Rong-Yao and he believes they seek to overthrow him. He also has a personal dislike of their disorderly ways. General Qiang is a handsome man with a strikingly tall and wide build.`,
    text: `General Qiang
Defenses: Hardiness 10, Evade 3, Parry 5, Stealth 6, Wits 7, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 1d10, Kick: 2d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 3d10, Small Ranged: 2d10, Large Ranged: 3d10, Speed: 2d10, Muscle: 3d10, Endurance: 3d10, Meditation: 3d10, Command: 3d10, Persuade: 2d10, Detect: 3d10, Martial Disciplines (Waijia and Neigong): 2d10, Institutions (Imperial Bureaucracy and Sects): 3d10, Languages (Li Fai): 2d10, Languages (Daoyun): 3d10, Languages (Hai'anese): 3d10, Classics (The Sayings of Kong Zhi): 2d10
Qi: 5
Max Wounds: 11
Weapons: Qiang, Dao
Reputation: Kind-Cruel
Key Kung Fu Techniques (Waijia 2, Neigong 2): Breath of Fury, Calm of Sunan, Gaze of the Lion, Heart Smashing Palm, Iron Spirit, Mighty Paws of the Lion, Naga Palm, Spearing Blade, Spear of the Infinite Emperor, Spear Swipe, Storm of Arrows, Swift Rebuttal (Counter), Iron Body (Counter)`
  },
  {
    id: "c9gentledemon001",
    name: "Gentle Demon",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Gentle Demon is broad shouldered, tall and has a robust physique. He has a reputation for being outrageous and shameful, which he makes worse by deliberately shocking and provoking his enemies with words and deeds. However to those close to him he is true to his oaths, a good ally who remembers his friends. A vegetarian, Gentle Demon will not tolerate even minor mistreatment of animals or even insects.

He wears his hair long but slightly unkempt. His wide smile can be either soothing or terrifying depending on his mood. He is a master scholar, poet, and painter, but also a creature filled with boundless rage against those who wrong him or stand in his way. Gentle Demon is unique for his ability to speak and read every known language with near perfection.

Gentle Demon took over Zhe Valley thirty years ago when he united Water and Thorn sect against Canyon and Zhe River sect. Since then he has ruled without question, and officially retired from the martial world to pursue the arts. He also married Huifing, a former member of the Tree-Dwelling Nun sect. Their love is genuine but rumors of sorcery on Zhe Ling's part has caused the Tree-Dwelling Nuns to regard the marriage as forced. There are also rumors that Huifing is a Fox Demon.

Not the greatest Martial Hero, Zhe Ling often relies on rituals to supplement his lack of martial ability. When he does fight, he prefers to use the Guan Dao.`,
    text: `Gentle Demon
Defenses: Hardiness 8, Evade 3, Parry 8, Stealth 6, Wits 8, Resolve 6
Key Skills: Grapple: 3d10, Throw: 2d10, Arm Strike: 3d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 3d10, Small Ranged: 1d10, Meditation: 3d10, Ritual (Zhe Valley Heart): 3d10, Ritual (Green Guardian): 3d10, Ritual (Curse of the Spirit): 2d10, Medicine: 2d10, Talent (Painting and Poetry): 3d10, Speed: 2d10, Muscle: 3d10, Athletics: 2d10, Languages (All): 3d10, Read Script (All): 3d10
Qi: 5
Max Wounds: 11
Weapons: Guan Dao (5d10 Damage), Ji (6d10 Damage)
Reputation: Shameful-Kind
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blasting Blade, Breath of Fury, Double Thrust, Drift of the Butterfly Fish, Flight of the Hawk, Intercepting Arrow, Iron Foot Stance, Iron Spirit, Spearing Blade, Zhe Valley Blade, Zhe Valley Fist, Weapon Stride (Counter), Iron Spirit Reversal (Counter), Intercepting Arrow (Counter), Hands of the Hawk Beak (Counter)`
  },
  {
    id: "c9saltwellnua001",
    name: "Goddess of the Salt Wells",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Nua was once a great Martial Hero, possibly a member of Heiping sect, though she has forgotten most of her past. She transformed into a Water/Snake Spirit while seeking revenge against members of Dehua sect who had wronged her. She now resides in the salt wells of Heiping Mountain where local Zun people, particularly Yipu village, worship her and give her sacrifices.`,
    text: `Goddess of the Salt Wells
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple/Constrict: 3d10, Bite: 2d10 (Poison), Throw: 1d10, Arm Strike: 3d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 2d10, Small Ranged: 1d10, Meditation: 3d10, Medicine: 2d10, Speed: 6d10, Fly: 6d10, Swim: 6d10, Muscle: 2d10, Athletics: 2d10
Qi: 4
Max Wounds: 13
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blasting Blade, Breath of Fury, Drift of the Butterfly Fish, Eight Divine Snakes, Flight of the Hawk, White Flower Palm, Iron Spirit Reversal (Counter), Weapon Stride (Counter), Hands of the Hawk Beak (Counter), Intercepting Arrow (Counter)
Powers
Immunities: Immune to mundane attacks, only susceptible to magic and Kung Fu Techniques.
Constrict: Constricting attack.
Bite: Bite does 1d10 Damage and Poison.
Poison: Snake Spirit Venom.`
  },
  {
    id: "c9goldenroc00001",
    name: "Golden Roc",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Yanshi is a stout man in his mid-40s, who lives in the western cliffs of Mount Peng, where his only companions are the local Rocs. A master of internal Qi, Yanshi is known for his powerful Five Fist Techniques and his ability to pulverize stone.

His personality and demeanor is impassive and without compassion. It is rumored he was once more inclined to mercy and passion, but his heart was crushed by a lover, of whom he never speaks, and so he set out to make it strong like stone. While he rarely teaches his Techniques to students he regards laughter as the only genuine and permissible emotion, and will teach one Technique to anyone who makes him laugh.`,
    text: `Golden Roc
Defenses: Hardiness 10, Evade 3, Parry 5, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 3d10, Small Ranged: 1d10, Speed: 0d10, Muscle: 3d10, Creatures (Animals): 3d10
Qi: 5
Max Wounds: 11
Weapons: Fists (3d10 Damage due to Fists of Steel Expertise)
Expertise: Fists of Steel
Reputation: Calm-Trustworthy
Key Kung Fu Techniques (Waijia 1, Neigong 3): Clutch of the Hawk, Fifth Fist of Yanshi, First Fist of Yanshi, Fourth Fist of Yanshi, Hidden Fist of Yanshi, Second Fist of Yanshi, Third Fist of Yanshi, Grasp of the Python (Counter)`
  },
  {
    id: "c9greenguard0001",
    name: "Green Guardian",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The Green Guardian was once a man, but now his body and face are covered in soil, moss, and Zhe Valley chrysanthemums. This allows him to blend in and surprise foes. He wields a Dao and carries a belt of 8 daggers.

The Green Guardian is intelligent but has no memories of his past and cannot speak. He is devoted to protecting Zhe Valley from unwanted intruders and spends most of his time guarding the eastern pass leading into the valley.`,
    text: `Green Guardian
Defenses: Hardiness 8, Evade 5, Parry 9, Stealth 6 (10 in forest or greenery), Wits 6, Resolve 10
Key Skills: Grapple: 2d10, Throw: 2d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 3d10 or 2d10 with Ox Tail Dao, Heavy Melee: 3d10, Small Ranged: 1d10, Medicine: 2d10, Speed: 3d10, Muscle: 2d10, Athletics: 3d10
Qi: 4
Max Wounds: 13
Weapons: Daggers (2d10 Damage), Ox Tail Dao (4d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 2): Blasting Blade, Drift of the Butterfly Fish, Flight of the Hawk, Great Stride, Intercepting Arrow, Slashing Blade, Storming Daggers, Sword Whipping Strike, Tree Bounding Stride, Weapon Stride (Counter), Whirling Dodge (Counter)
Powers
Harming Touch: With a single attack, using Arm Strike against resisting targets, the Green Guardian causes 3 Wounds. He uses his right hand to harm.
Heal Self: To heal, the Green Guardian simply fades into the soil for one hour, emerging fully recovered. If killed, he dissipates into the soil and takes 30 days to repair himself.
Healing Touch: With a single attack, using Arm Strike against resisting targets, the Green Guardian heals 1 Wound. This cannot be used on himself. He uses his left hand to heal.`
  },
  {
    id: "c9headmastermu01",
    name: "Headmaster Mu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Headmaster Mu is a eunuch and scholar, as well as the present headmaster of Golden Grotto Academy. He castrated himself when Lady Tao promised him the Merciless Willow Manual, only to learn she had deceived him. He fled to Chen and has been plotting his revenge ever since, learning a variety of Yen-Li Rituals to aid him. For more information on Headmaster Mu see Chapter Thirteen: Ghosts from the Ashes.`,
    text: `Headmaster Mu
Defenses: Hardiness 3, Evade 3, Parry 6, Stealth 6, Wits 9, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 1d10 (3d10 with Jian), Heavy Melee: 1d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 1d10, Athletics: 1d10, Meditation: 3d10, Talent (Tattooing): 2d10, Ritual (Western Heavens): 3d10, Ritual (Petition to the Five Ghosts): 2d10, Ritual (Tattoo of the Demon King): 3d10, History (Era of the Demon Era): 3d10, History (Era of the Five Kingdoms): 3d10, History (Era of the Dutiful State): 2d10, History (Era of 100 Pieces): 3d10, Religion (Dehua): 3d10, Religion (Yen-Li): 3d10, Classics (All): 3d10
Qi: 3
Max Wounds: 7
Weapons: Jian (2d10 Damage, +2d10 to Attack)
Reputation: Righteous-Vengeful
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blasting Blade, Calm of Sunan, Drift of the Butterfly Fish, Inverted Three-Point Strike, Sword Stance, Three-Point Strike`
  },
  {
    id: "c9heartlessdog01",
    name: "Heartless Dog",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Kang is a Martial Hero whose true motivations are hidden behind a fog of drunkenness. While on the surface he seems to seek only money, wine and violence, his true goal is redemption. He drinks heavily to bury the pain of his past, where inaction cost his family dearly. Now, with the aid of alcohol, he acts without thinking of consequences and often without caring for them.

A known follower of Red Claw Demon, he has acted as an enforcer for the crime boss and muscle for his Sifu, Strange Phoenix. The heavy drinking has caused Kang to hallucinate a young girl named Lily Blossom, who follows him around. He has been known to abandon tasks or stand back from a fight if he feels Lily is in danger. The Heartless Dog has become friendly with the Nature Loving Monks and the Purple Cavern sect.`,
    text: `Heartless Dog
Defenses: Hardiness 7, Evade 5, Parry 6, Stealth 6, Wits 6, Resolve 7
Key Skills: Arm Strike: 1d10, Leg Strike: 2d10, Grapple: 2d10, Light Melee: 1d10, Medium Melee: 2d10, Gun Staff Expertise: 1d10, Athletics: 2d10, Muscle: 2d10, Medicine: 1d10, Meditation: 1d10, Talent (Theft): 1d10, Talent (Poisons): 1d10, Survival (Plains): 1d10, Survival (Wilderness): 1d10, Persuade: 1d10, Deception: 1d10, Detect: 2d10 (Glance +1d10), Creatures (Monsters): 1d10, Creatures (Demons): 1d10, Institutions (Sects): 1d10, Institutions (Criminal Underground): 1d10, Language (Khubsi): 1d10, Read Script (Khubsi): 1d10, Read Script (Red Claw Gang): 1d10
Qi: 3
Max Wounds: 7
Weapons: Gun Staff (Wood), Dagger (x2)
Armor: Leather Lamellar
Equipment: Two wine jugs
Combat Technique: Drunken Fighter
Reputation: Reckless-Ferocious
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Dip of the Drunken Snake, Dog Bashing Stick, Somersault of the Drunken Monkey, Stance of the Drunken Cat, Tai Lan's Staff Strike, Horizontal Sidestep (Counter), Clutch of the Hawk (Counter)
Powers
Wine Spitting: Kang is known to spit wine in a form of untrained Divination and will abide by the results almost religiously, no matter what they are.`
  },
  {
    id: "c9ironskymaid001",
    name: "Iron Sky Maiden",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The Iron Sky Maiden is an immortal who was born hundreds of years ago during the era of the Eastward Bound Invaders in the Kushen Basin at a small and forgotten Kailin oasis village. She had visions at an early age and was a gifted astrologer. At 18, she sensed signs of an impending disaster when a large stone mound appeared slowly over the course of days. The rest of the village interpreted this as a good sign, while she knew it meant death for her people.

She went to the Banyan to train at Sun Mai Temple in hopes of gaining the power to defeat what was to come. In her absence a face appeared upon the stone mound and the people of her village began to worship it. What they did not realize was this was a fragment of Yao-Feng and formed a gate to a pocket realm he had created as a contingency measure during his reign. In her travels she met Hen-Shi and Xian Nu Shen who gave her the Sky Lantern of the Blue Heart.

The Iron Sky Maiden returned to her village with a group of heroes she had befriended called the Seven Blood Brothers and drove back Yao-Feng's forces just as they began to exit the gate. She then stormed into the pocket realm and used the Sky Lantern of the Blue Heart to subdue its Ogre Demons. Hen-Shi then taught her and her companions the secrets of Immortality, giving her control of the pocket realm, which she named Infinite Sky Realm, and making her its Queen.

Iron Sky Maiden appears as a tall woman with a lean but athletic frame who still dresses in traditional Kailin fashion. The only weapon she carries is a fan, but she also possesses the Sky Lantern of the Blue Heart which she can absorb into her body for holding but release at will.`,
    text: `Iron Sky Maiden
Defenses: Hardiness 9, Evade 6, Parry 9, Stealth 6, Wits 6, Resolve 9
Key Skills: Grapple: 3d10, Arm Strike: 4d10, Leg Strike: 5d10, Light Melee: 6d10 or 7d10 with Metal Fan, Medium Melee: 2d10, Speed: 4d10, Fly: 5d10, Muscle: 4d10, Endurance: 2d10, Ride (Horse): 3d10, Meditation: 5d10, Divination: 6d10, Command: 6d10, Detect: 3d10, Read Scripts (All): 3d10, Languages (Kushen): 3d10, Language (Daoyun): 2d10, Qi Ritual (Celestial Mind): 4d10, Ritual (Demon Binding): 5d10, Talent (Sing): 5d10, Religion (All): 4d10, Institutions (Bureaucracy of Heaven): 4d10
Qi: 22
Max Wounds: 45
Weapons: Metal Fan (5d10 Damage)
Expertise: Light Melee-Fan
Combat Technique: Light Melee-From The Shadows
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1, Dianxue 1): Clutch of the Hawk, Eagle Descends Loudly, Encompassing Emerald of Sun Mai, Flying Swan Kick, Gust of the Fan Blade, Hands of the Hawk Beak, Iron Body, Iron Spirit, Sun Mai Sword, Trapping Wind, Iron Spirit Resistance (Counter), Iron Spirit Reversal (Counter)
Profound Techniques: Celestial Mind Technique, Dreams of the Infinite Sky Realm, Great Transference
Powers
All Standard Techniques: Iron Sky Maiden knows all of the standard Techniques in the rulebook.
Insight - Death and Life are the Same: Insight possessed by Iron Sky Maiden.
Insight - Profound Awareness: Insight possessed by Iron Sky Maiden.
Control Weather: Iron Sky Maiden can control the weather and create powerful winds with her fan.
Kung Fu Mastery: Iron Sky Maiden has an extra rank in Waijia.
Timeless Dream: This can place a settlement outside of time.
Empathic Link: Can communicate with anyone through her statue in Kwam Metta in the Pagoda of Golden Mercies. This can even work outside her Realm but every exchange requires a month of rest.`
  },
  {
    id: "c9ironclawlion01",
    name: "Iron-Clawed Lion",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Iron-Clawed Lion is a man in his early fifties and the King of Majestic Lion cult. Despite his age and graying hair, he is robust and looks healthy. He is loud, boastful, and above all has a powerful appetite for bloodshed. Whereas some masters see killing and death as an unfortunate necessity, he sees them as the purpose of existence. Iron-Clawed Lion lives for three things: killing, admiring beautiful women, and revelry.

Presently he seeks to kill the leader of Hai'an sect and to master the Majesty of the Lion Technique. Though he practices Kung Fu regularly, Iron-Clawed Lion has plateaued because he focuses too much on aggression and lacks the creativity to grow. His development has also been delayed by regular disruptions and attacks from Mount Hai'an sect.

Iron-Clawed Lion has always liked violence and killing. As a young man in Zun City learning Kung Fu, he could not wait to practice his skills on the other local children. His Sifu eventually rejected him and banished Iron-Clawed Lion from Zun City. He fell in with local bandits and thoroughly enjoyed the life this afforded him. When he turned twenty he was almost killed when a great Martial Expert named Soft Dragon speared him through the belly while Iron-Clawed Lion's gang tried to rob him. Soft Dragon killed the entire gang and spared Iron-Clawed Lion, taking him to Majestic Lion cult palace.

When he assumed leadership of the cult, Iron-Clawed Lion decided he must be married so he proposed to Jinghui, the leader of Mount Hai'an. Days before the wedding, he was introduced to Lady Xiang who was even more beautiful than Jinghui. He married her instead and sent a formal letter to Jinghui rescinding his original proposal. Jinghui responded by killing Lady Xiang one year after the wedding. He has a daughter named Fearless Cat who is a member of his sect, though he has kept her identity secret to protect her from Jinghui.`,
    text: `Iron-Clawed Lion
Defenses: Hardiness 8, Evade 3, Parry 7, Stealth 6, Wits 6, Resolve 8
Key Skills: Arm Strike: 3d10, Leg Strike: 2d10, Grapple: 3d10, Throw: 2d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 3d10, Small Ranged: 1d10, Athletics: 2d10, Speed: 1d10, Muscle: 3d10, Endurance: 3d10, Medicine: 1d10, Command: 3d10, Meditation: 2d10, Talent (Singing): 0d10, Talent (Poetry): 2d10, Talent (Painting): 1d10, Religion/Gods (Majestic Lion Cult): 3d10, Detect: 2d10, Meditation: 3d10, Language (Daoyun): 3d10, Language (Khubsi): 2d10, Languages (Singh): 1d10, Read Script (Feishu): 3d10, Read Script (Yoshaic): 1d10, Read Script (Majestic Lion Cult): 3d10
Qi: 4
Max Wounds: 9
Weapons: Iron Claw (3d10 Damage)
Reputation: Ferocious-Cruel
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Absorbing Palm, Breath of Fury, Curing Palm, Fierce Strike, Fluttering Kicks, Gaze of the Lion, Hands of the Hawk Beak, Lion at Rest Stance, Merciless Black Claw, Mighty Paws of the Lion, Pounce of the Lion, Roar of the Lion, Swift Pounce of the Cheetah, Iron Spirit Resistance (Counter), Spinning Back Kick (Counter), Graceful Retreat (Counter), Grasp of the Python (Counter), Deflecting Canopy (Counter)`
  },
  {
    id: "c9jadebutterfly1",
    name: "Jade Butterfly",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Jade Butterfly is a free spirited hero with a mysterious past. Though she gravitates toward the unorthodox and has many allies among the unorthodox sects, she is kind and considered a protector among the people living in the Southern Banyan. In particular she has a soft spot for the Zun who live in the mountains and forests near her cave.

Though she ventures into the cities occasionally her home is the wilderness. Among her enemies there is a rumor that she is a water demon or butterfly fish spirit, but this is untrue. Jade Butterfly is good friends with Shan Lushan, the leader of Zhaoze sect, and Abbess Xiong-Hua, leader of the Tree-Dwelling Nun sect.`,
    text: `Jade Butterfly
Defenses: Hardiness 3, Evade 8, Parry 9 (10 with Butterfly Sword), Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 3d10, Throw: 2d10, Kick: 3d10, Light Melee: 3d10 or 4d10 with Butterfly Swords, Medium Melee: 3d10, Heavy Melee: 2d10, Swim: 3d10, Athletics: 3d10, Speed: 3d10, Muscle: 1d10, Endurance: 1d10, Meditation: 3d10, Detect: 2d10, Persuade: 2d10, Deception: 3d10, Language (Daoyun): 3d10, Read Script (Feishu): 3d10, Language (Hai'anese): 3d10, Institutions (Sects): 3d10, Survival (Sea): 3d10, Survival (Wilderness): 3d10, Talent (Flute): 3d10, Talent (Sing): 2d10, Ritual (Spirit Keeping): 3d10, Ritual (Zun Forest Shaping): 2d10, Ritual (Song of Gu): 1d10
Qi: 5
Max Wounds: 11
Weapons: Butterfly Swords (2d10 Damage, +1d10 Accuracy), Daggers (1d10 Damage)
Reputation: Kind-Unorthodox
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Absorbing Palm, Blast of the Dragon, Breath of Fury, Curing Palm, Drift of the Butterfly Fish, First Song of Shan Lushan, Flying Swan Kick, Phantom Phoenix Sword, Roar of the Lion, Shift of the Chameleon, Spearing Blade, Spinning Steel, Stick of the Rebounding Dog, Storming Daggers, Trapping Wind, Stern Rebuke of Heiping (Counter)`
  },
  {
    id: "c9jadepriest0001",
    name: "Jade Priestess",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Jade Priestess is a high-ranking member of the Demon Moon cult, being the High Priestess and just below Lord Moon in rank. She was born a man but identifies as a woman. She is tall but otherwise it is difficult to detect her birth gender. She dresses in fine silk waist skirts and robes, keeps her hair in a tall double bun adorned with Jade and gold, and wears a shawl embroidered with swans.

Among the members of the Demon Moon cult she is highly respected and even among the orthodox sects she is perceived as the reasonable actor within the cult. Jade Priestess is kind by nature and abides by the Xia code even though many of her fellow sect members do not. She is particularly disdainful of Martial Experts who use their powers to harm or bully the weak. However she can be lethal and cunning when she needs to and when it serves the interests of the cult. Though she is a poisoner, Jade Priestess has been careful to conceal this from others, preserving her reputation.

Much less cruel than Lord Moon, but loyal, Jade Priestess looks forward to the day when she can rightfully take over leadership of the cult and refashion it according to her own principles.`,
    text: `Jade Priestess
Defenses: Hardiness 8, Evade 4, Parry 8, Stealth 6, Wits 7, Resolve 6
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 1d10, Heavy Melee: 3d10, Athletics: 1d10, Speed: 2d10, Muscle: 3d10, Endurance: 3d10, Meditation: 3d10, Detect: 2d10, Command: 1d10, Talent (Poison): 3d10, Talent (Disguise): 3d10, Deception: 3d10, Persuade: 3d10, Survival (Wilderness): 3d10, Ritual (Curse of the Spirit): 3d10, Ritual (Ritual of Boundless Perfection): 2d10, Ritual (Blood Offering of the Demon Emperor): 3d10, Creatures (Demons): 3d10, Religion (Yao-Feng): 3d10, Read Script (Demon Moon Cult): 3d10
Qi: 4
Max Wounds: 9
Weapons: Butterfly Sword, Hands
Reputation: Righteous-Untrustworthy
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Arms of Silk, Jade Rending Claw, Life Stealing Blue Claw, Ringing Strike of the Divine Ram, Slashing Blade, Whirling Dodge (Counter), Illuminating Ice Claw (Counter), Deflecting Canopy (Counter)
Powers
Summon and Sense Animal Companions: The Jade Priestess is bonded with a Zhen Bird named Red Beak. She can see through its eyes and summon it at will. She can also command it to perform tasks.
Transform: The Jade Priestess can transform into a crocodile.`
  },
  {
    id: "c9jinghui000000",
    name: "Jinghui",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Jinghui is the Sifu of Mount Hai'an sect. For the last thirty years of her life she has devoted the sect's energy to killing members of Majestic Lion cult and occasionally members of Mystic Sword. Jinghui is a beautiful woman in her late 50s who has an air of authority and might. Though her Kung Fu is not as good as many of the other masters, she is an effective leader and has earned the loyalty of all her disciples for her fairness and resourcefulness.

Thirty years ago, Jinghui was engaged to Iron-Clawed Lion. At the time she admired his honesty and straight-forwardness, defending his reputation among the Orthodox sects. However he betrayed her, taking Lady Xiang as his lover and marrying her instead. Jinghui retaliated by killing Xiang one year after the wedding. This was not primarily an act of jealousy. Jinghui was angered because Iron-Clawed Lion's act tarnished her reputation and the reputation of her sect in the martial world; it was an act that demanded a life-long grudge.

Now she views their conflict as a game of strategy in which she is the superior player. Her aim is to draw out the conflict for as long as possible to help thwart Iron-Clawed Lion's progress, so she can catch up to his abilities and face him in a duel.`,
    text: `Jinghui
Defenses: Hardiness 6, Evade 5, Parry 6, Stealth 6, Wits 7, Resolve 8
Key Skills: Arm Strike: 2d10, Leg Strike: 3d10, Grapple: 2d10, Throw: 2d10, Light Melee: 3d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 3d10, Speed: 3d10, Muscle: 2d10, Endurance: 3d10, Reasoning: 3d10, Command: 3d10, Persuade: 2d10, Deception: 1d10, Empathy: 3d10, Detect: 2d10, Meditation: 3d10, Medicine: 3d10, Divination: 2d10, Languages (Hai'anese): 3d10, Languages (Daoyun): 3d10, Read Script (Feishu): 3d10, Read Script (Mount Hai'an Sect): 3d10, Institutions (Sects): 2d10, Creatures (Spirits): 2d10, Creatures (Animals): 2d10, Creatures (Demons): 2d10, History (Era of the Demon Emperor): 3d10, History (Era of the Glorious Emperor): 3d10, History (Era of the Righteous Emperor): 3d10, Places/Cultures (Hai'an): 3d10, Places/Cultures (Dai Bien): 2d10, Places/Cultures (Zun River Valley): 3d10, Survival (Wilderness): 3d10, Survival (Mountains): 3d10, Martial Disciplines (All): 2d10, Talent (Calligraphy): 3d10, Classics (All): 2d10
Qi: 3
Max Wounds: 7
Weapons: Unarmed, Fan
Reputation: Trustworthy-Cunning
Combat Technique: Fists of Steel
Key Kung Fu Techniques (Waijia 2, Neigong 1, Dianxue 1): Breath of Fury, Breath of the Lotus Petal, Clutch of the Hawk, Eagle Descends Loudly, Elephant Stance, Finger Flick, Fluttering Kicks, Gust of the Fan Blade, Inverted Three Point Strike, Iron Spirit, Kick of the Golden Elephant, Nine Divine Snakes, Restoring Palm, Ringing Strike of the Divine Ram, Spinning Back Kick, Stone Shattering Finger, Three Point Strike, Deflecting Canopy (Counter), Swift Rebuttal (Counter), Iron Body (Counter), Iron Spirit Resistance (Counter)`
  },
  {
    id: "c9kingqiangqing1",
    name: "King Qiang Qing",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `King Qiang Qing is the ruler of Hai'an. He is a great admirer of music, perhaps to a fault. He spends much of his time listening to famous musicians and performing on the guzheng. He also believes he can detect disloyalty among his officials by listening to them play melodies on instruments or hearing them sing. Therefore he requires all members of the palace to gain musical proficiency. This caution sometimes serves him well but also isolates him further and further from the people.

Though he lacks his father's charisma, he is perhaps braver than the former king, often leading his own men into battle against the advice of his inner circle. In matters of state, King Qiang Qing usually defers to his mother, Queen Ai Nu. However on some issues, like how to deal with disloyal members of his own family, he has shown greater mercy than she. The King has been known to take musical retreats for months, leaving his mother in charge in his absence.`,
    text: `King Qiang Qing
Defenses: Hardiness 7, Evade 4, Parry 7, Stealth 6, Wits 7, Resolve 8
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 0d10, Throw: 0d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 1d10, Meditation: 2d10, Ritual (Spirit Keeping): 2d10, Ritual (Celestial Spirit Ritual): 2d10, Religion (Yen-Li): 3d10, Places (Hai'an): 3d10, History (Era of the Righteous Emperor): 2d10, Medicine: 2d10, Athletics: 2d10, Muscle: 1d10, Speed: 2d10, Endurance: 1d10, Command: 1d10, Persuade: 0d10, Deception: 1d10, Talent (Poetry): 3d10, Talent (Guzheng): 3d10, Talent (Flute): 3d10, Talent (Singing): 2d10, Talent (Painting): 2d10, Language (Hai'anese): 3d10, Language (Daoyun): 3d10, Read Script (Feishu): 3d10
Qi: 4
Max Wounds: 9
Weapons: Jian, Unarmed
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Dianxue 1): Blasting Blade, Slashing Blade, Four-Point Touch, Drift of the Butterfly Fish, White Flower Palm, Phoenix Star Strike, Whirling Dodge (Counter)`
  },
  {
    id: "c9ladyplumblos01",
    name: "Lady Plum Blossom",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Lady Plum Blossom is the leader of Purple Cavern sect and a former member of the Golden Dragons. In her old sect she was known as Lady Sapphire, one of its six leading masters. After having a physical relationship with Master Emerald, she was dismissed from the order thirty years ago. Later Master Emerald informed her that his position in the sect meant more than their love, though this was really Bronze Master in disguise. Had the Golden Dragon sect also punished Master Emerald, it would have ended there, but they chose not to for their own reasons. This planted the seed of a grudge that remains to this day.

Lady Plum Blossom dedicated herself to training and became one of the greatest and most feared masters in Qi Xien, perhaps the greatest. She trained and scavenged the globe for secret manuals, developing her own style on top of what she had learned from the Golden Dragon sect. Before she left, she also stole the Dragon Manual, and learned most of its contents. She then established her own organization called the Purple Cavern sect. In many ways Purple Cavern is a mirror to the Golden Dragons, with a particular dislike of hypocrisy and an abiding pledge to help the downtrodden avenge grudges. In pursuit of martial perfection, Lady Plum Blossom accepted poison use as necessary.

Though the leader of an unorthodox sect with a reputation for poison use, Lady Plum Blossom genuinely believes in the principles she espouses and in the honorable history of the Golden Dragons. She places most of her focus on Sunan and Bao, adhering to the core ideals of Righteousness, Bravery, Reciprocity and Altruism. One of the chief things she believes in is helping the weak, particularly in helping them obtain justice.

Since she was removed from Golden Dragon sect thirty years ago, Lady Plum Blossom has showed little sign of aging due to the Jade Maiden found in the Purple Cavern sect Headquarters. Lady Plum Blossom has also moved away from Dehua and toward Yen-Li since her departure. Her favored student is Xiu, whom she views as a daughter, and she has a pet pearl tiger named Yan Shun.`,
    text: `Lady Plum Blossom
Defenses: Hardiness 9, Evade 4, Parry 8, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 3d10, Medium Melee: 3d10 or 5d10 with Jian, Small Ranged: 1d10, Athletics: 2d10, Swim: 3d10, Speed: 3d10, Muscle: 3d10, Endurance: 2d10, Meditation: 3d10, Ritual (Ancestor Veneration): 3d10, Ritual (Spirit Keeping): 2d10, Ritual (Celestial Spirit): 2d10, Ritual (Song of Gu): 2d10, Medicine: 3d10, History (Era of the Demon Emperor): 3d10, Martial Disciplines (All): 3d10, Institutions (Sects): 3d10, Read Script (Feishu): 3d10, Read Script (Purple Cavern Sect): 3d10, Religion (Qi Zhao, Dehua): 2d10, Religion (Yen-Li): 3d10, Talent (Poison): 3d10, Talent (Singing): 2d10, Detect: 3d10, Command: 3d10, Languages (Li Fai): 3d10, Languages (Daoyun): 3d10, Languages (Hai'anese): 3d10, Creatures (Demons): 3d10, Creatures (Spirits): 3d10
Qi: 6
Max Wounds: 13
Weapons: Fly-whisk (3d10 Damage, -1d10 Accuracy), Jian (4d10 Damage, +2d10 Accuracy)
Expertise: Fly-whisk
Combat Technique: Deflect (Medium and Light Melee)
Reputation: Poisoner
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Blood Letting Thorns, Breath of the Lotus Petal, Choking Lash of Lady Plum Blossom, Crushing Lash of Lady Plum Blossom, Drift of the Butterfly Fish, Fifth Fist of Yanshi, Flaming Dragon, Flight of the Hawk, Fourth Fist of Yanshi, Happy Strike of Laughing Fox, Heart Strike, I am the Arrow, Inverted Three-Point Strike, Lash of the Fly-whisk, Naga Palm, Nine Divine Snakes, Palm of the Dragon, Path of the Dragon, Phoenix Dragon Strike, Plum Blossom Palm, Red Claw Strike, Rising Dragon Stance, Spear of the Infinite Emperor, Sword Stance, Three-Point Strike, Venom of the Fly-whisk, Blade Pinch (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "c9ladywhiteblade",
    name: "Lady White Blade",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Lady White Blade is the great-granddaughter of General Dou Lun, a hero of Northern Hai'an in the final days of the Civil War. Her mother was a member of Hai'an sect named Dou Li, who formed her own branch, the Mystic Sword sect but died of poisoning, presumably at the direction of Hai'an. Lady White Blade assumed the leadership of Mystic Sword sect when her mother died.

Born Dou Lei, Lady White Blade earned her nickname because her temper and sword are said to strike with the ferocity of white lightning and because she is fond of white clothing. She is famously severe as a Sifu and sect leader, and has been known to maim students who displease her. On the other hand she can be quite maternal with her disciples, and even with her enemies, when they show the proper amount of respect.

There are perhaps none in the martial world as vengeful as Lady White Blade. She acquires new grudges with ease and devotes considerable energy to satisfying existing ones. Lady White Blade considers herself the greatest Martial Hero in the world and will attack anyone who suggests she is not. Her two basic goals are the destruction of Hai'an sect and the restoration of Northern Hai'an.

Lady White Blade has nearly the same facial features as Strange Phoenix, a member of Red Claw Gang, because Strange Phoenix is her long lost twin sister. She is unaware of this fact, though she has heard rumors of the alleged similarity.`,
    text: `Lady White Blade
Defenses: Hardiness 6, Evade 3, Parry 10, Stealth 6, Wits 6, Resolve 9
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 2d10, Kick: 3d10, Light Melee: 3d10, Medium Melee: 3d10 (6d10 with Jian or 2d10 with Ox Tail Dao), Heavy Melee: 3d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Athletics: 2d10, Meditation: 3d10, Command: 3d10, Detect: 2d10, Deception: 2d10, Ritual (Ancestor Veneration): 2d10, Language (Li-Fai): 3d10, Language (Hai'anese): 3d10, Language (Daoyun): 3d10, Read Scripts (Feishu): 3d10, Read Script (Mystic Sword Sect): 3d10, History (Era of the Glorious Emperor): 3d10
Qi: 6
Max Wounds: 13
Weapons: Ox Tail Dao (4d10 Damage, -1d10 Accuracy), Jian (3d10 Damage, +2d10 Accuracy)
Expertise: Medium Melee-Jian
Reputation: Righteous-Cruel
Flaws: Foul-tempered
Key Kung Fu Techniques (Waijia 3, Qinggong 1): Lady White Blade's Bursting Charge, Blade Pinch, Blasting Blade, Flight of the Hawk, Grudge Bearing Sword Strike, Phantom Phoenix Sword, Slicing Blade of the Flying Phantoms, Spearing Blade, Sword Whipping Strike, Slashing Blade, Swan Taming Strike, Weapon Hunts for Food, Whirling Dodge (Counter), Graceful Retreat (Counter), Horizontal Sidestep (Counter), Weapon Stride (Counter)`
  },
  {
    id: "c9laughingfox001",
    name: "Laughing Fox",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Laughing Fox is the mercurial leader of Temple of the Nine Suns sect. Now in his late 60s, he has commanded the sect for decades and always carries a bronze disc with him that symbolizes his authority. Laughing Fox looks to nature for guidance for signs sent by the sect's previous masters. Very recently he became convinced that the Wind Sabre of Sunan and the Phoenix Crown of Bao must be reunited and housed within their temple.

Highly unpredictable and capable of ethical extremes, Laughing Fox meditates and reflects each morning to determine which mood and disposition is most suitable for the day. He then uses that as a basis for how he interacts with people, adopting a different persona each day.`,
    text: `Laughing Fox
Defenses: Hardiness 4, Evade 4, Parry 4, Stealth 7, Wits 10, Resolve 8
Key Skills: Grapple: 3d10, Throw: 2d10, Arm Strike: 3d10, Leg Strike: 3d10, Light Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 1d10, Athletics: 3d10, Speed: 3d10, Muscle: 2d10, Endurance: 3d10, Meditation: 3d10, Medicine: 3d10, Divination: 3d10, Empathy: 1d10, Language (Daoyun): 3d10, Read Script (Feishu): 3d10, Read Script (Temple of the Nine Suns): 3d10
Qi: 4
Max Wounds: 9
Weapons: None
Reputation: Truthful-Too Reckless
Combat Technique: Fists of Steel
Key Kung Fu Techniques (Waijia 1, Neigong 2, Dianxue 1): Absorbing Palm, Breath of Fury, Breath of the Lotus Petal, Calm of Sunan, Clutch of the Hawk, Curing Palm, Eagle Descends Loudly, Fluttering Kicks, Hands of the Hawk Beak, Happy Strike of Laughing Fox, Inverted Three-Point Strike, Kidney Strike, Restoring Palm, Three-Point Strike, Trapping Wind, Triple Yang Strike, Guiding the Crashing Wave (Counter), Iron Body (Counter)
Powers
Daily Persona: Roll 1d10 each day to determine Laughing Fox's persona: 1-2 Compassionate, 3-4 Merciless, 5-6 Calm and wise, 7-8 Playful and cunning, 9 Wicked and bloodthirsty, 10 Crazy.`
  },
  {
    id: "c9littlevenom001",
    name: "Little Venom",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The daughter of the Venom of Zhaoze, Little Venom is a capable poisoner and follows in her father's footsteps. She is a dutiful daughter, looking forward to the day she can avenge her mother. Huo Ju respects and admires her father but has a softer heart than he. She can kill if she feels it is necessary or the person deserving, otherwise it is easy for her to show leniency.

She is incredibly curious and easily befriends new people, though she remains cautious of dangerous behavior. In the presence of her father she feigns cruelty to placate him. Little Venom takes a slightly different approach from her father when it comes to fighting, preferring to dip needles in poison and use those instead of palm Techniques.`,
    text: `Little Venom
Defenses: Hardiness 4, Evade 4, Parry 5, Stealth 6, Wits 9, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 2d10, Throw: 0d10, Leg Strike: 2d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Reasoning: 2d10, Speed: 3d10, Muscle: 1d10, Athletics: 2d10, Endurance: 1d10, Medicine: 1d10, Talent (Poison): 1d10, Survival (Wilderness): 2d10, Survival (Mountains): 1d10, Meditation: 2d10, Detect: 1d10, Languages (Li Fai): 3d10, Languages (Daoyun): 2d10, Languages (Hai'anese): 3d10
Qi: 2
Max Wounds: 5
Weapons: Needles (with Spiny Toad Venom)
Reputation: Poisoner
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Cherry Blossom Palm, Drift of the Butterfly Fish, Leap of the Swan, Storming Needles, Iron Spirit Reversal (Counter), Spinning Back Kick (Counter)`
  },
  {
    id: "c9longshu0000001",
    name: "Long Shu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Long Shu is a member of Purple Cavern sect who comes from Hai'an. He claims descent from a disowned part of the royal family and was sent away at a young age by his father. Raised by Purple Cavern sect during his teenage years, he also formed a bond with local Qi Zhao monks and learned a great deal from them. He is good friends with fellow disciples Xue Lingsu and Min.

He decided that there cannot be good without evil, and that too much of either is the enemy of perfection. Even an evil tyrant can produce good by uniting heroes against him. Acceptance is but one part of growth, and perseverance is another essential ability to growth and improvement. He views his own life as a catalyst for these tenets, which can occasionally put him at odds with his own sect.`,
    text: `Long Shu
Defenses: Hardiness 4, Evade 3, Parry 7, Stealth 7, Wits 8, Resolve 7
Key Skills: Arm Strike: 2d10, Throw: 2d10, Light Melee: 1d10, Medium Melee: 3d10 (Gun Staff), Swim: 3d10, Athletics: 2d10, Speed: 1d10, Muscle: 2d10, Ride: 1d10, Meditation: 1d10, Medicine: 2d10, Talent (Sculpting): 1d10, Trade (Wood): 1d10, Detect: 1d10, Persuade: 2d10, Deception: 3d10 (Tall Tales), Empathy: 1d10, Language (Daoyun): 3d10, Read Script (Sai): 1d10, Read Script (Purple Cavern): 2d10, History (Demon Emperor): 1d10, Institutions (Imperial Bureaucracy): 2d10, Institutions (Criminal): 1d10, Religion (Qi Zhao): 1d10
Qi: 4
Max Wounds: 9
Weapons: Metal Gun Staff with retracting spear point (treat as gun staff but Sharp when using point), Dagger, Blue Thunder
Expertise: Deception-Tall Tales
Reputation: Righteous-Untrustworthy
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Deflecting Canopy, Great Stride, I am the Arrow, Plum Blossom Palm, Reclining Stick Stance, Spear of the Infinite Emperor, Whirling Dodge (Counter)`
  },
  {
    id: "c9luzhi000000001",
    name: "Lu Zhi",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Lu Zhi is the leader of Heiping sect and the daughter of its former Queen, Lu Feiyan. Her adopted mother was killed by the Witch of Zhaoze Zhou over the Wind Sabre of Sunan and she has sworn to retake the blade and kill Lu Feiyan's murderer. Lu Zhi is strict with her disciples, almost cruel when they fall out of line, but gentle when they are obedient.

Lu Zhi is in her late thirties and has led the sect since she was 23. This has impeded her ability to reach her full potential, as many of the sect's key Techniques died with Lu Feiyan. Still she is a highly regarded master in the martial world and known for her unbending will. Queen Lu Zhi often uses her spear instead of her Jian for sword-based Kung Fu Techniques, taking the -1d10 penalty when appropriate.`,
    text: `Lu Zhi
Defenses: Hardiness 3, Evade 3, Parry 9, Stealth 8, Wits 6, Resolve 9
Key Skills: Grapple: 0d10, Arm Strike: 2d10, Throw: 0d10, Kick: 2d10, Light Melee: 0d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 2d10, Muscle: 2d10, Endurance: 1d10, Athletics: 1d10, Meditation: 3d10, Detect: 1d10, Divination: 2d10, Ritual (Ancestor Veneration): 3d10, Religion (Dehua): 3d10, Creatures (Spirits): 3d10, Creatures (Demons): 2d10, Language (Daoyun): 3d10, Language (Li Fai): 3d10, Language (Hai'anese): 3d10, Read Script (Feishu): 3d10, Read Script (Heiping Sect): 3d10, Classics (The Sayings of Kong Zhi): 3d10, Classics (Book of Fortunes): 2d10
Qi: 4
Max Wounds: 9
Weapons: Spear, Jian
Expertise: Heavy Melee-Qiang (Spear)
Reputation: Pure-Vengeful
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Arms of Silk, Blade Pinch, Blasting Blade, Double Thrust, Drift of the Butterfly Fish, Endless Arc of Spear, Grasp of the Python, Kick of the Swan, Leap of the Swan, Ringing Strike of the Divine Ram, Ringing Strike of the Hand, Rising Swan Stance, Slashing Blade, Spear of the Infinite Emperor, Spear Swipe, Stone Shattering Finger, Swan Taming Strike, Sword Whipping Strike, Clutch of the Hawk (Counter), Graceful Retreat (Counter), Horizontal Sidestep (Counter), Stern Rebuke of Heiping (Counter), Weapon Stride (Counter)`
  },
  {
    id: "c9madamehamaya01",
    name: "Madame Hamaya",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Owner of the Fragrant Petal, Madame Hamaya is a skilled Martial Hero and musician. She is allies with Master Ta, and often brings information about clients to him. She also uses the Fragrant Petal as a front for an assassination service.

Madame Hamaya came from a prestigious family in Hai'an but narrowly escaped death at a young age when disciples of Perfect Heaven Lineage sect murdered her mother and father after they were discovered to have dealings with agents of Emperor Zhan. All she knows about her father's death is it involved the Four Finger Manual. She spent her early years in Zun City surviving as a con artist and performer. Over the years she persuaded many wandering Sifu to instruct her in Kung Fu. Her natural ability to read people enabled her to gain their trust and learn many secrets of the martial world. This information was often more valuable than the Kung Fu they taught her.

Because she was able to move so easily between different levels of society, a notable assassin named Whispering Tail took her as his student. They shared a mutual hatred of Hai'an and she greatly refined her skills under his tutelage. They established the Fragrant Petal together, using it as a cover for their assassination services. Whispering Tail died last year after he assassinated King Qiang Lun of Hai'an. While rumors circulated that he had been hired by a member of the King's family, the act was actually a display of affection for Madame Hamaya. He was the only person Madame Hamaya considered worthy of her admiration and now measures all people against his memory.

Madame Hamaya is friendly with Dancing Hawk, the son of Master Ta. He loves her, but she does not reciprocate, though she is happy to use his desires to her advantage. She no longer wants revenge against Hai'an, as Whispering Tail obtained it on her behalf. However she is still wary of anyone from Hai'an, rarely allowing them into her establishment. Above all, she wants the Four Finger Manual because she wants to know what her family died for.`,
    text: `Madame Hamaya
Defenses: Hardiness 3, Evade 3, Parry 7, Stealth 10, Wits 8, Resolve 6
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 3d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 1d10, Speed: 3d10, Muscle: 1d10, Medicine: 3d10, Survival (Wilderness): 2d10, Reason: 2d10, Persuade: 3d10, Deception: 2d10, Empathy: 3d10, Talent (Guzheng): 3d10, Talent (Flute): 3d10, Talent (Singing): 2d10, Talent (Poetry): 2d10, Talent (Poison): 2d10, Languages (Daoyun): 3d10, Languages (Hai'anese): 3d10, Read Script (Feishu): 3d10, Institutions (Sects): 3d10, Places/Cultures (Dai Bien): 2d10, Places/Cultures (Zun River Valley): 3d10, Places/Cultures (Hai'an): 2d10
Qi: 4
Max Wounds: 9
Weapons: Fan, Jian
Reputation: Kind-Shameful
Flaws: Secret
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Dianxue 1): Arms of Silk, Dancing Hawk Sword Stance, Drift of the Butterfly Fish, Great Stride, Gust of the Fan Blade, Heart Strike, Inverted-Three Point Strike, Kick of the Golden Elephant, Leap of the Swan, Storming Needles, Swift Pounce of the Cheetah, Deflecting Canopy (Counter), Intercepting Arrow (Counter)`
  },
  {
    id: "c9makchingyuen01",
    name: "Mak Ching Yuen",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `This is a husband and wife who formed their own Yen-Li lineage called Bright Sun. They formerly belonged to the Golden Sword lineage but left when they discovered one of the priests trying to petition the Five Ghosts. Now they roam the Banyan aiding the poor and eliminating evil spirits. Mak Ching Yuen is surprisingly nimble and a skilled swordsman. He is good in a fight but also an expert exorcist. Lau Ching Sin knows minimal martial arts but is incredibly cunning and knowledgeable. They like to say that he is the soldier and she is the general. Both use the title Ritual Master.`,
    text: `Mak Ching Yuen
Defenses: Hardiness 7, Evade 5, Parry 5, Stealth 8, Wits 6, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 1d10, Throw: 2d10, Kick: 2d10, Light Melee: 1d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 2d10, Muscle: 2d10, Endurance: 2d10, Medicine: 3d10, Meditation: 3d10, Ritual (Spirit Keeping): 3d10, Ritual (Celestial Spirit): 3d10, Ritual (Binding Demon Ritual): 3d10, Ritual (Expulsion of the Malignant Winds): 2d10, Ritual (Song of Gu): 3d10, Detect: 2d10, Persuade: 2d10, Languages (Daoyun): 3d10, Languages (Li Fai): 3d10, Languages (Hai'anese): 1d10, Read Script (Feishu): 3d10, Creatures (Demons): 3d10, Creatures (Spirits): 3d10
Qi: 4
Max Wounds: 9
Weapons: Jian (3d10 Damage)
Reputation: Righteous-Unorthodox
Key Kung Fu Techniques (Waijia 3, Qinggong 1): Double Thrust, Drift of the Butterfly Fish, Fierce Strike, Fluttering Kicks, Flying Swan Kick, Leap of the Swan, Slashing Blade, Spinning Back Kick, Swan Taming Strike, Whirling Blade, Whirling Dodge (Counter)`
  },
  {
    id: "c9lauchingsin001",
    name: "Lau Ching Sin",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `This is a husband and wife who formed their own Yen-Li lineage called Bright Sun. They formerly belonged to the Golden Sword lineage but left when they discovered one of the priests trying to petition the Five Ghosts. Now they roam the Banyan aiding the poor and eliminating evil spirits. Mak Ching Yuen is surprisingly nimble and a skilled swordsman. He is good in a fight but also an expert exorcist. Lau Ching Sin knows minimal martial arts but is incredibly cunning and knowledgeable. They like to say that he is the soldier and she is the general. Both use the title Ritual Master.`,
    text: `Lau Ching Sin
Defenses: Hardiness 4, Evade 4, Parry 4, Stealth 6, Wits 9, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 1d10, Throw: 1d10, Kick: 1d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 1d10, Speed: 3d10, Muscle: 1d10, Endurance: 1d10, Medicine: 3d10, Meditation: 3d10, Survival (Wilderness): 2d10, Ritual (Spirit Keeping): 2d10, Ritual (Celestial Spirit): 2d10, Ritual (Expulsion of the Malignant Winds): 1d10, Ritual (Song of Gu): 2d10, Detect: 2d10, Reasoning: 3d10, Persuade: 2d10, Languages (Daoyun): 3d10, Languages (Li Fai): 3d10, Languages (Singh): 2d10, Languages (Hai'anese): 1d10, Read Script (Feishu): 3d10, Read Script (Singh): 1d10, Creatures (Demons): 3d10, Creatures (Spirits): 3d10, Creatures (Monsters): 3d10, Places/Culture (Hai'an): 2d10, Places/Culture (Emerald Coast): 1d10, Places/Culture (Dai Bien): 2d10, Places/Cultures (Kushen Basin): 1d10, Classics (All): 2d10
Qi: 1
Max Wounds: 3
Reputation: Righteous-Unorthodox
Key Kung Fu Techniques (Waijia 1, Qinggong 3): Fierce Strike, Spinning Back Kick, Whirling Dodge (Counter)`
  },
  {
    id: "c9masteremerald1",
    name: "Master Emerald",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Master Emerald is one of the leaders of Golden Dragon Sect. He dresses in long gold robes and a golden hat. He wears a thin brown beard that appears dyed. His features are angular and somewhat handsome. Calm and refined, Master Emerald's demeanor conceals a deep sadness over the loss of his true love, Lady Plum Blossom, formerly named Lady Sapphire. Though he may seem skilled to a beginner, Master Emerald has not put the great effort that many of his peers have into training.

Thirty years ago, Master Emerald was nearly kicked out of Golden Dragon sect for having an affair with Lady Sapphire. The two were discovered and Bronze Master accused Lady Sapphire of using sorcery to seduce Master Emerald. This could have resulted in her execution, but Master Emerald saved her by privately vowing to atone and remain in the sect, while she was ejected. After she left the sect she changed her name to Lady Plum Blossom. Though he still loves Lady Plum Blossom, and believes she misunderstands his actions, Master Emerald has never contacted her out of fear it would reignite the wrath of the Golden Dragons. Part of him feels like this is an act of cowardice and perhaps it is. Since these events, his enthusiasm for training has diminished.`,
    text: `Master Emerald
Defenses: Hardiness 7, Evade 4, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 2d10, Kick: 3d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 3d10 or 2d10 (Bian), Speed: 1d10, Muscle: 2d10, Endurance: 2d10, Medicine: 1d10, Meditation: 3d10, Detect: 3d10, Deception: 3d10, Persuade: 2d10, Languages (Li Fai): 2d10, Languages (Daoyun): 3d10, Languages (Hai'anese): 3d10, Read Script (Feishu): 3d10, Read Script (Purple Cavern): 3d10, Knowledge (Era of the Demon Emperor): 3d10, Knowledge (Era of the Righteous Emperor): 3d10, Institutions (Sects): 3d10, Creatures (Demons): 2d10, Creatures (Spirits): 1d10
Qi: 4
Max Wounds: 9
Weapons: Bian (4d10 Damage), Qiang (Heavy Spear)
Reputation: Righteous-Hypocritical
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Calm of Sunan, Crack of the Hard Whip, Drift of the Butterfly Fish, Flaming Dragon, Inverted Three-Point Strike, Lashing Dragon, Palm of the Dragon, Rising Dragon Stance, Spear of the Infinite Emperor, Spear Swipe, Spinning Back Kick (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "c9mastershan0001",
    name: "Master Shan",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Master Shan Jiayin is a cruel and deceitful scholar-official who controls the iron and gold mines near Iba. He has a longstanding feud with Master Ta and is obsessed with finding the Phoenix Crown of Bao and the perfect bride to wear it. He appears jovial and friendly at first but his dark nature quickly becomes apparent as he drops his guard over time.

Decades ago Master Shan was an editorial academic in the Secretariat of the Zhan Dao Empire, then became a supervisor in the Salt and Tea Monopoly Bureau. He left his post suddenly when a large shipment of High-Minded Phoenix Tea was unaccounted for and suspicion fell on him. He came to the Banyan and built a villa on land under Master Ta's control, taking the nearby iron mines as well as placing the village of Iba under his authority. He also found a rich deposit of gold in the area that Master Ta had never discovered. His ferocity frightened Master Ta, who still carries a grudge. He has five disciples and 60 soldiers who work for him.`,
    text: `Master Shan
Defenses: Hardiness 8, Evade 4, Parry 5, Stealth 7, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 0d10, Speed: 2d10, Muscle: 3d10, Endurance: 1d10, Deception: 3d10, Persuade: 1d10, Empathy: 2d10, Reason: 2d10, Talent (Tea Preparation): 1d10, Survival (Wilderness and Mountains): 3d10, Trade (Alchemy): 1d10, Trade (Stone): 1d10, Trade (Metal): 1d10, Talent (Poetry): 3d10, Talent (Calligraphy): 2d10, Talent (Poison): 1d10, Religion (Dehua): 2d10, Institutions (Criminal Underworld): 3d10, Institutions (Imperial Bureaucracy): 3d10, Places (Chezou River Valley): 3d10, Places (Zun River Valley): 3d10, Languages (Hai'anese and Daoyun): 3d10, Read Script (Feishu): 3d10, Classics (All): 2d10
Qi: 3
Max Wounds: 7
Reputation: Cunning-Cruel
Key Kung Fu Techniques (Neigong 2, Dianxue 2): Curing Palm, Heart Strike, Strike of the Raging Tiger, Stone Shattering Finger, Three-Point Strike, Trembling Strike, Blade Pinch (Counter)`
  },
  {
    id: "c9masterta000001",
    name: "Master Ta",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `A wealthy local magnate who lost his land to a rival, Master Ta resides on villa in a small mountain. Though he was once a champion of the weak and downtrodden, and to this day remains at his core a good man, Master Ta is obsessed with avenging the loss of his family's iron mines near Iba to Master Shan and his men. Master Ta's men remain loyal because he raised many of them out of poverty. He is friendly with the Nature Loving Monk sect and is well liked in the town of Redi. The Fragrant Petal often assists him as an information source. Master Ta has several acres of tea and sells his leaves to Redi and Zun City. Master Ta's nephew, Dancing Hawk, is a constant source of frustration, because he uses his name and money for carousing and bullying.`,
    text: `Master Ta
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 8, Resolve 8
Key Skills: Grapple: 0d10, Throw: 1d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Speed: 1d10, Muscle: 1d10, Deception: 2d10, Persuade: 3d10, Reason: 3d10, Talent (Cooking): 2d10, Talent (Tea Preparation): 3d10, Trade (Wood and Mechanical): 2d10, Survival (Wilderness and Mountains): 2d10, Talent (Poetry): 2d10, Institutions (Criminal Underworld): 2d10, Places (Zun River Valley): 3d10, Languages (Hai'anese and Daoyun): 3d10, Read Script (Feishu): 3d10
Max Wounds: 1
Expertise: Survival-Harvest/Fish
Reputation: Cowardly-Trustworthy`
  },
  {
    id: "c9min00000000000",
    name: "Min",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Min is a swordswoman of the martial world with a rebellious streak and personal code. She always keeps to her own word, but most sees her as dishonorable because she rejects many orthodox assumptions. Stubborn and unfilial, she takes no surname as her father said she brought shame to the family when she joined Purple Cavern sect. She has a sister named Jing who she secretly visits on occasion.

A recent recruit into Purple Cavern sect, she is close to Xue Lingsu and Long Shu. By working with them she became increasingly known in the martial world, as well as being recognized by Lady Plum Blossom, leader of Purple Cavern sect. She is famous for fighting with a sheathed Jian.`,
    text: `Min
Defenses: Hardiness 6, Evade 4, Parry 6, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Meditation: 3d10, Command: 2d10, Deception: 1d10, Reasoning: 1d10, Detect: 1d10, Institutions (Sects): 2d10, Read Script (Purple Cavern): 2d10
Qi: 4
Max Wounds: 9
Weapons: Sheathed Sword (Medium Melee +0d10 to hit, Muscle +1d10 Blunt Damage), Fly-Whisk
Reputation: Unorthodox-Unfilial
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Breath of the Lotus Petal, Choking Lash of Lady Plum Blossom, Double Thrust, Fierce Strike, Gaze of the Lion, Great Stride, Hands of the Hawk Beak, Swan Taming Strike, Weapon Hunts for Food, Weapon Stride (Counter), Grasp of the Python (Counter)`
  },
  {
    id: "c9nerguimogha001",
    name: "Nergui Mogha",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Nergui Mogha is a priest of Hedra from Naqan who currently advises the Khagan of the Kushen. He has been placed in charge of protecting the Khagan's daughter, Princess Sarnai, during her expedition into the Banyan region, a duty he dislikes but intends to do well. Nergui has helped advance Princess Sarnai's Kung Fu, but is on the lookout for a good local master to help her achieve her aim of learning from one of the greats.

Nergui belongs to the sect of the Chief Pillar, a Hedran group who believe that spilling blood is good if it enacts Hedra's punishing aspect. Nergui is exceptionally ugly but intelligent and affable with those he respects.`,
    text: `Nergui Mogha
Defenses: Hardiness 7, Evade 6, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 2d10, Throw: 1d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 3d10 (1d10 Meteor Hammer), Small Ranged: 1d10 (2d10 with Composite Bow), Speed: 1d10, Muscle: 4d10, Deception: 3d10, Reason: 2d10, Religion (Hedra): 3d10, Institutions (Sects): 1d10, Places (Naqan): 3d10, Languages (Khusbi): 3d10, Languages (Kushen): 2d10, Languages (Daoyun): 2d10, Read Script (Yoshaic): 3d10
Qi: 4
Max Wounds: 9
Weapons: Meteor Hammer (7d10 Damage)
Reputation: Cautious-Unjust
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Absorbing Palm, Kick of the Golden Elephant, Knock of the Meteor Hammer, Purge Spirit, Ringing Strike of the Divine Ram, Iron Body (Counter)`
  },
  {
    id: "c9peixinyu000001",
    name: "Pei Xinyu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Pei Xinyu is the wife of General Dee. She lives on Snake Peak, a small mountain in Li Fan filled with snakes, and is one of the most respected masters in the region. She is a bit of a hermit, living in a small cave home.

Xinyu's personality is a mixture of sternness and compassion. She believes in the traditions of Dehua, particularly the rules governing social interactions between masters and students, husbands and wives, and similar bonds. But she also believes when these are in conflict with more important virtues, like righteousness and compassion, they must be challenged. This is ultimately what led her to part ways with General Dee, after he turned to sadism and evil. Now she trains, intent on stopping him and his allies when the time comes. If she can find a worthy student to aid her, she will do so, but she has very high expectations and will only teach someone who demonstrates internal virtue.

Pei Xinyu appears to be in her early 50s, and dresses in the style of the Hu Qin elite. This is important to her, because she wants General Dee to recognize her when they face in battle. Pei Xinyu knows the art of snake charming and uses it to control the snakes on Snake Peak. She is not herself a poisoner however.`,
    text: `Pei Xinyu
Defenses: Hardiness 8, Evade 5, Parry 7, Stealth 6, Wits 7, Resolve 8
Key Skills: Arm Strike: 4d10, Leg Strike: 4d10, Grapple: 4d10, Throw: 2d10, Light Melee: 3d10, Medium Melee: 2d10, Heavy Melee: 1d10, Small Ranged: 0d10, Athletics: 3d10, Speed: 4d10, Muscle: 3d10, Endurance: 2d10, Talent (Snake Charming): 3d10, Talent (Flute): 3d10, Command: 2d10, Detect: 2d10, Religion (Dehua): 3d10, Read Script (Feishu): 3d10, Language (Daoyun): 3d10, Institutions (Imperial Bureaucracy): 3d10, Classics (All): 2d10, Creatures (Animals): 3d10
Qi: 8
Max Wounds: 17
Weapon: Unarmed (3d10 Damage)
Combat Technique: Fists of Steel
Key Kung Fu Techniques (Waijia 2, Neigong 2): Emanating Palm, Lady Xinyu's Pacific Heart Technique, Breath of the Lotus Petal, Restoring Palm, Iron Spirit, Finger Flick, Stone Shattering Finger, Ribbons of Steel, Ringing Strike of the Hand, Fluttering Kicks, Arms of Silk, Deflecting Canopy (Counter), Spinning Back Kick (Counter), Iron Spirit Resistance (Counter)
Profound Techniques: Wave of Frost
Powers
Emanating Palm: This creates a blast that hits everyone in a straight line of 80 feet, going through all targets in its path. It does 4d10 Damage to each person struck plus 2 Wounds. Cathartic: Works as normal but does 4d10 Damage plus 4 Extra wounds to each person struck.
Lady Xinyu's Pacific Heart Technique: Causes a swirling flow of energy that pins and pacifies. Make a Meditation roll against Resolve of everyone in an 80-foot diameter circle. Anyone affected is frozen in place for 2 rounds but can speak and can do no harm during this time. Cathartic: Anyone affected is frozen in place for 2 hours. If the user commits any act of violence, it ends the effect.`
  },
  {
    id: "c9princesssarnai",
    name: "Princess Sarnai",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Princess Sarnai, whose official title is Gonji, is the daughter of Khagan Ganbaatar and was recently put in charge of extracting turquoise from the northern Banyan. She begged her father for the position so she could use the opportunity to learn from some of the region's great masters. Though her father knows her real intentions, he feigns ignorance and has placed her under the watchful eye of his advisor Nergui Mogha. She resides in Kusha, a temporary tent garrison, and possesses the Phoenix Crown of Bao.

Princess Sarnai is short tempered due largely to her upbringing as royalty and unusually quick witted. She is sincere and loyal to those she likes. Though small, she is incredibly strong for her size.`,
    text: `Princess Sarnai
Defenses: Hardiness 6, Evade 6, Parry 5, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 2d10 (3d10 with Composite Bow), Ride: 3d10, Speed: 2d10, Muscle: 3d10, Deception: 2d10, Persuade: 1d10, Command: 1d10, Reasoning: 3d10, Survival (Plains): 3d10, Talent (Hawk Handling): 2d10, Languages (Kushen): 3d10, Languages (Daoyun): 2d10, Read Script (Yanzi): 3d10
Qi: 2
Max Wounds: 5
Weapons: Kushen Sabre (4d10 Damage), Meteor Hammer (7d10 Damage), Composite Bow (3d10 Damage)
Equipment: Phoenix Crown of Bao
Reputation: Loyal-Cunning
Key Kung Fu Techniques (Waijia 1, Qinggong 3): Knock of the Meteor Hammer, Flying Swan Kick, Kick of the Swan, Whirling Blade, Whirling Dodge (Counter)`
  },
  {
    id: "c9qinwenmaster1",
    name: "Qinwen, Master of the Seven Talismans",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Qinwen is the leader of Heaven Palace Sect and is 415 years old. He looks young, except his hair is stark white and he always dresses the old Li Fan style. Born just before the Era of the Dutiful State, Qinwen was an ambitious martial hero who stole the talismans from the ten Disciples of Pure Phoenix Sect about 350 years ago. He killed seven and took their talismans but the remaining three eluded him and killed many of his men. He is not an immortal, but has achieved longevity and youth through his talismans and been alive for centuries.

Qinwen worships the Demon Emperor, though he hides this fact from the world by presenting his intimate knowledge of the subject as part of his effort to prevent the Demon Emperor's return. He also encourages conflicting rumors about his nature. His favorite is to lead people to believe he is one of the original founders of Golden Dragon Sect, or a former ally of Sunan and Bao.

Qinwen is cautious, authoritative and highly confident in his abilities. He can be lenient with those who cross him, provided he contains them as a threat. He prefers to turn enemies into allies when possible and secure loyalty by demonstrating mercy. But anyone who exhausts his leniency will face severe punishments, often from the Talismans.`,
    text: `Qinwen, Master of the Seven Talismans
Defenses: Hardiness 5, Evade 5, Parry 7, Stealth 6, Wits 8, Resolve 8
Key Skills: Grapple: 2d10, Throw: 2d10, Arm Strike: 4d10, Leg Strike: 3d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 1d10, Large Ranged: 2d10, Speed: 3d10, Muscle: 4d10, Medicine: 3d10, Meditation: 3d10, Athletics: 4d10, Persuade: 2d10, Empathy: 2d10, Deception: 4d10, Command: 2d10, Reasoning: 2d10, Detect: 2d10, Ritual (Binding Demon): 4d10, Ritual (Blood Offering of the Demon Emperor): 4d10, Ritual (Blood Pledge for the Demon Emperor): 3d10, Ritual (Activation): 4d10, Ritual (Extract Phoenix Spirit): 3d10, Religion (The Bold King): 3d10, Read Script (Feishu): 3d10, Language (Daoyun): 3d10, Language (Li Fai): 3d10, Language (Khubsi): 3d10, Language (Singh): 3d10, History (All): 4d10, Talent (Flute): 3d10
Qi: 10
Max Wounds: 21
Weapon: None
Flaws: White Hair
Equipment: Talisman of Mulong/Xioa Huang, Talisman of Huo Long, Talisman of Shui Long, Talisman of Jin Long/Zhong Huang, Talisman of Tu Long
Key Techniques (Qinggong 1, Neigong 3): Flight of the Hawk, Swift Stride, Great Stride, Flaming Dragon, Calm of Sunan, Breath of the Lotus Petal, Whipping Strands, Stone Shattering Finger, Path of the Dragon, Blast of the Dragon, Iron Spirit, Iron Spirit Resistance (Counter), Iron Spirit Reversal (Counter), Iron Body (Counter), Whirling Dodge (Counter)
Profound Techniques: Burning Array, Roar of the Dragon
Techniques: Hand of the Hungry Ghosts
Powers
Winds of the Dragon: You extend your arm as powerful light emanates from your body striking everyone in a 300-foot area. Make a Meditation Roll against Evade. On a Success everyone takes 3d10 Damage plus 1 Extra Wound. Cathartic: Everyone takes 3d10 Damage plus 2 Extra wounds and is stunned for one round.`
  },
  {
    id: "c9queenainu0001",
    name: "Queen Ai Nu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The true power behind the throne of Hai'an, Queen Ai Nu is an intelligent and well-educated woman who has training in the techniques of The Perfect Heaven Lineage Sect and Nature Loving Monk Sect. Though she rarely boasts or demonstrates, Queen Ai Nu is one of the foremost martial experts in Hai'an.

One year ago her husband, King Qiang Lun, was killed by an assassin named Whispering Tail. An investigation revealed that his brother, Long Bai, was likely the one who hired the blade. Long Bai was executed and his wives and children arrested. King Qiang Qing decided to be merciful and offer them exile. He also gave them the option to lose all titles and change their identities if they wanted to remain within Hai'an. Queen Ai Nu is furious that her son showed mercy to the children of Long Bai, viewing this as a sign of weakness. She has used what influence she possesses to ruin the lives Long Bai's family who chose to stay in Hai'an.`,
    text: `Queen Ai Nu
Defenses: Hardiness 4, Evade 7, Parry 8, Stealth 6, Wits 8, Resolve 8
Key Skills: Arm Strike: 3d10, Leg Strike: 2d10, Grapple: 2d10, Throw: 2d10, Light Melee: 3d10 (4d10 with Stick), Medium Melee: 2d10, Heavy Melee: 1d10, Meditation: 3d10, Ritual (Spirit Keeping): 2d10, Ritual (Celestial Spirit Ritual): 2d10, Religion (Yen-Li): 3d10, Places (Hai'an): 3d10, History (Era of the Righteous Emperor): 3d10, Institutions (Imperial Bureaucracy): 3d10, Medicine: 2d10, Athletics: 2d10, Muscle: 1d10, Speed: 3d10, Endurance: 2d10, Command: 3d10, Persuade: 2d10, Deception: 3d10, Talent (Poetry): 3d10, Talent (Guzheng): 3d10
Qi: 6
Max Wounds: 11
Weapons: Stick (3d10 Damage), Unarmed
Techniques (Waijia 1, Neigong 1, Qinggong 1, Dianxue 1): Blasting Blade, Slashing Blade, Four-Point Touch, Drift of the Butterfly Fish, Breath of Fury, All Dragon Techniques, Clutch of the Hawk, Reclining Stick Stance, Dog Bashing Stick, Dog Lifting Stick, Skull Breaking Stick, Stick of the Rebounding Dog, Stick of the Rising Dog, Graceful Retreat, Horizontal Sidestep, Whirling Dodge, White Flower Palm, Phoenix Star Strike, Whirling Dodge (Counter)`
  },
  {
    id: "c9recklessstorm",
    name: "Reckless Storm",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Guo is a Kung Fu master whose Phoenix Spirit of Happiness has been permanently blocked and disrupted, leaving him in a constant state of buoyant optimism. As a result he possesses a complete and utter inability to control his impulses. He is enthused by any notion or whim that enters his mind, no matter how unsafe. The only thing restraining him is a very rigid sense of propriety concerning women, parents and religion. Anything that would go against filial piety, decorum between the sexes, or violate religious precepts he reacts against with explosive rage.

Beyond these particular sensibilities he is open to any suggestion someone makes, however he tends to elaborate on his own, going in quite unexpected directions by the time any plan is executed. Reckless Storm is therefore almost completely unpredictable. Reckless Storm is in his 60s but has a youthful demeanor. He delights in learning and is curious about anything he sees someone else doing; if someone can do something he cannot, he immediately seeks to master the skill.`,
    text: `Reckless Storm
Defenses: Hardiness 10, Evade 7, Parry 7, Stealth 7, Wits 7, Resolve 10
Key Skills: Arm Strike: 2d10, Light Melee: 2d10, Speed: 3d10, Athletics: 3d10, Ritual (Spell of the Golden Fireball): 3d10, Survival (Wilderness): 2d10, Talent (Singing): 2d10, Talent (Guzheng): 2d10, Talent (Tea Preparation): 2d10, Talent (Dancing): 2d10, Talent (Cooking): 2d10, Talent (Theft): 2d10, Command: 1d10, Reasoning: 1d10, Detect: 1d10, Meditation: 3d10, Religion (Yen-Li): 2d10
Qi: 6
Max Wounds: 13
Weapons: Metal Fan (4d10 Damage)
Reputation: Too Reckless-Too Reckless
Key Kung Fu Techniques (Qinggong 2, Dianxue 2): Calming Profundity, Dance of the Bixie, Fearless Stride of the Storm, Final Tranquility of the Storm, First Tranquility of the Storm, Heart Smashing Palm, Sealing the Phoenix, Second Tranquility of the Storm, Third Tranquility of the Storm, Turn of the Zhen Bird (Counter), Dreaming Heavenly Splendor (Counter)`
  },
  {
    id: "c9redclawdemon1",
    name: "Red Claw Demon",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `A former student of Yanshi, Red Claw Demon was impossible to control and used his martial powers to exploit others. His former master dismissed him, striking him hard in the left temple as he did so, leaving a permanent dent in Red Claw's head. Now Red Claw leads his own gang of 40 plus men. He is assisted by Strange Phoenix and the Firelance Brothers.

Red Claw is kind to those who submit to his will but shows no mercy to those who resist. Confident, boisterous and crude, Red Claw Demon has a tendency to overestimate his own refinement and underestimate the enemy's Martial Skill. In his spare time he often plays the Guzheng. His musical talents are remedial though he considers himself a budding master with endless potential. He takes a similar approach to calligraphy.`,
    text: `Red Claw Demon
Defenses: Hardiness 7, Evade 3, Parry 8, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 2d10, Throw: 2d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 0d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 0d10, Athletics: 2d10, Speed: 2d10, Muscle: 3d10, Meditation: 3d10, Talent (Calligraphy): 0d10, Talent (Guzheng): 0d10, Languages (Daoyun): 3d10, Read Script (Feishu): 1d10, Read Script (Red Claw Gang): 2d10
Qi: 3
Max Wounds: 7
Weapons: Hands (3d10 Damage)
Expertise: Fists of Steel
Reputation: Merciful-Vengeful
Key Kung Fu Techniques (Waijia 2, Neigong 2): Clutch of the Hawk, First Fist of Yanshi, Iron Spirit, Red Claw Strike, Second Fist of Yanshi, Iron Body (Counter), Guiding the Crashing Wave (Counter), Iron Spirit Resistance (Counter)`
  },
  {
    id: "c9onearmedfiery1",
    name: "One-Armed Fiery Demon",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Shang Pu is a former member of Heiping sect who left to marry the great Martial Hero Leng. To alleviate her master's anger, Shang Pu and Leng attempted to steal the Wind Sabre of Sunan from the Witch of Zhaoze Zhou. They failed but rumors persisted that they had succeeded. Lady White Blade, leader of the Mystic Sword sect, tracked the two down after their friend Weng Zheng revealed their whereabouts and demanded they hand over the Wind Sabre. When they were unable to do so, she killed Leng and cut off Shang Pu's right arm, leaving her for dead. The grief drove Min insane and turned her hair white. She fled to the mountains and trained with a number of great teachers before returning to the Banyan using the name Shang Pu. As she started taking vengeance on Mystic Sword sect members, she quickly earned the nickname One-Armed Fiery Demon.

Shang Pu still dresses like a Heiping sect member but her clothes are all rose-colored. Shang Pu always smells like roses because she carries five to seven bunches at all times for use with one of her Techniques. Her hair is white and she is missing her right arm. Shang Pu is the embodiment of determination. Her goal is nothing less than the eradication of Mystic Sword sect and the death of Lady White Blade. She knows she is not ready to take on the Lady herself yet, but is content to unleash her fury on minor disciples until she improves her Kung Fu. She will ally with anyone who shares her hatred of Mystic Sword sect and has a soft spot for those who have suffered a similar loss to herself. She carries the decorative bao she once gave to Leng on her person at all times.

While she is not looking for disciples, she will teach Techniques to anyone who can confirm they have killed a Mystic Sword sect member, preferably by presenting her with the head.`,
    text: `One-Armed Fiery Demon
Defenses: Hardiness 7, Evade 5, Parry 8, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 2d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 3d10, Medium Melee: 3d10 (5d10 with Jian or 2d10 with Ox Tail Dao), Heavy Melee: 2d10, Small Ranged: 0d10, Speed: 3d10, Muscle: 1d10, Athletics: 2d10, Meditation: 3d10, Ritual (Ancestor Veneration): 3d10, Ritual (Song of Gu): 2d10, Religion (Dehua): 2d10, Institutions (Sects): 2d10, Creatures (Demons): 1d10
Qi: 4
Max Wounds: 9
Weapons: Jian (2d10 Damage, +2d10 Accuracy), Ox Tail Dao (3d10 Damage, -1d10 Accuracy)
Flaws: Missing Limb (penalties removed with Adaptation of the Maimed)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Adaptation of the Maimed, Blasting Blade, Blood Letting Thorns, Drift of the Butterfly Fish, Kick of the Swan, One-Armed Strike, Purge Spirit, Spinning Back Kick, Spinning Steel, Stealth of the Spider Demon, Swan Taming Strike, Weapon Stride (Counter), Stern Rebuke of Heiping (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "c9shanlushan0001",
    name: "Shan Lushan",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Shan Lushan is a mercurial man who does what he wants and has high standards when choosing friends or associates. He is capable of extreme displays of anger and violence, though these pass quickly. The head of Zhaoze sect, which he established, Lushan prefers to surround himself with a small number of disciples who share his devotion to the arts. He lives at Zhaoze Palace, on Zhaoze Island in Zhaoze Lake, where he engages in poetry and music. He is also a patron of arts and invites promising painters, poets, musicians and scholars to reside on his grounds. Zhaoze Island is inhabited by Pearl Tigers, but Shan Lushan commands them with the Turquoise Necklace of Li Fan.

Shan Lushan likes to either develop his own Techniques or trick people into teaching him Techniques he wishes to know, usually through a friendly competition. He acquired the Hidden Fist of Yanshi by beating him in a moon staring contest. Shan Lushan was not always so unconventional. This side of his personality came with age and bloodshed. He was once a member of the Yao, however he grew to despise the Emperor, not for the leader's moral failures, but for his lack of appreciation for music and poetry. In time, he came to despise the Emperor for philosophical reasons. Lushan stole the Emperor's prized Turquoise Necklace of Li Fan and fled to Zhaoze Island, where he lives today. Shan Lushan is the only former member of the Yao to recover his heart. For this he feels a certain amount of guilt. Valuing independence and being true to one's spirit, he finds the Emperor's use of the ritual highly objectionable. Nothing angers him more than the sight or mention of the Yao. The scar on his chest is a constant reminder of his past.`,
    text: `Shan Lushan
Defenses: Hardiness 10, Evade 4, Parry 4, Stealth 7, Wits 8, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 2d10, Leg Strike: 3d10, Light Melee: 3d10 (4d10 with Flute), Medium Melee: 0d10, Heavy Melee: 0d10, Athletics: 3d10, Endurance: 3d10, Speed: 1d10, Muscle: 2d10, Detect: 2d10, Talent (Singing): 3d10, Talent (Poetry): 3d10, Talent (Guzheng): 2d10, Talent (Flute): 3d10, Talent (Painting): 1d10, Talent (Calligraphy): 2d10, Languages (Li Fai): 3d10, Languages (Daoyun): 3d10, Languages (Hai'anese): 2d10, Read Script (Feishu): 3d10
Qi: 6
Max Wounds: 13
Weapons: Unarmed, Flute (1d10 Damage)
Equipment: Turquoise Necklace of Li Fan
Reputation: Truthful-Selfish
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Cherry Blossom Palm, Dog Bashing Stick, First Song of Shan Lushan, Great Stride, Harmonizing Strike, Iron Foot Stance, Kick of the Golden Elephant, Mighty Paws of the Lion, Pounce of the Lion, Swift Pounce of the Cheetah, Blade Pinch (Counter), Hidden Fist of Yanshi (Counter), Guiding the Crashing Wave (Counter)`
  },
  {
    id: "c9sistersbone001",
    name: "Sisters of Bone Kingdom",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `The three Sisters of Bone Kingdom were once disciples of Pure Phoenix Sect, and still regard themselves as members, but have long since abandoned its beliefs. Bingyin is the eldest and the most wicked of the sisters. She cares for no one but herself and kills the most frequently. Dawa is a few years younger than Bingyin and still retains a trace of her former compassion. Liling is intelligent and curious but enjoys toying with her foes. Of the three she is perhaps the cruelest, though she only mistreats those who infuriate her.

The sisters are old and shriveled but still physically powerful, however Liling frequently uses her youthful beauty ability to alter her appearance. They have a number of Kung Fu Techniques learned from their sect but also have powers granted to them by the Phoenix Talismans they control. In addition each sister has a unique power not possessed by the others. The sisters all have habits of using the talismans to create servants for themselves, but the most creative in this respect is Liling, who twists her servants into pets that are pleasing to the eye or objects of ridicule.

While Bingyin always keeps her talisman on her person, the other two sisters keep them in hidden chambers. Liling always wears one of thirteen hair pins, each representing a figure or animal for a given month. During the relevant month these bestow a bonus on any skill roll relevant to the month's nature and character.`,
    text: `Sisters of Bone Kingdom
Defenses: Hardiness 8, Evade 8, Parry 8, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Bite: 2d10, Throw: 2d10, Arm Strike: 3d10, Leg Strike: 3d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 2d10, Small Ranged: 2d10, Speed: 3d10, Muscle: 4d10, Endurance: 2d10, Athletics: 3d10, Ritual (Ancestor Veneration): 3d10, Ritual (Activation): 3d10, Ritual (Sword Ritual of Bao): 3d10, Ritual (Spirit Keeping): 3d10, Meditation: 3d10, Command: 3d10, Detect: 3d10, Read Script (Feishu): 3d10, Language (Daoyun): 3d10, History (Era of the Demon Emperor): 3d10, Religion (Yen-Li): 3d10, Religion (Dehua): 2d10, Religion (Hen-Shi): 3d10
Qi: 6
Max Wounds: 13
Weapon: Jian (5d10 Damage)
Combat Technique: None
Equipment: Talisman of Yi Huang (Liling), Talisman of Li Huang (Dawa), Talisman of Ren Huang (Bingyin), Liling's Thirteen Hair Pins
Key Techniques (Neigong 2, Waijia 1, Qinggong 1): Arms of Silk, Leap of the Swan, Drift of the Butterfly Fish, Fluttering Kicks, Biting Blade, Blasting Blade, Whirling Blade (Counter)
Powers
Reply of the Swan: Against any melee attack, you spin away from the strike and arch your back, striking your enemy behind you. Roll Medium Melee against the attack roll. On a success you evade the strike and make a normal attack. Cathartic: You add your ranks in Neigong to the damage roll.
Gentle Strike: This soft hand strike feels almost like a reassuring pat or caress, but creates a delayed effect that ripples through the whole body. Roll Arm Strike against Parry. On Success the target takes 2 wounds each round for 6 rounds. The target can make a Meditation Roll TN 7 to stop damage each round. Cathartic: Hit up to 3 targets.
Ring of the Sword: You swirl around and carve a blue ring into the air, which expands and strikes targets all around you. Roll Medium Melee against Evade. On Success opponents hit suffer your Qi rank in damage. This can exceed the soft cap. Cathartic: Anyone struck is knocked back 10 feet per rank of Qi.
Cascading Phoenix: You arch your back and a flow of blue energy pours from your body and hits people in a curving path. Can hit 14 targets. Roll Athletics against Evade. Does 1d10 Cold Damage. Cathartic: Hits 21 targets, does 2d10 Damage, and imposes a -1d10 penalty to Physical skills for 2 rounds.
Devour: The teeth of the Sisters are sharp and they deliver 3d10 open damage when biting.
Command the Dead: People killed by the sisters return as skeletons and follow their commands.
Create Skeletons: When a Sister kills someone and touches their forehead, they rise up as a skeleton under her command.
Deathless: The sisters age but never die. They can only be killed if their bodies are destroyed and purged in a fire.
Youthful Beauty (Liling): Only Liling has this ability. She can change her appearance at night so she looks younger and prettier than her sisters. Anyone who is attracted to females and sees her risks falling instantly in love. This effect lasts until a subsequent roll fails.
Control Water (Dawa): Dawa can command bodies of water and even summon rain. She merely needs to make a Command roll against TN 6.
Death Curse (Bingyin): Bingyin can perform a strange resurrection by kissing the lips of the dead. A kiss from Bingyin prevents the spirits from leaving the body but the flesh still dies. Only Bingyin's pools of Dispassion can alleviate the victim's pain.`
  },
  {
    id: "c9spiderdemon001",
    name: "Spider Demon",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Spider Demon is a street urchin who spends her time among the rooftops of the Dai Bien Forest. A hero of the people, she is kind and charitable to those who suffer from tyrants and poverty, yet vengeful against those with evil intent. It is this vengeful side that often makes her highly unpredictable; mercy or retribution lay at her hand. This judgment almost always occurs when enemies provoke combat and tapers down as the battle slows. Always conscious of her own morality, she maintains a defensive posture until threatened, and will not kill anything or anyone unless provoked.

Zhi-Zhu is highly secretive, hiding her past, her associates, and her alliances. She takes no sect, and is rumored to have no true Sifu. Unswayed by money and glory, she is only driven by her sense of justice. Her greatest secret is her true name, as the name Zhi-Zhu was given to her by the Zun villagers for her innate ability to climb and lurk within the shadows.`,
    text: `Spider Demon
Defenses: Hardiness 4, Evade 5, Parry 4, Stealth 10, Wits 6, Resolve 6
Key Skills: Grapple: 3d10, Light Melee: 3d10, Talent (Juggling): 2d10, Survival (Cities): 1d10 (+1d10 Forage/Shelter), Survival (Wilderness): 1d10, Detect: 3d10, Athletics: 3d10, Speed: 3d10, Muscle: 2d10, History (Righteous Emperor): 1d10 (2d10 for City Daolu), Places/Cultures (Dai Bien): 1d10 (2d10 for City Chen), Institutions (Sects): 1d10 (2d10 for People)
Qi: 4
Max Wounds: 9
Weapons: Daggers, Caltrops
Expertise: Survival (Cities)-Forage/Shelter, History (Righteous Emperor)-Daolu, Places/Cultures (Dai Bien)-Chen
Reputation: Kind-Vengeful
Combat Technique: Quick (Light Melee)
Key Kung Fu Techniques (Waijia 2, Qinggong 2): Arms of Silk, Crawling Tiger, Invisible Whip of the Spider Demon, Lurking Spider Stance, Slicing Blade of the Flying Phantoms, Stealth of the Spider Demon, Storming Daggers, Storming Needles, Turn of the Caltrop, Wall of Caltrops, Weapon Stride (Counter), Horizontal Sidestep (Counter)`
  },
  {
    id: "c9strangephoenix",
    name: "Strange Phoenix",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Strange Phoenix is second in command of the Red Claw Gang. She is tall and athletic and bears a striking resemblance to Lady White Blade. She is called Strange Phoenix because her scholarly demeanor is an odd contrast to Red Claw and the rest of his gang. While she keeps her past shrouded in mystery it is clear to anyone who speaks with her that she is well educated and cultured. Loyal to Red Claw, she disagrees with some of his tactics, finding them crude and brutal. She believes the gang could be more profitable if it spent time cultivating the good will of the people it exploits. She is not against stealing, robbing or murder when it helps achieve their goals, she simply dislikes Red Claw's reckless approach.

Strange Phoenix frequently serves as the face of the Red Claw Gang and will occasionally dress as a man when doing so, taking the name Mr. Yu and pretending to be a former imperial official. Intelligent and reliable, Strange Phoenix's one flaw is her love of gambling. She is well versed in the classics and in history, but has a particular interest in legends and tales of the Iron Sky Maiden.

Strange Phoenix's resemblance to Lady White Blade is more than just a coincidence; the two are long lost twin sisters, though neither is aware of this. At birth, Strange Phoenix was secreted away to a reputable family in Hai'an as part of an effort to preserve General Dou Lun's lineage. Strange Phoenix has no knowledge of her true birth identity.`,
    text: `Strange Phoenix
Defenses: Hardiness 7, Evade 5, Parry 6, Stealth 8, Wits 7, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 3d10, Medium Melee: 2d10 (4d10 with Wooden Staff), Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 2d10, Speed: 3d10, Muscle: 2d10, Meditation: 2d10, Reasoning: 2d10, Command: 3d10, Persuade: 2d10, Deception: 2d10, Talent (Disguise): 2d10, Talent (Calligraphy): 2d10, Talent (Guzheng): 3d10, Talent (Theft): 3d10, Talent (Poetry): 2d10, Reason: 3d10, Medicine: 2d10, Read Script (Feishu): 3d10, Read Script (Red Claw Gang): 3d10, Languages (Daoyun, Hai'anese, Yanli and Li Fai): 3d10, Language (Kushen): 2d10, Religion (Dehua): 2d10, Classics (All): 1d10, History (Era of the Great Emperor): 1d10, History (Era of the Compassionate Daughter): 2d10, History (Era of the Demon Emperor): 1d10, History (Era of the Eastward Bound Invaders): 3d10, History (Era of the Dutiful State): 1d10, History (Era of the Righteous Emperor): 1d10, History (Era of the Glorious Emperor): 2d10
Qi: 3
Max Wounds: 7
Weapons: Iron Hat (4d10 Damage but Damage self if all ones on Attack roll), Jian, Wooden Staff (2d10 Damage)
Reputation: Calm-Cunning
Flaws: Hedonist (Gambling)
Combat Technique: Medium Melee-Counter
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Calm of Sunan, Curing Palm, Dog Lifting Stick, Drift of the Butterfly Fish, Fierce Strike, Stunning Stick Strike, Tai Lan's Staff Strike, Horizontal Sidestep (Counter)`
  },
  {
    id: "c9venomzhaoze001",
    name: "Venom of Zhaoze",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Huo Si is known as the Venom of Zhaoze, and widely feared in the martial world. He is tall, strong, broad-shouldered, with cold green eyes. He keeps a trimmed beard and travels with his daughter Little Venom. Venom of Zhaoze was once a Martial Hero and healer, but he turned toward the practice of poison when his wife, Na, was brutally murdered by one of his former masters. He uncovered the secrets of venom Kung Fu to gain revenge. To protect his daughter, he joined Zhaoze sect, knowing others in the martial world would not dare attack them if they were a part of this group. Now he boasts of his own cruelty and seems proud when his daughter demonstrates the trait. His current wish is to find her a worthy husband, someone with powerful Kung Fu and intelligence.`,
    text: `Venom of Zhaoze
Defenses: Hardiness 6, Evade 4, Parry 5, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 3d10, Arm Strike: 3d10, Throw: 1d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 1d10, Heavy Melee: 1d10, Speed: 1d10, Muscle: 3d10, Endurance: 2d10, Talent (Poison): 3d10, Medicine: 3d10, Meditation: 3d10, Survival (Wilderness): 3d10, Survival (Mountain): 3d10, Survival (Cities): 1d10, Detect: 2d10, Languages (Li Fai): 3d10, Languages (Daoyun): 1d10, Languages (Hai'anese): 3d10
Qi: 4
Max Wounds: 9
Weapons: None
Reputation: Poisoner
Key Kung Fu Techniques (Qinggong 1, Neigong 2, Dianxue 1): Cherry Blossom Palm, Croak of the Toad, Curing Palm, First Song of Shan Lushan, Inverted Three-Point Strike, Naga Palm, Nine Divine Snakes, Sealing the Winds of Gushan, Trapping Wind, Zhe Valley Fist, Iron Spirit Reversal (Counter)`
  },
  {
    id: "c9witchzhaoze001",
    name: "Witch of Zhaoze Zhou",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Li Sou Chao was once part of a pair. She was married and in love with Kang Yin. Both were widely respected and admired heroes. She and her husband found the Wind Sabre of Sunan. This powerful artifact is highly prized and the different sects conspired against the lovers to take it from them. They were tricked by members of the Heiping sect, who masqueraded as helpless maidens in dire peril. The Heiping nuns murdered Kang Yin and tried to take the sabre, but Li Sou Chao massacred them and took back the sword. She then murdered Lu Feiyan, leader of Heiping sect at the time.

Disillusioned by the betrayal, Li Sou Chao forsook her former role as hero and vented her rage and grief by spreading violence and pain. Though hell-bent on revenge and destruction, she has a soft spot for those who resemble her late husband, particularly those of a stoic or somber disposition. This caused her to take pity on a young orphan, whom she raised and nicknamed Frowning Eagle. She also always reciprocates kindness.`,
    text: `Witch of Zhaoze Zhou
Defenses: Hardiness 6, Evade 4, Parry 7, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 1d10, Leg Strike: 3d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 2d10, Speed: 2d10, Muscle: 1d10, Endurance: 2d10, Ritual (Spirit Keeping): 2d10, Ritual (Zun Forest Shaping): 2d10, Ritual (Petition to the Five Ghosts): 3d10, Ritual (Paper Talisman): 2d10, Ritual (Western Heavens Ritual): 1d10, Survival (Sea): 3d10, Survival (Wilderness): 3d10, Talent (Poison): 3d10, Religion (Yen Li): 2d10, Meditation: 3d10, Detect: 3d10, Deception: 2d10
Qi: 3
Max Wounds: 7
Weapons: Jian, Dao, Poison Needles (1d10 Damage plus 1d10 for each additional needle)
Expertise: Survival-Harvest/Fish
Reputation: Poisoner
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Arms of Silk, Merciless Black Claw, Slashing Blade, Storming Needles, Sword Stance, Weapon Stride (Counter), Deflecting Canopy (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "c9xunandanzhi001",
    name: "Xun and Anzhi",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Xun and Anzhi are the two remaining disciples of Compassionate Monkey. Xun is missing his left arm while Anzhi is missing his right, so they tend to fight next to each other to compensate. Their arms were ripped out by Compassionate Monkey himself when they refused to follow Hen-Shi. Since then they have become reluctant devotees of the goddess, and they now reside on Red Mountain where Compassionate Monkey has ordered them to stop anyone attempting to reach the peak.`,
    text: `Xun and Anzhi
Defenses: Hardiness 8, Evade 3, Parry 5, Stealth 6, Wits 6, Resolve 6
Key Skills: Throw: 0d10, Grapple: 1d10, Arm Strike: 1d10, Leg Strike: 2d10, Medium Melee: 1d10, Speed: 1d10, Muscle: 2d10, Detect: 2d10, Athletics: 2d10, Swim: 0d10
Qi: 2
Max Wounds: 5
Weapons: Jian (3d10 Damage)
Reputation: Cowardly-Untrustworthy
Flaws: Missing Limb
Combat Technique: One-Armed Swordsman
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Breath of Fury, Fierce Strike, Twin Strike, Weapon Stride (Counter)`
  },
  {
    id: "c9yangtuo0000001",
    name: "Yang Tuo",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Yang Tuo is a legendary hero in his own lifetime, known for his kindness and strict adherence to customary etiquette. Despite this, some in the martial world consider him untrustworthy, a recurring problem during his life.

Though he never took the Imperial exams his father was a scholar-official in Hai'an and trained him in the classics. When his family was killed by the Venom of Zhaoze he was orphaned before finding a place at Sun Mai Temple. Despite some early training with the sect, he was forced to leave after a rival student falsely accused him of theft. Since then he has roamed the Banyan, helping the weak and powerless against any who would oppress them. His friendly disposition and righteous temperament has earned him the good graces of many Martial Experts, and this has allowed him to master a range of unusual Techniques. Recently Yang Tuo has been staying in the village of Xi, learning to make pottery as an apprentice under Master Dee.`,
    text: `Yang Tuo
Defenses: Hardiness 9, Evade 4, Parry 4, Stealth 10, Wits 7, Resolve 7
Key Skills: Grapple: 3d10, Arm Strike: 3d10, Throw: 2d10, Leg Strike: 3d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 2d10, Athletics: 3d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Meditation: 3d10, Detect: 2d10, Language (Daoyun): 3d10, Read Script (Feishu): 3d10, Language (Li Fai): 3d10, Language (Hai'anese): 3d10, Religion (Qi Zhao): 2d10, Institutions (Sects): 2d10, Places (Dai Bien and Zun River Valley): 3d10, Classics (All): 3d10, History (Era of the Demon Emperor): 2d10, Talent (Calligraphy): 3d10, Trade (Ceramics): 1d10, Ritual (Ancestor Veneration): 2d10, Reasoning: 3d10, Persuade: 3d10
Qi: 5
Max Wounds: 11
Weapons: None
Reputation: Brave-Untrustworthy
Flaws: Fated (To Misunderstand)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Clutch of the Hawk, Crawling Tiger, Double Thrust, Drift of the Butterfly Fish, Encompassing Emerald of Sun Mai, Flaming Dragon, Fluttering Kicks, Fourth Fist of Yanshi, Grasp of the Python, Great Stride, Hands of the Hawk Beak, Happy Strike of Laughing Fox, Iron Foot Stance, Kick of the Golden Elephant, Sun Mai Sword, Zhe Valley Fist, Guiding the Crashing Wave (Counter), Whirling Dodge (Counter), Iron Spirit Resistance (Counter)`
  },
  {
    id: "c9zhehu000000000",
    name: "Zhehu, the Right Hand of Yao-Feng",
    type: "monster",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `A massive creature with purple skin and a single horn, Zhehu is a terror to behold. His eyes are black with thin red pupils and his nails are the bright white of ivory. Zhehu is an Ogre Demon and the former disciple of Yao-Feng, who brought Ogre Gate to the world of man and became emperor. Before Yao-Feng was defeated by Sunan and Bao, Zhehu was entrusted with the Key of Yao-Feng and escaped before the enemy drove his master back to Ogre Gate. Swallowing the key, he fled, but was ultimately captured and imprisoned beneath Red Mountain Villa, where the Five Immortals watch over him. There he awaits the opportunity to kill his captors and return with the key to Ogre Gate. Zhehu swallowed the key and keeps it in his stomach.`,
    text: `Zhehu, the Right Hand of Yao-Feng
Defenses: Hardiness 9, Evade 5, Parry 8, Stealth 7, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 1d10, Muscle: 4d10, Endurance: 2d10, Detect: 3d10
Max Wounds: 14
Equipment: Key of Yao-Feng
Reputation: Loyal-Cruel
Powers
Qi Immunity: All Ogre Demons have a natural immunity to Qi and Qi related powers. Zhehu has a resistance of 80% and Qi-based attacks have a flat 80% chance of failing against him.
Qi Disruption: Any Melee Attack from an Ogre Demon is potentially debilitating to Martial Heroes because it disrupts Qi and blood flow. If they score a total success on their Attack roll, then in addition to doing normal Damage, they temporarily drain an amount of Qi equal to the Wounds they inflict that round.
Mighty: All physical attacks by Zhehu roll Open Damage.
Weakness: Emerald. Any weapon made of Emerald can harm Zhehu.`
  },
  {
    id: "c9zhougui0000001",
    name: "Zhou Gui",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Zhou Gui is the proprietor of the Silk Tavern. A seemingly gentle and elegant man, Zhou Gui has a dark heart and exploits his position at the Silk Tavern to murder people and feed them to his guests. Zhou Gui is affable and friendly but deeply disturbed, delighting in tricking his clientele into eating human flesh. In conversation he can discuss a wide range of topics and has a particular interest in music. Chef Wu is Zhou Gui's right hand man and protector. Both share an interest in food and drink.`,
    text: `Zhou Gui
Defenses: Hardiness 7, Evade 6, Parry 6, Stealth 10, Wits 10, Resolve 7
Key Skills: Grapple: 1d10, Light Melee: 2d10, Speed: 3d10, Detect: 2d10, Persuade: 3d10, Deception: 2d10, Medicine: 2d10, Talent (Cooking): 3d10, Talent (Brewing): 2d10, Talent (Tea Preparation): 2d10, Talent (Horse Headed Fiddle): 3d10, Talent (Pipa): 3d10, Classics (All): 3d10, History (Era of the Demon Emperor): 1d10, History (Era of the Righteous Emperor): 1d10, History (Era of Great Emperor): 2d10, History (Era of the Compassionate Daughter): 2d10, Creatures (Demons): 2d10, Trade (Alchemy): 2d10
Max Wounds: 1
Expertise: Detect-Taste`
  },
  {
    id: "c9chefwu00000000",
    name: "Chef Wu",
    folderKey: "chapter9Named",
    sourceChapter: 9,
    sourceSection: "Non-Player Characters",
    biography: `Chef Wu is the head chef at the Silk Tavern and also serves as Zhou Gui's personal bodyguard and accomplice in murder. If Zhou Gui is disturbed, Chef Wu is positively crazed. While he gains no pleasure from tricking guests into eating human meat, he greatly enjoys butchering and killing. Chef Wu is incredibly focused on whatever task he happens to choose, but in a battle becomes a raging beast.`,
    text: `Chef Wu
Defenses: Hardiness 9, Evade 3, Parry 7, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 1d10, Heavy Melee: 3d10, Athletics: 1d10, Speed: 2d10, Muscle: 3d10, Endurance: 3d10, Meditation: 1d10, Detect: 3d10, Reasoning: 1d10, Command: 1d10, Talent (Cooking): 3d10, Institutions (Military): 2d10, Language (Hai'anese): 3d10, Languages (Li Fai and Daoyun): 1d10
Qi: 3
Max Wounds: 7
Weapons: Cleaver (4d10 Damage), Qiang (Heavy Spear)
Expertise: Detect-Taste
Combat Technique: Counter (Heavy Melee-Set-up)
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Breath of Fury, Clutch of the Hawk, Drift of the Butterfly Fish, Flaming Dragon, Flight of the Hawk, Iron Foot Stance, Iron Spirit, Lashing Dragon, Palm of the Dragon, Spear of the Infinite Emperor, Spear Swipe, Trapping Wind, Guiding the Crashing Wave (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "b40a2c37b5f9f2a1",
    name: "Bandit",
    text: `Bandit
Defenses: Hardiness 3, Evade 4, Parry 3, Stealth 8, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 1d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 1d10, Speed: 0d10, Muscle: 0d10
Max Wounds: 1
Weapons: Short Bow (2d10 Damage), Ox Tail Dao (2d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "c34f7e22aa15de90",
    name: "Disciple, Junior",
    text: `Disciple, Junior
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 1d10, Speed: 1d10, Muscle: 1d10
Max Wounds: 1
Weapons: Varies`
  },
  {
    id: "bbf59ab51d96b681",
    name: "Disciple, Standard",
    text: `Disciple, Standard
Defenses: Hardiness 5, Evade 4, Parry 5, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 1d10, Speed: 1d10, Muscle: 1d10
Qi: 1
Max Wounds: 3
Weapons: Varies
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blasting Blade, Calm of Sunan, Kidney Strike, Whirling Dodge (Counter)`
  },
  {
    id: "d8cb17fe08a9a134",
    name: "Kushen Soldiers",
    text: `Kushen Soldiers
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 0d10, Muscle: 0d10
Max Wounds: 1
Weapons: Kushen Sabre (1d10 Damage), Leather Lamellar (-1d10 Damage against blunt weapons), Composite Bow (3d10 Damage)`
  },
  {
    id: "e3f7fa1225fb6d41",
    name: "Underling",
    text: `Underling
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 0d10, Muscle: 0d10
Max Wounds: 1
Weapons: Qiang (2d10 Damage or 0d10 Damage), or Ox Tail Dao (2d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "f1a3460000000001",
    name: "Zun City Soldiers",
    text: `Zun City Soldiers
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 1d10, Small Ranged: 0d10, Speed: 1d10, Muscle: 0d10
Max Wounds: 1
Weapons: Qiang (2d10 Damage or 0d10 Damage), Leather Lamellar (-1d10 Damage against blunt weapons)`
  },
  {
    id: "f1a3460000000002",
    name: "Zun City Soldiers (Elite Squad)",
    text: `Zun City Soldiers (Elite Squad)
Defenses: Hardiness 5, Evade 3, Parry 5, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 1d10, Small Ranged: 0d10, Speed: 1d10 or 0d10 in Armor, Muscle: 1d10
Max Wounds: 1
Weapons: Qiang (3d10 Damage or 1d10 Damage), Iron Lamellar (-1d10 Damage against blunt and sharp weapons)`
  },
  {
    id: "f1a3460000000003",
    name: "Zun City Soldiers (The Black Dragons)",
    text: `Zun City Soldiers (The Black Dragons)
Defenses: Hardiness 6, Evade 3, Parry 5, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 1d10, Small Ranged: 1d10, Speed: 1d10 or 0d10 in Armor, Muscle: 2d10
Qi: 1
Max Wounds: 3
Weapons: Qiang (4d10 Damage or 2d10 Damage), Iron Lamellar (-1d10 Damage against blunt and sharp weapons)
Key Kung Fu Techniques (Waijia 3, Qinggong 1): Spear of the Infinite Emperor, Fierce Strike, Horizontal Sidestep (Counter)`
  },
  {
    id: "f1a3460000000004",
    name: "Zun Demon Master",
    text: `Zun Demon Master
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 9, Wits 8, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 1d10, Small Ranged: 1d10, Speed: 0d10, Muscle: 0d10, Ritual (Sun Demon Master Ritual): 3d10, Ritual (Zun Forest Shaping Ritual): 2d10, Ritual (Binding Demon): 1d10
Max Wounds: 1
Weapons: Stick (0d10 Damage, +1d10 Accuracy)`
  },
  {
    id: "f1a3470000000001",
    name: "Zun Warrior",
    text: `Zun Warrior
Defenses: Hardiness 5, Evade 5, Parry 5, Stealth 7, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 1d10, Speed: 1d10, Muscle: 1d10
Max Wounds: 1
Weapons: Ox Tail Dao (3d10 Damage, -1d10 Accuracy), Bow (2d10 Damage)`
  },
  {
    id: "f1a3470000000002",
    name: "Fearsome Master",
    text: `Fearsome Master
Defenses: Hardiness 6, Evade 5, Parry 9, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 2d10, Throw: 1d10, Arm Strike: 3d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 3d10 or 5d10 (Jian), Heavy Melee: 2d10, Small Ranged: 1d10, Meditation: 3d10, Medicine: 2d10, Speed: 2d10, Muscle: 2d10, Athletics: 2d10
Qi: 4
Max Wounds: 9
Weapons: Jian (3d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blasting Blade, Breath of Fury, Drift of the Butterfly Fish, Eight Divine Snakes, Flight of the Hawk, Hands of the Hawk Beak, White Flower Palm, Iron Spirit Reversal (Counter), Weapons Stride (Counter), Intercepting Arrow (Counter)`
  },
  {
    id: "f1a3470000000003",
    name: "Deadly Master",
    text: `Deadly Master
Defenses: Hardiness 8, Evade 3, Parry 6, Stealth 6, Wits 8, Resolve 8
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 3d10 or 4d10 (Stick), Medium Melee: 3d10 or 2d10 (Ox Tail), Heavy Melee: 2d10, Small Ranged: 2d10, Speed: 3d10, Muscle: 3d10, Meditation: 3d10, Athletics: 2d10, Divination: 1d10
Qi: 5
Max Wounds: 11
Weapons: Stick (3d10 Damage, +1d10 Accuracy), Ox Tail Dao (5d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Dog Bashing Stick, Mighty Paws of the Lion, Naga Palm, Reclining Stick Stance, Spearing Blade, Stick of the Rising Dog, Swan Taming Strike, Whirling Blade, Weapon Stride (Counter), Iron Body (Counter), Iron Spirit Reversal (Counter)`
  },
  {
    id: "f1a3470000000004",
    name: "Profound Master",
    text: `Profound Master
Defenses: Hardiness 6, Evade 6, Parry 9, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 3d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 3d10, Light Melee: 4d10 or 5d10 (Stick), Medium Melee: 4d10, Heavy Melee: 3d10, Small Ranged: 2d10, Speed: 3d10, Muscle: 3d10, Persuade: 3d10, Ritual (Activation): 2d10, Ritual (Binding Demon): 2d10, Meditation: 4d10, Divination: 3d10, Creatures (Demons): 3d10, Martial Disciplines (All): 2d10
Qi: 7
Max Wounds: 15
Weapons: Stick (3d10 Damage, +1d10 Accuracy), Meteor Hammer (7d10 Damage, -2d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Blast of the Dragon, Grudge Bearing Sword Strike, Knock of the Meteor Hammer, Majesty of the Lion, Path of the Dragon, Pounce of the Lion, Rage of One Thousand Grieving Widows, Skull Breaking Stick, Whirling Dodge (Counter), Deflecting Canopy (Counter), Iron Spirit Reversal (Counter)
Profound Techniques: Thundering Palm of the Heavens`
  },
  {
    id: "f1a3480000000001",
    name: "Society of Leather Shadows Agent",
    text: `Society of Leather Shadows Agent
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 9, Wits 7, Resolve 7
Key Skills: Arm Strike: 2d10, Leg Strike: 2d10, Grapple: 2d10, Throw: 1d10, Light Melee: 2d10, Medium Melee: 1d10, Talent (Shadow Puppetry): 4d10, Talent (Singing): 3d10, Talent (Suona Horn): 3d10, Muscle: 1d10, Detect: 3d10, Speed: 3d10
Qi Rank: 3
Wounds: 7
Expertise: Detect-Sight, Talent-Perform
Equipment: Horn of the Society of Leather Shadows
Key Kung Fu Techniques (Qinggong 3, Waijia 1): Flight of the Hawk, Flying Swan Kick, Graceful Retreat (Counter)`
  },
  {
    id: "f1a3480000000002",
    name: "Dehua Sect Initiate",
    text: `Dehua Sect Initiate
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 8, Resolve 6
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 1d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 1d10, Muscle: 1d10, Athletics: 1d10, Meditation: 1d10, Talent (Calligraphy): 1d10, Ritual (Ancestor Veneration): 1d10, History (All Eras): 1d10, Religion (Dehua): 1d10, Classics (All): 1d10
Qi: 0
Max Wounds: 1
Weapons: Jian (2d10 Damage, +2d10 Accuracy)`
  },
  {
    id: "f1a3480000000003",
    name: "Dehua Sect Priest",
    text: `Dehua Sect Priest
Defenses: Hardiness 3, Evade 3, Parry 5, Stealth 6, Wits 9, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 1d10, Athletics: 1d10, Meditation: 3d10, Talent (Calligraphy): 3d10, Ritual (Ancestor Veneration): 3d10, History (All Eras): 2d10, Religion (Dehua): 3d10, Classics (All): 3d10
Qi: 2
Max Wounds: 5
Weapons: Jian (2d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Calm of Sunan, Drift of the Butterfly Fish, Slashing Blade, Sword Stance`
  },
  {
    id: "f1a3480000000004",
    name: "Dehua Master",
    text: `Dehua Master
Defenses: Hardiness 3, Evade 3, Parry 6, Stealth 6, Wits 9, Resolve 6
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 2d10, Small Ranged: 0d10, Speed: 3d10, Muscle: 1d10, Athletics: 2d10, Meditation: 3d10, Talent (Calligraphy): 3d10, Ritual (Ancestor Veneration): 3d10, History (All Eras): 2d10, Religion (Dehua): 3d10, Classics (All): 3d10
Qi: 3
Max Wounds: 7
Weapons: Jian (2d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Bladder Strike, Blade Pinch, Blasting Blade, Calm of Sunan, Curing Palm, Deep Biting Blade, Double Thrust, Drift of the Butterfly Fish, Fierce Strike, Grasp of the Python, Hands of the Hawk Beak, Horizontal Sidestep, Kick of the Swan, Slashing Blade, Sword Stance, Three-Point Strike, Whirling Dodge`
  },
  {
    id: "f1a3480000000005",
    name: "Golden Dragon Sect Junior Disciple",
    text: `Golden Dragon Sect Junior Disciple
Defenses: Hardiness 4, Evade 4, Parry 4, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Arm Strike: 0d10, Throw: 0d10, Kick: 1d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Speed: 1d10, Muscle: 0d10, Endurance: 2d10, Medicine: 1d10, Meditation: 1d10, Detect: 0d10, Deception: 0d10, Persuade: 0d10, Languages (Li Fai): 2d10, Languages (Daoyun): 3d10, Languages (Haianese): 3d10, Read Script (Feishu): 3d10, Knowledge (Era of the Demon Emperor): 1d10, Knowledge (Era of the Righteous Emperor): 1d10, Institutions (Sects): 1d10
Max Wounds: 1
Weapons: Qiang (2d10 Damage), Ox Tail Dao (2d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "f1a3480000000006",
    name: "Golden Dragon Sect Senior Disciple",
    text: `Golden Dragon Sect Senior Disciple
Defenses: Hardiness 5, Evade 5, Parry 5, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 1d10, Throw: 1d10, Kick: 1d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 2d10, Speed: 1d10, Muscle: 2d10, Endurance: 2d10, Medicine: 1d10, Meditation: 2d10, Detect: 2d10, Deception: 2d10, Persuade: 1d10, Languages (Li Fai): 2d10, Languages (Daoyun): 3d10, Languages (Haianese): 3d10, Read Script (Feishu): 3d10, Knowledge (Era of the Demon Emperor): 2d10, Knowledge (Era of the Righteous Emperor): 2d10, Institutions (Sects): 2d10, Creatures (Demons): 1d10
Qi: 2
Max Wounds: 5
Weapons: Qiang (4d10 Damage), Ox Tail Dao (4d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Blasting Blade, Spear Swipe, Fierce Strike, Spinning Back Kick (Counter)`
  },
  {
    id: "f1a3480000000007",
    name: "Golden Dragon Sect Master",
    text: `Golden Dragon Sect Master
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 7, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Arm Strike: 1d10, Throw: 1d10, Kick: 1d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 2d10, Speed: 1d10, Muscle: 2d10, Endurance: 2d10, Medicine: 1d10, Meditation: 3d10, Detect: 3d10, Deception: 3d10, Persuade: 2d10, Languages (Li Fai): 2d10, Languages (Daoyun): 3d10, Languages (Haianese): 3d10, Read Script (Feishu): 3d10, Knowledge (Era of the Demon Emperor): 1d10, Knowledge (Era of the Righteous Emperor): 3d10, Institutions (Sects): 3d10, Creatures (Demons): 2d10
Qi: 3
Max Wounds: 7
Weapons: Qiang (4d10 Damage), Ox Tail Dao (4d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Blasting Blade, Drift of the Butterfly Fish, Fierce Strike, Inverted Three-Point Strike, Lashing Dragon, Spear Swipe, Spinning Back Kick (Counter)`
  },
  {
    id: "f1a3480000000008",
    name: "Mount Haian Junior Disciple",
    text: `Mount Haian Junior Disciple
Defenses: Hardiness 3, Evade 4, Parry 4, Stealth 6, Wits 6, Resolve 6
Key Skills: Arm Strike: 1d10, Leg Strike: 1d10, Grapple: 0d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 1d10, Speed: 0d10, Muscle: 0d10, Detect: 1d10
Max Wounds: 1
Weapons: Unarmed (0d10 Damage)
Combat Technique: Fists of Steel`
  },
  {
    id: "f1a3480000000009",
    name: "Mount Haian Senior Disciple",
    text: `Mount Haian Senior Disciple
Defenses: Hardiness 6, Evade 5, Parry 5, Stealth 6, Wits 7, Resolve 8
Key Skills: Arm Strike: 2d10, Leg Strike: 2d10, Grapple: 2d10, Throw: 2d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 1d10, Speed: 1d10, Muscle: 2d10, Endurance: 1d10, Command: 2d10, Detect: 2d10
Qi: 2
Max Wounds: 3
Weapons: Unarmed (2d10 Damage)
Combat Technique: Fists of Steel
Techniques (Waijia 2, Neigong 2): Finger Flick, Iron Spirit, Restoring Palm, Ringing Strike of the Hand, Stone Shattering Finger, Deflecting Canopy (Counter), Spinning Back Kick (Counter)`
  },
  {
    id: "f1a3480000000010",
    name: "Nun of Heiping",
    text: `Nun of Heiping
Defenses: Hardiness 3, Evade 3, Parry 4, Stealth 7, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 1d10, Muscle: 0d10, Religion (Dehua): 1d10, Ritual (Ancestor Veneration): 1d10, Creatures (Demons): 1d10, Creatures (Spirits): 1d10
Max Wounds: 1
Weapons: Jian (1d10 Damage, +2d10 Accuracy)`
  },
  {
    id: "f1a3480000000011",
    name: "Abbess of Heiping",
    text: `Abbess of Heiping
Defenses: Hardiness 4, Evade 5, Parry 6, Stealth 7, Wits 7, Resolve 9
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 0d10, Athletics: 2d10, Religion/Gods (Dehua): 2d10, Meditation: 2d10, Divination: 1d10, Ritual (Ancestor Veneration): 2d10, Classics (Rites of Wan Mei): 1d10, Classics (Sayings of Kong Zhi): 2d10, Creatures (Demons): 2d10, Creatures (Spirits): 2d10
Qi: 2
Max Wounds: 5
Weapons: Unarmed (0d10 Damage), Jian (1d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Clutch of the Hawk, Double Thrust, Kick of the Swan, Leap of the Swan, Ringing Strike of the Divine Ram, Ringing Strike of the Hand, Slashing Blade, Stone Shattering Finger, Graceful Retreat (Counter), Grasp of the Python (Counter)`
  },
  {
    id: "f1a3480000000012",
    name: "Majestic Lion Cub",
    text: `Majestic Lion Cub
Defenses: Hardiness 4, Evade 4, Parry 4, Stealth 7, Wits 6, Resolve 6
Key Skills: Arm Strike: 1d10, Leg Strike: 1d10, Grapple: 1d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 1d10, Athletics: 0d10, Speed: 0d10, Muscle: 1d10, Endurance: 1d10, Religion/Gods (Majestic Lion Cult): 1d10
Max Wounds: 1
Weapons: Unarmed (0d10 Damage), Bow (2d10 Damage)`
  },
  {
    id: "f1a3480000000013",
    name: "Majestic Lion General",
    text: `Majestic Lion General
Defenses: Hardiness 6, Evade 5, Parry 5, Stealth 7, Wits 6, Resolve 8
Key Skills: Arm Strike: 2d10, Leg Strike: 2d10, Grapple: 2d10, Throw: 1d10, Light Melee: 0d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 1d10, Athletics: 1d10, Speed: 1d10, Muscle: 2d10, Endurance: 1d10, Religion/Gods (Majestic Lion Cult): 2d10, Command: 2d10, Detect: 2d10, Meditation: 1d10
Qi: 2
Max Wounds: 5
Weapons: Unarmed (2d10 Damage), Kushen Sabre (3d10 Damage)
Combat Technique: Fists of Steel
Key Kung Fu Techniques (Waijia 2, Neigong 2): Breath of Fury, Fierce Strike, Gaze of the Lion, Iron Spirit, Kick of the Golden Elephant, Roar of the Lion, Spinning Back Kick (Counter), Iron Spirit Reversal (Counter)`
  },
  {
    id: "f1a3480000000014",
    name: "Majestic Lion Nun",
    text: `Majestic Lion Nun
Defenses: Hardiness 3, Evade 5, Parry 6, Stealth 9, Wits 7, Resolve 7
Key Skills: Arm Strike: 3d10, Leg Strike: 3d10, Grapple: 2d10, Throw: 0d10, Light Melee: 2d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 3d10, Speed: 3d10, Muscle: 1d10, Endurance: 2d10, Detect: 3d10, Persuade: 2d10, Empathy: 1d10, Religion/Gods (Majestic Lion Cult): 3d10, Places (Kushen Basin): 3d10, Meditation: 3d10, Language (Khubsi): 3d10, Language (Daoyun): 3d10, Read Script (Feishu): 3d10, Read Script (Yoshaic): 3d10
Qi: 3
Max Wounds: 7
Weapons: Unarmed (1d10 Damage), Daggers (1d10 Damage), Divine Powder (3d10 Open Damage)
Combat Technique: Fists of Steel
Techniques (Waijia 1, Qinggong 2, Neigong 1): Crawling Tiger, Deflecting Canopy, Fierce Strike, Fluttering Kicks, Gaze of the Lion, Hands of the Hawk Beak, Kick of the Swan, Lion At Rest Stance, Pounce of the Lion, Stealth of the Spider Demon, Storming Daggers, Swift Pounce of the Cheetah, Graceful Retreat, Grasp of the Python (Counter), Spinning Back Kick (Counter)`
  },
  {
    id: "f1a3480000000015",
    name: "Mystic Sword Junior Disciple",
    text: `Mystic Sword Junior Disciple
Defenses: Hardiness 5, Evade 3, Parry 5, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 1d10, Muscle: 1d10, Detect: 1d10, Medicine: 1d10
Max Wounds: 1
Weapons: Ox Tail Dao (3d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "f1a3480000000016",
    name: "Mystic Sword Senior Disciple",
    text: `Mystic Sword Senior Disciple
Defenses: Hardiness 5, Evade 3, Parry 6, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 1d10, Muscle: 1d10, Detect: 1d10, Medicine: 1d10
Qi: 2
Max Wounds: 5
Weapons: Ox Tail Dao (3d10 Damage)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Slashing Blade, Whirling Dodge (Counter)`
  },
  {
    id: "f1a3480000000017",
    name: "Mystic Sword Flying Phantom",
    text: `Mystic Sword Flying Phantom
Defenses: Hardiness 5, Evade 3, Parry 6, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 1d10, Detect: 1d10, Medicine: 1d10
Qi: 3
Max Wounds: 7
Weapons: Ox Tail Dao (3d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Flight of the Hawk, Slashing Blade, Slicing Blade of the Flying Phantoms, Whirling Dodge (Counter), Graceful Retreat (Counter)`
  },
  {
    id: "f1a3480000000018",
    name: "Mystic Sword Flying Phantom Leader",
    text: `Mystic Sword Flying Phantom Leader
Defenses: Hardiness 5, Evade 3, Parry 7, Stealth 6, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 3d10, Muscle: 2d10, Detect: 2d10, Medicine: 1d10
Qi: 4
Max Wounds: 9
Weapons: Ox Tail Dao (4d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Blasting Blade, Blade Pinch, Clashing Blade, Flight of the Hawk, Slicing Blade of the Flying Phantoms, Swan Taming Strike, Sword Whipping Strike, Graceful Retreat (Counter), Whirling Dodge (Counter)`
  },
  {
    id: "f1a3480000000019",
    name: "Nature Loving Monk Junior Monk",
    text: `Nature Loving Monk Junior Monk
Defenses: Hardiness 4, Evade 4, Parry 3, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Throw: 0d10, Arm Strike: 0d10, Leg Strike: 1d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Athletics: 1d10, Speed: 1d10, Muscle: 1d10, Endurance: 3d10, Meditation: 3d10, Detect: 2d10, Command: 1d10, Survival (Wilderness): 1d10
Max Wounds: 1
Weapons: Stick (1d10 Damage, +1d10 Accuracy), Wood Staff (1d10 Damage, +2d10 Accuracy)`
  },
  {
    id: "f1a3480000000020",
    name: "Nature Loving Monk Senior Monk",
    text: `Nature Loving Monk Senior Monk
Defenses: Hardiness 8, Evade 4, Parry 7, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 1d10, Heavy Melee: 3d10, Athletics: 1d10, Speed: 2d10, Muscle: 3d10, Endurance: 3d10, Meditation: 3d10, Detect: 2d10, Command: 1d10, Survival (Wilderness): 3d10
Qi: 3
Max Wounds: 7
Weapons: Stick (2d10 Damage, +1d10 Accuracy), Wood Staff (3d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 2): Blast of the Dragon, Breath of Fury, Clutch of the Hawk, Dog Bashing Stick, Dog Lifting Stick, Flaming Dragon, Reclining Stick Stance, Whirling Dodge (Counter), Horizontal Sidestep (Counter)`
  },
  {
    id: "f1a3480000000021",
    name: "Perfect Heaven Lineage Priest or Nun",
    text: `Perfect Heaven Lineage Priest or Nun
Defenses: Hardiness 5, Evade 4, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 0d10, Throw: 0d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 1d10, Athletics: 2d10, Muscle: 1d10, Speed: 2d10, Endurance: 1d10, Meditation: 2d10, Ritual (Demon Binding): 1d10, Ritual (Spirit Keeping): 2d10, Ritual (Celestial Spirit Ritual): 2d10, Religion (Yen-Li): 3d10, Places (Haian): 3d10, History (Era of the Righteous Emperor): 2d10, Medicine: 2d10
Qi: 2
Max Wounds: 5
Weapons: Unarmed (0d10 Damage), Jian (2d10 Damage, +2d10 Accuracy)
Techniques (Waijia 2, Qinggong 1, Dianxue 1): Blasting Blade, Drift of the Butterfly Fish, Four-Point Touch, Phoenix Star Strike, Slashing Blade, White Flower Palm, Whirling Dodge (Counter)`
  },
  {
    id: "f1a3480000000022",
    name: "Junior Purple Cavern Sect Disciple",
    text: `Junior Purple Cavern Sect Disciple
Defenses: Hardiness 6, Evade 4, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 1d10, Medium Melee: 1d10, Heavy Melee: 1d10, Athletics: 1d10, Speed: 1d10, Muscle: 0d10, Endurance: 1d10, Meditation: 1d10, Medicine: 3d10, Talent (Poison): 1d10, Detect: 1d10, Command: 1d10
Qi: 1
Max Wounds: 3
Weapons: Qiang (2d10 Damage)
Combat Technique: Deflect (Medium and Light Melee)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Breath of the Lotus Petal, Nine Divine Snakes, Palm of the Dragon, Plum Blossom Palm, Spear of the Infinite Emperor, Sword Stance`
  },
  {
    id: "f1a3480000000023",
    name: "Senior Purple Cavern Sect Disciple",
    text: `Senior Purple Cavern Sect Disciple
Defenses: Hardiness 6, Evade 4, Parry 7, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 1d10, Medium Melee: 2d10, Heavy Melee: 2d10, Athletics: 1d10, Speed: 2d10, Muscle: 1d10, Endurance: 1d10, Meditation: 2d10, Medicine: 2d10, Talent (Poison): 2d10, Detect: 2d10, Command: 2d10
Qi: 2
Max Wounds: 5
Weapons: Spear and Jian (2d10 Damage)
Combat Technique: Deflect (Medium and Light Melee)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Breath of the Lotus Petal, Drift of the Butterfly Fish, Nine Divine Snakes, Palm of the Dragon, Plum Blossom Palm, Spear of the Infinite Emperor, Sword Stance`
  },
  {
    id: "f1a3480000000024",
    name: "Purple Cavern Junior Sifu",
    text: `Purple Cavern Junior Sifu
Defenses: Hardiness 7, Evade 4, Parry 8, Stealth 6, Wits 7, Resolve 7
Key Skills: Grapple: 2d10, Throw: 2d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 2d10, Small Ranged: 1d10, Athletics: 2d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Meditation: 3d10, Medicine: 3d10, Talent (Poison): 3d10, Detect: 3d10, Command: 3d10
Qi: 4
Max Wounds: 9
Weapons: Jian (3d10 Damage, +2d10 Accuracy)
Combat Technique: Deflect (Medium and Light Melee)
Key Kung Fu Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Blast of the Dragon, Breath of the Lotus Petal, Drift of the Butterfly Fish, Flaming Dragon, Inverted Three-Point Strike, Naga Palm, Nine Divine Snakes, Palm of the Dragon, Plum Blossom Palm, Rising Dragon Stance, Spear of the Infinite Emperor, Sword Stance, Three-Point Strike`
  },
  {
    id: "f1a3480000000025",
    name: "Red Claw Underling",
    text: `Red Claw Underling
Defenses: Hardiness 4, Evade 3, Parry 4, Stealth 6, Wits 6, Resolve 6
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 0d10, Muscle: 1d10
Max Wounds: 1
Weapons: Wooden Staff (1d10 Damage), Qiang (3d10 Damage), Ox Tail Dao (3d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "f1a3480000000026",
    name: "Southern River Private",
    text: `Southern River Private
Defenses: Hardiness 4, Evade 3, Parry 4, Stealth 7, Wits 6, Resolve 6
Key Skills: Arm Strike: 0d10, Leg Strike: 0d10, Grapple: 0d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 1d10, Athletics: 0d10, Speed: 0d10, Swim: 1d10, Muscle: 1d10, Endurance: 1d10, Detect: 1d10
Max Wounds: 1
Weapons: Spear (2d10 Damage), Bow (2d10 Damage), Ox Tail Dao (2d10 Damage, -1d10 Accuracy)`
  },
  {
    id: "f1a3480000000027",
    name: "Southern River Sergeant",
    text: `Southern River Sergeant
Defenses: Hardiness 5, Evade 3, Parry 4, Stealth 8, Wits 6, Resolve 7
Key Skills: Arm Strike: 1d10, Leg Strike: 1d10, Grapple: 0d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 1d10, Heavy Melee: 1d10, Small Ranged: 1d10, Athletics: 1d10, Speed: 0d10, Swim: 2d10, Sail (Junks): 2d10, Muscle: 1d10, Endurance: 1d10, Detect: 1d10, Command: 2d10, Survival (Wilderness): 2d10
Qi: 1
Max Wounds: 3
Weapons: Spear (2d10 Damage), Bow (2d10 Damage), Ox Tail Dao (2d10 Damage, -1d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Dianxue 1): Leap of the Swan, Spear of the Infinite Emperor, Storm of Arrows, Triple Yang Strike`
  },
  {
    id: "f1a3480000000028",
    name: "Sun Mai Monk of the First Rank",
    text: `Sun Mai Monk of the First Rank
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 1d10, Endurance: 1d10, Meditation: 1d10, Athletics: 2d10, Classics (Scripture of Sun Mai): 1d10, Religion/Gods (Qi Zhao): 1d10, Religion/Gods (Cult of Hen-Shi): 1d10, Martial Discipline (Neigong): 1d10, Martial Discipline (Waijia): 1d10
Max Wounds: 1
Weapons: Unarmed (0d10 Damage), Wooden Gun Staff (1d10 Damage)`
  },
  {
    id: "f1a3480000000029",
    name: "Sun Mai Monk of the Third Rank",
    text: `Sun Mai Monk of the Third Rank
Defenses: Hardiness 5, Evade 4, Parry 5, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 0d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 0d10, Speed: 2d10, Muscle: 2d10, Endurance: 3d10, Meditation: 3d10, Athletics: 2d10, Classics (Scripture of Sun Mai): 2d10, Religion/Gods (Qi Zhao): 2d10, Religion/Gods (Cult of Hen-Shi): 2d10, Martial Discipline (Neigong): 2d10, Martial Discipline (Waijia): 2d10
Qi: 2
Max Wounds: 5
Weapons: Unarmed (2d10 Damage), Wooden Gun Staff (2d10 Damage)
Combat Technique: Fists of Steel
Techniques (Waijia 1, Qinggong 1, Neigong 1, Dianxue 1): Breath of the Lotus Petal, Guiding the Crashing Wave, Kick of the Golden Elephant, Tai Lan's Staff Strike, Triple Yang Strike, Iron Body (Counter), Grasp of the Python (Counter)`
  },
  {
    id: "f1a3480000000030",
    name: "Nine Suns Disciple",
    text: `Nine Suns Disciple
Defenses: Hardiness 3, Evade 3, Parry 6, Stealth 6, Wits 6, Resolve 6
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 2d10, Throw: 1d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 0d10, Athletics: 2d10, Speed: 0d10, Muscle: 1d10, Endurance: 3d10, Meditation: 1d10, Talent (Singing): 2d10
Qi: 1
Max Wounds: 3
Weapons: Unarmed (1d10 Damage)
Combat Technique: Fists of Steel
Key Kung Fu Techniques (Waijia 1, Neigong 2, Dianxue 1): Clutch of the Hawk, Kidney Strike, Trapping Wind, Iron Body (Counter), Guiding the Crashing Wave (Counter)`
  },
  {
    id: "f1a3480000000031",
    name: "Tree-Dwelling Nun Initiate",
    text: `Tree-Dwelling Nun Initiate
Defenses: Hardiness 3, Evade 3, Parry 3, Stealth 7, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 1d10, Athletics: 1d10, Speed: 0d10, Muscle: 0d10, Survival (Wilderness): 2d10
Qi: 0
Max Wounds: 1
Weapons: Net (0d10 Damage), Butterfly Swords (1d10 Damage)`
  },
  {
    id: "f1a3480000000032",
    name: "Tree-Dwelling Nun Monk",
    text: `Tree-Dwelling Nun Monk
Defenses: Hardiness 3, Evade 3, Parry 4, Stealth 7, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 0d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Heavy Melee: 0d10, Small Ranged: 1d10, Athletics: 1d10, Speed: 0d10, Muscle: 0d10, Trade (Wood): 2d10, Survival (Wilderness): 2d10, Divination: 1d10
Qi: 1
Max Wounds: 3
Weapons: Net (0d10 Damage), Dragon Longpole (0d10 Damage)
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Breath of the Lotus Petal, Finger Flick, Spear of the Infinite Emperor, Tree Bounding Stride, Tree Bounding Strike, Graceful Retreat`
  },
  {
    id: "f1a3480000000033",
    name: "Tree-Dwelling Nun Junior Disciple",
    text: `Tree-Dwelling Nun Junior Disciple
Defenses: Hardiness 3, Evade 5, Parry 5, Stealth 7, Wits 6, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 1d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 1d10, Small Ranged: 1d10, Athletics: 3d10, Speed: 2d10, Muscle: 2d10, Trade (Wood): 3d10, Survival (Wilderness): 3d10, Survival (Mountains): 1d10, Religion (Yen-Li): 1d10, Religion (Qi Zhao): 1d10
Qi: 2
Max Wounds: 5
Weapons: Net (0d10 Damage), Qiang (4d10 Damage), Daggers (2d10 Damage)
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Breath of the Lotus Petal, Finger Flick, Spear of the Infinite Emperor, Storming Daggers, Tree Bounding Stride, Tree Bounding Strike, Graceful Retreat (Counter)`
  },
  {
    id: "f1a3480000000034",
    name: "Tree-Dwelling Nun Senior Disciple",
    text: `Tree-Dwelling Nun Senior Disciple
Defenses: Hardiness 3, Evade 5, Parry 7, Stealth 7, Wits 6, Resolve 7
Key Skills: Grapple: 1d10, Throw: 1d10, Arm Strike: 2d10, Leg Strike: 1d10, Light Melee: 3d10, Medium Melee: 2d10, Heavy Melee: 1d10, Small Ranged: 2d10, Athletics: 3d10, Speed: 2d10, Muscle: 2d10, Divination: 1d10, Ritual (Spirit Keeping): 1d10, Trade (Wood): 3d10, Survival (Wilderness): 3d10, Survival (Mountains): 2d10, Religion (Yen-Li): 2d10, Religion (Qi Zhao): 2d10, Creatures (Spirits): 1d10
Qi: 4
Max Wounds: 9
Weapons: Net (0d10 Damage), Qiang (4d10 Damage), Butterfly Swords (3d10 Damage, +1d10 Accuracy), Daggers (2d10 Damage)
Key Kung Fu Techniques (Waijia 1, Qinggong 2, Neigong 1): Blazing Net, Breath of the Lotus Petal, Fierce Strike, Finger Flick, Spear of the Infinite Emperor, Storming Daggers, Tree Bounding Stride, Tree Bounding Strike, Whirling Dodge (Counter), Graceful Retreat (Counter)`
  },
  {
    id: "f1a3480000000035",
    name: "Zhaoze Junior Disciple",
    text: `Zhaoze Junior Disciple
Defenses: Hardiness 4, Evade 4, Parry 4, Stealth 6, Wits 6, Resolve 7
Key Skills: Grapple: 0d10, Throw: 1d10, Arm Strike: 1d10, Leg Strike: 0d10, Light Melee: 0d10, Medium Melee: 0d10, Athletics: 1d10, Speed: 1d10, Muscle: 0d10, Endurance: 2d10, Detect: 1d10, Command: 1d10, Talent (Any music except Singing): 1d10
Qi: 1
Max Wounds: 3
Weapons: Unarmed (0d10 Damage), Needles (0d10 Damage)
Combat Technique: Deflect (Medium and Light Melee)
Key Kung Fu Techniques (Waijia 1, Neigong 1, Dianxue 3): Cherry Blossom Palm, Gallbladder Strike, Storming Needles`
  },
  {
    id: "f1a3480000000036",
    name: "Zhe Valley Master Junior Disciple",
    text: `Zhe Valley Master Junior Disciple
Defenses: Hardiness 3, Evade 3, Parry 4, Stealth 7, Wits 7, Resolve 6
Key Skills: Arm Strike: 0d10, Leg Strike: 0d10, Grapple: 1d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 1d10, Heavy Melee: 0d10, Small Ranged: 1d10, Athletics: 2d10, Speed: 1d10, Muscle: 0d10, Endurance: 0d10, Creatures (Animals): 2d10, Talent (Poetry): 1d10, Talent (Painting): 1d10, Survival (Wilderness): 2d10
Max Wounds: 1
Weapons: Short Bow (2d10 Damage), Jian (1d10 Damage, +2d10 Accuracy)`
  },
  {
    id: "f1a3480000000037",
    name: "Zhe Valley Master Senior Disciple",
    text: `Zhe Valley Master Senior Disciple
Defenses: Hardiness 4, Evade 6, Parry 6, Stealth 8, Wits 7, Resolve 7
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 2d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 3d10, Athletics: 2d10, Speed: 1d10, Muscle: 1d10, Endurance: 2d10, Creatures (Animals): 3d10, Talent (Poetry): 2d10, Talent (Painting): 2d10, Survival (Wilderness): 2d10, Trade (Wood): 1d10, Command: 2d10, Detect: 2d10
Qi: 3
Max Wounds: 7
Weapons: Short Bow (2d10 Damage), Jian (2d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Neigong 1, Qinggong 1): Blasting Blade, Breath of Fury, Drift of the Butterfly Fish, Flight of the Hawk, Hands of the Hawk Beak, Rain of Arrows, Storm of Arrows, Intercepting Arrow (Counter)`
  },
  {
    id: "f1a3480000000038",
    name: "Zhe Valley Master Scholar",
    text: `Zhe Valley Master Scholar
Defenses: Hardiness 4, Evade 6, Parry 7, Stealth 8, Wits 8, Resolve 7
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 2d10, Throw: 0d10, Light Melee: 0d10, Medium Melee: 2d10, Heavy Melee: 0d10, Small Ranged: 3d10, Athletics: 2d10, Speed: 3d10, Muscle: 2d10, Endurance: 2d10, Creatures (Animals): 3d10, Talent (Poetry): 3d10, Talent (Painting): 3d10, Survival (Wilderness): 2d10, Trade (Wood): 2d10, Command: 2d10, Detect: 2d10
Qi: 4
Max Wounds: 9
Weapons: Short Bow (2d10 Damage), Jian (3d10 Damage, +2d10 Accuracy)
Key Kung Fu Techniques (Waijia 2, Neigong 1, Qinggong 1): Blasting Blade, Breath of Fury, Drift of the Butterfly Fish, Flight of the Hawk, Hands of the Hawk Beak, Rain of Arrows, Storm of Arrows, Zhe Valley Blade, Zhe Valley Fist, Intercepting Arrow (Counter)`
  },
  {
    id: "f2b5500000000001",
    name: "Water Monkeys",
    folderKey: "monsters",
    type: "monster",
    text: `Water Monkeys
These terrible creatures live in the south, usually in swamps but also in rivers or lakes. They look like monkeys with dense, swamp drenched fur, and a hard shell on their backs. Their claws are sharp and can infect people with Blood Fire. They like to pull prey below the water, drown them and drink their blood. Water Monkeys have a debilitating odor that is often the first sign of their presence.
Defenses: Hardiness 7, Evade 6, Parry 7, Stealth 9, Wits 5, Resolve 6
Key Skills: Bite: 2d10, Claws: 3d10 (2d10 Damage plus Blood Fire), Muscle: 3d10, Speed: 3d10, Swim: 4d10
Max Wounds: 5
Powers
Stench: Everyone within 30 feet of a Water Monkey must make an Endurance TN 7 roll or vomit and take -1d10 to all skill rolls for as long as they are in its presence and for 2 rounds thereafter.
Drowning Clutch: On a Total Success with their bite or claw, the Water Monkey can drag a person beneath the water. Escape requires two consecutive successful opposed muscle rolls. Killing the Water Monkey will also release the victim. This initiates the Drowning Rules.
Blood Fire: Anyone struck by the claw of a Water Monkey is exposed to Blood Fire Disease.`
  },
  {
    id: "f2b5500000000002",
    name: "Fei Beast",
    folderKey: "monsters",
    type: "monster",
    text: `Fei Beast
This creature's hooves cause plants and grass to wither. Even water turns to mist as it passes by. Fei Beasts resemble oxen with a white coat, a tail like a snake, and one eye.
Defenses: Hardiness 8, Evade 5, Parry 8, Stealth 6, Wits 4, Resolve 6
Key Skills: Gore: 2d10 (Open Damage 3d10, plus Qi drain), Speed: 3d10, Muscle: 3d10, Detect: 0d10
Max Wounds: 2
Powers
Beast Strength (x4): Fei Beasts are incredibly strong and have Beast Strength x4.
Gore: Anyone gored by a Fei Beast suffers 3d10 Open Damage and feels their Qi energy pour into the creature. Each Wound inflicted drains 1 Qi that returns at a rate of 1 per month.
Deathly Passage: Merely passing through an area kills all plant life, insects, and so forth.`
  },
  {
    id: "f2b5500000000003",
    name: "Fire Glutton",
    folderKey: "monsters",
    type: "monster",
    text: `Fire Glutton
Fire Gluttons are flame-breathing beasts that enjoy the taste of cooked human meat. These creatures are easily mistaken for large wild cats or even dogs, because they tend to move on all fours. However, they can walk erect like men or apes.
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 7, Wits 4, Resolve 5
Key Skills: Bite: 2d10 (Damage 2d10), Fire Breath: 2d10 (Fire Damage 4d10), Speed: 2d10, Muscle: 2d10, Detect: 2d10
Max Wounds: 3
Powers
Fire Breath: Fire Gluttons can breathe a stream of flame and lash it around, striking at anyone in a 20-foot arc before them. If they succeed Targets take 4d10 Fire Damage. On a Total Success Targets catch on fire.`
  },
  {
    id: "f2b5500000000004",
    name: "Golden Guardian",
    folderKey: "monsters",
    type: "monster",
    text: `Golden Guardian
These are large stone statues of stylized lions that stand watch over an area. They are made of stone and gold. Golden Guardians stand motionless until awakened. Each lion guards over some relic, manual, or other fragment of Ogre Gate.
Defenses: Hardiness 9, Evade 4, Parry 5, Stealth 6, Wits 6, Resolve 10
Key Skills: Bite: 3d10 (Damage 6d10), Claw: 4d10 (Damage 5d10), Speed: 3d10, Muscle: 5d10, Endurance: 6d10, Detect: 3d10
Max Wounds: 5
Powers
Pounce: When a Golden Guardian has surprise it does one Extra Wounds on its Damage roll.
Resolute: Golden Guardians are resolute and unwavering, having a 10 Resolve.
Beast Strength (x2): Golden Guardians are strong and their base lift is doubled. They also can exceed capping limits on Damage rolls for physical Attacks.
Stone Body: Because they are made from metal and stone, Golden Guardians are immune to most mundane bodily vulnerabilities.`
  },
  {
    id: "f2b5500000000005",
    name: "E Gui (Hungry Ghost)",
    folderKey: "monsters",
    type: "monster",
    text: `E Gui (Hungry Ghost)
These are ghosts who usually appear during the first ten days of summer. They have green skin, small mouths and large bellies but can briefly appear as normal people. Hungry Ghosts eat everything they can but are never satisfied.
Defenses: Hardiness 10, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 3
Key Skills: Grapple: 1d10, Speed: 2d10, Muscle: 2d10, Detect: 2d10
Max Wounds: 8
Powers
Disease Breath: E Gui can exhale to produce a cloud of Malignant Wind Disease. Roll 3d10 against Evade to see if people are exposed.
Fire Breath: Some E Gui can also breathe fire. Roll 1d10 against Evade. The fire breath of an E Gui does 3d10 Fire Damage.
Hunger: Hungry Ghosts are easily redirected by offerings of food. They generally will not attack if food is offered.`
  },
  {
    id: "f2b5500000000006",
    name: "Shui Gui (Water Ghost)",
    folderKey: "monsters",
    type: "monster",
    text: `Shui Gui (Water Ghost)
These are water spirits of people who drowned. They must remain in the place where they were killed. Shui Gui pull victims below the water and suffocate them, taking over their bodies when they succeed.
Defenses: Hardiness 10, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 6
Key Skills: Grapple: 1d10, Speed: 6d10, Muscle: 4d10, Detect: 2d10
Max Wounds: 10
Powers
Suffocate and Possess: When a Shui Gui attacks it pulls people under using its Grapple Skill. The normal rules of suffocation come into play and the Shui Gui takes over the person's body if it succeeds.
Immunities: Shui Gui can only be harmed by weapons fashioned from plum tree wood.`
  },
  {
    id: "f2b5500000000007",
    name: "Jiangshi",
    folderKey: "monsters",
    type: "monster",
    text: `Jiangshi
Jiangshi are dead bodies animated by a desire for proper burial and by the hunger to consume Qi energy. Their bodies are stiff from rigor mortis and they hop to reach their victims.
Defenses: Hardiness 8, Evade 3, Parry 3, Stealth 6, Wits 3, Resolve 10
Key Skills: Bite and Claw: 1d10, Speed: 0d10, Detect: 1d10
Max Wounds: 8
Powers
Bite: The bite of the Jiangshi does 2d10 Damage. Once they bite, they begin to drain Qi energy from the body.
Drain Qi: Upon biting a victim, the Jiangshi begins to drain Qi from the body, drawing energy into itself by latching onto the target. This drains 1 point of Qi each round. Qi returns at a rate of 1 per week.
Immunities: Jiangshi are immune to normal Attacks. They take Damage only from fire and energy Attacks.`
  },
  {
    id: "f2b5500000000008",
    name: "Jufu",
    folderKey: "monsters",
    type: "monster",
    text: `Jufu
Jufu are stubborn animals drawn to Numinous Mushrooms where they nest and stand watch over them. They attack anyone who approaches a Numinous Mushroom by throwing stones at them. They look like small apes with yellow fur and black stripes or spots.
Defenses: Hardiness 4, Evade 8, Parry 5, Stealth 7, Wits 3, Resolve 8
Key Skills: Bite: 1d10 (Damage 2d10), Light Melee (stones): 2d10, Grapple: 0d10, Arm Strike: 0d10 (Damage 1d10), Speed: 3d10, Muscle: 1d10, Detect: 3d10, Athletics: 4d10
Max Wounds: 2
Powers
Stone Throw: Jufu can swiftly throw three stones for 1d10 each. These can be targeted at one or more characters.`
  },
  {
    id: "f2b5500000000009",
    name: "Kui Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Kui Demon
Kui Demons have one leg, enjoy music, and are skilled craftsmen. They use tricks and traps to lead victims to their deaths, and their kicks are especially dangerous.
Defenses: Hardiness 8, Evade 5, Parry 4, Stealth 9, Wits 7, Resolve 6
Key Skills: Leg Strike: 2d10 (Damage 1d10 plus one Extra Wound), Speed: 0d10, Detect: 2d10, Muscle: 1d10, Deception: 2d10, Reason: 2d10, Language (Any): 3d10, Trade (Mechanical): 3d10, Trade (Wood): 3d10, Survival (Wilderness and Mountain): 3d10
Max Wounds: 4
Powers
Kick: A Kui Demon's kick does 1d10 Damage plus one Extra Wound.`
  },
  {
    id: "f2b5500000000010",
    name: "Leather Shadow Puppets",
    folderKey: "monsters",
    type: "monster",
    text: `Leather Shadow Puppets
These animated leather puppets are shaped as warriors, animals, and mythic figures. They are strongest when they can reach and manipulate a target's shadow.
Defenses: Hardiness 3, Evade 10, Parry 8, Stealth 10, Wits 7, Resolve 7
Key Skills: Arm Strike: 2d10, Leg Strike: 1d10, Grapple: 2d10, Throw: 1d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 1d10, Muscle: 0d10, Speed: 3d10, Detect: 1d10
Max Wounds: 2
Powers
Attack Shadow: A Leather Shadow Puppet can attack a target's shadow instead of the target directly.
Paralyze: A successful shadow attack can paralyze the victim for a short time.
Control: A Leather Shadow Puppet can manipulate a captured shadow to control the victim's movement.
Shadow: These creatures depend on shadows and light; table lighting and positioning should matter when resolving their powers.`
  },
  {
    id: "f2b5500000000011",
    name: "Longzhi",
    folderKey: "monsters",
    type: "monster",
    text: `Longzhi
Longzhi are horned, winged creatures associated with sacred mushrooms. They bite viciously and use sudden pounces against intruders.
Defenses: Hardiness 7, Stealth 8, Evade 4, Parry 5, Wits 3, Resolve 7
Key Skills: Bite: 1d10 (9d10 Open), Claw: 3d10 (Damage 3d10), Speed: 2d10, Muscle: 3d10, Detect: 1d10
Max Wounds: 5
Powers
Bite: The Longzhi bite inflicts 9d10 Open Damage.
Pounce: A Longzhi can make a sudden leaping attack when it catches prey off guard.`
  },
  {
    id: "f2b5500000000012",
    name: "Naga",
    folderKey: "monsters",
    type: "monster",
    text: `Naga
Naga are great serpentine beings with deadly bites, constricting coils, poison, and supernatural breath.
Defenses: Hardiness 8, Evade 4, Parry 3, Stealth 9, Wits 2, Resolve 7
Key Skills: Bite: 2d10 (Open Damage 4d10), Constrict: 4d10, Swim: 4d10, Speed: 1d10, Muscle: 3d10, Detect: 3d10
Max Wounds: 5
Powers
Constrict: A Naga can wrap a victim in its coils and crush them.
Flame Spray: A Naga can spray flame as a supernatural attack.
Disease Breath: A Naga can exhale disease-bearing breath.
Poison: Naga venom is dangerous and may require a corresponding antidote or specialized treatment.`
  },
  {
    id: "f2b5500000000013",
    name: "Virtuous Naga",
    folderKey: "monsters",
    type: "monster",
    text: `Virtuous Naga
Virtuous Naga are more powerful serpentine beings. They retain the constricting coils and deadly bite of lesser Naga, but are tougher and more spiritually potent.
Defenses: Hardiness 8, Evade 4, Parry 3, Stealth 9, Wits 2, Resolve 7
Key Skills: Bite: 2d10 (Damage 4d10 Open), Constrict: 4d10, Swim: 4d10, Speed: 1d10, Muscle: 3d10, Detect: 3d10
Max Wounds: 10
Powers
Constrict: A Virtuous Naga can wrap a victim in its coils and crush them.
Flame Spray: A Virtuous Naga can spray flame as a supernatural attack.`
  },
  {
    id: "f2b5500000000014",
    name: "Nao Ren",
    folderKey: "monsters",
    type: "monster",
    text: `Nao Ren
Nao Ren have humanlike faces, long limbs, and sharp claws. They imitate sounds, twist their bodies into strange forms, and hide among their surroundings.
Defenses: Hardiness 5, Evade 7, Parry 5, Stealth 10, Wits 5, Resolve 3
Key Skills: Bite: 3d10 (Damage 5d10), Claws: 3d10 (Damage 4d10), Speed: 2d10, Fly: 4d10, Detect: 4d10, Muscle: 3d10, Deception: 1d10, Reason: 1d10, Language (Any): 1d10
Max Wounds: 3
Powers
Claws and Bite: Nao Ren attack with claws and bite.
Imitate Sound: A Nao Ren can mimic sounds and voices to mislead prey.
Contort and Blend: A Nao Ren can twist itself into unnatural shapes and blend into its environment.`
  },
  {
    id: "f2b5500000000015",
    name: "Ogre Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Ogre Demon
Ogre Demons are powerful demon foes with tremendous strength, disruptive Qi, and resistance to many ordinary tricks.
Defenses: Hardiness 9, Evade 5, Parry 8, Stealth 7, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 3d10, Kick: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 1d10, Muscle: 4d10, Endurance: 2d10, Detect: 3d10
Max Wounds: 10
Powers
Qi Immunity: Ogre Demons resist Qi-based effects.
Qi Disruption: Ogre Demons can disrupt the Qi of nearby foes.
Mighty: Ogre Demons are Mighty creatures.
Beast Strength (x4): Ogre Demons have Beast Strength x4.
Weakness: Ogre Demons have a specific weakness that should be adjudicated from the encounter notes.`
  },
  {
    id: "f2b5500000000016",
    name: "Painted Death",
    folderKey: "monsters",
    type: "monster",
    text: `Painted Death
Painted Deaths hide beneath painted skin and prey on victims through deception, brute strength, and devouring attacks.
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 7, Wits 9, Resolve 6
Key Skills: Grapple: 3d10, Bite: 3d10 (5d10 Open), Arm Strike: 3d10, Speed: 4d10, Muscle: 3d10, Detect: 3d10, Talent (Painting): 4d10, Deception: 2d10
Max Wounds: 8
Powers
Painted Skin: A Painted Death can conceal its true nature with painted skin.
Devour: A Painted Death can consume victims with its bite.`
  },
  {
    id: "f2b5500000000017",
    name: "Qi Spirit (General)",
    folderKey: "monsters",
    type: "monster",
    text: `Qi Spirit (General)
Qi Spirits are powerful beings drawn to imbalanced Qi. This general template is a baseline for custom Qi Spirit possession threats.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Speed: 6d10, Fly: 6d10, Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Knowledge (varies): 2d10
Max Wounds: 1
Powers
Possess: Qi Spirits can possess characters whose Qi is imbalanced. Possession gradually changes the body over three weeks, replacing or adding spirit traits and powers.
Special Powers: Individual Qi Spirits have additional powers listed in their own entries.
Max Wounds: Add the entry's Wounds to the possessed target.`
  },
  {
    id: "f2b5500000000018",
    name: "Bull Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Bull Spirit
Bull Spirits are angry, hungry Qi Spirits with a sense of honor and a violent temper. Possessed bodies become massive human-bull hybrids.
Defenses: Hardiness 9, Evade 5, Parry 5, Stealth 7, Wits 6, Resolve 10
Key Skills: Grapple: 3d10, Gore: 2d10 (Damage 6d10), Heavy Melee: 3d10, Speed: 4d10, Bite: 2d10 (3d10 Open), Muscle: 4d10, Fly: 4d10, Detect: 1d10, Command: 2d10, Knowledge (varies): 4d10
Max Wounds: +9
Powers
Gore: The horns of a Bull Spirit do 6d10 Damage.
Devour: The bite of the Bull Spirit inflicts 3d10 Open Damage. Each Wound inflicted this way heals the spirit by one Wound.
Change Shape: A Bull Spirit can change between a humanoid bull and a human shape after eating human flesh within the last hour.
Beast Strength (x6): Base lift is doubled and the spirit can exceed Damage caps.`
  },
  {
    id: "f2b5500000000019",
    name: "Compassionate Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Compassionate Spirit
Compassionate Spirits are benevolent Qi Spirits driven to stop suffering and protect the weak, often to dangerous excess.
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 10
Key Skills: Grapple: 1d10, Speed: 6d10, Fly: 6d10, Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Medicine: 3d10, Meditation: 2d10, Knowledge (varies): 2d10
Max Wounds: +5
Powers
Heal: A Compassionate Spirit can heal others by taking Wounds itself, but cannot reduce itself to Incapacitation or Death this way.
Alleviate: With a touch, it can remove physical or emotional suffering from a target for one hour.
Protect: It can create brief protective bubbles around targets in a large area a number of times per hour equal to its Wound total.`
  },
  {
    id: "f2b5500000000020",
    name: "Fox Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Fox Spirit
Fox Spirits resemble white fox demons and delight in emotion, devotion, and deception.
Defenses: Hardiness 6, Evade 7, Parry 7, Stealth 10, Wits 9, Resolve 8
Key Skills: Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 2d10, Speed: 4d10, Detect: 3d10, Persuade: 3d10, Command: 2d10, Deception: 2d10, Talent (Any One): 3d10, Talent (Any Two): 3d10, Knowledge (varies): 1d10
Max Wounds: +2
Powers
Enchant: Fox Spirits can use a Talent roll against Resolve to enchant a target into love or extreme devotion.
Shape Shift: Fox Spirits can briefly take the full human form of the possessed person.`
  },
  {
    id: "f2b5500000000021",
    name: "Ogre Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Ogre Spirit
Ogre Spirits are conquest-driven Qi Spirits with massive bodies and a hunger for power.
Defenses: Hardiness 9, Evade 6, Parry 6, Stealth 3, Wits 7, Resolve 7
Key Skills: Grapple: 3d10, Speed: 2d10, Muscle: 4d10, Detect: 1d10, Command: 2d10, Persuade: 3d10, Knowledge (varies): 2d10
Max Wounds: +10
Powers
Powerful: Any melee Attack from an Ogre Spirit does 2 Extra Wounds.
Qi Mastery: Ogre Spirits siphon ambient Qi from nearby Martial Heroes and shape it into Open Damage energy blasts that can build up to 7d10 Open Damage.`
  },
  {
    id: "f2b5500000000022",
    name: "Pig Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Pig Spirit
Pig Spirits are cunning hunger spirits with boar heads and tusks. They can appear as pigs or beautiful humans.
Defenses: Hardiness 7, Evade 6, Parry 6, Stealth 10, Wits 10, Resolve 7
Key Skills: Grapple: 1d10, Gore: 1d10 (Damage 2d10), Light Melee: 2d10, Speed: 4d10, Detect: 1d10, Persuade: 3d10, Talent (Cooking): 3d10, Knowledge (varies): 4d10
Max Wounds: +6
Powers
Gore: The tusks of a Pig Spirit do 2d10 Damage plus 1 Extra Wound.
Change Shape: Pig Spirits can change into pigs, humans, and pig-human hybrids.
Illusion: Pig Spirits can create small visual illusions at will.`
  },
  {
    id: "f2b5500000000023",
    name: "Swallow Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Swallow Spirit
Swallow Spirits are mischievous bird-like Qi Spirits who meddle in human affairs and can assume human or swallow form.
Defenses: Hardiness 6, Evade 6, Parry 6, Stealth 10, Wits 9, Resolve 6
Key Skills: Grapple: 0d10, Speed: 6d10, Bite: 0d10 (Damage 0d10), Fly: 6d10, Detect: 3d10, Deception: 3d10, Empathy: 3d10, Persuade: 3d10, Knowledge (varies): 4d10
Max Wounds: +1
Powers
Meddling Whisper: Roll Deception against Wits; on a Success the target believes what the Swallow Spirit whispers.
Invisibility: A Swallow Spirit can become invisible at will.
Change Shape: A Swallow Spirit can change shape into a swallow or human.`
  },
  {
    id: "f2b5500000000024",
    name: "Vulture Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Vulture Spirit
Vulture Spirits delight in cruelty, pain, and vengeance. Possessed bodies grow wings and violent predatory traits.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Speed: 6d10, Bite: 2d10 (Damage 3d10), Fly: 6d10, Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Knowledge (varies): 2d10
Max Wounds: +3
Powers
Fly: Vulture Spirits fly with wings, often the first physical change in a possessed body.
Burning Gaze: Roll Command against Resolve to impose a -1d10 pain penalty for 2 rounds.
Claws of the Vulture: Claw strikes can expose victims to a spirit disease that causes terrible nightmares and prevents sleep.
Limb Breaking Beak: On a Total Success the beak breaks bones that take two weeks to heal; it does 3d10 Damage.
Piercing Wail: The wail affects a 20-foot area and does 2d10 Damage to everyone inside.`
  },
  {
    id: "f2b5500000000025",
    name: "Water or Snake Spirit",
    folderKey: "monsters",
    type: "monster",
    text: `Water or Snake Spirit
Water Spirits are serpent-like Qi Spirits associated with rivers, lakes, salt, venom, and revenge.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 3d10, Constrict: 3d10, Bite: 2d10 (Damage 1d10 plus poison), Speed: 6d10, Fly: 3d10, Swim: 6d10, Detect: 2d10, Command: 1d10, Deception: 3d10, Persuade: 3d10, Knowledge (varies): 1d10
Max Wounds: +4
Powers
Constrict: A Water Spirit can restrain prey and inflict 1 Wound each round while maintaining Constriction with Constrict against Parry.
Bite: Water Spirits have sharp fangs that do 1d10 Damage and release venom.
Poison: Water Spirit venom rolls 3d10 Potency against Hardiness, can kill in 1d10 days, and imposes cumulative Combat and Physical penalties each minute.`
  },
  {
    id: "f2b5500000000026",
    name: "Wolf Spirit (Hunger)",
    folderKey: "monsters",
    type: "monster",
    text: `Wolf Spirit (Hunger)
Wolf Spirits feed on Qi, cause fear, and can take human or wolf form.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Bite: 2d10, Speed: 4d10, Detect: 3d10, Command: 2d10, Deception: 1d10, Knowledge (varies): 2d10, Survival (Wilderness): 3d10
Max Wounds: +2
Powers
Devour: Wolf Spirits drain 1 Qi per Wound inflicted with a bite.
Howl: Roll 2d10 against Resolve; on a Success targets suffer -1d10 to Physical Skills, and on Total Success also to Combat Skills.
Track: Wolf Spirits can track by scent with Survival (Wilderness).
Control Wolves: A Wolf Spirit can summon 2d10 wolves with a howl.
Change Shape: Wolf Spirits can assume human or wolf form.`
  },
  {
    id: "f2b5500000000027",
    name: "Red Ru-Fish (Chiru)",
    folderKey: "monsters",
    type: "monster",
    text: `Red Ru-Fish (Chiru)
Red Ru-Fish are cunning river creatures with humanlike faces. They trick people into drowning or other danger before feeding on them.
Defenses: Hardiness 3, Evade 9, Parry 5, Stealth 10, Wits 9, Resolve 3
Key Skills: Bite: 1d10 (Damage 0d10), Swim: 5d10, Muscle: 0d10, Detect: 2d10, Deception: 3d10, Talent (Sing): 2d10
Max Wounds: 1
Powers
Speak: Red Ru-Fish can talk, using speech and deception to lure prey into deadly waters.`
  },
  {
    id: "f2b5500000000028",
    name: "Raksha Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Raksha Demon
Raksha Demons are large flesh-devouring supernatural beings with immense strength, illusions, flight, and deadly teeth.
Defenses: Hardiness 8, Evade 4, Parry 7, Stealth 9, Wits 7, Resolve 6
Key Skills: Bite: 2d10 (7d10 Open Damage), Claw: 3d10 (5d10 Damage), Speed: 4d10, Fly: 5d10, Detect: 2d10, Muscle: 5d10, Deception: 2d10, Language (Any): 3d10, Talent (Cooking): 3d10
Max Wounds: 18
Powers
Beast Strength (x10): Multiply base lift by 10 and exceed Damage caps.
Devour: A Raksha Demon bite delivers 7d10 Open Damage.
Immunities: Raksha are only harmed by energy attacks, cold, and weapons made from Peach Tree wood.
Illusion and Transformation: Raksha can roll Deception against Wits to alter appearance or local seeming.
Fly: Raksha Demons can fly.`
  },
  {
    id: "f2b5500000000029",
    name: "Roc",
    folderKey: "monsters",
    type: "monster",
    text: `Roc
Rocs are enormous predatory birds from mountain regions, able to carry prey away with claws and tear them with powerful beaks.
Defenses: Hardiness 6, Evade 9, Parry 2, Stealth 9, Wits 6, Resolve 10
Key Skills: Bite: 3d10 (6d10 Open Damage), Claws: 3d10 (4d10 Open Damage), Speed: 1d10, Fly: 6d10, Command: 4d10, Detect: 7d10, Muscle: 2d10
Max Wounds: 18
Powers
Bite: A Roc's beak does 6d10 Open Damage; Total Successes on Damage rolls each do 2 Extra Wounds.
Claws: Roc claws do 4d10 Open Damage and can restrain a target on a successful attack.`
  },
  {
    id: "f2b5500000000030",
    name: "Skeleton",
    folderKey: "monsters",
    type: "monster",
    text: `Skeleton
Skeletons are animated remains raised by spirit possession, magic, or rare engineering.
Defenses: Hardiness 10, Evade 4, Parry 4, Stealth 7, Wits 2, Resolve 10
Key Skills: Bite: 0d10 (Damage 2d10), Claw: 1d10 (Damage 1d10), Wrestling: 0d10, Speed: 1d10, Muscle: 0d10, Detect: 0d10
Max Wounds: 3
Powers
Blunt Vulnerability: Skeleton Hardiness is 5 against Blunt Weapons.`
  },
  {
    id: "f2b5500000000031",
    name: "Skeleton of Bone Kingdom",
    folderKey: "monsters",
    type: "monster",
    text: `Skeleton of Bone Kingdom
Skeletons of Bone Kingdom are transformed victims whose enlarged rib cages can imprison captives.
Defenses: Hardiness 10, Evade 4, Parry 7, Stealth 5, Wits 4, Resolve 10
Key Skills: Bite: 0d10 (Damage 2d10), Claw: 1d10 (Damage 3d10), Grappling: 2d10, Speed: 2d10, Muscle: 2d10, Detect: 0d10
Max Wounds: 5
Powers
Blunt Vulnerability: Skeleton Hardiness is 5 against Blunt Weapons.
Encage: On a successful Grapple attack, the skeleton traps the victim in its chest cage. Escape requires breaking the cage with 2 Wounds from Targeted Strikes.`
  },
  {
    id: "f2b5500000000032",
    name: "Xiaoyang",
    folderKey: "monsters",
    type: "monster",
    text: `Xiaoyang
Xiaoyang are flesh-eating, ape-like humanoids with long arms, black hair, and a laugh that slows the blood.
Defenses: Hardiness 6, Evade 6, Parry 4, Stealth 9, Wits 4, Resolve 4
Key Skills: Bite: 1d10 (Open Damage 3d10), Grapple: 1d10 (Damage 4d10), Arm Strike: 0d10 (Damage 4d10), Speed: 3d10, Muscle: 4d10, Detect: 3d10, Athletics: 3d10, Command: 1d10
Max Wounds: 3
Powers
Climb: Xiaoyang can use Athletics to climb trees and craggy surfaces at full speed.
Bite: Xiaoyang teeth inflict 3d10 Open Damage.
Laugh: After a full round laughing, roll 1d10 against Resolve in a 60-foot radius to penalize Speed and movement; Total Success worsens the penalty.`
  },
  {
    id: "f2b5500000000033",
    name: "Yaksha Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Yaksha Demon
Yaksha Demons are small, hungry demons with needle-like claws, hypnotic voices, and spiteful self-destructive magic.
Defenses: Hardiness 8, Evade 5, Parry 4, Stealth 9, Wits 7, Resolve 6
Key Skills: Bite: 2d10 (5d10 Open), Claw: 2d10 (Damage 3d10 and special), Speed: 8d10, Detect: 2d10, Muscle: 3d10, Deception: 2d10, Language (Any): 3d10, Talent (Singing): 3d10
Max Wounds: 6
Powers
Devour: A Yaksha bite delivers 5d10 Open Damage.
Blood Nail: On a Total Success with claws, the target bleeds for 1 Automatic Wound per round until stopped.
Singing Whisper: Roll Talent (Singing) against Resolve to lull a target to sleep.
Immunities: Yaksha are only harmed by energy attacks, cold, and weapons made from Peach Tree wood.
Spiteful Burst: A captured Yaksha can explode in burning blood, rolling 4d10 against Evade in the area for 5d10 Fire Damage.`
  },
  {
    id: "f2b5500000000034",
    name: "Yumen (Feathered People)",
    folderKey: "monsters",
    type: "monster",
    text: `Yumen (Feathered People)
Yumen are tall vulture-like humanoids with wings, beaks, claws, intelligence, and a taste for blood.
Defenses: Hardiness 4, Evade 6, Parry 3, Stealth 9, Wits 5, Resolve 5
Key Skills: Bite: 1d10 (Damage 2d10), Claw: 1d10 (Damage 1d10), Medium Melee: 1d10, Speed: 1d10, Fly: 2d10, Muscle: 1d10, Talent (Perform any instrument): 1d10, Detect: 3d10
Max Wounds: 2
Powers
Drink Blood: Every Wound a Yumen inflicts allows it to drain 1 point of Qi as it drinks blood.`
  },
  {
    id: "f2b5500000000035",
    name: "Zhen Bird",
    folderKey: "monsters",
    type: "monster",
    text: `Zhen Bird
Zhen Birds are beautiful poisonous birds with copper-toned beaks, golden claws, and feared venom.
Defenses: Hardiness 2, Evade 9, Parry 2, Stealth 10, Wits 2, Resolve 5
Key Skills: Claws: 0d10 (Damage 1d10 plus poison), Peck/Bite: 0d10 (Damage 1d10 plus poison), Speed: 3d10, Fly: 5d10, Detect: 4d10, Muscle: 0d10
Max Wounds: 1
Powers
Poisoned Peck/Claw: Anyone hit and damaged by a Zhen Bird peck or claw is potentially exposed to venom.
Zhen Venom: Roll 4d10 against Hardiness; on a Success the victim suffers cumulative -1d10 penalties every 10 seconds and may die within hours without the proper antidote.`
  },
  {
    id: "f2b5500000000036",
    name: "Alligator or Crocodile",
    folderKey: "monsters",
    type: "monster",
    text: `Alligator or Crocodile
Alligators and crocodiles are water-dwelling reptile predators with powerful jaws, stealth in water, and dangerous bite attacks.
Defenses: Hardiness 5, Evade 6, Parry 3, Stealth 6, Wits 3, Resolve 4
Key Skills: Bite: 4d10 (Damage 4d10), Tail: 2d10 (Damage 1d10), Swim: 4d10, Speed: 2d10, Muscle: 3d10, Detect: 3d10
Max Wounds: 6
Powers
Beast Strength (x2): Alligators and crocodiles double base lift and can exceed Damage roll caps.
Alligator Jaws: Alligator bites impose -2 Hardiness against bitten creatures with shells or hard protection.
Variant Wounds: Alligators usually have 3-4 Wounds; crocodiles usually have 3-6 Wounds.`
  },
  {
    id: "f2b5500000000037",
    name: "Flying Crocodile",
    folderKey: "monsters",
    type: "monster",
    text: `Flying Crocodile
Flying Crocodiles resemble larger crocodiles that move through the air as easily as water.
Defenses: Hardiness 5, Evade 6, Parry 3, Stealth 6, Wits 3, Resolve 4
Key Skills: Bite: 4d10 (Damage 5d10), Tail: 2d10 (Damage 1d10), Swim: 4d10, Fly: 4d10, Speed: 3d10, Muscle: 4d10, Detect: 3d10
Max Wounds: 7
Powers
Beast Strength (x2): Flying Crocodiles double base lift and can exceed Damage roll caps.
Flight: Flying Crocodiles move through the air like water.
Variant Wounds: Flying Crocodiles usually have 4-7 Wounds.`
  },
  {
    id: "f2b5500000000038",
    name: "Elephant",
    folderKey: "monsters",
    type: "monster",
    text: `Elephant
Elephants are huge southern and western beasts with crushing strength, tusks, and devastating stomps.
Defenses: Hardiness 8, Evade 2, Parry 4, Stealth 2, Wits 4, Resolve 2
Key Skills: Tusk: 1d10 (Damage 4d10), Stomp: 0d10 (4d10 Open Damage), Speed: 2d10, Muscle: 4d10, Detect: 2d10
Max Wounds: 4
Powers
Charge: If an elephant moves its full rate before attacking, its tusks do 1 Extra Wound on a successful attack.
Stomp: Elephant stomp attacks do Open Damage.
Beast Strength (x10): Elephants multiply base lift by 10 and can exceed Damage roll caps by up to 10d10.`
  },
  {
    id: "f2b5500000000039",
    name: "Lion or Tiger",
    folderKey: "monsters",
    type: "monster",
    text: `Lion or Tiger
Large cats are wilderness predators that stalk, pounce, and occasionally prey on people.
Defenses: Hardiness 5, Evade 3, Parry 5, Stealth 6, Wits 2, Resolve 2
Key Skills: Bite: 2d10 (Damage 2d10), Claw: 2d10 (Damage 3d10), Speed: 3d10, Muscle: 3d10, Detect: 3d10
Max Wounds: 2
Powers
Pounce: When a lion or tiger has Surprise, it does 1 Extra Wound on its Damage roll.`
  },
  {
    id: "f2b5500000000040",
    name: "Northern Feast Beetle",
    folderKey: "monsters",
    type: "monster",
    text: `Northern Feast Beetle
Northern Feast Beetles are flesh-burrowing insects that attack in clusters and can cause Ice of the Heart.
Defenses: Hardiness 1, Evade 1, Parry 1, Stealth 10, Wits 1, Resolve 10
Key Skills: Bite: 0d10, Speed: 0d10
Max Wounds: 1
Powers
Burrow and Poison: A beetle bite begins burrowing toward the heart over 5 rounds. It can be extracted with Medicine before then, but once it reaches the heart it causes Ice of the Heart.`
  },
  {
    id: "f2b5500000000041",
    name: "Pearl Tiger",
    folderKey: "monsters",
    type: "monster",
    text: `Pearl Tiger
Pearl Tigers are aggressive white-furred tigers with calming purrs and a taste for human prey.
Defenses: Hardiness 6, Evade 3, Parry 5, Stealth 9, Wits 3, Resolve 5
Key Skills: Bite: 2d10 (Damage 3d10), Claw: 2d10 (Damage 4d10), Speed: 3d10, Muscle: 4d10, Detect: 3d10
Max Wounds: 3
Powers
Pounce: Pearl Tigers do 1 Extra Wound on Damage when they attack with Surprise.
Soothing Purr: Roll 2d10 against Resolve within 15 feet; on a Success the target is calmed and slowed, and on Total Success falls asleep for 2 rounds.`
  },
  {
    id: "f2b5500000000042",
    name: "Southern Snake (Venomous)",
    folderKey: "monsters",
    type: "monster",
    text: `Southern Snake (Venomous)
Southern Snakes are small but highly venomous snakes, especially associated with Snake Peak.
Defenses: Hardiness 2, Evade 7, Parry 2, Stealth 9, Wits 3, Resolve 4
Key Skills: Bite: 1d10, Speed: 1d10, Detect: 1d10
Max Wounds: 1
Powers
Poison: A bite exposes the target to venom without a Damage roll. Roll 3d10 against Hardiness; on success the target dies in 1d10 hours unless treated with antidote or delayed with Medicine.`
  },
  {
    id: "f2b5500000000043",
    name: "Wolf",
    folderKey: "monsters",
    type: "monster",
    text: `Wolf
Wolves are pack predators that hunt by scent.
Defenses: Hardiness 3, Evade 5, Parry 5, Stealth 6, Wits 3, Resolve 4
Key Skills: Bite: 1d10 (Damage 1d10), Swim: 0d10, Speed: 2d10, Muscle: 1d10, Detect: 3d10
Max Wounds: 1
Powers
Track: Wolves can track by scent with Detect.`
  },
  {
    id: "f2b5500000000044",
    name: "Bronze Monks of Bao",
    folderKey: "monsters",
    type: "monster",
    text: `Bronze Monks of Bao
Bronze Monks of Bao are supernatural bronze guardians who appear from stone, mineral, or earth and obey the bearer of the Talisman of Bao.
Defenses: Hardiness 9, Evade 4, Parry 7, Stealth 6, Wits 3, Resolve 10
Key Skills: Speed: 2d10, Muscle: 4d10, Grapple: 3d10, Arm Strike: 3d10, Leg Strike: 3d10, Throw: 3d10, Medium Melee: 3d10, Detect: 2d10, Endurance: 6d10
Qi: 3
Max Wounds: 10
Key Kung Fu Techniques (Waijia 2, Qinggong 2): Guiding Crashing Wave, Kick of the Golden Elephant, Horizontal Sidestep (Counter), Grasp of the Python (Counter)
Powers
Resolute: Manipulation and mind-affecting powers require Total Success and can only confuse, not stop or redirect them from their creator.
Beast Strength (x2): Bronze Monks double base lift and can exceed physical Damage caps.
Bronze Body: Their bronze form gives them Hardiness 9.
Meld: Bronze Monks can move through stone, earth, or mineral surfaces at normal movement.`
  },
  {
    id: "f2b5500000000045",
    name: "Bixie",
    folderKey: "monsters",
    type: "monster",
    text: `Bixie
Bixie are massive winged lion-like creatures with lethal teeth and horns, especially dangerous to spirits and demons.
Defenses: Hardiness 8, Evade 7, Parry 6, Stealth 6, Wits 5, Resolve 9
Key Skills: Bite: 2d10 (7d10 Damage), Horn: 4d10 (5d10 Damage), Swim: 0d10, Speed: 3d10, Fly: 3d10, Muscle: 5d10, Detect: 2d10
Max Wounds: 15
Powers
Bite and Horn: Bixie bite does 7d10 Damage and horn does 5d10 Damage; against demons or spirits the bite also drains 2 Hardiness and transfers it to the rider for one hour.
Luck of the Bixie: A Bixie rider gains +2d10 on skill rolls made against demons, spirits, or people with negative Karma.
Beast Strength (x20): Bixie multiply base lift by 20 and can exceed physical Damage caps.`
  },
  {
    id: "f2b5500000000046",
    name: "Dragon Horse",
    folderKey: "monsters",
    type: "monster",
    text: `Dragon Horse
Dragon Horses are winged, scaled horses with horns, water-walking ability, and great strength.
Defenses: Hardiness 8, Evade 3, Parry 6, Stealth 7, Wits 2, Resolve 4
Key Skills: Bite: 2d10 (5d10 Damage), Horn: 3d10 (4d10 Damage), Swim: 0d10, Speed: 3d10, Fly: 1d10, Muscle: 4d10, Detect: 2d10
Max Wounds: 4
Powers
Bite and Horn: A Dragon Horse bite does 5d10 Damage and horn does 4d10 Damage.
Water Walk: A Dragon Horse can walk across water as though it were solid.
Beast Strength (x10): Dragon Horses multiply base lift by 10 and can exceed physical Damage caps.`
  },
  {
    id: "f2b5500000000047",
    name: "Death-Cursed Guardian",
    folderKey: "monsters",
    type: "monster",
    text: `Death-Cursed Guardian
Death-Cursed Guardians are decaying corpses whose spirits remain trapped in their bodies by a curse.
Defenses: Hardiness 8, Evade 4, Parry 7, Stealth 5, Wits 4, Resolve 10
Key Skills: Bite: 0d10 (Damage 2d10), Claw: 1d10 (Damage 3d10), Grappling: 2d10, Speed: 2d10, Muscle: 2d10, Detect: 0d10
Max Wounds: 20
Powers
Death Curse: These guardians keep functioning despite extraordinary bodily damage, but they do not heal naturally.
Pain of the Flesh: Constant pain imposes -1d10 to rolls except in the Pools of Dispassion; this is already reflected in the printed stats.`
  },
  {
    id: "f2b5500000000048",
    name: "Bird Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Bird Demon
Bird Demons are spirited beasts that can take bird, human, or hybrid form. Types include Kingfisher, Peacock, Minivet, and Owl variants.
Defenses: Hardiness 7, Evade 8, Parry 6, Stealth 10, Wits 8, Resolve 6
Key Skills: Claw: 4d10 (Damage 5d10), Speed: 6d10, Breath: 3d10, Bite: 3d10, Fly: 6d10, Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Muscle: 4d10, Trade (Alchemy): 2d10
Max Wounds: 20
Powers
Alchemy Expertise: Alchemy-Transformative Substance.
Fire Breath (Kingfisher): A 10 by 20 foot line against Evade for 7d10 Fire Damage.
Dazzle (Peacock): Creates up to 10 false images, causing attacks to risk striking an image.
Pecking Beak (Minivet): Can peck up to seven targets; each successful peck does 4d10 plus 2 Extra Wounds.
Piercing Beak (Kingfisher): Can impale up to four foes in a line for 4d10 plus 5 Extra Wounds.
Heart Pluck (Peacock): A heart attack for 10d10 Open Damage that also drains 2 Qi.
Limb Breaking Beak (Owl): Does 6d10 Damage and can break bones on Total Success.
Fearful Hoot (Owl): Roll 3d10 against Resolve to impose fear penalties.
Vanish (Minivet): A TN 6 Speed roll lets it appear and reappear within sight as a Move.
Healing Heart: Eating a human heart heals Wounds equal to the victim's Qi Rank.
Shape Change: Bird Demons can take bird, hybrid, and human forms.
Immunities: Bird Demons only take Damage from Qi level 1 or greater Kung Fu Techniques.`
  },
  {
    id: "f2b5500000000049",
    name: "Fox Demon (Huli Jing)",
    folderKey: "monsters",
    type: "monster",
    text: `Fox Demon (Huli Jing)
Fox Demons are shapechanging spirited beasts that feed on human essence or Martial Hero Qi.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 8, Resolve 6
Key Skills: Bite: 3d10 (Damage 4d10), Grapple: 1d10, Arm Strike: 2d10 (Damage 4d10), Speed: 7d10, Fly: 6d10, Detect: 3d10, Command: 1d10, Deception: 3d10, Muscle: 2d10, Persuade: 3d10, Empathy: 2d10, Talent (Any Two): 2d10, Knowledge (varies): 2d10
Max Wounds: 7
Powers
Drain Qi: Fox Demons can drain Qi or Hardiness through touch, bite, or strike, gaining Wounds and techniques from drained Qi.
Kung Fu Techniques: A typical Fox Demon knows 3-8 Kung Fu Techniques, treating all disciplines as Rank 1.
Shape Change: Fox Demons can appear as foxes or attractive humans.
Immunities: Fox Demons only take Damage from Qi level 1 or greater Kung Fu Techniques.
Special Powers: Older Fox Demons may have Captivation, Borrow Appearance, Healing Touch, Illusions, or Boundless Journey.`
  },
  {
    id: "f2b5500000000050",
    name: "Snake Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Snake Demon
Snake Demons are intelligent giant serpents that cultivate through alchemy, breath-draining, and shapechanging.
Defenses: Hardiness 6, Evade 5, Parry 6, Stealth 6, Wits 6, Resolve 7
Key Skills: Bite: 3d10 (Damage 4d10), Grappling: 4d10, Speed: 4d10, Fly: 3d10, Muscle: 4d10, Detect: 2d10, Persuade: 3d10, Trade (Alchemy): 3d10, Knowledge (Varies): 1d10
Max Wounds: 9
Expertise: Alchemy-Transformative Substances
Powers
Drain Qi: Snake Demons can drain Qi or Hardiness through bites and breath, gaining Wounds and techniques from drained Qi.
Kung Fu Techniques: A typical Snake Demon knows 3-8 Kung Fu Techniques, treating all disciplines as Rank 1.
Shape Change: Snake Demons can appear as giant snakes or attractive humans and can fly in both forms.
Immunities: Snake Demons only take Damage from Qi level 1 or greater Kung Fu Techniques.
Compelling Gaze: Roll Persuade against Wits to make a human fall in love and overlook obvious inhuman signs.
Bite: The bite does 4d10 Damage, injects venom, and can drain Qi or Hardiness.
Constrict: After biting in giant snake form, it can constrict; escape requires Muscle TN 8.
Beast Strength (x10): In giant snake form, base lift is multiplied by 10 and Damage caps can be exceeded.
Poison: Snake Demon venom causes dangerous hallucinations.`
  },
  {
    id: "f2b5500000000051",
    name: "Toad Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Toad Demon
Toad Demons are huge greedy toad-like beings who cultivate through worshippers and love valuables.
Defenses: Hardiness 6, Evade 6, Parry 7, Stealth 7, Wits 8, Resolve 8
Key Skills: Tongue Attack: 2d10, Ram/Squash: 3d10 (Damage 6d10), Grappling: 2d10, Speed: 4d10, Fly: 3d10, Muscle: 6d10, Detect: 2d10, Command: 3d10, Persuade: 2d10, Knowledge (Varies): 3d10
Max Wounds: 12
Powers
Swallow: On a successful Tongue Attack it can swallow a person, inflicting 1 Automatic Wound each round inside.
Ram/Squash: A leaping ram or squash attack does 6d10 Damage.
Shape Change: Toad Demons can take giant toad, small toad, or sickly human form.
Immunities: Toad Demons are immune to normal Attacks and only take Damage from Qi rank 3 or greater energy Kung Fu, though cheap rusty weapons work normally.
Bestow Luck: A Toad Demon can grant a narrow +1d10 Skill bonus to a person or community.
Venomous Skin: Touching or cutting the skin can expose nearby creatures to Toad Demon Venom.`
  },
  {
    id: "f2b5500000000052",
    name: "Tree Demon",
    folderKey: "monsters",
    type: "monster",
    text: `Tree Demon
Tree Demons are hostile plant demons that take Banyan tree or vine-wreathed humanoid form and create loyal minions.
Defenses: Hardiness 7, Evade 5, Parry 7, Stealth 8, Wits 6, Resolve 9
Key Skills: Bite: 2d10 (Damage 3d10), Grappling Roots: 5d10 (Damage 5d10), Speed: 3d10, Muscle: 3d10, Detect: 2d10, Persuade: 3d10, Knowledge (Varies): 1d10
Max Wounds: 10
Powers
Lashing Roots: The Tree Demon distributes 5d10 of roots among 1-5 targets; each root contributes 1d10 to Attack and Damage.
Thirsty Root: Roots can drain Qi or Hardiness instead of doing Damage, increasing the demon's Max Wounds and learned techniques.
Kung Fu Techniques: A typical Tree Demon knows 3-8 Kung Fu Techniques, treating all disciplines as Rank 1.
Shape Change: Tree Demons can take Banyan tree or humanoid root form, and older ones may approximate humans.
Immunities: Tree Demons only take Damage from Qi level 1 or greater energy Kung Fu Techniques.
Create Minion: Root strikes can infect a target, transforming them into a loyal Tree Demon Minion in 1d10 days unless stopped by ritual.`
  },
  {
    id: "f2b5500000000053",
    name: "Abbot Song",
    folderKey: "monsters",
    type: "monster",
    text: `Abbot Song
Abbot Song is a celestial demon and former heavenly official who appears as a kindly abbot or as his towering azure true form.
Defenses: Hardiness 8, Evade 7, Parry 7, Stealth 6, Wits 9, Resolve 9
Key Skills: Grapple: 3d10, Arm Strike: 4d10, Leg Strike: 3d10, Light Melee: 3d10, Medium Melee: 3d10, Speed: 3d10, Fly: 4d10, Muscle: 4d10, Endurance: 4d10, Ride (Horse): 6d10, Ride (Bixie): 5d10, Medicine: 3d10, Meditation: 4d10, Divination: 4d10, Command: 3d10, Detect: 3d10, Talent (Brewing): 7d10, Talent (Tea Preparation): 4d10, Talent (Poison): 5d10, Read Scripts (All): 3d10, Languages (All): 3d10, Religion (All): 3d10, Institutions (Bureaucracy of Heaven): 3d10
Qi: 20
Max Wounds: 41
Weapons: Golden Fist (8d10 Damage)
Key Kung Fu Techniques (Waijia 1, Neigong 3): Spinning Back Kick, Hands of the Hawk Beak, Mighty Paws of the Lion, Whipping Strands, Roar of the Lion, Ringing Strike of the Divine Ram, Gaze of the Lion, Purge Spirit, Iron Body, Iron Spirit Reversal (Counter)
Profound Techniques: Change, Ride the Cloud
Powers
Immunity: Abbot Song can only be harmed by Kung Fu Techniques, Profound Kung Fu Techniques, and Immortal Powers, and cannot be permanently killed without divine decree.
Regeneration: Abbot Song regenerates 1 Wound every hour.
Drunken Touch: Arm Strike against Parry, then 2d10 against Hardiness, can impose severe intoxication penalties for one hour.
Change: Abbot Song can use Change to appear in several human forms, though otherwise he must assume his natural form.`
  },
  {
    id: "f2b5500000000054",
    name: "Abbot Song's Minion",
    folderKey: "monsters",
    type: "monster",
    text: `Abbot Song's Minion
Abbot Song's minions resemble red-robed monks but are monsters made from the bones of those he has eaten.
Defenses: Hardiness 5, Evade 8, Parry 5, Stealth 7, Wits 6, Resolve 10
Key Skills: Grapple: 1d10, Arm Strike: 2d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 2d10, Speed: 1d10, Muscle: 4d10, Endurance: 1d10, Meditation: 2d10, Divination: 2d10, Detect: 2d10, Talent (Brewing): 2d10, Talent (Tea Preparation): 1d10, Talent (Poison): 1d10, Read Scripts (All): 3d10, Languages (All): 3d10
Max Wounds: 10
Weapons: Fists (4d10 Damage)
Powers
Splinter: A minion can divide into up to 10 duplicates, splitting Max Wounds evenly among them.
Killing a Minion: At 0 Wounds it reverts to its skeletal natural form; the bones must be destroyed or it heals over 10 days.
Crawl: Minions can crawl like lizards on sheer surfaces at normal movement.`
  },
  {
    id: "f2b5500000000055",
    name: "Lord Demon Horn",
    folderKey: "monsters",
    type: "monster",
    text: `Lord Demon Horn
Lord Demon Horn is a huge celestial demon with a massive horn, musical skill, and a dangerous fondness for heavenly pills.
Defenses: Hardiness 9, Evade 5, Parry 8, Stealth 7, Wits 6, Resolve 8
Key Skills: Grapple: 2d10, Arm Strike: 2d10, Throw: 3d10, Kick: 2d10, Light Melee: 2d10, Medium Melee: 3d10, Heavy Melee: 3d10, Speed: 1d10, Muscle: 5d10, Endurance: 2d10, Detect: 3d10, Talent (Guqin): 4d10, Talent (Guzheng): 4d10, Talent (Erhu): 6d10, Talent (Bells and Chimes): 4d10, Talent (Flute): 3d10, Talent (Singing): 5d10, Talent (Pipa): 4d10, Talent (Cooking): 2d10, Institutions (Bureaucracy of Heaven): 3d10
Max Wounds: 40
Weapons: The Golden Cudgel (7d10 Open Damage)
Equipment: Golden Crown (worth 15,000 Spades)
Expertise: Detect-Taste, Talent-Composition
Powers
Mighty: All physical attacks by Lord Demon Horn roll Open Damage.
Roar: Roll 2d10 against Evade in front of him; affected targets are thrown, knocked down, and take 3d10 Damage.
Change: Lord Demon Horn can alter size or appearance, though human or animal form imposes -1d10 to all skills.
Weakness: Jade objects inflict 5 Extra Wounds against Lord Demon Horn.
Beast Strength (x20): Lord Demon Horn has Beast Strength x20.`
  },
  {
    id: "f2b5500000000056",
    name: "Dog of Liling",
    folderKey: "monsters",
    type: "monster",
    text: `Dog of Liling
Dogs of Liling are cursed scaled mutts created by one of the Sisters of Bone Kingdom.
Defenses: Hardiness 8, Evade 7, Parry 5, Stealth 9, Wits 3, Resolve 4
Key Skills: Bite: 1d10 (Damage 1d10), Swim: 0d10, Speed: 3d10, Muscle: 1d10, Detect: 4d10
Max Wounds: 1
Powers
Track: Dogs of Liling can track a scent trail for miles if it is no more than two days old and has not been washed away.`
  },
  {
    id: "f2b5500000000057",
    name: "Feng Gui (Phoenix Ghost)",
    folderKey: "monsters",
    type: "monster",
    text: `Feng Gui (Phoenix Ghost)
Phoenix Ghosts are created by unnaturally divided spirits, anchored where they died and driven by dominant Phoenix emotions.
Defenses: Hardiness 7, Evade 7, Parry 7, Stealth 8, Wits 4, Resolve 9
Key Skills: Bite: 2d10 (Open Damage 2d10 and Special), Arm Strike: 1d10 (Damage 2d10), Grapple: 2d10, Speed: 3d10, Detect: 2d10, Muscle: 2d10
Max Wounds: 12
Powers
Bite and Feast: A damaging bite does 2d10 Open Damage and drains 1 Hardiness that returns at 1 point per day.
Disrupted Phoenix Spirit: A dominant Phoenix Spirit drives the ghost's behavior, mirroring the Disrupted Phoenix Spirit flaw.
Phoenix Spirit Disruption: A damaging strike can afflict the target with the Disrupted version of the Missing or Disrupted Phoenix Spirit flaw for one day.`
  },
  {
    id: "f2b5500000000058",
    name: "Wu Tou Gui (Headless Ghost)",
    folderKey: "monsters",
    type: "monster",
    text: `Wu Tou Gui (Headless Ghost)
Headless Ghosts are vengeful ghosts of the maimed or unjustly executed, searching for revenge and missing body parts.
Defenses: Hardiness 8, Evade 6, Parry 7, Stealth 7, Wits 5, Resolve 10
Key Skills: Arm Strike: 2d10 (Damage 3d10), Grapple: 2d10, Speed: 3d10, Detect: 2d10, Muscle: 3d10
Max Wounds: 10
Powers
Life Drain: A damaging strike drains 1 Hardiness, returning at 1 per hour.
Vacuous Gaze: After staring for a full round, roll 3d10 against Resolve; Success costs the target a Move, Total Success costs all actions that turn.`
  },
  {
    id: "f2b5500000000059",
    name: "Heyu",
    folderKey: "monsters",
    type: "monster",
    text: `Heyu
Heyu are boar-like creatures with human faces that babble like babies and spit venom-laced small objects.
Defenses: Hardiness 4, Evade 7, Parry 4, Stealth 8, Wits 5, Resolve 3
Key Skills: Bite: 1d10 (Damage 0d10 plus poison), Spit: 2d10 (Damage 0d10 plus poison), Speed: 3d10, Muscle: 1d10, Detect: 2d10, Deception: 2d10
Max Wounds: 3
Powers
Spit: Heyu spit small objects coated in saliva venom; treat as Standard Poison.
Babble: Heyu can speak nonsense words like small human babies.`
  },
  {
    id: "f2b5500000000060",
    name: "Da Duye",
    folderKey: "monsters",
    type: "monster",
    text: `Da Duye
Da Duye is a mountain god guarding the gate to Meidu, appearing as an ape-bodied giant with goat horns and venomous snakes emerging from his eyes.
Defenses: Hardiness 10, Evade 4, Parry 8, Stealth 3, Wits 4, Resolve 10
Key Skills: Bite: 2d10 (Open Damage 3d10), Arm Strike: 2d10 (Damage 8d10), Breath: 2d10 (Damage 5d10), Snake Bite: 2d10, Medium Melee: 2d10, Speed: 1d10, Muscle: 5d10, Detect: 2d10, Meditation: 3d10, Institutions (Bureaucracy of Heaven): 1d10
Qi: 20
Max Wounds: 41
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 2, Dianxue 1): Hands of the Hawk Beak, Ringing Strike of the Divine Ram, Roar of the Lion, Iron Body (Counter), Whirling Dodge (Counter)
Powers
Deathless: Destroying Da Duye's body is temporary; he slowly buds from the nearest tree over 1d10 months.
Immunities: Da Duye ignores mundane attacks and Kung Fu from users below his Qi Rank, but wine makes him vulnerable to Kung Fu for one hour.
Stinky Breath: A 60-foot vapor radius as a Move; roll 4d10 against Endurance or suffer -1d10 to all skills for one hour.
Smash: Arm Strike does 8d10 Damage and knocks targets back, adding 2d10 Damage if they hit a surface.
Beast Strength (x5): Da Duye has Beast Strength x5.
Snake Bites: Snake Bite exposes targets to lethal venom; Da Duye's saliva is the only antidote.`
  },
  {
    id: "f2b5500000000061",
    name: "Long Gu",
    folderKey: "monsters",
    type: "monster",
    text: `Long Gu
Long Gu is a mountain god guarding the gate to the Immortal Realm, with a dragon-scaled body, human head, and hawk-like talons.
Defenses: Hardiness 10, Evade 8, Parry 7, Stealth 5, Wits 5, Resolve 8
Key Skills: Arm Strike: 2d10 (Damage 4d10), Grapple: 3d10, Breath: 2d10 (Damage 5d10), Medium Melee: 2d10, Speed: 3d10, Fly: 2d10, Muscle: 4d10, Detect: 3d10, Talent (Flute): 3d10, Meditation: 3d10, Institutions (Bureaucracy of Heaven): 3d10, Medicine: 3d10
Qi: 18
Max Wounds: 37
Key Kung Fu Techniques (Waijia 1, Qinggong 3, Neigong 1, Dianxue 1): Great Stride, Merciless Black Claw, Mighty Paws of the Lion, Palm of the Dragon, Purge Spirit, Red Claw Strike, Horizontal Sidestep (Counter)
Powers
Deathless: Destroying Long Gu's body is temporary; he returns as an egg and hatches in 10 days.
Immunities: Long Gu ignores mundane attacks but is vulnerable to Kung Fu Techniques.
Slash: Talon strikes cause 5d10 Damage, then bleeding Damage of 4d10, 3d10, and so on in later rounds.
Drum Belly: Roll 3d10 against Hardiness in a 300-foot radius; affected targets take 6d10 Damage from pain.
Beast Strength (x2): Long Gu has Beast Strength x2.`
  },
  {
    id: "f2b5500000000062",
    name: "Seventh Brother",
    folderKey: "monsters",
    type: "monster",
    text: `Seventh Brother
Seventh Brother is a Profound Spirit tied to Kwam Metta and the Jade Turtle, appearing as a distorted glowing apparition.
Defenses: Hardiness 8, Evade 6, Parry 6, Stealth 10, Wits 6, Resolve 8
Key Skills: Grapple: 1d10, Arm Strike: 2d10, Medium Melee: 3d10, Speed: 6d10, Bite: 2d10 (Damage 3d10), Fly: 6d10, Detect: 2d10, Command: 2d10, Deception: 2d10, Persuade: 3d10, Ritual (Ritual of the Boundless Dream): 0d10, Religion (Hen-Shi): 3d10, Religion (Qi Zhao): 2d10
Max Wounds: 25
Powers
Fly: Seventh Brother can fly.
Burning Gaze: Roll Command against Resolve to impose burning-pain skill penalties for 2 rounds.
Disintegrating Finger: Small Ranged against Evade, then 3d10 against Hardiness, transports the target into the Jade Turtle.
Change Shape: Seventh Brother can become a luminous orb of energy.
Deathless: If killed, Seventh Brother returns one hour later.
Spinning Sword: Roll 3d10 against Parry in a 100-foot area; on Success inflict 3d10 Open Damage.
Without Substance: Grappling is impossible because he can dematerialize.
Immune: Seventh Brother is only affected by Kung Fu Techniques.
Laying Seventh Brother to Rest: He can be restored through the Jade Turtle or by awakening his body inside it.`
  },
  {
    id: "f2b5500000000063",
    name: "Supreme Judge Yu",
    folderKey: "monsters",
    type: "monster",
    text: `Supreme Judge Yu
Supreme Judge Yu enforces the laws against unauthorized travel between realms and carries prisoners in golden cages.
Defenses: Hardiness 10, Evade 8, Parry 8, Stealth 6, Wits 6, Resolve 10
Key Skills: Grapple: 5d10, Arm Strike: 6d10, Leg Strike: 4d10, Light Melee: 4d10, Medium Melee: 7d10, Speed: 4d10, Fly: 5d10, Muscle: 5d10, Endurance: 4d10, Ride (Horse): 6d10, Ride (Bixie): 7d10, Meditation: 4d10, Divination: 6d10, Command: 4d10, Detect: 3d10, Read Scripts (All): 3d10, Languages (All): 3d10, Religion (All): 3d10, Institutions (Bureaucracy of Heaven): 5d10
Qi: 40
Max Wounds: 80
Weapons: Qiang (7d10 Damage)
Key Kung Fu Techniques (Waijia 2, Qinggong 2, Neigong 2, Dianxue 1): Judge Yu knows all Kung Fu Techniques
Profound Techniques: Judge Yu knows all Profound Kung Fu Techniques
Powers
Beast Strength (x50): Supreme Judge Yu has Beast Strength x50.
Immunity: Supreme Judge Yu can only be harmed by Kung Fu Techniques, Profound Kung Fu Techniques, and Immortal Powers, and cannot be permanently killed without divine decree.
Regeneration: Supreme Judge Yu regenerates 1 Wound every round.
Detect Trespass: There is a chance he senses transgressions across realm boundaries.
Task: A touch marks a target with a divine task; neglect causes pain and Hardiness drain.
Golden Cage: Large Ranged creates a shrinking cage of light that imprisons a target.
Teleport: Supreme Judge Yu can teleport anywhere as a Move.`
  },
  {
    id: "f2b5500000000064",
    name: "The Yao",
    folderKey: "monsters",
    type: "monster",
    text: `The Yao
The Yao are heartless Martial Heroes bound to the Glorious Emperor by the Heart Taking Ritual and empowered by dark Qi.
Defenses: Hardiness 7, Evade 7, Parry 7, Stealth 9, Wits 6, Resolve 10
Key Skills: Grapple: 2d10, Throw: 3d10, Arm Strike: 3d10, Leg Strike: 2d10, Light Melee: 2d10, Medium Melee: 2d10, Heavy Melee: 3d10, Small Ranged: 0d10, Deception: 3d10, Speed: 2d10, Muscle: 3d10, Athletics: 2d10, Detect: 3d10, Meditation: 3d10
Qi: 4
Max Wounds: 14
Weapons: Guan Dao (Damage 5d10), Ox Tail Dao (5d10)
Combat Technique: Heavy Melee - Reach
Key Kung Fu Techniques (Waijia 2, Qinggong 1, Neigong 1): Biting Blade, Deep Biting Blade, Double Thrust, Eagle Descends Loudly, Endless Arc of the Spear, Fierce Strike, Flight of the Hawk, Great Stride, Heart Smashing Palm, Iron Spirit, Iron Spirit Resistance (Counter), Iron Spirit Reversal (Counter), Whirling Dodge (Counter)
Powers
Dark Qi Energy: The Yao are immune to mundane Attacks, regenerate, and their Neigong Damage gains 1 Extra Wound.
Regeneration: The Yao regenerate 4 Wounds every ten minutes, including lost limbs, unless the heart stone is removed.
Heartless: Their true hearts are kept by the emperor; destroying or restoring the original heart changes their fate.`
  }
];

function slug(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function idFrom(seed = "") {
  let hash = 0;
  for (const char of seed) hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, "0").repeat(2).slice(0, 16);
}

function normalizeKey(value = "") {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveSkill(name = "") {
  const normalized = normalizeKey(name);
  for (const [groupKey, group] of Object.entries(OGRE_GATE.skillGroups)) {
    if (groupKey === "defenses") continue;
    for (const [skillKey, label] of Object.entries(group.skills)) {
      if (normalizeKey(label) === normalized || normalizeKey(skillKey) === normalized) {
        return { group: groupKey, skillKey, name: label };
      }
    }
  }
  const parenthetical = String(name).match(/^(.+?)\s*\((.+)\)$/);
  if (parenthetical) {
    const base = parenthetical[1].trim();
    const specific = parenthetical[2].trim();
    const baseKey = normalizeKey(base);
    const group = ["talent", "trade", "survival", "ritual"].includes(baseKey) ? "specialist" : "knowledge";
    return { group, skillKey: `${baseKey}.${normalizeKey(specific)}`, name: `${base}: ${specific}` };
  }
  return { group: "specialist", skillKey: normalized || "custom", name: name || "Imported Skill" };
}

function skillItem(actorId, entry) {
  const resolved = resolveSkill(entry.name);
  const id = idFrom(`${actorId}-skill-${resolved.group}-${resolved.skillKey}`);
  return {
    _id: id,
    name: resolved.name,
    type: "skills",
    img: "icons/svg/book.svg",
    system: {
      description: "Imported from Chapter 10 statblock.",
      source: "Wandering Heroes of Ogre Gate, Chapter 10: Threats and Monsters",
      cost: "",
      group: resolved.group,
      skillKey: resolved.skillKey,
      sort: 0,
      ranks: Math.max(0, Number(entry.dice ?? 0)),
      modifier: 0,
      drain: 0,
      expertise: "",
      expertiseNote: "",
      expertiseList: []
    },
    effects: [],
    flags: {},
    ownership: { default: 0 }
  };
}

function weaponItem(actorId, entry) {
  const name = entry.name.replace(/^(or|and)\s+/i, "").trim();
  const catalog = WEAPON_CATALOG.find((candidate) => normalizeKey(candidate.name) === normalizeKey(name)
    || normalizeKey(candidate.name).includes(normalizeKey(name))
    || normalizeKey(name).includes(normalizeKey(candidate.name)));
  const id = idFrom(`${actorId}-weapon-${name}`);
  return {
    _id: id,
    name,
    type: "weapon",
    img: "icons/svg/sword.svg",
    system: {
      description: entry.notes || catalog?.description || catalog?.qualities || "Imported from Chapter 10 statblock.",
      source: catalog ? "Wandering Heroes of Ogre Gate, Chapter 5: Equipment and Goods" : "Wandering Heroes of Ogre Gate, Chapter 10: Threats and Monsters",
      cost: catalog?.cost ?? "",
      category: catalog?.category ?? catalog?.attackSkill ?? "mediumMelee",
      attackSkill: catalog?.attackSkill ?? catalog?.category ?? "mediumMelee",
      targetDefense: catalog?.targetDefense ?? "parry",
      damageSkill: catalog?.damageSkill ?? "",
      damageDice: entry.damageDice == null ? Number(catalog?.damageDice ?? 0) : Math.max(-1, Number(entry.damageDice ?? 0)),
      accuracyModifier: Number(entry.accuracyModifier ?? catalog?.accuracyModifier ?? 0),
      equipped: true,
      parryBonus: Number(catalog?.parryBonus ?? 0),
      evadeBonus: Number(catalog?.evadeBonus ?? 0),
      muscleRequirement: Number(catalog?.muscleRequirement ?? 0),
      lethal: catalog?.lethal ?? true,
      damageType: catalog?.damageType ?? "special",
      reach: catalog?.reach ?? "normal",
      openDamage: Boolean(catalog?.openDamage),
      qualities: [catalog?.qualities ?? "", entry.notes ?? ""].filter(Boolean).join(" ")
    },
    effects: [],
    flags: {},
    ownership: { default: 0 }
  };
}

function equipmentItem(actorId, name) {
  const id = idFrom(`${actorId}-equipment-${name}`);
  return {
    _id: id,
    name,
    type: "equipment",
    img: "icons/svg/item-bag.svg",
    system: {
      description: "Imported from Chapter 10 statblock.",
      source: "Wandering Heroes of Ogre Gate, Chapter 10: Threats and Monsters",
      cost: "",
      category: "general",
      quantity: 1,
      weight: "",
      performanceRating: 0,
      handlingSpeed: "",
      milesPerDay: "",
      speedScore: "",
      evade: 0,
      hardiness: 0,
      integrity: 0,
      damage: ""
    },
    effects: [],
    flags: {},
    ownership: { default: 0 }
  };
}

function techniqueItem(actorId, name) {
  const id = idFrom(`${actorId}-technique-${name}`);
  return {
    _id: id,
    name: name.replace(/\s*\((Counter)\)\s*/i, "").trim(),
    type: "technique",
    img: "icons/svg/aura.svg",
    system: {
      description: "Imported Chapter 10 statblock technique placeholder. Replace from the Kung Fu Techniques compendium for full structured rules.",
      source: "Wandering Heroes of Ogre Gate, Chapter 10: Threats and Monsters",
      cost: "",
      discipline: "none",
      techniqueType: /\(Counter\)/i.test(name) ? "counter" : "normal",
      activationSkill: "",
      targetDefense: "tn",
      targetNumber: 6,
      qiRank: 0
    },
    effects: [],
    flags: {},
    ownership: { default: 0 }
  };
}

function cleanNoteText(value = "") {
  return String(value ?? "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

async function actorDoc(entry) {
  const parsed = parseOgreGateStatblock(entry.text);
  const folder = FOLDERS[entry.folderKey ?? "humanThreats"] ?? FOLDERS.humanThreats;
  const biography = cleanNoteText(entry.biography ?? parsed.description);
  const items = (await statblockItemData(parsed)).map((item, index) => ({
    _id: item._id ?? idFrom(`${entry.id}-embedded-${index}-${item.type}-${item.name}`),
    ...item,
    effects: item.effects ?? [],
    flags: item.flags ?? {},
    ownership: item.ownership ?? { default: 0 }
  }));
  const system = {
    creation: { enabled: false },
    qi: {
      rank: Math.max(0, Number(parsed.qi ?? 0)),
      temporary: 0
    },
    resources: {
      wounds: {
        value: Number(parsed.maxWounds ?? 1),
        max: Number(parsed.maxWounds ?? 1),
        autoMax: false
      },
      qi: {
        value: Math.max(0, Number(parsed.qi ?? 0)),
        max: Math.max(6, Number(parsed.qi ?? 0)),
        autoMax: true
      }
    },
    status: {
      effectiveQi: Math.max(0, Number(parsed.qi ?? 0)),
      woundState: "healthy"
    },
    notes: {
      status: "",
      biography,
      description: ""
    }
  };
  for (const [key, value] of Object.entries(parsed.defenses ?? {})) {
    system.defenses ??= {};
    system.defenses[key] = { base: Number(value), ranks: 0, qiBonus: 0, modifier: 0, drain: 0 };
  }
  for (const [key, value] of Object.entries(parsed.disciplines ?? {})) {
    system.disciplines ??= {};
    system.disciplines[key] = { ranks: Number(value), modifier: 0, drain: 0 };
  }
  return {
    _id: entry.id,
    name: entry.name,
    type: entry.type ?? "npc",
    img: entry.type === "monster" ? "icons/svg/acid.svg" : "icons/svg/mystery-man.svg",
    system,
    items,
    effects: [],
    folder: folder.id,
    flags: {
      ogregatefoundry: {
        sourceChapter: entry.sourceChapter ?? 10,
        sourceSection: entry.sourceSection ?? folder.section,
        statblock: entry.text
      }
    },
    ownership: { default: 0 },
    _key: `!actors!${entry.id}`
  };
}

await rm(source, { recursive: true, force: true });

for (const [index, folderConfig] of Object.values(FOLDERS).entries()) {
  const directory = path.join(source, folderConfig.directory);
  await mkdir(directory, { recursive: true });
  const folder = {
    _id: folderConfig.id,
    name: folderConfig.name,
    type: "Actor",
    sorting: "a",
    sort: index * 100000,
    color: null,
    flags: {},
    folder: null,
    _key: `!folders!${folderConfig.id}`
  };
  await writeFile(path.join(directory, "_Folder.json"), `${JSON.stringify(folder, null, 2)}\n`);
}

for (const entry of STATBLOCKS) {
  const folder = FOLDERS[entry.folderKey ?? "humanThreats"] ?? FOLDERS.humanThreats;
  await writeFile(path.join(source, folder.directory, `${slug(entry.name)}.json`), `${JSON.stringify(await actorDoc(entry), null, 2)}\n`);
}

console.log(JSON.stringify({
  actors: STATBLOCKS.length,
  folders: Object.values(FOLDERS).map((folder) => folder.name)
}, null, 2));
