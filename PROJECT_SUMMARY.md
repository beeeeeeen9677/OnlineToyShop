# Premium Ben Toys - E-Commerce Platform

## Project Description

A full-stack online shopping website built with React, TypeScript, and Node.js. The site has real-time chat support, secure payment with Stripe, and a complete admin panel. Customers can browse products, add items to cart (works for both guests and logged-in users), buy products, and talk to customer service through live chat. Admins can manage products, check orders, and reply to customer messages instantly. The app uses Firebase Authentication for login (including Google/Facebook login), MongoDB to store data, and Socket.io for real-time features. It also supports two languages, has a dark mode, and works well on mobile devices.

---

## Features Overview

### Core Features:

- **Authentication System** (Firebase Auth with Google/Facebook OAuth, email/password)
- **Product Catalog** (Browse, search, filter by categories, multi-language support)
- **Shopping Cart** (Guest & authenticated users, works across browser sessions)
- **Checkout & Payment** (Stripe integration with webhook confirmation)
- **Order Management** (Order history, status tracking, automatic cleanup)
- **Real-Time Chat System** (Customer service with Socket.io, message history)
- **Admin Dashboard** (Product CRUD, order management, user management, chat support)
- **Multi-Language Support** (English & Chinese with i18next)
- **Image Upload** (Supabase storage integration)
- **Dark Mode** (Works across entire site)

---

## Detailed Features

### **1. Authentication System**

**Frontend:** Built with Firebase Authentication SDK and React Context API. Users can sign up/login with email/password or use Google/Facebook OAuth providers. After OAuth login, users must complete their profile (phone number, address) before accessing main features - this is checked by a `profileComplete` field. The system stores user login state using Firebase's built-in session handling. Uses React Query to fetch and cache user data from backend. Has email verification with a 60-second cooldown timer that stores the timestamp in MongoDB, so it keeps working even after page refresh or server restart.

**Backend:** Uses Firebase Admin SDK to verify ID tokens sent from frontend. Each protected API route checks the token through `authMiddleware` - extracts the token from Authorization header, verifies it with Firebase, then stores user info in Express session for the request. User data (profile info, cart items, order history) is saved in MongoDB using Mongoose schemas. Has endpoints to update `lastVerificationEmailSentAt` timestamp in database, which prevents users from spamming verification emails. Password reset uses an in-memory Map to track cooldown for anonymous users, with automatic cleanup every hour.

**Technologies:** Firebase Authentication, Firebase Admin SDK, React Context API, React Query, MongoDB/Mongoose, Express sessions, JWT token verification

---

### **2. Product Catalog & Search**

**Frontend:** Built with React and i18next for multi-language support. Product listing page shows items in a grid with images from Supabase storage. Users can filter products by category, search by name/description, and sort by price or popularity. Uses React Query with smart caching - when you visit a product detail page and come back, the list doesn't reload. Product images are lazy-loaded for better performance. The UI updates language instantly when user switches between English and Chinese without page reload.

**Backend:** REST API built with Express providing endpoints like `GET /api/goods` (list with filters), `GET /api/goods/:id` (single product), `GET /api/goods/category/:category` (filter by category). Uses MongoDB aggregation pipeline to search text in product name/description. Products stored in `Good` schema with fields: name, description, price, category, quota (stock), preorderCloseDate, available (boolean), images (Supabase URLs array). Admin endpoints protected by middleware that checks if user role is admin.

**Technologies:** React, i18next, React Query, MongoDB text search, Express REST API, Mongoose schemas, Supabase for image hosting

---

### **3. Shopping Cart System**

**Frontend:** Uses a unified `useCart` hook that works for both guest and logged-in users. Guest carts are saved in browser localStorage (persists when you close browser). When you login, the system merges your guest cart with your saved cart from database. Uses React Query to sync cart with backend for logged-in users - updates immediately when you change quantity or remove items. Shows real-time validation errors if product becomes unavailable, preorder closes, or stock runs out. Cart icon in header shows item count badge. Calculates total price including quantity for each item.

**Backend:** For authenticated users, cart data is stored in `User.cart` field as an array of {goodId, quantity}. API endpoints: `GET /api/user/cart` (fetch cart), `POST /api/user/cart` (add item), `PUT /api/user/cart/:goodId` (update quantity), `DELETE /api/user/cart/:goodId` (remove item). Each cart operation checks if product exists and has enough stock. Uses MongoDB transactions to ensure cart updates are atomic. Guest users don't interact with backend cart - everything stays in localStorage until login/checkout.

**Technologies:** React hooks (custom useCart), React Query, localStorage API, MongoDB transactions, Express REST API, Mongoose schemas

---

### **4. Checkout & Payment Integration**

**Frontend:** Checkout page shows order summary with product details, quantities, and total price. Users enter shipping address and payment info. Uses Stripe Elements (React components) for secure card input - card numbers never touch our server. When user clicks "Pay", frontend calls backend to create a Stripe Payment Intent, then confirms payment with Stripe SDK. Shows loading spinner during payment. On success, redirects to order confirmation page. Handles payment errors (declined cards, network issues) with clear error messages.

**Backend:** Integrated with Stripe API for payment processing. Creates Payment Intent with order amount and metadata (orderId, userId). Before payment, creates a "pending" order in MongoDB with 15-minute expiration. Has a webhook endpoint `/api/stripe/webhook` that listens to Stripe events - when payment succeeds, webhook verifies signature, updates order status to "paid", and reduces product quota. Uses MongoDB transactions to ensure quota reduction and order update happen together. A background job runs every 5 minutes to delete expired pending orders and restore their quota.

**Technologies:** Stripe API, Stripe Elements (React), Stripe Webhooks, MongoDB transactions, Express endpoints, background jobs with setInterval

---

### **5. Order Management**

**Frontend:** Order history page shows all user's orders with status (pending/paid/shipped/completed). Each order displays products bought, total price, order date, and shipping info. Users can click to see full order details. Orders update in real-time when status changes (admin updates from dashboard). Uses React Query to cache order list and refetch when needed. Shows different UI states for empty orders, loading, and errors.

**Backend:** Orders stored in MongoDB `Order` schema with fields: userId, items (array of {goodId, quantity, price}), totalAmount, status, shippingAddress, paymentIntentId, createdAt, expiresAt. API endpoints: `GET /api/orders` (user's orders), `GET /api/orders/:id` (single order), `PATCH /api/orders/:id/status` (admin only - update status). Uses Mongoose populate to fetch product details when returning orders. Background cleanup job finds orders where `expiresAt < now` and `status === 'pending'`, then deletes them and restores product quota using MongoDB transactions.

**Technologies:** MongoDB/Mongoose, Express REST API, Mongoose populate, background jobs, date handling with JavaScript Date

---

### **Example Feature - Real-Time Customer Service Chat System**

**Frontend:** Built with React and Socket.io-client, the chat UI is a small widget that can be opened/closed from any page. Uses React Query to store and manage messages, with updates showing instantly across all open tabs. Shows a red badge with unread message count, which disappears when user opens the chat. The UI shows typing status, message time, and smooth animations. Admin users see all customer chats in one place, while regular users only see their own chat.

**Backend:** Uses Socket.io for two-way WebSocket connection and MongoDB to save messages. Each customer gets their own chat room with admin (using MongoDB ObjectId as room ID). Uses Express sessions to track user info and stores `lastReadTime` as a Map in the ChatRoom schema to remember when each user last read messages. Sends real-time events (`receiveMessage`, `orderConfirmed`) to users' browsers. Has REST API endpoints to get chat history, create chat rooms, and update read time. Checks user login status before allowing chat access.

**Technologies:** Socket.io, React Query, MongoDB (Map data type), Express sessions, TypeScript interfaces for type safety

---

### **6. Admin Dashboard**

**Frontend:** Admin-only section with protected routes (checks user role from context). Has tabs for Products, Orders, Users, and Chat Inbox. Products tab shows all products in a table with edit/delete buttons - clicking edit opens a form with product data pre-filled. Can upload product images which go to Supabase storage. Orders tab shows all orders with filter by status. Can update order status (pending→paid→shipped→completed). Chat inbox shows all customer conversations with unread counts - clicking opens chat panel on right side. Uses React Query for all data fetching with automatic cache updates after mutations.

**Backend:** All admin endpoints protected by `authMiddleware` that checks `req.session.user.role === 'admin'`. Product CRUD: `POST /api/admin/goods` (create), `PUT /api/admin/goods/:id` (update), `DELETE /api/admin/goods/:id` (delete). Uses Multer middleware to handle image uploads, then uploads to Supabase storage and returns URL. Order management: `GET /api/admin/orders` (all orders with filters), `PATCH /api/admin/orders/:id` (update status). User management: `GET /api/admin/users` (list users), `PATCH /api/admin/users/:id/role` (change role). Chat management: `GET /api/admin/chat/rooms` (all rooms with unread counts).

**Technologies:** React Router protected routes, React Query mutations, Multer, Supabase storage SDK, MongoDB queries with filters, role-based access control

---

### **7. Multi-Language Support**

**Frontend:** Built with i18next and react-i18next libraries. Language files stored in `src/locales/en` and `src/locales/zh` folders, organized by feature (auth.json, goods.json, header.json, etc.). Uses `useTranslation` hook in components to get translated text - just write `t('key')` and it shows correct language. Language switcher in header saves preference to localStorage. When language changes, all text updates instantly without reload. Supports both Chinese and English for all UI text, error messages, and product categories.

**Backend:** Product names and descriptions stored in MongoDB in both languages. The `Good` schema has fields like `name` (object with `en` and `zh` keys). When frontend requests products, backend returns both languages. Frontend picks the right one based on current language setting. API responses don't need translation since they return structured data - translation happens only in frontend.

**Technologies:** i18next, react-i18next, localStorage for language preference, MongoDB with nested objects for multi-language fields

---

### **8. Image Upload System**

**Frontend:** Uses file input with drag-and-drop support. Shows image preview before upload. When user selects image, uploads it to backend API. Shows progress bar during upload. After upload, displays the image URL. Admin product form can upload multiple product images. Has image validation - checks file size (max 5MB) and file type (only jpg/png). Shows error messages if validation fails.

**Backend:** Uses Multer middleware to handle file uploads with memory storage (doesn't save to disk). After receiving file from frontend, uploads to Supabase storage bucket using Supabase SDK. Supabase returns public URL which gets saved in MongoDB. Has image deletion endpoint - when admin deletes product or replaces image, removes old image from Supabase to save space. Uses environment variables for Supabase credentials (URL, key, bucket name).

**Technologies:** Multer, Supabase Storage SDK, file validation, drag-and-drop API, preview with FileReader

---

### **9. Dark Mode**

**Frontend:** Uses React Context to store theme state (light/dark). Theme switcher button in header toggles between modes. Saves preference to localStorage so it remembers your choice. When app loads, checks localStorage and system preference (`prefers-color-scheme` media query) to set initial theme. Uses CSS variables for colors - switching theme just changes the CSS variables, and all colors update instantly. No page flash when loading because theme loads before first render.

**Backend:** Not applicable - theme handling is purely frontend.

**Technologies:** React Context API, localStorage, CSS custom properties (variables), media queries for system preference detection

---

### **10. Responsive Design**

**Frontend:** Built with mobile-first approach using CSS Grid and Flexbox. Uses media queries to adjust layout for different screen sizes (mobile, tablet, desktop). Navigation menu collapses to hamburger menu on mobile. Product grid shows 1 column on mobile, 2-3 on tablet, 4+ on desktop. Cart and checkout forms stack vertically on mobile. Touch-friendly - all buttons and links are big enough for finger taps. Tested on Chrome DevTools device emulator for multiple devices.

**Backend:** Not applicable - responsive design is purely frontend CSS/layout work.

**Technologies:** CSS Grid, Flexbox, media queries, mobile-first design pattern

---

## Deployment Architecture

**Frontend Hosting:** Vercel (automatic deployment from GitHub, preview URLs for each commit, environment variables for API URLs)

**Backend Hosting:** Render.com free tier (750 hours/month, sleeps after 15 minutes of inactivity, Git-based auto-deploy)

**Keep-Alive Service:** UptimeRobot pings `/api/health` endpoint every 5 minutes to prevent Render from sleeping

**Database:** MongoDB Atlas free tier (512MB storage, cloud-hosted)

**File Storage:** Supabase (free tier for product images)

**CORS Configuration:** Backend uses regex pattern to allow all Vercel preview URLs dynamically: `/^https:\/\/online-toy-shop-[a-z0-9-]*\.vercel\.app$/`

---

## Key Technical Highlights

- **Real-time Features:** Socket.io for bidirectional WebSocket communication (chat, live updates)
- **State Management:** React Query for server state with smart caching and automatic refetching
- **Type Safety:** TypeScript across entire codebase (frontend + backend) with shared interfaces
- **Database Transactions:** MongoDB transactions ensure data consistency during cart checkout and payment
- **Authentication Flow:** Firebase token verification on every protected API request
- **Payment Security:** Stripe handles sensitive card data, webhook signature verification prevents fraud
- **Session Handling:** Express sessions for request-scoped user data, MongoDB for persistent data
- **Background Jobs:** Automatic cleanup of expired orders and timestamp maps
- **API Architecture:** RESTful endpoints with clear separation of public and protected routes
- **Error Handling:** Try-catch blocks in all async operations with meaningful error messages
- **Validation:** Client-side validation with instant feedback + server-side validation for security
