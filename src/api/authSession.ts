type ForceSignOutHandler = () => Promise<void> | void;

let forceSignOutHandler: ForceSignOutHandler | null = null;

export function registerForceSignOut(handler: ForceSignOutHandler) {
  forceSignOutHandler = handler;
}

export async function forceSignOut() {
  if (forceSignOutHandler) {
    await forceSignOutHandler();
  }
}
