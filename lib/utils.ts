import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines conditional class names and resolves conflicting Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Turns a name into a URL-friendly, lowercase, hyphenated slug (e.g. "Sony 55\" TV" -> "sony-55-tv")
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
