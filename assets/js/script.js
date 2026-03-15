/**
 * Octotech Portfolio - Optimized Premium Build
 * Three.js + GSAP + ScrollTrigger + Lenis
 */

gsap.registerPlugin(ScrollTrigger);

// Main Initialization Lifecycle
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Splash Screen Logic
    const splashScreen = document.querySelector('#splash-screen');
    const loaderBar = document.querySelector('#loader-bar');
    const splashTitle = document.querySelector('#splash-screen h1');

    if (splashScreen) {
        // Stop scroll during splash
        document.body.style.overflow = 'hidden';

        const tl = gsap.timeline({
            onComplete: () => {
                splashScreen.style.display = 'none';
                document.body.style.overflow = '';
                initSmoothScroll();
                initThreeJS();
                initAnimations();
            }
        });

        // Stage 1: Reveal Title
        tl.to(splashTitle, { 
            opacity: 1, 
            y: 0, 
            duration: 1.5, 
            ease: "expo.out",
            delay: 0.5 
        });

        // Stage 2: Fill Loader
        tl.to(loaderBar, { 
            width: '100%', 
            duration: 1.5, 
            ease: "power4.inOut" 
        }, "-=0.8");

        // Stage 3: Fade Out Splash
        tl.to(splashScreen, { 
            opacity: 0, 
            duration: 1, 
            ease: "expo.inOut" 
        }, "+=0.2");
    } else {
        initSmoothScroll();
        initThreeJS();
        initAnimations();
    }
});

let lenis;
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    
    // Clear initial session & scroll to top
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
}

function initThreeJS() {
    const canvas = document.querySelector('#canvas3d');
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Subtle Halo/Glow Sphere
    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(4, 15);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x00f2ff,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.08,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f2ff, 1.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    let mouseX = 0, mouseY = 0;
    
    gsap.ticker.add(() => {
        if (window.performanceManager && !window.performanceManager.isSceneActive) return;
        
        mesh.rotation.y += 0.001;
        mesh.rotation.x += 0.0005;
        
        group.rotation.y += (mouseX - group.rotation.y) * 0.05;
        group.rotation.x += (mouseY - group.rotation.x) * 0.05;

        renderer.render(scene, camera);
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Simple Logo Entry
    gsap.from('#hero-title', { 
        opacity: 0, 
        y: 40, 
        duration: 2, 
        ease: "expo.out",
        delay: 0.5
    });
    gsap.from('#hero-desc', { 
        opacity: 0, 
        y: 20, 
        duration: 2, 
        ease: "expo.out",
        delay: 1
    });

    // Extreme Performance: Resource Lifecycle Manager
    window.performanceManager = {
        isSceneActive: true,
        init() {
            this.setupVideoObserver();
            this.setupSceneObserver();
        },
        setupVideoObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target.querySelector('video');
                    if (!video) return;
                    if (entry.isIntersecting) {
                        video.play().catch(() => {});
                        video.style.visibility = 'visible';
                    } else {
                        video.pause();
                        video.style.visibility = 'hidden';
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.scrub-container').forEach(el => observer.observe(el));
        },
        setupSceneObserver() {
            const observer = new IntersectionObserver((entries) => {
                this.isSceneActive = entries[0].isIntersecting;
            }, { threshold: 0 });
            const hero = document.querySelector('#hero');
            if (hero) observer.observe(hero);
        }
    };
    window.performanceManager.init();
}

function initAnimations() {
    // Reveal sections efficiently
    document.querySelectorAll('section').forEach(section => {
        gsap.from(section, {
            opacity: 0, 
            y: 30, 
            duration: 1, 
            ease: "expo.out",
            scrollTrigger: {
                trigger: section,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    // Horizontal Services Logic
    const servicesWrapper = document.querySelector('.services-wrapper');
    const serviceProgress = document.querySelector('#service-progress');
    if (servicesWrapper && serviceProgress) {
        servicesWrapper.addEventListener('scroll', () => {
            const progress = (servicesWrapper.scrollLeft / (servicesWrapper.scrollWidth - servicesWrapper.clientWidth)) * 100;
            serviceProgress.style.width = `${progress}%`;
        }, { passive: true });
    }

    // Extreme-Performance & Cinema-Smooth Video Scrubbing
    class UltraScrubber {
        constructor(container) {
            this.container = container;
            this.video = container.querySelector('.scrub-video');
            this.targetTime = 0;
            this.currentTime = 0;
            this.lerpFactor = 0.04; // The key to "Apple" smoothness (0.04 - 0.06 is ideal)
            this.isReady = false;

            if (this.video) {
                this.init();
            }
        }

        init() {
            this.video.pause();
            this.video.muted = true;
            this.video.load();
            
            const onReady = () => {
                if (this.isReady) return;
                this.isReady = true;
                
                // Set up the ScrollTrigger to just update our TARGET
                ScrollTrigger.create({
                    trigger: this.container,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    onUpdate: (self) => {
                        this.targetTime = self.progress * (this.video.duration || 0);
                    }
                });

                // Use GSAP Ticker for frame-independent LERPing
                gsap.ticker.add(() => {
                    // Only calculate if container is visible (Performance Guard)
                    if (this.video.style.visibility === 'hidden') return;
                    
                    // Constant smoothing loop
                    this.currentTime += (this.targetTime - this.currentTime) * this.lerpFactor;
                    
                    if (Math.abs(this.targetTime - this.currentTime) > 0.001) {
                        if (this.video.readyState >= 2) {
                            this.video.currentTime = this.currentTime;
                        }
                    }
                });
            };

            if (this.video.readyState >= 2) onReady();
            else this.video.addEventListener('loadedmetadata', onReady, { once: true });
            
            // Interaction trigger for browsers that block background load
            this.video.play().then(() => this.video.pause()).catch(() => {});
        }
    }

    // Initialize for all sections
    document.querySelectorAll('.scrub-container').forEach(container => {
        new UltraScrubber(container);
        
        // Refined Text Animations - Cinematic Timeline
        const text = container.querySelector('.transition-text');
        if (text) {
            // Remove initial Tailwind classes to avoid conflicts
            text.classList.remove('opacity-0', 'translate-y-10');
            
            const textTl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1 // Smooth scrubbing
                }
            });

            textTl
                .fromTo(text, 
                    { opacity: 0, y: 100, scale: 0.9, filter: "blur(10px)" },
                    { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.3 }
                )
                .to(text, { opacity: 1, duration: 0.4 }) // Hold the text in the middle
                .to(text, { 
                    opacity: 0, 
                    y: -100, 
                    scale: 1.1, 
                    filter: "blur(10px)", 
                    duration: 0.3 
                });
        }
    });

    // Reveal Text (Fill Scroll) - Optimized
    document.querySelectorAll('[data-reveal-text]').forEach(text => {
        gsap.to(text, {
            backgroundSize: '100% 100%',
            scrollTrigger: {
                trigger: text,
                start: "top 85%",
                end: "top 15%",
                scrub: true
            }
        });
    });

    // Magic Dot - Simplified
    const magicDot = document.querySelector("#magic-dot");
    if (magicDot) {
        gsap.to(magicDot, {
            scrollTrigger: {
                trigger: "header",
                start: "top top",
                end: "+=800",
                scrub: 1
            },
            y: 100,
            opacity: 0.5,
            rotation: 360,
            scale: 1.5
        });
    }

    // Navigation Optimization
    const nav = document.querySelector('#main-nav');
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            if (self.direction === 1) {
                gsap.to(nav, { backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', paddingTop: 14, paddingBottom: 14, duration: 0.3 });
            } else {
                gsap.to(nav, { backgroundColor: 'transparent', backdropFilter: 'blur(0px)', paddingTop: 24, paddingBottom: 24, duration: 0.3 });
            }
        }
    });

    // Magnetic elements optimized
    document.querySelectorAll('.glass, button').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            gsap.to(el, { 
                x: (e.clientX - (rect.left + rect.width/2)) * 0.2, 
                y: (e.clientY - (rect.top + rect.height/2)) * 0.2, 
                duration: 0.4 
            });
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "back.out(2)" });
        });
    });

    // Hero Mascot (Octopus) Floating & Parallax
    const mascot = document.querySelector('#hero-mascot img');
    if (mascot) {
        // Slow organic float
        gsap.to(mascot, {
            y: 40,
            rotation: 5,
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Mouse Parallax depth
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            gsap.to(mascot, { x: -moveX, y: -moveY, duration: 2, ease: "power2.out" });
        });

        // Scroll fade out
        gsap.to(mascot, {
            opacity: 0,
            scale: 1.5,
            scrollTrigger: {
                trigger: "header",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // Premium Dual Cursor System
    const cursorDot = document.createElement('div');
    cursorDot.className = 'fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10001] hidden md:block';
    
    const cursorAura = document.createElement('div');
    cursorAura.className = 'fixed top-0 left-0 w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[10000] hidden md:block transition-transform duration-300 ease-out';
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorAura);

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let auraX = 0, auraY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        // Fast follow for dot
        dotX += (mouseX - dotX) * 0.4;
        dotY += (mouseY - dotY) * 0.4;
        
        // Smooth lag for aura
        auraX += (mouseX - auraX) * 0.15;
        auraY += (mouseY - auraY) * 0.15;

        gsap.set(cursorDot, { x: dotX, y: dotY, xPercent: -50, yPercent: -50 });
        gsap.set(cursorAura, { x: auraX, y: auraY, xPercent: -50, yPercent: -50 });
    });

    // Cursor interaction on hover
    const links = document.querySelectorAll('a, button, .glass, .service-card');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(cursorAura, { scale: 2.5, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0)', duration: 0.3 });
            gsap.to(cursorDot, { scale: 0.5, duration: 0.3 });
        });
        link.addEventListener('mouseleave', () => {
            gsap.to(cursorAura, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', duration: 0.3 });
            gsap.to(cursorDot, { scale: 1, duration: 0.3 });
        });
    });
}

// Contact Modal Logic
function openContactModal() {
    const modal = document.querySelector('#contact-modal');
    if (modal) {
        modal.classList.remove('invisible');
        modal.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
        window.lenis?.stop();
        
        // GSAP entry for inner container
        gsap.fromTo(modal.querySelector('.container'), 
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }
        );
    }
}

function closeContactModal() {
    const modal = document.querySelector('#contact-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('invisible');
            document.body.style.overflow = '';
            window.lenis?.start();
        }, 500);
    }
}

// Form Submission Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading loading-spinner"></span>';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://hubmsgpanel.octotech.az/api/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'API-KEY-XXXX'
                    },
                    body: JSON.stringify({
                        recipients: "+905464233871, +994 552545214",
                        message: `OCTOTECH FORM:\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nMsg: ${data.message}`,
                        label: "OctotechPortfolio"
                    })
                });

                if (response.ok) {
                    feedback.innerText = translations[document.documentElement.lang || 'az'].contact_success;
                    feedback.classList.remove('text-red-500');
                    feedback.classList.add('text-green-500', 'opacity-100');
                    contactForm.reset();
                    setTimeout(closeContactModal, 3000);
                } else {
                    throw new Error('API Error');
                }
            } catch (error) {
                feedback.innerText = translations[document.documentElement.lang || 'az'].contact_error;
                feedback.classList.remove('text-green-500');
                feedback.classList.add('text-red-500', 'opacity-100');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    feedback.classList.remove('opacity-100');
                }, 4000);
            }
        });
    }
});
