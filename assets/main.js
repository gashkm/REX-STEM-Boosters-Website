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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const previous = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const status = document.querySelector('.carousel-status');
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  let logicalIndex = 0;
  let physicalIndex = 1;
  let autoplayTimer;

  const slideDistance = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const updateCarousel = (animate = true) => {
    track.classList.toggle('is-jumping', !animate);
    const offset = physicalIndex * slideDistance();
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    status.textContent = `${String(logicalIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    const paused = carousel.matches(':hover') || carousel.contains(document.activeElement) || document.hidden;
    if (!reducedMotion && !paused) autoplayTimer = window.setTimeout(() => move(1, true), 5200);
  };

  const move = (direction, automatic = false) => {
    logicalIndex = (logicalIndex + direction + slides.length) % slides.length;
    physicalIndex += direction;
    updateCarousel();
    if (!automatic) scheduleAutoplay();
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
  track.addEventListener('transitionend', () => {
    if (physicalIndex === slides.length + 1) {
      physicalIndex = 1;
      updateCarousel(false);
    } else if (physicalIndex === 0) {
      physicalIndex = slides.length;
      updateCarousel(false);
    }
    scheduleAutoplay();
  });
  carousel.addEventListener('mouseenter', () => window.clearTimeout(autoplayTimer));
  carousel.addEventListener('mouseleave', scheduleAutoplay);
  carousel.addEventListener('focusin', () => window.clearTimeout(autoplayTimer));
  carousel.addEventListener('focusout', scheduleAutoplay);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(autoplayTimer);
    else scheduleAutoplay();
  });
  window.addEventListener('resize', () => updateCarousel(false));
  updateCarousel(false);
  scheduleAutoplay();
}
