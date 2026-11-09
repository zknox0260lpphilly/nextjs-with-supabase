import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { getT } from "@/lib/i18n/server";

async function Success() {
  const { lang, t } = await getT();
  return (
    <AuthFrame lang={lang}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signupDone")}</CardTitle>
          <CardDescription>{t("signupDoneSub")}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </AuthFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Success />
    </Suspense>
  );
}
