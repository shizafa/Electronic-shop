import Link from "next/link";
import { getVisibleCategories } from "@/lib/categories";
import { getSettings, type StoreSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

type FooterLink = { href: string; labelKey: string; policyField?: keyof StoreSettings };

const helpLinks: FooterLink[] = [
  { href: "/account/profile", labelKey: "footer.accountInfo" },
  { href: "/account/orders", labelKey: "footer.yourOrders" },
  { href: "/return-policy", labelKey: "footer.returnsWarranty", policyField: "returnPolicy" },
  { href: "/shipping-policy", labelKey: "footer.shippingInstallation", policyField: "shippingPolicy" },
  { href: "/privacy-policy", labelKey: "footer.privacyPolicy", policyField: "privacyPolicy" },
  { href: "/terms", labelKey: "footer.termsOfService", policyField: "terms" },
  { href: "/faqs", labelKey: "footer.faqs" },
];

const aboutLinks = [
  { href: "/about", labelKey: "footer.aboutUs" },
  { href: "/contact", labelKey: "footer.contactUs" },
];

const policyLinks: FooterLink[] = [
  { href: "/return-policy", labelKey: "footer.returnsWarranty", policyField: "returnPolicy" },
  { href: "/privacy-policy", labelKey: "footer.privacyPolicy", policyField: "privacyPolicy" },
  { href: "/terms", labelKey: "footer.termsOfService", policyField: "terms" },
];

// Template copy with no field behind it — kept as-is so the layout matches until there's
// somewhere real to read it from. Phone/email/social links are wired to store_settings below.
// TODO: wire to backend
const PLACEHOLDER = {
  phoneNote: "Free from fixed and mobile phones.",
  phone: "021-111-000-000",
  phoneHref: "tel:021111000000",
  callCenterLabel: "Call Center hours",
  callCenterHours: "Mon-Sun 09:00-19:00",
  emailLabel: "Email :",
  email: "support@electronics.pk",
  followUsLabel: "Follow Us :",
  downloadAppLabel: "Download App :",
  bannerHref: "/shop",
  appStoreBadges: [
    { src: "/assets/images/footer/apple-store-logo.webp", alt: "App Store" },
    { src: "/assets/images/footer/play-store-logo.webp", alt: "App Store" },
  ],
};

// Footer — site-wide footer with contact details, link columns and trust badges.
// Fully static apart from the category column, so it stays a Server Component: there is no
// state, handler or browser API anywhere in this markup.
export async function Footer() {
  const [categories, settings] = await Promise.all([getVisibleCategories(), getSettings()]);
  const categoryLinks = categories.map((category) => ({
    href: `/category/${category.slug}`,
    label: category.name,
  }));
  const visibleHelpLinks = helpLinks.filter((link) => !link.policyField || settings[link.policyField]);
  const visiblePolicyLinks = policyLinks.filter((link) => !link.policyField || settings[link.policyField]);

  const phone = settings.phone || PLACEHOLDER.phone;
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/\s+/g, "")}` : PLACEHOLDER.phoneHref;
  const email = settings.email || PLACEHOLDER.email;

  const socialLinks: { icon: string; href: string }[] = (
    [
      { icon: "fa-brands fa-facebook-f", href: settings.facebookUrl },
      { icon: "fa-brands fa-instagram", href: settings.instagramUrl },
      { icon: "fa-brands fa-x-twitter", href: settings.twitterUrl },
      { icon: "fa-brands fa-youtube", href: settings.youtubeUrl },
      {
        icon: "fa-brands fa-whatsapp",
        href: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : null,
      },
    ] satisfies { icon: string; href: string | null }[]
  ).filter((link): link is { icon: string; href: string } => Boolean(link.href));

  return (
    <>
    <footer className="rbt-footer rbt-footer-style-one rbt-bg-color-gray-light">
  <div className="rbt-footer-top rbt-section-gap2Top">
    <div className="container">
      <div className="row justify-content-between row--12 mt_dec--24 pb--40 pb_sm--24">
        <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt--24 border-end rbt-border-color-border-2">
          <div className="footer-widget">
            <div className="logo">
              <Link href="/" className="rbt-text-semi-bold rbt-text-color-heading has-lg-fsize">
                {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.storeName} /> : settings.storeName}
              </Link>
            </div>
            <p className="description pr--140 pr_sm--0">
              {t("footer.tagline")}
            </p>
            <div className="rbt-quick-contact-info">
              <p className="b2 title">
                {PLACEHOLDER.phoneNote}
              </p>
              <a className="contact-link has-lg-fsize" href={phoneHref}>
                {phone}
              </a>
            </div>
            <div className="rbt-quick-contact-info">
              <p className="b2 title">
                {PLACEHOLDER.callCenterLabel}
              </p>
              <p className="text-inf">
                {PLACEHOLDER.callCenterHours}
              </p>
            </div>
            <div className="rbt-quick-contact-info d-flex rbt-gap--4 align-items-center">
              <p className="b2 title mb--0">
                {PLACEHOLDER.emailLabel}
              </p>
              <a className="contact-link" href={`mailto:${email}`}>
                <span>
                  {email}
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--24">
          <div className="footer-widget rbt-link-hover">
            <h3 className="ft-title">
              {t("footer.letUsHelpYou")}
            </h3>
            <ul className="ft-link">
              {visibleHelpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--24">
          <div className="footer-widget rbt-link-hover">
            <h3 className="ft-title">
              {t("footer.categories")}
            </h3>
            <ul className="ft-link">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--24">
          <div className="footer-widget rbt-link-hover">
            <h3 className="ft-title">
              {t("footer.getToKnowUs")}
            </h3>
            <ul className="ft-link">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="row pb--40 pb_sm--24">
        <div className="col-12">
          <Link href={PLACEHOLDER.bannerHref}>
            <img src="/assets/images/footer/banner-image1.png" alt="Banner Image" />
          </Link>
        </div>
      </div>
    </div>
  </div>
  <div className="rbt-separator-mid">
    <div className="container">
      <hr className="rbt-separator m-0" />
    </div>
  </div>
  <div className="footer-bottom">
    <div className="container">
      <div className="row row--12 align-items-center mt_dec--24">
        {socialLinks.length > 0 && (
          <div className="col-lg-6 mt--24">
            <div className="rbt-footer-social-area justify-content-center justify-content-lg-start">
              <p className="title">
                {PLACEHOLDER.followUsLabel}
              </p>
              <ul className="social-icon social-icon-md rbt-social-default with-bg-primary justify-content-start justify-content-lg-end">
                {socialLinks.map((link) => (
                  <li key={link.icon}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      <i className={link.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="col-lg-6 mt--20">
          <div className="rbt-app-store-area justify-content-center justify-content-lg-end">
            <p className="title">
              {PLACEHOLDER.downloadAppLabel}
            </p>
            <ul className="rbt-app-store-list">
              {PLACEHOLDER.appStoreBadges.map((badge) => (
                <li key={badge.src}>
                  <a href="#">
                    <img src={badge.src} alt={badge.alt} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
{/* Start Copyright Area */}
<div className="copyright-area copyright-style-1">
  <div className="container">
    <div className="row row--12 align-items-center justify-content-between mt_dec--24">
      <div className="col-xxl-3 col-xl-3 col-lg-6 col-md-12 col-12 mt--24">
        <p className="rbt-link-hover text-center text-lg-start">
          Copyright
          <span className="copyright-year">
            {new Date().getFullYear()}
          </span>
          ©
          <Link href="/" className="rbt-text-semi-bold rbt-text-color-heading">
            {settings.storeName}
          </Link>
          {t("footer.copyright")}
        </p>
      </div>
      <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-12 col-12 mt--24">
        <ul className="payment-img-link">
          <li>
            <a href="#">
              <img src="/assets/images/payment-brand/image-01.webp" alt="Payment Brand Image" />
            </a>
          </li>
        </ul>
      </div>
      <div className="col-xxl-4 col-xl-4 col-lg-12 col-md-12 col-12 mt--24">
        <ul className="copyright-link rbt-link-hover justify-content-center justify-content-xl-end mt_sm--12 mt_md--12 mt_lg--12">
          {visiblePolicyLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</div>
{/* End Copyright Area */}
    </>
  );
}
