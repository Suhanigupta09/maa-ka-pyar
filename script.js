/* ================================================================================
   MAA KA PYAAR - JAVASCRIPT FILE
   Student Project - BCA 3rd Semester
   Simple, Clean, and Easy to Understand
   ================================================================================ */

/* ===== PART 1: GLOBAL VARIABLES (Application State) ===== */

// Current User Information
let currentUser = {
    name: '',           // User's name
    role: '',           // 'student' or 'mother'
    mobile: ''          // Mobile number
};

// Selected Kitchen (when student browses a kitchen)
let selectedKitchen = null;

// Current Category Filter (breakfast, lunch, snacks, dinner)
let currentCategory = 'breakfast';

// Shopping Cart Array - stores items added by student
let shoppingCart = [];

// Orders Database - stores all orders placed
let ordersDatabase = [];

// Counter for generating unique order IDs
let orderIdCounter = 1;

// Order lifecycle for basic tracking
const ORDER_STEPS = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
const ORDER_STEP_LABELS = {
    pending: 'Pending',
    accepted: 'Accepted',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    rejected: 'Rejected'
};

/* ===== PART 2: MOCK DATA (Sample Kitchens and Menus) ===== */

// List of Available Kitchens
let kitchens = [
    {
        id: 1,
        name: "Suman's Kitchen",
        ownerName: "Suman",
        specialty: "North Indian Home Food",
        rating: 4.8,
        icon: "👩‍🍳",
        address: "Sector 14, Near City Park",
        distanceKm: 2.1,
        avgDeliveryMins: 28,
        openTime: "09:00",
        closeTime: "21:00",
        isOnline: true,
        tags: ['Dal Rice', 'Paratha', 'Comfort Food']
    },
    {
        id: 2,
        name: "Radha's Rasoi",
        ownerName: "Radha",
        specialty: "Gujarati Cuisine",
        rating: 4.5,
        icon: "🍛",
        address: "Vijay Nagar, Opp. Market Road",
        distanceKm: 3.4,
        avgDeliveryMins: 32,
        openTime: "08:30",
        closeTime: "20:30",
        isOnline: true,
        tags: ['Thepla', 'Farsan', 'Sweet Tooth']
    },
    {
        id: 3,
        name: "Priya's Kitchen",
        ownerName: "Priya",
        specialty: "South Indian Food",
        rating: 4.9,
        icon: "🍲",
        address: "MG Road, Near Metro Station",
        distanceKm: 1.6,
        avgDeliveryMins: 24,
        openTime: "07:30",
        closeTime: "22:00",
        isOnline: true,
        tags: ['Idli', 'Dosa', 'Filter Coffee']
    }
];

// Menu Items Database - Each item belongs to a kitchen and category
let menuItems = [
    // Kitchen 1 - Suman's Kitchen
    { kitchenId: 1, category: 'breakfast', name: 'Poha', price: 30, icon: '🍚' },
    { kitchenId: 1, category: 'breakfast', name: 'Paratha', price: 40, icon: '🫓' },
    { kitchenId: 1, category: 'lunch', name: 'Dal Rice', price: 60, icon: '🍛' },
    { kitchenId: 1, category: 'lunch', name: 'Rajma Chawal', price: 70, icon: '🍲' },
    { kitchenId: 1, category: 'snacks', name: 'Samosa', price: 20, icon: '🥟' },
    { kitchenId: 1, category: 'dinner', name: 'Roti Sabji', price: 50, icon: '🍽️' },
    
    // Kitchen 2 - Radha's Rasoi
    { kitchenId: 2, category: 'breakfast', name: 'Dhokla', price: 35, icon: '🧈' },
    { kitchenId: 2, category: 'lunch', name: 'Gujarati Thali', price: 100, icon: '🍱' },
    { kitchenId: 2, category: 'snacks', name: 'Khaman', price: 30, icon: '🧀' },
    { kitchenId: 2, category: 'dinner', name: 'Kadhi Rice', price: 65, icon: '🍜' },
    
    // Kitchen 3 - Priya's Kitchen
    { kitchenId: 3, category: 'breakfast', name: 'Idli Sambhar', price: 40, icon: '🥘' },
    { kitchenId: 3, category: 'breakfast', name: 'Dosa', price: 45, icon: '🫔' },
    { kitchenId: 3, category: 'lunch', name: 'Rice Plate', price: 70, icon: '🍚' },
    { kitchenId: 3, category: 'snacks', name: 'Vada', price: 25, icon: '🍩' },
    { kitchenId: 3, category: 'dinner', name: 'Uttapam', price: 50, icon: '🥞' }
];

/* ===== PART 3: UTILITY FUNCTIONS ===== */

/**
 * Shows a screen and hides all others
 * @param {string} screenId - ID of screen to show (without '-screen' suffix)
 */
function showScreen(screenId) {
    // Remove 'active' class from all screens
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => screen.classList.remove('active'));
    
    // Add 'active' class to target screen
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Switched to screen:', screenId);
        if (screenId === 'mother-dashboard' && currentUser.role === 'mother') {
            loadMotherKitchenDetails();
            loadMotherMenu();
            loadMotherOrders();
        }
    } else {
        console.error('Screen not found:', screenId);
    }
}

/**
 * Shows a toast notification message
 * @param {string} message - Message to display
 */
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Formats date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Converts 24h time string to 12h format
 */
function formatTimeRange(open, close) {
    const toPretty = (t) => {
        const [h, m] = t.split(':').map(Number);
        const hours12 = ((h + 11) % 12) + 1;
        const suffix = h >= 12 ? 'PM' : 'AM';
        return `${hours12}:${m.toString().padStart(2, '0')} ${suffix}`;
    };
    return `${toPretty(open)} - ${toPretty(close)}`;
}

/**
 * Checks if current time falls within kitchen hours
 */
function isWithinKitchenHours(kitchen) {
    const now = new Date();
    const [openH, openM] = kitchen.openTime.split(':').map(Number);
    const [closeH, closeM] = kitchen.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

/**
 * Checks if kitchen is currently open (online + within hours)
 */
function isKitchenOpen(kitchen) {
    if (kitchen.isOnline === false) return false;
    return isWithinKitchenHours(kitchen);
}

function getStatusClass(status) {
    const slug = status.replace(/\s+/g, '-').toLowerCase();
    return `status-${slug}`;
}

/* ===== PART 4: AUTHENTICATION FUNCTIONS ===== */

/**
 * Handles role selection on landing page
 * @param {string} role - 'student' or 'mother'
 */
function selectRole(role) {
    currentUser.role = role;
    
    // Update login screen title based on role
    const loginTitle = document.getElementById('login-title');
    if (role === 'student') {
        loginTitle.textContent = '🧑‍💻 Student Login';
    } else if (role === 'mother') {
        loginTitle.textContent = '👩‍🍳 Mother Login';
    }
    
    // Show login screen
    showScreen('login');
}

/**
 * Handles login form submission
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault(); // Prevent form from refreshing page
    
    // Get form values
    const name = document.getElementById('userName').value.trim();
    const mobile = document.getElementById('userMobile').value.trim();
    
    // Validate inputs
    if (!name || !mobile) {
        showToast('⚠️ Please fill in all fields');
        return;
    }
    
    if (mobile.length !== 10) {
        showToast('⚠️ Mobile number must be 10 digits');
        return;
    }
    
    // Store user data
    currentUser.name = name;
    currentUser.mobile = mobile;
    
    // Navigate to appropriate dashboard
    if (currentUser.role === 'student') {
        showScreen('student-dashboard');
        loadKitchensList();
        updateCartBadge();
    } else if (currentUser.role === 'mother') {
        // Update mother's name in dashboard
        document.getElementById('mother-name').textContent = name;
        showScreen('mother-dashboard');
        loadMotherKitchenDetails();
        loadMotherMenu();
        loadMotherOrders();
    }
    
    showToast('✅ Welcome ' + name + '!');
}

/**
 * Logs out current user and returns to landing page
 */
function logout() {
    // Clear user data
    currentUser = { name: '', role: '', mobile: '' };
    selectedKitchen = null;
    shoppingCart = [];
    
    // Reset form
    document.getElementById('login-form').reset();
    
    // Return to landing page
    showScreen('landing');
    showToast('👋 Logged out successfully');
}

/* ===== PART 5: STUDENT DASHBOARD FUNCTIONS ===== */

/**
 * Loads and displays list of available kitchens
 */
function loadKitchensList() {
    const container = document.getElementById('kitchens-container');
    container.innerHTML = ''; // Clear existing content
    
    kitchens.forEach(kitchen => {
        const isOnline = kitchen.isOnline !== false;
        const withinHours = isWithinKitchenHours(kitchen);
        const isOpen = isOnline && withinHours;
        const statusLabel = !isOnline ? 'Offline' : isOpen ? 'Open Now' : 'Closed';
        const hours = formatTimeRange(kitchen.openTime, kitchen.closeTime);
        const card = document.createElement('div');
        card.className = 'kitchen-card';
        card.onclick = () => selectKitchen(kitchen.id);
        
        card.innerHTML = `
            <div class="kitchen-image">${kitchen.icon}</div>
            <div class="kitchen-details">
                <div class="kitchen-top-row">
                    <h3 class="kitchen-name">${kitchen.name}</h3>
                    <span class="chip ${isOpen ? 'chip-open' : 'chip-closed'}">${statusLabel}</span>
                </div>
                <p class="kitchen-specialty">${kitchen.specialty}</p>
                <div class="kitchen-meta-row">
                    <span>⏱️ ${kitchen.avgDeliveryMins} mins</span>
                    <span>📍 ${kitchen.distanceKm} km</span>
                    <span>🕒 ${hours}</span>
                </div>
                <div class="kitchen-tags">${kitchen.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                <span class="rating">⭐ ${kitchen.rating}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Selects a kitchen and shows its menu
 * @param {number} kitchenId - ID of kitchen to select
 */
function selectKitchen(kitchenId) {
    // Find kitchen by ID
    selectedKitchen = kitchens.find(k => k.id === kitchenId);
    
    if (!selectedKitchen) {
        showToast('⚠️ Kitchen not found');
        return;
    }
    
    // Hide kitchen list, show menu view
    document.getElementById('kitchen-list-view').classList.add('hidden');
    document.getElementById('menu-view').classList.remove('hidden');
    
    // Update kitchen info
    document.getElementById('selected-kitchen-name').textContent = selectedKitchen.name;
    document.getElementById('selected-kitchen-specialty').textContent = selectedKitchen.specialty;
    document.getElementById('selected-kitchen-rating').textContent = `⭐ ${selectedKitchen.rating}`;
    const hours = formatTimeRange(selectedKitchen.openTime, selectedKitchen.closeTime);
    const isOnline = selectedKitchen.isOnline !== false;
    const withinHours = isWithinKitchenHours(selectedKitchen);
    const isOpen = isOnline && withinHours;
    const openStatus = document.getElementById('kitchen-open-status');
    const hoursEl = document.getElementById('kitchen-hours');
    const distanceEl = document.getElementById('kitchen-distance');
    const etaEl = document.getElementById('kitchen-eta');
    const addressEl = document.getElementById('kitchen-address');
    const tagContainer = document.getElementById('kitchen-tags');

    if (openStatus) {
        const statusLabel = !isOnline ? 'Offline' : isOpen ? 'Open Now' : 'Closed';
        openStatus.textContent = statusLabel;
        openStatus.className = `chip ${isOpen ? 'chip-open' : 'chip-closed'}`;
    }
    if (hoursEl) hoursEl.textContent = hours;
    if (distanceEl) distanceEl.textContent = `${selectedKitchen.distanceKm} km away`;
    if (etaEl) etaEl.textContent = `${selectedKitchen.avgDeliveryMins} mins avg delivery`;
    if (addressEl) addressEl.textContent = selectedKitchen.address;
    if (tagContainer) tagContainer.innerHTML = (selectedKitchen.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Load menu for default category
    currentCategory = 'breakfast';
    updateActiveTab('breakfast');
    loadMenu();
}

/**
 * Goes back to kitchen list view
 */
function backToKitchens() {
    document.getElementById('menu-view').classList.add('hidden');
    document.getElementById('kitchen-list-view').classList.remove('hidden');
    selectedKitchen = null;
}

/**
 * Filters menu by category
 * @param {string} category - Category name (breakfast, lunch, snacks, dinner)
 */
function filterMenu(category) {
    currentCategory = category;
    updateActiveTab(category);
    loadMenu();
}

/**
 * Updates active state of category tabs
 * @param {string} activeCategory - Category to mark as active
 */
function updateActiveTab(activeCategory) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(activeCategory)) {
            tab.classList.add('active');
        }
    });
}

/**
 * Loads and displays menu items for selected kitchen and category
 */
function loadMenu() {
    const container = document.getElementById('menu-items-container');
    container.innerHTML = ''; // Clear existing items

    // Show notice if kitchen is closed
    if (!isKitchenOpen(selectedKitchen)) {
        const banner = document.createElement('div');
        banner.className = 'info-banner';
        const isOnline = selectedKitchen.isOnline !== false;
        banner.textContent = isOnline
            ? 'Kitchen is currently closed. You can still browse the menu and place a pre-order.'
            : 'Kitchen is offline right now. You can browse the menu and place a pre-order.';
        container.appendChild(banner);
    }
    
    // Filter items by kitchen and category
    const items = menuItems.filter(item => 
        item.kitchenId === selectedKitchen.id && 
        item.category === currentCategory
    );
    
    if (items.length === 0) {
        container.innerHTML += '<p class="empty-message">No items available in this category</p>';
        return;
    }
    
    // Create card for each item
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card';
        
        card.innerHTML = `
            <div class="food-image">${item.icon}</div>
            <div class="food-info">
                <h4 class="food-name">${item.name}</h4>
                <p class="food-price">₹${item.price}</p>
                <button class="add-btn" onclick="addToCart('${item.name}', ${item.price})">
                    Add to Cart
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Adds an item to shopping cart
 * @param {string} itemName - Name of the item
 * @param {number} price - Price of the item
 */
function addToCart(itemName, price) {
    // Check if item already exists in cart
    const existingItem = shoppingCart.find(item => item.name === itemName);
    
    if (existingItem) {
        // Increase quantity
        existingItem.quantity += 1;
    } else {
        // Add new item
        shoppingCart.push({
            name: itemName,
            price: price,
            quantity: 1,
            kitchenName: selectedKitchen.name,
            kitchenOwner: selectedKitchen.ownerName
        });
    }
    
    updateCartDisplay();
    updateCartBadge();
    showToast(`✅ ${itemName} added to cart`);
}

/**
 * Removes an item from cart
 * @param {number} index - Index of item in cart array
 */
function removeFromCart(index) {
    const item = shoppingCart[index];
    shoppingCart.splice(index, 1);
    
    updateCartDisplay();
    updateCartBadge();
    showToast(`🗑️ ${item.name} removed from cart`);
}

/**
 * Updates cart display with current items
 */
function updateCartDisplay() {
    const container = document.getElementById('cart-items-list');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // If cart is empty
    if (shoppingCart.length === 0) {
        container.innerHTML = '<p class="empty-message">Your cart is empty</p>';
        placeOrderBtn.disabled = true;
        document.getElementById('cart-item-count').textContent = '0';
        document.getElementById('cart-total').textContent = '0';
        return;
    }
    
    // Display cart items
    container.innerHTML = '';
    let total = 0;
    let itemCount = 0;
    
    shoppingCart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;
        
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-qty">Qty: ${item.quantity}</div>
            </div>
            <span class="cart-item-price">₹${itemTotal}</span>
            <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
        `;
        
        container.appendChild(itemDiv);
    });
    
    // Update totals
    document.getElementById('cart-item-count').textContent = itemCount;
    document.getElementById('cart-total').textContent = total;
    placeOrderBtn.disabled = false;
}

/**
 * Updates cart badge count
 */
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const itemCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = itemCount;
}

/**
 * Toggles cart sidebar visibility on mobile
 */
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('show-mobile');
}

function clearOrderTimers(order) {
    if (order._timers) {
        order._timers.forEach(id => clearTimeout(id));
        order._timers = [];
    }
}

function startOrderTracking(order, startIndex = 0) {
    clearOrderTimers(order);
    order._timers = [];
    const remaining = ORDER_STEPS.slice(startIndex + 1);
    remaining.forEach((step, idx) => {
        const timerId = setTimeout(() => {
            if (order.status === 'rejected') return;
            order.status = step;
            order.statusIndex = ORDER_STEPS.indexOf(step);
            order.stepHistory.push({ step, time: new Date() });
            refreshOrderViews();
        }, (idx + 1) * 4000); // every 4 seconds for demo
        order._timers.push(timerId);
    });
}

function refreshOrderViews() {
    loadStudentOrders();
    loadMotherOrders();
    loadMotherOrdersHistory();
}

function renderTimeline(order) {
    const activeIndex = ORDER_STEPS.indexOf(order.status);
    const stepsHtml = ORDER_STEPS.map((step, idx) => {
        const isActive = idx <= activeIndex;
        return `
            <div class="timeline-step ${isActive ? 'step-active' : ''}">
                <div class="step-dot"></div>
                <span class="step-label">${ORDER_STEP_LABELS[step]}</span>
            </div>
        `;
    }).join('');
    return `<div class="order-timeline">${stepsHtml}</div>`;
}

/**
 * Places an order with current cart items
 */
function placeOrder() {
    if (shoppingCart.length === 0) {
        showToast('⚠️ Cart is empty');
        return;
    }
    
    // Calculate total
    const total = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order object
    const order = {
        id: orderIdCounter++,
        studentName: currentUser.name,
        studentMobile: currentUser.mobile,
        kitchenName: shoppingCart[0].kitchenName,
        kitchenOwner: shoppingCart[0].kitchenOwner,
        items: [...shoppingCart], // Copy cart items
        total: total,
        status: 'pending',
        statusIndex: 0,
        stepHistory: [{ step: 'pending', time: new Date() }],
        date: new Date()
    };
    
    // Add to orders database
    ordersDatabase.push(order);
    startOrderTracking(order, 0);
    refreshOrderViews();
    
    // Clear cart
    shoppingCart = [];
    updateCartDisplay();
    updateCartBadge();
    
    // Show success message
    showToast(`🎉 Order placed successfully! Total: ₹${total}`);
    
    // Refresh mother's dashboard if she's logged in
    if (currentUser.role === 'mother') {
        loadMotherOrders();
    }
}

/**
 * Loads student's order history
 */
function loadStudentOrders() {
    const container = document.getElementById('student-orders-list');
    
    // Filter orders for current student
    const studentOrders = ordersDatabase.filter(
        order => order.studentName === currentUser.name
    );
    
    if (studentOrders.length === 0) {
        container.innerHTML = '<p class="empty-message">No orders yet. Start ordering delicious food!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Display orders (newest first)
    studentOrders.reverse().forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Generate items list HTML
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `<div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>`;
        });
        
        // Status badge class
        const statusClass = getStatusClass(order.status);
        const statusText = ORDER_STEP_LABELS[order.status] || order.status;
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <div class="order-from">From: ${order.kitchenName}</div>
                <div class="order-items-list">${itemsHTML}</div>
                <div class="order-total">Total: ₹${order.total}</div>
            </div>
            ${renderTimeline(order)}
        `;
        
        container.appendChild(card);
    });
}

/* ===== PART 6: MOTHER DASHBOARD FUNCTIONS ===== */

function getOrCreateMotherKitchen() {
    let kitchen = kitchens.find(k => k.ownerName === currentUser.name);
    if (!kitchen) {
        kitchen = {
            id: kitchens.length + 1,
            name: currentUser.name + "'s Kitchen",
            ownerName: currentUser.name,
            specialty: 'Home Food',
            rating: 5.0,
            icon: '👩‍🍳',
            address: 'Local Area',
            distanceKm: 1.5,
            avgDeliveryMins: 30,
            openTime: '09:00',
            closeTime: '21:00',
            isOnline: true,
            tags: ['Home Style']
        };
        kitchens.push(kitchen);
    }
    if (!Array.isArray(kitchen.tags)) kitchen.tags = [];
    if (kitchen.isOnline === undefined) kitchen.isOnline = true;
    return kitchen;
}

function loadMotherKitchenDetails() {
    const kitchen = getOrCreateMotherKitchen();
    const nameEl = document.getElementById('mother-kitchen-name');
    const specialtyEl = document.getElementById('mother-kitchen-specialty');
    const addressEl = document.getElementById('mother-kitchen-address');
    const distanceEl = document.getElementById('mother-kitchen-distance');
    const etaEl = document.getElementById('mother-kitchen-eta');
    const openEl = document.getElementById('mother-kitchen-open');
    const closeEl = document.getElementById('mother-kitchen-close');
    const tagsEl = document.getElementById('mother-kitchen-tags');
    const onlineEl = document.getElementById('mother-kitchen-online');

    if (nameEl) nameEl.value = kitchen.name || '';
    if (specialtyEl) specialtyEl.value = kitchen.specialty || '';
    if (addressEl) addressEl.value = kitchen.address || '';
    if (distanceEl) distanceEl.value = kitchen.distanceKm || '';
    if (etaEl) etaEl.value = kitchen.avgDeliveryMins || '';
    if (openEl) openEl.value = kitchen.openTime || '09:00';
    if (closeEl) closeEl.value = kitchen.closeTime || '21:00';
    if (tagsEl) tagsEl.value = (kitchen.tags || []).join(', ');
    if (onlineEl) onlineEl.checked = kitchen.isOnline !== false;
}

function saveKitchenDetails(event) {
    event.preventDefault();
    const kitchen = getOrCreateMotherKitchen();
    const name = document.getElementById('mother-kitchen-name').value.trim();
    const specialty = document.getElementById('mother-kitchen-specialty').value.trim();
    const address = document.getElementById('mother-kitchen-address').value.trim();
    const distance = parseFloat(document.getElementById('mother-kitchen-distance').value);
    const eta = parseInt(document.getElementById('mother-kitchen-eta').value, 10);
    const openTime = document.getElementById('mother-kitchen-open').value || '09:00';
    const closeTime = document.getElementById('mother-kitchen-close').value || '21:00';
    const tagsRaw = document.getElementById('mother-kitchen-tags').value;
    const isOnline = document.getElementById('mother-kitchen-online').checked;

    kitchen.name = name || kitchen.name;
    kitchen.specialty = specialty || kitchen.specialty;
    kitchen.address = address || kitchen.address;
    if (!isNaN(distance)) kitchen.distanceKm = distance;
    if (!isNaN(eta)) kitchen.avgDeliveryMins = eta;
    kitchen.openTime = openTime;
    kitchen.closeTime = closeTime;
    kitchen.isOnline = isOnline;
    kitchen.tags = tagsRaw
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

    showToast('✅ Kitchen details updated');
    loadKitchensList();
    loadMotherMenu();
    loadMotherOrders();
}

/**
 * Loads mother's menu items
 */
function loadMotherMenu() {
    const container = document.getElementById('mother-menu-list');
    
    // Filter menu items for current mother
    const motherItems = menuItems.filter(item => {
        const kitchen = kitchens.find(k => k.id === item.kitchenId);
        return kitchen && kitchen.ownerName === currentUser.name;
    });
    
    if (motherItems.length === 0) {
        container.innerHTML = '<p class="empty-message">No items added yet</p>';
        return;
    }
    
    container.innerHTML = '';
    
    motherItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        
        itemDiv.innerHTML = `
            <div class="menu-item-info">
                <h4>${item.icon} ${item.name}</h4>
                <span class="menu-item-category">${item.category}</span>
            </div>
            <span class="menu-item-price">₹${item.price}</span>
            <button class="delete-btn" onclick="deleteMenuItem(${item.kitchenId}, '${item.name}')">
                Delete
            </button>
        `;
        
        container.appendChild(itemDiv);
    });
}

/**
 * Adds a new menu item
 * @param {Event} event - Form submit event
 */
function addMenuItem(event) {
    event.preventDefault();
    
    // Get form values
    const category = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value.trim();
    const price = parseInt(document.getElementById('item-price').value);
    
    if (!name || !price) {
        showToast('⚠️ Please fill in all fields');
        return;
    }
    
    // Find or create kitchen for this mother
    const kitchen = getOrCreateMotherKitchen();
    
    // Add menu item
    const newItem = {
        kitchenId: kitchen.id,
        category: category,
        name: name,
        price: price,
        icon: getCategoryIcon(category)
    };
    
    menuItems.push(newItem);
    
    // Reset form
    document.getElementById('add-menu-form').reset();
    
    // Reload menu display
    loadMotherMenu();
    
    showToast(`✅ ${name} added to menu`);
}

/**
 * Deletes a menu item
 * @param {number} kitchenId - Kitchen ID
 * @param {string} itemName - Item name to delete
 */
function deleteMenuItem(kitchenId, itemName) {
    // Find and remove item
    const index = menuItems.findIndex(
        item => item.kitchenId === kitchenId && item.name === itemName
    );
    
    if (index !== -1) {
        menuItems.splice(index, 1);
        loadMotherMenu();
        showToast(`🗑️ ${itemName} deleted from menu`);
    }
}

/**
 * Gets icon based on category
 * @param {string} category - Food category
 * @returns {string} Icon emoji
 */
function getCategoryIcon(category) {
    const icons = {
        'breakfast': '🌅',
        'lunch': '🍱',
        'snacks': '🍪',
        'dinner': '🌙'
    };
    return icons[category] || '🍽️';
}

/**
 * Loads incoming orders for mother
 */
function loadMotherOrders() {
    const container = document.getElementById('mother-orders-list');
    
    // Filter active orders for this mother
    const incomingOrders = ordersDatabase.filter(
        order => order.kitchenOwner === currentUser.name && !['delivered','rejected'].includes(order.status)
    );
    
    if (incomingOrders.length === 0) {
        container.innerHTML = '<p class="empty-message">No new orders yet</p>';
        return;
    }
    
    container.innerHTML = '';
    
    incomingOrders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const statusClass = getStatusClass(order.status);
        const statusText = ORDER_STEP_LABELS[order.status] || order.status;
        
        // Generate items list HTML
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `<div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>`;
        });
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <div class="order-from">From: ${order.studentName} (${order.studentMobile})</div>
                <div class="order-items-list">${itemsHTML}</div>
                <div class="order-total">Total: ₹${order.total}</div>
            </div>
            ${renderTimeline(order)}
            ${order.status === 'pending' ? `
                <div class="order-actions">
                    <button class="btn btn-primary btn-sm" onclick="acceptOrder(${order.id})">✓ Accept</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectOrder(${order.id})">✕ Reject</button>
                </div>` : ''}
        `;
        
        container.appendChild(card);
    });
}

/**
 * Accepts an order
 * @param {number} orderId - Order ID
 */
function acceptOrder(orderId) {
    const order = ordersDatabase.find(o => o.id === orderId);
    if (order) {
        order.status = 'accepted';
        order.statusIndex = ORDER_STEPS.indexOf('accepted');
        order.stepHistory.push({ step: 'accepted', time: new Date() });
        startOrderTracking(order, order.statusIndex);
        refreshOrderViews();
        showToast('✅ Order accepted!');
    }
}

/**
 * Rejects an order
 * @param {number} orderId - Order ID
 */
function rejectOrder(orderId) {
    const order = ordersDatabase.find(o => o.id === orderId);
    if (order) {
        order.status = 'rejected';
        order.statusIndex = -1;
        order.stepHistory.push({ step: 'rejected', time: new Date() });
        clearOrderTimers(order);
        refreshOrderViews();
        showToast('❌ Order rejected');
    }
}

/**
 * Loads complete order history for mother
 */
function loadMotherOrdersHistory() {
    const container = document.getElementById('mother-orders-history');
    
    // Filter all orders for this mother
    const allOrders = ordersDatabase.filter(
        order => order.kitchenOwner === currentUser.name
    );
    
    if (allOrders.length === 0) {
        container.innerHTML = '<p class="empty-message">No orders yet</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Display orders (newest first)
    allOrders.reverse().forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Generate items list HTML
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `<div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>`;
        });
        
        // Status badge
        const statusClass = getStatusClass(order.status);
        const statusText = ORDER_STEP_LABELS[order.status] || order.status;
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <div class="order-from">From: ${order.studentName} (${order.studentMobile})</div>
                <div class="order-items-list">${itemsHTML}</div>
                <div class="order-total">Total: ₹${order.total}</div>
            </div>
            ${renderTimeline(order)}
        `;
        
        container.appendChild(card);
    });
}

/* ===== PART 7: EVENT LISTENERS AND INITIALIZATION ===== */

// Wait for DOM to load before executing
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Maa Ka Pyaar - Application Started');
    
    // Ensure landing screen is shown on load
    showScreen('landing');
    
    // Add event listener for screen-specific loading
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    // Screen became active - load its data
                    if (target.id === 'student-orders-screen') {
                        loadStudentOrders();
                    } else if (target.id === 'mother-orders-screen') {
                        loadMotherOrdersHistory();
                    }
                }
            }
        });
    });
    
    // Observe all screens
    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true });
    });
    
    console.log('✅ Application initialized successfully');
});

/* ===== END OF JAVASCRIPT FILE ===== */
