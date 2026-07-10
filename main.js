const SUPABASE_URL = 'https://xhaabkwglcixymaqmwsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYWFia3dnbGNpeHltYXFtd3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzMwMjksImV4cCI6MjA5ODE0OTAyOX0.KT1GQnosUN69ECnmcy3F1selazllyZrl5GxEludnoz0';

let supabaseClient = null;

try {
  if (typeof window.supabase !== 'undefined') {
    if (SUPABASE_URL.includes('xyz.supabase.co') || SUPABASE_URL === '') {
      console.warn("Chưa nhập URL/Key Supabase. Tính năng lưu Like bị vô hiệu hóa.");
    } else {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
} catch (err) {
  console.error("Lỗi khởi tạo Supabase:", err);
}
let messages = {};
let currentLanguage = localStorage.getItem('language') || 'en';

function readMessage(key) {
  return key.split('.').reduce((value, part) => value && value[part], messages);
}

function t(key, fallback = key) {
  return readMessage(key) || fallback;
}

async function loadLanguage(lang) {
  try {
    const response = await fetch(`./messages/${lang}.json`);
    if (!response.ok) throw new Error(`Could not load ${lang}.json`);
    messages = await response.json();
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';
    applyTranslations();
  } catch (error) {
    console.warn('Could not load language dataset:', error);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n, element.textContent);
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml, element.innerHTML);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder, element.placeholder);
  });

  const languageToggle = document.getElementById('languageToggle');
  if (languageToggle) languageToggle.textContent = t('nav.languageToggle', currentLanguage === 'en' ? 'VI' : 'EN');

  const themeText = document.getElementById('theme-text');
  if (themeText) {
    const isDark = document.body.classList.contains('dark-mode');
    themeText.textContent = isDark ? t('nav.lightMode', 'Light Mode') : t('nav.darkMode', 'Dark Mode');
  }

  if (document.getElementById('commandPalette')?.classList.contains('show')) {
    renderCommandList(document.getElementById('commandSearch')?.value || '');
  }
}

function toggleLanguage() {
  const nextLanguage = currentLanguage === 'en' ? 'vi' : 'en';
  loadLanguage(nextLanguage).then(() => showToast(t('toast.language', 'Language switched.')));
}

const cursorDot = document.getElementById('cursorDot');
const cursorOutline = document.getElementById('cursorOutline');

if (cursorDot && cursorOutline) {
  document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate(
      [{ left: `${posX}px`, top: `${posY}px` }],
      { duration: 500, fill: 'forwards' }
    );
  });
}


function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-text');

  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  if (text) text.textContent = isDark ? t('nav.lightMode', 'Light Mode') : t('nav.darkMode', 'Dark Mode');

  localStorage.setItem('darkMode', isDark);
}

window.addEventListener('load', () => {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon) icon.textContent = '☀️';
    if (text) text.textContent = t('nav.lightMode', 'Light Mode');
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  triggerScrollAnimation();
  updateBackToTop();
  fetchCurrentLikes();
});


window.addEventListener('scroll', () => {
  const scrollProgress = document.querySelector('.scroll-progress');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (scrollHeight > 0 && scrollProgress) {
    const progressPercent = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = progressPercent + '%';
  }

  updateBackToTop();
  updateSideNav();
});

function updateSideNav() {
  const sections = document.querySelectorAll('section[id]');
  const navDots = document.querySelectorAll('.side-nav-dot');

  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (window.pageYOffset >= sectionTop - 300) {
      current = section.getAttribute('id');
    }
  });

  navDots.forEach((dot) => {
    dot.classList.remove('active');
    if (dot.getAttribute('href') === `#${current}`) {
      dot.classList.add('active');
    }
  });
}

function updateBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  if (window.scrollY > 500) {
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


function triggerScrollAnimation() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach((el) => counterObserver.observe(el));

  const skillFills = document.querySelectorAll('.skill-fill[data-width]');
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute('data-width');
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  skillFills.forEach((el) => skillObserver.observe(el));
}

function animateCounter(el, target) {
  let current = 0;
  const increment = target / 40;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 30);
}


const textsToType = ['Tech Enthusiast', 'IT Student at UEH', 'Future Software Engineer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  const typeSpan = document.querySelector('.typewriter-text');
  if (!typeSpan) return;

  const currentText = textsToType[textIndex];

  if (isDeleting) {
    typeSpan.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typeSpan.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  let nextSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentText.length) {
    nextSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % textsToType.length;
    nextSpeed = 500;
  }

  typeSpan.innerHTML = typeSpan.textContent + '<span style="border-right: 2px solid var(--accent-color); animation: blink 1s infinite;">&nbsp;</span>';
  setTimeout(typeWriter, nextSpeed);
}

document.addEventListener('DOMContentLoaded', typeWriter);


document.querySelectorAll('.card-3d, .project-card, .stat-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    for (let child of card.children) {
      child.style.transform = 'translateZ(30px)';
      child.style.transition = 'transform 0.1s ease-out';
    }

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    if (window.innerWidth <= 768) return;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    for (let child of card.children) {
      child.style.transform = 'translateZ(0px)';
      child.style.transition = 'transform 0.3s ease-out';
    }
  });
});


function showToast(message, duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

function copyEmail() {
  const email = 'dat82770@gmail.com';
  navigator.clipboard.writeText(email)
    .then(() => showToast('Email copied to clipboard!'))
    .catch(() => showToast('Could not copy email.'));
}


async function fetchCurrentLikes() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('page_stats')
      .select('likes_count')
      .eq('id', 1)
      .single();

    if (error) throw error;
    if (data) {
      const countEl = document.getElementById('reactionCount');
      if (countEl) countEl.textContent = data.likes_count;
    }
  } catch (error) {
    console.error('Lỗi khi tải lượt like:', error.message);
  }
}

let isLiking = false;
async function addReaction() {
  if (isLiking) return;
  isLiking = true;

  const countEl = document.getElementById('reactionCount');
  if (!countEl) return;

  let currentCount = parseInt(countEl.textContent) || 0;
  countEl.textContent = currentCount + 1;

  const btn = document.getElementById('reactionBtn');
  createMiniParticles(btn);
  showToast('Thanks for the like!');

  if (!supabaseClient) {
    isLiking = false;
    return;
  }

  try {
    const { error } = await supabaseClient.rpc('increment_likes');
    if (error) throw error;
  } catch (error) {
    console.error('Lỗi khi cộng like:', error.message);
    countEl.textContent = currentCount;
    showToast('Có lỗi xảy ra, không thể lưu lượt Like!');
  } finally {
    isLiking = false;
  }
}

function createMiniParticles(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span');
    particle.textContent = '👍';
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.fontSize = '1.2rem';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.transition = 'all 0.6s ease-out';
    particle.style.opacity = '1';

    document.body.appendChild(particle);

    const angle = (i / 8) * Math.PI * 2;
    const distance = 60;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 600);
  }
}


function openContactModal() {
  const m = document.getElementById('contactModal');
  if (m) m.classList.add('show');
}

function closeContactModal() {
  const m = document.getElementById('contactModal');
  if (m) m.classList.remove('show');
}

function openProjectDetail(e, project) {
  e.preventDefault();
  const modal = document.getElementById('projectModal');
  const content = document.getElementById('projectModalContent');
  if (!modal || !content) return;

  const details = {
    supermarket: {
      title: t('projects.supermarket.title'),
      tech: 'C#, WinForms, SQL Server',
      desc: t('projects.supermarket.modalDesc')
    },
    calculator: {
      title: t('projects.calculator.title'),
      tech: 'C#, DSA',
      desc: t('projects.calculator.modalDesc')
    },
    guestbook: {
      title: t('projects.guestbook.title'),
      tech: 'PHP, MySQL, HTML/CSS',
      desc: t('projects.guestbook.modalDesc')
    },
    myprofile: {
      title: t('projects.myprofile.title'),
      tech: 'HTML5, CSS3, JavaScript',
      desc: t('projects.myprofile.modalDesc')
    }
  };

  const d = details[project] || { title: 'Project', tech: '', desc: 'Details coming soon.' };

  content.innerHTML = `
    <h2 style="font-size: 2rem; color: var(--brand-dark); margin-bottom: 10px;">${d.title}</h2>
    <p><strong>${t('projectModal.techStack')}:</strong> ${d.tech}</p>
    <p style="margin-top:10px;">${d.desc}</p>
    <a href="https://github.com/datweb07" target="_blank" class="btn-brutal small" style="margin-top:1.5rem; display:inline-block; text-decoration:none;">${t('projectModal.viewGithub')}</a>
  `;

  modal.classList.add('show');
}

function closeProjectModal() {
  const m = document.getElementById('projectModal');
  if (m) m.classList.remove('show');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
  }
});



//gửi mail (web3forms)
async function submitContactForm(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const nameInput = document.getElementById('senderName');
  const emailInput = document.getElementById('senderEmail');
  const messageInput = document.getElementById('senderMessage');

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'đang gửi rùi nè...';
  submitBtn.style.pointerEvents = 'none';
  submitBtn.style.opacity = '0.7';

  const ACCESS_KEY = '21dc0912-2c35-4fb0-b823-c618d485e31d';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value,
        subject: 'Có tin nhắn mới từ trang Profile Dat Truong!'
      })
    });

    const result = await response.json();

    if (response.status === 200) {
      showToast('oki mình sẽ check mail sớm nhất nhé!!!');
      closeContactModal();
      event.target.reset();
    } else {
      console.error('Lỗi từ Web3Forms:', result);
      showToast('Gửi thất bại. Hãy thử lại sau nhé!');
    }
  } catch (error) {
    console.error('Lỗi Fetch API:', error);
    showToast('Lỗi mạng. Vui lòng kiểm tra lại kết nối!');
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.style.pointerEvents = 'auto';
    submitBtn.style.opacity = '1';
  }
}

const fab = document.getElementById('fab');
if (fab) fab.addEventListener('click', openContactModal);


function filterProjects(category, btn) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.project-item').forEach((item) => {
    if (category === 'all' || item.getAttribute('data-category') === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}


function toggleAccordion(header) {
  header.classList.toggle('active');
  const body = header.nextElementSibling;
  body.classList.toggle('open');

  document.querySelectorAll('.accordion-header').forEach((h) => {
    if (h !== header && h.classList.contains('active')) {
      h.classList.remove('active');
      h.nextElementSibling.classList.remove('open');
    }
  });
}

const commandBlueprints = [
  { key: 'home', shortcut: 'H', action: () => scrollToSection('home') },
  { key: 'journey', shortcut: 'J', action: () => scrollToSection('journey') },
  { key: 'projects', shortcut: 'P', action: () => scrollToSection('projects') },
  { key: 'github', shortcut: 'G', action: () => window.open('https://github.com/datweb07', '_blank') },
  { key: 'email', shortcut: 'E', action: copyEmail },
  { key: 'music', shortcut: 'M', action: togglePlay },
  { key: 'theme', shortcut: 'T', action: toggleDarkMode },
  { key: 'contact', shortcut: 'C', action: openContactModal }
];

let activeCommandIndex = 0;

function getCommandItems() {
  return commandBlueprints.map((item) => ({
    ...item,
    title: t(`command.items.${item.key}.title`, item.key),
    hint: t(`command.items.${item.key}.hint`, '')
  }));
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const search = document.getElementById('commandSearch');
  if (!palette || !search) return;
  palette.classList.add('show');
  palette.setAttribute('aria-hidden', 'false');
  search.value = '';
  activeCommandIndex = 0;
  renderCommandList('');
  setTimeout(() => search.focus(), 40);
}

function closeCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (!palette) return;
  palette.classList.remove('show');
  palette.setAttribute('aria-hidden', 'true');
}

function getFilteredCommands(query) {
  const q = query.trim().toLowerCase();
  const commandItems = getCommandItems();
  if (!q) return commandItems;
  return commandItems.filter((item) => {
    return item.title.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q) || item.shortcut.toLowerCase() === q;
  });
}

function renderCommandList(query) {
  const list = document.getElementById('commandList');
  if (!list) return;
  const filtered = getFilteredCommands(query);
  activeCommandIndex = Math.min(activeCommandIndex, Math.max(filtered.length - 1, 0));

  list.innerHTML = filtered.map((item, index) => `
    <button class="command-item hover-target ${index === activeCommandIndex ? 'active' : ''}" type="button" data-command-index="${index}">
      <span>
        <span class="command-title">${item.title}</span>
        <span class="command-hint">${item.hint}</span>
      </span>
      <span class="command-shortcut">${item.shortcut}</span>
    </button>
  `).join('');

  list.querySelectorAll('.command-item').forEach((button) => {
    button.addEventListener('click', () => runCommandAtIndex(parseInt(button.dataset.commandIndex, 10)));
  });
}

function runCommandAtIndex(index) {
  const search = document.getElementById('commandSearch');
  const filtered = getFilteredCommands(search?.value || '');
  const command = filtered[index];
  if (!command) return;
  closeCommandPalette();
  command.action();
}

function applyAccentColor(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--accent-color', color);
  localStorage.setItem('accentColor', color);
  document.querySelectorAll('.accent-swatch').forEach((swatch) => {
    swatch.classList.toggle('active', swatch.dataset.accent === color);
  });
}

function initAccentPicker() {
  const savedAccent = localStorage.getItem('accentColor');
  if (savedAccent) applyAccentColor(savedAccent);

  document.querySelectorAll('.accent-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => applyAccentColor(swatch.dataset.accent));
  });
}

function initCommandPalette() {
  const trigger = document.getElementById('commandTrigger');
  const closeBtn = document.getElementById('commandClose');
  const palette = document.getElementById('commandPalette');
  const search = document.getElementById('commandSearch');

  if (trigger) trigger.addEventListener('click', openCommandPalette);
  if (closeBtn) closeBtn.addEventListener('click', closeCommandPalette);
  if (palette) {
    palette.addEventListener('click', (e) => {
      if (e.target === palette) closeCommandPalette();
    });
  }
  if (search) {
    search.addEventListener('input', () => {
      activeCommandIndex = 0;
      renderCommandList(search.value);
    });
    search.addEventListener('keydown', (e) => {
      const filtered = getFilteredCommands(search.value);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeCommandIndex = (activeCommandIndex + 1) % Math.max(filtered.length, 1);
        renderCommandList(search.value);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeCommandIndex = (activeCommandIndex - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1);
        renderCommandList(search.value);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        runCommandAtIndex(activeCommandIndex);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    } else if (!isTyping) {
      const match = getCommandItems().find((item) => item.shortcut.toLowerCase() === e.key.toLowerCase());
      if (match && document.getElementById('commandPalette')?.classList.contains('show')) {
        closeCommandPalette();
        match.action();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLanguage(currentLanguage);
  const languageToggle = document.getElementById('languageToggle');
  if (languageToggle) languageToggle.addEventListener('click', toggleLanguage);
  initCommandPalette();
  initAccentPicker();
});


(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      const isDark = document.body.classList.contains('dark-mode');
      ctx.fillStyle = isDark ? 'rgba(204,243,129,0.4)' : 'rgba(72,49,212,0.25)';
      ctx.fill();
    }
  }

  function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.update();
      p.draw();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const isDark = document.body.classList.contains('dark-mode');
          ctx.strokeStyle = isDark
            ? `rgba(204,243,129,${0.1 * (1 - dist / 120)})`
            : `rgba(72,49,212,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }


  function openImageModal() {
    const modal = document.getElementById('imageModal');
    const fullImg = document.getElementById('fullImage');
    const profileImg = document.querySelector('.profile-image');
    if (!profileImg || !modal) return;

    const bgStyle = getComputedStyle(profileImg).backgroundImage;
    const url = profileImg.currentSrc || profileImg.src || bgStyle.slice(5, -2);
    fullImg.src = url;

    modal.classList.add('show');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.querySelector('.profile-image');
    if (profileImg) {
      profileImg.style.cursor = 'pointer';
      profileImg.addEventListener('click', openImageModal);
    }
  });

  function closeImageModal() {
    document.getElementById('imageModal').classList.remove('show');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.querySelector('.profile-image');
    if (profileImg) {
      profileImg.style.cursor = 'pointer';
      profileImg.addEventListener('click', openImageModal);
    }
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles(Math.floor((width * height) / 15000));
  });

  resize();
  createParticles(Math.floor((width * height) / 15000));
  animateParticles();
})();


const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentSongName = document.getElementById('currentSongName');
const repeatBtn = document.getElementById('repeatBtn');
const musicFab = document.getElementById('musicFab');

let isPlaying = false;
let isRepeat = false;

let currentSongIndex = localStorage.getItem('savedSongIndex') ? parseInt(localStorage.getItem('savedSongIndex')) : 0;
let shouldAutoPlay = localStorage.getItem('isMusicPlaying') === 'true';

const playlist = [
  { title: "之间", src: "./musics/之间.mp3" },
];

function updateMusicWidget() {
  if (!musicFab) return;
  musicFab.classList.toggle('playing', isPlaying);

  if (audioPlayer.duration) {
    const degrees = (audioPlayer.currentTime / audioPlayer.duration) * 360;
    musicFab.style.setProperty('--music-progress', `${degrees}deg`);
  } else {
    musicFab.style.setProperty('--music-progress', '0deg');
  }
}

function renderPlaylist() {
  const list = document.getElementById('songList');
  list.innerHTML = '';
  playlist.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.innerHTML = `
      <span class="song-item-title">${song.title}</span>
      <button class="btn-brutal small outline hover-target" onclick="playSong(${index})">▶ Play</button>
    `;
    list.appendChild(li);
  });
}

function loadSong(index) {
  currentSongIndex = index;
  audioPlayer.src = playlist[index].src;
  currentSongName.textContent = playlist[index].title;
  localStorage.setItem('savedSongIndex', index);
}

function playSong(index) {
  if (index !== currentSongIndex) {
    loadSong(index);
  }

  audioPlayer.play().then(() => {
    isPlaying = true;
    playPauseBtn.textContent = 'Stop';
    localStorage.setItem('isMusicPlaying', 'true');
    updateMusicWidget();
  }).catch(e => {
    console.warn("Trình duyệt chặn phát nhạc tự động:", e);
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    localStorage.setItem('isMusicPlaying', 'false');
    updateMusicWidget();
  });
}

function togglePlay() {
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    playPauseBtn.textContent = 'Continue';
    localStorage.setItem('isMusicPlaying', 'false');
    updateMusicWidget();
  } else {
    playSong(currentSongIndex);
  }
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  audioPlayer.loop = isRepeat;

  if (isRepeat) {
    repeatBtn.style.background = 'var(--text-primary)';
    repeatBtn.style.color = 'var(--bg-primary)';
  } else {
    repeatBtn.style.background = 'transparent';
    repeatBtn.style.color = 'inherit';
  }
}

audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    updateMusicWidget();
  }
});

function setProgress(e) {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  if (duration) {
    audioPlayer.currentTime = (clickX / width) * duration;
  }
}


//tự động chuyển nhạc
audioPlayer.addEventListener('ended', () => {
  if (!isRepeat) {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    playSong(nextIndex);
  }
});

function openMusicModal() {
  document.getElementById('musicModal').classList.add('show');
}

function closeMusicModal() {
  document.getElementById('musicModal').classList.remove('show');
}

window.addEventListener('load', () => {
  renderPlaylist();
  loadSong(currentSongIndex);
  updateMusicWidget();


  //nếu đang nghe, phát lại sau khi reload trang
  if (shouldAutoPlay) {
    playSong(currentSongIndex);
  }
});
