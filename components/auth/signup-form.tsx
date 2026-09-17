"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";
import { safeRedirectPath } from "@/lib/safe-redirect";

import "swiper/css";
import "swiper/css/pagination";

const REVIEWS = [
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
  { name: "Szilagyi Erik", text: "\"The shirt fits great, very good quality of the material. Training in it is pure pleasure.\"" },
];

// Pakistan is the only market this store serves (PKR-only pricing in data/currencies.ts, the
// footer's "delivered across Pakistan"), so there's no country selector to branch on — every
// signup number is validated as a local one: exactly 11 digits starting with 0. That covers
// both mobiles (03XXXXXXXXX) and landlines with an area code (021XXXXXXXX), so it doesn't
// wrongly reject a valid non-mobile number the way an 03-only rule would.
const PK_PHONE_PATTERN = /^0\d{10}$/;

// Keeps the field to digits only and caps it at the 11 a local number has. The +92 / 0092
// forms are rewritten to the leading-0 form instead of being rejected, since that's how the
// number is printed on most sites — but only once the value is already LONGER than 11 digits,
// which a hand-typed local number never is. Doing it at any length would eat the input of
// someone typing "+92..." one key at a time (at "+92" the digits are just "92", and stripping
// that prefix would blank the field mid-keystroke).
function toLocalPhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 11) {
    if (digits.startsWith("0092")) digits = `0${digits.slice(4)}`;
    else if (digits.startsWith("92")) digits = `0${digits.slice(2)}`;
  }
  return digits.slice(0, 11);
}

// The live checklist under the password field. Order is the order they're shown in; each
// entry renders green with a tick once its test passes and red with a cross until then, so
// what's still missing is always visible rather than surfacing one error at a time on submit.
// The length rule is here alongside the four character-class rules the customer asked for
// because Supabase enforces a minimum server-side anyway — without it a too-short password
// fails as the generic "email taken / rejected" message below, which says nothing useful.
const PASSWORD_RULES: { key: string; label: string; test: (value: string) => boolean }[] = [
  { key: "length", label: t("auth.passwordRuleLength"), test: (value) => value.length >= 8 },
  { key: "uppercase", label: t("auth.passwordRuleUppercase"), test: (value) => /[A-Z]/.test(value) },
  { key: "lowercase", label: t("auth.passwordRuleLowercase"), test: (value) => /[a-z]/.test(value) },
  { key: "number", label: t("auth.passwordRuleNumber"), test: (value) => /\d/.test(value) },
  { key: "special", label: t("auth.passwordRuleSpecial"), test: (value) => /[^A-Za-z0-9]/.test(value) },
];

// SignupForm — creates a new user account and redirects back to where they came from.
// The template's demo tabs (Phone Number / Email, no name or password field, Facebook/Google
// buttons) don't match real signup, which needs name+email+phone+password — so the phone tab
// and social buttons are dropped (same call as the login form) and the Email/Number fields
// are stacked into one form alongside new Name and Password fields.
// The testimonial slider rebuilds main.min.js's .rbt-log-slide-activation config
// (spaceBetween: 24, slidesPerView: 1, loop, autoplay delay 3000, clickable pagination dots).
export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);
  // The checklist stays hidden until the field is first focused, so a pristine form doesn't
  // open as a block of red text. A failed submit also reveals it (see handleSubmit).
  const [passwordTouched, setPasswordTouched] = useState(false);

  const ruleResults = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) }));
  const isPasswordValid = ruleResults.every((rule) => rule.passed);
  const isPhoneValid = PK_PHONE_PATTERN.test(phone);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Checked before signup() is called so an invalid phone/password never costs a round trip,
    // and so the reason is specific instead of arriving as Supabase's generic rejection.
    if (!isPhoneValid) {
      setError(t("auth.phoneInvalid"));
      return;
    }
    if (!isPasswordValid) {
      setPasswordTouched(true);
      setError(t("auth.passwordInvalid"));
      return;
    }

    setIsSubmitting(true);

    // signup() returns false when the email is already registered, or Supabase rejects
    // the request (e.g. a password under its minimum length) — both surface the same message.
    const success = await signup(name, email, phone, password);
    if (!success) {
      setError(t("auth.emailTaken"));
      setIsSubmitting(false);
      return;
    }

    // send the user to the page they were trying to reach before signing up, if any
    router.push(safeRedirectPath(searchParams.get("next")));
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
                    Create an Account
                  </h3>
                  <p className="description">
                    I want grocery delivery for my:
                  </p>
                  <ul className="rbt-signup-radio-list">
                    <li className="rbt-check-grp ml--0">
                      <input id="rbt-signup-radio-1" type="radio" name="rbt-signup-radio" />
                      <label htmlFor="rbt-signup-radio-1">
                        <span className="rbt-lable-text">
                          Home
                        </span>
                      </label>
                    </li>
                    <li className="rbt-check-grp ml--0">
                      <input id="rbt-signup-radio-2" type="radio" name="rbt-signup-radio" />
                      <label htmlFor="rbt-signup-radio-2">
                        <span className="rbt-lable-text">
                          Office
                        </span>
                      </label>
                    </li>
                    <li className="rbt-check-grp ml--0">
                      <input id="rbt-signup-radio-3" type="radio" name="rbt-signup-radio" />
                      <label htmlFor="rbt-signup-radio-3">
                        <span className="rbt-lable-text">
                          Business
                        </span>
                      </label>
                    </li>
                    <li className="rbt-check-grp ml--0">
                      <input id="rbt-signup-radio-4" type="radio" name="rbt-signup-radio" />
                      <label htmlFor="rbt-signup-radio-4">
                        <span className="rbt-lable-text">
                          Others
                        </span>
                      </label>
                    </li>
                  </ul>
                  <div className="rbt-tab rbt-round-shape-tab">
                    <form onSubmit={handleSubmit}>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="register_name">
                          Your Name
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <input
                          className="rbt-input-field"
                          type="text"
                          id="register_name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                        />
                      </div>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="register_email">
                          Your Email
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <input
                          className="rbt-input-field"
                          type="email"
                          id="register_email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="register_number">
                          Your Number
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <input
                          className="rbt-input-field"
                          type="tel"
                          id="register_number"
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={11}
                          aria-describedby="register_number_hint"
                          value={phone}
                          onChange={(event) => setPhone(toLocalPhoneDigits(event.target.value))}
                          required
                        />
                        {/* Red only once what's typed can no longer become a valid number —
                            while it's still short it's incomplete, not wrong. */}
                        <p
                          id="register_number_hint"
                          className={`b4 mt--8 mb--0 ${phone.length === 11 && !isPhoneValid ? "rbt-text-color-danger" : ""}`}
                        >
                          {t("auth.phoneHint")}
                        </p>
                      </div>
                      <div className="rbt-input-field-grp">
                        <label className="rbt-field-label" htmlFor="register_password">
                          Password
                          <span className="rbt-text-color-danger">
                            *
                          </span>
                        </label>
                        <div className="position-relative">
                          <input
                            className="rbt-input-field"
                            type={showPassword ? "text" : "password"}
                            id="register_password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            onFocus={() => setPasswordTouched(true)}
                            aria-describedby="register_password_rules"
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
                        {/* Live requirement checklist: every rule is listed the whole time, red
                            with a cross while it's still missing and green with a tick once it's
                            met, so the customer can see exactly what's left instead of guessing
                            from a single "invalid password" message. aria-live="polite" so a
                            screen reader announces a rule flipping to met as they type. */}
                        {passwordTouched && (
                          <div id="register_password_rules" className="mt--8" aria-live="polite">
                            <p className="b4 mb--8">
                              {t("auth.passwordRequirements")}
                            </p>
                            <ul className="list-unstyled mb--0">
                              {ruleResults.map((rule) => (
                                <li
                                  key={rule.key}
                                  className={`b4 d-flex align-items-center ${rule.passed ? "rbt-text-color-success" : "rbt-text-color-danger"}`}
                                >
                                  <i className={`me-2 fa-solid ${rule.passed ? "fa-circle-check" : "fa-circle-xmark"}`} />
                                  {rule.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                        <input id="login_checked2" type="checkbox" name="login" />
                        <label htmlFor="login_checked2">
                          Stay Logged In
                        </label>
                      </div>
                    </form>
                  </div>
                  <div className="rbt-login-system-switch rbt-link-hover">
                    {/* {" "}: JSX strips the whitespace either side of a newline, so the space
                        the template's own markup had between the question and the link was
                        being dropped ("Already a customer?Sign In"). .rbt-switch-btn is
                        padding:0 with no margin, so nothing in the CSS puts it back. */}
                    Already a customer?{" "}
                    <Link className="rbt-switch-btn" href="/login">
                      <span>
                        Sign In
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
