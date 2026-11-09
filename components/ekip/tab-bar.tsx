"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageCircle, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Labels = {
  home: string;
  explore: string;
  post: string;
  messages: string;
  profile: string;
};

export function TabBar({ labels }: { labels: Labels }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: labels.home, icon: Home },
    { href: "/explore", label: labels.explore, icon: Compass },
    { href: "/post", label: labels.post, icon: PlusCircle },
    { href: "/messages", label: labels.messages, icon: MessageCircle },
    { href: "/profile", label: labels.profile, icon: User },
  ];

  return (
    <nav
      aria-label="Ekip"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="mx-auto flex max-w-3xl">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
