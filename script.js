(() => {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('toggle');
  const menu = document.getElementById('menu');
  const wa = document.querySelector('.wa-float');

  // Nav background + floating button on scroll
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    wa.classList.toggle('is-visible', y > window.innerHeight * 0.6);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Reveal on scroll
  document.querySelectorAll('.compound__bars span').forEach((s, i) => s.style.setProperty('--i', i));
  const targets = document.querySelectorAll('.reveal, .compound');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // drop stagger delay once revealed so hover effects stay snappy
          setTimeout(() => { el.style.transitionDelay = ''; }, 1400);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-in'));
  }

  // Stagger siblings
  document.querySelectorAll('.steps, .plans').forEach((group) => {
    [...group.children].forEach((c, i) => { c.style.transitionDelay = `${i * 110}ms`; });
  });

  // Active nav link
  const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => so.observe(s));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
