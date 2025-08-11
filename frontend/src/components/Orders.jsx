import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useUser } from '@clerk/clerk-react'
import { getUserBookings } from '../lib/actions/booking.actions'

const Orders = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = user?.id ? await getUserBookings(user.id) : []
        if (!cancelled) setBookings(data || [])
      } catch (e) {
        if (!cancelled) setError('Failed to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-midnight-800 mb-4 sm:mb-0">Orders Management</h1>
            <button
              onClick={() => navigate('/orders/new')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Rental Order</span>
            </button>
          </div>
          {loading && <div className="text-navy-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-navy-600 border-b">
                    <th className="py-2 pr-4">Booking</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Dates</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr 
                      key={b._id} 
                      className="border-b hover:bg-purple-50 cursor-pointer"
                      onClick={() => navigate(`/orders/${b._id}`)}
                    >
                      <td className="py-2 pr-4 font-mono">{b._id.slice(-6)}</td>
                      <td className="py-2 pr-4">{b.productId?.title || '-'}</td>
                      <td className="py-2 pr-4">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">₹{b.totalPrice}</td>
                      <td className="py-2 pr-4 capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
