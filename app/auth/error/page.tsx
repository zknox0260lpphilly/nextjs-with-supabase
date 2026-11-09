import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthFrame } from "@/components/ekip/auth-frame";
import { getT } from "@/lib/i18n/server";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const [{ lang, t }, params] = await Promise.all([getT(), searchParams]);
  return (
    <AuthFrame lang={lang}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("authErrorTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {params?.error ? (
            <p className="text-sm text-muted-foreground">{params.error}</p>
          ) : null}
        </CardContent>
      </Card>
    </AuthFrame>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <Suspense>
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  );
}
