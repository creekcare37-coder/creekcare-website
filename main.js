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
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('active');
            }
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                }
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                navbar.style.padding = '10px 0';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                navbar.style.padding = '15px 0';
            }
        }
    });

    // Booking Form Handler
    const bookingForm = document.getElementById('booking-form');
    const bookingSuccess = document.getElementById('booking-success');
    
    if (bookingForm && bookingSuccess) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const formData = new FormData(bookingForm);
            
            fetch('https://formspree.io/f/mkoldpdk', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Populate success message details
                    const nameInput = document.getElementById('name').value;
                    const serviceInput = document.getElementById('service').value;
                    const phoneInput = document.getElementById('phone').value;
                    
                    document.getElementById('success-name').textContent = nameInput;
                    document.getElementById('success-service').textContent = serviceInput;
                    document.getElementById('success-phone').textContent = phoneInput;
                    
                    // Hide form and show success
                    bookingForm.style.display = 'none';
                    bookingSuccess.style.display = 'block';
                    
                    // Refresh Lucide icons
                    lucide.createIcons();
                    
                    // Scroll to the book section header smoothly
                    document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert("Oops! There was a problem submitting your form. Please try again.");
                        }
                    });
                }
            })
            .catch(error => {
                alert("Oops! There was a problem submitting your form. Please check your connection and try again.");
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }

    // FAQ Accordion Handler (closes other items when one is opened)
    const faqItems = document.querySelectorAll('details.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.removeAttribute('open');
                    }
                });
            }
        });
    });

}); // End DOMContentLoaded

// Estimator State
const activeServices = new Set();
let lawnFrequency = 'weekly';

function setLawnFrequency(freq, el) {
    try {
        lawnFrequency = freq;
        const pills = el.parentNode.querySelectorAll('.pill');
        pills.forEach(p => p.classList.remove('active'));
        el.classList.add('active');
        calculateEstimate();
    } catch (e) {
        console.error("Lawn frequency update error:", e);
    }
}

function toggleEstimatorOption(el) {
    try {
        const service = el.getAttribute('data-service');
        el.classList.toggle('active');
        
        const panel = document.getElementById(`panel-${service}`);
        if (el.classList.contains('active')) {
            activeServices.add(service);
            if (panel) panel.style.display = 'block';
        } else {
            activeServices.delete(service);
            if (panel) panel.style.display = 'none';
        }
        calculateEstimate();
    } catch (e) {
        console.error("Estimator error:", e);
    }
}

function updateBinCount(val) {
    try {
        const valSpan = document.getElementById('bin-count-val');
        if (valSpan) valSpan.textContent = val;
        calculateEstimate();
    } catch (e) {
        console.error("Bin update error:", e);
    }
}

function calculateEstimate() {
    try {
        const detailsContainer = document.getElementById('summary-details');
        const totalSpan = document.getElementById('calc-total');
        if (!detailsContainer || !totalSpan) return;

        detailsContainer.innerHTML = '';
        let total = 0;
        
        if (activeServices.size === 0) {
            detailsContainer.innerHTML = '<p class="empty-msg">Select a service to calculate your estimate.</p>';
            totalSpan.textContent = '$0';
            return;
        }

        activeServices.forEach(service => {
            let serviceName = '';
            let serviceCost = 0;
            let detailText = '';

            if (service === 'lawn-care') {
                serviceName = 'Lawn Mowing';
                serviceCost = lawnFrequency === 'weekly' ? 60 : 75;
                detailText = lawnFrequency === 'weekly' ? 'Weekly Schedule ($60/cut)' : 'Bi-Weekly Schedule ($75/cut)';
            } else if (service === 'gutter-cleaning') {
                serviceName = 'Gutter Cleaning';
                const houseTypeEl = document.getElementById('gutter-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                if (houseType === 'townhouse') {
                    serviceCost = 100;
                    detailText = 'Townhouse Base Rate';
                } else if (houseType === 'semi') {
                    serviceCost = 140;
                    detailText = 'Semi-Detached Base Rate';
                } else {
                    serviceCost = 180;
                    detailText = 'Detached House Base Rate';
                }
            } else if (service === 'bin-cleaning') {
                serviceName = 'Bin Cleaning';
                const binCountEl = document.getElementById('bin-count');
                const binCount = binCountEl ? parseInt(binCountEl.value) : 2;
                serviceCost = 20 + (binCount - 1) * 10;
                detailText = `${binCount} Bins sanitized`;
            } else if (service === 'garage-cleanouts') {
                serviceName = 'Garage Cleanout';
                const volumeEl = document.getElementById('garage-volume');
                const volume = volumeEl ? volumeEl.value : 'small';
                if (volume === 'small') {
                    serviceCost = 120;
                    detailText = 'Small / Light Volume';
                } else if (volume === 'medium') {
                    serviceCost = 220;
                    detailText = 'Medium / Half-Load';
                } else {
                    serviceCost = 370;
                    detailText = 'Large / Full-Load';
                }
            } else if (service === 'gutter-inspection') {
                serviceName = 'Gutter Inspection';
                serviceCost = 35;
                detailText = 'Camera Pole Inspection & Video validation';
            }

            total += serviceCost;

            const itemEl = document.createElement('p');
            itemEl.innerHTML = `<span><strong>${serviceName}</strong><br><small style="color: #cbd5e1; font-size: 0.85rem;">${detailText}</small></span> <span>$${serviceCost}</span>`;
            detailsContainer.appendChild(itemEl);
        });

        totalSpan.textContent = `$${total}`;
    } catch (e) {
        console.error("Calculate estimate error:", e);
    }
}

function applyEstimateToBooking() {
    try {
        if (activeServices.size === 0) {
            alert('Please select at least one service to calculate an estimate.');
            return;
        }

        const bookingSelect = document.getElementById('service');
        const messageTextarea = document.getElementById('message');
        
        if (!bookingSelect || !messageTextarea) return;

        // Determine dropdown select value
        if (activeServices.size === 1) {
            const singleService = Array.from(activeServices)[0];
            if (singleService === 'lawn-care') bookingSelect.value = 'Lawn Care';
            else if (singleService === 'garage-cleanouts') bookingSelect.value = 'Garage Cleanouts';
            else if (singleService === 'gutter-cleaning') bookingSelect.value = 'Gutter Cleaning';
            else if (singleService === 'bin-cleaning') bookingSelect.value = 'Bin Cleaning';
            else if (singleService === 'gutter-inspection') bookingSelect.value = 'Gutter Inspection';
        } else {
            bookingSelect.value = 'Multiple Services';
        }

        // Generate details text
        let detailsMsg = 'Calculated Estimate Summary:\n';
        let total = 0;

        activeServices.forEach(service => {
            if (service === 'lawn-care') {
                const cost = lawnFrequency === 'weekly' ? 60 : 75;
                const freqLabel = lawnFrequency === 'weekly' ? 'Weekly' : 'Bi-Weekly';
                detailsMsg += `- Lawn Mowing (${freqLabel}): $${cost}/cut\n`;
                total += cost;
            } else if (service === 'gutter-cleaning') {
                const houseTypeEl = document.getElementById('gutter-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                const cost = houseType === 'townhouse' ? 100 : houseType === 'semi' ? 140 : 180;
                detailsMsg += `- Gutter Cleaning (${houseType.charAt(0).toUpperCase() + houseType.slice(1)}): $${cost}\n`;
                total += cost;
            } else if (service === 'bin-cleaning') {
                const binCountEl = document.getElementById('bin-count');
                const binCount = binCountEl ? parseInt(binCountEl.value) : 2;
                const cost = 20 + (binCount - 1) * 10;
                detailsMsg += `- Bin Cleaning (${binCount} bins): $${cost}\n`;
                total += cost;
            } else if (service === 'garage-cleanouts') {
                const volumeEl = document.getElementById('garage-volume');
                const volume = volumeEl ? volumeEl.value : 'small';
                const cost = volume === 'small' ? 120 : volume === 'medium' ? 220 : 370;
                detailsMsg += `- Garage Cleanout (${volume.charAt(0).toUpperCase() + volume.slice(1)}): $${cost}\n`;
                total += cost;
            } else if (service === 'gutter-inspection') {
                detailsMsg += '- Gutter Inspection (Camera Pole): $35\n';
                total += 35;
            }
        });
        
        detailsMsg += `Estimated Total: $${total}\n\n[Please enter any additional request notes here...]`;
        messageTextarea.value = detailsMsg;

        // Scroll to booking form
        document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        console.error("Apply estimate error:", e);
    }
}

// Service Map Initialization (Leaflet.js)
window.addEventListener('load', function() {
    try {
        const mapContainer = document.getElementById('service-map');
        if (mapContainer && window.L) {
            // Center on Findlay Creek / Blossom Park area (Ottawa coordinates)
            const map = L.map('service-map', {
                center: [45.3316, -75.6225],
                zoom: 12,
                scrollWheelZoom: false
            });

            // Use standard OpenStreetMap tiles
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Findlay Creek Service Zone
            const findlayCreek = L.circle([45.3129, -75.6022], {
                color: '#2ecc71',
                fillColor: '#2ecc71',
                fillOpacity: 0.15,
                radius: 2000 // 2 km
            }).addTo(map);
            findlayCreek.bindPopup('<strong>Findlay Creek Service Zone</strong><br>Weekly cuts, gutters, bins, and cleanouts.');

            // Blossom Park Service Zone
            const blossomPark = L.circle([45.3503, -75.6429], {
                color: '#27ae60',
                fillColor: '#27ae60',
                fillOpacity: 0.15,
                radius: 2000 // 2 km
            }).addTo(map);
            blossomPark.bindPopup('<strong>Blossom Park Service Zone</strong><br>Weekly cuts, gutters, bins, and cleanouts.');
            
            // Force Leaflet map resize layout fix
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        }
    } catch (e) {
        console.error("Map initialization error:", e);
    }
});

// Explicit window binding mappings as redundant safety layers
window.toggleEstimatorOption = toggleEstimatorOption;
window.updateBinCount = updateBinCount;
window.calculateEstimate = calculateEstimate;
window.applyEstimateToBooking = applyEstimateToBooking;
window.setLawnFrequency = setLawnFrequency;
