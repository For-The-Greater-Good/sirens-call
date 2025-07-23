// Pirate-themed JavaScript for For The Greater Good website

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background opacity on scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class based on scroll position
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        }
        
        lastScrollY = currentScrollY;
    });

    // Add loading animation to map iframe
    const mapIframe = document.querySelector('.interactive-map');
    const mapContainer = document.querySelector('.map-container');
    
    if (mapIframe && mapContainer) {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'map-loading';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="pirate-wheel">⚓</div>
                <p>Charting the waters...</p>
            </div>
        `;
        
        // Add loading styles
        const loadingStyles = `
            <style>
                .map-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    backdrop-filter: blur(5px);
                }
                
                .loading-spinner {
                    text-align: center;
                    color: #fbbf24;
                }
                
                .pirate-wheel {
                    font-size: 3rem;
                    animation: spin 2s linear infinite;
                    margin-bottom: 1rem;
                    display: block;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-spinner p {
                    font-family: 'Crimson Text', serif;
                    font-style: italic;
                    font-size: 1.1rem;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', loadingStyles);
        mapContainer.appendChild(loadingOverlay);
        
        // Remove loading overlay when iframe loads
        mapIframe.addEventListener('load', function() {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                }, 500);
            }, 1000); // Show loading for at least 1 second for effect
        });
    }

    // Parallax effect for hero section (subtle)
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            
            if (scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Easter egg: Konami code for pirate sounds
    let konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Easter egg activated!
                showPirateMessage();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    function showPirateMessage() {
        const messages = [
            "🏴‍☠️ Ahoy, matey! You've found the secret code!",
            "⚓ Fair winds and following seas, fellow pirate!",
            "🗺️ X marks the spot where the real treasure lies - open data!",
            "🚢 Welcome aboard the good ship Data Liberation!",
            "⭐ You've got the spirit of a true digital buccaneer!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Create and show toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fbbf24;
            color: #0f172a;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.5s ease;
        `;
        toast.textContent = randomMessage;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 4000);
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Add fade-in effect to sections
    const sectionsToAnimate = document.querySelectorAll('.projects-section, .work-section, .map-section');
    sectionsToAnimate.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });

    // Dynamic stats counter (if we had real stats)
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // Add some dynamic behavior to the treasure map link
    const mapLink = document.querySelector('.map-link');
    if (mapLink) {
        mapLink.addEventListener('click', function(e) {
            // Add a small animation when clicking the map link
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 100);
        });
    }

    // Performance optimization: Lazy load map iframe
    const mapSection = document.querySelector('#map');
    if (mapSection && mapIframe) {
        const mapObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Map section is visible, ensure iframe is loaded
                    if (!mapIframe.src) {
                        mapIframe.src = mapIframe.getAttribute('data-src') || mapIframe.src;
                    }
                    mapObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        mapObserver.observe(mapSection);
    }

    console.log('🏴‍☠️ Ahoy! Welcome to the For The Greater Good website!');
    console.log('⚓ If you\'re seeing this, you might be interested in joining our crew of digital pirates.');
    console.log('🗺️ Check out our GitHub: https://github.com/For-The-Greater-Good');
    console.log('🚢 Try the Konami code for a surprise!');
});