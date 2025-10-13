document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALIZATION ---
    startBackgroundEffects();
    initializeScrollEffects();
    handleLoader();
    initializeContactForm();
    highlightActiveNav(); // New function for multi-page sites

    // --- LOADER ---
    function handleLoader() {
        const loader = document.getElementById('loader');
        window.addEventListener('load', () => {
            setTimeout(() => {
                if(loader) loader.classList.add('hidden');
            }, 400);
        });
    }
    
    // --- ACTIVE NAVIGATION LINK HIGHLIGHTER ---
    function highlightActiveNav() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPage = window.location.pathname.split('/').pop(); // Gets the current file name e.g., "projects.html"

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            // Highlight if the link's href matches the current page
            // Also handles the "index.html" or empty path case for the HOME logo
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
            // Special case for Blog link, as it's in a subfolder
            if (window.location.pathname.includes('blogs_section')) {
                 if(link.getAttribute('href').includes('blogs_section')) {
                    link.classList.add('active');
                 }
            }
        });
        // Highlight HOME logo if on the index page
        if(currentPage === '' || currentPage === 'index.html') {
            document.querySelector('.logo').classList.add('active');
        }
    }

    // --- BACKGROUND & PARTICLE EFFECTS ---
    function startBackgroundEffects() {
        const particleSystem = document.getElementById('particleSystem');
        if (particleSystem) createParticles(particleSystem, 50);
        
        const equationSystem = document.getElementById('equationSystem');
        if (equationSystem) createFloatingEquations(equationSystem);
    }

    function createParticles(container, count) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
            fragment.appendChild(particle);
        }
        container.appendChild(fragment);
    }

    function createFloatingEquations(container) {
        const equations = ['E = mc²', 'ψ = Ae^(ikx)', '∇²φ = 4πGρ', 'F = ma', 'S = k ln(Ω)', '∂ψ/∂t = Hψ', 'Gμν = 8πTμν'];
        setInterval(() => {
            if (container.children.length < 15) {
                const equationEl = document.createElement('div');
                equationEl.className = 'equation';
                equationEl.textContent = equations[Math.floor(Math.random() * equations.length)];
                equationEl.style.left = `${Math.random() * 100}%`;
                equationEl.style.fontSize = `${Math.random() * 0.5 + 0.8}rem`;
                container.appendChild(equationEl);
                setTimeout(() => equationEl.remove(), 25000);
            }
        }, 3000);
    }
    
    // --- CONTACT FORM ---
    // THIS IS THE CORRECT FUNCTION
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default page reload

        const form = e.target;
        const data = new FormData(form);
        
        // This 'fetch' part is what actually sends the email
        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                alert("Thank you for your message! I'll get back to you soon.");
                form.reset(); // Clear the form fields
            } else {
                alert("Oops! There was a problem sending your message. Please try again.");
            }
        }).catch(error => {
            alert("Oops! There was a network problem. Please try again.");
        });
    });
}

    // --- SCROLL-BASED EFFECTS & ANIMATIONS ---
    function initializeScrollEffects() {
        const header = document.getElementById('header');
        const scrollProgress = document.getElementById('scrollProgress');
        const parallaxElements = document.querySelectorAll('.physics-background, .floating-equations');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        
        window.addEventListener('scroll', () => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollableHeight <= 0) return;
            const scrollPercent = (window.scrollY / scrollableHeight) * 100;

            if (scrollProgress) scrollProgress.style.width = `${scrollPercent}%`;
            if (header) header.classList.toggle('scrolled', window.scrollY > 50);

            const scrolled = window.pageYOffset;
            parallaxElements.forEach(el => {
                const speed = 0.3;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, { passive: true });
    }
});

// Add this code inside your main DOMContentLoaded event listener

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default page reload

        const form = e.target;
        const data = new FormData(form);
        
        // Send the data to Formspree in the background
        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Show a real success message
                alert("Thank you for your message! I'll get back to you soon.");
                form.reset(); // Clear the form fields
            } else {
                // Show an error message if something went wrong
                alert("Oops! There was a problem sending your message. Please try again.");
            }
        }).catch(error => {
            alert("Oops! There was a network problem. Please try again.");
        });
    });
}

// Make sure to call this new function inside the DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // ... your other function calls like handleLoader(), etc. ...
    initializeContactForm();
});

// Add this function inside your main DOMContentLoaded event listener

function initializeMobileMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');

    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            // Toggles the 'active' class on both the icon and the menu
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }
}

// And don't forget to call it!
document.addEventListener('DOMContentLoaded', () => {
    // ... all your other function calls ...
    initializeMobileMenu(); 
});