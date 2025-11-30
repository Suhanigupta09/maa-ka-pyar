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
    currentUser.role = role; // Set role (cook/student)
    document.getElementById('auth-title').innerText = role === 'cook' ? "👩‍🍳 Mother Login" : "🧑‍💻 Student Login";
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
                // New Mother -> Create Kitchen
                k = { 
                    id: Date.now(), 
                    name: `${name}'s Kitchen`, 
                    ownerName: name, 
                    specialty: "Home Food", 
                    rating: 5.0, 
                    image: getImg(name) 
                };
                kitchens.push(k);
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
            loadKitchenTimingSettings();
            
            showScreen('mother-dashboard');
        } else {
            // Student Login
            showScreen('student-dashboard');
            renderKitchensList();
            updateNotificationBadge();
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
                ${order.items.map(i => `${i.name} x1`).join(', ')}
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
    const autoCheckbox = document.getElementById('autoTimingCheckbox');
    const manualSection = document.getElementById('manualTimingSection');
    
    if (autoCheckbox.checked) {
        manualSection.style.display = 'none';
        currentKitchen.autoTiming = true;
        currentKitchen.openingTime = "09:00";
        currentKitchen.closingTime = "21:00";
        checkAutoTiming();
    } else {
        manualSection.style.display = 'block';
        currentKitchen.autoTiming = false;
    }
}

function toggleKitchenStatus() {
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    currentKitchen.isOpen = checkbox.checked;
    updateKitchenStatusDisplay();
}

function saveKitchenTiming() {
    if (!currentKitchen.autoTiming) {
        currentKitchen.openingTime = document.getElementById('openingTime').value;
        currentKitchen.closingTime = document.getElementById('closingTime').value;
    }
    alert("Timing settings saved successfully!");
    updateKitchenStatusDisplay();
}

function updateKitchenStatusDisplay() {
    const statusDiv = document.getElementById('kitchenStatusDisplay');
    const statusText = document.getElementById('statusText');
    
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
    if (!currentKitchen || !currentKitchen.autoTiming) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Auto timing: 9 AM to 9 PM
    if (currentHour >= 9 && currentHour < 21) {
        currentKitchen.isOpen = true;
    } else {
        currentKitchen.isOpen = false;
    }
    
    const checkbox = document.getElementById('kitchenOpenCheckbox');
    if (checkbox) {
        checkbox.checked = currentKitchen.isOpen;
        updateKitchenStatusDisplay();
    }
}

function loadKitchenTimingSettings() {
    if (!currentKitchen) return;
    
    // Set default values if not present
    if (currentKitchen.autoTiming === undefined) currentKitchen.autoTiming = true;
    if (currentKitchen.isOpen === undefined) currentKitchen.isOpen = true;
    if (!currentKitchen.openingTime) currentKitchen.openingTime = "09:00";
    if (!currentKitchen.closingTime) currentKitchen.closingTime = "21:00";
    
    // Load values into form
    document.getElementById('autoTimingCheckbox').checked = currentKitchen.autoTiming;
    document.getElementById('openingTime').value = currentKitchen.openingTime;
    document.getElementById('closingTime').value = currentKitchen.closingTime;
    document.getElementById('kitchenOpenCheckbox').checked = currentKitchen.isOpen;
    
    // Show/hide manual timing section
    const manualSection = document.getElementById('manualTimingSection');
    manualSection.style.display = currentKitchen.autoTiming ? 'none' : 'block';
    
    // Check auto timing if enabled
    if (currentKitchen.autoTiming) {
        checkAutoTiming();
    }
    
    updateKitchenStatusDisplay();
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
                <strong>Items:</strong> ${order.items.map(i => i.name).join(', ')}<br>
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
                <strong>Items:</strong> ${order.items.map(i => i.name).join(', ')}<br>
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
        div.onclick = () => openKitchen(k.id);
        
        const statusBadge = k.isOpen 
            ? '<span style="color: #4CAF50; font-weight: bold;">● Open</span>' 
            : '<span style="color: #d32f2f; font-weight: bold;">● Closed</span>';
        
        div.innerHTML = `
            <div class="kitchen-img-box"><img src="${k.image}"></div>
            <div class="kitchen-info">
                <h3>${k.name}</h3>
                <p>${k.specialty}</p>
                <p style="font-size: 0.85rem;">${statusBadge} ${k.openingTime} - ${k.closingTime}</p>
            </div>
        `;
        grid.appendChild(div);
    });
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
    
    // Group items by name for better display
    const groupedItems = {};
    cart.forEach((item, idx) => {
        const key = item.name;
        if (!groupedItems[key]) {
            groupedItems[key] = {
                name: item.name,
                price: item.price,
                count: 0,
                indices: []
            };
        }
        groupedItems[key].count++;
        groupedItems[key].indices.push(idx);
        total += item.price;
    });
    
    if (cart.length === 0) {
        list.innerHTML = '<li class="empty-state">Plate is empty</li>';
    } else {
        Object.values(groupedItems).forEach(group => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${group.name} ${group.count > 1 ? `x${group.count}` : ''}</span>
                <span class="price">₹${group.price * group.count}</span>
                <button class="remove-btn" onclick="removeItemGroup('${group.name}')">×</button>
            `;
            list.appendChild(li);
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
    // Populate order summary
    const itemsDiv = document.getElementById('checkoutItems');
    itemsDiv.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-line';
        div.innerHTML = `<span>${item.name}</span> <span>₹${item.price}</span>`;
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

    const newOrder = {
        id: Date.now(),
        kitchenId: kId,
        studentName: currentUser.name || "Student",
        items: [...cart],
        total: total,
        note: cart.map(i => i.note).filter(n => n).join('; ') || "Please deliver fast!",
        status: 'Pending',
        deliveryAddress: { name, phone, address }
    };

    ordersDB.push(newOrder);

    // Clear cart and redirect
    cart = [];
    updateCart();
    alert("Payment successful! Order placed. 🚀");
    showScreen('student-dashboard');
    renderKitchensList();
}

function backToCart() {
    showScreen('student-dashboard');
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
            li.innerHTML = `${statusIcon} Order #${o.id} (₹${o.total}): <strong>${o.status}</strong>`;
            if (o.updatedAt) {
                li.innerHTML += `<br><small>${o.updatedAt}</small>`;
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