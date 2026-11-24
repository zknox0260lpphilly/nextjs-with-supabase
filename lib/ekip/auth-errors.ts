// Turns a Supabase sign-in error into a message the person can act on,
// instead of a vague "something went wrong".

export type AuthErrorLabels = {
  generic: string;
  badLogin: string;
  notConfirmed: string;
  alreadyRegistered: string;
  samePassword: string;
  weakPassword: string;
  linkExpired: string;
};

export function authErrorMessage(
  error: unknown,
  labels: AuthErrorLabels,
): { message: string; expired: boolean } {
  const { code, name, message } = (error ?? {}) as {
    code?: string;
    name?: string;
    message?: string;
  };
  const text = (message ?? "").toLowerCase();

  if (code === "invalid_credentials") return { message: labels.badLogin, expired: false };
  if (code === "email_not_confirmed") return { message: labels.notConfirmed, expired: false };
  if (code === "user_already_exists" || text.includes("already registered")) {
    return { message: labels.alreadyRegistered, expired: false };
  }
  if (code === "same_password") return { message: labels.samePassword, expired: false };
  if (code === "weak_password") return { message: labels.weakPassword, expired: false };
  if (
    name === "AuthSessionMissingError" ||
    code === "session_not_found" ||
    text.includes("session missing") ||
    text.includes("expired")
  ) {
    return { message: labels.linkExpired, expired: true };
  }
  return { message: labels.generic, expired: false };
}
