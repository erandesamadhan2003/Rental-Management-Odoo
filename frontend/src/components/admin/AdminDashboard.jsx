import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Sample admin data
  const [adminStats] = useState({
    totalUsers: 1247,
    totalOrders: 3456,
    totalRevenue: 87450,
    totalProducts: 245,
    pendingOrders: 23,
    activeRentals: 156,
    overduedReturns: 8,
    lowStockItems: 12
  })

  const [recentOrders] = useState([
    {
      id: 'R-2025-001',
      customer: 'John Smith',
      amount: 350,
      status: 'active',
      date: '2025-01-10',
      items: 2
    },
    {
      id: 'R-2025-002',
      customer: 'Sarah Wilson',
      amount: 275,
      status: 'pending',
      date: '2025-01-11',
      items: 3
    },
    {
      id: 'R-2025-003',
      customer: 'Mike Johnson',
      amount: 420,
      status: 'completed',
      date: '2025-01-11',
      items: 1
    }
  ])

  const [systemAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Low Stock Alert',
      message: '12 items are running low on stock',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'error',
      title: 'Overdue Returns',
      message: '8 rentals are overdue for return',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'New User Registration',
      message: '15 new users registered today',
      time: '6 hours ago'
    }
  ])

  const [topProducts] = useState([
    { name: 'Professional Camera', rentals: 45, revenue: 2250 },
    { name: 'Sound System', rentals: 38, revenue: 2850 },
    { name: 'Party Tent', rentals: 32, revenue: 3840 },
    { name: 'DJ Equipment', rentals: 28, revenue: 2520 },
    { name: 'Projector', rentals: 25, revenue: 1000 }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (type) => {
    switch(type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'orders', label: 'Order Management', icon: '📦' },
    { id: 'products', label: 'Product Management', icon: '🛍️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'system', label: 'System Settings', icon: '⚙️' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalOrders.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">${adminStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalProducts}</div>
              <div className="text-sm text-navy-600">Total Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{adminStats.pendingOrders}</div>
              <div className="text-sm text-navy-600">Pending Orders</div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{adminStats.activeRentals}</div>
              <div className="text-sm text-navy-600">Active Rentals</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{adminStats.overduedReturns}</div>
              <div className="text-sm text-navy-600">Overdue Returns</div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{adminStats.lowStockItems}</div>
              <div className="text-sm text-navy-600">Low Stock Items</div>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600">📉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-midnight-800">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-purple-100 rounded-lg">
                <div>
                  <div className="font-medium text-midnight-800">{order.id}</div>
                  <div className="text-sm text-navy-600">{order.customer}</div>
                  <div className="text-xs text-navy-500">{order.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">${order.amount}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">System Alerts</h3>
          
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{alert.title}</h4>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <span className="text-xs opacity-75">{alert.time}</span>
                  </div>
                  <button className="text-sm font-medium ml-3">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-midnight-800 mb-4">Top Performing Products</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="text-left py-3 font-medium text-navy-700">Product Name</th>
                <th className="text-center py-3 font-medium text-navy-700">Total Rentals</th>
                <th className="text-right py-3 font-medium text-navy-700">Revenue</th>
                <th className="text-center py-3 font-medium text-navy-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-purple-50">
                  <td className="py-3 text-midnight-800">{product.name}</td>
                  <td className="py-3 text-center text-navy-600">{product.rentals}</td>
                  <td className="py-3 text-right font-medium text-purple-600">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">User Management</h3>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Manage Users
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">1,234</div>
              <div className="text-sm text-navy-600">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">1,180</div>
              <div className="text-sm text-navy-600">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">54</div>
              <div className="text-sm text-navy-600">Pending Approval</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="font-semibold text-midnight-800 mb-4">Recent User Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">John Smith registered</div>
              <div className="text-sm text-navy-600">2 minutes ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Sarah Wilson updated profile</div>
              <div className="text-sm text-navy-600">15 minutes ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Mike Johnson account suspended</div>
              <div className="text-sm text-navy-600">1 hour ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">Order Management</h3>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Bulk Actions
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-midnight-800 mb-2">Order Management</h3>
        <p className="text-navy-600">Advanced order management and tracking interface would be displayed here</p>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">Product Management</h3>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Manage Products
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">456</div>
              <div className="text-sm text-navy-600">Total Products</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">389</div>
              <div className="text-sm text-navy-600">Available</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">23</div>
              <div className="text-sm text-navy-600">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="font-semibold text-midnight-800 mb-4">Top Performing Products</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Professional Camera Kit</div>
              <div className="text-sm text-navy-600">45 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$2,250</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Sound System Package</div>
              <div className="text-sm text-navy-600">38 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$2,850</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Party Tent Large</div>
              <div className="text-sm text-navy-600">32 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$3,840</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Analytics & Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Revenue Analytics</h4>
            <p className="text-sm text-navy-600">Revenue trends and forecasting charts</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Usage Statistics</h4>
            <p className="text-sm text-navy-600">Product usage and customer behavior data</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Performance Metrics</h4>
            <p className="text-sm text-navy-600">KPI tracking and performance indicators</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Custom Reports</h4>
            <p className="text-sm text-navy-600">Generate custom reports and exports</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">System Settings</h3>
        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Global Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Security Settings</h4>
          <p className="text-sm text-navy-600 mb-4">Manage authentication, permissions, and access controls</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Notifications</h4>
          <p className="text-sm text-navy-600 mb-4">Configure email, SMS, and in-app notifications</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Integrations</h4>
          <p className="text-sm text-navy-600 mb-4">Manage third-party integrations and APIs</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🗄️</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Database</h4>
          <p className="text-sm text-navy-600 mb-4">Database backup, maintenance, and optimization</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Manage →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Performance</h4>
          <p className="text-sm text-navy-600 mb-4">System performance monitoring and optimization</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Monitor →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔧</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Maintenance</h4>
          <p className="text-sm text-navy-600 mb-4">System maintenance and update management</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Schedule →
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'users':
        return renderUsers()
      case 'orders':
        return renderOrders()
      case 'products':
        return renderProducts()
      case 'analytics':
        return renderAnalytics()
      case 'system':
        return renderSystem()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-midnight-800">Admin Dashboard</h1>
                <p className="text-navy-600 mt-2">Comprehensive system administration and management</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-navy-600">Last Updated</div>
                  <div className="font-medium text-midnight-800">{new Date().toLocaleString()}</div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
