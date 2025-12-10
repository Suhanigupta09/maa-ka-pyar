// ===== FIREBASE INITIALIZATION =====
// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Maa Ka Pyaar application...');
    
    // Initialize Firebase
    if (typeof initializeFirebase === 'function') {
        const firebaseReady = initializeFirebase();
        if (firebaseReady) {
            console.log('✅ Firebase services ready');
            // TODO: Set up authentication state listener
            // TODO: Load initial data from Firestore
        } else {
            console.error('❌ Firebase initialization failed');
            alert('Unable to connect to database. Please check your internet connection and refresh the page.');
        }
    } else {
        console.warn('⚠️ Firebase config not loaded. Running in offline mode with mock data.');
    }
    
    // Set up periodic timing check (every minute)
    setInterval(() => {
        // Check auto timing for current kitchen
        if (currentKitchen && currentKitchen.autoTiming) {
            checkAutoTiming();
        }
        
        // Update all kitchens' timing status
        kitchens.forEach(kitchen => {
            if (kitchen.autoTiming) {
                const now = new Date();
                const currentHour = now.getHours();
                const shouldBeOpen = currentHour >= 9 && currentHour < 21;
                
                if (kitchen.isOpen !== shouldBeOpen) {
                    kitchen.isOpen = shouldBeOpen;
                    console.log(`Kitchen ${kitchen.name} auto-timing updated:`, shouldBeOpen ? 'Open' : 'Closed');
                }
            } else {
                // Check manual timing
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentMinutes = currentHour * 60 + currentMinute;
                
                const [openHour, openMin] = kitchen.openingTime.split(':').map(Number);
                const [closeHour, closeMin] = kitchen.closingTime.split(':').map(Number);
                
                const openMinutes = openHour * 60 + openMin;
                const closeMinutes = closeHour * 60 + closeMin;
                
                const shouldBeOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
                
                if (kitchen.isOpen !== shouldBeOpen) {
                    kitchen.isOpen = shouldBeOpen;
                    console.log(`Kitchen ${kitchen.name} manual timing updated:`, shouldBeOpen ? 'Open' : 'Closed');
                }
            }
        });
        
        // Refresh kitchen list if student is viewing it
        if (currentUser.role === 'student' && document.getElementById('kitchens-list-view') && !document.getElementById('kitchens-list-view').classList.contains('hidden')) {
            renderKitchensList();
        }
    }, 60000); // Check every minute
});

// ===== STATE MANAGEMENT =====
// Global state variables for managing application data



// Current logged-in user
let currentUser = { 
    name: '', 
    role: '',      // 'cook' or 'student'
    mobile: '' 
};

// Current kitchen for logged-in cook
let currentKitchen = null;

// Active kitchen being viewed by student
let activeKitchenId = null;

// Currently selected meal category filter
let activeCategory = 'breakfast';

// Shopping cart for current student
let cart = [];

// Global orders database
let ordersDB = [];

// Temporary item holder for modal operations
let tempItem = null;
let tempQuantity = 1;

// Bill generation data
let billsDB = [
    // Sample bill for demonstration
    {
        id: 'BILL-1001',
        orderId: 1001,
        customerName: 'Demo Student',
        customerPhone: '+91 9876543210',
        customerAddress: '123 College Street, University Area, City - 400001',
        kitchenName: "Suman's Kitchen",
        items: [
            {
                name: 'Aloo Paratha',
                quantity: 2,
                unitPrice: 60,
                totalPrice: 120,
                note: 'Extra butter please'
            },
            {
                name: 'Dal Makhani',
                quantity: 1,
                unitPrice: 120,
                totalPrice: 120,
                note: ''
            }
        ],
        subtotal: 240,
        deliveryFee: 50,
        tax: 12,
        total: 302,
        paymentMethod: '**** **** **** 1234',
        generatedAt: new Date().toLocaleString(),
        billNumber: 'MKP-1001',
        status: 'Generated'
    }
];

// Admin data structures
let supportTicketsDB = [
    {
        id: 1001,
        userId: 'Rahul Kumar',
        userRole: 'student',
        subject: 'Order not delivered',
        description: 'I placed an order 2 hours ago but it has not been delivered yet. The status shows "Out for Delivery" but no one has contacted me.',
        status: 'Open',
        priority: 'High',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        responses: []
    },
    {
        id: 1002,
        userId: 'Priya Sharma',
        userRole: 'cook',
        subject: 'Payment not received',
        description: 'I completed an order yesterday but have not received the payment yet. Order #12345.',
        status: 'In Progress',
        priority: 'Medium',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
        responses: [
            {
                from: 'admin',
                message: 'We are looking into this issue. Payment processing can take 24-48 hours.',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString()
            }
        ]
    }
];

let adminUsers = [
    { id: 1, name: 'Admin', email: 'admin@makapyaar.com', role: 'admin' }
];
let currentTicket = null;

// ===== MOCK DATA =====
// Helper function for generating placeholder images
const getImg = (text) => `https://placehold.co/400x300/e8f5e9/2e7d32?text=${encodeURIComponent(text)}`;

// Order tracking statuses
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

// Pre-populated kitchens database
let kitchens = [
    { 
        id: 1, 
        name: "Suman's Kitchen", 
        ownerName: "Suman", 
        specialty: "North Indian", 
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
        rating: 4.5, 
        image: "https://placehold.co/400x200/fff8e1/5d4037?text=Radha",
        isOpen: true,
        autoTiming: true,
        openingTime: "09:00",
        closingTime: "21:00"
    },
    { 
        id: 3, 
        name: "Priya's Home Kitchen", 
        ownerName: "Priya", 
        specialty: "South Indian", 
        rating: 4.9, 
        image: "https://placehold.co/400x200/e1f5fe/01579b?text=Priya",
        isOpen: true,
        autoTiming: true,
        openingTime: "09:00",
        closingTime: "21:00"
    }
];

// Pre-populated menu items database
let menuDB = [
    // Suman's Kitchen items
    { 
        id: 101, 
        kitchenId: 1, 
        name: "Aloo Paratha", 
        price: 60, 
        category: "breakfast", 
        image: getImg("Aloo Paratha") 
    },
    { 
        id: 102, 
        kitchenId: 1, 
        name: "Dal Makhani", 
        price: 120, 
        category: "lunch", 
        image: getImg("Dal Makhani") 
    },
    { 
        id: 103, 
        kitchenId: 1, 
        name: "Samosa", 
        price: 30, 
        category: "snack", 
        image: getImg("Samosa") 
    },
    { 
        id: 104, 
        kitchenId: 1, 
        name: "Paneer Butter Masala", 
        price: 150, 
        category: "dinner", 
        image: getImg("Paneer Masala") 
    },
    
    // Radha's Rasoi items
    { 
        id: 201, 
        kitchenId: 2, 
        name: "Poha", 
        price: 40, 
        category: "breakfast", 
        image: getImg("Poha") 
    },
    { 
        id: 202, 
        kitchenId: 2, 
        name: "Gujarati Thali", 
        price: 180, 
        category: "lunch", 
        image: getImg("Thali") 
    },
    { 
        id: 203, 
        kitchenId: 2, 
        name: "Dhokla", 
        price: 50, 
        category: "snack", 
        image: getImg("Dhokla") 
    },
    { 
        id: 204, 
        kitchenId: 2, 
        name: "Undhiyu", 
        price: 140, 
        category: "dinner", 
        image: getImg("Undhiyu") 
    },
    
    // Priya's Home Kitchen items
    { 
        id: 301, 
        kitchenId: 3, 
        name: "Idli Sambar", 
        price: 50, 
        category: "breakfast", 
        image: getImg("Idli") 
    },
    { 
        id: 302, 
        kitchenId: 3, 
        name: "Curd Rice", 
        price: 80, 
        category: "lunch", 
        image: getImg("Curd Rice") 
    },
    { 
        id: 303, 
        kitchenId: 3, 
        name: "Vada", 
        price: 35, 
        category: "snack", 
        image: getImg("Vada") 
    },
    { 
        id: 304, 
        kitchenId: 3, 
        name: "Dosa", 
        price: 70, 
        category: "dinner", 
        image: getImg("Dosa") 
    }
];

// --- NAVIGATION & AUTH ---

function showScreen(id) {
    // Helper to switch screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Handle both "id" and "id-screen" inputs
    const targetId = id.endsWith('-screen') ? id : id + '-screen';
    const el = document.getElementById(targetId);
    if(el) {
        el.classList.add('active');
        
        // Load history when navigating to history screens
        if (id === 'mother-history') {
            loadMotherOrderHistory();
        } else if (id === 'student-history') {
            loadStudentOrderHistory();
        }
    }
    else console.error("Screen not found:", targetId);
}

function goToLogin(role) {
    currentUser.role = role; // Set role (cook/student/admin)
    let title = "Login";
    if (role === 'cook') title = "👩‍🍳 Mother Login";
    else if (role === 'student') title = "🧑‍💻 Student Login";
    else if (role === 'admin') title = "👨‍💼 Administrator Login";
    
    document.getElementById('auth-title').innerText = title;
    showScreen('auth');
}

function handleLogin(e) {
    e.preventDefault();
    try {
        const name = document.getElementById('u_name').value;
        const mobile = document.getElementById('u_mobile').value;
        
        currentUser.name = name;
        currentUser.mobile = mobile;

        if (currentUser.role === 'cook') {
            // 1. Find or Create Kitchen
            let k = kitchens.find(k => k.ownerName.toLowerCase() === name.toLowerCase());
            
            if (!k) {
                // New Mother -> Create Kitchen with proper timing defaults
                k = { 
                    id: Date.now(), 
                    name: `${name}'s Kitchen`, 
                    ownerName: name, 
                    specialty: "Home Food", 
                    rating: 5.0, 
                    image: getImg(name),
                    isOpen: true,
                    autoTiming: true,
                    openingTime: "09:00",
                    closingTime: "21:00"
                };
                kitchens.push(k);
            } else {
                // Ensure existing kitchen has timing properties
                if (k.autoTiming === undefined) k.autoTiming = true;
                if (k.isOpen === undefined) k.isOpen = true;
                if (!k.openingTime) k.openingTime = "09:00";
                if (!k.closingTime) k.closingTime = "21:00";
            }
            currentKitchen = k;
            
            // 2. Populate Dashboard
            const nameDisplay = document.getElementById('mom-name-display');
            if(nameDisplay) nameDisplay.innerText = name;

            document.getElementById('kitchenNameInput').value = k.name;
            document.getElementById('kitchenSpecInput').value = k.specialty;
            
            // 3. Load Data
            loadMotherMenuTable();
            loadMotherOrders();
            
            // Load timing settings with error handling
            try {
                console.log('About to load kitchen timing settings...');
                loadKitchenTimingSettings();
                console.log('Kitchen timing settings loaded successfully');
            } catch (error) {
                console.error('Error loading kitchen timing settings:', error);
                alert('Error loading kitchen timing: ' + error.message);
            }
            
            showScreen('mother-dashboard');
        } else if (currentUser.role === 'student') {
            // Student Login
            showScreen('student-dashboard');
            renderKitchensList();
            updateNotificationBadge();
        } else if (currentUser.role === 'admin') {
            // Admin Login
            const nameDisplay = document.getElementById('admin-name-display');
            if(nameDisplay) nameDisplay.innerText = name;
            
            showScreen('admin-dashboard');
            showAdminSection('refunds'); // Default to refunds section
            loadAdminDashboard();
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Something went wrong during login. Please try again.");
    }
}

function logout() {
    currentUser = { name: '', role: '', mobile: '' };
    currentKitchen = null;
    cart = [];
    showScreen('role');
    document.getElementById('detailsForm').reset();
}

// --- MOTHER DASHBOARD LOGIC ---

function loadMotherOrders() {
    const list = document.getElementById('motherOrderList');
    list.innerHTML = '';

    // Find active orders for this kitchen (not delivered, refunded, or cancelled)
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
        } else if (order.status === ORDER_STATUSES.ACCEPTED) {
            actionButtons = `
                <span class="status-badge ${order.status}">${order.status}</span>
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.PREPARING}')">Start Preparing 👨‍🍳</button>
            `;
        } else if (order.status === ORDER_STATUSES.PREPARING) {
            actionButtons = `
                <span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.OUT_FOR_DELIVERY}')">Out for Delivery 🚚</button>
            `;
        } else if (order.status === ORDER_STATUSES.OUT_FOR_DELIVERY) {
            actionButtons = `
                <span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.DELIVERED}')">Mark Delivered ✅</button>
            `;
        } else if (order.status === ORDER_STATUSES.REFUND_REQUESTED) {
            actionButtons = `
                <span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>
                <button class="btn-action accept" onclick="processRefund(${order.id}, true)">Approve Refund ✅</button>
                <button class="btn-action decline" onclick="processRefund(${order.id}, false)">Decline Refund ❌</button>
                <div style="margin-top: 5px; font-size: 0.85em; color: #d32f2f;"><strong>Reason:</strong> ${order.refundReason || 'Not specified'}</div>
            `;
        } else {
            actionButtons = `<span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>`;
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

function updateOrderStatus(orderId, status) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order) {
        const oldStatus = order.status;
        order.status = status;
        order.updatedAt = new Date().toLocaleString();
        
        // Add to tracking history
        if (!order.trackingHistory) {
            order.trackingHistory = [];
        }
        order.trackingHistory.push({
            status: status,
            timestamp: new Date().toLocaleString(),
            message: getStatusMessage(status)
        });
        
        loadMotherOrders(); // Refresh UI
        
        // Show notification to student
        if (status === ORDER_STATUSES.ACCEPTED) {
            alert(`Order #${orderId} has been accepted by the cook! 🎉`);
        } else if (status === ORDER_STATUSES.DECLINED) {
            alert(`Order #${orderId} has been declined by the cook. 😔`);
        } else if (status === ORDER_STATUSES.PREPARING) {
            alert(`Order #${orderId} is being prepared! 👨‍🍳`);
        } else if (status === ORDER_STATUSES.OUT_FOR_DELIVERY) {
            alert(`Order #${orderId} is out for delivery! 🚚`);
        } else if (status === ORDER_STATUSES.DELIVERED) {
            alert(`Order #${orderId} has been delivered! Enjoy your meal! 🎉`);
        }
    }
}

function getStatusMessage(status) {
    const messages = {
        [ORDER_STATUSES.PENDING]: 'Order placed and waiting for confirmation',
        [ORDER_STATUSES.ACCEPTED]: 'Order accepted by the cook',
        [ORDER_STATUSES.PREPARING]: 'Your food is being prepared',
        [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Order is on the way',
        [ORDER_STATUSES.DELIVERED]: 'Order delivered successfully',
        [ORDER_STATUSES.DECLINED]: 'Order declined by the cook',
        [ORDER_STATUSES.REFUND_REQUESTED]: 'Refund requested by customer',
        [ORDER_STATUSES.REFUNDED]: 'Refund processed successfully',
        [ORDER_STATUSES.CANCELLED]: 'Order cancelled'
    };
    return messages[status] || status;
}

function requestRefund(orderId, reason) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order) {
        if (order.status === ORDER_STATUSES.DELIVERED || order.status === ORDER_STATUSES.ACCEPTED) {
            order.refundReason = reason;
            updateOrderStatus(orderId, ORDER_STATUSES.REFUND_REQUESTED);
            alert('Refund request submitted successfully. The cook will review it shortly.');
            loadStudentOrderHistory();
        } else {
            alert('Refund can only be requested for delivered or accepted orders.');
        }
    }
}

function processRefund(orderId, approve) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order && order.status === ORDER_STATUSES.REFUND_REQUESTED) {
        if (approve) {
            updateOrderStatus(orderId, ORDER_STATUSES.REFUNDED);
            alert(`Refund approved for Order #${orderId}. Amount ₹${order.total} will be refunded.`);
        } else {
            updateOrderStatus(orderId, order.trackingHistory[order.trackingHistory.length - 2]?.status || ORDER_STATUSES.DELIVERED);
            alert(`Refund declined for Order #${orderId}.`);
        }
        loadMotherOrderHistory();
    }
}

function cancelOrder(orderId) {
    const order = ordersDB.find(o => o.id === orderId);
    if (order && order.status === ORDER_STATUSES.PENDING) {
        updateOrderStatus(orderId, ORDER_STATUSES.CANCELLED);
        alert('Order cancelled successfully.');
        loadStudentOrderHistory();
    } else {
        alert('Only pending orders can be cancelled.');
    }
}

function viewOrderTracking(orderId) {
    const order = ordersDB.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    let trackingHTML = `
        <div style="max-width: 500px; margin: 20px auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            <h2 style="color: #2E7D32; margin-bottom: 20px;">📦 Order Tracking #${orderId}</h2>
            <div style="margin-bottom: 15px;">
                <strong>Current Status:</strong> <span style="color: #2E7D32; font-size: 1.2em;">${order.status}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Total Amount:</strong> ₹${order.total}
            </div>
            <hr style="margin: 20px 0;">
            <h3 style="color: #5D4037; margin-bottom: 15px;">Tracking History:</h3>
    `;
    
    if (order.trackingHistory && order.trackingHistory.length > 0) {
        order.trackingHistory.forEach((track, index) => {
            const isLatest = index === order.trackingHistory.length - 1;
            trackingHTML += `
                <div style="padding: 12px; margin-bottom: 10px; background: ${isLatest ? '#e8f5e9' : '#f5f5f5'}; border-left: 4px solid ${isLatest ? '#4CAF50' : '#ddd'}; border-radius: 5px;">
                    <div style="font-weight: bold; color: #2E7D32;">${track.status}</div>
                    <div style="font-size: 0.9em; color: #757575;">${track.message}</div>
                    <div style="font-size: 0.85em; color: #999; margin-top: 5px;">${track.timestamp}</div>
                </div>
            `;
        });
    } else {
        trackingHTML += `<p style="color: #757575; font-style: italic;">No tracking history available yet.</p>`;
    }
    
    trackingHTML += `
            <button onclick="closeTrackingModal()" style="margin-top: 20px; padding: 10px 20px; background: #2E7D32; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'trackingModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; justify-content: center; align-items: center; overflow-y: auto;';
    modal.innerHTML = trackingHTML;
    document.body.appendChild(modal);
}

function closeTrackingModal() {
    const modal = document.getElementById('trackingModal');
    if (modal) {
        modal.remove();
    }
}

let uploadedImageData = null;

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageData = e.target.result;
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
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
            image: uploadedImageData || getImg(name)
        });
        loadMotherMenuTable();
        // Clear inputs
        document.getElementById('newItemName').value = '';
        document.getElementById('newItemPrice').value = '';
        document.getElementById('newItemImage').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        uploadedImageData = null;
        
        showToast(`${name} added to menu successfully!`);
    } else {
        alert('Please enter item name and price');
    }
}

function loadMotherMenuTable() {
    const list = document.getElementById('myMenuList');
    list.innerHTML = '';
    const items = menuDB.filter(i => i.kitchenId === currentKitchen.id);
    
    if(items.length === 0) {
        list.innerHTML = '<li class="empty-state">No items added yet.</li>';
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.name}</span> <span>₹${item.price}</span>`;
        list.appendChild(li);
    });
}

function saveKitchenProfile() {
    currentKitchen.name = document.getElementById('kitchenNameInput').value;
    currentKitchen.specialty = document.getElementById('kitchenSpecInput').value;
    alert("Profile Updated Successfully!");
}

// --- KITCHEN TIMING MANAGEMENT ---

function toggleTimingMode() {
    console.log('🔧 toggleTimingMode called');
    alert('toggleTimingMode function called!'); // Debug alert
    console.log('Current kitchen:', currentKitchen);
    
    if (!currentKitchen) {
        console.error('No current kitchen found');
        alert('No kitchen found! Please login as a cook first.');
        return;
    }
    
    const autoCheckbox = document.getElementById('autoTimingCheckbox');
    const manualSection = document.getElementById('manualTimingSection');
    
    if (!autoCheckbox || !manualSection) {
        console.error('Required elements not found');
        return;
    }
    
    console.log('Auto timing checkbox checked:', autoCheckbox.checked);
    
    if (autoCheckbox.checked) {
        manualSection.style.display = 'none';
        currentKitchen.autoTiming = true;
        currentKitchen.openingTime = "09:00";
        currentKitchen.closingTime = "21:00";
        
        // Update the time inputs
        const openingTimeInput = document.getElementById('openingTime');
        const closingTimeInput = document.getElementById('closingTime');
        if (openingTimeInput) openingTimeInput.value = "09:00";
        if (closingTimeInput) closingTimeInput.value = "21:00";
        
        // Sync with global kitchens array
        syncKitchenToGlobal();
        
        checkAutoTiming();
        showToast('Automatic timing enabled (9 AM - 9 PM)');
    } else {
        manualSection.style.display = 'block';
        currentKitchen.autoTiming = false;
        
        // Sync with global kitchens array
        syncKitchenToGlobal();
        
        showToast('Manual timing mode enabled');
    }
    
    // Update the kitchen open checkbox state
    const kitchenOpenCheckbox = document.getElementById('kitchenOpenCheckbox');
    if (kitchenOpenCheckbox) {
        kitchenOpenCheckbox.disabled = false; // Always allow manual override
        kitchenOpenCheckbox.checked = currentKitchen.isOpen;
    }
    
    updateKitchenStatusDisplay();
}

function toggleKitchenStatus() {
    console.log('🔧 toggleKitchenStatus called');
    alert('toggleKitchenStatus function called!'); // Debug alert
    
    if (!currentKitchen) {
        console.error('No current kitchen found');
        alert('Error: No current kitchen found');
        return;
    }
    
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    if (!checkbox) {
        console.error('Kitchen open checkbox not found');
        alert('Error: Kitchen open checkbox not found');
        return;
    }
    
    console.log('Checkbox checked state:', checkbox.checked);
    
    // If auto timing is enabled, allow temporary override but warn user
    if (currentKitchen.autoTiming) {
        // Allow the change but warn that it's temporary
        currentKitchen.isOpen = checkbox.checked;
        syncKitchenToGlobal();
        updateKitchenStatusDisplay();
        showToast('Manual override applied. Will revert to auto timing at next hour.');
        return;
    }
    
    // Update kitchen status based on checkbox
    currentKitchen.isOpen = checkbox.checked;
    console.log('Kitchen status manually changed to:', currentKitchen.isOpen ? 'Open' : 'Closed');
    
    // Sync with global kitchens array
    syncKitchenToGlobal();
    
    // Update display
    updateKitchenStatusDisplay();
    
    // Show confirmation
    showToast(`Kitchen is now ${currentKitchen.isOpen ? 'Open' : 'Closed'}`);
}

function saveKitchenTiming() {
    console.log('saveKitchenTiming called');
    
    if (!currentKitchen) {
        console.error('No current kitchen found');
        return;
    }
    
    if (!currentKitchen.autoTiming) {
        const openingTime = document.getElementById('openingTime').value;
        const closingTime = document.getElementById('closingTime').value;
        
        if (!openingTime || !closingTime) {
            alert('Please set both opening and closing times');
            return;
        }
        
        // Validate time format and logic
        if (!validateTimingSettings(openingTime, closingTime)) {
            return;
        }
        
        currentKitchen.openingTime = openingTime;
        currentKitchen.closingTime = closingTime;
        
        console.log('Manual timing saved:', openingTime, '-', closingTime);
        
        // Check if kitchen should be open based on current time
        updateKitchenAvailabilityBasedOnTime();
    }
    
    // Sync with global kitchens array
    syncKitchenToGlobal();
    
    updateKitchenStatusDisplay();
    showToast("Timing settings saved successfully!");
    console.log('Kitchen timing saved:', currentKitchen);
}

function updateKitchenStatusDisplay() {
    if (!currentKitchen) {
        console.error('No current kitchen found');
        return;
    }
    
    const statusDiv = document.getElementById('kitchenStatusDisplay');
    const statusText = document.getElementById('statusText');
    
    if (!statusDiv || !statusText) {
        console.error('Status display elements not found');
        return;
    }
    
    console.log('Updating kitchen status display:', currentKitchen.isOpen ? 'Open' : 'Closed');
    
    if (currentKitchen.isOpen) {
        statusDiv.style.backgroundColor = '#C8E6C9';
        statusDiv.style.color = '#2E7D32';
        statusText.innerText = `Open (${currentKitchen.openingTime} - ${currentKitchen.closingTime})`;
    } else {
        statusDiv.style.backgroundColor = '#FFCDD2';
        statusDiv.style.color = '#d32f2f';
        statusText.innerText = 'Closed';
    }
}

function checkAutoTiming() {
    if (!currentKitchen || !currentKitchen.autoTiming) {
        console.log('Auto timing not enabled or no kitchen');
        return;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log('Checking auto timing. Current time:', `${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    
    // Auto timing: 9 AM to 9 PM
    const shouldBeOpen = currentHour >= 9 && currentHour < 21;
    
    if (currentKitchen.isOpen !== shouldBeOpen) {
        currentKitchen.isOpen = shouldBeOpen;
        console.log('Auto timing changed kitchen status to:', shouldBeOpen ? 'Open' : 'Closed');
        
        // Sync with global kitchens array
        syncKitchenToGlobal();
        
        // Show notification about status change
        showToast(`Kitchen automatically ${shouldBeOpen ? 'opened' : 'closed'} based on timing`);
    }
    
    // Update UI elements
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    if (checkbox) {
        checkbox.checked = currentKitchen.isOpen;
        // Keep checkbox enabled for manual override
        checkbox.disabled = false;
    }
    
    updateKitchenStatusDisplay();
}

function loadKitchenTimingSettings() {
    if (!currentKitchen) {
        console.error('No current kitchen found');
        return;
    }
    
    console.log('Loading kitchen timing settings for:', currentKitchen.name);
    console.log('Current kitchen object:', currentKitchen);
    
    // Set default values if not present
    if (currentKitchen.autoTiming === undefined) currentKitchen.autoTiming = true;
    if (currentKitchen.isOpen === undefined) currentKitchen.isOpen = true;
    if (!currentKitchen.openingTime) currentKitchen.openingTime = "09:00";
    if (!currentKitchen.closingTime) currentKitchen.closingTime = "21:00";
    
    // Load values into form elements
    const autoCheckbox = document.getElementById('autoTimingCheckbox');
    const openingTimeInput = document.getElementById('openingTime');
    const closingTimeInput = document.getElementById('closingTime');
    const kitchenOpenCheckbox = document.getElementById('kitchenOpenCheckbox');
    const manualSection = document.getElementById('manualTimingSection');
    
    console.log('Form elements found:', {
        autoCheckbox: !!autoCheckbox,
        openingTimeInput: !!openingTimeInput,
        closingTimeInput: !!closingTimeInput,
        kitchenOpenCheckbox: !!kitchenOpenCheckbox,
        manualSection: !!manualSection
    });
    
    if (autoCheckbox) {
        autoCheckbox.checked = currentKitchen.autoTiming;
        console.log('Auto timing checkbox set to:', currentKitchen.autoTiming);
    }
    
    if (openingTimeInput) {
        openingTimeInput.value = currentKitchen.openingTime;
        console.log('Opening time set to:', currentKitchen.openingTime);
    }
    
    if (closingTimeInput) {
        closingTimeInput.value = currentKitchen.closingTime;
        console.log('Closing time set to:', currentKitchen.closingTime);
    }
    
    if (kitchenOpenCheckbox) {
        kitchenOpenCheckbox.checked = currentKitchen.isOpen;
        // Always enable the checkbox - let users override if needed
        kitchenOpenCheckbox.disabled = false;
        console.log('Kitchen open checkbox set to:', currentKitchen.isOpen);
    }
    
    // Show/hide manual timing section
    if (manualSection) {
        manualSection.style.display = currentKitchen.autoTiming ? 'none' : 'block';
        console.log('Manual section display:', currentKitchen.autoTiming ? 'hidden' : 'visible');
    }
    
    // Sync with global kitchens array
    syncKitchenToGlobal();
    
    // Check auto timing if enabled
    if (currentKitchen.autoTiming) {
        checkAutoTiming();
    } else {
        // For manual timing, check if kitchen should be open based on current time
        updateKitchenAvailabilityBasedOnTime();
    }
    
    updateKitchenStatusDisplay();
    
    // Add event listeners to time inputs for real-time updates
    if (openingTimeInput) {
        openingTimeInput.addEventListener('change', function() {
            if (!currentKitchen.autoTiming) {
                console.log('Opening time changed to:', this.value);
                currentKitchen.openingTime = this.value;
                syncKitchenToGlobal();
                updateKitchenAvailabilityBasedOnTime();
                updateKitchenStatusDisplay();
            }
        });
    }
    
    if (closingTimeInput) {
        closingTimeInput.addEventListener('change', function() {
            if (!currentKitchen.autoTiming) {
                console.log('Closing time changed to:', this.value);
                currentKitchen.closingTime = this.value;
                syncKitchenToGlobal();
                updateKitchenAvailabilityBasedOnTime();
                updateKitchenStatusDisplay();
            }
        });
    }
    
    console.log('Kitchen timing settings loaded successfully');
}

// --- ORDER HISTORY ---

function loadMotherOrderHistory() {
    const list = document.getElementById('motherHistoryList');
    list.innerHTML = '';

    const myOrders = ordersDB.filter(o => o.kitchenId === currentKitchen.id);

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-state">No orders in history.</p>';
        return;
    }

    // Sort by most recent first
    myOrders.sort((a, b) => b.id - a.id);

    myOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = `order-card ${order.status.toLowerCase().replace(/ /g, '-')}`;
        
        let actionButtons = '';
        
        // Add bill viewing option for cooks
        const bill = getBillByOrderId(order.id);
        if (bill) {
            actionButtons += `
                <button class="btn-action" style="background: #4CAF50; margin-bottom: 5px;" onclick="showBillModal('${bill.id}')">📄 View Bill</button><br>
            `;
        }
        
        if (order.status === ORDER_STATUSES.ACCEPTED) {
            actionButtons = `
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.PREPARING}')">Start Preparing 👨‍🍳</button>
            `;
        } else if (order.status === ORDER_STATUSES.PREPARING) {
            actionButtons = `
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.OUT_FOR_DELIVERY}')">Out for Delivery 🚚</button>
            `;
        } else if (order.status === ORDER_STATUSES.OUT_FOR_DELIVERY) {
            actionButtons = `
                <button class="btn-action accept" onclick="updateOrderStatus(${order.id}, '${ORDER_STATUSES.DELIVERED}')">Mark Delivered ✅</button>
            `;
        } else if (order.status === ORDER_STATUSES.REFUND_REQUESTED) {
            actionButtons = `
                <button class="btn-action accept" onclick="processRefund(${order.id}, true)">Approve Refund ✅</button>
                <button class="btn-action decline" onclick="processRefund(${order.id}, false)">Decline Refund ❌</button>
                <div style="margin-top: 5px; font-size: 0.85em; color: #d32f2f;"><strong>Reason:</strong> ${order.refundReason || 'Not specified'}</div>
            `;
        }
        
        div.innerHTML = `
            <div class="order-header">
                <strong>Order #${order.id}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                <strong>From:</strong> ${order.studentName}<br>
                <strong>Items:</strong> ${formatItemsDisplay(order.items)}<br>
                ${order.note ? `<strong>Note:</strong> "${order.note}"<br>` : ''}
                ${order.updatedAt ? `<strong>Updated:</strong> ${order.updatedAt}<br>` : ''}
                <strong>Delivery:</strong> ${order.deliveryAddress.address}
            </div>
            <div class="order-actions">
                <span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>
                ${actionButtons}
            </div>
        `;
        list.appendChild(div);
    });
}

function loadStudentOrderHistory() {
    const list = document.getElementById('studentHistoryList');
    list.innerHTML = '';

    const myOrders = ordersDB.filter(o => o.studentName === currentUser.name);

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-state">No orders in history.</p>';
        return;
    }

    // Sort by most recent first
    myOrders.sort((a, b) => b.id - a.id);

    myOrders.forEach(order => {
        const kitchen = kitchens.find(k => k.id === order.kitchenId);
        const div = document.createElement('div');
        div.className = `order-card ${order.status.toLowerCase().replace(/ /g, '-')}`;
        
        let actionButtons = `
            <button class="btn-action" style="background: #2196F3;" onclick="viewOrderTracking(${order.id})">Track Order 📦</button>
        `;
        
        // Add bill download button for all orders (bill is generated on order creation)
        const bill = getBillByOrderId(order.id);
        if (bill) {
            actionButtons += `
                <button class="btn-action" style="background: #4CAF50;" onclick="showBillModal('${bill.id}')">📄 View Bill</button>
            `;
        }
        
        if (order.status === ORDER_STATUSES.PENDING) {
            actionButtons += `
                <button class="btn-action decline" onclick="cancelOrder(${order.id})">Cancel Order ❌</button>
            `;
        } else if (order.status === ORDER_STATUSES.DELIVERED || order.status === ORDER_STATUSES.ACCEPTED) {
            if (order.status !== ORDER_STATUSES.REFUND_REQUESTED && order.status !== ORDER_STATUSES.REFUNDED) {
                actionButtons += `
                    <button class="btn-action" style="background: #FF9800;" onclick="promptRefund(${order.id})">Request Refund 💰</button>
                `;
            }
        }
        
        div.innerHTML = `
            <div class="order-header">
                <strong>Order #${order.id}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                <strong>Kitchen:</strong> ${kitchen ? kitchen.name : 'Unknown'}<br>
                <strong>Items:</strong> ${formatItemsDisplay(order.items)}<br>
                ${order.note ? `<strong>Note:</strong> "${order.note}"<br>` : ''}
                ${order.updatedAt ? `<strong>Updated:</strong> ${order.updatedAt}<br>` : ''}
                <strong>Delivery:</strong> ${order.deliveryAddress.address}
            </div>
            <div class="order-actions">
                <span class="status-badge ${order.status.replace(/ /g, '-')}">${order.status}</span>
                <div style="margin-top: 10px;">
                    ${actionButtons}
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function promptRefund(orderId) {
    const reason = prompt('Please enter the reason for refund request:');
    if (reason && reason.trim()) {
        requestRefund(orderId, reason.trim());
    } else if (reason !== null) {
        alert('Please provide a reason for the refund request.');
    }
}

function updateNotificationBadge() {
    const myOrders = ordersDB.filter(o => o.studentName === currentUser.name && o.status !== 'Pending');
    const badge = document.getElementById('notif-badge');
    if (badge) {
        badge.innerText = myOrders.length;
        badge.style.display = myOrders.length > 0 ? 'inline' : 'none';
    }
}

// --- STUDENT DASHBOARD LOGIC ---

function renderKitchensList() {
    document.getElementById('kitchens-list-view').classList.remove('hidden');
    document.getElementById('single-kitchen-view').classList.add('hidden');
    
    const grid = document.getElementById('kitchensGrid');
    grid.innerHTML = '';
    
    kitchens.forEach(k => {
        const div = document.createElement('div');
        div.className = 'kitchen-card';
        
        // Check if kitchen is actually available for orders
        const canOrder = k.isOpen && isKitchenCurrentlyOpen(k);
        
        if (canOrder) {
            div.onclick = () => openKitchen(k.id);
        } else {
            div.style.opacity = '0.6';
            div.style.cursor = 'not-allowed';
            div.onclick = () => {
                showToast('This kitchen is currently closed. Please try again during operating hours.');
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
        // Auto timing: 9 AM to 9 PM
        return currentHour >= 9 && currentHour < 21;
    } else {
        // Manual timing
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
    if(event) event.target.classList.add('active');
    
    const container = document.getElementById('studentMenuList');
    container.innerHTML = '';
    const items = menuDB.filter(i => i.kitchenId === activeKitchenId && i.category === activeCategory);
    
    if(items.length === 0) {
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

// --- CART & ORDERING ---

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
    
    // Add items based on quantity
    for (let i = 0; i < quantity; i++) {
        cart.push({ ...tempItem, note: note, quantity: 1 });
    }
    
    updateCart();
    closeModal();
    
    // Show success message
    showToast(`Added ${quantity} x ${tempItem.name} to cart!`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
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

function updateCart() {
    const list = document.getElementById('cartList');
    list.innerHTML = '';
    let total = 0;
    
    // Use consistent grouping function
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
    showToast(`Removed ${itemName} from cart`);
}

function removeItem(idx) { cart.splice(idx, 1); updateCart(); }

function placeOrder() {
    if (cart.length === 0) return alert("Empty Cart!");
    showScreen('checkout');
    loadCheckout();
}

function loadCheckout() {
    // Populate order summary with grouped quantities
    const itemsDiv = document.getElementById('checkoutItems');
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

    // Calculate totals
    calculateTotal();

    // Pre-fill delivery address with user info
    document.getElementById('deliveryName').value = currentUser.name || '';
    document.getElementById('deliveryPhone').value = currentUser.mobile || '';
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = 50;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + tax;

    document.getElementById('checkoutSubtotal').innerText = subtotal;
    document.getElementById('checkoutDelivery').innerText = deliveryFee;
    document.getElementById('checkoutTax').innerText = tax;
    document.getElementById('checkoutTotal').innerText = total;

    return total;
}

function confirmPayment() {
    // Validate forms
    const name = document.getElementById('deliveryName').value;
    const phone = document.getElementById('deliveryPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    const cardName = document.getElementById('cardName').value;

    if (!name || !phone || !address || !cardNumber || !cardExpiry || !cardCVV || !cardName) {
        alert("Please fill in all required fields.");
        return;
    }

    // Mock payment processing
    alert("Processing payment...");

    // Create order
    const kId = cart[0].kitchenId;
    const total = calculateTotal();
    const orderId = Date.now();

    const newOrder = {
        id: orderId,
        kitchenId: kId,
        studentName: currentUser.name || "Student",
        items: [...cart],
        total: total,
        note: cart.map(i => i.note).filter(n => n).join('; ') || "Please deliver fast!",
        status: 'Pending',
        deliveryAddress: { name, phone, address },
        createdAt: new Date().toLocaleString(),
        paymentMethod: `**** **** **** ${cardNumber.slice(-4)}`
    };

    ordersDB.push(newOrder);

    // Generate bill for the order
    const bill = generateBill(newOrder, {
        cardNumber: cardNumber,
        cardExpiry: cardExpiry,
        cardName: cardName
    });

    // Clear cart and redirect
    cart = [];
    updateCart();
    
    // Show success message with bill option
    const viewBill = confirm("Payment successful! Order placed. 🚀\n\nWould you like to view your bill?");
    if (viewBill) {
        showBillModal(bill.id);
    }
    
    showScreen('student-dashboard');
    renderKitchensList();
}

function backToCart() {
    showScreen('student-dashboard');
}

// --- QUANTITY DISPLAY UTILITIES ---

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

function formatItemsWithPrices(items) {
    const grouped = groupItemsByName(items);
    return grouped.map(item => {
        let display = item.name;
        if (item.quantity > 1) {
            display += ` x${item.quantity}`;
        }
        display += ` (₹${item.totalPrice})`;
        return display;
    }).join(', ');
}

// --- UTILS ---
function toggleNotifications() {
    const d = document.getElementById('notif-dropdown');
    d.classList.toggle('hidden');
    const list = document.getElementById('notif-list');
    list.innerHTML = '';
    const myOrders = ordersDB.filter(o => o.studentName === currentUser.name && o.status !== 'Pending');
    
    if(myOrders.length === 0) {
        list.innerHTML = '<li>No updates.</li>';
    } else {
        // Sort by most recent first
        myOrders.sort((a, b) => b.id - a.id);
        myOrders.forEach(o => {
            const statusIcon = o.status === 'Accepted' ? '✅' : '❌';
            const li = document.createElement('li');
            const itemsDisplay = formatItemsDisplay(o.items);
            li.innerHTML = `${statusIcon} Order #${o.id} (₹${o.total}): <strong>${o.status}</strong><br><small>Items: ${itemsDisplay}</small>`;
            if (o.updatedAt) {
                li.innerHTML += `<br><small>Updated: ${o.updatedAt}</small>`;
            }
            list.appendChild(li);
        });
        
        // Update badge count
        const badge = document.getElementById('notif-badge');
        badge.innerText = myOrders.length;
        badge.style.display = myOrders.length > 0 ? 'inline' : 'none';
    }
}
function scrollToCart() { document.getElementById('cart-anchor').scrollIntoView({behavior:'smooth'}); }

// --- KITCHEN TIMING HELPER FUNCTIONS ---

function syncKitchenToGlobal() {
    if (!currentKitchen) return;
    
    const kitchenIndex = kitchens.findIndex(k => k.id === currentKitchen.id);
    if (kitchenIndex !== -1) {
        kitchens[kitchenIndex] = { ...kitchens[kitchenIndex], ...currentKitchen };
        console.log('Kitchen synced to global array:', kitchens[kitchenIndex]);
    }
}

function validateTimingSettings(openingTime, closingTime) {
    // Basic time format validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
        alert('Please enter valid time format (HH:MM)');
        return false;
    }
    
    // Convert to minutes for comparison
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    if (openMinutes >= closeMinutes) {
        alert('Opening time must be before closing time');
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
    
    // Parse kitchen timing
    const [openHour, openMin] = currentKitchen.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = currentKitchen.closingTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    const shouldBeOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    
    if (currentKitchen.isOpen !== shouldBeOpen) {
        currentKitchen.isOpen = shouldBeOpen;
        console.log('Kitchen availability updated based on manual timing:', shouldBeOpen ? 'Open' : 'Closed');
        
        // Update checkbox
        const checkbox = document.getElementById('kitchenOpenCheckbox');
        if (checkbox) {
            checkbox.checked = currentKitchen.isOpen;
        }
        
        syncKitchenToGlobal();
        showToast(`Kitchen ${shouldBeOpen ? 'opened' : 'closed'} based on your timing settings`);
    }
}

// --- ADMIN DASHBOARD FUNCTIONS ---

function showAdminSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    
    // Show selected section
    const targetSection = document.getElementById(`admin-${section}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Load section data
    switch(section) {
        case 'refunds':
            loadRefundManagement();
            break;
        case 'support':
            loadSupportManagement();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'users':
            loadUserManagement();
            break;
    }
}

function loadAdminDashboard() {
    console.log('Loading admin dashboard...');
    loadRefundManagement();
    updateAdminStats();
}

function loadRefundManagement() {
    const refundList = document.getElementById('adminRefundList');
    refundList.innerHTML = '';
    
    // Find all refund requests
    const refundRequests = ordersDB.filter(o => o.status === ORDER_STATUSES.REFUND_REQUESTED);
    
    if (refundRequests.length === 0) {
        refundList.innerHTML = '<p class="empty-state">No pending refund requests.</p>';
        return;
    }
    
    refundRequests.forEach(order => {
        const kitchen = kitchens.find(k => k.id === order.kitchenId);
        const div = document.createElement('div');
        div.className = 'order-card refund-requested';
        
        div.innerHTML = `
            <div class="order-header">
                <strong>Order #${order.id}</strong>
                <span class="order-total">₹${order.total}</span>
            </div>
            <div class="order-items">
                <strong>Customer:</strong> ${order.studentName}<br>
                <strong>Kitchen:</strong> ${kitchen ? kitchen.name : 'Unknown'}<br>
                <strong>Items:</strong> ${formatItemsDisplay(order.items)}<br>
                <strong>Refund Reason:</strong> ${order.refundReason || 'Not specified'}<br>
                <strong>Order Date:</strong> ${order.createdAt || 'N/A'}
            </div>
            <div class="order-actions">
                <button class="btn-action btn-admin btn-approve" onclick="adminProcessRefund(${order.id}, true)">
                    ✅ Approve Refund
                </button>
                <button class="btn-action btn-admin btn-decline" onclick="adminProcessRefund(${order.id}, false)">
                    ❌ Decline Refund
                </button>
            </div>
        `;
        refundList.appendChild(div);
    });
    
    updateRefundStats();
}

function adminProcessRefund(orderId, approve) {
    const order = ordersDB.find(o => o.id === orderId);
    if (!order) return;
    
    if (approve) {
        order.status = ORDER_STATUSES.REFUNDED;
        order.refundProcessedAt = new Date().toLocaleString();
        order.refundProcessedBy = currentUser.name;
        showToast(`Refund approved for Order #${orderId}. Amount ₹${order.total} will be processed.`);
    } else {
        order.status = ORDER_STATUSES.DELIVERED; // Revert to delivered
        order.refundDeclinedAt = new Date().toLocaleString();
        order.refundDeclinedBy = currentUser.name;
        showToast(`Refund declined for Order #${orderId}.`);
    }
    
    // Refresh the refund list
    loadRefundManagement();
}

function loadSupportManagement() {
    const supportList = document.getElementById('adminSupportList');
    supportList.innerHTML = '';
    
    if (supportTicketsDB.length === 0) {
        supportList.innerHTML = '<p class="empty-state">No support tickets.</p>';
        return;
    }
    
    supportTicketsDB.forEach(ticket => {
        const div = document.createElement('div');
        div.className = 'ticket-card';
        
        const priorityClass = `priority-${ticket.priority.toLowerCase()}`;
        
        div.innerHTML = `
            <div class="ticket-header">
                <strong>Ticket #${ticket.id} - ${ticket.subject}</strong>
                <span class="ticket-priority ${priorityClass}">${ticket.priority}</span>
            </div>
            <div class="ticket-content">
                <p><strong>From:</strong> ${ticket.userId} (${ticket.userRole})</p>
                <p><strong>Description:</strong> ${ticket.description}</p>
                <p><strong>Status:</strong> ${ticket.status}</p>
                <p><strong>Created:</strong> ${ticket.createdAt}</p>
            </div>
            <div class="ticket-actions">
                <button class="btn-action btn-admin btn-respond" onclick="openTicketModal(${ticket.id})">
                    💬 Respond
                </button>
                <button class="btn-action btn-admin btn-approve" onclick="closeTicket(${ticket.id})">
                    ✅ Close Ticket
                </button>
            </div>
        `;
        supportList.appendChild(div);
    });
    
    updateSupportStats();
}

function openTicketModal(ticketId) {
    currentTicket = supportTicketsDB.find(t => t.id === ticketId);
    if (!currentTicket) return;
    
    const modal = document.getElementById('supportTicketModal');
    const details = document.getElementById('ticketDetails');
    
    let responsesHtml = '';
    if (currentTicket.responses && currentTicket.responses.length > 0) {
        responsesHtml = '<h4>Previous Responses:</h4>';
        currentTicket.responses.forEach(response => {
            responsesHtml += `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                    <strong>${response.from}:</strong> ${response.message}
                    <br><small>${response.timestamp}</small>
                </div>
            `;
        });
    }
    
    details.innerHTML = `
        <p><strong>Ticket #${currentTicket.id}:</strong> ${currentTicket.subject}</p>
        <p><strong>From:</strong> ${currentTicket.userId} (${currentTicket.userRole})</p>
        <p><strong>Priority:</strong> ${currentTicket.priority}</p>
        <p><strong>Description:</strong></p>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px; margin: 10px 0;">
            ${currentTicket.description}
        </div>
        ${responsesHtml}
        <h4>Your Response:</h4>
        <textarea id="ticketResponse" placeholder="Enter your response..." rows="4" style="width: 100%; margin: 10px 0;"></textarea>
    `;
    
    modal.style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('supportTicketModal').style.display = 'none';
    currentTicket = null;
}

function respondToTicket() {
    if (!currentTicket) return;
    
    const responseText = document.getElementById('ticketResponse').value.trim();
    if (!responseText) {
        alert('Please enter a response message.');
        return;
    }
    
    // Add response to ticket
    if (!currentTicket.responses) {
        currentTicket.responses = [];
    }
    
    currentTicket.responses.push({
        from: 'admin',
        message: responseText,
        timestamp: new Date().toLocaleString()
    });
    
    currentTicket.status = 'In Progress';
    
    showToast('Response sent successfully!');
    closeSupportModal();
    loadSupportManagement();
}

function closeTicket(ticketId) {
    const ticket = supportTicketsDB.find(t => t.id === ticketId);
    if (ticket) {
        ticket.status = 'Resolved';
        ticket.resolvedAt = new Date().toLocaleString();
        ticket.resolvedBy = currentUser.name;
        showToast(`Ticket #${ticketId} has been closed.`);
        loadSupportManagement();
    }
}

function loadAnalytics() {
    updateAnalyticsStats();
}

function loadUserManagement() {
    loadCooksList();
    loadStudentsList();
}

function loadCooksList() {
    const cooksList = document.getElementById('adminCooksList');
    cooksList.innerHTML = '';
    
    const cooks = kitchens.map(k => ({
        name: k.ownerName,
        kitchenName: k.name,
        specialty: k.specialty,
        isOpen: k.isOpen,
        id: k.id
    }));
    
    if (cooks.length === 0) {
        cooksList.innerHTML = '<p class="empty-state">No registered cooks.</p>';
        return;
    }
    
    cooks.forEach(cook => {
        const div = document.createElement('div');
        div.className = 'user-card';
        
        div.innerHTML = `
            <div class="user-info">
                <h4>${cook.name}</h4>
                <p>Kitchen: ${cook.kitchenName}</p>
                <p>Specialty: ${cook.specialty}</p>
                <p>Status: ${cook.isOpen ? '🟢 Open' : '🔴 Closed'}</p>
            </div>
            <div class="user-actions">
                <button class="btn-action btn-admin btn-respond" onclick="viewCookDetails(${cook.id})">
                    👁️ View Details
                </button>
            </div>
        `;
        cooksList.appendChild(div);
    });
}

function loadStudentsList() {
    const studentsList = document.getElementById('adminStudentsList');
    studentsList.innerHTML = '';
    
    // Get unique students from orders
    const students = [...new Set(ordersDB.map(o => o.studentName))].map(name => {
        const orders = ordersDB.filter(o => o.studentName === name);
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
        return {
            name: name,
            totalOrders: orders.length,
            totalSpent: totalSpent,
            lastOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : 'Never'
        };
    });
    
    if (students.length === 0) {
        studentsList.innerHTML = '<p class="empty-state">No registered students.</p>';
        return;
    }
    
    students.forEach(student => {
        const div = document.createElement('div');
        div.className = 'user-card';
        
        div.innerHTML = `
            <div class="user-info">
                <h4>${student.name}</h4>
                <p>Total Orders: ${student.totalOrders}</p>
                <p>Total Spent: ₹${student.totalSpent}</p>
                <p>Last Order: ${student.lastOrder || 'Never'}</p>
            </div>
            <div class="user-actions">
                <button class="btn-action btn-admin btn-respond" onclick="viewStudentDetails('${student.name}')">
                    👁️ View Details
                </button>
            </div>
        `;
        studentsList.appendChild(div);
    });
}

function updateAdminStats() {
    updateRefundStats();
    updateSupportStats();
    updateAnalyticsStats();
}

function updateRefundStats() {
    const pendingRefunds = ordersDB.filter(o => o.status === ORDER_STATUSES.REFUND_REQUESTED);
    const totalRefundAmount = pendingRefunds.reduce((sum, o) => sum + o.total, 0);
    const processedToday = ordersDB.filter(o => 
        o.status === ORDER_STATUSES.REFUNDED && 
        o.refundProcessedAt && 
        new Date(o.refundProcessedAt).toDateString() === new Date().toDateString()
    ).length;
    
    document.getElementById('pending-refunds-count').textContent = pendingRefunds.length;
    document.getElementById('total-refund-amount').textContent = `₹${totalRefundAmount}`;
    document.getElementById('processed-refunds-count').textContent = processedToday;
}

function updateSupportStats() {
    const openTickets = supportTicketsDB.filter(t => t.status === 'Open' || t.status === 'In Progress');
    const resolvedToday = supportTicketsDB.filter(t => 
        t.status === 'Resolved' && 
        t.resolvedAt && 
        new Date(t.resolvedAt).toDateString() === new Date().toDateString()
    ).length;
    
    document.getElementById('open-tickets-count').textContent = openTickets.length;
    document.getElementById('avg-response-time').textContent = '2h'; // Mock data
    document.getElementById('resolved-tickets-count').textContent = resolvedToday;
}

function updateAnalyticsStats() {
    const totalOrders = ordersDB.length;
    const totalRevenue = ordersDB.reduce((sum, o) => sum + o.total, 0);
    const activeKitchens = kitchens.filter(k => k.isOpen).length;
    const totalUsers = kitchens.length + [...new Set(ordersDB.map(o => o.studentName))].length;
    const totalBills = billsDB.length;
    
    document.getElementById('total-orders-count').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
    document.getElementById('active-kitchens-count').textContent = activeKitchens;
    document.getElementById('total-users-count').textContent = totalUsers;
    
    // Update bills info if element exists
    const billsElement = document.getElementById('total-bills-count');
    if (billsElement) {
        billsElement.textContent = totalBills;
    }
}

function viewCookDetails(cookId) {
    const kitchen = kitchens.find(k => k.id === cookId);
    if (kitchen) {
        const orders = ordersDB.filter(o => o.kitchenId === cookId);
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        
        alert(`Cook Details:\n\nName: ${kitchen.ownerName}\nKitchen: ${kitchen.name}\nSpecialty: ${kitchen.specialty}\nTotal Orders: ${orders.length}\nTotal Revenue: ₹${revenue}\nStatus: ${kitchen.isOpen ? 'Open' : 'Closed'}`);
    }
}

function viewStudentDetails(studentName) {
    const orders = ordersDB.filter(o => o.studentName === studentName);
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const favoriteKitchen = orders.length > 0 ? 
        kitchens.find(k => k.id === orders[0].kitchenId)?.name || 'Unknown' : 'None';
    
    alert(`Student Details:\n\nName: ${studentName}\nTotal Orders: ${orders.length}\nTotal Spent: ₹${totalSpent}\nFavorite Kitchen: ${favoriteKitchen}`);
}

// --- BILL GENERATION SYSTEM ---

function generateBill(order, paymentDetails) {
    const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = 50;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + tax;
    
    const kitchen = kitchens.find(k => k.id === order.kitchenId);
    
    const bill = {
        id: `BILL-${order.id}`,
        orderId: order.id,
        customerName: order.studentName,
        customerPhone: order.deliveryAddress.phone,
        customerAddress: order.deliveryAddress.address,
        kitchenName: kitchen ? kitchen.name : 'Unknown Kitchen',
        items: groupItemsByName(order.items).map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
            note: item.notes.join('; ') || ''
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        tax: tax,
        total: total,
        paymentMethod: order.paymentMethod,
        generatedAt: new Date().toLocaleString(),
        billNumber: `MKP-${Date.now()}`,
        status: 'Generated'
    };
    
    billsDB.push(bill);
    console.log('Bill generated:', bill);
    return bill;
}

function showBillModal(billId) {
    const bill = billsDB.find(b => b.id === billId);
    if (!bill) {
        alert('Bill not found!');
        return;
    }
    
    // Create bill modal if it doesn't exist
    let modal = document.getElementById('billModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'billModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const billHTML = generateBillHTML(bill);
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            ${billHTML}
            <div class="modal-actions" style="margin-top: 20px; text-align: center;">
                <button class="btn btn-secondary" onclick="downloadBillPDF('${billId}')">📄 Download PDF</button>
                <button class="btn btn-primary" onclick="printBill('${billId}')">🖨️ Print Bill</button>
                <button class="btn btn-text" onclick="closeBillModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function generateBillHTML(bill) {
    return `
        <div class="bill-container" id="bill-content-${bill.id}">
            <div class="bill-header">
                <h2 style="color: #2E7D32; text-align: center; margin-bottom: 10px;">
                    ❤️ माँ का प्यार (Maa Ka Pyaar)
                </h2>
                <p style="text-align: center; color: #757575; margin-bottom: 20px;">
                    Connecting Home Kitchens with Hungry Hearts
                </p>
                <hr style="border: 1px solid #2E7D32; margin-bottom: 20px;">
            </div>
            
            <div class="bill-info" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div>
                        <strong>Bill Number:</strong> ${bill.billNumber}<br>
                        <strong>Order ID:</strong> #${bill.orderId}<br>
                        <strong>Date:</strong> ${bill.generatedAt}
                    </div>
                    <div style="text-align: right;">
                        <strong>Kitchen:</strong> ${bill.kitchenName}<br>
                        <strong>Payment:</strong> ${bill.paymentMethod}
                    </div>
                </div>
                
                <div class="customer-details" style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                    <h4 style="margin-bottom: 10px; color: #2E7D32;">Customer Details:</h4>
                    <strong>Name:</strong> ${bill.customerName}<br>
                    <strong>Phone:</strong> ${bill.customerPhone}<br>
                    <strong>Address:</strong> ${bill.customerAddress}
                </div>
            </div>
            
            <div class="bill-items">
                <h4 style="color: #2E7D32; margin-bottom: 15px;">Order Details:</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #2E7D32; color: white;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bill.items.map(item => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">
                                    ${item.name}
                                    ${item.note ? `<br><small style="color: #757575;">Note: ${item.note}</small>` : ''}
                                </td>
                                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.unitPrice}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.totalPrice}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="bill-summary" style="border-top: 2px solid #2E7D32; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal:</span>
                    <span>₹${bill.subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Delivery Fee:</span>
                    <span>₹${bill.deliveryFee}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span>Tax (5%):</span>
                    <span>₹${bill.tax}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2em; font-weight: bold; color: #2E7D32; border-top: 1px solid #ddd; padding-top: 10px;">
                    <span>Total Amount:</span>
                    <span>₹${bill.total}</span>
                </div>
            </div>
            
            <div class="bill-footer" style="margin-top: 30px; text-align: center; color: #757575; font-size: 0.9em;">
                <p>Thank you for choosing माँ का प्यार!</p>
                <p>For support, contact us at support@makapyaar.com</p>
                <p style="margin-top: 15px; font-size: 0.8em;">
                    This is a computer-generated bill. No signature required.
                </p>
            </div>
        </div>
    `;
}

function closeBillModal() {
    const modal = document.getElementById('billModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function printBill(billId) {
    const bill = billsDB.find(b => b.id === billId);
    if (!bill) return;
    
    const printWindow = window.open('', '_blank');
    const billHTML = generateBillHTML(bill);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - ${bill.billNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .bill-container { max-width: 600px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                th { background: #2E7D32; color: white; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${billHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function downloadBillPDF(billId) {
    // For a simple implementation, we'll use the browser's print to PDF functionality
    // In a real application, you would use a library like jsPDF or send to server for PDF generation
    
    const bill = billsDB.find(b => b.id === billId);
    if (!bill) return;
    
    // Create a temporary window for PDF generation
    const pdfWindow = window.open('', '_blank');
    const billHTML = generateBillHTML(bill);
    
    pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - ${bill.billNumber}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background: white;
                }
                .bill-container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white;
                    padding: 20px;
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                th { background: #2E7D32; color: white; }
            </style>
        </head>
        <body>
            ${billHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }
            </script>
        </body>
        </html>
    `);
    
    pdfWindow.document.close();
    
    showToast('PDF download initiated. Use your browser\'s print dialog to save as PDF.');
}

function getBillByOrderId(orderId) {
    return billsDB.find(b => b.orderId === orderId);
}

// --- SUPPORT TICKET SYSTEM ---

function openSupportForm() {
    document.getElementById('supportFormModal').style.display = 'flex';
    // Clear form
    document.getElementById('supportForm').reset();
}

function closeSupportForm() {
    document.getElementById('supportFormModal').style.display = 'none';
}

function submitSupportTicket(event) {
    event.preventDefault();
    
    const subject = document.getElementById('supportSubject').value.trim();
    const description = document.getElementById('supportDescription').value.trim();
    const priority = document.getElementById('supportPriority').value;
    
    if (!subject || !description) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const ticketId = createSupportTicket(subject, description, priority);
    closeSupportForm();
    
    alert(`Support ticket #${ticketId} has been created successfully! Our team will respond within 24 hours.`);
}

function createSupportTicket(subject, description, priority = 'Medium') {
    const ticket = {
        id: Date.now(),
        userId: currentUser.name,
        userRole: currentUser.role,
        subject: subject,
        description: description,
        status: 'Open',
        priority: priority,
        createdAt: new Date().toLocaleString(),
        responses: []
    };
    
    supportTicketsDB.push(ticket);
    showToast('Support ticket created successfully!');
    return ticket.id;
}

// --- DEBUG FUNCTIONS ---



