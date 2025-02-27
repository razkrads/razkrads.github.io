/**
 * Main JavaScript for ASP website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', function() {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('nav-open'); // Add class to body to prevent scrolling
      });
      
      // Close menu when clicking a link
      const links = navLinks.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', function() {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.classList.remove('nav-open');
        });
      });
    }
    
    // Add scroll class to header
    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
      
      // Trigger scroll event on load to set initial state
      window.dispatchEvent(new Event('scroll'));
    }
    
    // Board Modal
    const bestyrelseTrigger = document.getElementById('bestyrelse-trigger');
    const bestyrelseModal = document.getElementById('bestyrelse-modal');
    
    if (bestyrelseTrigger && bestyrelseModal) {
      const closeBtn = bestyrelseModal.querySelector('.close-modal');
      
      bestyrelseTrigger.addEventListener('click', function() {
        bestyrelseModal.style.display = 'block';
      });
      
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          bestyrelseModal.style.display = 'none';
        });
      }
      
      window.addEventListener('click', function(event) {
        if (event.target === bestyrelseModal) {
          bestyrelseModal.style.display = 'none';
        }
      });
      
      // Close modal on ESC key
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bestyrelseModal.style.display === 'block') {
          bestyrelseModal.style.display = 'none';
        }
      });
    }
    
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Only process if href is not just "#"
        if (href !== '#') {
          e.preventDefault();
          
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  });