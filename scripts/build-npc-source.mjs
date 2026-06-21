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
  monsters: {
    id: "f9c4a6d84503b812",
    name: "Monsters",
    directory: "monsters",
    section: "Monsters"
  }
};

const STATBLOCKS = [
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

async function actorDoc(entry) {
  const parsed = parseOgreGateStatblock(entry.text);
  const folder = FOLDERS[entry.folderKey ?? "humanThreats"] ?? FOLDERS.humanThreats;
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
      description: parsed.description ? `<p>${parsed.description}</p>` : ""
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
        sourceChapter: 10,
        sourceSection: folder.section,
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
