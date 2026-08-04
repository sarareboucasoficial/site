document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const progressBar = document.querySelector(".progress-bar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  revealItems.forEach((item, index) => {
    item.style.setProperty("--delay", `${(index % 4) * 80}ms`);

    if (index % 3 === 1) item.classList.add("from-left");
    if (index % 3 === 2) item.classList.add("from-right");
  });

  const showItem = (item) => item.classList.add("is-visible");

  if (prefersReducedMotion) {
    revealItems.forEach(showItem);
  } else {
    body.classList.add("effects-ready");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showItem(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -7% 0px"
        }
      );

      revealItems.forEach((item) => observer.observe(item));

      window.setTimeout(() => {
        revealItems.forEach((item) => {
          const rect = item.getBoundingClientRect();

          if (
            !item.classList.contains("is-visible") &&
            rect.top < window.innerHeight * 1.15 &&
            rect.bottom > -100
          ) {
            showItem(item);
          }
        });
      }, 1500);
    } else {
      revealItems.forEach(showItem);
    }
  }

  const updateProgress = () => {
    if (!progressBar) return;

    const total = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = total > 0 ? (window.scrollY / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const countdown = document.querySelector("[data-countdown]");

  if (countdown) {
    const target = new Date(countdown.dataset.countdown).getTime();

    const daysEl = countdown.querySelector("[data-days]");
    const hoursEl = countdown.querySelector("[data-hours]");
    const minutesEl = countdown.querySelector("[data-minutes]");
    const secondsEl = countdown.querySelector("[data-seconds]");

    const updateCountdown = () => {
      const distance = Math.max(0, target - Date.now());

      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      const seconds = Math.floor((distance % 60000) / 1000);

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  document
    .querySelectorAll(".btn, .header-cta, .mobile-sticky-cta")
    .forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();

        button.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        button.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
      });
    });

  const aboutImage = document.querySelector(".about-image img");

  if (aboutImage) {
    const alternatives = [
      "./imagens/sara-psi.png",
      "./imagens/sara-cafeteria02.png",
      "./imagens/sara.png",
      "./imagens/Sara.png"
    ];

    let attempt = 0;

    aboutImage.addEventListener("error", () => {
      attempt += 1;

      if (attempt < alternatives.length) {
        aboutImage.src = alternatives[attempt];
      } else {
        aboutImage.closest(".about-image")?.remove();
      }
    });
  }
});
