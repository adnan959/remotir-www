/**
 * REMOTIR WWW - Main JavaScript
 * Mobile navigation, interactions, and scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // UTM TRACKING
    // =========================================================================
    
    /**
     * Captures UTM parameters from the URL and populates hidden form fields.
     * Also stores UTM values in sessionStorage to persist across page navigation.
     * Works with all forms on the page using class selectors.
     */
    const initUTMTracking = () => {
        const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check URL for UTM params and store in sessionStorage if found
        utmParams.forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                sessionStorage.setItem(param, value);
            }
        });
        
        // Populate all UTM hidden fields across all forms on the page
        utmParams.forEach(param => {
            const storedValue = sessionStorage.getItem(param);
            if (storedValue) {
                // Find all fields with the matching data-utm attribute
                const fields = document.querySelectorAll(`.utm-field[data-utm="${param}"]`);
                fields.forEach(field => {
                    field.value = storedValue;
                });
            }
        });
    };
    
    initUTMTracking();

    // =========================================================================
    // NAV THEME SWITCHING (for pages with data-nav-theme sections)
    // =========================================================================
    
    const initNavThemeSwitching = () => {
        const nav = document.querySelector('.nav--theme-switch');
        if (!nav) return;
        
        const sections = document.querySelectorAll('[data-nav-theme]');
        if (sections.length === 0) return;
        
        // Set initial theme to dark
        nav.classList.add('nav--dark');
        
        const updateNavTheme = () => {
            const navHeight = nav.offsetHeight;
            const scrollPosition = window.scrollY + navHeight + 10; // Add small offset
            
            let currentTheme = 'dark'; // Default to dark (for hero)
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentTheme = section.getAttribute('data-nav-theme');
                }
            });
            
            // Update nav classes
            if (currentTheme === 'light') {
                nav.classList.add('nav--light');
                nav.classList.remove('nav--dark');
            } else {
                nav.classList.add('nav--dark');
                nav.classList.remove('nav--light');
            }
        };
        
        // Update active link highlighting for anchor links
        const anchorLinks = nav.querySelectorAll('.nav__link--anchor');
        const updateActiveLink = () => {
            if (anchorLinks.length === 0) return;
            
            const navHeight = nav.offsetHeight;
            const scrollPosition = window.scrollY + navHeight;
            const viewportHeight = window.innerHeight;
            
            // Get all section IDs that have corresponding nav links
            const navSectionIds = Array.from(anchorLinks).map(link => 
                link.getAttribute('href').replace('#', '')
            );
            
            // Get only the sections that correspond to nav links
            const navSections = navSectionIds
                .map(id => document.getElementById(id))
                .filter(section => section !== null);
            
            if (navSections.length === 0) return;
            
            let currentSection = '';
            
            // Find which section is currently most visible
            for (let i = 0; i < navSections.length; i++) {
                const section = navSections[i];
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionBottom = sectionTop + sectionHeight;
                
                // Check if the scroll position is within this section
                // Use a threshold of 20% into the section for better UX
                const threshold = Math.min(sectionHeight * 0.2, 150);
                
                if (scrollPosition >= sectionTop - threshold && scrollPosition < sectionBottom) {
                    currentSection = section.getAttribute('id');
                    break; // Found the current section, stop looking
                }
            }
            
            // If we're past all sections, highlight the last one
            if (!currentSection && navSections.length > 0) {
                const lastSection = navSections[navSections.length - 1];
                const lastSectionTop = lastSection.offsetTop;
                if (scrollPosition >= lastSectionTop) {
                    currentSection = lastSection.getAttribute('id');
                }
            }
            
            // Update active state on links
            anchorLinks.forEach(link => {
                const linkTarget = link.getAttribute('href').replace('#', '');
                if (linkTarget === currentSection) {
                    link.classList.add('is-active');
                } else {
                    link.classList.remove('is-active');
                }
            });
        };
        
        // Throttle scroll event for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateNavTheme();
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial check
        updateNavTheme();
        updateActiveLink();
        
        // Smooth scroll for anchor links
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const navHeight = nav.offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const mobileNav = document.querySelector('.nav__mobile');
                    const mobileToggle = document.querySelector('.nav__mobile-toggle');
                    if (mobileNav && mobileNav.classList.contains('is-open')) {
                        mobileNav.classList.remove('is-open');
                        mobileToggle.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                        
                        // Reset icons
                        const openIcon = mobileToggle.querySelector('.nav__mobile-icon--open');
                        const closeIcon = mobileToggle.querySelector('.nav__mobile-icon--close');
                        if (openIcon) openIcon.style.display = 'block';
                        if (closeIcon) closeIcon.style.display = 'none';
                    }
                }
            });
        });
    };
    
    initNavThemeSwitching();
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
        const openIcon = mobileToggle.querySelector('.nav__mobile-icon--open');
        const closeIcon = mobileToggle.querySelector('.nav__mobile-icon--close');
        
        const openMobileMenu = () => {
            mobileNav.classList.add('is-open');
            mobileToggle.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
            
            if (openIcon) openIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'block';
        };
        
        const closeMobileMenu = () => {
            mobileNav.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            
            if (openIcon) openIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
        };
        
        mobileToggle.addEventListener('click', () => {
            if (mobileNav.classList.contains('is-open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close mobile nav when clicking a link
        const mobileLinks = mobileNav.querySelectorAll('.nav__link, .btn');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
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

    // =========================================================================
    // MEGA DROPDOWN (Insights Navigation)
    // =========================================================================
    
    const megaDropdown = document.querySelector('.nav__mega-dropdown');
    
    if (megaDropdown) {
        const megaTrigger = megaDropdown.querySelector('.nav__dropdown-trigger');
        const categories = megaDropdown.querySelectorAll('.mega-dropdown__category[data-playbook]');
        const chapterPanels = megaDropdown.querySelectorAll('.mega-dropdown__chapters');
        
        // Toggle mega dropdown on click
        if (megaTrigger) {
            megaTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close regular dropdowns
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('is-open');
                });
                
                // Toggle mega dropdown
                megaDropdown.classList.toggle('is-open');
            });
        }
        
        // Switch chapters panel on category hover
        categories.forEach(category => {
            category.addEventListener('mouseenter', () => {
                const playbook = category.dataset.playbook;
                
                // Update active category
                categories.forEach(c => c.classList.remove('is-active'));
                category.classList.add('is-active');
                
                // Show corresponding chapters panel
                chapterPanels.forEach(panel => {
                    if (panel.dataset.playbook === playbook) {
                        panel.classList.add('is-visible');
                    } else {
                        panel.classList.remove('is-visible');
                    }
                });
            });
        });
        
        // Close mega dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav__mega-dropdown')) {
                megaDropdown.classList.remove('is-open');
            }
        });
        
        // Close mega dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                megaDropdown.classList.remove('is-open');
            }
        });
        
        // Close mega dropdown when clicking a chapter link
        const chapterLinks = megaDropdown.querySelectorAll('.mega-dropdown__chapter-link, .mega-dropdown__view-all');
        chapterLinks.forEach(link => {
            link.addEventListener('click', () => {
                megaDropdown.classList.remove('is-open');
            });
        });
    }
});

