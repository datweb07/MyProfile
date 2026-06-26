// --- CUSTOM CURSOR ---
const cursorDot = document.getElementById('cursorDot');
const cursorOutline = document.getElementById('cursorOutline');

document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    // Outline di chuyển chậm hơn một chút để tạo hiệu ứng mượt
    cursorOutline.animate([
        { left: `${posX}px`, top: `${posY}px` }
    ], { duration: 500, fill: "forwards" });
});

// --- 1. DARK MODE TOGGLE ---
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");
    if(icon) icon.textContent = isDark ? "☀️" : "🌙";
    if(text) text.textContent = isDark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("darkMode", isDark);
}

window.addEventListener("load", function () {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("theme-icon").textContent = "☀️";
        document.getElementById("theme-text").textContent = "Light Mode";
    }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    triggerScrollAnimation();
    updateBackToTop();
});

// --- 2. SCROLL PROGRESS BAR ---
window.addEventListener("scroll", function () {
    const scrollProgress = document.querySelector(".scroll-progress");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + "%" : "0%";
    updateBackToTop();
});

// --- 3. BACK TO TOP ---
function updateBackToTop() {
    const btn = document.getElementById("backToTop");
    if (window.scrollY > 500) btn.classList.add("show");
    else btn.classList.remove("show");
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

// --- 4. SCROLL REVEAL ---
function triggerScrollAnimation() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(el => observer.observe(el));

    // Counter animation
    const statNumbers = document.querySelectorAll(".stat-number[data-target]");
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute("data-target"));
                animateCounter(el, target);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => counterObserver.observe(el));

    // Skill bars animation
    const skillFills = document.querySelectorAll(".skill-fill[data-width]");
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.getAttribute("data-width");
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    skillFills.forEach(el => skillObserver.observe(el));
}

function animateCounter(el, target) {
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else el.textContent = Math.floor(current);
    }, 30);
}

// --- 5. TYPEWRITER EFFECT ---
const textsToType = ["Tech Enthusiast", "IT Student at UEH", "Future Software Engineer"];
let textIndex = 0, charIndex = 0, isDeleting = false;
const typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000;

function typeWriter() {
    const typeSpan = document.querySelector('.typewriter-text');
    if (!typeSpan) return;
    const currentText = textsToType[textIndex];
    if (isDeleting) { typeSpan.textContent = currentText.substring(0, charIndex - 1); charIndex--; }
    else { typeSpan.textContent = currentText.substring(0, charIndex + 1); charIndex++; }
    let nextSpeed = isDeleting ? deleteSpeed : typeSpeed;
    if (!isDeleting && charIndex === currentText.length) { nextSpeed = pauseTime; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; textIndex = (textIndex + 1) % textsToType.length; nextSpeed = 500; }
    typeSpan.innerHTML = typeSpan.textContent + '<span style="border-right: 2px solid var(--accent-color); animation: blink 1s infinite;">&nbsp;</span>';
    setTimeout(typeWriter, nextSpeed);
}
document.addEventListener('DOMContentLoaded', typeWriter);

// --- 6. 3D TILT EFFECT ---
document.querySelectorAll('.card-3d, .project-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        for(let child of card.children) { child.style.transform = 'translateZ(30px)'; child.style.transition = 'transform 0.1s ease-out'; }
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        for(let child of card.children) { child.style.transform = 'translateZ(0px)'; child.style.transition = 'transform 0.3s ease-out'; }
    });
});

// --- 7. TOAST NOTIFICATIONS ---
function showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// --- 8. COPY EMAIL ---
function copyEmail() {
    const email = "dat82770@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
        showToast("📋 Email copied to clipboard!");
    }).catch(() => {
        showToast("⚠️ Could not copy email.");
    });
}

// --- 9. REACTION BUTTON ---
let reactionCount = 0;
function addReaction() {
    reactionCount++;
    document.getElementById("reactionCount").textContent = reactionCount;
    showToast("👍 Thanks for the like!");
}

// --- 10. MODALS ---
function openContactModal() {
    document.getElementById("contactModal").classList.add("show");
}
function closeContactModal() {
    document.getElementById("contactModal").classList.remove("show");
}
function openProjectDetail(e, project) {
    e.preventDefault();
    const modal = document.getElementById("projectModal");
    const content = document.getElementById("projectModalContent");
    const details = {
        supermarket: { title: "Supermarket Management", tech: "C#, WinForms, SQL Server", desc: "Full OOP-based desktop application with inventory tracking, sales reports, and user authentication." },
        calculator: { title: "Calculator Simulator", tech: "C#, DSA", desc: "Infix to postfix conversion using Shunting Yard algorithm and stack evaluation for complex expressions." },
        guestbook: { title: "Guest Book App", tech: "PHP, MySQL, HTML/CSS", desc: "Real-time message board with secure input handling and database persistence." },
        myprofile: { title: "My Profile", tech: "HTML5, CSS3, JavaScript", desc: "This very portfolio you're viewing! Interactive design with dark mode and smooth animations." }
    };
    const d = details[project] || { title: "Project", tech: "", desc: "Details coming soon." };
    content.innerHTML = `<h2>${d.title}</h2><p><strong>Tech:</strong> ${d.tech}</p><p>${d.desc}</p><a href="https://github.com/datweb07" target="_blank" class="btn-brutal small" style="margin-top:1rem;">View on GitHub</a>`;
    modal.classList.add("show");
}
function closeProjectModal() {
    document.getElementById("projectModal").classList.remove("show");
}
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove("show"); }
});

// --- 11. PROJECT TABS ---
function filterProjects(category, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.project-item').forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// --- 12. ACCORDION ---
function toggleAccordion(header) {
    header.classList.toggle('active');
    const body = header.nextElementSibling;
    body.classList.toggle('open');
    document.querySelectorAll('.accordion-header').forEach(h => {
        if (h !== header && h.classList.contains('active')) {
            h.classList.remove('active');
            h.nextElementSibling.classList.remove('open');
        }
    });
}

// FAB smooth scroll to contact modal
document.getElementById('fab').addEventListener('click', openContactModal);