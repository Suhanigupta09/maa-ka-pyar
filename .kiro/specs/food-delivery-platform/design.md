# Design Document

## Overview

The Food Delivery Platform is a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. The architecture follows a screen-based navigation pattern where different views are shown/hidden based on user actions. The application uses in-memory data storage with JavaScript objects and arrays to manage state, making it suitable for demonstration and learning purposes.

The design emphasizes simplicity and maintainability by using a functional programming approach with clear separation between data management, UI rendering, and event handling. All styling uses CSS custom properties for consistent theming and responsive design principles for mobile compatibility.

## Architecture

### Application Structure

The application consists of three main layers:

1. **Presentation Layer (HTML/CSS)**
   - Static HTML structure with multiple screen containers
   - CSS-based styling with custom properties for theming
   - Responsive grid layouts for different screen sizes

2. **State Management Layer (JavaScript)**
   - In-memory data stores for users, kitchens, menus, orders, and cart
   - Global state objects tracking current user, active kitchen, and session data
   - Pure functions for state updates and queries

3. **Controller Layer (JavaScript)**
   - Event handlers for user interactions
   - Navigation functions for screen transitions
   - Data binding functions to sync state with UI

### Screen Flow

```
Role Selection → Authentication → Dashboard (Cook or Student)
                                      ↓
                        Cook: Kitchen Management + Orders
                        Student: Kitchen Browse → Menu View → Cart → Checkout
```

## Components and Interfaces

### Data Models

#### User Model
```javascript
{
  name: string,        // User's full name
  role: string,        // 'cook' or 'student'
  mobile: string       // Phone number
}
```

#### Kitchen Model
```javascript
{
  id: number,          // Unique identifier (timestamp)
  name: string,        // Kitchen display name
  ownerName: string,   // Cook's name
  specialty: string,   // Cuisine type or specialty
  rating: number,      // Rating out of 5
  image: string        // Placeholder image URL
}
```

#### Menu Item Model
```javascript
{
  id: number,          // Unique identifier
  kitchenId: number,   // Reference to kitchen
  name: string,        // Item name
  price: number,       // Price in rupees
  category: string,    // 'breakfast', 'lunch', 'snack', 'dinner'
  image: string        // Placeholder image URL
}
```

#### Cart Item Model
```javascript
{
  ...MenuItem,         // All menu item properties
  note: string         // Optional special request
}
```

#### Order Model
```javascript
{
  id: number,                    // Unique identifier
  kitchenId: number,             // Reference to kitchen
  studentName: string,           // Student who placed order
  items: CartItem[],             // Array of ordered items
  total: number,                 // Total price including fees
  note: string,                  // Combined special notes
  status: string,                // 'Pending', 'Accepted', 'Declined'
  deliveryAddress: {
    name: string,
    phone: string,
    address: string
  }
}
```

### Core Functions

#### Navigation Functions
- `showScreen(screenId)` - Displays specified screen and hides others
- `goToLogin(role)` - Sets user role and navigates to auth screen
- `logout()` - Clears session and returns to role selection

#### Authentication Functions
- `handleLogin(event)` - Processes login form submission
- Creates or retrieves kitchen for cooks
- Initializes appropriate dashboard

#### Cook Dashboard Functions
- `loadMotherOrders()` - Renders incoming orders for the cook
- `updateOrderStatus(orderId, status)` - Updates order state
- `addMyMenuItem()` - Adds new item to cook's menu
- `loadMotherMenuTable()` - Displays cook's current menu
- `saveKitchenProfile()` - Updates kitchen information

#### Student Dashboard Functions
- `renderKitchensList()` - Displays grid of available kitchens
- `openKitchen(kitchenId)` - Shows menu for selected kitchen
- `backToKitchens()` - Returns to kitchen selection view
- `filterMenu(category)` - Filters menu items by meal type

#### Cart Functions
- `openModal(itemId)` - Shows add-to-cart dialog
- `confirmAddToCart()` - Adds item with note to cart
- `updateCart()` - Re-renders cart UI and updates totals
- `removeItem(index)` - Removes item from cart

#### Checkout Functions
- `placeOrder()` - Navigates to checkout screen
- `loadCheckout()` - Populates order summary
- `calculateTotal()` - Computes subtotal, fees, tax, and total
- `confirmPayment()` - Validates forms and creates order
- `backToCart()` - Returns to student dashboard

#### Utility Functions
- `toggleNotifications()` - Shows/hides notification dropdown
- `scrollToCart()` - Smooth scrolls to cart section
- `getImg(text)` - Generates placeholder image URL

## Data Models

### State Management

The application maintains several global state variables:

- `currentUser` - Currently logged-in user object
- `currentKitchen` - Kitchen object for logged-in cook
- `activeKitchenId` - ID of kitchen being viewed by student
- `activeCategory` - Currently selected meal category filter
- `cart` - Array of cart items for current student
- `ordersDB` - Array of all orders in the system
- `kitchens` - Array of all kitchen objects
- `menuDB` - Array of all menu items across all kitchens

### Data Persistence

Since this is a basic implementation using vanilla JavaScript:
- All data is stored in memory (JavaScript variables)
- Data is lost on page refresh
- No backend API or database integration
- Suitable for demonstration and learning purposes

For a production system, this would be replaced with:
- LocalStorage for client-side persistence
- REST API calls to a backend server
- Database storage (e.g., MongoDB, PostgreSQL)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable criteria, several properties can be consolidated:

- Properties 3.1 and 3.2 (kitchen updates) can be combined into a single property about kitchen profile updates
- Properties 5.4 and 5.5 (order status updates) can be combined into a single property about status transitions
- Properties 8.2 and 8.4 (cart updates) overlap - cart count and total both update together
- Properties 9.2 and 9.4 (cart removal and total) can be combined
- Properties 13.1, 13.2, and 13.3 (logout behaviors) can be combined into a comprehensive logout property

### Correctness Properties

Property 1: Role selection navigation
*For any* selected role (cook or student), clicking the role button should navigate to the authentication screen with the appropriate title
**Validates: Requirements 1.2**

Property 2: Valid authentication creates session
*For any* valid name and mobile number combination, submitting the authentication form should create a user session and navigate to the appropriate dashboard based on role
**Validates: Requirements 2.1**

Property 3: Empty authentication is rejected
*For any* authentication form submission where name or mobile fields are empty or contain only whitespace, the system should prevent submission and maintain the current screen
**Validates: Requirements 2.2**

Property 4: New cook kitchen creation
*For any* cook name that doesn't exist in the kitchens database, authenticating should create a new kitchen with default values and the cook's name as owner
**Validates: Requirements 2.3**

Property 5: Returning cook data persistence
*For any* cook who has previously authenticated, re-authenticating with the same name should load their existing kitchen profile and menu items
**Validates: Requirements 2.4**

Property 6: Kitchen profile updates persist
*For any* kitchen profile field (name or specialty), updating the value should save it to the kitchen object and make it visible to students browsing kitchens
**Validates: Requirements 3.1, 3.2**

Property 7: Kitchen dashboard displays current data
*For any* cook viewing their dashboard, the kitchen name and specialty form fields should contain the current values from their kitchen object
**Validates: Requirements 3.3**

Property 8: Valid menu item addition
*For any* menu item with non-empty name and positive price, adding it should increase the cook's menu size by one and display it in the active menu list
**Validates: Requirements 4.1**

Property 9: Invalid menu item rejection
*For any* menu item with empty name or missing price, attempting to add it should not change the menu and should maintain the current state
**Validates: Requirements 4.2**

Property 10: Menu item category assignment
*For any* added menu item, it should be assigned to exactly one of the four valid categories: breakfast, lunch, snack, or dinner
**Validates: Requirements 4.3**

Property 11: Menu display completeness
*For any* cook's menu, the displayed menu list should contain all menu items belonging to that kitchen with their names and prices
**Validates: Requirements 4.4**

Property 12: Order creation and display
*For any* student order placed, the order should appear in the corresponding cook's incoming orders panel with status set to Pending
**Validates: Requirements 5.1**

Property 13: Order information completeness
*For any* displayed order, the rendered HTML should contain the student name, all ordered item names, total price, and any special notes
**Validates: Requirements 5.2**

Property 14: Order status transitions
*For any* order, when a cook accepts or declines it, the order status should update to Accepted or Declined respectively and the change should be reflected in the UI
**Validates: Requirements 5.4, 5.5**

Property 15: Kitchen list completeness
*For any* student dashboard load, all kitchens in the database should be displayed in the kitchen grid with their names and specialties
**Validates: Requirements 6.1**

Property 16: Kitchen selection navigation
*For any* kitchen card clicked by a student, the system should navigate to the menu view for that specific kitchen
**Validates: Requirements 6.2**

Property 17: Kitchen card information completeness
*For any* rendered kitchen card, it should display the kitchen name, specialty, and image
**Validates: Requirements 6.3**

Property 18: Menu category filtering
*For any* selected category tab, the displayed menu items should include only items belonging to that category and exclude all others
**Validates: Requirements 7.2**

Property 19: Menu item display completeness
*For any* displayed menu item, the rendered card should show the item name, price, image, and an add button
**Validates: Requirements 7.4**

Property 20: Add to cart modal display
*For any* menu item, clicking its add button should display the modal dialog with the item name
**Validates: Requirements 8.1**

Property 21: Cart addition increases count
*For any* item added to the cart, the cart count badge should increase by one and the item should appear in the cart list
**Validates: Requirements 8.2**

Property 22: Special notes persistence
*For any* item added to cart with a special note, the note should be stored with the cart item and retrievable
**Validates: Requirements 8.3**

Property 23: Cart total calculation
*For any* cart state, the displayed total should equal the sum of all item prices in the cart
**Validates: Requirements 8.4, 9.4**

Property 24: Cart display completeness
*For any* non-empty cart, all cart items should be displayed with their names and prices
**Validates: Requirements 9.1**

Property 25: Cart item removal
*For any* item removed from the cart, the cart size should decrease by one and the total should be recalculated to exclude that item's price
**Validates: Requirements 9.2**

Property 26: Checkout navigation with items
*For any* cart containing at least one item, clicking the place order button should navigate to the checkout screen
**Validates: Requirements 10.1**

Property 27: Checkout summary completeness
*For any* checkout screen load, the order summary should display all cart items, subtotal, delivery fee, tax, and total
**Validates: Requirements 10.3**

Property 28: Checkout pre-fill
*For any* checkout screen load, the delivery name and phone fields should be pre-filled with the current student's authentication information
**Validates: Requirements 10.4**

Property 29: Delivery address validation
*For any* checkout form submission, if name, phone, or address fields are empty, the system should display an alert and prevent order creation
**Validates: Requirements 11.1**

Property 30: Payment information validation
*For any* checkout form submission, if card number, expiry, CVV, or cardholder name fields are empty, the system should display an alert and prevent order creation
**Validates: Requirements 11.2**

Property 31: Incomplete checkout prevention
*For any* checkout form with one or more missing required fields, submitting should not create an order and should display an alert
**Validates: Requirements 11.3**

Property 32: Complete checkout creates order
*For any* checkout form with all required fields filled, submitting should create an order with Pending status, clear the cart, and navigate back to the student dashboard
**Validates: Requirements 11.4**

Property 33: Order status notification propagation
*For any* order status update by a cook, the new status should be available in the corresponding student's notifications dropdown
**Validates: Requirements 12.1**

Property 34: Notifications dropdown display
*For any* student clicking the notifications icon, the dropdown should display with order status updates for that student
**Validates: Requirements 12.2**

Property 35: Logout clears session
*For any* user logout, the system should clear the current user data, clear the cart if the user is a student, and navigate to the role selection screen
**Validates: Requirements 13.1, 13.2, 13.3**

## Error Handling

### Input Validation Errors

**Empty Form Fields**
- Authentication forms validate that name and mobile are not empty
- Menu item forms validate that name and price are provided
- Checkout forms validate all required fields before submission
- Error handling: Display browser alert and prevent form submission

**Invalid Data Types**
- Price fields expect numeric input
- Mobile fields expect phone number format
- Error handling: HTML5 input type validation prevents submission

### Navigation Errors

**Screen Not Found**
- If `showScreen()` is called with invalid screen ID
- Error handling: Console error logged, no screen change occurs

**Missing Data References**
- If kitchen ID or menu item ID doesn't exist
- Error handling: Function returns early or displays empty state

### State Errors

**Empty Cart Checkout**
- Student attempts to place order with no items
- Error handling: Display alert and prevent navigation to checkout

**Missing User Session**
- Functions called before authentication
- Error handling: Graceful degradation, display empty states

## Testing Strategy

### Unit Testing Approach

The application will use **Vitest** as the testing framework for unit tests. Unit tests will focus on:

**Data Manipulation Functions**
- Test `calculateTotal()` with various cart configurations
- Test order creation with different item combinations
- Test kitchen creation with various user inputs
- Test menu filtering logic with different categories

**State Management Functions**
- Test cart addition and removal operations
- Test order status updates
- Test user session management
- Test kitchen profile updates

**Validation Functions**
- Test empty field validation
- Test form submission prevention
- Test data type validation

**Example Unit Tests:**
```javascript
describe('calculateTotal', () => {
  it('should calculate correct total with items, delivery, and tax', () => {
    const cart = [
      { name: 'Item 1', price: 100 },
      { name: 'Item 2', price: 50 }
    ];
    const total = calculateTotal(cart);
    expect(total).toBe(207); // 150 + 50 delivery + 7 tax (5%)
  });
});

describe('addToCart', () => {
  it('should increase cart size by one', () => {
    const initialSize = cart.length;
    addToCart({ id: 1, name: 'Test', price: 50 });
    expect(cart.length).toBe(initialSize + 1);
  });
});
```

### Property-Based Testing Approach

The application will use **fast-check** as the property-based testing library for JavaScript. Property-based tests will verify universal properties across many randomly generated inputs.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for domain-specific data (users, menu items, orders)
- Each test will be tagged with a comment referencing the design document property

**Property Test Categories:**

1. **Navigation Properties**
   - Test that role selection always leads to authentication
   - Test that valid login always leads to appropriate dashboard
   - Test that logout always returns to role selection

2. **Data Persistence Properties**
   - Test that kitchen updates are always reflected in listings
   - Test that menu additions are always displayed
   - Test that order status changes are always visible

3. **Cart Operations Properties**
   - Test that cart total always equals sum of item prices
   - Test that adding items always increases cart count
   - Test that removing items always decreases cart count

4. **Validation Properties**
   - Test that empty inputs are always rejected
   - Test that valid inputs always succeed
   - Test that incomplete checkouts never create orders

5. **Order Lifecycle Properties**
   - Test that new orders always have Pending status
   - Test that status updates always propagate to notifications
   - Test that completed checkouts always clear the cart

**Example Property Tests:**
```javascript
import fc from 'fast-check';

// **Feature: food-delivery-platform, Property 23: Cart total calculation**
describe('Property 23: Cart total calculation', () => {
  it('cart total should always equal sum of item prices', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer(),
          name: fc.string(),
          price: fc.integer({ min: 1, max: 1000 }),
          category: fc.constantFrom('breakfast', 'lunch', 'snack', 'dinner')
        })),
        (items) => {
          cart = items;
          updateCart();
          const displayedTotal = parseInt(document.getElementById('cartTotal').innerText);
          const expectedTotal = items.reduce((sum, item) => sum + item.price, 0);
          return displayedTotal === expectedTotal;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: food-delivery-platform, Property 18: Menu category filtering**
describe('Property 18: Menu category filtering', () => {
  it('filtered menu should only show items from selected category', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('breakfast', 'lunch', 'snack', 'dinner'),
        fc.array(fc.record({
          id: fc.integer(),
          kitchenId: fc.constant(1),
          name: fc.string(),
          price: fc.integer({ min: 1, max: 500 }),
          category: fc.constantFrom('breakfast', 'lunch', 'snack', 'dinner')
        })),
        (selectedCategory, menuItems) => {
          menuDB = menuItems;
          activeKitchenId = 1;
          filterMenu(selectedCategory);
          
          const displayedItems = document.querySelectorAll('.food-card');
          const expectedItems = menuItems.filter(
            item => item.kitchenId === 1 && item.category === selectedCategory
          );
          
          return displayedItems.length === expectedItems.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

While the focus is on unit and property-based tests, key integration scenarios should be manually tested:

- Complete user flow: Role selection → Login → Browse → Add to cart → Checkout
- Cook flow: Login → Add menu items → Receive order → Update status
- Cross-user interaction: Student places order → Cook sees order → Cook updates status → Student sees notification

### Test Coverage Goals

- Aim for 80%+ code coverage on core business logic
- All correctness properties must have corresponding property-based tests
- Critical user paths must have integration test scenarios
- Edge cases (empty states, validation failures) must have unit tests

## Implementation Notes

### Browser Compatibility

- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use standard JavaScript (ES6+) features
- Avoid experimental APIs
- Test responsive design on mobile viewports

### Performance Considerations

- Minimize DOM manipulations by batching updates
- Use event delegation where appropriate
- Avoid unnecessary re-renders of large lists
- Keep in-memory data structures simple and flat

### Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation works for all interactive elements
- Provide appropriate ARIA labels for dynamic content
- Maintain sufficient color contrast ratios

### Future Enhancements

This basic implementation can be extended with:
- LocalStorage for data persistence across page refreshes
- Backend API integration for multi-user support
- Real-time updates using WebSockets
- Image upload functionality for kitchens and menu items
- Advanced search and filtering capabilities
- Rating and review system
- Order history and tracking
- Payment gateway integration
