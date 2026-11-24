"use client";

import { cn } from "@/lib/utils";
import { authErrorMessage, type AuthErrorLabels } from "@/lib/ekip/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type UpdatePasswordLabels = {
  title: string;
  newPassword: string;
  submit: string;
  submitting: string;
  newLink: string;
  errors: AuthErrorLabels;
};

export function UpdatePasswordForm({
  labels,
  className,
  ...props
}: { labels: UpdatePasswordLabels } & React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setExpired(false);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/profile");
    } catch (error: unknown) {
      const result = authErrorMessage(error, labels.errors);
      setError(result.message);
      setExpired(result.expired);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{labels.title}</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{labels.newPassword}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {expired && (
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium underline underline-offset-4"
                >
                  {labels.newLink}
                </Link>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? labels.submitting : labels.submit}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
