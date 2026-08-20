"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/lib/admin/product-images";
import { t } from "@/lib/i18n";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImageUploader({ images, onChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const uploadedUrls = await Promise.all(Array.from(files).map((file) => uploadProductImage(file)));
    const successfulUrls = uploadedUrls.filter((url): url is string => url !== null);

    setIsUploading(false);
    if (successfulUrls.length > 0) onChange([...images, ...successfulUrls]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(url: string) {
    onChange(images.filter((image) => image !== url));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((url) => (
        <div key={url} className="group relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          <Image src={url} alt="" fill sizes="96px" className="object-cover" />
          <button
            type="button"
            onClick={() => removeImage(url)}
            className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
            aria-label={t("common.remove")}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
