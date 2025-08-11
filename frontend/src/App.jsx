// App.jsx
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import Payment from './pages/Payment'

// Import Redux hooks
import { useAuth, useNotifications } from './hooks/useRedux'
import { getUnreadCount } from './app/features/notificationSlice'

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
    path: '/payment',
    element: (
      <SignedIn>
        <Payment />
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
  const { user } = useUser()
  const { dispatch } = useNotifications()
  const [lastUnreadCount, setLastUnreadCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Monitor notifications in real-time
  useEffect(() => {
    if (user?.id) {
      // Check for new notifications every 15 seconds
      const interval = setInterval(async () => {
        try {
          const result = await dispatch(getUnreadCount(user.id)).unwrap()
          if (result > lastUnreadCount && lastUnreadCount > 0) {
            // New notification received
            setToastMessage(`You have ${result - lastUnreadCount} new notification${result - lastUnreadCount > 1 ? 's' : ''}!`)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 4000) // Hide after 4 seconds
          }
          setLastUnreadCount(result)
        } catch (error) {
          console.error('Failed to check for new notifications:', error)
        }
      }, 15000) // Check every 15 seconds

      return () => clearInterval(interval)
    }
  }, [user?.id, dispatch, lastUnreadCount])

  return (
    <>
      <ClerkUserSync />
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
