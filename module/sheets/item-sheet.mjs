import { OGRE_GATE } from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class OgreGateItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["ogre-gate", "item-sheet"],
    position: {
      width: 620,
      height: 560
    },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      resizable: true
    },
    form: {
      ...super.DEFAULT_OPTIONS.form,
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/ogregatefoundry/templates/item/item-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      item: this.item,
      system: this.item.system,
      config: OGRE_GATE,
      flawRules: Object.entries(OGRE_GATE.flawRules).map(([key, rule]) => ({ key, ...rule })),
      combatTechniqueGroups: Object.entries(OGRE_GATE.combatTechniqueGroups).map(([key, label]) => ({ key, label }))
    };
  }
}
