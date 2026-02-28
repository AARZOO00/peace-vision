// Custom cursor
function initCursor() {
    if (window.innerWidth <= 768) return;
    
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    if (!cursorDot || !cursorRing) return;
    
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            // Ring follows with lag
            setTimeout(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
            }, 100);
        });
    });
    
    // Hover effects
    document.querySelectorAll('a, button, .service-card, .program-card, .feature-card-stack, .contact-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
    
    // Click ripple
    document.addEventListener('click', createRipple);
}

function createRipple(e) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(43, 58, 219, 0.5);
        border-radius: 50%;
        left: ${e.clientX - 10}px;
        top: ${e.clientY - 10}px;
        pointer-events: none;
        z-index: 99999;
        animation: ripple 0.6s ease-out;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(20); opacity: 0; }
    }
`;
document.head.appendChild(style);