# Next.js 14 Todo Application with NeonDB

This is a production-ready Todo application built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and NeonDB (PostgreSQL). It features full CRUD (Create, Read, Update, Delete) operations and is designed for deployment.

## Table of Contents
1.  [Features](#features)
2.  [Technology Stack](#technology-stack)
3.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Environment Setup](#environment-setup)
    *   [Installation](#installation)
    *   [Running the Development Server](#running-the-development-server)
4.  [Database](#database)
    *   [Schema](#schema)
    *   [Health Check and Schema Creation](#health-check-and-schema-creation)
5.  [API Endpoints](#api-endpoints)
    *   [Todos API (`/api/todos`)](#todos-api-api-todos)
    *   [Health Check API (`/api/health`)](#health-check-api-api-health)
6.  [Project Structure](#project-structure)

## Features
*   **Todo CRUD Operations:** Create, Read (list, filter, search), Update (status, content), Delete individual todos.
*   **User Interface:** Clean, modern dashboard displaying todos, add todo form, filter by status, search functionality, and statistics (total, completed, pending).
*   **User Experience:** Real-time updates, loading states, confirmation dialogs, toast notifications.
*   **Responsive Design:** Mobile-first approach with Tailwind CSS.

## Technology Stack
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** NeonDB (PostgreSQL)
*   **Database Client:** `@vercel/postgres`
*   **Form Management:** `react-hook-form` with `zod` validation
*   **Data Fetching:** SWR (`swr`)
*   **Icons:** `lucide-react`

## Getting Started

### Prerequisites
*   Node.js (v18.x or later)
*   npm (v8.x or later)
*   A NeonDB PostgreSQL instance and its connection string.

### Environment Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-todo-app.git
    cd your-todo-app/todo-app
    ```
2.  **Create `.env.local` file:**
    In the `todo-app` directory, create a file named `.env.local` and add your NeonDB connection string:
    ```
    POSTGRES_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-late-night-ahw1x6n6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    ```
    Replace `YOUR_PASSWORD` with your actual NeonDB password.

### Installation
Navigate to the `todo-app` directory and install the dependencies:
```bash
cd todo-app
npm install
```

### Running the Development Server
To run the application in development mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

### Schema
The `todos` table schema is as follows:

```sql
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Health Check and Schema Creation
The application includes a health check endpoint that also creates the `todos` table if it doesn't already exist.
To initialize your database and ensure connectivity, visit:
[http://localhost:3000/api/health](http://localhost:3000/api/health)
A successful response will confirm database connection and table creation.

## API Endpoints

All API endpoints are located under `/api`. They return JSON responses.

### Todos API (`/api/todos`)

*   **`GET /api/todos`**
    *   **Description:** Retrieves a list of all todos, with optional filtering and searching.
    *   **Query Parameters:**
        *   `filter`: (`string`, optional) Can be `all`, `active`, or `completed`. Defaults to `all`.
        *   `search`: (`string`, optional) Searches for todos by `title` or `description` (case-insensitive).
    *   **Response:** `200 OK` - An array of Todo objects.
        ```json
        [
            {
                "id": 1,
                "title": "Learn Next.js",
                "description": "Master Next.js App Router",
                "completed": false,
                "created_at": "2023-10-26T10:00:00.000Z",
                "updated_at": "2023-10-26T10:00:00.000Z"
            }
        ]
        ```

*   **`POST /api/todos`**
    *   **Description:** Creates a new todo item.
    *   **Request Body:**
        ```json
        {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "completed": false
        }
        ```
    *   **Response:** `201 Created` - The newly created Todo object.
    *   **Error:** `400 Bad Request` if validation fails.

### Dynamic Todo API (`/api/todos/[id]`)

*   **`GET /api/todos/[id]`**
    *   **Description:** Retrieves a single todo item by its ID.
    *   **URL Parameters:** `id` (number) - The ID of the todo.
    *   **Response:** `200 OK` - The Todo object. `404 Not Found` if the todo does not exist.

*   **`PUT /api/todos/[id]`**
    *   **Description:** Updates an existing todo item by its ID.
    *   **URL Parameters:** `id` (number) - The ID of the todo.
    *   **Request Body:** (Partial update is supported)
        ```json
        {
            "title": "Updated title",
            "completed": true
        }
        ```
    *   **Response:** `200 OK` - The updated Todo object. `404 Not Found` if the todo does not exist.
    *   **Error:** `400 Bad Request` if validation fails.

*   **`DELETE /api/todos/[id]`**
    *   **Description:** Deletes a todo item by its ID.
    *   **URL Parameters:** `id` (number) - The ID of the todo.
    *   **Response:** `200 OK` - `{"message": "Todo deleted successfully."}`. `404 Not Found` if the todo does not exist.

### Health Check API (`/api/health`)
*   **`GET /api/health`**
    *   **Description:** Checks the database connection and creates the `todos` table if it doesn't exist.
    *   **Response:** `200 OK` - `{"message": "Database connection successful and table created."}`. `500 Internal Server Error` if connection fails.

## Project Structure
```
.
├── app/
│   ├── api/
│   │   ├── todos/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts         // API for single todo operations (GET, PUT, DELETE)
│   │   │   └── route.ts             // API for listing and creating todos (GET, POST)
│   │   └── health/
│   │       └── route.ts             // Database health check and schema creation
│   ├── components/
│   │   ├── Checkbox.tsx             // Custom checkbox component
│   │   ├── ErrorMessage.tsx         // Displays error messages
│   │   ├── LoadingSpinner.tsx       // Loading indicator
│   │   ├── SWRProvider.tsx          // SWR context provider
│   │   ├── Toast.tsx                // Toast notification component
│   │   ├── ToastProvider.tsx        // Context provider for toasts
│   │   ├── TodoFilter.tsx           // Component for filtering todos
│   │   ├── TodoForm.tsx             // Form for adding/editing todos
│   │   ├── TodoItem.tsx             // Displays individual todo item
│   │   ├── TodoList.tsx             // Displays a list of todos
│   │   ├── TodoPageClient.tsx       // Client-side logic for the main todo page
│   │   └── TodoStats.tsx            // Displays todo statistics
│   ├── favicon.ico
│   ├── globals.css                  // Global styles (Tailwind CSS imports)
│   ├── layout.tsx                   // Root layout component (includes SWR and Toast providers)
│   └── page.tsx                     // Server Component for initial data fetch and rendering TodoPageClient
└── lib/
    ├── db.ts                        // Database connection logic (`@vercel/postgres`)
    └── types.ts                     // TypeScript interfaces and Zod schemas
└── .env.local                       // Environment variables (e.g., POSTGRES_URL)
└── next.config.mjs                  // Next.js configuration
└── package.json                     // Project dependencies and scripts
└── postcss.config.mjs               // PostCSS configuration (Tailwind CSS)
└── tailwind.config.ts               // Tailwind CSS configuration
└── tsconfig.json                    // TypeScript configuration
```