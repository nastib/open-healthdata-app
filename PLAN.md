Okay, I will add a section specifically for PWA specifications and integrate the necessary tasks into the execution plan.

Here is the updated markdown file:

````markdown
# Nuxt 3/4 Supabase App Generation Plan

This document outlines a phased, step-by-step plan for generating a complete, production-ready, secure, and scalable full-stack web application codebase based on the provided requirements, using Nuxt 3/4, Supabase, TypeScript, Tailwind CSS v4, Shadcn-vue, Prisma, Pinia, FormKit, TanStack Tables, Docker, and Progressive Web App (PWA) capabilities.

**Role:** Expert Full-Stack Nuxt 3/4 and Supabase Application Generator AI.

**Goal:** Generate the complete codebase for a secure, scalable, full-stack web application with PWA capabilities, using the specified technologies and data model, following a phased, step-by-step plan.

**Input:** The detailed requirements, technology stack, data model, features, UI/UX requirements, architecture, constraints, phased approach, and PWA specifications provided by the user.

---

## Technology Stack:

- **Framework:** Nuxt 3 (designed for Nuxt 4 compatibility)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Component Library:** Shadcn-vue
- **ORM:** Prisma
- **State Management:** Pinia
- **Data Tables:** TanStack Tables
- **Containerization:** Docker
- **PWA:** Progressive Web App features (Manifest, Service Worker)
- **Deployment Target Consideration:** Coolify (Docker-based)
- **Version Control:** Git (for code management)
- **Packages manager:** pnpm

---

## Data Model (Supabase `hdb` Schema & `auth.users`):

The application manages data defined by the following structure:

- `hdb.data_category`
- `hdb.data_source`
- `hdb.organisation_element`
- `hdb.variable`
- `hdb.profile`
- `hdb.role`
- `hdb.indicator`
- `hdb.data_entry`
- `auth.users`: Standard Supabase Auth table (relevant for FKs from `hdb.organisation_element`, `hdb.profile`, `hdb.data_entry`)

### Detailed Schema per Table (`hdb` schema)

Below are the detailed columns and constraints for each table in the `hdb` schema:

- **`hdb.data_category`**:

  - `id`: Integer (PK, SERIAL)
  - `code`: Text (UNIQUE, NOT NULL)
  - `designation`: Text
  - `created_at`: Timestamp with Time Zone (DEFAULT now())

- **`hdb.data_source`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `designation`: Text
  - `type`: Text
  - `parent_id`: Integer (FK -> `hdb.data_source.id` for hierarchy, NULLABLE)

- **`hdb.organization_element`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `code`: Text (UNIQUE, NOT NULL)
  - `level`: Text
  - `designation`: Text
  - `acronym`: Text
  - `gps`: Text (e.g., GeoJSON or point type, needs clarification but treat as text for now)
  - `zone`: Text
  - `department`: Text
  - `data_manager_id`: UUID (FK -> `auth.users.id`, NULLABLE)

- **`hdb.variable`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `code`: Text (UNIQUE, NOT NULL)
  - `designation`: Text
  - `type`: JSONB (DEFAULT `'[]'`, intended for list of types/units?)
  - `data_source_id`: Integer (FK -> `hdb.data_source.id`, NOT NULL)
  - `category_code`: Text (FK -> `hdb.data_category.code`, NOT NULL)
  - `frequency`: Text
  - `level`: Text

- **`hdb.profile`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `theme`: Text
  - `roles`: JSONB (DEFAULT `'[]'`, intended for array of role codes/IDs)
  - `active`: Boolean (DEFAULT TRUE, NOT NULL)
  - `user_id`: UUID (FK -> `auth.users.id`, UNIQUE, NOT NULL) - enforces one profile per user
  - `organization_element_code`: Text (FK -> `hdb.organization_element.code`, NULLABLE)

- **`hdb.role`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `code`: Text (UNIQUE, NOT NULL)
  - `designation`: Text

- **`hdb.indicator`**:

  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `code`: Text (UNIQUE, NOT NULL)
  - `designation`: Text
  - `definition`: Text
  - `goal`: Text
  - `formula`: Text
  - `category_code`: Text (FK -> `hdb.data_category.code`, NOT NULL)
  - `level`: Text
  - `calculation_method`: Text
  - `collection_frequency`: Text
  - `constraints`: Text
  - `interpretation`: Text
  - `example`: Text

- **`hdb.data_entry`**:
  - `id`: Integer (PK, SERIAL)
  - `created_at`: Timestamp with Time Zone (DEFAULT now())
  - `variable_code`: Text (FK -> `hdb.variable.code`, NOT NULL, ON DELETE CASCADE)
  - `value`: Float4 (Floating point number)
  - `valid`: Boolean
  - `year`: Integer
  - `updated_at`: Timestamp with Time Zone (DEFAULT now())
  - `category_code`: Text (FK -> `hdb.data_category.code`, NOT NULL)
  - `organization_element_code`: Text (FK -> `hdb.organization_element.code`, NOT NULL)
  - `user_id`: UUID (FK -> `auth.users.id`, NULLABLE)
  - `period`: Date

---

## Core Application Features:

- **Authentication:** Implement Supabase Auth (email/password, OAuth example like Google/GitHub). Secure application routes.
- **Authorization (RBAC):** Implement Role-Based Access Control using `hdb.role` and `hdb.profile`. Secure API endpoints and UI elements based on user roles (based on `hdb.profile.roles` array).
- **CRUD Operations:** Generate full Create, Read, Update, Delete interfaces and backend logic for _all_ tables in the `hdb` schema, secured by RBAC.
- **API Layer:** Develop secure Nuxt server routes (`server/api`) using Prisma for all database interactions, enforcing authentication and authorization.
- **State Management:** Utilize Pinia for frontend application state.
- **Form Handling:** Implement data entry and update forms using FormKit with appropriate validation based on schema types and constraints defined above.
- **Data Display:** Use TanStack Tables for displaying lists of records from each table, including sorting, filtering, and pagination. The columns displayed should primarily derive from the detailed schema defined above.
- **User Feedback:** Implement a toast notification system for user feedback (success, error, info) following actions.
- **Fulltext Search:** Implement a header search bar for searching across relevant fields (`code`, `designation`, `acronym`, etc. - derived from the detailed schema) in multiple `hdb` tables, leveraging Supabase search capabilities.

---

## PWA Requirements:

- **Installability:** Make the application installable on desktop and mobile devices via a web app manifest.
- **Basic Offline Experience:** Provide basic offline support by caching static assets (HTML, CSS, JS, images). Note that full offline data access for dynamic CRUD data is out of scope for this initial generation, but the service worker foundation will be laid.
- **Icons:** Include appropriate icons for different devices and contexts.
- **Manifest:** Configure a `manifest.webmanifest` file with application details (name, short_name, start_url, display mode, etc.).

---

## User Interface (UI/UX) Requirements:

- **Design:** Modern, clean, minimalist using Tailwind CSS v4 and Shadcn-vue components.
- **Responsiveness:** Fully responsive layout for desktop, tablet, and mobile.
- **Layout:** Sticky Header, Collapsible Left Sidebar, Main Content area.
- **Header Elements:** Application Logo, Fulltext Search Input, Dark Mode Toggle, User Avatar with dropdown menu.
- **User Dropdown Menu:** Links/actions for Profile (view/edit `hdb.profile`), Preferences, Logout.
- **Sidebar Navigation:** Menu providing access to CRUD interfaces for `hdb` tables and Dashboard.
- **Breadcrumbs:** Display current location in the main content area.
- **Landing Page:** Dashboard view after login, providing an overview.

---

## Architecture & Code Structure:

- Adhere to standard Nuxt 3 project structure.
- Implement server-side logic in `server/api`.
- Use composables (`composables`) for reusable logic.
- Structure UI components in `components`.
- Organize pages logically in `pages` (e.g., `/dashboard`, `/data-categories`, `/organization-elements/[id]`).
- Enforce TypeScript usage throughout the project.
- Configure Prisma schema based on the `hdb` and `auth.users` tables, reflecting the detailed structure provided.
- Integrate PWA functionality using a Nuxt module and standard PWA practices.

---

## Constraints & Best Practices:

- **Performance:** Optimize database queries, implement lazy loading where beneficial.
- **Security:** Adhere to OWASP Top 10. Implement robust authentication/authorization checks on both frontend and backend. Sanitize inputs. Consider Supabase Row Level Security (RLS).
- **Availability & Scalability:** Design for deployment on Docker-based platforms like Coolify.
- **Maintainability:** Write clean, readable, well-commented, modular code following conventions.
- **Code Quality:** Ensure syntactically correct, type-safe TypeScript code using specified libraries correctly.
- **Deployment:** Include a standard `Dockerfile` compatible with Coolify.

---

## Execution Plan (Phased Steps for Review/Approval):

I will proceed through the following steps sequentially. Upon completing a step, I will summarize what has been done and indicate readiness for review or the start of the next phase.

### Phase 1: Project Setup & Core Infrastructure

1.  **Step 1.1: Project Initialization & Tooling Setup**

    - **Objective:** Establish the basic Nuxt project structure and integrate core tools, including PWA module.
    - **Tasks:**
      - Create a new Nuxt 3 project with TypeScript.
      - Install and configure Tailwind CSS v4.
      - Install and configure Shadcn-vue (manual setup).
      - Install and configure Pinia (`@pinia/nuxt`).
      - Install and configure TanStack Tables (`@tanstack/vue-table`).
      - Install and configure Prisma (`prisma`).
      - Install and configure a PWA module (e.g., `@vite-pwa/nuxt`).
      - Set up initial directory structure (`server`, `components`, `composables`, `pages`, `layouts`, `stores`, `prisma`, `public` for static assets/icons).
      - Create a placeholder `.env` file structure.
    - **Output:** Initial project files (`nuxt.config.ts`, `tailwind.config.ts`, `tsconfig.json`, basic directory structure), confirmation of successful installation and configuration for all tools including PWA module.
    - **Completion Signal:** "Phase 1, Step 1.1 (Project Setup) completed. All core tools and PWA module installed/configured. Ready to proceed to Supabase/Prisma setup."

2.  **Step 1.2: Supabase & Prisma Schema Definition**
    - **Objective:** Define the data layer schema contract and integrate Prisma, accurately reflecting the detailed schema.
    - **Tasks:**
      - Install Supabase client library (`@supabase/supabase-js`).
      - Configure Prisma schema (`prisma/schema.prisma`) based _precisely_ on the provided detailed `hdb` schema and `auth.users` table structure, including relationships (FKs), scalar types, unique constraints, defaults, and `onDelete` actions (like `CASCADE`).
      - Define necessary scalar types and relationships in the Prisma schema.
      - Add `provider = "postgresql"` to the Prisma schema.
      - Generate the Prisma client (`npx prisma generate`).
      - Draft a conceptual plan for Supabase Row Level Security (RLS) policies for each `hdb` table, outlining how they will align with the RBAC roles defined later. Note tables where RLS will be critical (`data_entry`, `profile`, `organization_element`) and how RLS will interact with the detailed schema constraints.
    - **Output:** `prisma/schema.prisma` file accurately reflecting the detailed schema, confirmation of Prisma client generation, a written summary of the conceptual RLS plan.
    - **Completion Signal:** "Phase 1, Step 1.2 (Supabase/Prisma Schema) completed. Prisma schema defined (reflecting detailed columns/constraints), client generated, and RLS planned. Ready for Core Authentication."

### Phase 2: Authentication & Authorization Core

3.  **Step 2.1: Supabase Authentication Implementation**

    - **Objective:** Integrate Supabase Auth into the Nuxt application and secure routes.
    - **Tasks:**
      - Create a Supabase client composable (`composables/useSupabase.ts`).
      - Create an authentication Pinia store (`stores/auth.ts`) to manage user session state.
      - Implement signup, login, and logout functions using the Supabase client in the store or composable.
      - Create Nuxt middleware (`middleware/auth.global.ts` or named middleware) to check authentication status and protect routes (e.g., redirect unauthenticated users from `/dashboard`).
      - Create placeholder login (`pages/auth/login.vue`) and signup (`pages/auth/signup.vue`) pages using FormKit for basic forms.
      - Implement fetching the initial user session on app load.
    - **Output:** Supabase composable, auth Pinia store, auth middleware, basic login/signup pages, confirmation of route protection working.
    - **Completion Signal:** "Phase 2, Step 2.1 (Supabase Auth) completed. Login/Logout/Signup flows implemented, authentication state managed in Pinia, and routes are protected. Ready for RBAC."

4.  **Step 2.2: Role-Based Access Control (RBAC) Core**
    - **Objective:** Implement the core logic for checking user roles based on `hdb.profile.roles`.
    - **Tasks:**
      - Enhance the auth Pinia store or create a new `profile.ts` store/composable to fetch and store the authenticated user's `hdb.profile` including the `roles` array, leveraging the specific fields defined in the detailed schema (`roles`, `active`, `organisation_element_code`).
      - Create a composable (`composables/useRoles.ts`) with functions like `hasRole(roleCode)` or `hasAnyRole(roleCodes)` that check the user's profile roles from the fetched profile data.
      - Implement initial backend checks in a placeholder `server/api` route (`server/api/protected-test.ts`) using the Supabase client (or Prisma) to verify user identity (`auth.uid()`) and potentially fetch/check roles from the DB based on the `profile` schema.
      - Discuss how the RLS policies planned in Step 1.2 will complement these application-level checks, specifically noting how RLS would enforce permissions based on `user_id` or `organisation_element_code` in tables like `profile`, `organisation_element`, and `data_entry`.
    - **Output:** Profile state management (store/composable) leveraging the detailed profile schema, `useRoles` composable, a basic protected backend test route, and a written summary connecting application RBAC to the RLS plan and specific schema fields.
    - **Completion Signal:** "Phase 2, Step 2.2 (RBAC Core) completed. User profile/roles are accessible (using detailed profile schema), role-checking composable created, and backend check logic initiated, linked to RLS strategy. Ready for API Layer foundation."

### Phase 3: API Layer & Core UI Layout

5.  **Step 3.1: API Layer Foundation (One CRUD Example)**

    - **Objective:** Establish the pattern for `server/api` routes using Prisma and enforcing Auth/RBAC.
    - **Tasks:**
      - Create a `server/utils/prisma.ts` file to instantiate the Prisma client.
      - Create a `server/utils/auth.ts` or similar file to get the authenticated user's ID (`auth.uid()`) from the request headers and potentially fetch their roles/profile details from the DB using Prisma/Supabase client, leveraging the detailed schema.
      - Implement basic CRUD routes (`GET`, `POST`, `PUT`, `DELETE`) for _one_ simple table (e.g., `hdb.data_category`) in `server/api/data-categories/[id].ts` and `server/api/data-categories/index.ts`. Ensure these routes handle inputs/outputs based on the detailed `data_category` schema (`code`, `designation`).
      - Ensure _each_ API endpoint calls backend authorization checks using the logic from Step 2.2.
      - Use Prisma for all database interactions within these routes.
      - Implement basic error handling (e.g., 401, 403, 404, 500).
    - **Output:** Prisma utility, backend auth utility leveraging detailed schema, full CRUD `server/api` routes for one table (`data_category`) using Prisma and enforcing Auth/RBAC, demonstrating handling of detailed columns/constraints for that table.
    - **Completion Signal:** "Phase 3, Step 3.1 (API Foundation) completed. Backend API structure established, Prisma integrated, Auth/RBAC enforced for `data_category` endpoints, handling its detailed schema. Ready for main UI Layout."

6.  **Step 3.2: Main UI Layout & Navigation**

    - **Objective:** Build the main application layout (header, sidebar, content) and navigation structure.
    - **Tasks:**
      - Create the main layout file (`layouts/default.vue`).
      - Implement the header component (`components/layout/AppHeader.vue`) using Tailwind and Shadcn-vue. Include placeholders for logo, search, dark mode toggle, and user avatar.
      - Implement the user avatar/dropdown component (`components/layout/UserDropdown.vue`) with Logout functionality hooked up to the auth store. Add placeholder links for Profile and Preferences. The profile link should navigate to a view/edit page for the user's `hdb.profile` based on the detailed schema.
      - Implement the sidebar component (`components/layout/AppSidebar.vue`) using Tailwind and Shadcn-vue. Make it collapsible. Add placeholder navigation links for each `hdb` table based on the table names from the detailed schema.
      - Implement the breadcrumb component (`components/layout/AppBreadcrumbs.vue`) using Shadcn-vue components.
      - Assemble these components within the `default.vue` layout.
      - Implement the dark mode toggle functionality.
    - **Output:** `default.vue` layout, `AppHeader.vue`, `UserDropdown.vue` (with Profile link reflecting `hdb.profile`), `AppSidebar.vue` (with links for all `hdb` tables), `AppBreadcrumbs.vue` components, basic responsive layout structure, functional dark mode toggle.
    - **Completion Signal:** "Phase 3, Step 3.2 (UI Layout) completed. Main application layout, header, sidebar (with all table links), user dropdown, and breadcrumbs structure built. Dark mode functional. Ready to implement Toast Notifications and the Dashboard placeholder."

7.  **Step 3.3: Toast Notifications & Dashboard Placeholder**
    - **Objective:** Add a global notification system and the initial dashboard page.
    - **Tasks:**
      - Integrate a Shadcn-vue toast notification component (likely requiring a plugin setup in Nuxt).
      - Create a composable (`composables/useToast.ts`) to easily trigger toast notifications (success, error, info).
      - Create the initial Dashboard page (`pages/dashboard.vue`) with basic placeholder content visible after login.
      - Ensure the auth middleware redirects logged-in users to `/dashboard`.
    - **Output:** Toast notification setup, `useToast` composable, basic `pages/dashboard.vue` file.
    - **Completion Signal:** "Phase 3, Step 3.3 (Toasts & Dashboard) completed. Toast system integrated, Dashboard placeholder created. Core infrastructure is now in place. Ready to generate CRUD interfaces per table."

### Phase 4: CRUD Interface Generation (Iterative)

8.  **Step 4.1 - 4.X: Generate CRUD for Each `hdb` Table**
    - **Objective:** For _each_ table in the `hdb` schema, generate the full CRUD interface, leveraging the detailed schema information for forms and tables.
    - **Tasks (Repeat for each table based on its detailed schema):**
      - **Backend:** Implement full CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) in `server/api/[table-name]...` using Prisma. Ensure these endpoints handle inputs and outputs precisely according to the table's detailed schema columns and types. Strictly enforce Auth and RBAC based on the table's sensitivity and the user's roles (e.g., `profile`, `role`, `data_entry` might have stricter permissions checking specific roles).
      - **Pinia Store:** Create a dedicated Pinia store (`stores/[table-name].ts`) for managing data fetching, creation, update, and deletion for this table, correctly typing data based on the detailed schema.
      - **Frontend Pages:** Create the necessary pages (`pages/[table-name]/index.vue` for listing, `pages/[table-name]/create.vue` for creation, `pages/[table-name]/[id].vue` for viewing/editing).
      - **Forms:** Implement FormKit forms in `create.vue` and `[id].vue` pages for creating and updating records. Map form fields directly to the table's detailed schema columns. Include validation based on the schema's constraints (required fields, type checking - including custom handling for JSONB, Date, UUID FKs; format - e.g., unique codes checked via server-side validation). Handle special types like JSONB (`roles`, `type`) and Dates (`periode`).
      - **Data Tables:** Implement TanStack Tables in the `index.vue` page to display records. Define table columns based _directly_ on the table's detailed schema fields. Implement basic sorting and pagination. Display Foreign Key relationships intuitively (e.g., display `designation` from related table instead of just the ID/code where appropriate, like `category_code` -> `data_category.designation`).
      - **API Integration:** Connect frontend pages (stores, forms, tables) to the backend `server/api` endpoints.
      - **RBAC Integration:** Use the `useRoles` composable to conditionally display/enable/disable UI elements or actions (e.g., hide 'Create New' button if user lacks permission). Ensure backend checks are the primary security layer, checking against roles derived from the detailed `hdb.profile` schema.
      - **User Feedback:** Trigger toast notifications on successful/failed CRUD operations.
      - **Navigation:** Ensure the link to the table's list page (`/[table-name]`) in the `AppSidebar.vue` is functional.
      - **Breadcrumbs:** Ensure breadcrumbs correctly reflect the current page (List, Create, Detail/Edit).
    - **Output:** Complete set of backend API routes, Pinia stores, frontend pages, components (forms, tables) for the processed table, all accurately reflecting and utilizing the table's detailed schema, with integrated Auth/RBAC and UI.
    - **Completion Signal:** "Phase 4, Step 4.X (CRUD for `[table-name]`) completed. Full CRUD implemented for this table, integrated with Auth/RBAC and UI, fully utilizing its detailed schema. Ready to proceed to the next table or move to Advanced Features."
    - _(Note: This phase involves repeating the tasks for each table. The AI will report completion for one table at a time)_

### Phase 5: Advanced Features & Refinement

9.  **Step 5.1: Fulltext Search Implementation**

    - **Objective:** Implement the header search bar functionality.
    - **Tasks:**
      - Identify _searchable fields_ across relevant `hdb` tables based on the detailed schema (`code`, `designation`, `acronym`, `defintion`, `goal`, `formula`, `interpretation`, `example`).
      - Explain the requirement for Supabase Text Search configuration (creating `tsvector` columns, GIN indexes) on the Supabase side, targeting the identified fields.
      - Implement a backend API endpoint (`server/api/search.ts`) that accepts a query and uses Prisma (or the Supabase client directly for specific TSVector features) to perform a fulltext search across the identified fields/tables from the detailed schema. Structure the results clearly (e.g., grouped by table, showing relevant fields from the detailed schema).
      - Integrate the search input in `AppHeader.vue`. Implement debouncing on user input.
      - Display search results in a user-friendly way (e.g., a dropdown or dedicated search results page), showing key details from the detailed schema for each result item.
    - **Output:** `server/api/search.ts` endpoint leveraging detailed schema fields for search, updated `AppHeader.vue` with search input and result display logic, explanation of required Supabase DB setup (TSVector, Indexes on specific fields).
    - **Completion Signal:** "Phase 5, Step 5.1 (Fulltext Search) completed. Backend search endpoint created, integrated into header UI, utilizing detailed schema fields, and Supabase configuration requirements explained. Ready for PWA & Final Refinement."

10. **Step 5.2: PWA Configuration & Asset Generation**

    - **Objective:** Configure the PWA module and prepare necessary assets.
    - **Tasks:**
      - Configure the PWA module in `nuxt.config.ts`:
        - Define the `manifest.webmanifest` settings (name, short_name, start_url, display, theme_color, background_color).
        - Set the service worker strategy (e.g., `GenerateSW` for asset caching).
        - Configure workbox options for caching static assets.
      - Generate (or provide placeholders for) PWA icons in various sizes (e.g., 192x192, 512x512, Apple Touch Icon) and place them in the `public` directory. Update the manifest configuration to reference these icons.
    - **Output:** Updated `nuxt.config.ts` with PWA configuration, placeholder icon files in `public` directory, configured `manifest.webmanifest`.
    - **Completion Signal:** "Phase 5, Step 5.2 (PWA Configuration) completed. PWA module configured, manifest defined, and icon placeholders added. Application is now installable as a PWA with basic asset caching. Ready for Final Code Quality & Refinement."

11. **Step 5.3: Final Refinement, Validation & Error Handling**
    - **Objective:** Review and enhance the entire application for robustness, usability, and adherence to constraints.
    - **Tasks:**
      - Review all FormKit forms: ensure comprehensive validation rules reflecting the detailed schema constraints (required fields, type checking - including custom handling for JSONB, Date, UUID FKs; format - e.g., unique codes checked via server-side validation). Implement custom validation logic if needed.
      - Review backend API routes: ensure thorough input validation and sanitization on the server side for all incoming data, validating against the detailed schema types and constraints.
      - Implement more detailed error handling and user feedback across the application (API call failures, invalid form submissions, permissions errors - providing user-friendly messages).
      - Ensure consistent loading states for data fetching.
      - Perform responsiveness checks and adjustments using Tailwind utilities.
      - Add code comments for complex sections, especially around schema-specific logic or constraints.
      - Review TypeScript usage for strict type safety, defining interfaces/types based on the detailed schema via Prisma or manual definitions.
      - Add basic README instructions for setting up environment variables and running the project, including notes on necessary Supabase DB setup (creating tables, RLS, TSVector) and instructions for building/serving the PWA.
    - **Output:** Updated form components, API routes, Pinia stores, pages with enhanced validation (reflecting detailed schema), error handling, loading states, responsiveness tweaks, comments, README file.
    - **Completion Signal:** "Phase 5, Step 5.3 (Refinement) completed. Validation (based on detailed schema), error handling, responsiveness, and code quality reviewed and enhanced across the application. Ready for Containerization."

### Phase 6: Deployment Preparation

12. **Step 6.1: Dockerization**
    - **Objective:** Create a `Dockerfile` compatible with Docker-based deployment platforms like Coolify.
    - **Tasks:**
      - Create a standard `Dockerfile` for building and running the Nuxt 3 application (likely multi-stage build).
      - Ensure the Dockerfile correctly copies dependencies, builds the application, and sets up the final runtime environment. This should include steps to build the PWA assets.
      - Consider environment variable passing for Coolify/Docker, including Supabase connection details.
    - **Output:** `Dockerfile` at the project root.
    - **Completion Signal:** "Phase 6, Step 6.1 (Dockerization) completed. `Dockerfile` created, including steps for building PWA assets. Project codebase is now complete according to the plan."

---

## Architectural Diagram (Conceptual):

```mermaid
graph TD
    A[User Browser] --> B(Nuxt 3/4 Frontend)
    B --> C(Pinia State Management)
    B --> D(FormKit Forms)
    B --> E(TanStack Tables)
    B --> F(Shadcn-vue Components)
    B --> G(Tailwind CSS)
    B --> P(PWA Service Worker & Manifest)
    B --> H(Nuxt Server - server/api)
    H --> I(Prisma ORM)
    I --> J(Supabase Database - PostgreSQL)
    H --> K(Supabase Auth)
    H --> L(Supabase RLS)
    H --> M(Supabase Storage)
    H --> N(Supabase Edge Functions - if needed)
    J --> I
    K --> H
    L --> J
    M --> H
    N --> H
    Subgraph Backend
        H
        I
        J
        K
        L
        M
        N
    End
    Subgraph Frontend
        B
        C
        D
        E
        F
        G
        P
    End
    O[Dockerfile] --> Backend
```
````

---

## Supabase RLS Elaboration:

- Enable RLS for all `hdb` tables.
- Define RLS policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations.
- Policies will primarily use `auth.uid()` and align with application-level RBAC (based on `hdb.profile.roles`) and _specific schema fields_ like `user_id` in `profile` and `data_entry`, and `organisation_element_code` in `profile` and `data_entry`, potentially allowing users access only to data related to their organisation or profile.
- Prisma operations via the Supabase client in server routes will automatically respect RLS policies.
- RLS provides a database-level safety net against unauthorized access, complementing application-level RBAC.

---

## Fulltext Search Elaboration:

- Identify searchable fields in tables based on the detailed schema (`code`, `designation`, `acronym`, `defintion`, `goal`, `formula`, `interpretation`, `example`).
- Configure Supabase text search vectors (`to_tsvector`) and GIN indexes on these _specific fields_.
- Create backend API endpoint `/api/search` to receive queries.
- Endpoint uses Supabase client/Prisma with `to_tsquery` for matching against `tsvector` columns.
- Returns structured search results, potentially grouped by table, including key fields from the detailed schema for each result item.
- Frontend integrates search input in header, debounces calls, and displays results.

---

## Execution:

I will proceed step-by-step through this plan, generating the necessary files and code for each component and feature, ensuring adherence to the detailed schema and including PWA capabilities. I will prioritize setting up the core structure, authentication, and a basic CRUD example before implementing all tables and advanced features. I will signal completion after each step.

```

```
