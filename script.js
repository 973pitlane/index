(function () {
  const track = document.querySelector('.work-track');
  const items = Array.from(document.querySelectorAll('.work-item'));
  const prev = document.querySelector('.slider-btn.prev');
  const next = document.querySelector('.slider-btn.next');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeLightbox = document.querySelector('.lightbox-close');
  const form = document.querySelector('#lead-form form');
  const success = document.getElementById('form-success');

  let index = 0;
  let timer;

  function visibleCount() {
    return window.matchMedia('(max-width: 768px)').matches ? 1 : 3;
  }

  function maxIndex() {
    return Math.max(items.length - visibleCount(), 0);
  }

  function updateSlider() {
    if (!track || !items.length) return;
    index = Math.min(index, maxIndex());
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const itemWidth = items[0].getBoundingClientRect().width;
    const offset = index * (itemWidth + gap);
    track.style.transform = `translateX(${offset}px)`;
  }

  function goNext() {
    index = index >= maxIndex() ? 0 : index + 1;
    updateSlider();
  }

  function goPrev() {
    index = index <= 0 ? maxIndex() : index - 1;
    updateSlider();
  }

  function startSlider() {
    stopSlider();
    timer = window.setInterval(goNext, 3500);
  }

  function stopSlider() {
    if (timer) window.clearInterval(timer);
  }

  if (next && prev) {
    next.addEventListener('click', function () { goNext(); startSlider(); });
    prev.addEventListener('click', function () { goPrev(); startSlider(); });
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      const src = item.getAttribute('data-full');
      const alt = item.querySelector('img')?.getAttribute('alt') || 'صورة العمل بحجم كبير';
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      stopSlider();
    });
  });

  function closeModal() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    startSlider();
  }

  if (closeLightbox) closeLightbox.addEventListener('click', closeModal);
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && lightbox.classList.contains('active')) closeModal();
  });

  if (form && success) {
    form.addEventListener('submit', function () {
      success.hidden = false;
    });
  }

  window.addEventListener('resize', updateSlider);
  updateSlider();
  startSlider();

  const copyIbanButton = document.querySelector('.copy-iban');

  if (copyIbanButton) {
    copyIbanButton.addEventListener('click', function () {
      const value = copyIbanButton.getAttribute('data-copy') || '';
      if (!value) return;

      navigator.clipboard.writeText(value).then(function () {
        const originalText = copyIbanButton.textContent;
        copyIbanButton.textContent = 'تم النسخ';
        copyIbanButton.classList.add('copied');

        window.setTimeout(function () {
          copyIbanButton.textContent = originalText;
          copyIbanButton.classList.remove('copied');
        }, 1800);
      }).catch(function () {
        copyIbanButton.textContent = value;
      });
    });
  }


}());
