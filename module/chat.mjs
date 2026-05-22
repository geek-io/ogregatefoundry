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

export function registerChatListeners() {
  Hooks.on("renderChatMessage", (_message, html) => {
    const root = getHtmlElement(html);
    if (!root) return;
    root.querySelectorAll("[data-action='ogre-apply-wounds']").forEach((button) => {
      button.addEventListener("click", applyWoundsFromChat);
    });
  });
}
