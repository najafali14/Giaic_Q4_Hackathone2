# Application Specifications: Next.js Todo App

## Core Features:
1.  **Todo CRUD Operations:**
    *   Create new todos with title and optional description
    *   Read/list all todos with pagination support
    *   Update todo status (completed/not completed) and content
    *   Delete single todo or bulk delete completed todos

2.  **User Interface Requirements:**
    *   Main Todo page must be in todo-app/app/page.tsx
    *   Clean, modern dashboard showing all todos
    *   Todo items displayed with: title, description, completion status, timestamps
    *   Add todo form at the top of the page
    *   Filter todos by status (all, active, completed)
    *   Search functionality to find todos by title/content
    *   Statistics dashboard showing: total, completed, pending todos, completion percentage

3.  **User Experience Features:**
    *   Real-time updates without page refresh
    *   Loading states for all async operations
    *   Confirmation dialogs for destructive actions
    *   Toast notifications for user feedback
    *   Keyboard shortcuts support

4.  **API Requirements:**
    *   Create app/api/todos/ route for CRUD operations
    *   Use Next.js API Routes with proper HTTP methods
    *   JSON request/response format
    *   Comprehensive error handling
    *   Health check endpoint at app/api/health/route.ts

5.  **Database Requirements:**
    *   Use the provided NeonDB connection string
    *   Implement connection pooling
    *   Create lib/db.ts for database connection logic
    *   Handle database operations in API routes only

## Non-Functional Requirements:
-   **Performance:** Page load < 2 seconds, API response < 200ms
-   **Responsiveness:** Mobile-first, works on all screen sizes
-   **Accessibility:** WCAG 2.1 AA compliant
-   **SEO:** Proper meta tags and semantic HTML
-   **Maintainability:** Clean, documented code with consistent patterns
