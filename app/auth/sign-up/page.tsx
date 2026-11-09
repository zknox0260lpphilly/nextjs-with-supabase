import { Suspense } from "react";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { SignUpForm } from "@/components/sign-up-form";
import { getLocation, getT } from "@/lib/i18n/server";

async function SignUp() {
  const [{ lang, t }, location] = await Promise.all([getT(), getLocation()]);
  return (
    <AuthFrame lang={lang}>
      <SignUpForm
        defaults={{
          language: lang,
          country: location?.country ?? "",
          region: location?.region ?? "",
          city: location?.city ?? "",
        }}
        labels={{
          title: t("signupTitle"),
          subtitle: t("signupSub"),
          email: t("email"),
          password: t("password"),
          repeatPassword: t("repeatPassword"),
          iAm: t("iAm"),
          userTypes: {
            student: t("userStudent"),
            teacher: t("userTeacher"),
            community_member: t("userCommunity"),
          },
          ageConfirm: t("ageConfirm"),
          mismatch: t("passwordsMismatch"),
          submit: t("createAccount"),
          submitting: t("creating"),
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
      <SignUp />
    </Suspense>
  );
}
