import { OGRE_GATE } from "./module/config.mjs";
import { registerChatListeners } from "./module/chat.mjs";
import { OgreGateActor, OgreGateItem } from "./module/documents.mjs";
import {
  OgreGateCharacterData,
  OgreGateNpcData,
  OgreGateMonsterData,
  OgreGateArmorData,
  OgreGateEquipmentData,
  OgreGateFlawData,
  OgreGateCombatTechniqueData,
  OgreGateSkillData,
  OgreGateRitualData,
  OgreGateTechniqueData,
  OgreGateWeaponData
} from "./module/data-models.mjs";
import { OgreGateActorSheet } from "./module/sheets/actor-sheet.mjs";
import { OgreGateItemSheet } from "./module/sheets/item-sheet.mjs";

function applySheetTheme(enabled = true) {
  document.body?.classList.toggle("ogre-gate-dark-sheets", Boolean(enabled));
}

Hooks.once("init", () => {
  registerChatListeners();

  game.ogreGate = {
    config: OGRE_GATE
  };

  game.settings.register(OGRE_GATE.id, "darkSheets", {
    name: "Use Dark Ogre Gate Sheets",
    hint: "Use a higher-contrast dark theme for Ogre Gate actor and item sheets.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: applySheetTheme
  });

  game.settings.register(OGRE_GATE.id, "deepPenalties", {
    name: "Use Deep Penalties",
    hint: "When enabled, negative dice pools roll more than 2d10 and keep the lowest die.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(OGRE_GATE.id, "deadlyTens", {
    name: "Use Deadly 10s",
    hint: "When enabled, attack roll total successes can add extra wounds before damage.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  CONFIG.OGRE_GATE = OGRE_GATE;
  CONFIG.Actor.documentClass = OgreGateActor;
  CONFIG.Item.documentClass = OgreGateItem;

  CONFIG.Actor.dataModels = {
    character: OgreGateCharacterData,
    npc: OgreGateNpcData,
    monster: OgreGateMonsterData
  };

  CONFIG.Item.dataModels = {
    weapon: OgreGateWeaponData,
    armor: OgreGateArmorData,
    equipment: OgreGateEquipmentData,
    skills: OgreGateSkillData,
    technique: OgreGateTechniqueData,
    combatTechnique: OgreGateCombatTechniqueData,
    ritual: OgreGateRitualData,
    flaw: OgreGateFlawData
  };

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.wounds", "resources.qi"],
      value: ["qi.rank", "imbalance.value"]
    },
    npc: {
      bar: ["resources.wounds", "resources.qi"],
      value: ["qi.rank"]
    },
    monster: {
      bar: ["resources.wounds", "resources.qi"],
      value: ["qi.rank"]
    }
  };

  const { DocumentSheetConfig } = foundry.applications.apps;

  DocumentSheetConfig.registerSheet(Actor, OGRE_GATE.id, OgreGateActorSheet, {
    types: ["character", "npc", "monster"],
    makeDefault: true
  });

  DocumentSheetConfig.registerSheet(Item, OGRE_GATE.id, OgreGateItemSheet, {
    types: ["weapon", "armor", "equipment", "skills", "technique", "combatTechnique", "ritual", "flaw"],
    makeDefault: true
  });
});

Hooks.once("ready", () => {
  applySheetTheme(game.settings.get(OGRE_GATE.id, "darkSheets"));
});
