document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".progress-bar");
  const revealElements = document.querySelectorAll(".reveal");

  revealElements.forEach((element, index) => {
    element.style.setProperty(
      "--anim-delay",
      `${Math.min(index % 4, 3) * 90}ms`
    );
  });

  function updateProgressBar() {
    if (!progressBar) return;

    const total =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      total > 0 ? (window.scrollY / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
  }

  function revealOnScroll() {
    const triggerPoint = window.innerHeight * 0.9;

    revealElements.forEach((element) => {
      if (element.classList.contains("is-visible")) return;

      const position = element.getBoundingClientRect();

      if (position.top < triggerPoint) {
        element.classList.add("is-visible");
      }
    });
  }

  let ticking = false;

  function handleScroll() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateProgressBar();
      revealOnScroll();
      ticking = false;
    });
  }

  updateProgressBar();
  revealOnScroll();

  window.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener("resize", () => {
    updateProgressBar();
    revealOnScroll();
  });

  setTimeout(revealOnScroll, 250);
});