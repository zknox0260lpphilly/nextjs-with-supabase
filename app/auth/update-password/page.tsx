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
          newLink: t("requestNewLink"),
          errors: {
            generic: t("errorGeneric"),
            badLogin: t("errBadLogin"),
            notConfirmed: t("errNotConfirmed"),
            alreadyRegistered: t("errAlreadyRegistered"),
            samePassword: t("errSamePassword"),
            weakPassword: t("errWeakPassword"),
            linkExpired: t("errLinkExpired"),
          },
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
