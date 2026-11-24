import { Suspense } from "react";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getT } from "@/lib/i18n/server";

async function Forgot() {
  const { lang, t } = await getT();
  return (
    <AuthFrame lang={lang}>
      <ForgotPasswordForm
        labels={{
          title: t("forgotTitle"),
          subtitle: t("forgotSub"),
          email: t("email"),
          submit: t("sendLink"),
          submitting: t("sending"),
          doneTitle: t("linkSent"),
          doneBody: t("linkSentSub"),
          haveAccount: t("haveAccount"),
          signIn: t("signIn"),
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
      <Forgot />
    </Suspense>
  );
}
