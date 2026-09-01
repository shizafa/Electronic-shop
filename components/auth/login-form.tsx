"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAuth } from "@/context/auth-context";
import { resolveLoginRedirect } from "@/lib/actions/auth";
import { t } from "@/lib/i18n";

import "swiper/css";
import "swiper/css/pagination";

const REVIEWS = [
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
];

// LoginForm — authenticates an existing user and redirects back to where they came from.
// The template's demo tabs (Phone Number / Email, no password, Facebook/Google buttons)
// don't match real auth, which is email+password only — so only the Email field is kept,
// a password field is added to it, and the phone tab and social buttons are dropped.
// The testimonial slider rebuilds main.min.js's .rbt-log-slide-activation config
// (spaceBetween: 24, slidesPerView: 1, loop, autoplay delay 3000, clickable pagination dots).
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await login(email, password);
    if (!success) {
      setError(t("auth.invalidCredentials"));
      setIsSubmitting(false);
      return;
    }

    // next honored first; otherwise role-based (admin -> /admin, customer -> /), decided
    // server-side by resolveLoginRedirect rather than trusting client-held user.isAdmin
    router.push(await resolveLoginRedirect(searchParams.get("next")));
  }

  return (
    <div className="rbt-component-area rbt-section-gap2Bottom rbt-section-gap2Top">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 mx-auto">
            <div className="rbt-login-form">
              <div className="rbt-login-form-inner">
                <div className="rbt-login-form-top">
                  {/* The template ships only Unimart-branded logo files and there's no real
                      logo asset in public/ yet — same fix as the header and footer. */}
                  <div className="logo">
                    <Link href="/">
                      {t("site.name")}
                    </Link>
                  </div>
                  <h3 className="rbt-title rbt-text-bold mb--16 h6">
                    Sign In To Proceed
                  </h3>
                  <div className="rbt-tab rbt-round-shape-tab">
                    <form onSubmit={handleSubmit}>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="signin_email">
                          Your Email
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <input
                          className="rbt-input-field"
                          type="email"
                          id="signin_email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="signin_password">
                          Password
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <div className="position-relative">
                          <input
                            className="rbt-input-field"
                            type={showPassword ? "text" : "password"}
                            id="signin_password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 me-3"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
                          </button>
                        </div>
                      </div>
                      {error && (
                        <p className="rbt-text-color-danger mb--0">
                          {error}
                        </p>
                      )}
                      <button type="submit" className="rbt-btn d-block w-100 mt--24 mb--16" disabled={isSubmitting}>
                        Continue
                      </button>
                      <div className="rbt-check-group">
                        <input id="login_checked1" type="checkbox" name="login" />
                        <label htmlFor="login_checked1">
                          Stay Logged In
                        </label>
                      </div>
                    </form>
                  </div>
                  <div className="rbt-login-system-switch rbt-link-hover">
                    Don&apos;t have an account?
                    <Link className="rbt-switch-btn" href="/signup">
                      <span>
                        Create an account
                      </span>
                    </Link>
                  </div>
                </div>
                {/* Start slider */}
                <div className="rbt-login-form-bottom rbt-swiper-container-pagination position-relative">
                  <Swiper
                    className="rbt-log-slide-activation pb--40"
                    modules={[Autoplay, Pagination]}
                    spaceBetween={24}
                    slidesPerView={1}
                    loop
                    speed={1000}
                    autoplay={{ delay: 3000 }}
                    pagination={{ el: paginationEl, clickable: true }}
                  >
                    {REVIEWS.map((review, index) => (
                      <SwiperSlide key={index}>
                        <div className="rbt-client-review">
                          <ul className="rbt-rating-icon-list d-flex justify-content-center">
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                          </ul>
                          <p className="rbt-review-text mt--8 mb--12">
                            {review.text}
                          </p>
                          <div className="d-flex flex-wrap justify-content-center rbt-gap--8">
                            <h3 className="mb--0 h6">
                              {review.name}
                            </h3>
                            <div className="rbt-verified-badge badge-rounded">
                              <i className="fa-sharp fa-solid fa-shield-check" />
                              Verified Reviewer
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                    <div
                      slot="container-end"
                      ref={setPaginationEl}
                      className="swiper-pagination rbt-swiper-progress rbt-swiper-pagination-dot-extend"
                    />
                  </Swiper>
                </div>
                {/* End slider */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
