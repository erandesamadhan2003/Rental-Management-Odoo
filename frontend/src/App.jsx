// App.jsx
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
import Settings from './components/Settings'
import ClerkUserSync from './components/ClerkUserSync'
import Notifications from './components/Notifications'


// Import Redux hooks
import { useAuth } from './hooks/useRedux'

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
    path: '/settings',
    element: (
      <SignedIn>
        <Settings />
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
    <>
      <ClerkUserSync />
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App
