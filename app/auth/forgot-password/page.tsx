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
          error: t("errorGeneric"),
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
