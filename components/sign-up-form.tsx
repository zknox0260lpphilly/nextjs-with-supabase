"use client";

import { cn } from "@/lib/utils";
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
import { USER_TYPES, type UserType } from "@/lib/i18n/constants";

export type SignUpLabels = {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  repeatPassword: string;
  iAm: string;
  userTypes: Record<UserType, string>;
  ageConfirm: string;
  mismatch: string;
  submit: string;
  submitting: string;
  haveAccount: string;
  signIn: string;
  error: string;
};

// What the visitor already told us on the welcome screens. It is saved on
// their profile (the database creates the profile when the account is made).
export type SignUpDefaults = {
  language: string;
  country: string;
  region: string;
  city: string;
};

export function SignUpForm({
  labels,
  defaults,
  className,
  ...props
}: {
  labels: SignUpLabels;
  defaults: SignUpDefaults;
} & React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("community_member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(labels.mismatch);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            language: defaults.language,
            country: defaults.country,
            department: defaults.region,
            city: defaults.city,
            user_type: userType,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch {
      setError(labels.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{labels.title}</CardTitle>
          <CardDescription>{labels.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{labels.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-type">{labels.iAm}</Label>
                <select
                  id="user-type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  {USER_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {labels.userTypes[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{labels.password}</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">{labels.repeatPassword}</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required className="size-4" />
                {labels.ageConfirm}
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? labels.submitting : labels.submit}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {labels.haveAccount}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {labels.signIn}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
