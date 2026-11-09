import { Suspense } from "react";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { LoginForm } from "@/components/login-form";
import { getT } from "@/lib/i18n/server";

async function Login() {
  const { lang, t } = await getT();
  return (
    <AuthFrame lang={lang}>
      <LoginForm
        labels={{
          title: t("loginTitle"),
          subtitle: t("loginSub"),
          email: t("email"),
          password: t("password"),
          forgot: t("forgotPassword"),
          submit: t("signIn"),
          submitting: t("signingIn"),
          noAccount: t("noAccount"),
          signUp: t("createAccount"),
          error: t("errorGeneric"),
        }}
      />
    </AuthFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
