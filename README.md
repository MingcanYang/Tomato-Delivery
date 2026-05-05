# Tomato Delivery

Tomato Delivery is a full-stack food ordering app built with React, Vite, Node.js, Express, MongoDB, and Stripe. It includes a customer storefront, authentication, cart and checkout, order history, support messaging, profile views, and an admin panel for foods, orders, and customer replies.

## Live Demo

- Customer Web  
  `https://tomato-delivery-f-yzxf.onrender.com/`  
  Demo account: `mcy@mail.com` / `123456!@#`
- Admin Route  
  `https://tomato-delivery-f-yzxf.onrender.com/admin`  
  Admin access uses the backend `ADMIN_TOKEN` value entered in the UI

## Project Overview

- `Frontend/`: Vite + React frontend with multiple client-side routes
- `Backend/`: Express API server connected to MongoDB

The frontend handles food browsing, search, authentication, cart state, checkout, order tracking, profile data, support messages, and the `/admin` route.

The backend handles authentication, food CRUD, cart persistence for signed-in users, Stripe Checkout session creation and verification, support messages, admin replies, and image hosting from `Backend/uploads`.

## Core Features

### Customer Features

- User registration and login
- Food list loaded from MongoDB
- Category filter and keyword search
- Guest cart stored in `localStorage`
- Guest cart sync to the server after login
- Stripe checkout flow
- Payment verification page
- Order history with newest orders first
- In-progress and completed order filters
- Expandable order details for items, totals, and delivery address
- Order status tracking: `Food Processing`, `Out for delivery`, `Delivered`
- Contact form for support requests
- Profile page with personal info, admin replies, and logout

### Admin Features

- Dedicated frontend route: `/admin`
- Food management:
  - list foods
  - add food
  - edit food
  - remove food
  - upload images
  - filter by category
- Order management:
  - list all orders
  - update order status
- Message management:
  - review customer messages
  - send replies

### Payment and Order Handling

- Stripe Checkout session is created on the backend
- Stripe success and cancel redirects both go to `/verify`
- Payment is verified server-side using the Stripe `session_id`
- Signed-in user cart is cleared in the database after successful payment
- Frontend guest cart is cleared after successful verification
- Unpaid orders are cleaned up automatically after expiration
- Open Stripe checkout sessions are preserved so verification can still complete

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Plain CSS files

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Multer for image uploads
- Stripe Checkout

## Application Structure

```text
Tomato-Delivery/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   └── server.js
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── vite.config.js
└── README.md
```

## API Summary

### User

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/profile` - requires user `token`

### Food

- `GET /api/food/list`
- `POST /api/food/add` - requires `admin-token`
- `POST /api/food/update` - requires `admin-token`
- `POST /api/food/remove` - requires `admin-token`

### Cart

- `POST /api/cart/get` - requires user `token`
- `POST /api/cart/add` - requires user `token`
- `POST /api/cart/remove` - requires user `token`

### Order

- `GET /api/order/list` - requires `admin-token`
- `POST /api/order/userorders` - requires user `token`
- `POST /api/order/place` - requires user `token`
- `POST /api/order/status` - requires `admin-token`
- `POST /api/order/verify`

### Message

- `POST /api/message/send`
- `GET /api/message/list` - requires `admin-token`
- `GET /api/message/mine` - requires user `token`
- `POST /api/message/reply` - requires `admin-token`

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/MingcanYang/Tomato-Delivery.git
cd Tomato-Delivery
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

### 4. Configure backend environment variables

Create `Backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
ADMIN_TOKEN=your_admin_token
PORT=4000
```

### 5. Configure frontend environment variables

Optional for local development because the frontend falls back to `http://localhost:4000`.

Create `Frontend/.env` if you want to set it explicitly:

```env
VITE_API_URL=http://localhost:4000
```

### 6. Run the backend

From `Backend/`:

```bash
npm run server
```

### 7. Run the frontend

From `Frontend/`:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Database Seeding

The project includes a seed script that upserts the food catalog into MongoDB.

From `Backend/`:

```bash
npm run seed:foods
```

The seeded records reference image filenames already stored in `Backend/uploads/`.

## Deployment Notes

This project is typically deployed as:

- one backend service from `Backend/`
- one frontend static site from `Frontend/`

### Backend on Render

- Root directory: `Backend`
- Build command:

```bash
npm install
```

- Start command:

```bash
node server.js
```

Required environment variables:

```env
PORT=10000
MONGODB_URI=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
FRONTEND_URL=https://your-frontend.onrender.com
ADMIN_TOKEN=...
```

### Frontend on Render

- Root directory: `Frontend`
- Build command:

```bash
npm install && npm run build
```

- Publish directory:

```bash
dist
```

Required environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com
```

### Render Rewrite Rule for Client Routes

Because the frontend uses React Router client-side routing, configure this rewrite rule in Render Static Site settings:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

Without this, direct refreshes on routes like `/admin`, `/orders`, or `/profile` will return `Not Found`.

## Important Notes

- The frontend uses `VITE_API_URL` for API requests, with `http://localhost:4000` as the local fallback.
- The backend uses `FRONTEND_URL` when building Stripe redirect URLs.
- `Backend/.env` should not be committed.
- Food images are served from `/images/<filename>`.
- Admin-protected backend endpoints expect the `admin-token` request header.

## Screenshots

![image](/Screenshots/menu.png)
![image](/Screenshots/orders.png)
![image](/Screenshots/contact.png)
![image](/Screenshots/cart.png)
![image](/Screenshots/admin-food.png)
