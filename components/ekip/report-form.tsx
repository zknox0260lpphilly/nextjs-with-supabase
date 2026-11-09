import { Flag } from "lucide-react";
import { reportContent } from "@/lib/ekip/actions";
import type { Translator } from "@/lib/i18n/translations";
import { TextArea } from "./fields";

// "Report" link that opens a small form. Anyone signed in can report a
// request, an offer or a person that looks like a scam.
export function ReportForm({
  kind,
  id,
  back,
  t,
}: {
  kind: "request" | "offer" | "profile";
  id: string;
  back: string;
  t: Translator;
}) {
  return (
    <details className="group text-sm">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <Flag className="size-3.5" aria-hidden />
        {t("report")}
      </summary>
      <form action={reportContent} className="mt-2 grid gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="back" value={back} />
        <label htmlFor={`reason-${id}`} className="text-xs font-medium">
          {t("reportWhy")}
        </label>
        <TextArea
          id={`reason-${id}`}
          name="reason"
          required
          maxLength={1000}
          className="min-h-16"
        />
        <button
          type="submit"
          className="h-9 w-fit rounded-md border px-3 text-xs font-medium hover:bg-accent"
        >
          {t("reportSend")}
        </button>
      </form>
    </details>
  );
}
