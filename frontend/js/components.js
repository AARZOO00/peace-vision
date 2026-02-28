// Service filter
function initServiceFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            serviceCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter || card.classList.contains('special')) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Testimonials carousel
function initTestimonialsCarousel() {
    const track = document.getElementById('testimonialsTrack');
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track || !prevArrow || !nextArrow) return;
    
    let currentSlide = 0;
    const slideCount = dots.length;
    
    function updateCarousel() {
        const slideWidth = document.querySelector('.testimonial-card').offsetWidth + 24;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    nextArrow.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    });
    
    prevArrow.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateCarousel();
    });
    
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentSlide = i;
            updateCarousel();
        });
    });
    
    // Auto advance
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    }, 4500);
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        
        if (touchEndX < touchStartX - 50) {
            currentSlide = (currentSlide + 1) % slideCount;
            updateCarousel();
        } else if (touchEndX > touchStartX + 50) {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            updateCarousel();
        }
    });
    
    window.addEventListener('resize', debounce(updateCarousel, 250));
}

// FAQ accordion
function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Cookie consent
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    if (!cookieConsent) return;
    
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }
    
    document.getElementById('acceptCookies')?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieConsent.classList.remove('show');
    });
    
    document.getElementById('declineCookies')?.addEventListener('click', () => {
        cookieConsent.classList.remove('show');
    });
}

// Newsletter popup
function initNewsletterPopup() {
    const newsletterPopup = document.getElementById('newsletterPopup');
    if (!newsletterPopup) return;
    
    if (!sessionStorage.getItem('newsletterShown')) {
        setTimeout(() => {
            newsletterPopup.classList.add('show');
            sessionStorage.setItem('newsletterShown', 'true');
        }, 12000);
    }
    
    document.getElementById('closePopup')?.addEventListener('click', () => {
        newsletterPopup.classList.remove('show');
    });
    
    // Exit intent
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !sessionStorage.getItem('exitIntentShown')) {
            newsletterPopup.classList.add('show');
            sessionStorage.setItem('exitIntentShown', 'true');
        }
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newsletterPopup.classList.contains('show')) {
            newsletterPopup.classList.remove('show');
        }
    });
}