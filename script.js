// ===== MAA KA PYAAR - MAIN APPLICATION SCRIPT =====
console.log('🚀 Maa Ka Pyaar - Loading...');

// ===== GLOBAL STATE VARIABLES (MUST BE FIRST) =====
let currentUser = { 
    name: '', 
    role: '',
    mobile: '' 
};

let currentKitchen = null;
let activeKitchenId = null;
let activeCategory = 'breakfast';
let cart = [];
let ordersDB = [];
let tempItem = null;
let tempQuantity = 1;

// Immediately log that script is executing
console.log('✅ Script execution started - variables and functions will be available');

// ===== IMMEDIATELY DEFINE CORE FUNCTIONS =====
// These functions need to be available immediately for HTML onclick handlers

function goToLogin(role) {
    console.log('🚀 goToLogin called with role:', role);
    console.log('✅ Function is working correctly!');
    
    currentUser.role = role;
    let title = "Login";
    
    if (role === 'cook') title = "👩‍🍳 Mother Login";
    else if (role === 'student') title = "🧑‍💻 Student Login";
    else if (role === 'admin') title = "👨‍💼 Administrator Login";
    
    const authTitle = document.getElementById('auth-title');
    if (authTitle) {
        authTitle.innerText = title;
    }
    
    showScreen('auth');
}

// Immediately make goToLogin available globally
window.goToLogin = goToLogin;
console.log('✅ goToLogin function made globally available:', typeof window.goToLogin);

function showScreen(id) {
    console.log('🔄 Switching to screen:', id);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show target screen
    const targetId = id.endsWith('-screen') ? id : id + '-screen';
    const el = document.getElementById(targetId);
    
    if (el) {
        el.classList.add('active');
        console.log('✅ Screen switched to:', targetId);
        
        // Load data when navigating to specific screens
        if (id === 'mother-history') {
            loadMotherOrderHistory();
        } else if (id === 'student-history') {
            loadStudentOrderHistory();
        } else if (id === 'mother-dashboard') {
            if (currentUser.role === 'cook' && currentKitchen) {
                loadProfileData();
                updateKitchenStatusDisplay();
            }
        }
    } else {
        console.error('❌ Screen not found:', targetId);
    }
}

// Immediately make showScreen available globally
window.showScreen = showScreen;
console.log('✅ showScreen function made globally available:', typeof window.showScreen);

function handleLogin(e) {
    e.preventDefault();
    console.log('📝 handleLogin called');
    
    const name = document.getElementById('u_name').value;
    const mobile = document.getElementById('u_mobile').value;
    
    if (!name || !mobile) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    currentUser.name = name;
    currentUser.mobile = mobile;
    
    if (currentUser.role === 'cook') {
        // Find or create kitchen
        let k = kitchens.find(k => k.ownerName.toLowerCase() === name.toLowerCase());
        
        if (!k) {
            k = { 
                id: Date.now(), 
                name: `${name}'s Kitchen`, 
                ownerName: name, 
                specialty: "Home Food", 
                description: "Delicious home-cooked meals made with love.",
                rating: 5.0, 
                image: getImg(name),
                isOpen: true,
                autoTiming: true,
                openingTime: "09:00",
                closingTime: "21:00"
            };
            kitchens.push(k);
        }
        currentKitchen = k;
        
        // Update display
        const nameDisplay = document.getElementById('mom-name-display');
        if (nameDisplay) nameDisplay.innerText = name;
        
        loadMotherMenuTable();
        loadMotherOrders();
        loadProfileData();
        loadKitchenTimingSettings();
        
        showScreen('mother-dashboard');
        
    } else if (currentUser.role === 'student') {
        showScreen('student-dashboard');
        renderKitchensList();
        updateNotificationBadge();
        
    } else if (currentUser.role === 'admin') {
        const nameDisplay = document.getElementById('admin-name-display');
        if (nameDisplay) nameDisplay.innerText = name;
        
        showScreen('admin-dashboard');
        showAdminSection('refunds');
        loadAdminDashboard();
    }
}

// Immediately make handleLogin available globally
window.handleLogin = handleLogin;
console.log('✅ handleLogin function made globally available:', typeof window.handleLogin);

// Test function to verify everything is working
window.testFunctions = function() {
    console.log('=== FUNCTION TEST RESULTS ===');
    console.log('goToLogin:', typeof window.goToLogin);
    console.log('showScreen:', typeof window.showScreen);
    console.log('handleLogin:', typeof window.handleLogin);
    console.log('currentUser:', currentUser);
    console.log('=== END TEST ===');
    return 'All functions are available!';
};

console.log('🧪 Test function created. Run testFunctions() in console to verify.');

function logout() {
    currentUser = { name: '', role: '', mobile: '' };
    currentKitchen = null;
    cart = [];
    showScreen('role');
    const form = document.getElementById('detailsForm');
    if (form) form.reset();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== STUB FUNCTIONS (will be properly defined later) =====
// These prevent "function not defined" errors for HTML onclick handlers

function saveKitchenProfile() { console.log('saveKitchenProfile called'); }
function resetProfileForm() { console.log('resetProfileForm called'); }
function setTimingMode(mode) { console.log('setTimingMode called with:', mode); }
function toggleKitchenStatus() { console.log('toggleKitchenStatus called'); }
function saveKitchenTiming() { console.log('saveKitchenTiming called'); }
function resetTimingToDefaults() { console.log('resetTimingToDefaults called'); }
function addMyMenuItem() { console.log('addMyMenuItem called'); }
function openSupportForm() { console.log('openSupportForm called'); }
function closeSupportForm() { console.log('closeSupportForm called'); }
function submitSupportTicket(e) { e.preventDefault(); console.log('submitSupportTicket called'); }
function toggleNotifications() { console.log('toggleNotifications called'); }
function scrollToCart() { console.log('scrollToCart called'); }
function backToKitchens() { console.log('backToKitchens called'); }
function filterMenu(cat) { console.log('filterMenu called with:', cat); }
function placeOrder() { console.log('placeOrder called'); }
function backToCart() { console.log('backToCart called'); }
function confirmPayment() { console.log('confirmPayment called'); }
function showAdminSection(section) { console.log('showAdminSection called with:', section); }
function closeSupportModal() { console.log('closeSupportModal called'); }
function respondToTicket() { console.log('respondToTicket called'); }
function decreaseQuantity() { console.log('decreaseQuantity called'); }
function increaseQuantity() { console.log('increaseQuantity called'); }
function closeModal() { console.log('closeModal called'); }
function confirmAddToCart() { console.log('confirmAddToCart called'); }

// Make functions immediately available globally
window.goToLogin = goToLogin;
window.showScreen = showScreen;
window.handleLogin = handleLogin;
window.logout = logout;
window.showToast = showToast;
window.saveKitchenProfile = saveKitchenProfile;
window.resetProfileForm = resetProfileForm;
window.setTimingMode = setTimingMode;
window.toggleKitchenStatus = toggleKitchenStatus;
window.saveKitchenTiming = saveKitchenTiming;
window.resetTimingToDefaults = resetTimingToDefaults;
window.addMyMenuItem = addMyMenuItem;
window.openSupportForm = openSupportForm;
window.closeSupportForm = closeSupportForm;
window.submitSupportTicket = submitSupportTicket;
window.toggleNotifications = toggleNotifications;
window.scrollToCart = scrollToCart;
window.backToKitchens = backToKitchens;
window.filterMenu = filterMenu;
window.placeOrder = placeOrder;
window.backToCart = backToCart;
window.confirmPayment = confirmPayment;
window.showAdminSection = showAdminSection;
window.closeSupportModal = closeSupportModal;
window.respondToTicket = respondToTicket;
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.closeModal = closeModal;
window.confirmAddToCart = confirmAddToCart;

// ===== GLOBAL STATE VARIABLES =====
let currentUser = { 
    name: '', 
    role: '',
    mobile: '' 
};

let currentKitchen = null;
let activeKitchenId = null;
let activeCategory = 'breakfast';
let cart = [];
let ordersDB = [];
let tempItem = null;
let tempQuantity = 1;

// ===== MOCK DATA =====
const getImg = (text) => `https://placehold.co/400x300/e8f5e9/2e7d32?text=${encodeURIComponent(text)}`;

const ORDER_STATUSES = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    DECLINED: 'Declined',
    REFUND_REQUESTED: 'Refund Requested',
    REFUNDED: 'Refunded',
    CANCELLED: 'Cancelled'
};

let kitchens = [
    { 
        id: 1, 
        name: "Suman's Kitchen", 
        ownerName: "Suman", 
        specialty: "North Indian", 
        description: "Authentic North Indian home-cooked meals made with love.",
        rating: 4.8, 
        image: "https://placehold.co/400x200/e8f5e9/2e7d32?text=Suman",
        isOpen: true,
        autoTiming: true,
        openingTime: "09:00",
        closingTime: "21:00"
    },
    { 
        id: 2, 
        name: "Radha's Rasoi", 
        ownerName: "Radha", 
        specialty: "Gujarati", 
        description: "Traditional Gujarati thali and snacks.",
        rating: 4.5, 
        image: "https://placehold.co/400x200/fff8e1/5d4037?text=Radha",
        isOpen: true,
        autoTiming: true,
        openingTime: "09:00",
        closingTime: "21:00"
    }
];

let menuDB = [
    { id: 101, kitchenId: 1, name: "Aloo Paratha", price: 60, category: "breakfast", image: getImg("Aloo Paratha") },
    { id: 102, kitchenId: 1, name: "Dal Makhani", price: 120, category: "lunch", image: getImg("Dal Makhani") },
    { id: 103, kitchenId: 1, name: "Samosa", price: 30, category: "snack", image: getImg("Samosa") },
    { id: 201, kitchenId: 2, name: "Poha", price: 40, category: "breakfast", image: getImg("Poha") },
    { id: 202, kitchenId: 2, name: "Gujarati Thali", price: 180, category: "lunch", image: getImg("Thali") }
];

let supportTicketsDB = [];
let adminUsers = [{ id: 1, name: 'Admin', email: 'admin@makapyaar.com', role: 'admin' }];
let currentTicket = null;// ==
=== KITCHEN PROFILE MANAGEMENT =====
function saveKitchenProfile() {
    if (!currentKitchen) {
        showToast('Error: No kitchen found! Please login as a cook first.', 'error');
        return;
    }
    
    const nameInput = document.getElementById('kitchenNameInput');
    const specialtyInput = document.getElementById('kitchenSpecInput');
    const descriptionInput = document.getElementById('kitchenDescInput');
    
    if (!nameInput || !specialtyInput || !descriptionInput) {
        showToast('Error: Form elements not found', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const specialty = specialtyInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name) {
        showToast('Restaurant name is required', 'error');
        nameInput.focus();
        return;
    }
    
    if (!specialty) {
        showToast('Cuisine specialty is required', 'error');
        specialtyInput.focus();
        return;
    }
    
    if (name.length > 100) {
        showToast('Restaurant name must be 100 characters or less', 'error');
        return;
    }
    
    if (specialty.length > 50) {
        showToast('Cuisine specialty must be 50 characters or less', 'error');
        return;
    }
    
    if (description.length > 500) {
        showToast('Kitchen description must be 500 characters or less', 'error');
        return;
    }
    
    // Save profile
    currentKitchen.name = name;
    currentKitchen.specialty = specialty;
    currentKitchen.description = description;
    
    // Sync with global array
    syncKitchenToGlobal();
    
    showToast('Profile updated successfully!', 'success');
}

function resetProfileForm() {
    if (!currentKitchen) {
        showToast('Error: No kitchen found!', 'error');
        return;
    }
    
    const nameInput = document.getElementById('kitchenNameInput');
    const specialtyInput = document.getElementById('kitchenSpecInput');
    const descriptionInput = document.getElementById('kitchenDescInput');
    
    if (nameInput) nameInput.value = currentKitchen.name || '';
    if (specialtyInput) specialtyInput.value = currentKitchen.specialty || '';
    if (descriptionInput) descriptionInput.value = currentKitchen.description || '';
    
    showToast('Form reset to saved values', 'info');
}

function loadProfileData() {
    if (!currentKitchen) return;
    
    const nameInput = document.getElementById('kitchenNameInput');
    const specialtyInput = document.getElementById('kitchenSpecInput');
    const descriptionInput = document.getElementById('kitchenDescInput');
    
    if (nameInput) nameInput.value = currentKitchen.name || '';
    if (specialtyInput) specialtyInput.value = currentKitchen.specialty || '';
    if (descriptionInput) descriptionInput.value = currentKitchen.description || '';
}// ====
= KITCHEN TIMING MANAGEMENT =====
function setTimingMode(mode) {
    if (!currentKitchen) {
        showToast('Error: No kitchen found!', 'error');
        return;
    }
    
    const manualSection = document.getElementById('manualTimingSection');
    
    if (mode === 'auto') {
        if (manualSection) manualSection.style.display = 'none';
        currentKitchen.autoTiming = true;
        currentKitchen.openingTime = "09:00";
        currentKitchen.closingTime = "21:00";
        
        const openingTimeInput = document.getElementById('openingTime');
        const closingTimeInput = document.getElementById('closingTime');
        if (openingTimeInput) openingTimeInput.value = "09:00";
        if (closingTimeInput) closingTimeInput.value = "21:00";
        
        checkAutoTiming();
        showToast('Automatic timing enabled (9 AM - 9 PM)', 'success');
        
    } else if (mode === 'manual') {
        if (manualSection) manualSection.style.display = 'block';
        currentKitchen.autoTiming = false;
        
        if (!currentKitchen.openingTime) currentKitchen.openingTime = "09:00";
        if (!currentKitchen.closingTime) currentKitchen.closingTime = "21:00";
        
        const openingTimeInput = document.getElementById('openingTime');
        const closingTimeInput = document.getElementById('closingTime');
        if (openingTimeInput) openingTimeInput.value = currentKitchen.openingTime;
        if (closingTimeInput) closingTimeInput.value = currentKitchen.closingTime;
        
        updateKitchenAvailabilityBasedOnTime();
        showToast('Manual timing mode enabled', 'success');
    }
    
    syncKitchenToGlobal();
    updateKitchenStatusDisplay();
}

function toggleKitchenStatus() {
    if (!currentKitchen) {
        showToast('Error: No kitchen found!', 'error');
        return;
    }
    
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    if (!checkbox) {
        showToast('Error: Kitchen status checkbox not found', 'error');
        return;
    }
    
    currentKitchen.isOpen = checkbox.checked;
    
    if (currentKitchen.autoTiming) {
        showToast('Manual override applied. Will revert to auto timing at next hour.', 'warning');
    } else {
        showToast(`Kitchen is now ${currentKitchen.isOpen ? 'Open' : 'Closed'}`, 'success');
    }
    
    syncKitchenToGlobal();
    updateKitchenStatusDisplay();
}

function saveKitchenTiming() {
    if (!currentKitchen) {
        showToast('Error: No kitchen found', 'error');
        return;
    }
    
    if (!currentKitchen.autoTiming) {
        const openingTime = document.getElementById('openingTime').value;
        const closingTime = document.getElementById('closingTime').value;
        
        if (!openingTime || !closingTime) {
            showToast('Please set both opening and closing times', 'error');
            return;
        }
        
        if (!validateTimingSettings(openingTime, closingTime)) {
            return;
        }
        
        currentKitchen.openingTime = openingTime;
        currentKitchen.closingTime = closingTime;
        
        updateKitchenAvailabilityBasedOnTime();
    }
    
    syncKitchenToGlobal();
    updateKitchenStatusDisplay();
    showToast("Timing settings saved successfully!", 'success');
}

function resetTimingToDefaults() {
    if (!currentKitchen) {
        showToast('Error: No kitchen found', 'error');
        return;
    }
    
    currentKitchen.autoTiming = true;
    currentKitchen.openingTime = "09:00";
    currentKitchen.closingTime = "21:00";
    currentKitchen.isOpen = true;
    
    const autoRadio = document.getElementById('autoTimingRadio');
    const manualRadio = document.getElementById('manualTimingRadio');
    const manualSection = document.getElementById('manualTimingSection');
    const openingTimeInput = document.getElementById('openingTime');
    const closingTimeInput = document.getElementById('closingTime');
    const kitchenOpenCheckbox = document.getElementById('kitchenOpenCheckbox');
    
    if (autoRadio) autoRadio.checked = true;
    if (manualRadio) manualRadio.checked = false;
    if (manualSection) manualSection.style.display = 'none';
    if (openingTimeInput) openingTimeInput.value = "09:00";
    if (closingTimeInput) closingTimeInput.value = "21:00";
    if (kitchenOpenCheckbox) kitchenOpenCheckbox.checked = true;
    
    checkAutoTiming();
    syncKitchenToGlobal();
    updateKitchenStatusDisplay();
    
    showToast('Timing settings reset to defaults (Auto: 9 AM - 9 PM)', 'success');
}// 
===== TIMING HELPER FUNCTIONS =====
function updateKitchenStatusDisplay() {
    if (!currentKitchen) return;
    
    const statusDiv = document.getElementById('kitchenStatusDisplay');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const timingDetails = document.getElementById('timingDetails');
    
    if (!statusDiv || !statusText) return;
    
    if (currentKitchen.isOpen) {
        statusDiv.style.backgroundColor = '#C8E6C9';
        statusDiv.style.color = '#2E7D32';
        statusText.innerText = 'Kitchen is Open';
        if (statusDot) statusDot.style.backgroundColor = '#4CAF50';
        
        if (timingDetails) {
            const mode = currentKitchen.autoTiming ? 'Automatic' : 'Manual';
            timingDetails.innerText = `${mode} timing: ${currentKitchen.openingTime} - ${currentKitchen.closingTime}`;
        }
    } else {
        statusDiv.style.backgroundColor = '#FFCDD2';
        statusDiv.style.color = '#d32f2f';
        statusText.innerText = 'Kitchen is Closed';
        if (statusDot) statusDot.style.backgroundColor = '#d32f2f';
        
        if (timingDetails) {
            const mode = currentKitchen.autoTiming ? 'Automatic' : 'Manual';
            timingDetails.innerText = `${mode} timing: ${currentKitchen.openingTime} - ${currentKitchen.closingTime}`;
        }
    }
}

function checkAutoTiming() {
    if (!currentKitchen || !currentKitchen.autoTiming) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const shouldBeOpen = currentHour >= 9 && currentHour < 21;
    
    if (currentKitchen.isOpen !== shouldBeOpen) {
        currentKitchen.isOpen = shouldBeOpen;
        syncKitchenToGlobal();
    }
    
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    if (checkbox) {
        checkbox.checked = currentKitchen.isOpen;
        checkbox.disabled = false;
    }
    
    updateKitchenStatusDisplay();
}

function loadKitchenTimingSettings() {
    if (!currentKitchen) return;
    
    // Set defaults
    if (currentKitchen.autoTiming === undefined) currentKitchen.autoTiming = true;
    if (currentKitchen.isOpen === undefined) currentKitchen.isOpen = true;
    if (!currentKitchen.openingTime) currentKitchen.openingTime = "09:00";
    if (!currentKitchen.closingTime) currentKitchen.closingTime = "21:00";
    
    const autoRadio = document.getElementById('autoTimingRadio');
    const manualRadio = document.getElementById('manualTimingRadio');
    const openingTimeInput = document.getElementById('openingTime');
    const closingTimeInput = document.getElementById('closingTime');
    const kitchenOpenCheckbox = document.getElementById('kitchenOpenCheckbox');
    const manualSection = document.getElementById('manualTimingSection');
    
    if (autoRadio && manualRadio) {
        autoRadio.checked = currentKitchen.autoTiming;
        manualRadio.checked = !currentKitchen.autoTiming;
    }
    
    if (openingTimeInput) openingTimeInput.value = currentKitchen.openingTime;
    if (closingTimeInput) closingTimeInput.value = currentKitchen.closingTime;
    if (kitchenOpenCheckbox) {
        kitchenOpenCheckbox.checked = currentKitchen.isOpen;
        kitchenOpenCheckbox.disabled = false;
    }
    
    if (manualSection) {
        manualSection.style.display = currentKitchen.autoTiming ? 'none' : 'block';
    }
    
    syncKitchenToGlobal();
    
    if (currentKitchen.autoTiming) {
        checkAutoTiming();
    } else {
        updateKitchenAvailabilityBasedOnTime();
    }
    
    updateKitchenStatusDisplay();
}

function syncKitchenToGlobal() {
    if (!currentKitchen) return;
    
    const kitchenIndex = kitchens.findIndex(k => k.id === currentKitchen.id);
    if (kitchenIndex !== -1) {
        kitchens[kitchenIndex] = { ...kitchens[kitchenIndex], ...currentKitchen };
    }
}

function validateTimingSettings(openingTime, closingTime) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
        showToast('Please enter valid time format (HH:MM)', 'error');
        return false;
    }
    
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    if (openMinutes >= closeMinutes) {
        showToast('Opening time must be before closing time', 'error');
        return false;
    }
    
    return true;
}

function updateKitchenAvailabilityBasedOnTime() {
    if (!currentKitchen || currentKitchen.autoTiming) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    const [openHour, openMin] = currentKitchen.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = currentKitchen.closingTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    const shouldBeOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    
    if (currentKitchen.isOpen !== shouldBeOpen) {
        currentKitchen.isOpen = shouldBeOpen;
        
        const checkbox = document.getElementById('kitchenOpenCheckbox');
        if (checkbox) checkbox.checked = currentKitchen.isOpen;
        
        syncKitchenToGlobal();
    }
}/
/ ===== MOTHER DASHBOARD FUNCTIONS =====
function loadMotherOrders() {
    const list = document.getElementById('motherOrderList');
    if (!list) return;
    
    list.innerHTML = '';
    
    const myOrders = ordersDB.filter(o => 
        o.kitchenId === currentKitchen.id && 
        ![ORDER_STATUSES.DELIVERED, ORDER_STATUSES.REFUNDED, ORDER_STATUSES.CANCELLED].includes(o.status)
    );

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-state">No active orders right now.</p>';
        return;
    }

    myOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = `order-card ${order.status.toLowerCase().replace(/ /g, '-')}`;
        
        let actionButtons = '';
        if (order.status === ORDER_STATUSES.PENDING) {
            actionButtons = `
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.ACCEPTED}')">Accept ✅</button>
                <button class="btn-action decline" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.DECLINED}')">Decline ❌</button>
            `;
        }
        
        div.innerHTML = `
            <div class="order-header">
                <strong>From: ${order.studentName}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                ${formatItemsDisplay(order.items)}
            </div>
            ${order.note ? `<div class="order-note">"${order.note}"</div>` : ''}
            <div class="order-actions">
                ${actionButtons}
            </div>
        `;
        list.appendChild(div);
    });
}

function loadMotherMenuTable() {
    const list = document.getElementById('myMenuList');
    if (!list) return;
    
    list.innerHTML = '';
    const items = menuDB.filter(i => i.kitchenId === currentKitchen.id);
    
    if (items.length === 0) {
        list.innerHTML = '<li class="empty-state">No items added yet.</li>';
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.name}</span> <span>₹${item.price}</span>`;
        list.appendChild(li);
    });
}

function addMyMenuItem() {
    const name = document.getElementById('newItemName').value;
    const price = document.getElementById('newItemPrice').value;
    const cat = document.getElementById('newItemCategory').value;

    if (name && price) {
        menuDB.push({
            id: Date.now(),
            kitchenId: currentKitchen.id,
            name: name,
            price: parseInt(price),
            category: cat,
            image: getImg(name)
        });
        loadMotherMenuTable();
        
        // Clear inputs
        document.getElementById('newItemName').value = '';
        document.getElementById('newItemPrice').value = '';
        
        showToast(`${name} added to menu successfully!`, 'success');
    } else {
        showToast('Please enter item name and price', 'error');
    }
}

// ===== ORDER MANAGEMENT =====
function updateOrderStatus(orderId, status) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toLocaleString();
        
        if (!order.trackingHistory) {
            order.trackingHistory = [];
        }
        order.trackingHistory.push({
            status: status,
            timestamp: new Date().toLocaleString(),
            message: getStatusMessage(status)
        });
        
        loadMotherOrders();
        showToast(`Order #${orderId} ${status.toLowerCase()}`, 'success');
    }
}

function getStatusMessage(status) {
    const messages = {
        [ORDER_STATUSES.PENDING]: 'Order placed and waiting for confirmation',
        [ORDER_STATUSES.ACCEPTED]: 'Order accepted by the cook',
        [ORDER_STATUSES.PREPARING]: 'Your food is being prepared',
        [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Order is on the way',
        [ORDER_STATUSES.DELIVERED]: 'Order delivered successfully',
        [ORDER_STATUSES.DECLINED]: 'Order declined by the cook'
    };
    return messages[status] || status;
}

function formatItemsDisplay(items) {
    const grouped = groupItemsByName(items);
    return grouped.map(item => {
        let display = item.name;
        if (item.quantity > 1) {
            display += ` x${item.quantity}`;
        }
        return display;
    }).join(', ');
}

function groupItemsByName(items) {
    const grouped = {};
    items.forEach(item => {
        const key = item.name;
        if (!grouped[key]) {
            grouped[key] = {
                name: item.name,
                price: item.price,
                quantity: 0,
                totalPrice: 0,
                notes: []
            };
        }
        grouped[key].quantity += 1;
        grouped[key].totalPrice += item.price;
        if (item.note && item.note.trim()) {
            grouped[key].notes.push(item.note);
        }
    });
    return Object.values(grouped);
}// =====
 STUDENT DASHBOARD FUNCTIONS =====
function renderKitchensList() {
    document.getElementById('kitchens-list-view').classList.remove('hidden');
    document.getElementById('single-kitchen-view').classList.add('hidden');
    
    const grid = document.getElementById('kitchensGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    kitchens.forEach(k => {
        const div = document.createElement('div');
        div.className = 'kitchen-card';
        
        const canOrder = k.isOpen && isKitchenCurrentlyOpen(k);
        
        if (canOrder) {
            div.onclick = () => openKitchen(k.id);
        } else {
            div.style.opacity = '0.6';
            div.style.cursor = 'not-allowed';
            div.onclick = () => {
                showToast('This kitchen is currently closed. Please try again during operating hours.', 'warning');
            };
        }
        
        const statusBadge = canOrder
            ? '<span style="color: #4CAF50; font-weight: bold;">● Open</span>' 
            : '<span style="color: #d32f2f; font-weight: bold;">● Closed</span>';
        
        const timingInfo = k.autoTiming 
            ? 'Auto (9 AM - 9 PM)'
            : `${k.openingTime} - ${k.closingTime}`;
        
        div.innerHTML = `
            <div class="kitchen-img-box"><img src="${k.image}"></div>
            <div class="kitchen-info">
                <h3>${k.name}</h3>
                <p>${k.specialty}</p>
                <p style="font-size: 0.85rem;">${statusBadge} ${timingInfo}</p>
            </div>
        `;
        grid.appendChild(div);
    });
}

function isKitchenCurrentlyOpen(kitchen) {
    if (!kitchen.isOpen) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    if (kitchen.autoTiming) {
        return currentHour >= 9 && currentHour < 21;
    } else {
        const [openHour, openMin] = kitchen.openingTime.split(':').map(Number);
        const [closeHour, closeMin] = kitchen.closingTime.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }
}

function openKitchen(id) {
    activeKitchenId = id;
    const k = kitchens.find(x => x.id === id);
    document.getElementById('activeKitchenName').innerText = k.name;
    document.getElementById('kitchens-list-view').classList.add('hidden');
    document.getElementById('single-kitchen-view').classList.remove('hidden');
    filterMenu('breakfast');
}

function backToKitchens() {
    document.getElementById('kitchens-list-view').classList.remove('hidden');
    document.getElementById('single-kitchen-view').classList.add('hidden');
    activeKitchenId = null;
}

function filterMenu(cat) {
    activeCategory = cat;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    const container = document.getElementById('studentMenuList');
    if (!container) return;
    
    container.innerHTML = '';
    const items = menuDB.filter(i => i.kitchenId === activeKitchenId && i.category === activeCategory);
    
    if (items.length === 0) {
        container.innerHTML = '<p class="empty-state">No items listed for this time.</p>';
        return;
    }
    
    items.forEach(i => {
        const div = document.createElement('div');
        div.className = 'food-card';
        div.innerHTML = `
            <div class="food-img-container"><img src="${i.image}"></div>
            <div class="food-details">
                <h4>${i.name}</h4>
                <span class="price">₹${i.price}</span>
                <button class="btn btn-primary btn-small full-width" onclick="openModal(${i.id})">Add</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// ===== CART FUNCTIONS =====
function openModal(id) {
    tempItem = menuDB.find(i => i.id === id);
    tempQuantity = 1;
    document.getElementById('modalFoodName').innerText = tempItem.name;
    document.getElementById('modalPrice').innerText = tempItem.price;
    document.getElementById('itemQuantity').value = 1;
    document.getElementById('customNote').value = '';
    updateModalTotal();
    document.getElementById('customModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('customModal').style.display = 'none';
    tempQuantity = 1;
}

function increaseQuantity() {
    const input = document.getElementById('itemQuantity');
    if (parseInt(input.value) < 10) {
        input.value = parseInt(input.value) + 1;
        tempQuantity = parseInt(input.value);
        updateModalTotal();
    }
}

function decreaseQuantity() {
    const input = document.getElementById('itemQuantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        tempQuantity = parseInt(input.value);
        updateModalTotal();
    }
}

function updateModalTotal() {
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const total = tempItem.price * quantity;
    document.getElementById('modalTotal').innerText = `₹${total}`;
}

function confirmAddToCart() {
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const note = document.getElementById('customNote').value;
    
    for (let i = 0; i < quantity; i++) {
        cart.push({ ...tempItem, note: note, quantity: 1 });
    }
    
    updateCart();
    closeModal();
    showToast(`Added ${quantity} x ${tempItem.name} to cart!`, 'success');
}

function updateCart() {
    const list = document.getElementById('cartList');
    if (!list) return;
    
    list.innerHTML = '';
    let total = 0;
    
    const groupedItems = groupItemsByName(cart);
    
    if (cart.length === 0) {
        list.innerHTML = '<li class="empty-state">Plate is empty</li>';
    } else {
        groupedItems.forEach(group => {
            const li = document.createElement('li');
            const displayName = group.quantity > 1 ? `${group.name} x${group.quantity}` : group.name;
            const priceDisplay = group.quantity > 1 ? `₹${group.price} each = ₹${group.totalPrice}` : `₹${group.totalPrice}`;
            li.innerHTML = `
                <span>${displayName}</span>
                <span class="price">${priceDisplay}</span>
                <button class="remove-btn" onclick="removeItemGroup('${group.name}')">×</button>
            `;
            list.appendChild(li);
            total += group.totalPrice;
        });
    }
    
    document.getElementById('cartTotal').innerText = total;
    document.getElementById('cart-count').innerText = cart.length;
}

function removeItemGroup(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    updateCart();
    showToast(`Removed ${itemName} from cart`, 'info');
}

function placeOrder() {
    if (cart.length === 0) {
        showToast("Empty Cart!", 'error');
        return;
    }
    showScreen('checkout');
    loadCheckout();
}

function loadCheckout() {
    const itemsDiv = document.getElementById('checkoutItems');
    if (!itemsDiv) return;
    
    itemsDiv.innerHTML = '';
    
    const groupedItems = groupItemsByName(cart);
    groupedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-line';
        const displayName = item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
        const priceDisplay = item.quantity > 1 ? `₹${item.price} each = ₹${item.totalPrice}` : `₹${item.totalPrice}`;
        div.innerHTML = `<span>${displayName}</span> <span>${priceDisplay}</span>`;
        itemsDiv.appendChild(div);
    });

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = 50;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + tax;

    document.getElementById('checkoutSubtotal').innerText = subtotal;
    document.getElementById('checkoutDelivery').innerText = deliveryFee;
    document.getElementById('checkoutTax').innerText = tax;
    document.getElementById('checkoutTotal').innerText = total;
}

function backToCart() {
    showScreen('student-dashboard');
}

function confirmPayment() {
    const name = document.getElementById('deliveryName').value;
    const phone = document.getElementById('deliveryPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    const cardNumber = document.getElementById('cardNumber').value;

    if (!name || !phone || !address || !cardNumber) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = 50;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + tax;

    const order = {
        id: Date.now(),
        studentName: currentUser.name,
        kitchenId: activeKitchenId,
        items: [...cart],
        total: total,
        status: ORDER_STATUSES.PENDING,
        deliveryAddress: { name, phone, address },
        paymentMethod: `**** **** **** ${cardNumber.slice(-4)}`,
        createdAt: new Date().toLocaleString(),
        trackingHistory: [{
            status: ORDER_STATUSES.PENDING,
            timestamp: new Date().toLocaleString(),
            message: 'Order placed and waiting for confirmation'
        }]
    };

    ordersDB.push(order);
    cart = [];
    updateCart();

    showToast('Order placed successfully! 🎉', 'success');
    showScreen('student-dashboard');
    renderKitchensList();
}// ==
=== UTILITY FUNCTIONS =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleNotifications() {
    const d = document.getElementById('notif-dropdown');
    if (d) d.classList.toggle('hidden');
}

function scrollToCart() { 
    const cartAnchor = document.getElementById('cart-anchor');
    if (cartAnchor) cartAnchor.scrollIntoView({behavior:'smooth'}); 
}

function updateNotificationBadge() {
    const myOrders = ordersDB.filter(o => o.studentName === currentUser.name && o.status !== 'Pending');
    const badge = document.getElementById('notif-badge');
    if (badge) {
        badge.innerText = myOrders.length;
        badge.style.display = myOrders.length > 0 ? 'inline' : 'none';
    }
}

// ===== ORDER HISTORY FUNCTIONS =====
function loadMotherOrderHistory() {
    const list = document.getElementById('motherHistoryList');
    if (!list) return;
    
    list.innerHTML = '';
    const myOrders = ordersDB.filter(o => o.kitchenId === currentKitchen.id);

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-state">No orders in history.</p>';
        return;
    }

    myOrders.sort((a, b) => b.id - a.id);
    myOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = `order-card ${order.status.toLowerCase().replace(/ /g, '-')}`;
        
        div.innerHTML = `
            <div class="order-header">
                <strong>Order #${order.id}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                <strong>From:</strong> ${order.studentName}<br>
                <strong>Items:</strong> ${formatItemsDisplay(order.items)}<br>
                <strong>Status:</strong> ${order.status}
            </div>
        `;
        list.appendChild(div);
    });
}

function loadStudentOrderHistory() {
    const list = document.getElementById('studentHistoryList');
    if (!list) return;
    
    list.innerHTML = '';
    const myOrders = ordersDB.filter(o => o.studentName === currentUser.name);

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-state">No orders in history.</p>';
        return;
    }

    myOrders.sort((a, b) => b.id - a.id);
    myOrders.forEach(order => {
        const kitchen = kitchens.find(k => k.id === order.kitchenId);
        const div = document.createElement('div');
        div.className = `order-card ${order.status.toLowerCase().replace(/ /g, '-')}`;
        
        div.innerHTML = `
            <div class="order-header">
                <strong>Order #${order.id}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                <strong>Kitchen:</strong> ${kitchen ? kitchen.name : 'Unknown'}<br>
                <strong>Items:</strong> ${formatItemsDisplay(order.items)}<br>
                <strong>Status:</strong> ${order.status}
            </div>
        `;
        list.appendChild(div);
    });
}

// ===== ADMIN FUNCTIONS =====
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    
    const targetSection = document.getElementById(`admin-${section}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

function loadAdminDashboard() {
    console.log('Loading admin dashboard...');
}

function openSupportForm() {
    const modal = document.getElementById('supportFormModal');
    if (modal) modal.style.display = 'flex';
}

function closeSupportForm() {
    const modal = document.getElementById('supportFormModal');
    if (modal) modal.style.display = 'none';
}

function submitSupportTicket(event) {
    event.preventDefault();
    
    const subject = document.getElementById('supportSubject').value.trim();
    const description = document.getElementById('supportDescription').value.trim();
    
    if (!subject || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    showToast('Support ticket submitted successfully!', 'success');
    closeSupportForm();
}

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Maa Ka Pyaar application initialized');
    
    // Set up periodic timing check
    setInterval(() => {
        if (currentKitchen && currentKitchen.autoTiming) {
            checkAutoTiming();
        }
        
        kitchens.forEach(kitchen => {
            if (kitchen.autoTiming) {
                const now = new Date();
                const currentHour = now.getHours();
                const shouldBeOpen = currentHour >= 9 && currentHour < 21;
                
                if (kitchen.isOpen !== shouldBeOpen) {
                    kitchen.isOpen = shouldBeOpen;
                }
            }
        });
        
        if (currentUser.role === 'student' && document.getElementById('kitchens-list-view') && !document.getElementById('kitchens-list-view').classList.contains('hidden')) {
            renderKitchensList();
        }
    }, 60000);
});

console.log('✅ Maa Ka Pyaar script loaded successfully');// 
===== MISSING FUNCTIONS =====
function closeSupportModal() {
    const modal = document.getElementById('supportTicketModal');
    if (modal) modal.style.display = 'none';
}

function respondToTicket() {
    showToast('Response sent successfully!', 'success');
    closeSupportModal();
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Make all functions globally available
window.goToLogin = goToLogin;
window.handleLogin = handleLogin;
window.showScreen = showScreen;
window.logout = logout;
window.saveKitchenProfile = saveKitchenProfile;
window.resetProfileForm = resetProfileForm;
window.setTimingMode = setTimingMode;
window.toggleKitchenStatus = toggleKitchenStatus;
window.saveKitchenTiming = saveKitchenTiming;
window.resetTimingToDefaults = resetTimingToDefaults;
window.addMyMenuItem = addMyMenuItem;
window.renderKitchensList = renderKitchensList;
window.openKitchen = openKitchen;
window.backToKitchens = backToKitchens;
window.filterMenu = filterMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.confirmAddToCart = confirmAddToCart;
window.removeItemGroup = removeItemGroup;
window.placeOrder = placeOrder;
window.backToCart = backToCart;
window.confirmPayment = confirmPayment;
window.toggleNotifications = toggleNotifications;
window.scrollToCart = scrollToCart;
window.showAdminSection = showAdminSection;
window.openSupportForm = openSupportForm;
window.closeSupportForm = closeSupportForm;
window.submitSupportTicket = submitSupportTicket;
window.closeSupportModal = closeSupportModal;
window.respondToTicket = respondToTicket;
window.updateOrderStatus = updateOrderStatus;
window.previewImage = previewImage;