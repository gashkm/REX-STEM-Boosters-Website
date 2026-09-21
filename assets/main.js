const menuButton = document.querySelector('.menu-toggle');

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(
    carousel.querySelectorAll(".carousel-slide")
  );

  const previous = document.querySelector(".carousel-prev");
  const next = document.querySelector(".carousel-next");
  const status = document.querySelector(".carousel-status");

  /*
    Add one clone before the original slides and two after them.

    The second trailing clone ensures that another image remains
    partially visible while the carousel loops from the last slide
    back to the first.
  */

  const lastClone = slides.at(-1).cloneNode(true);
  const firstClone = slides[0].cloneNode(true);
  const secondClone = slides[1].cloneNode(true);

  lastClone.setAttribute("aria-hidden", "true");
  firstClone.setAttribute("aria-hidden", "true");
  secondClone.setAttribute("aria-hidden", "true");

  lastClone.classList.add("carousel-clone");
  firstClone.classList.add("carousel-clone");
  secondClone.classList.add("carousel-clone");

  track.insertBefore(lastClone, slides[0]);
  track.append(firstClone, secondClone);

  let logicalIndex = 0;
  let physicalIndex = 1;
  let autoplayTimer;
  let isMoving = false;

  const slideDistance = () => {
    const trackStyles = getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;

    return slideWidth + gap;
  };

  const updateStatus = () => {
    const current = String(logicalIndex + 1).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");

    status.textContent = `${current} / ${total}`;
  };

  const updateCarousel = (animate = true) => {
    track.classList.toggle("is-jumping", !animate);

    const offset = physicalIndex * slideDistance();

    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    updateStatus();
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayTimer);

    const paused =
      carousel.matches(":hover") ||
      carousel.contains(document.activeElement) ||
      document.hidden;

    if (!reducedMotion && !paused) {
      autoplayTimer = window.setTimeout(() => {
        move(1, true);
      }, 3500);
    }
  };

  const move = (direction, automatic = false) => {
    if (isMoving) return;

    isMoving = true;

    logicalIndex =
      (logicalIndex + direction + slides.length) %
      slides.length;

    physicalIndex += direction;

    updateCarousel(true);

    /*
      Manual navigation resets autoplay. Automatic navigation
      is rescheduled after the transition finishes.
    */

    if (!automatic) {
      window.clearTimeout(autoplayTimer);
    }
  };

  previous.addEventListener("click", () => {
    move(-1);
  });

  next.addEventListener("click", () => {
    move(1);
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return;

    /*
      Forward loop:

      The carousel has reached the clone of slide one. It can
      now jump invisibly to the real slide one.
    */

    if (physicalIndex === slides.length + 1) {
      physicalIndex = 1;
      updateCarousel(false);
    }

    /*
      Backward loop:

      The carousel has reached the clone of the last slide. It
      can now jump invisibly to the real last slide.
    */

    if (physicalIndex === 0) {
      physicalIndex = slides.length;
      updateCarousel(false);
    }

    isMoving = false;
    scheduleAutoplay();
  });

  carousel.addEventListener("mouseenter", () => {
    window.clearTimeout(autoplayTimer);
  });

  carousel.addEventListener("mouseleave", () => {
    scheduleAutoplay();
  });

  carousel.addEventListener("focusin", () => {
    window.clearTimeout(autoplayTimer);
  });

  carousel.addEventListener("focusout", () => {
    scheduleAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(autoplayTimer);
    } else {
      scheduleAutoplay();
    }
  });

  window.addEventListener("resize", () => {
    updateCarousel(false);
  });

  updateCarousel(false);
  scheduleAutoplay();
}