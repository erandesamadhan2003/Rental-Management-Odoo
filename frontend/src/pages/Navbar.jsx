import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const { user } = useUser()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Products', href: '/products', icon: 'products' },
    { name: 'Orders', href: '/orders', icon: 'orders' },
    { name: 'Customers', href: '/customers', icon: 'customers' },
    { name: 'Reports', href: '/reports', icon: 'reports' },
    { name: 'Settings', href: '/settings', icon: 'settings' }
  ]

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      products: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      orders: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      customers: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      reports: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      settings: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
    return icons[iconName] || icons.dashboard
  }

  const isActivePage = (href) => {
    return location.pathname === href
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-purple-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-navy-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-midnight-800">Rental Pro</span>
            </Link>
            
            {/* Navigation Menu - Desktop */}
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = isActivePage(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-navy-700 hover:text-midnight-800 hover:bg-purple-100'
                    }`}
                  >
                    {getIcon(item.icon)}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Right Side - Search, Notifications, User */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar - Desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-3 py-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button className="p-2 text-navy-600 hover:bg-purple-100 rounded-md transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden lg:inline">New Rental</span>
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-midnight-800">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin'}
                </div>
                <div className="text-xs text-navy-600">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@rental.com'}
                </div>
              </div>
              
              {/* Clerk User Button */}
              <div className="flex items-center">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-white shadow-lg border border-purple-200 rounded-lg",
                      userButtonPopoverActions: "text-navy-700"
                    }
                  }}
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="p-2 text-navy-600 hover:bg-purple-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-purple-200 py-2">
          <div className="grid grid-cols-3 gap-2">
            {navigation.slice(0, 6).map((item) => {
              const isActive = isActivePage(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'text-navy-700 hover:bg-purple-100'
                  }`}
                >
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
