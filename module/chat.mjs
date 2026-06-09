function getHtmlElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

function getAffectedActors() {
  const targetTokens = Array.from(game.user?.targets ?? []);
  const actors = targetTokens.map((token) => token.actor).filter(Boolean);
  return Array.from(new Set(actors));
}

function firstTargetHardiness() {
  const actor = Array.from(game.user?.targets ?? []).map((token) => token.actor).find(Boolean);
  return Number(actor?.system?.defenses?.hardiness?.rating ?? 6) || 6;
}

function promptDamageTargetNumber(label, initial = 6) {
  return new Promise((resolve) => {
    new Dialog({
      title: `${label} TN`,
      content: `
        <form class="ogre-gate-dialog">
          <label>Damage TN
            <input type="number" name="tn" value="${Math.clamp(Number(initial ?? 6), 1, 10)}" min="1" max="10" autofocus />
          </label>
        </form>
      `,
      buttons: {
        roll: {
          label: "Roll",
          callback: (html) => {
            const root = html instanceof HTMLElement ? html : html?.[0];
            const value = Number(root?.querySelector("[name='tn']")?.value ?? initial);
            resolve(Math.clamp(value, 1, 10));
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => resolve(null)
        }
      },
      default: "roll",
      close: () => resolve(null)
    }).render(true);
  });
}

async function applyWoundsFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const wounds = Math.max(0, Math.trunc(Number(button.dataset.wounds ?? 0)));
  if (!wounds) return;

  const specifiedActor = button.dataset.actorUuid
    ? await fromUuid(button.dataset.actorUuid)
    : button.dataset.actorId
      ? game.actors.get(button.dataset.actorId)
      : null;
  const actors = specifiedActor ? [specifiedActor] : getAffectedActors();
  if (!actors.length) {
    ui.notifications.warn("Target at least one token before applying wounds.");
    return;
  }

  button.disabled = true;
  const applied = [];
  for (const actor of actors) {
    if (!actor.isOwner) continue;
    await actor.applyWounds(wounds);
    applied.push(actor.name);
  }

  if (!applied.length) {
    button.disabled = false;
    ui.notifications.warn("You do not have permission to apply wounds to the targeted actor.");
    return;
  }

  ui.notifications.info(`Applied ${wounds} wound(s) to ${applied.join(", ")}.`);
}

async function bankDamageBonusFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const bonus = Math.max(0, Math.trunc(Number(button.dataset.bonus ?? 0)));
  if (!bonus) return;

  const actor = button.dataset.actorUuid
    ? await fromUuid(button.dataset.actorUuid)
    : game.actors.get(button.dataset.actorId);

  if (!actor?.isOwner) {
    ui.notifications.warn("You do not have permission to update this actor's damage bonus.");
    return;
  }

  button.disabled = true;
  await actor.update({ "system.combat.pendingDamageBonus": bonus });
  ui.notifications.info(`${actor.name} will add +${bonus}d10 to their next weapon damage roll.`);
}

async function rollWeaponDamageFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const actor = button.dataset.actorUuid
    ? await fromUuid(button.dataset.actorUuid)
    : game.actors.get(button.dataset.actorId);

  if (!actor?.isOwner) {
    ui.notifications.warn("You do not have permission to roll damage for this actor.");
    return;
  }

  const item = button.dataset.itemUuid
    ? await fromUuid(button.dataset.itemUuid)
    : actor.items.get(button.dataset.itemId);
  if (!item || item.type !== "weapon") {
    ui.notifications.warn("The weapon for this attack could not be found.");
    return;
  }

  const hardiness = await promptDamageTargetNumber(`${item.name} Damage`, firstTargetHardiness());
  if (!hardiness) return;
  button.disabled = true;
  await actor.rollWeaponDamage(item, {
    hardiness,
    damageBonus: Math.max(0, Math.trunc(Number(button.dataset.bonus ?? 0))),
    consumeDamageBonus: true
  });
}

async function bankTechniqueNormalDamageFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const damageModifier = Math.trunc(Number(button.dataset.damageModifier ?? 0));
  const extraWounds = Math.max(0, Math.trunc(Number(button.dataset.extraWounds ?? 0)));
  const label = button.dataset.label ?? "Technique";

  const actor = button.dataset.actorUuid
    ? await fromUuid(button.dataset.actorUuid)
    : game.actors.get(button.dataset.actorId);

  if (!actor?.isOwner) {
    ui.notifications.warn("You do not have permission to update this actor's pending damage.");
    return;
  }

  button.disabled = true;
  await actor.update({
    "system.combat.pendingDamageModifier": Number(actor.system.combat.pendingDamageModifier ?? 0) + damageModifier,
    "system.combat.pendingExtraWounds": Number(actor.system.combat.pendingExtraWounds ?? 0) + extraWounds
  });
  ui.notifications.info(`${actor.name}'s next damage roll includes ${label}${damageModifier ? ` (${damageModifier > 0 ? "+" : ""}${damageModifier}d10)` : ""}${extraWounds ? ` (+${extraWounds} Wound${extraWounds === 1 ? "" : "s"})` : ""}.`);
}

async function applyDrainFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const type = button.dataset.drainType ?? "skill";
  const key = button.dataset.drainKey ?? "";
  const amount = Math.max(0, Math.trunc(Number(button.dataset.drainAmount ?? 0)));
  const label = button.dataset.drainLabel ?? (key || type);
  if (!amount) return;

  const actor = button.dataset.actorUuid
    ? await fromUuid(button.dataset.actorUuid)
    : button.dataset.actorId
      ? game.actors.get(button.dataset.actorId)
      : null;

  if (!actor) {
    ui.notifications.warn("No actor was recorded for this drain. Re-roll with a target selected.");
    return;
  }
  if (!actor.isOwner) {
    ui.notifications.warn("You do not have permission to apply drain to this actor.");
    return;
  }

  button.disabled = true;
  const updates = await actor.applyDrain({ type, key, amount });
  if (!Object.keys(updates).length) {
    button.disabled = false;
    ui.notifications.warn(`No matching drain target found for ${label}.`);
    return;
  }

  ui.notifications.info(`Applied ${amount} ${label} drain to ${actor.name}.`);
}

export function registerChatListeners() {
  Hooks.on("renderChatMessage", (_message, html) => {
    const root = getHtmlElement(html);
    if (!root) return;
    root.querySelectorAll("[data-action='ogre-apply-wounds']").forEach((button) => {
      button.addEventListener("click", applyWoundsFromChat);
    });
    root.querySelectorAll("[data-action='ogre-bank-damage-bonus']").forEach((button) => {
      button.addEventListener("click", bankDamageBonusFromChat);
    });
    root.querySelectorAll("[data-action='ogre-roll-weapon-damage']").forEach((button) => {
      button.addEventListener("click", rollWeaponDamageFromChat);
    });
    root.querySelectorAll("[data-action='ogre-bank-technique-normal-damage']").forEach((button) => {
      button.addEventListener("click", bankTechniqueNormalDamageFromChat);
    });
    root.querySelectorAll("[data-action='ogre-apply-drain']").forEach((button) => {
      button.addEventListener("click", applyDrainFromChat);
    });
  });
}
