"use client";

import { useEffect, useState } from "react";

const VIDEO_URL = "https://www.youtube.com/watch?v=abFXQQzFVDc";
const VIDEO_EMBED_URL = "https://www.youtube.com/embed/abFXQQzFVDc";

// Both "Play Video" triggers below used data-fancybox="" in the pasted markup — Fancybox is a
// plugin, not installed per project rules, so the lightbox is rebuilt here with useState. The
// modal itself follows the same rebuilt-Bootstrap-modal pattern as wishlist-model.tsx (no
// modal markup was pasted for it, since Fancybox injected its own DOM at runtime).
export function AboutVideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Start Component Area */}
      <div className="rbt-component-area rbt-about-area rbt-section-gap2Top rbt-section-gap2Bottom">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="rbt-about-feature-area">
                <div className="inner">
                  <div className="section-title text-start">
                    <span className="rbt-card-subtitle">
                      About Us
                    </span>
                    <h3 className="rbt-title mb--16">
                      We are the world&apos;s biggest
                                          electronics online store where innovation meets the real printing.
                    </h3>
                    <p className="b1 rbt-text-color-gray-600 mb--24">
                      Let the beauty of what you love be what you
                                          do. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                                          Ipsum has been the industry&apos;s standard dummy text ever since the, remaining
                                          essentially.
                    </p>
                    <div className="read-more-btn">
                      <a
                        className="rbt-btn"
                        href={VIDEO_URL}
                        onClick={(event) => {
                          event.preventDefault();
                          setIsOpen(true);
                        }}
                      >
                        Play Video
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="video-popup-wrapper rbt-curved-style-box">
                <img className="w-100 rbt-radius" src="/assets/images/about/about-image-5.webp" alt="Video Images" />
                <a
                  className="rbt-btn rounded-player popup-video position-to-top rbtplayer"
                  href={VIDEO_URL}
                  onClick={(event) => {
                    event.preventDefault();
                    setIsOpen(true);
                  }}
                >
                  <span>
                    <i className="fa-solid fa-play" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Component Area */}

      {isOpen && <div className="modal-backdrop fade show" onClick={() => setIsOpen(false)} />}
      <div
        className={`modal fade${isOpen ? " show" : ""}`}
        style={{ display: isOpen ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="About us video"
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="rbt-round-btn rbt-modal-dis-btn" onClick={() => setIsOpen(false)} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal-body p-0">
              <div className="ratio ratio-16x9">
                {isOpen && (
                  <iframe
                    src={`${VIDEO_EMBED_URL}?autoplay=1`}
                    title="About us video"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
