"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { deleteCategoryImage, uploadCategoryImage } from "@/lib/admin/category-images";
import { t } from "@/lib/i18n";

interface CategoryImageUploaderProps {
  image: string | null;
  onChange: (image: string | null) => void;
  aspect?: "square" | "wide";
}

// Single-image uploader for a category's thumbnail or banner — same upload flow as
// ProductImageUploader, but for one image at a time in the dedicated category-images bucket.
export function CategoryImageUploader({ image, onChange, aspect = "square" }: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setIsUploading(true);

    const previous = image;
    const url = await uploadCategoryImage(file);

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!url) return;

    onChange(url);
    if (previous) void deleteCategoryImage(previous);
  }

  function removeImage() {
    if (image) void deleteCategoryImage(image);
    onChange(null);
  }

  const sizeClass = aspect === "wide" ? "aspect-[3/1] w-full max-w-md" : "size-24";

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg border border-dashed border-border bg-muted ${sizeClass}`}>
      {image ? (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="group size-full">
          <Image src={image} alt="" fill sizes="384px" className="object-cover" />
          {isUploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-5 animate-spin" />
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              removeImage();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.stopPropagation();
                removeImage();
              }
            }}
            className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
            aria-label={t("common.remove")}
          >
            <X className="size-3" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
