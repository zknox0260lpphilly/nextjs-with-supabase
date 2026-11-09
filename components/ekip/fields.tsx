import * as React from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, "h-11", className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea className={cn(controlClass, "min-h-24", className)} {...props} />
  );
}

export function SelectBox({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return <select className={cn(controlClass, "h-11", className)} {...props} />;
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const tones = {
    info: "bg-muted text-foreground",
    error: "bg-destructive/10 text-destructive",
    success: "bg-secondary text-secondary-foreground",
  };
  return (
    <p role="status" className={cn("rounded-lg px-4 py-3 text-sm", tones[tone])}>
      {children}
    </p>
  );
}
