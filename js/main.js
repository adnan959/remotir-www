/**
 * REMOTIR WWW - Main JavaScript
 * Mobile navigation and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
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

