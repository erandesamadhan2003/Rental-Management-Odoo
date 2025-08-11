import { useUser, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

// ✅ Dashboard Data (JSON at the top)
const dashboardData = {
  stats: [
    { label: 'Total Products', value: 12, color: 'bg-blue-500', icon: '📦' },
    { label: 'Active Rentals', value: 5, color: 'bg-green-500', icon: '✅' },
    { label: 'Pending Orders', value: 3, color: 'bg-yellow-500', icon: '⏳' },
    { label: 'Revenue', value: '$1,250.00', color: 'bg-purple-500', icon: '💰' }
  ],
  quickActions: [
    { label: 'Add New Product', link: '/add-product', icon: '➕' },
    { label: 'View Orders', link: '/orders', icon: '📜' },
    { label: 'Manage Customers', link: '/customers', icon: '👥' }
  ]
}

const Dashboard = () => {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
              Rental Management
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Welcome, {user?.firstName || 'User'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your rental business from here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {dashboardData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white hover:shadow-xl transition rounded-lg p-5 border border-gray-100"
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl`}
                >
                  {stat.icon}
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardData.quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.link}
                className="relative block w-full bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <span className="text-3xl mb-2 block">{action.icon}</span>
                <span className="block text-sm font-medium text-gray-900">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">
            Account Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Full Name
              </label>
              <p className="mt-1 text-base text-gray-900">
                {user?.fullName || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Email
              </label>
              <p className="mt-1 text-base text-gray-900">
                {user?.primaryEmailAddress?.emailAddress || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                User ID
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {user?.id || 'Not available'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Account Created
              </label>
              <p className="mt-1 text-base text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
