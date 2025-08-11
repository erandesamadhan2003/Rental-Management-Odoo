import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-sage-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-sage-800">
                Rental Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-sage-700 hover:text-sage-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-sage-400 hover:bg-sage-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="text-sage-700 hover:text-sage-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-sage-800 sm:text-5xl md:text-6xl">
            <span className="block">Rental Management</span>
            <span className="block text-sage-400">Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-sage-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your rental process with our comprehensive platform. 
            Manage products, schedule pickups, and handle bookings with ease.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <SignedOut>
              <div className="rounded-md shadow-lg">
                <Link
                  to="/sign-up"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sage-400 hover:bg-sage-500 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow-lg sm:mt-0 sm:ml-3">
                <Link
                  to="/sign-in"
                  className="w-full flex items-center justify-center px-8 py-3 border border-sage-300 text-base font-medium rounded-md text-sage-700 bg-white hover:bg-sage-50 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="rounded-md shadow-lg">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sage-400 hover:bg-sage-500 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-sage-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-sage-300 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-sage-800 mb-2">
                Product Management
              </h3>
              <p className="text-sage-600">
                Easily manage your rental inventory with our intuitive interface.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-sage-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-sage-300 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-sage-800 mb-2">
                Online Booking
              </h3>
              <p className="text-sage-600">
                Customers can book and reserve products directly through your website.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-sage-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-sage-300 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-sage-800 mb-2">
                Flexible Pricing
              </h3>
              <p className="text-sage-600">
                Create customized pricing based on different time frames.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
