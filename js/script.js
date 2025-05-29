// ===== DOM Elements =====
const elements = {
  preloader: document.getElementById('preloader'),
  navbar: document.getElementById('navbar'),
  navToggle: document.getElementById('nav-toggle'),
  navMenu: document.getElementById('nav-menu'),
  themeToggle: document.getElementById('theme-toggle'),
  backToTop: document.getElementById('back-to-top'),
  cursor: document.getElementById('cursor'),
  cursorFollower: document.getElementById('cursor-follower'),
  contactForm: document.getElementById('contact-form'),
  typingText: document.getElementById('typing-text'),
  codeAnimation: document.getElementById('code-animation'),
  currentYear: document.getElementById('current-year'),
  globalBackground: document.querySelector('.global-background')
};

// ===== Configuration =====
const config = {
  typingSpeed: 100,
  deletingSpeed: 50,
  pauseTime: 2000,
  roles: [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Web Developer',
    'Software Engineer'
  ]
};

// ===== EPIC PARTICLE SYSTEM =====
class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.animationId = null;
    this.particleMainColor = '#6366f1';
    this.particleConnectionColorBase = '99, 102, 241';
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas-global';

    if (elements.globalBackground) {
      // Add canvas after .hero-particles or .hero-grid, but inside .global-background
      const heroParticlesDiv = elements.globalBackground.querySelector('.hero-particles');
      if (heroParticlesDiv && heroParticlesDiv.nextSibling) {
        elements.globalBackground.insertBefore(this.canvas, heroParticlesDiv.nextSibling);
      } else if (heroParticlesDiv) {
        elements.globalBackground.appendChild(this.canvas);
      } else {
        // Fallback if .hero-particles is not found
        elements.globalBackground.appendChild(this.canvas);
      }
    } else {
      document.body.insertBefore(this.canvas, document.body.firstChild);
      console.warn('.global-background element not found, particle canvas appended to body.');
    }

    this.ctx = this.canvas.getContext('2d');
    this.updateParticleColors();
    this.resizeCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  updateParticleColors() {
    const styles = getComputedStyle(document.documentElement);
    this.particleMainColor = styles.getPropertyValue('--particle-color-main').trim() || (document.documentElement.getAttribute('data-theme') === 'dark' ? '#8b5cf6' : '#6366f1');
    this.particleConnectionColorBase = styles.getPropertyValue('--particle-connection-rgb').trim() || (document.documentElement.getAttribute('data-theme') === 'dark' ? '139, 92, 246' : '99, 102, 241');
  }


  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', utils.debounce(() => {
      this.resizeCanvas();
      this.createParticles();
    }, 250));

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.x -= (dx / distance) * force * 2;
        particle.y -= (dy / distance) * force * 2;
      }
    });
  }

  drawConnections() {
    this.particles.forEach((particle, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (120 - distance) / 120 * 0.3;
          this.ctx.strokeStyle = `rgba(${this.particleConnectionColorBase}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.stroke();
        }
      }
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = this.particleMainColor;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateParticles();
    this.drawConnections();
    this.drawParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

const particleSystem = new ParticleSystem();


// ===== Utility Functions =====
const utils = {
  throttle: (func, limit) => {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  debounce: (func, wait, immediate) => {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  isInViewport: (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  scrollTo: (element, offset = 0) => {
    if (!element) return;
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// ===== Theme Management =====
const themeManager = {
  init() {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    this.setTheme(savedTheme);
    this.bindEvents();
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    this.updateThemeIcon(theme);
    if (particleSystem && typeof particleSystem.updateParticleColors === 'function') {
      particleSystem.updateParticleColors();
    }
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  updateThemeIcon(theme) {
    if (!elements.themeToggle) return;
    const moonIcon = elements.themeToggle.querySelector('.fa-moon');
    const sunIcon = elements.themeToggle.querySelector('.fa-sun');

    if (!moonIcon || !sunIcon) return;

    if (theme === 'dark') {
      moonIcon.style.opacity = '0';
      moonIcon.style.transform = 'translate(-50%, -50%) rotate(-180deg) scale(0.8)';
      sunIcon.style.opacity = '1';
      sunIcon.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
    } else {
      moonIcon.style.opacity = '1';
      moonIcon.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
      sunIcon.style.opacity = '0';
      sunIcon.style.transform = 'translate(-50%, -50%) rotate(180deg) scale(0.8)';
    }
  },

  bindEvents() {
    elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
  }
};

// ===== Navigation Management =====
const navigationManager = {
  init() {
    this.bindEvents();
    this.updateActiveLink();
    this.updateNavbarBackground();
  },

  bindEvents() {
    elements.navToggle?.addEventListener('click', () => this.toggleMobileMenu());

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
    });

    window.addEventListener('scroll', utils.throttle(() => {
      this.updateActiveLink();
      this.updateNavbarBackground();
    }, 100));

    document.addEventListener('click', (e) => {
      if (elements.navMenu?.classList.contains('active') &&
        !elements.navMenu?.contains(e.target) &&
        !elements.navToggle?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  },

  toggleMobileMenu() {
    elements.navMenu?.classList.toggle('active');
    elements.navToggle?.classList.toggle('active');
  },

  closeMobileMenu() {
    elements.navMenu?.classList.remove('active');
    elements.navToggle?.classList.remove('active');
  },

  handleAnchorClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    if (targetId === '#') {
      utils.scrollTo(document.body, 0);
      this.closeMobileMenu();
      return;
    }
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      utils.scrollTo(targetElement, elements.navbar?.offsetHeight || 80);
      this.closeMobileMenu();
    }
  },

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSectionId = 'home';
    const scrollPosition = window.scrollY;
    const offset = (elements.navbar?.offsetHeight || 70) + 50;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.offsetTop <= scrollPosition + offset) {
        currentSectionId = section.getAttribute('id');
        break;
      }
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  },

  updateNavbarBackground() {
    if (window.scrollY > 50) {
      elements.navbar?.classList.add('scrolled');
    } else {
      elements.navbar?.classList.remove('scrolled');
    }
  }
};

// ===== Typing Animation =====
const typingAnimation = {
  init() {
    if (!elements.typingText) return;

    this.currentRoleIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.timeoutId = null;
    this.start();
  },

  start() {
    if (!elements.typingText) return;
    const currentRole = config.roles[this.currentRoleIndex];

    if (this.isDeleting) {
      elements.typingText.textContent = currentRole.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
    } else {
      elements.typingText.textContent = currentRole.substring(0, this.currentCharIndex + 1);
      this.currentCharIndex++;
    }

    let nextTimeout = this.isDeleting ? config.deletingSpeed : config.typingSpeed;

    if (!this.isDeleting && this.currentCharIndex === currentRole.length) {
      nextTimeout = config.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentRoleIndex = (this.currentRoleIndex + 1) % config.roles.length;
      nextTimeout = config.typingSpeed;
    }

    this.timeoutId = setTimeout(() => this.start(), nextTimeout);
  },
  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
};

// ===== Code Animation =====
const codeAnimation = {
  init() {
    if (!elements.codeAnimation) return;

    this.codeLines = [
      'class Developer {',
      '  constructor() {',
      '    this.name = "Ali Kemal Yavaş";',
      '    this.role = "Full Stack Developer";',
      '    this.skills = ["Django", "React", "Python"];',
      '    this.passion = "Creating Amazing Experiences";',
      '  }',
      '  ',
      '  code() {',
      '    return "Building the future, one line at a time";',
      '  }',
      '}'
    ];
    this.timeoutIds = [];

    this.startAnimation();
  },

  startAnimation() {
    if (!elements.codeAnimation) return;
    elements.codeAnimation.innerHTML = '';

    this.codeLines.forEach((line, index) => {
      const timeoutId = setTimeout(() => {
        if (!elements.codeAnimation) return;
        const lineElement = document.createElement('div');
        lineElement.className = 'code-line';
        lineElement.textContent = line;
        elements.codeAnimation.appendChild(lineElement);
        this.addSyntaxHighlighting(lineElement);
      }, index * 200);
      this.timeoutIds.push(timeoutId);
    });
  },

  addSyntaxHighlighting(lineElement) {
    const text = lineElement.textContent;
    if (text.includes('class') || text.includes('constructor') || text.includes('return')) {
      lineElement.style.color = 'var(--accent)';
    } else if (text.includes('this.')) {
      lineElement.style.color = 'var(--primary-light)';
    } else if (text.includes('"') || text.includes("'")) {
      lineElement.style.color = 'var(--success)';
    } else if (text.includes('//')) {
      lineElement.style.color = 'var(--text-muted)';
    } else {
      lineElement.style.color = 'var(--text-primary)';
    }
  },
  destroy() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
  }
};

// ===== Cursor Animation =====
const cursorAnimation = {
  mouseX: 0,
  mouseY: 0,
  followerX: 0,
  followerY: 0,
  dx: 0,
  dy: 0,
  animationFrameId: null,

  init() {
    if (!elements.cursor || !elements.cursorFollower) return;
    if (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent)) {
      elements.cursor.style.display = 'none';
      elements.cursorFollower.style.display = 'none';
      return;
    }

    this.bindEvents();
    this.animateFollower();
  },

  bindEvents() {
    document.addEventListener('mousemove', (e) => this.updateCursorPosition(e));

    document.querySelectorAll('a, button, .project-card, .skill-item, .tech-item, .filter-btn, .timeline-icon, .method-icon, .social-link, .theme-toggle, .nav-toggle, .back-to-top, input[type="text"], input[type="email"], textarea, select, .checkbox-container .checkmark')
      .forEach(el => {
        el.addEventListener('mouseenter', () => this.scaleCursor(true, el.tagName.toLowerCase()));
        el.addEventListener('mouseleave', () => this.scaleCursor(false, el.tagName.toLowerCase()));
      });
  },

  updateCursorPosition(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    elements.cursor.style.left = this.mouseX + 'px';
    elements.cursor.style.top = this.mouseY + 'px';
  },

  animateFollower() {
    this.dx = this.mouseX - this.followerX;
    this.dy = this.mouseY - this.followerY;

    this.followerX += this.dx * 0.18;
    this.followerY += this.dy * 0.18;

    elements.cursorFollower.style.left = this.followerX + 'px';
    elements.cursorFollower.style.top = this.followerY + 'px';

    this.animationFrameId = requestAnimationFrame(() => this.animateFollower());
  },

  scaleCursor(isHovering, elementType) {
    let scaleValue = 1;
    let followerScaleValue = 1;
    let followerBorder = 'none';
    let cursorBg = 'var(--primary)'; // Default cursor color

    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      cursorBg = 'var(--primary-light)'; // Cursor color in dark mode
    }


    if (isHovering) {
      scaleValue = (elementType === 'input' || elementType === 'textarea' || elementType === 'select') ? 0.5 : 1.8;
      followerScaleValue = 1.5;
      followerBorder = `2px solid ${cursorBg}`; // Theme-compatible border
    }

    elements.cursor.style.backgroundColor = cursorBg; // Set cursor color
    elements.cursor.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;
    elements.cursorFollower.style.transform = `translate(-50%, -50%) scale(${followerScaleValue})`;
    elements.cursorFollower.style.border = followerBorder;
  },
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    document.removeEventListener('mousemove', this.updateCursorPosition);
  }
};

// ===== Scroll Animations =====
const scrollAnimations = {
  animatedCounters: new Set(),
  animatedSkillBars: new Set(),

  init() {
    this.bindEvents();
    this.checkElementsInView();
  },

  bindEvents() {
    window.addEventListener('scroll', utils.throttle(() => {
      this.updateBackToTop();
      this.checkElementsInView();
    }, 100));
  },

  checkElementsInView() {
    this.animateSkillBars();
    this.animateCounters();
  },

  updateBackToTop() {
    if (window.scrollY > 300) {
      elements.backToTop?.classList.add('show');
    } else {
      elements.backToTop?.classList.remove('show');
    }
  },

  animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
      if (utils.isInViewport(bar) && !this.animatedSkillBars.has(bar)) {
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
        this.animatedSkillBars.add(bar);
      }
    });
  },

  animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      if (utils.isInViewport(counter) && !this.animatedCounters.has(counter)) {
        this.animateCounter(counter);
        this.animatedCounters.add(counter);
      }
    });
  },

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    if (isNaN(target)) return;

    const duration = 1500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = target / totalFrames;
    let currentCount = 0;
    let frame = 0;

    const timer = setInterval(() => {
      currentCount += increment;
      frame++;

      if (frame >= totalFrames) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(currentCount);
      }
    }, frameDuration);
  }
};

// ===== Project Filter =====
const projectFilter = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.filterProjects(e));
    });
  },

  filterProjects(e) {
    const filterValue = e.target.getAttribute('data-filter');
    const projectsContainer = document.querySelector('.projects-grid');
    if (!projectsContainer) return;

    const projects = Array.from(projectsContainer.children);
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    projects.forEach(project => {
      project.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; // Smooth transition
      project.style.opacity = '0';
      project.style.transform = 'translateY(20px) scale(0.95)';
      setTimeout(() => {
        if (!project.matches(`[data-category="${filterValue}"]`) && filterValue !== 'all') {
          project.style.display = 'none';
        }
      }, 300);
    });

    const matchedProjects = projects.filter(project =>
      filterValue === 'all' || project.getAttribute('data-category') === filterValue
    );

    matchedProjects.forEach((project, index) => {
      project.style.display = 'block';
      setTimeout(() => {
        project.style.opacity = '1';
        project.style.transform = 'translateY(0) scale(1)';
      }, 50 + index * 50);
    });

    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }
};

// ===== EmailJS Configuration =====
const emailConfig = {
  serviceID: 'service_5m7lzao',
  templateID: 'template_kjkag9r',
  publicKey: '45Q14grYrTaFpq1GZ'
};


// ===== Form Management =====
const formManager = {
  init() {
    if (!elements.contactForm) return;
    if (typeof emailjs === 'undefined') {
      console.error('EmailJS library could not be loaded.');
      return;
    }
    emailjs.init(emailConfig.publicKey);
    this.bindEvents();
  },

  bindEvents() {
    elements.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
    const inputs = elements.contactForm.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
    const privacyCheckbox = document.getElementById('privacy');
    if (privacyCheckbox) {
      privacyCheckbox.addEventListener('change', () => this.validateField(privacyCheckbox));
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.validateForm()) return;

    const submitButton = elements.contactForm.querySelector('.btn-submit');
    const formData = new FormData(elements.contactForm);

    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
      await this.sendEmailJS(formData);
      this.showSuccess();
      elements.contactForm.reset();
      const fieldsToReset = elements.contactForm.querySelectorAll('input, textarea, select');
      fieldsToReset.forEach(field => this.clearError(field));

    } catch (error) {
      console.error('Email sending error:', error);
      const generalErrorElement = document.getElementById('form-general-error');
      if (generalErrorElement) generalErrorElement.textContent = 'An error occurred while sending the message. Please try again or send an email directly.';
      else alert('An error occurred while sending the message. Please try again.');
    } finally {
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
    }
  },

  async sendEmailJS(formData) {
    const templateParams = {
      from_name: formData.get('name'),
      from_email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      to_email: 'kemalyavaas@outlook.com'
    };
    return emailjs.send(emailConfig.serviceID, emailConfig.templateID, templateParams);
  },

  validateForm() {
    const requiredFields = elements.contactForm.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  },

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required')) {
      if (type === 'checkbox') {
        if (!field.checked) {
          errorMessage = 'This field must be checked.';
          isValid = false;
        }
      } else if (!value) {
        errorMessage = 'This field is required.';
        isValid = false;
      }
    }

    if (isValid && type === 'email' && value && !this.isValidEmail(value)) {
      errorMessage = 'Please enter a valid email address.';
      isValid = false;
    }
    if (isValid && name === 'name' && value && value.length < 2) {
      errorMessage = 'Name must be at least 2 characters.';
      isValid = false;
    }
    if (isValid && name === 'message' && value && value.length < 10) {
      errorMessage = 'Message must be at least 10 characters.';
      isValid = false;
    }

    this.displayFieldError(field, isValid ? '' : errorMessage);
    return isValid;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  displayFieldError(field, message) {
    const errorElementId = `${field.name}-error`;
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
    field.classList.toggle('input-error', !!message);
  },

  clearError(field) {
    this.displayFieldError(field, '');
  },

  showSuccess() {
    const successElement = document.getElementById('form-success');
    if (successElement) {
      successElement.style.display = 'flex';
      setTimeout(() => {
        successElement.style.display = 'none';
      }, 5000);
    }
  }
};

// ===== Preloader =====
const preloader = {
  init() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        elements.preloader?.classList.add('fade-out');
        setTimeout(() => {
          if (elements.preloader) {
            elements.preloader.style.display = 'none';
          }
        }, 500);
      }, 2000);
    });
  }
};

// ===== Performance Optimizations =====
const performanceManager = {
  init() {
    this.lazyLoadImages();
    this.optimizeAnimations();
  },

  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: "0px 0px 100px 0px" });

      images.forEach(img => imageObserver.observe(img));
    } else {
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      });
    }
  },

  optimizeAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
  }
};


// ===== Utilities for Date =====
const dateUtils = {
  init() {
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }
  }
};

// ===== Back to Top =====
const backToTop = {
  init() {
    elements.backToTop?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

// ===== Initialize AOS (Animate On Scroll) =====
const initAOS = () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out-quad',
      once: true,
      offset: 50,
      disable: window.innerWidth < 768
    });
  } else {
    console.warn('AOS library not found.');
  }
};

const advancedAnimations = {
  init() {
    // console.log('Advanced Animations (handled by AOS).');
  }
};


// ===== Main Initialization =====
const init = () => {
  preloader.init();
  themeManager.init();
  navigationManager.init();
  typingAnimation.init();
  codeAnimation.init();
  cursorAnimation.init();
  scrollAnimations.init();
  projectFilter.init();
  formManager.init();
  performanceManager.init();
  dateUtils.init();
  backToTop.init();

  initAOS();

  particleSystem.init();
  advancedAnimations.init();

  console.log('🚀 Portfolio initialized successfully! v2.2');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


// ===== Error Handling =====
window.addEventListener('error', (e) => {
  console.error('Portfolio Error:', e.message, 'at', e.filename, ':', e.lineno);
});
