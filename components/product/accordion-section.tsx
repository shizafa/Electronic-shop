"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-foreground">{title}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-3 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}