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
        let hasQuote = false;
        
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
                const houseTypeEl = document.getElementById('lawn-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                let baseCost = 60;
                let label = '';
                if (lawnFrequency === 'weekly') {
                    label = 'Weekly';
                    if (houseType === 'townhouse') baseCost = 60;
                    else if (houseType === 'semi') baseCost = 70;
                    else baseCost = 80;
                } else {
                    label = 'Bi-Weekly';
                    if (houseType === 'townhouse') baseCost = 75;
                    else if (houseType === 'semi') baseCost = 85;
                    else baseCost = 95;
                }
                serviceCost = baseCost;
                const typeLabel = houseType === 'townhouse' ? 'Town Home' : houseType === 'semi' ? 'Semi-detached' : 'Single home';
                detailText = `${label} - ${typeLabel}`;
            } else if (service === 'gutter-cleaning') {
                serviceName = 'Gutter Cleaning';
                const houseTypeEl = document.getElementById('gutter-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                if (houseType === 'townhouse') {
                    serviceCost = 100;
                    detailText = 'Town Home Base Rate';
                } else if (houseType === 'semi') {
                    serviceCost = 140;
                    detailText = 'Semi-detached Base Rate';
                } else {
                    serviceCost = 180;
                    detailText = 'Single home Base Rate';
                }
            } else if (service === 'bin-cleaning') {
                serviceName = 'Bin Cleaning';
                const binCountEl = document.getElementById('bin-count');
                const binCount = binCountEl ? parseInt(binCountEl.value) : 2;
                serviceCost = 20 + (binCount - 1) * 10;
                detailText = `${binCount} Bins sanitized`;
            } else if (service === 'garage-cleanouts') {
                serviceName = 'Garage Cleanout';
                serviceCost = 'Quote Needed';
                const volumeEl = document.getElementById('garage-volume');
                const volume = volumeEl ? volumeEl.value : 'small';
                const volLabel = volume === 'small' ? 'Small Volume' : volume === 'medium' ? 'Medium Volume' : 'Large Volume';
                detailText = `${volLabel} (In-person quote needed)`;
            } else if (service === 'gutter-inspection') {
                serviceName = 'Gutter Inspection';
                serviceCost = 35;
                detailText = 'Camera Pole Inspection & Video validation';
            } else if (service === 'spring-cleanup') {
                serviceName = 'Spring Clean Up';
                serviceCost = 'Quote Needed';
                const yardSizeEl = document.getElementById('spring-cleanup-size');
                const yardSize = yardSizeEl ? yardSizeEl.value : 'small';
                const sizeLabel = yardSize === 'small' ? 'Small Yard' : yardSize === 'medium' ? 'Medium Yard' : 'Large Yard';
                detailText = `${sizeLabel} (In-person quote needed)`;
            } else if (service === 'fall-cleanup') {
                serviceName = 'Fall Clean Up';
                serviceCost = 'Quote Needed';
                const yardSizeEl = document.getElementById('fall-cleanup-size');
                const yardSize = yardSizeEl ? yardSizeEl.value : 'small';
                const sizeLabel = yardSize === 'small' ? 'Small Yard' : yardSize === 'medium' ? 'Medium Yard' : 'Large Yard';
                detailText = `${sizeLabel} (In-person quote needed)`;
            }

            if (typeof serviceCost === 'number') {
                total += serviceCost;
            } else {
                hasQuote = true;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.style.display = 'flex';
            itemEl.style.justifyContent = 'space-between';
            itemEl.style.alignItems = 'center';
            itemEl.style.marginBottom = '12px';
            
            const costText = typeof serviceCost === 'number' ? `$${serviceCost}` : serviceCost;
            itemEl.innerHTML = `
                <span>
                    <strong>${serviceName}</strong><br>
                    <small style="color: #cbd5e1; font-size: 0.85rem;">${detailText}</small>
                </span>
                <span style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                    ${costText}
                    <button class="remove-item-btn" onclick="removeEstimatorService('${service}')" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1.2rem; padding: 0 4px; line-height: 1; margin-left: 2px;" title="Remove service">&times;</button>
                </span>
            `;
            detailsContainer.appendChild(itemEl);
        });

        if (hasQuote) {
            totalSpan.textContent = total > 0 ? `$${total} + Quote` : 'Quote Needed';
        } else {
            totalSpan.textContent = `$${total}`;
        }
    } catch (e) {
        console.error("Calculate estimate error:", e);
    }
}

function removeEstimatorService(service) {
    try {
        const optionCard = document.querySelector(`.estimator-option[data-service="${service}"]`);
        if (optionCard) {
            optionCard.classList.remove('active');
        }
        
        const panel = document.getElementById(`panel-${service}`);
        if (panel) {
            panel.style.display = 'none';
        }
        
        activeServices.delete(service);
        calculateEstimate();
    } catch (e) {
        console.error("Remove service error:", e);
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
            else if (singleService === 'spring-cleanup') bookingSelect.value = 'Spring Clean Up';
            else if (singleService === 'fall-cleanup') bookingSelect.value = 'Fall Clean Up';
        } else {
            bookingSelect.value = 'Multiple Services';
        }

        // Generate details text
        let detailsMsg = 'Calculated Estimate Summary:\n';
        let total = 0;
        let hasQuote = false;

        activeServices.forEach(service => {
            if (service === 'lawn-care') {
                const houseTypeEl = document.getElementById('lawn-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                let cost = 60;
                if (lawnFrequency === 'weekly') {
                    cost = houseType === 'townhouse' ? 60 : houseType === 'semi' ? 70 : 80;
                } else {
                    cost = houseType === 'townhouse' ? 75 : houseType === 'semi' ? 85 : 95;
                }
                const freqLabel = lawnFrequency === 'weekly' ? 'Weekly' : 'Bi-Weekly';
                const typeLabel = houseType === 'townhouse' ? 'Town Home' : houseType === 'semi' ? 'Semi-detached' : 'Single home';
                detailsMsg += `- Lawn Mowing (${freqLabel} - ${typeLabel}): $${cost}/cut\n`;
                total += cost;
            } else if (service === 'gutter-cleaning') {
                const houseTypeEl = document.getElementById('gutter-house-type');
                const houseType = houseTypeEl ? houseTypeEl.value : 'townhouse';
                const cost = houseType === 'townhouse' ? 100 : houseType === 'semi' ? 140 : 180;
                const label = houseType === 'townhouse' ? 'Town Home' : houseType === 'semi' ? 'Semi-detached' : 'Single home';
                detailsMsg += `- Gutter Cleaning (${label}): $${cost}\n`;
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
                const volLabel = volume === 'small' ? 'Small Volume' : volume === 'medium' ? 'Medium Volume' : 'Large Volume';
                detailsMsg += `- Garage Cleanout (${volLabel}): In-person quote needed\n`;
                hasQuote = true;
            } else if (service === 'gutter-inspection') {
                detailsMsg += '- Gutter Inspection (Camera Pole): $35\n';
                total += 35;
            } else if (service === 'spring-cleanup') {
                const yardSizeEl = document.getElementById('spring-cleanup-size');
                const yardSize = yardSizeEl ? yardSizeEl.value : 'small';
                const sizeLabel = yardSize === 'small' ? 'Small Yard' : yardSize === 'medium' ? 'Medium Yard' : 'Large Yard';
                detailsMsg += `- Spring Clean Up (${sizeLabel}): In-person quote needed\n`;
                hasQuote = true;
            } else if (service === 'fall-cleanup') {
                const yardSizeEl = document.getElementById('fall-cleanup-size');
                const yardSize = yardSizeEl ? yardSizeEl.value : 'small';
                const sizeLabel = yardSize === 'small' ? 'Small Yard' : yardSize === 'medium' ? 'Medium Yard' : 'Large Yard';
                detailsMsg += `- Fall Clean Up (${sizeLabel}): In-person quote needed\n`;
                hasQuote = true;
            }
        });
        
        if (hasQuote) {
            detailsMsg += `Estimated Total: $${total} + Quote Required\n\n[Please enter any additional request notes here...]`;
        } else {
            detailsMsg += `Estimated Total: $${total}\n\n[Please enter any additional request notes here...]`;
        }
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
            const isMobileDevice = L.Browser.mobile || ('ontouchstart' in window);
            const map = L.map('service-map', {
                center: [45.3316, -75.6225],
                zoom: 12,
                scrollWheelZoom: false,
                dragging: !isMobileDevice,
                tap: !isMobileDevice
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
window.removeEstimatorService = removeEstimatorService;
