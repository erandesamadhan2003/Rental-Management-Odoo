import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './Navbar'

const Dashboard = () => {
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')

  // Sample data for the charts and tables
  const chartData = {
    categories: [
      { name: 'Books + Stationery', delivered: 28, revenue: 2870 },
      { name: 'Electronics', delivered: 15, revenue: 4520 },
      { name: 'Furniture', delivered: 8, revenue: 3200 },
      { name: 'Sports Equipment', delivered: 12, revenue: 2100 }
    ],
    products: [
      { name: 'MacBook Pro', delivered: 5, revenue: 1500 },
      { name: 'Office Chair', delivered: 8, revenue: 960 },
      { name: 'Projector', delivered: 3, revenue: 750 },
      { name: 'Camera Kit', delivered: 4, revenue: 1200 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-purple-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Timeframe Selection */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-purple-200 w-fit">
            {['Yearly', 'Monthly', 'Daily'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period.toLowerCase())}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === period.toLowerCase()
                    ? 'bg-navy-500 text-white'
                    : 'text-navy-700 hover:bg-beige-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Quotations</h3>
            <div className="text-3xl font-bold text-purple-500">124</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Rentals</h3>
            <div className="text-3xl font-bold text-navy-500">87</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Returns</h3>
            <div className="text-3xl font-bold text-beige-600">63</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Product Categories */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-teal-200">
            <div className="p-6 border-b border-teal-100">
              <h3 className="text-lg font-semibold text-teal-800">Top Product Categories</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {chartData.categories.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-teal-700">{item.name}</span>
                        <span className="text-sm text-teal-600">{item.delivered}</span>
                      </div>
                      <div className="w-full bg-teal-100 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{width: `${(item.delivered / 30) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-teal-800">Delivered</div>
                      <div className="text-sm text-teal-600">Revenue</div>
                    </div>
                    <div className="ml-2 text-right">
                      <div className="text-sm font-bold text-teal-800">{item.delivered}</div>
                      <div className="text-sm text-teal-600">${item.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-teal-200">
            <div className="p-6 border-b border-teal-100">
              <h3 className="text-lg font-semibold text-teal-800">Top Products</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {chartData.products.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-teal-700">{item.name}</span>
                        <span className="text-sm text-teal-600">{item.delivered}</span>
                      </div>
                      <div className="w-full bg-peach-100 rounded-full h-2">
                        <div 
                          className="bg-peach-500 h-2 rounded-full" 
                          style={{width: `${(item.delivered / 8) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-teal-800">Delivered</div>
                      <div className="text-sm text-teal-600">Revenue</div>
                    </div>
                    <div className="ml-2 text-right">
                      <div className="text-sm font-bold text-teal-800">{item.delivered}</div>
                      <div className="text-sm text-teal-600">${item.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
            <div className="p-6 border-b border-purple-100">
              <h3 className="text-lg font-semibold text-midnight-800">Revenue Trends</h3>
            </div>
            <div className="p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-navy-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-navy-600">Chart visualization will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
            <div className="p-6 border-b border-purple-100">
              <h3 className="text-lg font-semibold text-midnight-800">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { equipment: 'Equipment1', delivered: 15, revenue: 1245 },
                  { equipment: 'Equipment2', delivered: 8, revenue: 890 },
                  { equipment: 'Equipment3', delivered: 12, revenue: 1100 },
                  { equipment: 'Equipment4', delivered: 6, revenue: 750 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-navy-700">{item.equipment}</span>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-sm font-medium text-midnight-800">{item.delivered}</div>
                      <div className="text-xs text-navy-600">Delivered</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-midnight-800">${item.revenue}</div>
                      <div className="text-xs text-navy-600">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border border-purple-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-midnight-800">
              Account Information
            </h3>
            <div className="mt-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-navy-700">
                    Full Name
                  </label>
                  <p className="mt-1 text-sm text-midnight-800">
                    {user?.fullName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-midnight-800">
                    {user?.primaryEmailAddress?.emailAddress || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700">
                    User ID
                  </label>
                  <p className="mt-1 text-sm text-midnight-800 font-mono">
                    {user?.id || 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700">
                    Account Created
                  </label>
                  <p className="mt-1 text-sm text-midnight-800">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
