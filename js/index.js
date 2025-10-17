document.addEventListener("DOMContentLoaded", function() {
    // Handle reveal animations
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    });

    reveals.forEach(element => {
        observer.observe(element);
    });

    // Handle collapsible subteam panels
    document.querySelectorAll('.subteam-panel-header').forEach(header => {
        header.addEventListener('click', function() {
            const panel = this.parentElement;
            const content = panel.querySelector('.subteam-panel-content');
            const isActive = panel.classList.contains('active');

            if (isActive) {
                // Smoothly close the panel
                content.style.transition = 'max-height 0.5s ease';
                content.style.maxHeight = content.scrollHeight + 'px'; // Set to current height to enable transition
                content.style.background = 'rgba(0, 0, 0, 0.263)'; // Ensure background remains consistent
                setTimeout(() => {
                    content.style.maxHeight = '0'; // Transition to height 0
                }, 10);
                panel.classList.remove('active');
            } else {
                // Close all other panels
                document.querySelectorAll('.subteam-panel').forEach(p => {
                    const pContent = p.querySelector('.subteam-panel-content');
                    if (pContent) {
                        pContent.style.transition = 'max-height 0.25s ease';
                        pContent.style.maxHeight = '0';
                        pContent.style.background = 'rgba(0, 0, 0, 0.263)'; // Ensure background remains consistent
                    }
                    p.classList.remove('active');
                });

                // Smoothly open the clicked panel
                panel.classList.add('active');
                content.style.transition = 'max-height 0.5s ease';
                content.style.maxHeight = content.scrollHeight + 'px'; // Ensure full content is displayed
                content.style.background = 'rgba(0, 0, 0, 0.263)'; // Ensure background remains consistent
            }
        });
    });

    // Add active class to subteam header when it comes into view
    const subteamHeader = document.querySelector('.subteam__header');
    if (subteamHeader) {
        observer.observe(subteamHeader);
    }

    // Lightbox: click story images to open closeup
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxText = document.querySelector('.lightbox-text');
    const lightboxClose = document.querySelector('.lightbox-close');

    function openLightbox(imgEl) {
        const src = imgEl.getAttribute('src');
        const alt = imgEl.getAttribute('alt') || '';
        const captionEl = imgEl.closest('figure')?.querySelector('figcaption');
        const caption = captionEl ? captionEl.textContent : '';

        // Prefer a high-resolution / full-size image if provided.
        let fullSrc = imgEl.getAttribute('data-full') || imgEl.getAttribute('data-large') || imgEl.getAttribute('data-full-src');
        if (!fullSrc && src) {
            // try replacing common thumb/small suffixes: -thumb, _thumb, -small, _small
            const replaced = src.replace(/(-thumb|_thumb|-small|_small)\.(jpg|jpeg|png|webp)$/i, '.$2');
            fullSrc = (replaced !== src) ? replaced : src;
        }

        // populate content
        lightboxImg.src = fullSrc || src;
        lightboxImg.alt = alt;
        lightboxTitle.textContent = alt;
        lightboxText.textContent = caption;

        // show with CSS fade-in
        lightbox.setAttribute('aria-hidden', 'false');
        // prevent background scroll while open
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        // trigger CSS fade-out
        lightbox.setAttribute('aria-hidden', 'true');

        // wait for the lightbox opacity transition to finish before clearing content
        const onTransitionEnd = (e) => {
            // ensure we only react to the container opacity transition
            if (e.target === lightbox && (e.propertyName === 'opacity' || e.propertyName === 'visibility')) {
                lightboxImg.src = '';
                document.body.style.overflow = '';
                lightbox.removeEventListener('transitionend', onTransitionEnd);
            }
        };

        // If transitionend doesn't fire (some browsers/settings), clear after 350ms fallback
        lightbox.addEventListener('transitionend', onTransitionEnd);
        setTimeout(() => {
            if (lightbox.getAttribute('aria-hidden') === 'true') {
                lightboxImg.src = '';
                document.body.style.overflow = '';
                try { lightbox.removeEventListener('transitionend', onTransitionEnd); } catch (_) {}
            }
        }, 420);
    }

    document.querySelectorAll('.story-img img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(img));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.querySelector('[data-close]').addEventListener('click', closeLightbox);
    // Close when clicking anywhere outside the content (the lightbox container itself)
    lightbox.addEventListener('click', function(e) {
        const content = lightbox.querySelector('.lightbox-content');
        // If the click target is the overlay or outside the content area, close
        if (e.target === lightbox || e.target.classList.contains('lightbox-overlay') || !content.contains(e.target)) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
            closeLightbox();
        }
    });

    // Center in-viewport behavior for internal links (nav and thumbnails)
    function centerTargetOnClick(e) {
        const href = this.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // update URL hash without jumping
            history.replaceState(null, '', href);
        }
    }

    // Attach to nav links and any internal anchors in the hero thumbnails
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        // ignore the lightbox close overlay data-close selector
        a.addEventListener('click', centerTargetOnClick);
    });

    // If page loads with a hash, center it
    if (location.hash) {
        const initial = document.querySelector(location.hash);
        if (initial) {
            // small timeout to allow layout/hero to finish mounting
            setTimeout(() => initial.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
        }
    }
});



// Smooth Moon Parallax Scroll Effect - Simplified
let moonAnimationFrame;
let lastScrollY = 0;
let currentScrollY = 0;


function animateMoon() {
    const moon = document.getElementById('moon');
    if (!moon) {
        console.log('Moon element not found!');
        return;
    }

    // Simple smooth interpolation without velocity complications
    const smoothingFactor = 0.08; // Lower = smoother, higher = more responsive
    currentScrollY += (lastScrollY - currentScrollY) * smoothingFactor;
    
    // Apply transform with consistent 2x multiplier (no easing multiplier to avoid jumps)
    const moonOffset = currentScrollY * 2;
    moon.style.transform = `translate(-50%, calc(-50% - ${moonOffset}px))`;
    
    // Continue animation if there's still significant movement
    const difference = Math.abs(lastScrollY - currentScrollY);
    if (difference) {
        moonAnimationFrame = requestAnimationFrame(animateMoon);
    } else {
        moonAnimationFrame = null;
    }
}

// Simple scroll handler for smooth animation
window.addEventListener('scroll', function() {
    lastScrollY = window.scrollY;
    
    if (!moonAnimationFrame) {
        moonAnimationFrame = requestAnimationFrame(animateMoon);
    }
});