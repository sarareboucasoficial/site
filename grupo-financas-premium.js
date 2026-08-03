document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".progress-bar");
  const revealElements = document.querySelectorAll(".reveal");

  function updateProgressBar() {
    if (!progressBar) return;

    const total =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      total > 0 ? (window.scrollY / total) * 100 : 0;

    progressBar.style.width = percentage + "%";
  }

  function revealOnScroll() {
    revealElements.forEach((element) => {
      const position = element.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.88;

      if (position.top < triggerPoint) {
        element.classList.add("is-visible");
      }
    });
  }

  updateProgressBar();
  revealOnScroll();

  window.addEventListener("scroll", () => {
    updateProgressBar();
    revealOnScroll();
  });

  window.addEventListener("resize", revealOnScroll);

  setTimeout(revealOnScroll, 300);
});