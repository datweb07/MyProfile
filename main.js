// dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("theme-icon").textContent = isDark ? "☀️" : "🌙";
    document.getElementById("theme-text").textContent = isDark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("darkMode", isDark);
}


window.addEventListener("load", function () {
    // Load trạng thái Dark Mode cũ
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("theme-icon").textContent = "☀️";
        document.getElementById("theme-text").textContent = "Light Mode";
    }

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0); 
    
    const scrollProgress = document.querySelector(".scroll-progress");
    if(scrollProgress) {
        scrollProgress.style.width = "0%";
    }

    // Kích hoạt animation 
    triggerScrollAnimation();
});


function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(page + "-page").classList.add("active");
    
    window.scrollTo({ top: 0, behavior: "auto" }); 
    
    const scrollProgress = document.querySelector(".scroll-progress");
    if(scrollProgress) {
        scrollProgress.style.width = "0%";
    }
    
    // Reset animation cho trang mới
    setTimeout(triggerScrollAnimation, 100);
}

// SCROLL PROGRESS
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

//SCROLL REVEAL
function triggerScrollAnimation() {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.1 
    });

    reveals.forEach((element) => {
        observer.observe(element);
    });
}


 // TYPEWRITER EFFECT 
const textsToType = [
    "Tech Enthusiast",
    "UEH Student"
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
        // Đang xóa chữ
        typeSpan.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Đang gõ chữ
        typeSpan.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let nextSpeed = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentText.length) {
        // Gõ xong 1 câu, dừng lại chút
        nextSpeed = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        // Xóa xong, chuyển sang câu tiếp theo
        isDeleting = false;
        textIndex = (textIndex + 1) % textsToType.length;
        nextSpeed = 500;
    }

    setTimeout(typeWriter, nextSpeed);
}

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', typeWriter);



   // 3D TILT EFFECT 

const cards = document.querySelectorAll('.project-item');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        // Tính toán vị trí chuột so với trung tâm thẻ
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Góc xoay tối đa (chia càng lớn xoay càng ít)
        const rotateX = ((y - centerY) / centerY) * -10; // Đảo ngược trục Y
        const rotateY = ((x - centerX) / centerX) * 10;

        // Áp dụng transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        
        // Hiệu ứng bóng đổ theo hướng chuột
        card.style.boxShadow = `${-rotateY}px ${rotateX}px 20px rgba(0,0,0,0.1)`;
    });

    // Reset về vị trí cũ khi chuột rời khỏi thẻ
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
    });
});

