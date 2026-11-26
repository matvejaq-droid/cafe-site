/* =========================================================
   Общий JS для демо-шаблонов «Кафе» и «Барбершоп»
   ========================================================= */

document.documentElement.classList.add('js');

/* ---------- Тень шапки при скролле ---------- */
const header = document.getElementById('header');
const updateHeader = () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ---------- Мобильное меню ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

const closeNav = () => {
  if (!nav || !burger) return;
  nav.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Открыть меню');
};

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNav();
  });

  document.addEventListener('click', event => {
    if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) closeNav();
  });
}

/* ---------- Появление блоков ---------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}

/* ---------- Табы (меню кафе) ---------- */
document.querySelectorAll('[data-tabs]').forEach(tabs => {
  const buttons = tabs.querySelectorAll('.tab-btn');
  const panels = tabs.querySelectorAll('.tab-panel');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.tab;
      buttons.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === name));
    });
  });
});

/* ---------- Карусель отзывов ---------- */
const reviewsTrack = document.getElementById('reviewsTrack');
const reviewsPrev = document.getElementById('reviewsPrev');
const reviewsNext = document.getElementById('reviewsNext');

const scrollReviews = direction => {
  if (!reviewsTrack) return;
  const card = reviewsTrack.querySelector('.review-card');
  if (!card) return;
  const gap = parseFloat(getComputedStyle(reviewsTrack).gap) || 20;
  const step = card.getBoundingClientRect().width + gap;
  reviewsTrack.scrollBy({ left: direction * step, behavior: 'smooth' });
};

reviewsPrev?.addEventListener('click', () => scrollReviews(-1));
reviewsNext?.addEventListener('click', () => scrollReviews(1));

/* ---------- Кнопки «Записаться» / «Выбрать» ---------- */
document.querySelectorAll('.js-choose').forEach(button => {
  button.addEventListener('click', () => {
    const selected = [
      { selector: '#service', value: button.dataset.service },
      { selector: '#master', value: button.dataset.master }
    ];

    selected.forEach(item => {
      if (!item.value) return;
      const select = document.querySelector(item.selector);
      if (!select) return;
      const option = Array.from(select.options).find(
        opt => opt.value === item.value || opt.textContent.trim() === item.value
      );
      if (option) select.value = option.value;
    });

    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      document.getElementById('name')?.focus({ preventScroll: true });
    }, 550);
  });
});

/* ---------- FAQ: только один открытый вопрос ---------- */
document.querySelectorAll('.faq-list').forEach(list => {
  list.addEventListener('toggle', event => {
    const details = event.target;
    if (details.tagName !== 'DETAILS' || !details.open) return;
    list.querySelectorAll('details[open]').forEach(item => {
      if (item !== details) item.open = false;
    });
  }, true);
});

/* ---------- Валидация формы ---------- */
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  const setFieldError = (input, message) => {
    const errorNode = bookingForm.querySelector(`[data-error-for="${input.id}"]`);
    if (errorNode) errorNode.textContent = message;

    const wrapper = input.closest('.field') || input.closest('.checkbox');
    if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
  };

  const validateInput = input => {
    const type = input.dataset.validate;
    const label = input.dataset.label || 'Поле';
    let message = '';

    if (type === 'checkbox') {
      if (!input.checked) message = 'Поставьте галочку, чтобы продолжить';
    } else if (type === 'phone') {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length < 10) message = 'Введите номер телефона полностью';
    } else if (type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) message = 'Проверьте адрес почты';
    } else if (type === 'select') {
      if (!input.value) message = `Выберите: ${label.toLowerCase()}`;
    } else if (input.value.trim().length < 2) {
      message = `${label}: минимум 2 символа`;
    }

    setFieldError(input, message);
    return !message;
  };

  bookingForm.querySelectorAll('[data-validate]').forEach(input => {
    input.addEventListener('input', () => setFieldError(input, ''));
    input.addEventListener('change', () => setFieldError(input, ''));
  });

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    let isValid = true;
    let firstInvalid = null;

    bookingForm.querySelectorAll('[data-validate]').forEach(input => {
      const ok = validateInput(input);
      if (!ok && !firstInvalid) firstInvalid = input;
      if (!ok) isValid = false;
    });

    if (!isValid) {
      firstInvalid?.focus();
      return;
    }

    const success = document.getElementById('formSuccess');
    bookingForm.reset();
    bookingForm.querySelectorAll('.field, .checkbox').forEach(item => item.classList.remove('has-error'));
    bookingForm.querySelectorAll('.field__error').forEach(item => { item.textContent = ''; });

    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ---------- Год в подвале ---------- */
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
