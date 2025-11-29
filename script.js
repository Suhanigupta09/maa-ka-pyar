// --- STATE MANAGEMENT ---
let currentUser = { name: '', role: '', mobile: '', address: '' };
let activeCategory = 'breakfast';
let cart = [];
let tempItem = null; // Item being customized

// --- EXPANDED MOCK DATABASE (10+ Items per Category) ---
// Using placeholder images that match the theme colors (Green #2E7D32 text on Light Green background #e8f5e9)
const getImg = (text) => `https://placehold.co/400x300/e8f5e9/2e7d32?text=${encodeURIComponent(text)}`;

let menuDB = [
    // --- BREAKFAST ---
    { id: 101, name: "Aloo Paratha & Curd", price: 60, category: "breakfast", image: getImg("Aloo Paratha") },
    { id: 102, name: "Vegetable Poha", price: 40, category: "breakfast", image: getImg("Veg Poha") },
    { id: 103, name: "Idli Sambar (4 pcs)", price: 50, category: "breakfast", image: getImg("Idli Sambar") },
    { id: 104, name: "Masala Dosa", price: 70, category: "breakfast", image: getImg("Masala Dosa") },
    { id: 105, name: "Rava Upma", price: 45, category: "breakfast", image: getImg("Upma") },
    { id: 106, name: "Chole Bhature", price: 90, category: "breakfast", image: getImg("Chole Bhature") },
    { id: 107, name: "Paneer Paratha", price: 80, category: "breakfast", image: getImg("Paneer Paratha") },
    { id: 108, name: "Egg Bhurji & Pav", price: 65, category: "breakfast", image: getImg("Egg Bhurji") },
    { id: 109, name: "Bombay Sandwich", price: 50, category: "breakfast", image: getImg("Sandwich") },
    { id: 110, name: "Puri Bhaji", price: 55, category: "breakfast", image: getImg("Puri Bhaji") },

    // --- LUNCH ---
    { id: 201, name: "Special Veg Thali", price: 120, category: "lunch", image: getImg("Veg Thali") },
    { id: 202, name: "Rajma Chawal Bowl", price: 90, category: "lunch", image: getImg("Rajma Chawal") },
    { id: 203, name: "Kadhi Pakora & Rice", price: 85, category: "lunch", image: getImg("Kadhi Chawal") },
    { id: 204, name: "Dal Makhani Combo", price: 110, category: "lunch", image: getImg("Dal Makhani") },
    { id: 205, name: "Paneer Butter Masala", price: 140, category: "lunch", image: getImg("Paneer Masala") },
    { id: 206, name: "Egg Curry & Rice", price: 100, category: "lunch", image: getImg("Egg Curry") },
    { id: 207, name: "Home Style Chicken", price: 160, category: "lunch", image: getImg("Chicken Curry") },
    { id: 208, name: "Jeera Rice & Dal Fry", price: 80, category: "lunch", image: getImg("Dal Fry") },
    { id: 209, name: "Bhindi Masala & Roti", price: 75, category: "lunch", image: getImg("Bhindi Masala") },
    { id: 210, name: "Mini Thali (Dal/Sabzi)", price: 70, category: "lunch", image: getImg("Mini Thali") },

    // --- SNACKS ---
    { id: 301, name: "Masala Chai & Bun", price: 30, category: "snack", image: getImg("Chai Bun") },
    { id: 302, name: "Samosa (2 pcs)", price: 25, category: "snack", image: getImg("Samosa") },
    { id: 303, name: "Mix Pakora Plate", price: 40, category: "snack", image: getImg("Pakora") },
    { id: 304, name: "Vada Pav", price: 20, category: "snack", image: getImg("Vada Pav") },
    { id: 305, name: "Bhel Puri", price: 35, category: "snack", image: getImg("Bhel Puri") },
    { id: 306, name: "Pani Puri (6 pcs)", price: 30, category: "snack", image: getImg("Pani Puri") },
    { id: 307, name: "Veg Grilled Sandwich", price: 60, category: "snack", image: getImg("Grill Sandwich") },
    { id: 308, name: "Vegetable Maggi", price: 40, category: "snack", image: getImg("Veg Maggi") },
    { id: 309, name: "Bread Pakora", price: 25, category: "snack", image: getImg("Bread Pakora") },
    { id: 310, name: "Veg Cutlet", price: 35, category: "snack", image: getImg("Veg Cutlet") },

    // --- DINNER ---
    { id: 401, name: "Dal Khichdi", price: 80, category: "dinner", image: getImg("Dal Khichdi") },
    { id: 402, name: "Roti Sabzi Combo", price: 70, category: "dinner", image: getImg("Roti Sabzi") },
    { id: 403, name: "Veg Fried Rice", price: 90, category: "dinner", image: getImg("Fried Rice") },
    { id: 404, name: "Veg Biryani", price: 110, category: "dinner", image: getImg("Veg Biryani") },
    { id: 405, name: "Palak Paneer & Roti", price: 130, category: "dinner", image: getImg("Palak Paneer") },
    { id: 406, name: "Malai Kofta", price: 140, category: "dinner", image: getImg("Malai Kofta") },
    { id: 407, name: "Sev Tamatar & Paratha", price: 90, category: "dinner", image: getImg("Sev Tamatar") },
    { id: 408, name: "Soup & Salad", price: 85, category: "dinner", image: getImg("Soup Salad") },
    { id: 409, name: "Hakka Noodles", price: 95, category: "dinner", image: getImg("Noodles") },
    { id: 410, name: "Aloo Gobhi & Roti", price: 75, category: "dinner", image: getImg("Aloo Gobhi") },
];

// --- 1. NAVIGATION & AUTH ---

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Logic to handle IDs ending with '-screen'
    const targetId = screenId.endsWith('-screen') ? screenId : screenId + '-screen';
    const target = document.getElementById(targetId);
    
    if (target) {
        target.classList.add('active');
    } else {
        console.error("Screen not found:", targetId);
    }
}

function goToLogin(role) {
    currentUser.role = role;
    const title = document.getElementById('auth-title');
    title.textContent = role === 'cook' ? "👩‍🍳 Register as Mother" : "🧑‍💻 Register as Student";
    showScreen('auth');
}

function handleLogin(event) {
    event.preventDefault();
    currentUser.name = document.getElementById('u_name').value;
    currentUser.mobile = document.getElementById('u_mobile').value;
    currentUser.address = document.getElementById('u_address').value;

    // Populate Profile
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-mobile').textContent = currentUser.mobile;
    document.getElementById('profile-address').textContent = currentUser.address;

    if (currentUser.role === 'cook') {
        showScreen('mother-dashboard');
    } else {
        showScreen('student-dashboard');
        renderStudentMenu();
    }
}

function logout() {
    currentUser = {};
    cart = [];
    showScreen('role');
}

// --- 2. STUDENT DASHBOARD LOGIC ---

function filterMenu(category) {
    activeCategory = category;
    
    // UI Update
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Simple way to highlight active tab based on text
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if(btn.innerText.toLowerCase().includes(category)) {
            btn.classList.add('active');
        }
    });

    document.getElementById('menuTitle').innerText = category.charAt(0).toUpperCase() + category.slice(1) + " Menu";
    renderStudentMenu();
}

function searchMenu() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (query === '') {
        renderStudentMenu();
        return;
    }

    const filtered = menuDB.filter(item => item.name.toLowerCase().includes(query));
    document.getElementById('menuTitle').innerText = `Search Results for "${query}"`;
    renderItems(filtered);
}

function renderStudentMenu() {
    const filtered = menuDB.filter(item => item.category === activeCategory);
    renderItems(filtered);
}

function renderItems(items) {
    const container = document.getElementById('studentMenuList');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No delicious food found here yet.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'food-card';
        // ADDED IMAGE TAG HERE
        div.innerHTML = `
            <div class="food-img-container">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="food-details">
                <h4>${item.name}</h4>
                <span class="price">₹${item.price}</span>
                <button class="btn btn-primary btn-small full-width" onclick="openCustomModal(${item.id})">Add to Plate</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- 3. CUSTOMIZATION & CART (Same as before) ---

function openCustomModal(itemId) {
    tempItem = menuDB.find(i => i.id === itemId);
    document.getElementById('modalFoodName').innerText = tempItem.name;
    document.querySelectorAll('#customModal input[type=checkbox]').forEach(c => c.checked = false);
    document.getElementById('customNote').value = '';
    document.getElementById('customModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
}

function confirmAddToCart() {
    let prefs = [];
    if(document.getElementById('opt-spicy').checked) prefs.push("Less Spicy");
    if(document.getElementById('opt-oil').checked) prefs.push("Less Oil");
    if(document.getElementById('opt-sugar').checked) prefs.push("Less Sugar");
    
    const note = document.getElementById('customNote').value;
    
    const cartItem = {
        ...tempItem,
        cartId: Date.now(),
        prefs: prefs,
        note: note
    };

    cart.push(cartItem);
    updateCartUI();
    closeModal();
    
    // Toast simulation
    const btn = document.querySelector('.search-btn');
    if(btn) {
        const originalColor = btn.style.backgroundColor;
        btn.style.backgroundColor = "#4CAF50";
        setTimeout(() => btn.style.backgroundColor = originalColor, 500);
    }
}

function updateCartUI() {
    const list = document.getElementById('cartList');
    const badge = document.getElementById('cart-count');
    const totalEl = document.getElementById('cartTotal');
    
    list.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += parseInt(item.price);
        const li = document.createElement('li');
        
        let subtext = item.prefs.join(', ');
        if (item.note) subtext += (subtext ? ' | ' : '') + `"${item.note}"`;

        li.innerHTML = `
            <div style="flex-grow:1;">
                <strong>${item.name}</strong> <br>
                ${subtext ? `<span class="cust-badge">${subtext}</span>` : ''}
            </div>
            <div style="text-align:right;">
                ₹${item.price}
                <button class="remove-btn" onclick="removeItem(${index})">&times;</button>
            </div>
        `;
        list.appendChild(li);
    });

    if (cart.length === 0) list.innerHTML = '<li class="empty-state">Plate is empty</li>';
    
    totalEl.textContent = total;
    badge.textContent = cart.length;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function placeOrder() {
    if (cart.length === 0) {
        alert("Please add food first!");
        return;
    }
    alert("Order Sent to Mom! 🍲 She will accept it shortly.");
    cart = [];
    updateCartUI();
}

function scrollToCart() {
    const el = document.getElementById('cart-anchor');
    if(el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
        document.getElementById('notif-badge').style.display = 'none';
    }
}

function openProfile() {
    document.getElementById('profileModal').style.display = 'flex';
}
function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function addFoodItem() {
    const name = document.getElementById('foodName').value;
    const price = document.getElementById('foodPrice').value;
    const cat = document.getElementById('mealCategory').value;

    if(name && price) {
        // Use default image for new items
        menuDB.push({ 
            id: Date.now(), 
            name, 
            price, 
            category: cat,
            image: getImg(name)
        });
        alert("Item added to menu!");
    }
}

function updateBroadcast() {
    const msg = document.getElementById('motherBroadcastInput').value;
    document.getElementById('studentBroadcastDisplay').textContent = `"${msg}"`;
    alert("Message updated!");
}