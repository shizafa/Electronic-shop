"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";

const MAX_PULL = 80;

interface PromoBannerMagneticButtonProps {
  href: string;
}

// Rebuilds main.min.js's rbtMagneticBtn with React event handlers instead of jQuery:
// the button translates toward the cursor (capped at 80px) and scales up on hover,
// snapping back to translate(0,0) scale(1) on mouseleave.
export function PromoBannerMagneticButton({ href }: PromoBannerMagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  function handleMouseMove(event: MouseEvent<HTMLAnchorElement>) {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(MAX_PULL, Math.sqrt(dx ** 2 + dy ** 2));
    button.style.transition = "transform 0.3s ease-out";
    button.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px) scale(1.09)`;
  }

  function handleMouseLeave() {
    const button = buttonRef.current;
    if (!button) return;
    button.style.transition = "transform 0.3s ease-out";
    button.style.transform = "translate(0, 0) scale(1)";
  }

  return (
    <Link
      ref={buttonRef}
      className="rbt-btn rbt-btn-round rbt-magnetic-button"
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <i className="fa-solid fa-arrow-up-right" />
      SHOP
      <br />
      NOW
    </Link>
  );
}
