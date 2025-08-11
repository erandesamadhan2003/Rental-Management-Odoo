import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
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

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkUserSync />
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <SignedIn>
                  <Dashboard />
                </SignedIn>
              }
            />
            
            <Route
              path="/products"
              element={
                <SignedIn>
                  <Products />
                </SignedIn>
              }
            />

            <Route
              path="/orders"
              element={
                <SignedIn>
                  <Orders />
                </SignedIn>
              }
            />

            <Route
              path="/customers"
              element={
                <SignedIn>
                  <Customers />
                </SignedIn>
              }
            />

            <Route
              path="/reports"
              element={
                <SignedIn>
                  <Reports />
                </SignedIn>
              }
            />

            <Route
              path="/settings"
              element={
                <SignedIn>
                  <Settings />
                </SignedIn>
              }
            />
            
            {/* Redirect to sign-in if not authenticated */}
            <Route
              path="/protected"
              element={
                <SignedOut>
                  <Navigate to="/sign-in" />
                </SignedOut>
              }
            />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  )
}

export default App
