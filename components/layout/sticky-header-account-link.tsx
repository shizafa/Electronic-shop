"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

// Icon-only sign-in/account link for the sticky header — same auth branching as
// main-bar-account-link.tsx, but the sticky markup has no text label, just the round
// button and a tooltip, so it's a separate leaf rather than a shared one.
//
// data-bs-toggle="modal" data-bs-target="#signinModal" dropped for the same reason as the
// main bar's: /login and /account/profile already exist and work.
export function StickyHeaderAccountLink() {
  const { user } = useAuth();

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 d-none d-lg-flex tooltips tooltip-distance-lg" data-tooltip="Sign In" data-tooltip-position="bottom">
            <Link className="rbt-round-btn has-rbt-md-fsize" href={user ? "/account/profile" : "/login"}>
              <i className="fa-regular fa-user" />
            </Link>
          </li>
  );
}
