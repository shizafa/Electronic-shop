"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

// Sign-in/account quick-access item. Split out as its own client leaf (same reasoning as
// the ProductCard leaves) so the auth subscription doesn't force the rest of the main bar
// to be client-rendered.
//
// The template's version opens a sign-in modal via data-bs-toggle — dropped in favor of a
// real link, since /login and /account/profile already exist and there's no reason to defer
// to a not-yet-built modal when a working destination is right there.
export function MainBarAccountLink() {
  const { user } = useAuth();

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 rbt-access-box-has-bg-hover d-none d-lg-flex">
            <Link href={user ? "/account/profile" : "/login"} className="rbt-access-box-wrapper">
              <div className="rbt-round-btn rbt-bg-static-gray">
                <i className="fa-regular fa-user" />
              </div>
              <div className="content">
                <p>
                  {user ? t("nav.account") : `${t("nav.login")}/${t("nav.signup")}`}
                </p>
                <span>
                  {user ? user.name : "Access Account"}
                </span>
              </div>
            </Link>
          </li>
  );
}
