// scripts.js — robust slider + helpers (drop-in replacement)
// Logs details to console to help debugging if slider doesn't move.

document.addEventListener('DOMContentLoaded', () => {
  // small helper
  const log = (...args) => console.log('[slider]', ...args);

  // find slider elements
  const slider = document.querySelector('.hero-slider');
  if (!slider) { log('No .hero-slider found — nothing to do.'); return; }

  const wrapper = slider.querySelector('.slides-wrapper');
  if (!wrapper) { log('No .slides-wrapper found inside .hero-slider.'); return; }

  let slides = Array.from(wrapper.querySelectorAll('.slide'));
  if (slides.length === 0) {
    log('No .slide elements found. Ensure HTML has .slide inside .slides-wrapper.');
    return;
  }

  // Make wrapper & slides flexed and sized if CSS missing or wrong
  try {
    if (getComputedStyle(wrapper).display !== 'flex') {
      wrapper.style.display = 'flex';
      wrapper.style.width = `${slides.length * 100}%`;
    }
    slides.forEach(sl => {
      sl.style.flex = '0 0 100%';
      sl.style.maxWidth = '100%';
    });
    // ensure wrapper has transition for smooth slide
    if (!wrapper.style.transition) wrapper.style.transition = 'transform 0.65s cubic-bezier(.2,.9,.27,1)';
  } catch (e) {
    log('Warning while forcing wrapper/slide styles:', e);
  }

  // determine controls: prefer data-action, fallback to class names
  let prevBtn = slider.querySelector('[data-action="prev"]') || slider.querySelector('.prev') || slider.querySelector('.slider-arrow.prev');
  let nextBtn = slider.querySelector('[data-action="next"]') || slider.querySelector('.next') || slider.querySelector('.slider-arrow.next');

  const dotsWrap = slider.querySelector('.slider-dots');

  log(`Found ${slides.length} slides. prevBtn=${!!prevBtn}, nextBtn=${!!nextBtn}, dotsWrap=${!!dotsWrap}`);

  // sanity-check background-image presence (helps debug "same image" symptom)
  slides.forEach((s, i) => {
    const bg = (s.style.backgroundImage || '').replace(/url\(|\)|"/g, '').trim();
    log(`slide[${i}] background:`, bg || '(no inline bg-image set — maybe set via CSS/class)');
  });

  // slider state
  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) index = 0;
  const total = slides.length;
  const AUTOPLAY_INTERVAL = 4500;
  let timer = null;

  // helper to set transform
  function updatePosition() {
    const translateX = -index * 100;
    wrapper.style.transform = `translateX(${translateX}%)`;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
    }
    log(`Moved to slide ${index + 1}/${total} (translateX ${translateX}%)`);
  }

  // create dots if necessary
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = i === index ? 'dot active' : 'dot';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => { goTo(i, true); });
      dotsWrap.appendChild(b);
    });
  }

  function goTo(i, byUser = false) {
    index = ((i % total) + total) % total;
    updatePosition();
    if (byUser) restartAutoplay();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  else log('Next button not found; add [data-action="next"] or .next class to your next arrow.');

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  else log('Prev button not found; add [data-action="prev"] or .prev class to your prev arrow.');

  // autoplay
  function play() { stop(); timer = setInterval(next, AUTOPLAY_INTERVAL); log('Autoplay started'); }
  function stop() { if (timer) { clearInterval(timer); timer = null; log('Autoplay stopped'); } }
  function restartAutoplay() { stop(); play(); }

  // pause on hover/focus
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', play);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', play);

  // keyboard support
  document.addEventListener('keydown', (e) => {
    const t = (document.activeElement || {}).tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // initial set
  updatePosition();
  play();

  // debug: expose small API on slider for console testing
  slider.__debug = { goTo, next, prev, index: () => index, wrapper, slides };
  log('Slider debug API available at document.querySelector(\'.hero-slider\').__debug');

});
// ===== ACCORDION LOGIC =====
document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {

    const item = header.parentElement;
    const accordion = item.parentElement;

    // Close others
    accordion.querySelectorAll(".accordion-item").forEach(i => {
      if (i !== item) i.classList.remove("active");
    });

    // Toggle current
    item.classList.toggle("active");
  });
});
// HERO SLIDER (plain, tiny)
document.addEventListener('DOMContentLoaded', function () {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsWrap = slider.querySelector('.slider-dots');
  const prevBtn = slider.querySelector('.slider-arrow.prev');
  const nextBtn = slider.querySelector('.slider-arrow.next');
  let current = 0;
  let autoplay = true;
  let interval = 5000; // ms
  let timer;

  // create dots
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Slide ' + (i + 1));
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });
  const dots = Array.from(dotsWrap.children);

  function updateUI() {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    updateUI();
    restartTimer();
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  // autoplay control
  function startTimer() {
    if (!autoplay) return;
    timer = setInterval(next, interval);
  }
  function stopTimer() { clearInterval(timer); }
  function restartTimer() { stopTimer(); startTimer(); }

  // attach events
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); });

  // pause on hover
  slider.addEventListener('mouseenter', stopTimer);
  slider.addEventListener('mouseleave', startTimer);

  // swipe support (very small)
  (function addSwipe(el) {
    let startX = 0, endX = 0;
    el.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    el.addEventListener('touchmove', e => endX = e.touches[0].clientX);
    el.addEventListener('touchend', () => {
      if (!startX || !endX) return;
      const delta = startX - endX;
      if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
      startX = endX = 0;
    });
  })(slider);

  // init
  updateUI();
  startTimer();
});
// scripts.js — open Gmail compose directly (preferred) with fallback
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const msgBox = document.getElementById('formMessage');
  const OWNER_EMAIL = 'henshedressmakersklm@gmail.com';

  if (!form) return;

  const showMessage = (text, type='info') => {
    if (!msgBox) return alert(text);
    msgBox.hidden = false;
    msgBox.textContent = text;
    msgBox.className = 'form-message ' + type;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (form.querySelector('#name') || {}).value?.trim() || '';
    const email = (form.querySelector('#email') || {}).value?.trim() || '';
    const phone = (form.querySelector('#phone') || {}).value?.trim() || '';
    const message = (form.querySelector('#message') || {}).value?.trim() || '';

    if (!name) { showMessage('Please enter your name.', 'error'); return; }
    if (!email) { showMessage('Please enter your email.', 'error'); return; }
    if (!message) { showMessage('Please write a message.', 'error'); return; }

    const subject = `Website message from ${name}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      '',
      'Message:',
      message
    ];
    const body = bodyLines.join('\n');

    // encode for URL
    const enc = str => encodeURIComponent(str);

    // Gmail web compose URL (opens Gmail compose with prefilled fields)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${enc(OWNER_EMAIL)}&su=${enc(subject)}&body=${enc(body)}`;

    // Try to open Gmail compose in a new tab (user gesture, so usually allowed)
    let opened = false;
    try {
      const newWin = window.open(gmailUrl, '_blank');
      if (newWin) {
        newWin.focus();
        opened = true;
      }
    } catch (err) {
      opened = false;
      console.error('window.open error', err);
    }

    if (!opened) {
      // fallback to mailto if gmail couldn't open (note: mailto may trigger OS chooser)
      const mailto = `mailto:${OWNER_EMAIL}?subject=${enc(subject)}&body=${enc(body)}`;
      // open mailto in same tab (replaces current page) to try avoid popup blockers
      window.location.href = mailto;
      showMessage('Could not open Gmail compose tab — opening your default mail client instead. If that doesn’t work, ensure pop-ups are allowed.', 'error');
      return;
    }

    showMessage('Gmail compose opened in a new tab. Please send the message from there.', 'success');

    // optionally reset the form:
    // form.reset();
  });
});