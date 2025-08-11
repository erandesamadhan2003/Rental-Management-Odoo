import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Navbar from './Navbar'
import { getAllProducts } from '../lib/actions/product.actions'
import { getUserBookings } from '../lib/actions/booking.actions'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

const Dashboard = () => {
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [myProducts, setMyProducts] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const clerkId = user?.id
        const [productsData, bookingsData] = await Promise.all([
          getAllProducts({ ownerClerkId: clerkId }),
          clerkId ? getUserBookings(clerkId) : Promise.resolve([]),
        ])
        if (!cancelled) {
          setMyProducts(productsData || [])
          setBookings(bookingsData || [])
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  const totals = useMemo(() => {
    // Filter bookings based on selected timeframe
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt || booking.startDate)
      const now = new Date()
      
      if (selectedTimeframe === 'daily') {
        // Today only
        return bookingDate.toDateString() === now.toDateString()
      } else if (selectedTimeframe === 'monthly') {
        // Current month
        return bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear()
      } else if (selectedTimeframe === 'yearly') {
        // Current year
        return bookingDate.getFullYear() === now.getFullYear()
      }
      
      return true // Default to all bookings
    })
    
    const totalRentals = filteredBookings.length
    const completed = filteredBookings.filter(b => b.status === 'completed').length
    const returns = filteredBookings.filter(b => b.returnStatus === 'completed').length
    const revenue = filteredBookings.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0)
    
    return { totalRentals, completed, returns, revenue }
  }, [bookings, selectedTimeframe])

  const chartData = useMemo(() => {
    // Filter bookings based on selected timeframe
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt || booking.startDate)
      const now = new Date()
      
      if (selectedTimeframe === 'daily') {
        // Today only
        return bookingDate.toDateString() === now.toDateString()
      } else if (selectedTimeframe === 'monthly') {
        // Current month
        return bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear()
      } else if (selectedTimeframe === 'yearly') {
        // Current year
        return bookingDate.getFullYear() === now.getFullYear()
      }
      
      return true // Default to all bookings
    })
    
    // Category and product data
    const categoryMap = new Map()
    const productMap = new Map()
    for (const b of filteredBookings) {
      const cat = (b.productId?.category) || 'Uncategorized'
      const title = (b.productId?.title) || 'Unknown'
      const amount = Number(b.totalPrice || 0)
      const catEntry = categoryMap.get(cat) || { name: cat, delivered: 0, revenue: 0 }
      catEntry.delivered += 1
      catEntry.revenue += amount
      categoryMap.set(cat, catEntry)
      const prodEntry = productMap.get(title) || { name: title, delivered: 0, revenue: 0 }
      prodEntry.delivered += 1
      prodEntry.revenue += amount
      productMap.set(title, prodEntry)
    }
    const categories = Array.from(categoryMap.values()).sort((a, b) => b.delivered - a.delivered).slice(0, 4)
    const products = Array.from(productMap.values()).sort((a, b) => b.delivered - a.delivered).slice(0, 4)
    
    // Time series data for charts
    let timeLabels = []
    let revenueData = []
    let bookingsData = []
    
    if (selectedTimeframe === 'daily') {
      // Last 24 hours by hour
      for (let i = 0; i < 24; i++) {
        const hour = new Date()
        hour.setHours(hour.getHours() - 23 + i, 0, 0, 0)
        timeLabels.push(hour.getHours() + ':00')
        
        const hourlyBookings = filteredBookings.filter(b => {
          const bookingDate = new Date(b.createdAt || b.startDate)
          return bookingDate.getHours() === hour.getHours() && 
                 bookingDate.toDateString() === hour.toDateString()
        })
        
        bookingsData.push(hourlyBookings.length)
        revenueData.push(hourlyBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0))
      }
    } else if (selectedTimeframe === 'monthly') {
      // Last 30 days
      for (let i = 0; i < 30; i++) {
        const day = new Date()
        day.setDate(day.getDate() - 29 + i)
        timeLabels.push(day.getDate())
        
        const dailyBookings = filteredBookings.filter(b => {
          const bookingDate = new Date(b.createdAt || b.startDate)
          return bookingDate.getDate() === day.getDate() && 
                 bookingDate.getMonth() === day.getMonth() && 
                 bookingDate.getFullYear() === day.getFullYear()
        })
        
        bookingsData.push(dailyBookings.length)
        revenueData.push(dailyBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0))
      }
    } else if (selectedTimeframe === 'yearly') {
      // Last 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 0; i < 12; i++) {
        const month = new Date()
        month.setMonth(month.getMonth() - 11 + i)
        timeLabels.push(monthNames[month.getMonth()])
        
        const monthlyBookings = filteredBookings.filter(b => {
          const bookingDate = new Date(b.createdAt || b.startDate)
          return bookingDate.getMonth() === month.getMonth() && 
                 bookingDate.getFullYear() === month.getFullYear()
        })
        
        bookingsData.push(monthlyBookings.length)
        revenueData.push(monthlyBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0))
      }
    }
    
    // Prepare chart datasets
    const timeSeriesData = {
      labels: timeLabels,
      bookings: bookingsData,
      revenue: revenueData
    }
    
    // Category data for pie chart
    const categoryChartData = {
      labels: categories.map(c => c.name),
      data: categories.map(c => c.delivered)
    }
    
    return { categories, products, timeSeriesData, categoryChartData }
  }, [bookings, selectedTimeframe])

  const recentBookings = useMemo(() => {
    // Filter bookings based on selected timeframe
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt || booking.startDate)
      const now = new Date()
      
      if (selectedTimeframe === 'daily') {
        // Today only
        return bookingDate.toDateString() === now.toDateString()
      } else if (selectedTimeframe === 'monthly') {
        // Current month
        return bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear()
      } else if (selectedTimeframe === 'yearly') {
        // Current year
        return bookingDate.getFullYear() === now.getFullYear()
      }
      
      return true // Default to all bookings
    })
    
    return [...filteredBookings]
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
      .slice(0, 4)
  }, [bookings, selectedTimeframe])

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Quotations</h3>
            <div className="text-3xl font-bold text-purple-500">{myProducts.length}</div>
            <div className="text-sm text-navy-600 mt-2">Total Products</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Rentals</h3>
            <div className="text-3xl font-bold text-navy-500">{totals.totalRentals}</div>
            <div className="text-sm text-navy-600 mt-2">Active Bookings</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Returns</h3>
            <div className="text-3xl font-bold text-beige-600">{totals.returns}</div>
            <div className="text-sm text-navy-600 mt-2">Completed Returns</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Revenue</h3>
            <div className="text-3xl font-bold text-green-600">₹{totals.revenue.toLocaleString()}</div>
            <div className="text-sm text-navy-600 mt-2">{selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} Revenue</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Product Categories */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-teal-200">
            <div className="p-6 border-b border-teal-100">
              <h3 className="text-lg font-semibold text-teal-800">Top Product Categories</h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div className="h-48">
                <Pie
                  data={{
                    labels: chartData.categoryChartData.labels,
                    datasets: [
                      {
                        label: 'Rentals',
                        data: chartData.categoryChartData.data,
                        backgroundColor: [
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(6, 148, 162, 0.8)',
                          'rgba(14, 116, 144, 0.8)',
                          'rgba(8, 145, 178, 0.8)',
                        ],
                        borderColor: [
                          'rgba(20, 184, 166, 1)',
                          'rgba(6, 148, 162, 1)',
                          'rgba(14, 116, 144, 1)',
                          'rgba(8, 145, 178, 1)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
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
                    <div className="ml-2 text-right">
                      <div className="text-sm font-bold text-teal-800">₹{item.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Trends */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-teal-200">
            <div className="p-6 border-b border-teal-100">
              <h3 className="text-lg font-semibold text-teal-800">Booking Trends</h3>
            </div>
            <div className="p-6 h-64">
              <Bar
                data={{
                  labels: chartData.timeSeriesData.labels,
                  datasets: [
                    {
                      label: 'Number of Bookings',
                      data: chartData.timeSeriesData.bookings,
                      backgroundColor: 'rgba(14, 116, 144, 0.8)',
                      borderColor: 'rgba(14, 116, 144, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        precision: 0
                      }
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
            <div className="p-6 border-b border-purple-100">
              <h3 className="text-lg font-semibold text-midnight-800">Revenue Trends</h3>
            </div>
            <div className="p-6 h-64">
              <Line 
                data={{
                  labels: chartData.timeSeriesData.labels,
                  datasets: [
                    {
                      label: 'Revenue (₹)',
                      data: chartData.timeSeriesData.revenue,
                      borderColor: 'rgb(79, 70, 229)',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        callback: (value) => `₹${value}`
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
            <div className="p-6 border-b border-purple-100">
              <h3 className="text-lg font-semibold text-midnight-800">Recent Activity</h3>
            </div>
            <div className="p-6">
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((bk, index) => (
                    <div key={bk._id || index} className="flex items-center justify-between py-3 border-b border-purple-100 last:border-b-0">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-navy-700">{bk.productId?.title || 'Unknown product'}</span>
                        <div className="text-xs text-navy-500 mt-1">
                          {new Date(bk.createdAt || bk.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-sm font-medium text-midnight-800 capitalize">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${{
                            'completed': 'bg-green-100 text-green-800',
                            'in_rental': 'bg-blue-100 text-blue-800',
                            'pending_payment': 'bg-yellow-100 text-yellow-800',
                            'requested': 'bg-purple-100 text-purple-800',
                            'rejected': 'bg-red-100 text-red-800',
                            'cancelled': 'bg-gray-100 text-gray-800'
                          }[bk.status] || 'bg-gray-100 text-gray-800'}`}>
                            {bk.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-midnight-800">₹{bk.totalPrice}</div>
                        <div className="text-xs text-navy-600">Total</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-navy-600">
                  No recent activity for this time period
                </div>
              )}
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
