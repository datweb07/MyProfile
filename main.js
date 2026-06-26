// --- 1. DARK MODE TOGGLE ---
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    
    // Đổi icon và text
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");
    if(icon) icon.textContent = isDark ? "☀️" : "🌙";
    if(text) text.textContent = isDark ? "Light Mode" : "Dark Mode";
    
    // Lưu vào localStorage
    localStorage.setItem("darkMode", isDark);
}

// Chạy ngay khi load trang để lấy setting cũ
window.addEventListener("load", function () {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        const icon = document.getElementById("theme-icon");
        const text = document.getElementById("theme-text");
        if(icon) icon.textContent = "☀️";
        if(text) text.textContent = "Light Mode";
    }

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    triggerScrollAnimation();
});

// --- 2. SCROLL PROGRESS BAR ---
window.addEventListener("scroll", function () {
    const scrollProgress = document.querySelector(".scroll-progress");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercentage + "%";
    } else {
        scrollProgress.style.width = "0%";
    }
});

// --- 3. SCROLL REVEAL (Intersection Observer) ---
function triggerScrollAnimation() {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.15, // Đợi hiện ra 15% mới chạy animation
        rootMargin: "0px 0px -50px 0px" 
    });

    reveals.forEach((element) => {
        observer.observe(element);
    });
}

// --- 4. TYPEWRITER EFFECT ---
const textsToType = [
    "Tech Enthusiast",
    "IT Student at UEH",
    "Future Software Engineer"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeSpeed = 100;
const deleteSpeed = 50;
const pauseTime = 2000;

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

    let nextSpeed = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentText.length) {
        nextSpeed = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textsToType.length;
        nextSpeed = 500;
    }

    // Thêm con trỏ nhấp nháy ảo bằng CSS
    typeSpan.innerHTML = typeSpan.textContent + `<span style="border-right: 2px solid var(--accent-color); animation: blink 1s infinite;">&nbsp;</span>`;

    setTimeout(typeWriter, nextSpeed);
}

document.addEventListener('DOMContentLoaded', typeWriter);

// --- 5. 3D TILT EFFECT MƯỢT MÀ HƠN ---
const cards = document.querySelectorAll('.card-3d, .project-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Cường độ nghiêng (chia càng nhỏ, góc nghiêng càng lớn)
        const rotateX = ((y - centerY) / centerY) * -5; 
        const rotateY = ((x - centerX) / centerX) * 5;

        // Nội dung bên trong cũng nổi lên một chút (Parallax)
        const children = card.children;
        for(let i = 0; i < children.length; i++) {
            children[i].style.transform = `translateZ(30px)`;
            children[i].style.transition = `transform 0.1s ease-out`;
        }

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        
        const children = card.children;
        for(let i = 0; i < children.length; i++) {
            children[i].style.transform = `translateZ(0px)`;
            children[i].style.transition = `transform 0.3s ease-out`;
        }
    });
});