// App.jsx
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import './App.css'

// Import your components
import Home from './components/Home'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Orders from './components/Orders'
import Customers from './components/Customers'
import Reports from './components/Reports'
import Notifications from './components/Notifications'
import Settings from './components/Settings'
import ClerkUserSync from './components/ClerkUserSync'
import RentalOrderForm from './components/RentalOrderForm'
import PickupOrder from './components/PickupOrder'
import ReturnOrder from './components/ReturnOrder'
import ProductInventory from './components/ProductInventory'
import ProductConfiguration from './components/ProductConfiguration'
import ProductCatalog from './components/ProductCatalog'
import ProductDetails from './components/ProductDetails'
import QuoteOrder from './components/QuoteOrder'
import DeliveryManagement from './components/DeliveryManagement'
import CustomerPortal from './components/CustomerPortal'


// Environment Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Router Config
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/sign-in/*',
    element: <SignInPage />
  },
  {
    path: '/sign-up/*',
    element: <SignUpPage />
  },
  {
    path: '/dashboard',
    element: (
      <SignedIn>
        <Dashboard />
      </SignedIn>
    )
  },
  {
    path: '/products',
    element: (
      <SignedIn>
        <Products />
      </SignedIn>
    )
  },
  {
    path: '/orders',
    element: (
      <SignedIn>
        <Orders />
      </SignedIn>
    )
  },
  {
    path: '/orders/new',
    element: (
      <SignedIn>
        <RentalOrderForm />
      </SignedIn>
    )
  },
  {
    path: '/orders/:orderId',
    element: (
      <SignedIn>
        <RentalOrderForm />
      </SignedIn>
    )
  },
  {
    path: '/pickup',
    element: (
      <SignedIn>
        <PickupOrder />
      </SignedIn>
    )
  },
  {
    path: '/pickup/:pickupId',
    element: (
      <SignedIn>
        <PickupOrder />
      </SignedIn>
    )
  },
  {
    path: '/return',
    element: (
      <SignedIn>
        <ReturnOrder />
      </SignedIn>
    )
  },
  {
    path: '/return/:returnId',
    element: (
      <SignedIn>
        <ReturnOrder />
      </SignedIn>
    )
  },
  {
    path: '/inventory',
    element: (
      <SignedIn>
        <ProductInventory />
      </SignedIn>
    )
  },
  {
    path: '/products/configure',
    element: (
      <SignedIn>
        <ProductConfiguration />
      </SignedIn>
    )
  },
  {
    path: '/products/configure/:productId',
    element: (
      <SignedIn>
        <ProductConfiguration />
      </SignedIn>
    )
  },
  {
    path: '/catalog',
    element: (
      <SignedIn>
        <ProductCatalog />
      </SignedIn>
    )
  },
  {
    path: '/products/:productId',
    element: (
      <SignedIn>
        <ProductDetails />
      </SignedIn>
    )
  },
  {
    path: '/quote',
    element: (
      <SignedIn>
        <QuoteOrder />
      </SignedIn>
    )
  },
  {
    path: '/quote/:quoteId',
    element: (
      <SignedIn>
        <QuoteOrder />
      </SignedIn>
    )
  },
  {
    path: '/delivery',
    element: (
      <SignedIn>
        <DeliveryManagement />
      </SignedIn>
    )
  },
  {
    path: '/customer-portal',
    element: (
      <SignedIn>
        <CustomerPortal />
      </SignedIn>
    )
  },
  {
    path: '/customers',
    element: (
      <SignedIn>
        <Customers />
      </SignedIn>
    )
  },
  {
    path: '/reports',
    element: (
      <SignedIn>
        <Reports />
      </SignedIn>
    )
  },
  {
    path: '/notifications',
    element: (
      <SignedIn>
        <Notifications />
      </SignedIn>
    )
  },
  {
    path: '/settings',
    element: (
      <SignedIn>
        <Settings />
      </SignedIn>
    )
  },
  {
    path: '/protected',
    element: (
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkUserSync />
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
      </div>
    </ClerkProvider>
  )
}

export default App
