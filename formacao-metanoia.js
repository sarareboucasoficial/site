document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const progressBar = document.querySelector(".progress-bar");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const heroCopy = document.querySelector(".hero-copy");
  const videoCard = document.querySelector(".video-card");

  heroCopy?.classList.add("anim-hero-copy");
  videoCard?.classList.add("anim-hero-video");

  document
    .querySelectorAll(
      ".section-heading, .story-title, .future-copy, .experience-copy, " +
        ".about-copy, .offer-copy, .faq-copy, .impact .container, " +
        ".final-cta .container"
    )
    .forEach((element) => {
      element.classList.add("anim-title");
    });

  document
    .querySelectorAll(
      ".story-item, .comparison-card, .future-item, .experience-card, " +
        ".cta-band-content, .offer-card, .urgency-box"
    )
    .forEach((element, index) => {
      element.classList.add("anim-card");

      element.style.setProperty(
        "--anim-delay",
        `${(index % 4) * 90}ms`
      );
    });

  document
    .querySelectorAll(".timeline-item")
    .forEach((element, index) => {
      element.classList.add("anim-timeline");

      element.style.setProperty(
        "--anim-delay",
        `${(index % 4) * 85}ms`
      );
    });

  document
    .querySelectorAll(".testimonial-card")
    .forEach((element, index) => {
      element.classList.add(
        index % 2 === 0
          ? "anim-testimonial-left"
          : "anim-testimonial-right"
      );

      element.style.setProperty(
        "--anim-delay",
        `${(index % 3) * 110}ms`
      );
    });

  const animatedElements = Array.from(
    document.querySelectorAll(
      ".reveal, .anim-hero-copy, .anim-hero-video, " +
        ".anim-title, .anim-card, .anim-timeline, " +
        ".anim-testimonial-left, .anim-testimonial-right"
    )
  );

  const showElement = (element) => {
    element.classList.add("is-visible");
  };

  if (reducedMotion) {
    animatedElements.forEach(showElement);
  } else {
    body.classList.add("effects-ready");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (heroCopy) {
          showElement(heroCopy);
        }

        window.setTimeout(() => {
          if (videoCard) {
            showElement(videoCard);
          }
        }, 130);
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      animatedElements.forEach((element) => {
        if (
          element !== heroCopy &&
          element !== videoCard
        ) {
          observer.observe(element);
        }
      });

      window.setTimeout(() => {
        animatedElements.forEach((element) => {
          if (element.classList.contains("is-visible")) {
            return;
          }

          const position =
            element.getBoundingClientRect();

          if (
            position.top <
              window.innerHeight * 1.15 &&
            position.bottom > -120
          ) {
            showElement(element);
          }
        });
      }, 1800);
    } else {
      animatedElements.forEach(showElement);
    }
  }

  const updateProgress = () => {
    if (!progressBar) {
      return;
    }

    const total =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const percentage =
      total > 0
        ? (window.scrollY / total) * 100
        : 0;

    progressBar.style.width =
      `${percentage}%`;
  };

  const aboutImage =
    document.querySelector(".about-image img");

  const aboutBox =
    document.querySelector(".about-image");

  if (aboutImage) {
    const photoOptions = [
      "./imagens/sara-psi.png",
      "./imagens/sara-cafeteria02.png",
      "./imagens/sara.png",
      "./imagens/Sara.png"
    ];

    let photoAttempt = 0;

    aboutImage.addEventListener("error", () => {
      photoAttempt += 1;

      if (photoAttempt < photoOptions.length) {
        aboutImage.src =
          photoOptions[photoAttempt];
      } else {
        aboutImage
          .closest(".about-image")
          ?.remove();
      }
    });
  }

  const updateParallax = () => {
    if (
      !aboutImage ||
      !aboutBox ||
      reducedMotion ||
      window.innerWidth < 921
    ) {
      return;
    }

    const position =
      aboutBox.getBoundingClientRect();

    const distance =
      position.top +
      position.height / 2 -
      window.innerHeight / 2;

    const offset = Math.max(
      -14,
      Math.min(14, distance * -0.025)
    );

    aboutImage.style.transform =
      `translateY(${offset}px) scale(1.035)`;
  };

  document
    .querySelectorAll(
      ".btn, .header-cta, .mobile-sticky-cta"
    )
    .forEach((button) => {
      button.addEventListener(
        "pointermove",
        (event) => {
          const position =
            button.getBoundingClientRect();

          button.style.setProperty(
            "--mouse-x",
            `${event.clientX - position.left}px`
          );

          button.style.setProperty(
            "--mouse-y",
            `${event.clientY - position.top}px`
          );
        }
      );
    });

  let ticking = false;

  const updatePage = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateProgress();
      updateParallax();
      ticking = false;
    });
  };

  updateProgress();
  updateParallax();

  window.addEventListener(
    "scroll",
    updatePage,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updatePage
  );
});