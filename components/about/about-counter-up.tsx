"use client";

import { useEffect, useRef, useState } from "react";

interface AboutCounterUpProps {
  value: number;
  dataText: string;
  hasFormattingMark?: boolean;
  description: string;
}

const ANIMATION_MS = 1500;
const INITIAL_TEXT = "00";

// Rebuilds main.min.js's counterUp(): jquery.appear triggers when the element scrolls into
// view, then vendor/odometer.js animates the digit roll from "00" to data-count. Neither
// library is loaded here (jQuery plugins are disallowed), so this reproduces the same
// on-scroll count-up with an IntersectionObserver + requestAnimationFrame instead.
export function AboutCounterUp({ value, dataText, hasFormattingMark, description }: AboutCounterUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(INITIAL_TEXT);
  const decimals = value.toString().includes(".") ? value.toString().split(".")[1].length : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / ANIMATION_MS, 1);
          setDisplay((value * progress).toFixed(decimals));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, decimals]);

  return (
    <div className="rbt-counterup-single">
      <div className="inner">
        <h2 className={`rbt-counterup${hasFormattingMark ? " has-formatting-mark" : ""}`} data-text={dataText}>
          <span className="odometer" data-count={value} ref={ref}>
            {display}
          </span>
        </h2>
        <p className="rbt-text-color-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}
