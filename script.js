(function () {
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyv1czdgvkdVbLBcJ2vx6c9o7KkPlxaASZO_-rKhCLjOOhkLTqFXiLQCc99fYBo4Eyug-huupbwxlx/pub?output=csv';

  const track = document.querySelector('.work-track');
  if (track) track.innerHTML = '';
  const prev = document.querySelector('.slider-btn.prev');
  const next = document.querySelector('.slider-btn.next');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeLightbox = document.querySelector('.lightbox-close');
  const form = document.querySelector('#lead-form form');
  const success = document.getElementById('form-success');
  const copyIbanButton = document.querySelector('.copy-iban');

  let items = [];
  let index = 0;
  let timer;

  function getDriveId(url) {
    if (!url) return '';
    const patterns = [
      /\/file\/d\/([^/]+)/,
      /id=([^&]+)/,
      /\/d\/([^/]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    return '';
  }

  function toImageUrl(url) {
    if (!url) return '';
    if (!url.includes('drive.google.com')) return url;

    const id = getDriveId(url);
    if (!id) return url;

    return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
  }

  function parseCSV(text) {
    const rows = [];
    let current = '';
    let row = [];
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (current || row.length) {
          row.push(current.trim());
          rows.push(row);
          row = [];
          current = '';
        }
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        current += char;
      }
    }

    if (current || row.length) {
      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  }

  function renderWorks(works) {
    if (!track || !works.length) return;

    track.innerHTML = '';

    works.forEach(function (work, i) {
      const title = work.title || `نموذج تصميم سيارة ${i + 1}`;
      const image = toImageUrl(work.image);
      const fullImage = toImageUrl(work.fullImage || work.image);

      if (!image) return;

      const button = document.createElement('button');
      button.className = 'work-item';
      button.type = 'button';
      button.setAttribute('data-full', fullImage);

      const img = document.createElement('img');
      img.src = image;
      img.alt = title;
      img.loading = 'lazy';

      button.appendChild(img);
      track.appendChild(button);
    });

    items = Array.from(document.querySelectorAll('.work-item'));
    bindLightbox();
    index = 0;
    updateSlider();
    startSlider();
  }

  async function loadWorksFromSheet() {
    if (!track) return;

    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error('Sheet fetch failed');

      const rows = parseCSV(await response.text());
      const headers = rows.shift().map(function (h) { return h.trim(); });

      const works = rows.map(function (row) {
        const item = {};
        headers.forEach(function (header, i) {
          item[header] = row[i] || '';
        });
        return item;
      }).filter(function (item) {
        return item.image;
      });

      renderWorks(works);
    } catch (error) {
      items = Array.from(document.querySelectorAll('.work-item'));
      bindLightbox();
      updateSlider();
      startSlider();
    }
  }

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

  function bindLightbox() {
    items.forEach(function (item) {
      item.onclick = function () {
        const src = item.getAttribute('data-full');
        const alt = item.querySelector('img')?.getAttribute('alt') || 'صورة العمل بحجم كبير';

        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        stopSlider();
      };
    });
  }

  function closeModal() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    startSlider();
  }

  if (next && prev) {
    next.addEventListener('click', function () {
      goNext();
      startSlider();
    });

    prev.addEventListener('click', function () {
      goPrev();
      startSlider();
    });
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
      success.style.display = 'block';
    });
  }

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

  window.addEventListener('resize', updateSlider);

  loadWorksFromSheet();

  const faqButton = document.querySelector('.faq-side-btn');
  const faqPopup = document.getElementById('faq-popup');
  const faqClose = document.querySelector('.faq-popup-close');

  function openFaqPopup() {
    if (!faqPopup) return;
    faqPopup.classList.add('active');
    faqPopup.setAttribute('aria-hidden', 'false');
    if (faqButton) faqButton.setAttribute('aria-expanded', 'true');
  }

  function closeFaqPopup() {
    if (!faqPopup) return;
    faqPopup.classList.remove('active');
    faqPopup.setAttribute('aria-hidden', 'true');
    if (faqButton) faqButton.setAttribute('aria-expanded', 'false');
  }

  if (faqButton) {
    faqButton.addEventListener('click', function () {
      if (faqPopup && faqPopup.classList.contains('active')) closeFaqPopup();
      else openFaqPopup();
    });
  }

  if (faqClose) faqClose.addEventListener('click', closeFaqPopup);
  if (faqPopup) faqPopup.addEventListener('click', function (event) { if (event.target === faqPopup) closeFaqPopup(); });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && faqPopup && faqPopup.classList.contains('active')) closeFaqPopup();
  });

  document.querySelectorAll('.faq-popup-link').forEach(function (link) { link.addEventListener('click', closeFaqPopup); });
function trackGA(eventName, label) {
  if (typeof gtag !== 'function') {
    console.log('GA not loaded:', eventName);
    return;
  }

  gtag('event', eventName, {
    event_category: 'package_click',
    event_label: label
  });

  console.log('GA event sent:', eventName, label);
}

document.querySelectorAll('a[href*="wa.me/97334040460"]').forEach(function (link) {
  link.addEventListener('click', function () {
    const href = decodeURIComponent(link.href);

    if (href.includes('DIGITAL PACK 01')) {
      trackGA('whatsapp_click_DP1', 'DIGITAL PACK 01');
      return;
    }

    trackGA('whatsapp_click', 'whatsapp_general');
  });
});
}());
