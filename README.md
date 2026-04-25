# Tomato Delivery

Tomato Delivery is a full-stack food ordering application built with React, Node.js, Express, MongoDB, and Stripe. It includes a customer-facing storefront, cart and checkout flow, payment verification, order tracking, a contact/support flow, profile and message history, and an admin dashboard for managing foods, orders, and customer replies.

## Live Demo

Try the deployed application here:

- Customer Web:  
(email: mcy@mail.com; password: 123456!@#)  
https://tomato-delivery-f-yzxf.onrender.com/
- Admin Dashboard:  
(admin token: admin123)  
https://tomato-delivery-f-yzxf.onrender.com/admin

## Project Overview

The application is split into two parts:

- `Frontend/`: a Vite + React single-page application
- `Backend/`: an Express API server connected to MongoDB

The frontend handles browsing food items, authentication, cart state, checkout, order history, contact messages, profile views, and the admin interface.  
The backend handles user auth, food CRUD, cart persistence, order creation and verification, Stripe checkout sessions, support messages, admin replies, and serving uploaded food images.

## Core Features

### Customer Features

- User registration and login
- Food list loaded from MongoDB instead of hardcoded frontend data
- Category browsing and search
- Add/remove cart items with guest cart persistence
- Cart sync after login
- Checkout with Stripe
- Payment verification page
- Order history page with:
  - in-progress and completed filters
  - collapsible order cards
  - delivery progress states
  - newest orders shown first
- Contact page for support messages
- Profile page with:
  - personal info
  - admin replies/messages
  - logout

### Admin Features

- Dedicated `/admin` dashboard route
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
  - send admin replies

### Payment and Order Handling

- Stripe Checkout session creation on the backend
- Success redirect to frontend verification route
- Server-side verification using Stripe session data
- Cart clearing after successful verification
- Protection against deleting active checkout orders during payment flow
- Automatic cleanup logic for expired unpaid orders

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Plain CSS modules/files per page/component

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Multer for image uploads
- Stripe for payment

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
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── assets/
│   └── vite.config.js
└── README.md
```

## API Summary

### User

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/profile`

### Food

- `GET /api/food/list`
- `POST /api/food/add`
- `POST /api/food/update`
- `POST /api/food/remove`

### Cart

- `POST /api/cart/get`
- `POST /api/cart/add`
- `POST /api/cart/remove`

### Order

- `GET /api/order/list`
- `POST /api/order/userorders`
- `POST /api/order/place`
- `POST /api/order/status`
- `POST /api/order/verify`

### Message

- `POST /api/message/send`
- `GET /api/message/list`
- `GET /api/message/mine`
- `POST /api/message/reply`

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

### 4. Configure environment variables

Create `Backend/.env` with values like:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
ADMIN_TOKEN=your_admin_token
PORT=4000
```

### 5. Run the backend

From `Backend/`:

```bash
npm run server
```

### 6. Run the frontend

From `Frontend/`:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Database Seeding

The project includes a seed script to populate food data in MongoDB.

From `Backend/`:

```bash
npm run seed:foods
```

This writes the menu items into the database and uses images from `Backend/uploads/`.

## Deployment Notes

The project can be deployed on Render as two separate services:

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

### Render SPA Rewrite Rule

Because the frontend uses React Router, configure this rewrite rule in Render Static Site settings:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

Without this, routes like `/admin`, `/orders`, or `/profile` will return `Not Found` on direct refresh.

## Important Implementation Notes

- The frontend uses environment variables for API and redirect URLs.
- Old localhost URLs are kept in code comments as local references, but deployment should rely on environment variables.
- `Backend/.env` should never be committed.
- Food images are served from:

```text
/images/<filename>
```

- Admin functionality lives in the frontend route:

```text
/admin
```

- The admin dashboard requires `ADMIN_TOKEN` configured on the backend.

## Screenshots

![image](/Screenshots/menu.png)
![image](/Screenshots/orders.png)
![image](/Screenshots/contact.png)
![image](/Screenshots/cart.png)
![image](/Screenshots/admin-food.png)
