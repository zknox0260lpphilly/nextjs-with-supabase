import { Suspense } from "react";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { getT } from "@/lib/i18n/server";

async function UpdatePassword() {
  const { lang, t } = await getT();
  return (
    <AuthFrame lang={lang}>
      <UpdatePasswordForm
        labels={{
          title: t("forgotTitle"),
          newPassword: t("newPassword"),
          submit: t("savePassword"),
          submitting: t("saving"),
          error: t("errorGeneric"),
        }}
      />
    </AuthFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <UpdatePassword />
    </Suspense>
  );
}
