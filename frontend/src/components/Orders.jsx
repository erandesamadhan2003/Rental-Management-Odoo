import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useUser } from '@clerk/clerk-react'
import { getUserBookings } from '../lib/actions/booking.actions'

const Orders = () => {
  const { user } = useUser()
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
          <h1 className="text-3xl font-bold text-midnight-800 mb-6">Orders Management</h1>
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
                    <tr key={b._id} className="border-b">
                      <td className="py-2 pr-4 font-mono">{b._id.slice(-6)}</td>
                      <td className="py-2 pr-4">{b.productId?.title || '-'}</td>
                      <td className="py-2 pr-4">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">₹{b.totalPrice}</td>
                      <td className="py-2 pr-4 capitalize">{b.status}</td>
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
