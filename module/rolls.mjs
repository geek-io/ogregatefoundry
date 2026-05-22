import { OGRE_GATE } from "./config.mjs";

function getDiceResults(roll) {
  return roll.dice.flatMap((die) => die.results.map((result) => result.result));
}

function formatDice(results) {
  return results.map((result) => `<span class="ogre-gate-die${result === 10 ? " total-success" : ""}">${result}</span>`).join("");
}

async function createRollMessage({ actor, label, roll, results, selected, tn, success, totalSuccesses, poolLabel, rollMode, extra = "" }) {
  const content = `
    <section class="ogre-gate-chat-card">
      <h3>${label}</h3>
      <div class="ogre-gate-chat-row"><strong>Pool</strong><span>${poolLabel}</span></div>
      <div class="ogre-gate-chat-row"><strong>TN</strong><span>${tn}</span></div>
      <div class="ogre-gate-chat-dice">${formatDice(results)}</div>
      <div class="ogre-gate-chat-row"><strong>Result</strong><span>${selected}</span></div>
      <div class="ogre-gate-chat-outcome ${success ? "success" : "failure"}">${success ? "Success" : "Failure"}</div>
      ${totalSuccesses ? `<div class="ogre-gate-chat-outcome total">Total Success x${totalSuccesses}</div>` : ""}
      ${extra}
    </section>
  `;

  return roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label,
    content
  }, { rollMode: rollMode ?? game.settings.get("core", "rollMode") });
}

export class OgreGateRoll {
  static resolvePool(ranks, modifier = 0, { deepPenalties = false, breakCap = false } = {}) {
    const effective = Number(ranks ?? 0) + Number(modifier ?? 0);
    if (effective > 0) {
      const cap = breakCap ? OGRE_GATE.hardCap : OGRE_GATE.skillCap;
      return {
        effective,
        dice: Math.clamp(effective, 1, cap),
        keep: "highest",
        formula: `${Math.clamp(effective, 1, cap)}d10`,
        label: `${Math.clamp(effective, 1, cap)}d10`
      };
    }

    const dice = deepPenalties ? Math.clamp(2 + Math.abs(effective), 2, OGRE_GATE.skillCap) : 2;
    return {
      effective,
      dice,
      keep: "lowest",
      formula: `${dice}d10`,
      label: effective < 0 && deepPenalties ? `${dice}d10L` : "0d10"
    };
  }

  static evaluateResults(results, tn, keep = "highest", { open = false } = {}) {
    const selected = keep === "lowest" ? Math.min(...results) : Math.max(...results);
    const successes = results.filter((result) => result >= tn).length;
    const tens = results.filter((result) => result === 10).length;
    const success = open ? successes > 0 : selected >= tn;
    const totalSuccesses = tn >= 10 ? Math.max(0, tens - 1) : tens;
    return { selected, success, successes, totalSuccesses, tens };
  }

  static async skill({ actor, label, ranks, modifier = 0, tn = 6, rollMode, deepPenalties = false, extra = "" } = {}) {
    const pool = this.resolvePool(ranks, modifier, { deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, tn, pool.keep);

    return createRollMessage({
      actor,
      label,
      roll,
      results,
      selected: outcome.selected,
      tn,
      success: outcome.success,
      totalSuccesses: outcome.totalSuccesses,
      poolLabel: pool.label,
      rollMode,
      extra
    });
  }

  static async attack({ actor, label = "Attack", ranks, modifier = 0, defense = "Parry", mode = "", tn = 6, deadlyTens = false, rollMode } = {}) {
    const pool = this.resolvePool(ranks, modifier, { deepPenalties: actor?.system?.combat?.deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, tn, pool.keep);
    const damageBonus = outcome.totalSuccesses;
    const deadlyWounds = deadlyTens ? outcome.totalSuccesses : 0;
    const extra = `
      ${mode ? `<div class="ogre-gate-chat-row"><strong>Mode</strong><span>${mode}</span></div>` : ""}
      <div class="ogre-gate-chat-row"><strong>Defense</strong><span>${defense}</span></div>
      <div class="ogre-gate-chat-row"><strong>Damage Bonus</strong><span>+${damageBonus}d10</span></div>
      ${deadlyWounds ? `<div class="ogre-gate-chat-row"><strong>Deadly 10s</strong><span>${deadlyWounds} extra Wound(s)</span></div>` : ""}
    `;

    return createRollMessage({
      actor,
      label,
      roll,
      results,
      selected: outcome.selected,
      tn,
      success: outcome.success,
      totalSuccesses: outcome.totalSuccesses,
      poolLabel: pool.label,
      rollMode,
      extra
    });
  }

  static async damage({ actor, label = "Damage", dice, hardiness = 6, open = false, modifier = 0, extraWounds = 0, note = "", rollMode } = {}) {
    const pool = this.resolvePool(dice ?? 1, modifier, { deepPenalties: actor?.system?.combat?.deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, hardiness, pool.keep, { open });
    const baseWounds = open ? outcome.successes + outcome.totalSuccesses : (outcome.success ? 1 + outcome.totalSuccesses : 0);
    const wounds = Math.max(0, baseWounds + Number(extraWounds ?? 0));
    const extra = `
      <div class="ogre-gate-chat-row"><strong>Wounds</strong><span>${wounds}</span></div>
      ${extraWounds ? `<div class="ogre-gate-chat-row"><strong>Wound Modifier</strong><span>${extraWounds}</span></div>` : ""}
      ${note ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${note}</span></div>` : ""}
      ${wounds ? `<button type="button" class="ogre-gate-chat-button" data-action="ogre-apply-wounds" data-wounds="${wounds}">Apply Wounds</button>` : ""}
    `;

    return createRollMessage({
      actor,
      label,
      roll,
      results,
      selected: outcome.selected,
      tn: hardiness,
      success: outcome.success,
      totalSuccesses: outcome.totalSuccesses,
      poolLabel: `${pool.label}${open ? " Open" : " Closed"}`,
      rollMode,
      extra
    });
  }
}
