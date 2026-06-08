// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const phone = this.querySelector('input[type="tel"]').value;
    const service = this.querySelector('#service-select').value;
    
    // Show confirmation message
    alert(`Thank you ${name}! Your appointment for ${getFullServiceName(service)} has been booked successfully. We will contact you at ${email} or ${phone} to confirm.`);
    
    // Reset form
    this.reset();
});

// Helper function to get full service name
function getFullServiceName(serviceCode) {
    const services = {
        'hair': 'Hair Styling',
        'nails': 'Nail Care',
        'facial': 'Facial Treatment',
        'waxing': 'Waxing',
        'makeup': 'Makeup',
        'massage': 'Massage'
    };
    return services[serviceCode] || 'Selected Service';
}

// Add animation to elements when they come into view
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and gallery items
document.querySelectorAll('.service-card, .gallery-grid img').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Current date validation for appointment booking
const today = new Date().toISOString().split('T')[0];
document.querySelector('input[type="date"]').setAttribute('min', today);

// Add image loading error handling
document.querySelectorAll('.service-card img, .gallery-grid img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/300x200/FFB6C1/FFFFFF?text=Service+Image';
        this.alt = 'Service Image';
    });
});