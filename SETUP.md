# Rental Management with Clerk Authentication

This project implements a rental management system with Clerk authentication for React frontend and Express backend.

## Setup Instructions

### 1. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your Publishable Key and Secret Key
4. Configure the following redirect URLs in Clerk:
   - Sign-in redirect: `http://localhost:5173/dashboard`
   - Sign-up redirect: `http://localhost:5173/dashboard`
   - After sign-out: `http://localhost:5173/`

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env.local` file with your Clerk Publishable Key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/rental-management
   CLIENT_URL=http://localhost:5173
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   JWT_SECRET=your_jwt_secret_here
   ```

4. Make sure MongoDB is running on your system

5. Start the server:
   ```bash
   npm run dev
   ```

### 4. Setting up Clerk Webhooks (Optional but Recommended)

1. In your Clerk Dashboard, go to Webhooks
2. Create a new endpoint: `http://localhost:3000/api/users/webhooks/clerk`
3. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook secret and add it to your backend `.env` file

## Features

- **Authentication**: Complete sign-in/sign-up flow with Clerk
- **User Management**: Automatic user creation and synchronization
- **Protected Routes**: Dashboard accessible only to authenticated users
- **Responsive Design**: Built with Tailwind CSS
- **REST API**: Backend API for user management

## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (with pagination and search)
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/clerk/:clerkId` - Get user by Clerk ID
- `PUT /api/users/:clerkId` - Update user
- `DELETE /api/users/:clerkId` - Delete user

### Webhooks
- `POST /api/users/webhooks/clerk` - Clerk webhook handler

## Technology Stack

### Frontend
- React 19
- Vite
- Clerk React
- React Router DOM
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Clerk SDK

## Development Notes

- The frontend runs on `http://localhost:5173`
- The backend runs on `http://localhost:3000`
- MongoDB should be running on `mongodb://localhost:27017`
- Make sure to update environment variables before running the application

## Next Steps

1. Add more rental-specific features (products, orders, events)
2. Implement role-based access control
3. Add email notifications
4. Implement payment processing
5. Add admin dashboard
