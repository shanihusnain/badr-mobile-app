export type PendingPasswordReset = {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  source: "change-password" | "forgot-password";
};

let pending: PendingPasswordReset | null = null;

export function setPendingPasswordReset(value: PendingPasswordReset) {
  pending = value;
}

export function getPendingPasswordReset(): PendingPasswordReset | null {
  return pending;
}

export function clearPendingPasswordReset() {
  pending = null;
}
