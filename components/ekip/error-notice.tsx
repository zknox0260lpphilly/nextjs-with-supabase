import type { Translator } from "@/lib/i18n/translations";
import { Notice } from "./fields";

// Shows why an action failed, from the ?e= code in the address.
export function ErrorNotice({
  code,
  t,
}: {
  code: string | undefined;
  t: Translator;
}) {
  if (!code) return null;
  const message =
    code === "profile"
      ? t("errNoProfile")
      : code === "db"
        ? t("dbNotReady")
        : code === "denied"
          ? t("errDenied")
          : t("errorGeneric");
  return <Notice tone="error">{message}</Notice>;
}
