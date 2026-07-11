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

  const terminalScreen = document.getElementById('terminalScreen');
  if (terminalScreen) terminalScreen.dataset.ready = '';
  if (document.getElementById('terminalOverlay')?.classList.contains('show')) {
    resetTerminalIntro();
  }

  if (document.getElementById('mapOverlay')?.classList.contains('show')) {
    updateMapStatus();
    drawMap();
  }

  if (document.getElementById('timeOverlay')?.classList.contains('show')) {
    renderTimeTravel();
  }

  if (document.getElementById('iocOverlay')?.classList.contains('show')) {
    renderIocHeatmap();
    renderIocLogs();
  }

  if (document.getElementById('skillOverlay')?.classList.contains('show')) {
    drawSkillGraph();
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

function openCV() {
  window.open('./documents/cv.pdf', '_blank', 'noopener');
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
  { key: 'cv', shortcut: 'V', action: openCV },
  { key: 'music', shortcut: 'M', action: togglePlay },
  { key: 'theme', shortcut: 'T', action: toggleDarkMode },
  { key: 'contact', shortcut: 'C', action: openContactModal },
  { key: 'terminal', shortcut: '`', action: openTerminal },
  { key: 'map', shortcut: 'N', action: openMap },
  { key: 'time', shortcut: 'Y', action: openTimeTravel },
  { key: 'ioc', shortcut: 'I', action: openIOC },
  { key: 'skillsGraph', shortcut: 'S', action: openSkillGraph },
  { key: 'resume', shortcut: 'R', action: openResumeBoard }
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

const mapState = {
  x: 360,
  y: 210,
  activeZone: null,
  zones: [
    { id: 'home', x: 110, y: 95, w: 150, h: 92, target: 'home', color: '#ccf381' },
    { id: 'journey', x: 455, y: 74, w: 170, h: 98, target: 'journey', color: '#ff6b2b' },
    { id: 'projects', x: 440, y: 270, w: 185, h: 100, target: 'projects', color: '#4831d4' },
    { id: 'contact', x: 85, y: 265, w: 160, h: 92, target: 'contact', color: '#ff8fd3' }
  ]
};

function getMapCanvasContext() {
  const canvas = document.getElementById('mapCanvas');
  return canvas ? { canvas, ctx: canvas.getContext('2d') } : null;
}

function getActiveMapZone() {
  return mapState.zones.find((zone) => {
    return mapState.x >= zone.x && mapState.x <= zone.x + zone.w && mapState.y >= zone.y && mapState.y <= zone.y + zone.h;
  }) || null;
}

function drawMap() {
  const map = getMapCanvasContext();
  if (!map) return;
  const { canvas, ctx } = map;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(120, 210);
  ctx.lineTo(600, 210);
  ctx.moveTo(360, 80);
  ctx.lineTo(360, 350);
  ctx.stroke();

  const activeZone = getActiveMapZone();
  mapState.activeZone = activeZone?.id || null;

  mapState.zones.forEach((zone) => {
    const isActive = activeZone?.id === zone.id;
    ctx.fillStyle = isActive ? zone.color : 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = isActive ? 4 : 2;
    ctx.beginPath();
    ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isActive ? '#111827' : '#ffffff';
    ctx.font = '700 18px Barlow, sans-serif';
    ctx.fillText(t(`map.zones.${zone.id}`, zone.id), zone.x + 16, zone.y + 38);
  });

  ctx.save();
  ctx.translate(mapState.x, mapState.y);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ccf381';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-18, -11, 36, 22, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.fillRect(-8, -16, 16, 8);
  ctx.restore();

  updateMapStatus();
}

function updateMapStatus() {
  const status = document.getElementById('mapStatus');
  if (!status) return;
  const activeZone = getActiveMapZone();
  if (activeZone) {
    status.textContent = t('map.near', 'Near: {zone}. Press Enter or Visit zone.').replace('{zone}', t(`map.zones.${activeZone.id}`, activeZone.id));
  } else {
    status.textContent = t('map.empty', 'Drive to a glowing zone to navigate.');
  }
}

function visitMapZone() {
  const activeZone = getActiveMapZone();
  if (!activeZone) {
    showToast(t('map.empty', 'Drive to a glowing zone to navigate.'));
    return;
  }
  closeMap();
  if (activeZone.target === 'contact') {
    openContactModal();
  } else {
    scrollToSection(activeZone.target);
  }
}

function moveMap(dx, dy) {
  mapState.x = Math.max(26, Math.min(694, mapState.x + dx));
  mapState.y = Math.max(26, Math.min(394, mapState.y + dy));
  drawMap();
  updateSpatialAudio();
}

function openMap() {
  const overlay = document.getElementById('mapOverlay');
  if (!overlay) return;
  closeCommandPalette();
  closeTerminal();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  drawMap();
  initSpatialAudio();
  updateSpatialAudio();
}

function closeMap() {
  const overlay = document.getElementById('mapOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function initMapNavigation() {
  const trigger = document.getElementById('mapTrigger');
  const closeBtn = document.getElementById('mapClose');
  const visitBtn = document.getElementById('mapVisitBtn');
  const overlay = document.getElementById('mapOverlay');

  if (trigger) trigger.addEventListener('click', openMap);
  if (closeBtn) closeBtn.addEventListener('click', closeMap);
  if (visitBtn) visitBtn.addEventListener('click', visitMapZone);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMap();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('mapOverlay')?.classList.contains('show')) return;
    const key = e.key.toLowerCase();
    const speed = e.shiftKey ? 22 : 12;
    if (['arrowup', 'w'].includes(key)) {
      e.preventDefault();
      moveMap(0, -speed);
    } else if (['arrowdown', 's'].includes(key)) {
      e.preventDefault();
      moveMap(0, speed);
    } else if (['arrowleft', 'a'].includes(key)) {
      e.preventDefault();
      moveMap(-speed, 0);
    } else if (['arrowright', 'd'].includes(key)) {
      e.preventDefault();
      moveMap(speed, 0);
    } else if (key === 'enter') {
      e.preventDefault();
      visitMapZone();
    }
  });
}

function getTimeData(year) {
  return readMessage(`time.years.${year}`) || readMessage('time.years.2026') || {};
}

function renderTimeTravel() {
  const slider = document.getElementById('timeSlider');
  const yearLabel = document.getElementById('timeYear');
  const headline = document.getElementById('timeHeadline');
  const description = document.getElementById('timeDescription');
  const bars = document.getElementById('timeSkillBars');
  if (!slider || !yearLabel || !headline || !description || !bars) return;

  const year = slider.value;
  const data = getTimeData(year);
  yearLabel.textContent = year;
  headline.textContent = data.headline || '';
  description.textContent = data.description || '';
  bars.innerHTML = Object.entries(data.skills || {}).map(([skill, level]) => `
    <div class="time-skill">
      <div class="time-skill-label"><span>${skill}</span><span>${level}%</span></div>
      <div class="time-skill-track"><span class="time-skill-fill" style="--level: ${level}%"></span></div>
    </div>
  `).join('');
}

function openTimeTravel() {
  const overlay = document.getElementById('timeOverlay');
  if (!overlay) return;
  closeCommandPalette();
  closeTerminal();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  renderTimeTravel();
}

function closeTimeTravel() {
  const overlay = document.getElementById('timeOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function initTimeTravel() {
  const trigger = document.getElementById('timeTrigger');
  const closeBtn = document.getElementById('timeClose');
  const overlay = document.getElementById('timeOverlay');
  const slider = document.getElementById('timeSlider');

  if (trigger) trigger.addEventListener('click', openTimeTravel);
  if (closeBtn) closeBtn.addEventListener('click', closeTimeTravel);
  if (slider) slider.addEventListener('input', renderTimeTravel);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTimeTravel();
    });
  }
}

const iocState = {
  timer: null,
  latency: Array.from({ length: 28 }, () => 90 + Math.round(Math.random() * 95)),
  logs: [],
  cities: [
    { name: 'HCMC', value: 46 },
    { name: 'Hanoi', value: 31 },
    { name: 'Da Nang', value: 22 },
    { name: 'Singapore', value: 15 }
  ]
};

function getIocCanvasContext() {
  const canvas = document.getElementById('iocLatencyCanvas');
  return canvas ? { canvas, ctx: canvas.getContext('2d') } : null;
}

function drawIocLatencyChart() {
  const chart = getIocCanvasContext();
  if (!chart) return;
  const { canvas, ctx } = chart;
  const values = iocState.latency;
  const max = Math.max(...values, 260);
  const min = Math.min(...values, 35);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let y = 24; y < canvas.height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ccf381';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * (canvas.width - 28) + 14;
    const y = canvas.height - 18 - ((value - min) / Math.max(max - min, 1)) * (canvas.height - 38);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const latest = values[values.length - 1];
  const value = document.getElementById('iocLatencyValue');
  if (value) value.textContent = `${latest}ms`;
}

function renderIocHeatmap() {
  const heatmap = document.getElementById('iocHeatmap');
  if (!heatmap) return;
  const max = Math.max(...iocState.cities.map((city) => city.value), 1);
  heatmap.innerHTML = iocState.cities.map((city) => `
    <div class="ioc-city">
      <span>${city.name}</span>
      <span class="ioc-city-bar"><span style="--value: ${(city.value / max) * 100}%"></span></span>
      <span>${city.value}</span>
    </div>
  `).join('');
}

function renderIocLogs() {
  const stream = document.getElementById('iocLogStream');
  if (!stream) return;
  stream.innerHTML = iocState.logs.map((line) => `<div>${line}</div>`).join('');
  stream.scrollTop = stream.scrollHeight;
}

function pushIocLog() {
  const events = readMessage('ioc.events') || [
    'opened Project Hub',
    'played music',
    'copied email',
    'visited Learning Journey'
  ];
  const city = iocState.cities[Math.floor(Math.random() * iocState.cities.length)];
  const event = events[Math.floor(Math.random() * events.length)];
  const time = new Date().toLocaleTimeString([], { hour12: false });
  iocState.logs.push(`[${time}] User from ${city.name} ${event}`);
  if (iocState.logs.length > 8) iocState.logs.shift();
  city.value += Math.random() > 0.45 ? 1 : 0;
  renderIocLogs();
  renderIocHeatmap();
}

function tickIOC() {
  const next = 52 + Math.round(Math.random() * 170);
  iocState.latency.push(next);
  iocState.latency.shift();
  drawIocLatencyChart();
  if (Math.random() > 0.32) pushIocLog();
}

function openIOC() {
  const overlay = document.getElementById('iocOverlay');
  if (!overlay) return;
  closeCommandPalette();
  closeTerminal();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  if (!iocState.logs.length) pushIocLog();
  renderIocHeatmap();
  renderIocLogs();
  drawIocLatencyChart();
  if (!iocState.timer) iocState.timer = setInterval(tickIOC, 1000);
}

function closeIOC() {
  const overlay = document.getElementById('iocOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (iocState.timer) {
    clearInterval(iocState.timer);
    iocState.timer = null;
  }
}

function initIOC() {
  const closeBtn = document.getElementById('iocClose');
  const overlay = document.getElementById('iocOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeIOC);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeIOC();
    });
  }
}

const skillGraphState = {
  raf: null,
  pointer: { x: -999, y: -999 },
  nodes: [
    { label: 'C#', group: 'backend', x: 135, y: 120, vx: 0.45, vy: 0.25, projects: 'Supermarket Management' },
    { label: 'ASP.NET', group: 'backend', x: 245, y: 190, vx: -0.35, vy: 0.32, projects: 'Backend APIs, MVC apps' },
    { label: 'SQL Server', group: 'backend', x: 160, y: 300, vx: 0.3, vy: -0.25, projects: 'Supermarket Management, data workflows' },
    { label: 'JavaScript', group: 'frontend', x: 440, y: 120, vx: -0.28, vy: 0.35, projects: 'My Profile, Guest Book App' },
    { label: 'ReactJs', group: 'frontend', x: 570, y: 190, vx: 0.3, vy: -0.28, projects: 'Frontend experiments' },
    { label: 'HTML/CSS', group: 'frontend', x: 490, y: 315, vx: -0.42, vy: -0.22, projects: 'My Profile' },
    { label: 'DSA', group: 'logic', x: 350, y: 260, vx: 0.24, vy: -0.38, projects: 'Calculator Simulator' },
    { label: 'AI Agents', group: 'future', x: 635, y: 90, vx: -0.22, vy: 0.3, projects: 'Portfolio roadmap' }
  ]
};

function getSkillCanvasContext() {
  const canvas = document.getElementById('skillCanvas');
  return canvas ? { canvas, ctx: canvas.getContext('2d') } : null;
}

function drawSkillGraph() {
  const graph = getSkillCanvasContext();
  if (!graph) return;
  const { canvas, ctx } = graph;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ccf381';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  skillGraphState.nodes.forEach((a, i) => {
    skillGraphState.nodes.slice(i + 1).forEach((b) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (a.group === b.group || dist < 180) {
        ctx.strokeStyle = a.group === b.group ? 'rgba(204,243,129,0.38)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = a.group === b.group ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  });

  skillGraphState.nodes.forEach((node) => {
    const dist = Math.hypot(node.x - skillGraphState.pointer.x, node.y - skillGraphState.pointer.y);
    const active = dist < 88;
    ctx.beginPath();
    ctx.arc(node.x, node.y, active ? 32 : 25, 0, Math.PI * 2);
    ctx.fillStyle = active ? accent : 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = active ? '#111827' : '#1a191d';
    ctx.font = '700 14px Barlow, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  });
}

function animateSkillGraph() {
  const graph = getSkillCanvasContext();
  if (!graph) return;
  const { canvas } = graph;
  skillGraphState.nodes.forEach((node) => {
    const dx = node.x - skillGraphState.pointer.x;
    const dy = node.y - skillGraphState.pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 150) {
      skillGraphState.nodes.forEach((peer) => {
        if (peer.group === node.group && peer !== node) {
          peer.vx += (node.x - peer.x) * 0.0008;
          peer.vy += (node.y - peer.y) * 0.0008;
        }
      });
    }
    node.x += node.vx;
    node.y += node.vy;
    node.vx *= 0.992;
    node.vy *= 0.992;
    if (node.x < 45 || node.x > canvas.width - 45) node.vx *= -1;
    if (node.y < 45 || node.y > canvas.height - 45) node.vy *= -1;
    node.x = Math.max(45, Math.min(canvas.width - 45, node.x));
    node.y = Math.max(45, Math.min(canvas.height - 45, node.y));
  });
  drawSkillGraph();
  skillGraphState.raf = requestAnimationFrame(animateSkillGraph);
}

function openSkillGraph() {
  const overlay = document.getElementById('skillOverlay');
  if (!overlay) return;
  closeCommandPalette();
  closeTerminal();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  if (!skillGraphState.raf) animateSkillGraph();
}

function closeSkillGraph() {
  const overlay = document.getElementById('skillOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (skillGraphState.raf) {
    cancelAnimationFrame(skillGraphState.raf);
    skillGraphState.raf = null;
  }
}

function initSkillGraph() {
  const canvas = document.getElementById('skillCanvas');
  const closeBtn = document.getElementById('skillClose');
  const overlay = document.getElementById('skillOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeSkillGraph);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSkillGraph();
    });
  }
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      skillGraphState.pointer.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      skillGraphState.pointer.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    });
    canvas.addEventListener('mouseleave', () => {
      skillGraphState.pointer.x = -999;
      skillGraphState.pointer.y = -999;
    });
    canvas.addEventListener('dblclick', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      const node = skillGraphState.nodes.find((item) => Math.hypot(item.x - x, item.y - y) < 42);
      if (!node) return;
      showToast(t('skillsGraph.projects', '{skill} connects to: {projects}').replace('{skill}', node.label).replace('{projects}', node.projects), 4200);
    });
  }
}

function openResumeBoard() {
  const overlay = document.getElementById('resumeOverlay');
  if (!overlay) return;
  closeCommandPalette();
  closeTerminal();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeResumeBoard() {
  const overlay = document.getElementById('resumeOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function initResumeBoard() {
  const overlay = document.getElementById('resumeOverlay');
  const closeBtn = document.getElementById('resumeClose');
  const board = document.getElementById('resumeBoard');
  if (closeBtn) closeBtn.addEventListener('click', closeResumeBoard);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeResumeBoard();
    });
  }
  if (!board) return;

  board.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.resume-card');
    if (!card) return;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', card.dataset.card);
  });

  board.addEventListener('dragend', (e) => {
    e.target.closest('.resume-card')?.classList.remove('dragging');
    document.querySelectorAll('.resume-dropzone').forEach((zone) => zone.classList.remove('drag-over'));
  });

  board.querySelectorAll('.resume-dropzone').forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const card = board.querySelector(`.resume-card[data-card="${id}"]`);
      const column = zone.closest('.resume-column')?.dataset.column || '';
      if (!card) return;
      zone.classList.remove('drag-over');
      zone.appendChild(card);
      const columnName = t(`resume.columns.${column}`, column);
      const note = document.getElementById('resumeNote');
      const message = t('resume.dropped', 'Added to {column}.').replace('{column}', columnName);
      if (note) note.textContent = message;
      showToast(message);
      if (id === 'contact' && column === 'interview') openContactModal();
    });
  });
}

let terminalHistory = [];
let terminalHistoryIndex = 0;

function appendTerminalLine(text, type = '') {
  const screen = document.getElementById('terminalScreen');
  if (!screen) return;

  const line = document.createElement('div');
  line.className = `terminal-line ${type}`.trim();
  line.textContent = text;
  screen.appendChild(line);
  screen.scrollTop = screen.scrollHeight;
}

function resetTerminalIntro() {
  const screen = document.getElementById('terminalScreen');
  if (!screen || screen.dataset.ready === currentLanguage) return;
  screen.innerHTML = '';
  appendTerminalLine(t('terminal.welcome', 'Welcome to DatOS. Type help to see available commands.'), 'muted');
  screen.dataset.ready = currentLanguage;
}

function openTerminal() {
  const overlay = document.getElementById('terminalOverlay');
  const input = document.getElementById('terminalInput');
  if (!overlay || !input) return;
  closeCommandPalette();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  resetTerminalIntro();
  setTimeout(() => input.focus(), 40);
}

function closeTerminal() {
  const overlay = document.getElementById('terminalOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function runTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;

  appendTerminalLine(`dat@portfolio:~$ ${rawCommand}`, 'command');
  terminalHistory.push(rawCommand);
  terminalHistoryIndex = terminalHistory.length;

  switch (command) {
    case 'help':
      appendTerminalLine(t('terminal.help'));
      break;
    case 'about':
    case 'cat about.txt':
      appendTerminalLine(t('terminal.about'));
      break;
    case 'skills':
    case 'ls skills':
      appendTerminalLine(t('terminal.skills'));
      break;
    case 'projects':
    case 'ls projects':
      appendTerminalLine(t('terminal.projects'));
      scrollToSection('projects');
      break;
    case 'journey':
    case 'timeline':
      appendTerminalLine(t('terminal.journey'));
      scrollToSection('journey');
      break;
    case 'contact':
      appendTerminalLine(t('terminal.contact'));
      openContactModal();
      copyEmail();
      break;
    case 'github':
      appendTerminalLine(t('terminal.github'));
      window.open('https://github.com/datweb07', '_blank');
      break;
    case 'music':
      appendTerminalLine(t('terminal.music'));
      togglePlay();
      break;
    case 'theme':
      appendTerminalLine(t('terminal.theme'));
      toggleDarkMode();
      break;
    case 'lang':
    case 'language':
      appendTerminalLine(t('terminal.lang'));
      toggleLanguage();
      break;
    case 'map':
    case 'nav':
      appendTerminalLine(t('map.title'));
      openMap();
      break;
    case 'time':
    case 'years':
      appendTerminalLine(t('time.terminal'));
      openTimeTravel();
      break;
    case 'ioc':
    case 'control':
    case 'dashboard':
      appendTerminalLine(t('terminal.ioc'));
      openIOC();
      break;
    case 'graph':
    case 'skills-graph':
    case 'particles':
      appendTerminalLine(t('terminal.graph'));
      openSkillGraph();
      break;
    case 'resume':
    case 'kanban':
      appendTerminalLine(t('terminal.resume'));
      openResumeBoard();
      break;
    case 'cv':
    case 'pdf':
      appendTerminalLine(t('terminal.cv'));
      openCV();
      break;
    case 'clear':
    case 'cls':
      document.getElementById('terminalScreen').innerHTML = '';
      appendTerminalLine(t('terminal.cleared'), 'muted');
      break;
    default:
      appendTerminalLine(t('terminal.unknown'), 'error');
  }
}

function initTerminal() {
  const trigger = document.getElementById('terminalTrigger');
  const closeBtn = document.getElementById('terminalClose');
  const overlay = document.getElementById('terminalOverlay');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');

  if (trigger) trigger.addEventListener('click', openTerminal);
  if (closeBtn) closeBtn.addEventListener('click', closeTerminal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTerminal();
    });
  }
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runTerminalCommand(input.value);
      input.value = '';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runTerminalCommand(input.value);
        input.value = '';
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        terminalHistoryIndex = Math.max(terminalHistoryIndex - 1, 0);
        input.value = terminalHistory[terminalHistoryIndex] || '';
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        terminalHistoryIndex = Math.min(terminalHistoryIndex + 1, terminalHistory.length);
        input.value = terminalHistory[terminalHistoryIndex] || '';
      }
    });
  }
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
      closeTerminal();
      closeMap();
      closeTimeTravel();
      closeIOC();
      closeSkillGraph();
      closeResumeBoard();
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
  const cvTrigger = document.getElementById('cvTrigger');
  if (languageToggle) languageToggle.addEventListener('click', toggleLanguage);
  if (cvTrigger) cvTrigger.addEventListener('click', openCV);
  initCommandPalette();
  initAccentPicker();
  initTerminal();
  initMapNavigation();
  initTimeTravel();
  initIOC();
  initSkillGraph();
  initResumeBoard();
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
let spatialAudioCtx = null;
let spatialSource = null;
let spatialPanner = null;
let spatialGain = null;

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

function initSpatialAudio() {
  if (!audioPlayer || spatialSource) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    spatialAudioCtx = spatialAudioCtx || new AudioContextClass();
    spatialSource = spatialAudioCtx.createMediaElementSource(audioPlayer);
    spatialPanner = spatialAudioCtx.createStereoPanner();
    spatialGain = spatialAudioCtx.createGain();
    spatialSource.connect(spatialPanner);
    spatialPanner.connect(spatialGain);
    spatialGain.connect(spatialAudioCtx.destination);
    updateSpatialAudio();
  } catch (error) {
    spatialSource = null;
    spatialPanner = null;
    spatialGain = null;
    console.warn('Spatial audio is unavailable:', error);
  }
}

function updateSpatialAudio() {
  if (!spatialPanner || !spatialGain) return;
  const speaker = { x: 600, y: 210 };
  const distance = Math.hypot(mapState.x - speaker.x, mapState.y - speaker.y);
  const normalized = Math.min(distance / 520, 1);
  const pan = Math.max(-1, Math.min(1, (mapState.x - speaker.x) / 360));
  spatialPanner.pan.setTargetAtTime(pan, spatialAudioCtx.currentTime, 0.08);
  spatialGain.gain.setTargetAtTime(0.35 + (1 - normalized) * 0.65, spatialAudioCtx.currentTime, 0.08);
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
    initSpatialAudio();
    if (spatialAudioCtx?.state === 'suspended') spatialAudioCtx.resume();
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
