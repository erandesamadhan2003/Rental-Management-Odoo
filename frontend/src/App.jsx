// App.jsx
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import './App.css'

// Pages & Components
import Home from './pages/Home'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import Dashboard from './pages/Dashboard'
import ClerkUserSync from './pages/ClerkUserSync'

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
