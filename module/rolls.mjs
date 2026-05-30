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

function buildSpecialDamageOutcome(outcomeHint, outcome) {
  if (outcomeHint === "maim") {
    const met = outcome.totalSuccesses >= 2;
    return `
      <div class="ogre-gate-chat-outcome ${met ? "success" : "failure"}">${met ? "Maiming condition met" : "Maiming condition not met"}</div>
      <ul class="ogre-gate-chat-checklist">
        <li>Attack must have succeeded.</li>
        <li>Damage roll needs two total successes; this roll has ${outcome.totalSuccesses}.</li>
        <li>${met ? "Apply an appropriate Flaw, such as Blind or Missing Limb." : "Resolve normal wounds only unless another rule applies."}</li>
        <li>GM chooses the exact injury, consequences, and reputation fallout.</li>
      </ul>
    `;
  }

  if (outcomeHint === "disarm") {
    return `
      <div class="ogre-gate-chat-outcome ${outcome.success ? "success" : "failure"}">${outcome.success ? "Disarm succeeds" : "Disarm fails"}</div>
      <ul class="ogre-gate-chat-checklist">
        <li>Attack must have succeeded.</li>
        <li>Damage roll is checked against the target's Parry, not Hardiness.</li>
        <li>${outcome.success ? "Target drops the weapon." : "Target keeps the weapon."}</li>
        <li>Picking up a dropped weapon takes a Move.</li>
        <li>If this weapon is not suited for disarming, confirm the manual -3d10 attack penalty was applied.</li>
      </ul>
    `;
  }

  return "";
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

  static async skill({ actor, label, ranks, modifier = 0, tn = 6, rollMode, deepPenalties = false, extra = "", returnOutcome = false } = {}) {
    const pool = this.resolvePool(ranks, modifier, { deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, tn, pool.keep);

    const message = await createRollMessage({
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
    return returnOutcome ? { message, outcome, results, selected: outcome.selected } : message;
  }

  static async potency({ actor, label = "Exposure", potency = "1d10", hardiness = 6, rollMode, extra = "" } = {}) {
    const diceMatch = String(potency).match(/(\d+)\s*d10/i);
    const dice = Math.max(1, Math.min(OGRE_GATE.hardCap, Number(diceMatch?.[1] ?? 1)));
    const keep = /take\s+lowest|lowest/i.test(String(potency)) ? "lowest" : "highest";
    const roll = await new Roll(`${dice}d10`).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, hardiness, keep);
    const message = await createRollMessage({
      actor,
      label,
      roll,
      results,
      selected: outcome.selected,
      tn: hardiness,
      success: outcome.success,
      totalSuccesses: outcome.totalSuccesses,
      poolLabel: `${dice}d10${keep === "lowest" ? "L" : ""}`,
      rollMode,
      extra
    });
    return { message, outcome, results, selected: outcome.selected };
  }

  static async attack({ actor, label = "Attack", ranks, modifier = 0, defense = "Parry", mode = "", tn = 6, deadlyTens = false, deepPenalties = false, rollMode } = {}) {
    const pool = this.resolvePool(ranks, modifier, { deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, tn, pool.keep);
    const damageBonus = outcome.totalSuccesses;
    const deadlyWounds = deadlyTens ? outcome.totalSuccesses : 0;
    const extra = `
      ${mode ? `<div class="ogre-gate-chat-row"><strong>Mode</strong><span>${mode}</span></div>` : ""}
      <div class="ogre-gate-chat-row"><strong>Defense</strong><span>${defense}</span></div>
      <div class="ogre-gate-chat-row"><strong>Damage Bonus</strong><span>+${damageBonus}d10</span></div>
      ${damageBonus ? `<button type="button" class="ogre-gate-chat-button" data-action="ogre-bank-damage-bonus" data-actor-uuid="${actor?.uuid ?? ""}" data-actor-id="${actor?.id ?? ""}" data-bonus="${damageBonus}">Use +${damageBonus}d10 Damage Bonus</button>` : ""}
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

  static async damage({ actor, label = "Damage", dice, hardiness = 6, open = false, modifier = 0, extraWounds = 0, note = "", outcomeHint = "", deepPenalties = false, rollMode } = {}) {
    const pool = this.resolvePool(dice ?? 1, modifier, { deepPenalties });
    const roll = await new Roll(pool.formula).evaluate();
    const results = getDiceResults(roll);
    const outcome = this.evaluateResults(results, hardiness, pool.keep, { open });
    const baseWounds = open ? outcome.successes + outcome.totalSuccesses : (outcome.success ? 1 + outcome.totalSuccesses : 0);
    const wounds = Math.max(0, baseWounds + Number(extraWounds ?? 0));
    const specialOutcome = buildSpecialDamageOutcome(outcomeHint, outcome);
    const extra = `
      <div class="ogre-gate-chat-row"><strong>Wounds</strong><span>${wounds}</span></div>
      ${extraWounds ? `<div class="ogre-gate-chat-row"><strong>Wound Modifier</strong><span>${extraWounds}</span></div>` : ""}
      ${note ? `<div class="ogre-gate-chat-row"><strong>Note</strong><span>${note}</span></div>` : ""}
      ${specialOutcome}
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
