import { Suspense } from "react";
import { Shell, ShellSkeleton } from "@/components/ekip/shell";

export default function EkipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
