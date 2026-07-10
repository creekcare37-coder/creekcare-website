document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    if (mobileMenuBtn && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.toggle('active');
            // Toggle icon between menu and x (requires Lucide re-render or class change)
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenuOverlay.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons(); // Refresh icons
        });
    }

    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            navbar.style.padding = '15px 0';
        }
    });

    // Booking Form Handler
    const bookingForm = document.getElementById('booking-form');
    const bookingSuccess = document.getElementById('booking-success');
    
    if (bookingForm && bookingSuccess) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const nameInput = document.getElementById('name').value;
            const serviceInput = document.getElementById('service').value;
            const phoneInput = document.getElementById('phone').value;
            
            // Populate success message details
            document.getElementById('success-name').textContent = nameInput;
            document.getElementById('success-service').textContent = serviceInput;
            document.getElementById('success-phone').textContent = phoneInput;
            
            // Hide form and show success
            bookingForm.style.display = 'none';
            bookingSuccess.style.display = 'block';
            
            // Refresh Lucide icons in the success message
            lucide.createIcons();
            
            // Scroll to the book section header smoothly
            document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
        });
    }
});
