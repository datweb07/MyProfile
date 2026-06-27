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



const cursorDot = document.getElementById('cursorDot');
const cursorOutline = document.getElementById('cursorOutline');

if (cursorDot && cursorOutline) {
  document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate(
      [ { left: `${posX}px`, top: `${posY}px` } ],
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
  if (text) text.textContent = isDark ? 'Light Mode' : 'Dark Mode';

  localStorage.setItem('darkMode', isDark);
}

window.addEventListener('load', () => {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon) icon.textContent = '☀️';
    if (text) text.textContent = 'Light Mode';
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
  if(!container) return;
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
  if(!countEl) return;
  
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
  if(!element) return;
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
  if(m) m.classList.add('show');
}

function closeContactModal() {
  const m = document.getElementById('contactModal');
  if(m) m.classList.remove('show');
}

function openProjectDetail(e, project) {
  e.preventDefault();
  const modal = document.getElementById('projectModal');
  const content = document.getElementById('projectModalContent');
  if(!modal || !content) return;

  const details = {
    supermarket: { title: 'Supermarket Management', tech: 'C#, WinForms, SQL Server', desc: 'Full OOP-based desktop application with inventory tracking, sales reports, and user authentication.' },
    calculator: { title: 'Calculator Simulator', tech: 'C#, DSA', desc: 'Infix to postfix conversion using Shunting Yard algorithm and stack evaluation for complex expressions.' },
    guestbook: { title: 'Guest Book App', tech: 'PHP, MySQL, HTML/CSS', desc: 'Real-time message board with secure input handling and database persistence.' },
    myprofile: { title: 'My Profile', tech: 'HTML5, CSS3, JavaScript', desc: 'This very portfolio you are viewing! Interactive design with dark mode and smooth animations.' }
  };

  const d = details[project] || { title: 'Project', tech: '', desc: 'Details coming soon.' };

  content.innerHTML = `
    <h2 style="font-size: 2rem; color: var(--brand-dark); margin-bottom: 10px;">${d.title}</h2>
    <p><strong>Tech Stack:</strong> ${d.tech}</p>
    <p style="margin-top:10px;">${d.desc}</p>
    <a href="https://github.com/datweb07" target="_blank" class="btn-brutal small" style="margin-top:1.5rem; display:inline-block; text-decoration:none;">View on GitHub</a>
  `;

  modal.classList.add('show');
}

function closeProjectModal() {
  const m = document.getElementById('projectModal');
  if(m) m.classList.remove('show');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
  }
});

// ============================================================
// GỬI EMAIL VỚI WEB3FORMS API
// ============================================================
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
    submitBtn.innerHTML = originalText;
    submitBtn.style.pointerEvents = 'auto';
    submitBtn.style.opacity = '1';
  }
}

const fab = document.getElementById('fab');
if(fab) fab.addEventListener('click', openContactModal);


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
  const url = bgStyle.slice(5, -2); 
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