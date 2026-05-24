function getHtmlElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

function getAffectedActors() {
  const targetTokens = Array.from(game.user?.targets ?? []);
  const controlledTokens = canvas?.tokens?.controlled ?? [];
  const tokens = targetTokens.length ? targetTokens : controlledTokens;
  const actors = tokens.map((token) => token.actor).filter(Boolean);
  return Array.from(new Set(actors));
}

async function applyWoundsFromChat(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const wounds = Math.max(0, Math.trunc(Number(button.dataset.wounds ?? 0)));
  if (!wounds) return;

  const actors = getAffectedActors();
  if (!actors.length) {
    ui.notifications.warn("Target or select at least one token before applying wounds.");
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
    ui.notifications.warn("You do not have permission to apply wounds to the targeted or selected actor.");
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
  });
}
