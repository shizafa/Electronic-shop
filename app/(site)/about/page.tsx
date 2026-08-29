import type { Metadata } from "next";
import { AboutBannerSlider } from "@/components/about/about-banner-slider";
import { AboutCounterUp } from "@/components/about/about-counter-up";
import { AboutVideoSection } from "@/components/about/about-video-section";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.aboutUs"),
};

// /about route: static company story and "why choose us" content
export default function AboutPage() {
  return (
    <>
    <div className="rbt-component-area rbt-section-gap2Top rbt-about-area">
  <div className="container">
    <div className="row">
      <div className="col-12">
        <div className="rbt-fshape-box-outline-style">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-component-section-title rbt-about-banner-fshape-title rbt-bg-color-white">
                <h3 className="rbt-title rbt-text-color-primary h4">
                  <span className="rbt-bold--text">
                    About
                                            Us
                  </span>
                </h3>
                <span className="rbt-fshape-right-portion">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                    <path d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" fill="var(--color-white)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z" fill="var(--color-primary)" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="rbt-fshape-box rbt-bg-color-white rbt-about-banner-fshape">
            <div className="rbt-about-banner-content-wrapper">
              <div className="row row--24">
                <div className="col-12 col-md-6">
                  <div className="rbt-about-banner-content">
                    <h3 className="rbt-title rbt-text-bold mb--16">
                      Far far away, behind word mountains,
                                                far from the countries Vokalia Consonantia, there live the blind
                                                texts.
                    </h3>
                    <p className="rbt-about-banner-text">
                      A client that’s unhappy for a reason is a problem, a that’s unhappy
                                                though he or her can’t quite put a finger on it is worse. Chances
                                                are there
                                                wasn’t collaboration, communication, and checkpoints, there wasn’t.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="rbt-curved-style-box rbt-about-banner-card">
                    <div className="inner">
                      <AboutBannerSlider />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/* End Component Area */}
{/* Start Component Area */}
<div className="rbt-component-area">
  <div className="container">
    <div className="row">
      <div className="col-12">
        <div className="rbt-about-qoute-wrapper">
          <div className="rbt-about-qoute">
            <div className="inner">
              <h3 className="rbt-title b1 rbt-text-bold mb--12">
                Our Mission
              </h3>
              <p className="b2 rbt-text-color-gray-500">
                Our mission is to provide high-quality products
                                    and services that meet the needs and expectations of our customers.
              </p>
            </div>
          </div>
          <div className="rbt-about-qoute">
            <div className="inner">
              <h3 className="rbt-title b1 rbt-text-bold mb--12">
                Our Vision
              </h3>
              <p className="b2 rbt-text-color-gray-500">
                Our vision is to be the leading provider of
                                    innovative solutions that empower individuals and businesses to achieve their goals.
              </p>
            </div>
          </div>
          <div className="rbt-about-qoute">
            <div className="inner">
              <h3 className="rbt-title b1 rbt-text-bold mb--12">
                Our Values
              </h3>
              <p className="b2 rbt-text-color-gray-500">
                We believe in integrity, innovation, and
                                    excellence. Our values guide us in delivering the best to our customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/* End Component Area */}
{/* Start Component Area */}
<div className="rbt-component-area rbt-about-area rbt-section-gap2Top rbt-section-gap2Bottom">
  <div className="container">
    <div className="row row--12 align-items-center">
      <div className="col-lg-6">
        <div className="rbt-thumbnail-wrapper">
          <div className="rbt-thumbnail thumb-image-1 rbt-curved-style-box" data-parallax='{"x": 0, "y": 40}'>
            <img src="/assets/images/about/about-image-2.webp" alt="About thumbnail image" />
          </div>
          <div className="rbt-thumbnail thumb-image-2 rbt-curved-style-box" data-parallax='{"x": 0, "y": -30}'>
            <img src="/assets/images/about/about-image-3.webp" alt="About thumbnail image" />
          </div>
          <div className="rbt-thumbnail thumb-image-3 rbt-curved-style-box" data-parallax='{"x": 0, "y": -40}'>
            <img src="/assets/images/about/about-image-4.webp" alt="About thumbnail image" />
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="rbt-about-feature-area">
          <div className="inner">
            <div className="rbt-section-title text-start">
              <h3 className="rbt-title mb--16">
                Perfection is achieved not when there is nothing more.
              </h3>
              <p className="rbt-description">
                Founded with a vision to revolutionize online shopping, our journey is driven by
                                    innovation and customer
                                    satisfaction. We are committed to providing a seamless shopping experience that is
                                    secure, fast, and tailored to
                                    your unique needs.
              </p>
            </div>
            {/* Start Feature List */}
            <div className="rbt-about-feature-wrapper mt--32">
              <div className="rbt-about-feature feature-style-1">
                <span className="icon">
                  <i className="fa-regular fa-cart-shopping-fast" />
                </span>
                <div className="rbt-feature-content">
                  <h3 className="rbt-feature-title h6">
                    Innovation in Shopping
                  </h3>
                  <p className="rbt-feature-description">
                    Our platform is designed with the latest
                                            technology to make online shopping
                                            enjoyable.
                  </p>
                </div>
              </div>
              <div className="rbt-about-feature feature-style-1">
                <span className="icon">
                  <i className="fa-regular fa-truck-bolt" />
                </span>
                <div className="rbt-feature-content">
                  <h3 className="rbt-feature-title h6">
                    Secure & Fast Delivery
                  </h3>
                  <p className="rbt-feature-description">
                    Enjoy quick and reliable shipping with
                                            complete security and tracking at
                                            every step.
                  </p>
                </div>
              </div>
              <div className="rbt-about-feature feature-style-1">
                <span className="icon">
                  <i className="fa-regular fa-bags-shopping" />
                </span>
                <div className="rbt-feature-content">
                  <h3 className="rbt-feature-title h6">
                    Your Shopping, Your Way
                  </h3>
                  <p className="rbt-feature-description">
                    Explore a wide range of products tailored to
                                            suit your unique needs and
                                            preferences.
                  </p>
                </div>
              </div>
            </div>
            {/* End Feature List */}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/* End Component Area */}
{/* Start Component Area */}
<div className="rbt-component-area rbt-counterup-area rbt-section-gap2Top rbt-section-gap2Bottom rbt-bg-color-gray-100">
  <div className="container">
    <div className="row">
      <div className="col-md-12">
        <div className="rbt-counterup-wrapper">
          <AboutCounterUp
            value={350}
            dataText="+"
            description="Diverse Course Selection: Explore a wide range of learning opportunities."
          />
          <AboutCounterUp
            value={800}
            dataText="K"
            description="Global Community Reached: Connecting learners across the world."
          />
          <AboutCounterUp
            value={30.45}
            dataText=""
            hasFormattingMark
            description="Average Student Satisfaction: Demonstrating our commitment to quality."
          />
          <AboutCounterUp
            value={1950}
            dataText="+"
            description="Satisfied Customers Worldwide: Reflecting our global customer trust."
          />
          <AboutCounterUp
            value={2.8}
            dataText="+"
            description="Years of Educational Excellence: Building a legacy of learning."
          />
        </div>
      </div>
    </div>
  </div>
</div>
{/* End Component Area */}
    <AboutVideoSection />
    </>
  );
}