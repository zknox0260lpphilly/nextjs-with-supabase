import { cn } from "@/lib/utils";

// Placeholder drawing of the Ekip mark (three people joined together).
// Replace with the real logo file when it is ready.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Ekip"
      className={cn("size-12", className)}
    >
      <circle cx="50" cy="19" r="9" fill="#C8243C" />
      <circle cx="21" cy="40" r="9" fill="#1B2A6B" />
      <circle cx="79" cy="40" r="9" fill="#1B2A6B" />
      <path
        d="M7 86C5 66 14 55 26 56c8 1 13 7 19 18l5 10c-8 4-14 5-22 5-10 0-17 0-21-3Z"
        fill="#1B2A6B"
      />
      <path
        d="M93 86c2-20-7-31-19-30-8 1-13 7-19 18l-5 10c8 4 14 5 22 5 10 0 17 0 21-3Z"
        fill="#1B2A6B"
      />
      <path
        d="M50 82 35 56c-4-8 0-15 7-15 4 0 7 2 8 5 1-3 4-5 8-5 7 0 11 7 7 15L50 82Z"
        fill="#C8243C"
      />
    </svg>
  );
}

// Small arch used next to the name on the language screen.
export function BridgeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M4 19V13a8 8 0 0 1 16 0v6" />
    </svg>
  );
}
