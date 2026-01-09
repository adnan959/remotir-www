/**
 * REMOTIR WWW - Main JavaScript
 * Mobile navigation, interactions, and scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // FADE-IN ANIMATIONS
    // =========================================================================
    
    // Check if element is in viewport
    const isInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0
        );
    };
    
    // Initialize scroll-triggered animations
    const initScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.fade-in');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Only animate once
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            });
            
            // For elements already in viewport on page load, animate immediately
            // For elements below the fold, use the observer
            animatedElements.forEach(el => {
                if (isInViewport(el)) {
                    // Small delay to ensure CSS transition is ready
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, 50);
                } else {
                    observer.observe(el);
                }
            });
        } else {
            // Fallback for older browsers
            animatedElements.forEach(el => el.classList.add('is-visible'));
        }
    };
    
    // Add fade-in classes to elements
    const setupAnimations = () => {
        // Hero section - staggered fade-in on load
        const heroTitle = document.querySelector('.hero__title');
        const heroSubtitle = document.querySelector('.hero__subtitle');
        const heroActions = document.querySelector('.hero__actions');
        const heroBg = document.querySelector('.hero__bg');
        
        if (heroTitle) heroTitle.classList.add('fade-in', 'fade-in--up', 'fade-in--delay-1');
        if (heroSubtitle) heroSubtitle.classList.add('fade-in', 'fade-in--up', 'fade-in--delay-2');
        if (heroActions) heroActions.classList.add('fade-in', 'fade-in--up', 'fade-in--delay-3');
        if (heroBg) heroBg.classList.add('fade-in', 'fade-in--delay-2');
        
        // Logos section
        const logosTagline = document.querySelector('.logos-section__tagline');
        const logosCarousel = document.querySelector('.logos-carousel');
        if (logosTagline) logosTagline.classList.add('fade-in');
        if (logosCarousel) logosCarousel.classList.add('fade-in', 'fade-in--delay-1');
        
        // Force Multiplier section
        const multiplierHeader = document.querySelector('.multiplier__header');
        const multiplierCards = document.querySelectorAll('.multiplier-card');
        if (multiplierHeader) multiplierHeader.classList.add('fade-in', 'fade-in--up');
        multiplierCards.forEach((card, i) => {
            card.classList.add('fade-in', 'fade-in--up', `fade-in--delay-${Math.min(i + 1, 4)}`);
        });
        
        // Persona blocks
        const personaBlocks = document.querySelectorAll('.persona-block');
        personaBlocks.forEach(block => {
            const header = block.querySelector('.persona-block__header');
            const fixes = block.querySelector('.persona-block__fixes');
            if (header) header.classList.add('fade-in', 'fade-in--up');
            if (fixes) fixes.classList.add('fade-in', 'fade-in--up', 'fade-in--delay-1');
        });
        
        // Results section
        const resultsHeader = document.querySelector('.results-header--split');
        const caseStudyCards = document.querySelectorAll('.case-study-card');
        if (resultsHeader) resultsHeader.classList.add('fade-in', 'fade-in--up');
        caseStudyCards.forEach((card, i) => {
            card.classList.add('fade-in', 'fade-in--up', `fade-in--delay-${Math.min(i + 1, 4)}`);
        });
        
        // CTA section
        const ctaContent = document.querySelector('.cta__content');
        const ctaVisual = document.querySelector('.cta__visual');
        if (ctaContent) ctaContent.classList.add('fade-in', 'fade-in--up');
        if (ctaVisual) ctaVisual.classList.add('fade-in', 'fade-in--delay-2');
        
        // Trigger animations after a brief delay to ensure CSS is loaded
        requestAnimationFrame(() => {
            document.body.classList.add('animations-ready');
            initScrollAnimations();
        });
    };
    
    setupAnimations();

    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.nav__mobile-toggle');
    const mobileNav = document.querySelector('.nav__mobile');
    const body = document.body;
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('is-open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            
            // Toggle hamburger/close icon
            const icon = mobileToggle.querySelector('svg');
            if (isOpen) {
                icon.innerHTML = `
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                `;
                body.style.overflow = 'hidden';
            } else {
                icon.innerHTML = `
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                `;
                body.style.overflow = '';
            }
        });
        
        // Close mobile nav when clicking a link
        const mobileLinks = mobileNav.querySelectorAll('.nav__link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('is-open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
                
                const icon = mobileToggle.querySelector('svg');
                icon.innerHTML = `
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                `;
            });
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to current page nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === 'index.html') ||
            (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('nav__link--active');
        }
    });

    // Dropdown Navigation
    const dropdowns = document.querySelectorAll('.nav__dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav__dropdown-trigger');
        
        if (trigger) {
            // Toggle dropdown on click
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('is-open');
                    }
                });
                
                // Toggle this dropdown
                dropdown.classList.toggle('is-open');
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav__dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-open');
            });
        }
    });
    
    // Close dropdowns on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-open');
            });
        }
    });
    
    // Close dropdown when clicking an item
    const dropdownItems = document.querySelectorAll('.nav__dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-open');
            });
        });
    });
});

