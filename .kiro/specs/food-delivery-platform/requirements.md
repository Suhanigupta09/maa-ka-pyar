# Requirements Document

## Introduction

The Food Delivery Platform is a web-based application that connects home cooks (mothers) with students seeking homemade meals. The system enables cooks to manage their kitchen profiles and menus, while students can browse available kitchens, place orders, and track their deliveries. The platform facilitates the entire order lifecycle from menu browsing to payment processing, built using HTML, CSS, and vanilla JavaScript.

## Glossary

- **System**: The Food Delivery Platform web application
- **Cook**: A home cook (mother) who prepares and sells homemade food through the platform
- **Student**: A customer who browses menus and orders food from cooks
- **Kitchen**: A cook's virtual storefront containing their profile and menu items
- **Menu Item**: A food dish offered by a cook, categorized by meal type
- **Cart**: A temporary collection of menu items selected by a student before checkout
- **Order**: A confirmed purchase request from a student to a cook
- **Order Status**: The current state of an order (Pending, Accepted, Declined)

## Requirements

### Requirement 1

**User Story:** As a visitor, I want to select my role (cook or student) when I first access the platform, so that I can access the appropriate dashboard for my needs.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL display a role selection screen with options for cook and student roles
2. WHEN a visitor selects a role THEN the System SHALL navigate to the authentication screen for that role
3. WHEN the role selection screen is displayed THEN the System SHALL show clear visual indicators distinguishing between cook and student options

### Requirement 2

**User Story:** As a user (cook or student), I want to authenticate with my name and mobile number, so that I can access my personalized dashboard.

#### Acceptance Criteria

1. WHEN a user enters valid name and mobile number THEN the System SHALL create or retrieve the user account and navigate to the appropriate dashboard
2. WHEN a user submits empty authentication fields THEN the System SHALL prevent form submission and maintain the current state
3. WHEN a cook authenticates for the first time THEN the System SHALL create a new kitchen profile with default values
4. WHEN a returning cook authenticates THEN the System SHALL load their existing kitchen profile and menu items

### Requirement 3

**User Story:** As a cook, I want to manage my kitchen profile information, so that students can learn about my cooking specialty and style.

#### Acceptance Criteria

1. WHEN a cook updates their kitchen name THEN the System SHALL save the new name and display it to students browsing kitchens
2. WHEN a cook updates their specialty description THEN the System SHALL save the new specialty and display it in the kitchen listing
3. WHEN a cook views their dashboard THEN the System SHALL display their current kitchen name and specialty in editable form fields

### Requirement 4

**User Story:** As a cook, I want to add menu items with name, price, and category, so that students can see what food I offer.

#### Acceptance Criteria

1. WHEN a cook enters a menu item name, price, and category and submits the form THEN the System SHALL add the item to their menu and display it in the active menu list
2. WHEN a cook attempts to add a menu item with empty name or price THEN the System SHALL prevent the addition and maintain the current menu state
3. WHEN a menu item is added THEN the System SHALL assign it to one of four categories: breakfast, lunch, snacks, or dinner
4. WHEN a cook views their active menu THEN the System SHALL display all menu items with their names and prices

### Requirement 5

**User Story:** As a cook, I want to view incoming orders from students, so that I can decide whether to accept or decline them.

#### Acceptance Criteria

1. WHEN a student places an order for items from a cook's kitchen THEN the System SHALL display the order in the cook's incoming orders panel with Pending status
2. WHEN a cook views an order THEN the System SHALL display the student name, ordered items, total price, and any special notes
3. WHEN no orders exist for a cook THEN the System SHALL display an empty state message in the orders panel
4. WHEN a cook accepts an order THEN the System SHALL update the order status to Accepted and reflect the change in the order display
5. WHEN a cook declines an order THEN the System SHALL update the order status to Declined and reflect the change in the order display

### Requirement 6

**User Story:** As a student, I want to browse available kitchens, so that I can choose which cook to order from.

#### Acceptance Criteria

1. WHEN a student accesses their dashboard THEN the System SHALL display a grid of all available kitchens with names and specialties
2. WHEN a student clicks on a kitchen card THEN the System SHALL navigate to that kitchen's menu view
3. WHEN displaying kitchen cards THEN the System SHALL show the kitchen name, specialty, and a placeholder image for each kitchen

### Requirement 7

**User Story:** As a student, I want to view a kitchen's menu filtered by meal category, so that I can find food appropriate for the time of day.

#### Acceptance Criteria

1. WHEN a student opens a kitchen's menu THEN the System SHALL display category tabs for breakfast, lunch, snacks, and dinner
2. WHEN a student clicks a category tab THEN the System SHALL display only menu items belonging to that category
3. WHEN a category has no menu items THEN the System SHALL display an empty state message
4. WHEN displaying menu items THEN the System SHALL show the item name, price, image, and an add button for each item

### Requirement 8

**User Story:** As a student, I want to add menu items to my cart with optional special requests, so that I can customize my order before checkout.

#### Acceptance Criteria

1. WHEN a student clicks the add button on a menu item THEN the System SHALL display a modal dialog for adding notes
2. WHEN a student confirms adding an item THEN the System SHALL add the item to the cart and update the cart count badge
3. WHEN a student adds an item with a special note THEN the System SHALL store the note with the cart item
4. WHEN the cart is updated THEN the System SHALL recalculate and display the total price

### Requirement 9

**User Story:** As a student, I want to view and manage items in my cart, so that I can review my order before placing it.

#### Acceptance Criteria

1. WHEN a student views their cart THEN the System SHALL display all added items with their names and prices
2. WHEN a student removes an item from the cart THEN the System SHALL delete the item and update the cart total
3. WHEN the cart is empty THEN the System SHALL display an empty state message
4. WHEN the cart contains items THEN the System SHALL display the total price sum of all items

### Requirement 10

**User Story:** As a student, I want to proceed to checkout with delivery and payment information, so that I can complete my order.

#### Acceptance Criteria

1. WHEN a student clicks the place order button with items in the cart THEN the System SHALL navigate to the checkout screen
2. WHEN a student attempts to place an order with an empty cart THEN the System SHALL display an alert and prevent navigation
3. WHEN the checkout screen loads THEN the System SHALL display the order summary with all cart items, subtotal, delivery fee, and tax
4. WHEN the checkout screen loads THEN the System SHALL pre-fill the delivery name and phone fields with the student's authentication information

### Requirement 11

**User Story:** As a student, I want to enter delivery address and payment details, so that my order can be processed and delivered.

#### Acceptance Criteria

1. WHEN a student enters delivery address information THEN the System SHALL validate that name, phone, and address fields are not empty
2. WHEN a student enters payment card information THEN the System SHALL validate that card number, expiry, CVV, and cardholder name fields are not empty
3. WHEN a student submits the checkout form with missing required fields THEN the System SHALL display an alert and prevent order submission
4. WHEN a student submits the checkout form with all required fields filled THEN the System SHALL create an order with Pending status and clear the cart

### Requirement 12

**User Story:** As a student, I want to receive notifications about my order status, so that I know when my order has been accepted or declined.

#### Acceptance Criteria

1. WHEN a cook updates an order status THEN the System SHALL make the status change available in the student's notifications
2. WHEN a student clicks the notifications icon THEN the System SHALL display a dropdown with order status updates
3. WHEN a student has no order updates THEN the System SHALL display an empty state message in the notifications dropdown

### Requirement 13

**User Story:** As any user, I want to log out of my account, so that I can end my session and return to the role selection screen.

#### Acceptance Criteria

1. WHEN a user clicks the logout button THEN the System SHALL clear the current user session data
2. WHEN a user logs out THEN the System SHALL navigate to the role selection screen
3. WHEN a user logs out THEN the System SHALL clear any cart items if the user was a student
