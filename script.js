const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Initialize Lenis Smooth Scroll - Optimized for Performance
const lenis = new Lenis({
    lerp: 0.1, // Faster responsiveness
    wheelMultiplier: 1.1,
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Link GSAP to Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Cinematic Section Transition (Hero to About)
gsap.to('.hero', {
    scrollTrigger: {
        trigger: '.hero',
        start: "bottom bottom",
        end: "bottom top",
        scrub: true
    },
    scale: 0.9,
    opacity: 0,
    filter: "blur(20px)",
    ease: "none"
});

gsap.from('.about', {
    scrollTrigger: {
        trigger: '.about',
        start: "top bottom",
        end: "top top",
        scrub: true
    },
    y: 100,
    scale: 1.1,
    ease: "none"
});

// Modern Curtain Loader Sequence
function initModernLoader() {
    const tl = gsap.timeline({
        onComplete: () => {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'none';
            if (window.startHeroAnimations) window.startHeroAnimations();
        }
    });

    // 1. Reveal Logo
    tl.to('.loader-logo-img', {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "expo.out"
    })
    // 2. Pause briefly at the center
    .to({}, { duration: 0.5 }) 
    // 3. Staggered Curtain Lift
    .to('.loader-layer', {
        height: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "expo.inOut"
    })
    // 4. Fade out logo-container as curtains move
    .to('.loader-content', {
        opacity: 0,
        scale: 1.2,
        duration: 0.8,
        ease: "power2.in"
    }, "-=1");
}

// Kickstart Loader reliably
const safeStart = () => {
    if (document.getElementById('loader')) {
        initModernLoader();
    } else {
        setTimeout(safeStart, 10);
    }
};
safeStart();

// Hero Animations Function (Globally Accessible)
window.startHeroAnimations = function() {
    const tlHero = gsap.timeline();
    
    // Initial state sets
    gsap.set('.hero-bg-text', { opacity: 0, scale: 1.2 });
    
    if (document.getElementById('navbar')) {
        tlHero.to('#navbar', {
            top: '30px',
            opacity: 1,
            duration: 1.2,
            ease: "expo.out"
        })
        .from('.nav-links li', {
            opacity: 0,
            y: -10,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.8");
    }

    // Typewriter effect setup - Word-aware splitting to prevent breaks
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
        const text = heroSub.innerText.replace(/\s+/g, ' ').trim(); // Normalize whitespace
        heroSub.style.opacity = "1"; 
        
        const words = text.split(' ');
        heroSub.innerHTML = words.map(word => {
            const chars = word.split('').map(char => 
                `<span class="t-char" style="opacity: 0; display: inline-block; color: white;">${char}</span>`
            ).join('');
            return `<span class="t-word" style="display: inline-block; white-space: nowrap;">${chars}</span>`;
        }).join('<span class="t-char" style="opacity: 0; display: inline-block; color: white;">&nbsp;</span>');
    }

    tlHero.to('.status-badge', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.5")
    .to('.hero-content h1', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "expo.out"
    }, "-=0.8")
    .to('.hero-bg-text', {
        opacity: 1,
        scale: 1,
        duration: 3,
        ease: "power2.out"
    }, "-=1.5")
    .to('.t-char', {
        opacity: 1,
        duration: 0.05,
        stagger: 0.018,
        ease: "none"
    }, "-=0.8")
    .to('.btn-primary, .btn-glass', {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out"
    }, "-=0.5")

    .to('.scroll-indicator', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.8");
}

// Google Identity Services Callback
function handleCredentialResponse(response) {
    // Decode JWT Payload
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const user = JSON.parse(jsonPayload);
    
    // Update UI with User Data
    const userPhoto = document.getElementById('user-photo');
    if (userPhoto) userPhoto.src = user.picture;

    // Toggle Visibility
    document.querySelectorAll('.btn-login-ghost, .btn-signup-trigger, .g_id_signin, .btn-google-account').forEach(el => {
        el.style.display = 'none';
    });
    
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.style.display = 'flex';
        gsap.from(userProfile, { opacity: 0, x: 20, duration: 0.8, ease: "power2.out" });
    }

    // Admin Access Control
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        if (user.email === 'sushanmendaka00@gmail.com') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }

    // Close Modal if open
    const authModal = document.getElementById('auth-modal');
    if (authModal && authModal.style.display === 'flex') {
        const authClose = document.querySelector('.auth-close');
        if (authClose) authClose.click();
    }
}

// Logout Functionality
function handleLogout() {
    document.querySelectorAll('.btn-login-ghost, .btn-signup-trigger, .g_id_signin, .btn-google-account').forEach(el => {
        el.style.display = 'block';
    });
    
    const userProfile = document.getElementById('user-profile');
    if (userProfile) userProfile.style.display = 'none';

    // Hide Admin Link
    const adminLink = document.getElementById('admin-link');
    if (adminLink) adminLink.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    // Attach Logout Event
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Custom Google Button Trigger
    const customGoogleBtn = document.getElementById('custom-google-btn');
    if (customGoogleBtn) {
        customGoogleBtn.addEventListener('click', () => {
            if (typeof google !== 'undefined') {
                google.accounts.id.prompt();
            }
        });
    }
    
    // Smart Navbar: Hide on scroll down, Show on scroll up
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    lenis.on('scroll', ({ scroll }) => {
        if (!navbar) return;

        // Scrolled background effect
        if (scroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/Show logic
        if (scroll > lastScroll && scroll > 200) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        
        lastScroll = scroll;
    });

    // Optimized Hero Parallax (using quickSetter for performance)
    const setHeroBg = gsap.quickSetter(".hero-bg-text", "xy", "px");
    const setHeroContent = gsap.quickSetter(".hero-content", "xy", "px");

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) * 0.02;
        const y = (e.clientY - window.innerHeight / 2) * 0.02;
        
        setHeroBg(`${x * -1}, ${y * -1}`);
        setHeroContent(`${x * 0.5}, ${y * 0.5}`);
    });

    // --- AUTH MODAL LOGIC ---
    const authModal = document.getElementById('auth-modal');
    const authTriggers = document.querySelectorAll('.btn-login-ghost, .btn-signup-trigger');
    const authClose = document.querySelector('.auth-close');
    const authOverlay = document.querySelector('.auth-overlay');
    const authContainer = document.querySelector('.auth-container');

    if (authTriggers.length > 0 && authModal) {
        authTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                authModal.style.display = 'flex';
                gsap.to(authOverlay, { opacity: 1, duration: 0.5 });
                gsap.to(authContainer, { opacity: 1, scale: 1, duration: 0.5, ease: "power4.out" });
                
                // Force Google button to render when modal opens
                const gBtn = document.getElementById('g_id_signin_modal');
                if (gBtn && typeof google !== 'undefined') {
                    google.accounts.id.renderButton(gBtn, { 
                        theme: "outline", 
                        size: "large", 
                        width: 350,
                        shape: "pill", // Matches the custom button shape
                        logo_alignment: "left"
                    });
                }
            });
        });

        const closeAuth = () => {
            gsap.to(authContainer, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power4.in" });
            gsap.to(authOverlay, {
                opacity: 0, duration: 0.3, onComplete: () => {
                    authModal.style.display = 'none';
                }
            });
        };

        authClose.addEventListener('click', closeAuth);
        authOverlay.addEventListener('click', (e) => {
            if (e.target === authOverlay) closeAuth();
        });
    }
    // Dynamic Portfolio Loading
    loadDynamicWorks();
    loadDynamicPartners();
    updateWorksHero();
    
    // Give a small delay to ensure dynamic items are rendered before starting marquee
    setTimeout(() => {
        startPartnerMarquee();
    }, 100);

    async function loadDynamicWorks() {
        const grid = document.querySelector('.gallery-grid');
        if (!grid) return;

        try {
            const res = await fetch(`${API_URL}/projects`);
            const works = await res.json();
            
            if (works.length === 0) return;

            works.forEach((work) => {
                const workDiv = document.createElement('div');
                workDiv.className = 'g-item glass-card';
                
                workDiv.innerHTML = `
                    <img src="${work.image}" alt="${work.title}" onerror="this.src='https://placehold.co/1200x800/111/fff?text=Design+Vision'">
                    <div class="g-overlay">
                        <span>${work.title}</span>
                    </div>
                `;
                
                workDiv.addEventListener('click', () => {
                    if (window.trackProjectView) window.trackProjectView(work._id);
                    setTimeout(() => {
                        window.location.href = `project.html?id=${work._id}`;
                    }, 50);
                });
                
                grid.appendChild(workDiv);
            });

            initPortfolioAnimations();
            initGalleryInteractions();
        } catch (err) {
            console.error("Failed to fetch featuredWorks", err);
        }
    }

    function initPortfolioAnimations() {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item.querySelector('img'), {
                    scale: 1.1,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
            item.addEventListener('mouseleave', () => {
                gsap.to(item.querySelector('img'), {
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });

            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: "expo.out"
            });
        });
    }

    // High-End Liquid Reveal Animations on Scroll
    gsap.to('.reveal-h2', {
        scrollTrigger: {
            trigger: '.reveal-h2',
            start: "top 90%",
            toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "expo.out"
    });

    gsap.from('.glass-card', {
        scrollTrigger: {
            trigger: '.modern-bento',
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 1.5,
        ease: "expo.out"
    });

    // Portfolio Section Animations
    gsap.from('.f-item', {
        scrollTrigger: {
            trigger: '.featured-grid',
            start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('.g-item', {
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: "top 85%",
        },
        opacity: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
    });

    gsap.from('.about-reveal-text', {
        scrollTrigger: {
            trigger: '.m-about-text-extra',
            start: "top 85%",
        },
        opacity: 0,
        x: -30,
        duration: 1,
        ease: "power2.out"
    });

    gsap.from('.about-reveal-p', {
        scrollTrigger: {
            trigger: '.m-about-text-extra',
            start: "top 85%",
        },
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.3,
        ease: "power2.out"
    });

    gsap.from('.cta-mini', {
        scrollTrigger: {
            trigger: '.m-about-text-extra',
            start: "top 85%",
        },
        opacity: 0,
        scale: 0.8,
        stagger: 0.1,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)"
    });

    const revealElements = document.querySelectorAll('.about-text, .about-stats, .about-img, .contact-box, .partners .section-header, .benefit-item, .partners-dynamic .partner-card, .studio-header, .bento-item');
    
    revealElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 80,
            skewY: 7,
            filter: "blur(10px)",
            duration: 1.5,
            ease: "expo.out",
            stagger: 0.15
        });
    });

    // Hero Scroll Parallax
    gsap.to('.hero-bg-text', {
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: -150,
        opacity: 0,
        ease: "none"
    });

    async function loadDynamicPartners() {
        const scroller = document.querySelector('.partners-scroller');
        if (!scroller) return;

        try {
            const res = await fetch(`${API_URL}/partners`);
            const partners = await res.json();
            
            if (partners.length === 0) return; 

            partners.forEach(partner => {
                const cardLink = document.createElement('a');
                cardLink.href = partner.url || '#';
                cardLink.target = "_blank";
                cardLink.className = 'partner-card dynamic-partner processed'; // Mark as processed to avoid double listeners
                
                if (partner.image) {
                    cardLink.innerHTML = `<img src="${partner.image}" alt="${partner.name}" class="partner-img">`;
                } else {
                    cardLink.innerHTML = `LOGO <span>${partner.char || 'A'}</span>`;
                }
                scroller.appendChild(cardLink);
            });

            initPartnerInteractions();
            // The existing marquee logic will handle the new elements
        } catch (err) {
            console.error("Failed to fetch partners", err);
        }
    }    

    // Universal Premium Interactions (Tilt + Float)
    function applyPremiumInteractions(selector) {
        const items = document.querySelectorAll(selector);
        items.forEach(item => {
            if (item.classList.contains('interact-init')) return;
            item.classList.add('interact-init');

            // 1. Interactive 3D Tilt
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                gsap.to(item, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: 1.02,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            // 2. Autonomous Floating Motion
            gsap.to(item, {
                y: "random(-10, 10)",
                x: "random(-5, 5)",
                rotation: "random(-1, 1)",
                duration: "random(3, 6)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }

    function initPartnerInteractions() {
        applyPremiumInteractions('.partner-card');
    }

    function initGalleryInteractions() {
        applyPremiumInteractions('.g-item');
        applyPremiumInteractions('.f-item');
    }

    async function updateWorksHero() {
        const slider = document.getElementById('works-slider');
        const dotsContainer = document.getElementById('slider-dots');
        if (!slider) return;

        try {
            const res = await fetch(`${API_URL}/hero-banners`);
            const stored = await res.json();
            
            // If we have dynamic banners, replace the static ones
            if (stored && stored.length > 0) {
                slider.innerHTML = '';
                dotsContainer.innerHTML = '';
                
                stored.forEach((banner, index) => {
                    const slide = document.createElement('div');
                    slide.className = `works-slide ${index === 0 ? 'active' : ''}`;
                    slide.innerHTML = `
                        <img src="${banner.url}" alt="${banner.title}">
                        <div class="works-slide-content">
                            <span class="section-tag">${banner.tag || 'ARCHIVE'}</span>
                            <h2>${banner.title || 'PROJECT'}</h2>
                        </div>
                    `;
                    slider.appendChild(slide);

                    const dot = document.createElement('span');
                    dot.className = `dot ${index === 0 ? 'active' : ''}`;
                    dot.addEventListener('click', () => goToSlide(index));
                    dotsContainer.appendChild(dot);
                });
            }
        } catch (err) {
            console.error("Failed to fetch hero banners", err);
        }

        let currentSlide = 0;
        const slides = document.querySelectorAll('.works-slide');
        const dots = document.querySelectorAll('.dot');
        const totalSlides = slides.length;

        if (totalSlides === 0) return;

        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            // Remove active classes
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            
            // Add active classes to the new slide
            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }

        const nextBtn = document.getElementById('slider-next');
        const prevBtn = document.getElementById('slider-prev');

        if (nextBtn) {
            nextBtn.onclick = () => goToSlide(currentSlide + 1);
        }
        if (prevBtn) {
            prevBtn.onclick = () => goToSlide(currentSlide - 1);
        }

        // Initial state
        goToSlide(0);

        // Auto-slide every 6 seconds
        const autoSlide = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 6000);

        // Pause auto-slide on hover
        const container = document.querySelector('.works-slider-container');
        if (container) {
            container.onmouseenter = () => clearInterval(autoSlide);
        }
    }

    let marqueeInstance = null;
    function startPartnerMarquee() {
        const scroller = document.querySelector('.partners-scroller');
        if (!scroller) return;
        
        // Kill previous to prevent overlaps
        if (marqueeInstance) marqueeInstance.kill();
        
        // Ensure we have content to clone
        if (scroller.children.length === 0) return;

        // Clone for seamless loop
        const content = scroller.innerHTML;
        scroller.innerHTML = content + content + content;

        // RIGHT-MOVING Logic
        // Start from -33.33% and move to 0
        marqueeInstance = gsap.fromTo(scroller, 
            { xPercent: -33.33 },
            {
                xPercent: 0,
                duration: 40, // Slower for premium feel
                repeat: -1,
                ease: "none",
                paused: false
            }
        );

        const wrapper = document.querySelector('.partners-grid-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => marqueeInstance.pause());
            wrapper.addEventListener('mouseleave', () => marqueeInstance.play());
        }

        initPartnerInteractions();
    }

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    const contactMsg = document.getElementById('c-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('c-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'SENDING...';

            const data = {
                name: document.getElementById('c-name').value,
                email: document.getElementById('c-email').value,
                subject: document.getElementById('c-subject').value,
                message: document.getElementById('c-message').value
            };

            try {
                const res = await fetch(`${API_URL}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    contactMsg.style.color = '#4caf50';
                    contactMsg.textContent = 'SUCCESS: INQUIRY SENT! WE WILL CONTACT YOU SOON.';
                    contactForm.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                contactMsg.style.color = '#ff0000';
                contactMsg.textContent = 'ERROR: FAILED TO SEND. PLEASE TRY AGAIN.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Launch Inquiry <span>→</span>';
                setTimeout(() => { contactMsg.textContent = ''; }, 5000);
            }
        });
    }

    // Project View Tracking (Public)
    window.trackProjectView = async function(id) {
        try {
            await fetch(`${API_URL}/projects/${id}/view`, { method: 'POST' });
        } catch (err) { console.error('View tracking failed'); }
    };
});
