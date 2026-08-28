"use client";

import { useEffect, useRef, useState } from "react";

// Fires once, the first time the returned ref's element comes within `rootMargin` of the
// viewport, then disconnects. Used to defer a below-the-fold section's data fetch until the
// user is about to scroll to it, rather than fetching everything on initial page load.
export function useInViewOnce<T extends Element>(rootMargin = "400px 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
