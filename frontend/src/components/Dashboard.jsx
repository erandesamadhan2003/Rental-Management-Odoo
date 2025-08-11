import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Navbar from './Navbar'
import { getAllProducts } from '../lib/actions/product.actions'
import { getUserBookings } from '../lib/actions/booking.actions'

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
    const totalRentals = bookings.length
    const completed = bookings.filter(b => b.status === 'completed').length
    const returns = bookings.filter(b => b.returnStatus === 'completed').length
    return { totalRentals, completed, returns }
  }, [bookings])

  const chartData = useMemo(() => {
    const categoryMap = new Map()
    const productMap = new Map()
    for (const b of bookings) {
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
    return { categories, products }
  }, [bookings])

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
      .slice(0, 4)
  }, [bookings])

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
            <div className="text-3xl font-bold text-purple-500">{myProducts.length}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Rentals</h3>
            <div className="text-3xl font-bold text-navy-500">{totals.totalRentals}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Returns</h3>
            <div className="text-3xl font-bold text-beige-600">{totals.returns}</div>
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
                      <div className="text-sm text-teal-600">₹{item.revenue}</div>
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
                      <div className="text-sm text-teal-600">₹{item.revenue}</div>
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
                {recentBookings.map((bk, index) => (
                  <div key={bk._id || index} className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-navy-700">{bk.productId?.title || 'Unknown product'}</span>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-sm font-medium text-midnight-800 capitalize">{bk.status}</div>
                      <div className="text-xs text-navy-600">Status</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-midnight-800">₹{bk.totalPrice}</div>
                      <div className="text-xs text-navy-600">Total</div>
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
