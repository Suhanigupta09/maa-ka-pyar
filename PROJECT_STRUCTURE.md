# Maa Ka Pyaar - Project Structure

## Overview
This document describes the complete file and folder structure of the Maa Ka Pyaar application.

## Directory Structure

```
maa-ka-pyaar/
├── index.html                      # Main landing page
├── style.css                       # Legacy styles (to be migrated)
├── script.js                       # Main application logic
├── package.json                    # NPM dependencies and scripts
├── .gitignore                      # Git ignore rules
│
├── css/                            # Stylesheets
│   └── main.css                    # Design system & global styles
│
├── js/                             # JavaScript modules
│   ├── firebase-config.js          # Firebase initialization
│   ├── utils.js                    # Utility functions
│   ├── auth.js                     # Authentication manager (TODO)
│   ├── firebase-manager.js         # Firebase operations (TODO)
│   ├── kitchen.js                  # Kitchen manager (TODO)
│   ├── order.js                    # Order manager (TODO)
│   ├── refund.js                   # Refund manager (TODO)
│   ├── bill.js                     # Bill manager (TODO)
│   ├── support.js                  # Support manager (TODO)
│   ├── admin.js                    # Admin manager (TODO)
│   ├── notification.js             # Notification manager (TODO)
│   └── ui.js                       # UI manager (TODO)
│
├── images/                         # Image assets
│   ├── hero/                       # Hero section images
│   ├── food/                       # Food item images
│   ├── icons/                      # UI icons
│   └── backgrounds/                # Background images
│
├── tests/                          # Test files
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── property/                   # Property-based tests
│
└── docs/                           # Documentation
    ├── FIREBASE_SETUP_GUIDE.md     # Firebase setup instructions
    ├── TASK_1_COMPLETION.md        # Task completion notes
    └── PROJECT_STRUCTURE.md        # This file
```

## File Descriptions

### Root Files

**index.html**
- Main entry point of the application
- Contains all page screens (landing, auth, dashboards)
- Includes Firebase SDK and application scripts

**style.css**
- Legacy stylesheet with existing styles
- Will be gradually migrated to modular CSS

**script.js**
- Main application logic
- Contains state management and UI interactions
- Will be refactored into modules

**package.json**
- NPM package configuration
- Test scripts and dependencies
- Jest configuration

### CSS Files

**css/main.css**
- Design system variables (colors, spacing, typography)
- Global styles and resets
- Utility classes
- Responsive breakpoints

### JavaScript Modules

**js/firebase-config.js** ✅
- Firebase initialization
- Service configuration (Auth, Firestore, Storage)
- Offline persistence setup

**js/utils.js** ✅
- Date/time formatting functions
- String manipulation utilities
- Number formatting (currency, etc.)
- Validation functions (email, mobile, password)
- DOM manipulation helpers
- Storage utilities (localStorage)
- Array utilities
- Debounce/throttle functions

**js/auth.js** (TODO - Task 4)
- User signup
- User login
- User logout
- Role-based authentication
- Password reset

**js/firebase-manager.js** (TODO - Task 3)
- Firestore CRUD operations
- Real-time listeners
- Storage operations
- Query functions

**js/kitchen.js** (TODO - Task 5)
- Kitchen profile management
- Menu management
- Kitchen timing
- Open/closed status

**js/order.js** (TODO - Task 6)
- Order creation
- Order status updates
- Order cancellation
- Order tracking

**js/refund.js** (TODO - Task 7)
- Refund requests
- Refund approval/decline
- Refund amount calculation

**js/bill.js** (TODO - Task 8)
- Bill generation
- PDF creation
- Bill download

**js/support.js** (TODO - Task 9)
- Support ticket creation
- Ticket responses
- Ticket status updates

**js/admin.js** (TODO - Task 10)
- Platform analytics
- User management
- Refund management
- Support ticket management

**js/notification.js** (TODO - Task 11)
- Notification creation
- Real-time notification delivery
- Notification read status

**js/ui.js** (TODO - Task 12)
- Loading spinners
- Toast notifications
- Modal dialogs
- Page navigation

## Design System

### Colors
- Primary: Green (#2E7D32)
- Secondary: Yellow (#FFC107), Orange (#FF9800)
- Status: Success, Error, Warning, Info
- Text: Primary, Secondary, Disabled

### Typography
- Font: Poppins
- Sizes: xs (12px) to 4xl (40px)
- Weights: Light (300) to Bold (700)

### Spacing
- Scale: xs (4px) to 2xl (48px)
- Consistent spacing throughout

### Components
- Cards with shadows
- Buttons with hover states
- Forms with validation
- Responsive grid layouts

## Testing Strategy

### Unit Tests (tests/unit/)
- Test individual functions
- Mock external dependencies
- Fast execution

### Integration Tests (tests/integration/)
- Test Firebase operations
- Test API interactions
- Test data flow

### Property-Based Tests (tests/property/)
- Test correctness properties
- Use fast-check library
- Generate random test cases

## Development Workflow

1. **Setup**: Complete Firebase configuration
2. **Development**: Implement features module by module
3. **Testing**: Write tests alongside implementation
4. **Integration**: Connect modules together
5. **Deployment**: Deploy to Firebase Hosting

## Next Steps

- ✅ Task 1: Firebase setup complete
- ✅ Task 2: Project structure complete
- 🔄 Task 3: Implement Firebase Manager
- 📝 Task 4: Implement Authentication Manager
- 📝 Task 5+: Continue with remaining tasks

## Notes

- All new code should use the design system variables
- Follow the modular architecture
- Write tests for all new features
- Document complex functions
- Use utility functions from utils.js
