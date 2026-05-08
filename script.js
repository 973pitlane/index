(function () {
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1EkitrfFU8-UFPJq1Q2Qyxdl2k8gd2BgwfSxrwcUDTiA/export?format=csv&gid=0';

  const FALLBACK_WORKS = [
    { title: 'نموذج تصميم سيارة 1', image: 'assets/work-1.png', fullImage: 'assets/work-1.png' },
    { title: 'نموذج تصميم سيارة 2', image: 'assets/work-2.png', fullImage: 'assets/work-2.png' },
    { title: 'نموذج تصميم سيارة 3', image: 'assets/work-3.png', fullImage: 'assets/work-3.png' },
    { title: 'نموذج تصميم سيارة 4', image: 'assets/work-4.png', fullImage: 'assets/work-4.png' },
    { title: 'نموذج تصميم سيارة 5', image: 'assets/work-5.png', fullImage: 'assets/work-5.png' },
    { title: 'نموذج تصميم سيارة 6', image: 'assets/work-6.png', fullImage: 'assets/work-6.png' },
    { title: 'نموذج تصميم سيارة 7', image: 'assets/work-7.png', fullImage: 'assets/work-7.png' },
    { title: 'نموذج تصميم سيارة 8', image: 'assets/work-8.png', fullImage: 'assets/work-8.png' },
    { title: 'نموذج تصميم سيارة 9', image: 'assets/work-9.png', fullImage: 'assets/work-9.png' }
  ];

  const track = document.querySelector('.work-track');
  const prev = document.querySelector('.slider-btn.prev');
  const next = document.querySelector('.slider-btn.next');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeLightbox = document.querySelector('.lightbox-close');
  const form = document.querySelector('#lead-form form');
  const success = document.getElementById('form-success');

  let items = [];
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
    if (items.length > visibleCount()) {
      timer = window.setInterval(goNext, 3500);
    }
  }

  function stopSlider() {
    if (timer) window.clearInterval(timer);
  }

  function extractDriveId(url) {
    if (!url) return '';
    const patterns = [
      /\/file\/d\/([^/]+)/,
      /\/d\/([^/]+)/,
      /[?&]id=([^&]+)/,
      /\/folders\/([^/?]+)/
    ];

    for (const pattern of patterns) {
      const match = String(url).match(pattern);
      if (match && match[1]) return match[1];
    }

    return '';
  }

  function driveImageUrl(url, size) {
    const raw = String(url || '').trim();
    const id = extractDriveId(raw);

    if (!raw) return '';
    if (!id) return raw;

    return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(value.trim());
        value = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i += 1;
        row.push(value.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        value = '';
      } else {
        value += char;
      }
    }

    row.push(value.trim());
    if (row.some(Boolean)) rows.push(row);

    return rows;
  }

  function worksFromCSV(csvText) {
    const rows = parseCSV(csvText);
    const headers = rows.shift().map(function (header) {
      return header.trim();
    });

    return rows.map(function (row) {
      const item = {};

      headers.forEach(function (header, index) {
        if (header) item[header] = row[index] || '';
      });

      return {
        title: item.title || 'تصميم من أعمال 973PITLANE',
        image: item.image || item.fullImage || '',
        fullImage: item.fullImage || item.image || ''
      };
    }).filter(function (item) {
      return item.image;
    });
  }

  function openLightbox(item) {
    if (!lightbox || !lightboxImg) return;

    const src = item.getAttribute('data-full');
    const alt = item.querySelector('img')?.getAttribute('alt') || 'صورة العمل بحجم كبير';

    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    stopSlider();
  }

  function renderWorks(works) {
    if (!track) return;

    track.innerHTML = '';

    works.forEach(function (work, itemIndex) {
      const button = document.createElement('button');
      const image = document.createElement('img');

      button.className = 'work-item';
      button.type = 'button';
      button.setAttribute('data-full', driveImageUrl(work.fullImage, 2000));

      image.src = driveImageUrl(work.image, 900);
      image.alt = work.title || `نموذج تصميم سيارة ${itemIndex + 1}`;
      image.loading = 'lazy';

      image.addEventListener('error', function () {
        button.style.display = 'none';
      });

      button.appendChild(image);
      button.addEventListener('click', function () {
        openLightbox(button);
      });

      track.appendChild(button);
    });

    items = Array.from(document.querySelectorAll('.work-item'));
    index = 0;
    updateSlider();
    startSlider();
  }

  async function loadWorks() {
    try {
      const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Could not load Google Sheet');
      }

      const csvText = await response.text();
      const works = worksFromCSV(csvText);

      renderWorks(works.length ? works : FALLBACK_WORKS);
    } catch (error) {
      console.warn('Using fallback works:', error);
      renderWorks(FALLBACK_WORKS);
    }
  }

  function closeModal() {
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    startSlider();
  }

  if (next && prev) {
    next.addEventListener('click', function () { goNext(); startSlider(); });
    prev.addEventListener('click', function () { goPrev(); startSlider(); });
  }

  if (closeLightbox) closeLightbox.addEventListener('click', closeModal);
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && lightbox?.classList.contains('active')) closeModal();
  });

  if (form && success) {
    form.addEventListener('submit', function () {
      success.hidden = false;
      success.style.display = 'block';
    });
  }

  window.addEventListener('resize', updateSlider);
  loadWorks();
}());
