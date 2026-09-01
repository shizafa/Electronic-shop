"use client";

import { useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/actions/contact";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

// ContactForm — submits to contact_messages via a Server Action; admins review submissions
// in the /admin/messages inbox. The top quick-contact buttons and the first location card
// (phone/email/address) are wired to store_settings; the other three location cards and the
// Telegram/Messenger buttons stay template demo content — there's no backend for multiple
// store locations or those two channels.
export function ContactForm({ settings }: { settings: StoreSettings }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const name = `${firstName} ${lastName}`.trim();
    const result = await submitContactMessage({
      name,
      email,
      subject: "Contact form submission",
      message,
    });

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">
        {t("contact.submitted")}
      </div>
    );
  }

  const phone = settings.phone || "+9584 4561 2564";
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/\s+/g, "")}` : "tel:+958445612564";
  const whatsappHref = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : null;

  const locationPhone = settings.phone || "(208) 555-0112";
  const locationPhoneHref = settings.phone ? `tel:${settings.phone.replace(/\s+/g, "")}` : "tel:+2085550112";
  const locationEmail = settings.email || "contact@example.com";
  const locationAddress = settings.address || "1260 Broadway, San Franci, CA 94109";

  return (
    <>
    <div className="rbt-breadcrumb-two rbt-bg-color-gray-light">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="rbt-breadcrumb-inner text-left">
          <ul className="rbt-breadcrumb-page-list justify-content-start mt--0">
            <li className="rbt-breadcrumb-item">
              <a href="index.html">
                Home
              </a>
            </li>
            <li>
              <div className="icon-right">
                <i className="fa-solid fa-chevron-right" />
              </div>
            </li>
            <li className="rbt-breadcrumb-item active">
              Contact Us
            </li>
          </ul>
        </div>
      </div>
    </div>
    <hr className="rbt-separator rbt-separator-gray100 mt--24 mb--0" />
  </div>
</div>
{/* Start Component Area */}
<div className="rbt-component-area  rbt-bg-color-gray-light">
  <div className="container">
    <div className="row row--24 mt_dec--24">
      <div className="col-12 col-xl-6 mt--24">
        <div className="rbt-component-section-title rbt-gap--4 mb--24 p-0 border-0 text-left">
          <h2 className="rbt-title h1 rbt-scroll-trigger fade_in animation-order-2 mb--16">
            <span className="rbt-bold--text">
              Contact Us
            </span>
          </h2>
          <p className="desc mb--0">
            Email, call, or complete the form to learn how Snappy can solve your
                            messaging problem.
          </p>
        </div>
        <div className="rbt-btn-grp justify-content-between rbt-gap--16 flex-wrap">
          {/* Call via Phone */}
          <a href={phoneHref} className="rbt-trns-modern-btn tooltips" data-tooltip="Call via Phone" data-tooltip-position="top">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
                <g clipPath="url(#clip0_5767_2922)">
                  <path d="M32 16.5C32 7.66344 24.8366 0.5 16 0.5C7.16344 0.5 0 7.66344 0 16.5C0 25.3366 7.16344 32.5 16 32.5C24.8366 32.5 32 25.3366 32 16.5Z" fill="#1C61E7" />
                  <path d="M22.7163 19.749V22.4265C22.7164 22.6182 22.6438 22.8028 22.5131 22.9431C22.3824 23.0834 22.2033 23.1688 22.0121 23.1822C21.6812 23.205 21.4109 23.2171 21.2019 23.2171C14.5107 23.2171 9.08691 17.793 9.08691 11.1014C9.08691 10.8924 9.09827 10.6221 9.12174 10.2912C9.13516 10.0999 9.22062 9.92086 9.36087 9.79016C9.50112 9.65946 9.68572 9.58682 9.87742 9.58691H12.5548C12.6488 9.58682 12.7394 9.62164 12.809 9.68461C12.8787 9.74758 12.9225 9.83421 12.9319 9.92766C12.9493 10.1018 12.9652 10.2404 12.9804 10.3457C13.1309 11.3959 13.4392 12.4173 13.8951 13.3754C13.967 13.5268 13.92 13.7078 13.7838 13.8047L12.1497 14.9724C13.1488 17.3004 15.004 19.1557 17.3319 20.1548L18.498 18.5238C18.5457 18.4571 18.6152 18.4093 18.6945 18.3887C18.7738 18.3681 18.8578 18.376 18.9319 18.4109C19.8897 18.8659 20.9108 19.1736 21.9606 19.3234C22.0659 19.3385 22.2044 19.3552 22.3771 19.3719C22.4704 19.3814 22.5568 19.4253 22.6196 19.495C22.6825 19.5646 22.7164 19.6551 22.7163 19.749Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_5767_2922">
                    <rect width="32" height="33" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            {phone}
          </a>
          {/* Call via WhatsApp */}
          {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="rbt-trns-modern-btn tooltips" data-tooltip="Call via WhatsApp" data-tooltip-position="top">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                <g clipPath="url(#clip0_5767_2927)">
                  <path d="M32.3333 16C32.3333 7.16344 25.1698 0 16.3333 0C7.4967 0 0.333252 7.16344 0.333252 16C0.333252 24.8366 7.4967 32 16.3333 32C25.1698 32 32.3333 24.8366 32.3333 16Z" fill="#E7961C" />
                  <path d="M8.83325 19.5001V13.1924L15.2122 17.5104C15.8893 17.9688 16.7773 17.9688 17.4544 17.5104L23.8333 13.1924V19.5001C23.8333 20.6047 22.9379 21.5001 21.8333 21.5001H10.8333C9.72868 21.5001 8.83325 20.6047 8.83325 19.5001Z" fill="white" />
                  <path d="M15.2122 16.1642L8.83325 11.8462C8.83325 11.1027 9.43594 10.5 10.1794 10.5H22.4871C23.2306 10.5 23.8333 11.1027 23.8333 11.8462L17.4544 16.1642C16.7773 16.6225 15.8893 16.6225 15.2122 16.1642Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_5767_2927">
                    <rect width="32" height="32" fill="white" transform="translate(0.333252)" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            {settings.whatsapp}
          </a>
          )}
          {/* Call via Telegram */}
          <a href="https://t.me/+958445612564" target="_blank" className="rbt-trns-modern-btn tooltips" data-tooltip="Call via Telegram" data-tooltip-position="top">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                <g clipPath="url(#clip0_5767_2933)">
                  <path d="M32.6667 16C32.6667 7.16344 25.5033 0 16.6667 0C7.83019 0 0.666748 7.16344 0.666748 16C0.666748 24.8366 7.83019 32 16.6667 32C25.5033 32 32.6667 24.8366 32.6667 16Z" fill="#34AADF" />
                  <path d="M9.56921 15.433C9.56921 15.433 16.0795 12.691 18.3373 11.7254C19.2029 11.3392 22.1382 10.1034 22.1382 10.1034C22.1382 10.1034 23.4929 9.56274 23.38 10.8758C23.3424 11.4165 23.0413 13.3089 22.7403 15.3557C22.2887 18.2523 21.7995 21.4192 21.7995 21.4192C21.7995 21.4192 21.7242 22.3075 21.0845 22.4619C20.4448 22.6164 19.391 21.9213 19.2029 21.7668C19.0523 21.6509 16.3805 19.913 15.4021 19.0633C15.1386 18.8316 14.8376 18.3682 15.4397 17.8275C16.7945 16.553 18.4126 14.9696 19.391 13.9654C19.8426 13.502 20.2942 12.4206 18.4126 13.7337C15.7408 15.6261 13.1065 17.4027 13.1065 17.4027C13.1065 17.4027 12.5044 17.7888 11.3755 17.4412C10.2465 17.0937 8.92943 16.6302 8.92943 16.6302C8.92943 16.6302 8.02632 16.0509 9.56921 15.433Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_5767_2933">
                    <rect width="32" height="32" fill="white" transform="translate(0.666748)" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            Telegram
          </a>
          {/* Call via Signal */}
          <a href="https://m.me/USERNAME" target="_blank" className="rbt-trns-modern-btn tooltips" data-tooltip="Call via Messenger" data-tooltip-position="top">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <g clipPath="url(#clip0_5767_2938)">
                  <path d="M32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16Z" fill="#009DFF" />
                  <path d="M7.79529 19.4466L11.8457 13.2181C11.9981 12.9835 12.1989 12.7822 12.4356 12.6268C12.6723 12.4713 12.9397 12.3651 13.2208 12.3149C13.502 12.2646 13.7909 12.2714 14.0692 12.3349C14.3475 12.3983 14.6092 12.517 14.8378 12.6834L18.0609 15.0258C18.2048 15.1302 18.3798 15.1864 18.5596 15.1858C18.7393 15.1852 18.914 15.1278 19.0571 15.0225L23.4074 11.8213C23.9865 11.3936 24.7449 12.0686 24.3588 12.6667L20.305 18.8919C20.1526 19.1264 19.9517 19.3278 19.7151 19.4832C19.4784 19.6387 19.211 19.7449 18.9298 19.7951C18.6487 19.8453 18.3598 19.8385 18.0815 19.7751C17.8032 19.7117 17.5415 19.593 17.3129 19.4266L14.0898 17.0842C13.9459 16.9797 13.7708 16.9236 13.5911 16.9242C13.4113 16.9248 13.2367 16.9821 13.0936 17.0875L8.74326 20.2887C8.16414 20.7164 7.40577 20.0447 7.79529 19.4466Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_5767_2938">
                    <rect width="32" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            Messenger
          </a>
        </div>
        <div className="row row--12 mt--24 mt_sm--0 mt_md--0">
          {/* Start single location card */}
          <div className="col-12 col-md-6 col-lg-6 mt--24">
            <div className="rbt-location-card style-two">
              <div className="inner">
                <h2 className="rbt-location-card-title h6">
                  <i className="fa-sharp fa-regular fa-location-dot mr--4" />
                  Broadway Store
                </h2>
                <p className="rbt-location-card-text">
                  {locationAddress}
                </p>
                <ul className="rbt-contact-info-list">
                  <li>
                    <span>
                      Phone :
                    </span>
                    <a href={locationPhoneHref} className="rbt-contact-info-single color-primary">
                      {locationPhone}
                    </a>
                  </li>
                  <li>
                    <span>
                      Email :
                    </span>
                    <a href={`mailto:${locationEmail}`} className="rbt-contact-info-single color-primary">
                      {locationEmail}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* End single location card */}
          {/* Start single location card */}
          <div className="col-12 col-md-6 col-lg-6 mt--24">
            <div className="rbt-location-card style-two">
              <div className="inner">
                <h2 className="rbt-location-card-title h6">
                  <i className="fa-sharp fa-regular fa-location-dot mr--4" />
                  Valencia Store
                </h2>
                <p className="rbt-location-card-text">
                  1260 Broadway, San Franci, CA 94109
                </p>
                <ul className="rbt-contact-info-list">
                  <li>
                    <span>
                      Phone :
                    </span>
                    <a href="tel:+2085550112" className="rbt-contact-info-single color-primary">
                      (208)
                                                555-0112
                    </a>
                  </li>
                  <li>
                    <span>
                      Email :
                    </span>
                    <a href="cdn-cgi/l/email-protection.html#2653484f4b475452474445664b474f4a0845494b" className="rbt-contact-info-single color-primary">
                      <span className="__cf_email__" data-cfemail="a1d4cfc8ccc0d3d5c0c3c2e1ccc0c8cd8fc2cecc">
                        [email protected]
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* End single location card */}
          {/* Start single location card */}
          <div className="col-12 col-md-6 col-lg-6 mt--24">
            <div className="rbt-location-card style-two">
              <div className="inner">
                <h2 className="rbt-location-card-title h6">
                  <i className="fa-sharp fa-regular fa-location-dot mr--4" />
                  Emeryville Store
                </h2>
                <p className="rbt-location-card-text">
                  1260 Broadway, San Franci, CA 94109
                </p>
                <ul className="rbt-contact-info-list">
                  <li>
                    <span>
                      Phone :
                    </span>
                    <a href="tel:+2085550112" className="rbt-contact-info-single color-primary">
                      (208)
                                                555-0112
                    </a>
                  </li>
                  <li>
                    <span>
                      Email :
                    </span>
                    <a href="cdn-cgi/l/email-protection.html#5623383f3b372422373435163b373f3a7835393b" className="rbt-contact-info-single color-primary">
                      <span className="__cf_email__" data-cfemail="5f2a3136323e2d2b3e3d3c1f323e3633713c3032">
                        [email protected]
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* End single location card */}
          {/* Start single location card */}
          <div className="col-12 col-md-6 col-lg-6 mt--24">
            <div className="rbt-location-card style-two">
              <div className="inner">
                <h2 className="rbt-location-card-title h6">
                  <i className="fa-sharp fa-regular fa-location-dot mr--4" />
                  Alameda Store
                </h2>
                <p className="rbt-location-card-text">
                  1260 Broadway, San Franci, CA 94109
                </p>
                <ul className="rbt-contact-info-list">
                  <li>
                    <span>
                      Phone :
                    </span>
                    <a href="tel:+2085550112" className="rbt-contact-info-single color-primary">
                      (208)
                                                555-0112
                    </a>
                  </li>
                  <li>
                    <span>
                      Email :
                    </span>
                    <a href="cdn-cgi/l/email-protection.html#384d565155594a4c595a5b7855595154165b5755" className="rbt-contact-info-single color-primary">
                      <span className="__cf_email__" data-cfemail="681d060105091a1c090a0b2805090104460b0705">
                        [email protected]
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* End single location card */}
        </div>
      </div>
      <div className="col-12 col-xl-6 mt--24">
        <div className="rbt-contact-form">
          <div className="rbt-fshape-box-outline-style">
            <div className="row">
              <div className="col-lg-12">
                <div className="rbt-component-section-title rbt-contact-form-title rbt-bg-color-white rbt-border-color-gray-100">
                  <h2 className="rbt-title h6">
                    <span className="rbt-bold--text">
                      Get in Touch
                    </span>
                  </h2>
                  <span className="rbt-fshape-right-portion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                      <path d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" fill="var(--color-white)" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z" fill="var(--color-gray-100)" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div className="rbt-fshape-box rbt-bg-color-white rbt-contact-form-fshape rbt-border-color-gray-100">
              <form id="contact-form" className="rainbow-dynamic-form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 col-12 mb--16">
                    <div className="rbt-input-field-grp form-group">
                      <label htmlFor="f_name">
                        First Name
                      </label>
                      <input className="rbt-contact-input-field" type="text" id="f_name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb--16">
                    <div className="rbt-input-field-grp form-group">
                      <label htmlFor="l_name">
                        Last Name
                      </label>
                      <input className="rbt-contact-input-field" type="text" id="l_name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                    </div>
                  </div>
                  <div className="col-12 mb--16">
                    <div className="rbt-input-field-grp form-group">
                      <label htmlFor="email">
                        Email Address
                      </label>
                      <input className="rbt-contact-input-field" type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                  </div>
                  <div className="col-12 mb--16">
                    <div className="rbt-input-field-grp form-group">
                      <label htmlFor="message">
                        Your Message
                      </label>
                      <textarea className="rbt-contact-input-field" name="message" id="message" value={message} onChange={(event) => setMessage(event.target.value)} required />
                    </div>
                  </div>
                  <div className="col-12 d-block mt--0">
                    <button name="submit" type="submit" id="submit" className="rbt-btn rbt-btn-md d-block text-center w-100" disabled={isSubmitting}>
                      Send
                                                Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/* End Component Area */}
{/* Start Component Area */}
<div className="rbt-component-area rbt-bg-color-gray-light">
  <div className="container">
    <div className="rbt-google-map bg-color-white rbt-section-gap2Top">
      <iframe className="w-100" src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d2965.0824050173574!2d-93.63905729999999!3d41.998507000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sWebFilings%2C+University+Boulevard%2C+Ames%2C+IA!5e0!3m2!1sen!2sus!4v1390839289319" height="600" style={{ 'border': '0' }} />
    </div>
  </div>
</div>
{/* End Component Area */}
    </>
  );
}