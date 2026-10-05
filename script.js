(function () {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const CONFIG = {
        headerOffset: 80,
        revealRootMargin: '0px 0px -50px 0px',
        revealThreshold: 0.1,
        lazyLoadRootMargin: '200px 0px'
    };

    // ==========================================
    // Utility Functions
    // ==========================================
    function debounce(fn, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ==========================================
    // Scroll Reveal Animations
    // ==========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: CONFIG.revealRootMargin,
        threshold: CONFIG.revealThreshold
    });

    document.querySelectorAll('.reveal-up').forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // Image Lazy Loading
    // ==========================================
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, {
        root: null,
        rootMargin: CONFIG.lazyLoadRootMargin,
        threshold: 0.01
    });

    document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // ==========================================
    // Smooth Scrolling
    // ==========================================
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;

        const headerOffset = CONFIG.headerOffset;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            smoothScrollTo(targetId);

            // Close mobile menu if open
            const details = document.querySelector('details[open]');
            if (details) {
                details.removeAttribute('open');
            }
        });
    });

    // ==========================================
    // Header Scroll Effect
    // ==========================================
    const header = document.querySelector('header');
    let lastScroll = 0;
    const scrollHandler = debounce(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    }, 10);

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // ==========================================
    // Mobile Menu
    // ==========================================
    const details = document.querySelector('details');
    
    if (details) {
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (details.open && !details.contains(e.target)) {
                details.removeAttribute('open');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && details.open) {
                details.removeAttribute('open');
                // Return focus to the summary
                const summary = details.querySelector('summary');
                if (summary) summary.focus();
            }
        });

        // Close menu when a link is clicked
        const mobileLinks = details.querySelectorAll('a[href^="#"]');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    details.removeAttribute('open');
                }, 100);
            });
        });
    }

    // ==========================================
    // Active Navigation Link Highlighting
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');

    const activeNavHandler = debounce(() => {
        let current = '';
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('text-white');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-white');
            }
        });
    }, 50);

    window.addEventListener('scroll', activeNavHandler, { passive: true });

    // ==========================================
    // Button Ripple Effect
    // ==========================================
    document.querySelectorAll('.btn-ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ==========================================
    // Form Handling
    // ==========================================
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            const errorElements = form.querySelectorAll('[id$="-error"]');
            errorElements.forEach(el => el.classList.add('hidden'));

            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            let firstError = null;

            requiredFields.forEach(field => {
                const errorEl = document.getElementById(`${field.id}-error`);
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                    if (errorEl) errorEl.classList.remove('hidden');
                    if (!firstError) firstError = field;
                } else {
                    field.style.borderColor = '';
                }
            });

            // Email validation
            const emailField = document.getElementById('email');
            const emailError = document.getElementById('email-error');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailField && emailField.value && !emailRegex.test(emailField.value)) {
                isValid = false;
                emailField.style.borderColor = '#ef4444';
                if (emailError) {
                    emailError.textContent = 'Please enter a valid email address.';
                    emailError.classList.remove('hidden');
                }
                if (!firstError) firstError = emailField;
            }

            if (isValid) {
                const button = form.querySelector('button[type="submit"]');
                const originalText = button.innerHTML;
                
                button.innerHTML = '<span class="relative z-10">Message Sent!</span>';
                button.disabled = true;
                button.style.opacity = '0.7';

                // Simulate form submission
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                    button.style.opacity = '1';
                    form.reset();
                    
                    // Show success state briefly
                    button.style.background = '#16a34a';
                    setTimeout(() => {
                        button.style.background = '';
                    }, 1000);
                }, 2000);
            } else if (firstError) {
                firstError.focus();
            }
        });

        // Real-time validation feedback
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                const errorEl = document.getElementById(`${this.id}-error`);
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ef4444';
                    if (errorEl) errorEl.classList.remove('hidden');
                } else {
                    this.style.borderColor = '';
                    if (errorEl) errorEl.classList.add('hidden');
                }
            });

            input.addEventListener('input', function () {
                if (this.style.borderColor === 'rgb(239, 68, 68)') {
                    const errorEl = document.getElementById(`${this.id}-error`);
                    if (this.value.trim()) {
                        this.style.borderColor = '';
                        if (errorEl) errorEl.classList.add('hidden');
                    }
                }
            });
        });
    }

    // ==========================================
    // Performance: Reduce motion for users who prefer it
    // ==========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.querySelectorAll('.reveal-up').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
    }

    // ==========================================
    // Keyboard Navigation Enhancement
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Allow Escape to close mobile menu
        if (e.key === 'Escape') {
            const openDetails = document.querySelector('details[open]');
            if (openDetails) {
                openDetails.removeAttribute('open');
            }
        }
    });

    // ==========================================
    // FAQ Accordion - close others when one opens
    // ==========================================
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });

    // ==========================================
    // Lightbox
    // ==========================================
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
        <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>
        <img src="" alt="Gallery image full view">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    let currentGalleryIndex = 0;
    let galleryImages = [];

    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            galleryImages = Array.from(document.querySelectorAll('.gallery-item')).map(i => i.querySelector('img').src);
            currentGalleryIndex = index;
            lightboxImg.src = item.querySelector('img').src;
            lightboxImg.alt = item.querySelector('img').alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentGalleryIndex];
    }

    function showNextImage() {
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentGalleryIndex];
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });

    // ==========================================
    // Animate stat boxes on scroll
    // ==========================================
    const statBoxes = document.querySelectorAll('.stat-box');
    const observerOptions = { threshold: 0.2 };

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                statObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statBoxes.forEach(box => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(20px)';
        box.style.transition = 'all 0.6s ease-out';
        statObserver.observe(box);
    });

    // ==========================================
    // Learn More Modal
    // ==========================================
    const modal = document.getElementById('learn-more-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalClose = modal.querySelector('.modal-close');
    const modalCloseBtn = modal.querySelector('.modal-close-btn');
    const modalCta = modal.querySelector('.modal-cta');

    function openModal(title, description) {
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const card = link.closest('.image-card');
            const title = card.querySelector('.card-title').textContent;
            const description = card.querySelector('.card-text').textContent;
            openModal(title, description);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ==========================================
    // Initialize
    // ==========================================
})();