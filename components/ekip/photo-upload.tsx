"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIDE = 1280;

// Shrinks the photo on the phone first, so it uploads fast on slow data.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.8,
    ),
  );
}

// Uploads a delivery photo to the private "delivery-photos" bucket and records it.
export function PhotoUpload({
  matchId,
  labels,
}: {
  matchId: string;
  labels: { add: string; help: string; uploading: string; error: string };
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFailed(false);
    try {
      const blob = await shrink(file);
      const supabase = createClient();
      const path = `${matchId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("delivery-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const { error } = await supabase
        .from("match_photos")
        .insert({ match_id: matchId, storage_path: path });
      if (error) throw error;
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        id="photo"
        onChange={onPick}
        disabled={busy}
      />
      <label
        htmlFor="photo"
        className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-accent"
      >
        <Camera className="size-4" aria-hidden />
        {busy ? labels.uploading : labels.add}
      </label>
      <p className="text-xs text-muted-foreground">{labels.help}</p>
      {failed ? (
        <p role="alert" className="text-xs text-destructive">
          {labels.error}
        </p>
      ) : null}
    </div>
  );
}
