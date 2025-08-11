import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import PaymentForm from './PaymentForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const Notifications = () => {
  const { user } = useUser()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(`${API_BASE_URL}/notifications?userClerkId=${user?.id}`)
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        if (!cancelled) setNotifications(data.notifications || [])
      } catch (e) {
        if (!cancelled) setError('Failed to load notifications')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (user?.id) load()
    return () => { cancelled = true }
  }, [user?.id])

  const handleAcceptRental = async (bookingId, pickupLocation, dropLocation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupLocation, dropLocation })
      })
      
      if (!response.ok) throw new Error('Failed to accept rental')
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.relatedId === bookingId 
          ? { ...n, isRead: true }
          : n
      ))
      
      alert('Rental request accepted! The renter will be notified to proceed with payment.')
    } catch (err) {
      alert('Failed to accept rental: ' + err.message)
    }
  }

  const handleRejectRental = async (bookingId, reason) => {
    const userReason = prompt('Please provide a reason for rejection:', reason || '')
    if (!userReason) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: userReason })
      })
      
      if (!response.ok) throw new Error('Failed to reject rental')
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.relatedId === bookingId 
          ? { ...n, isRead: true }
          : n
      ))
      
      alert('Rental request rejected. The renter will be notified.')
    } catch (err) {
      alert('Failed to reject rental: ' + err.message)
    }
  }

  const handlePaymentSuccess = (data) => {
    setShowPaymentForm(false)
    setSelectedBooking(null)
    // Refresh notifications to show updated status
    window.location.reload()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'rental_request':
        return '🏠'
      case 'payment_confirmation':
        return '💰'
      case 'pickup_scheduled':
        return '📦'
      case 'drop_scheduled':
        return '✅'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'rental_request':
        return 'bg-blue-100 text-blue-800'
      case 'payment_confirmation':
        return 'bg-green-100 text-green-800'
      case 'pickup_scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'drop_scheduled':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="text-center py-8">Loading notifications...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500">You'll see rental requests and updates here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                notification.isRead ? 'opacity-75' : 'border-l-4 border-l-purple-500'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{notification.message}</p>
                  
                  {/* Rental Request Actions */}
                  {notification.type === 'rental_request' && !notification.isRead && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Rental Request Details</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location
                          </label>
                          <input
                            type="text"
                            id={`pickup-${notification._id}`}
                            placeholder="Enter pickup location"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop Location
                          </label>
                          <input
                            type="text"
                            id={`drop-${notification._id}`}
                            placeholder="Enter drop location"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            const pickup = document.getElementById(`pickup-${notification._id}`).value
                            const drop = document.getElementById(`drop-${notification._id}`).value
                            if (!pickup || !drop) {
                              alert('Please enter both pickup and drop locations')
                              return
                            }
                            handleAcceptRental(notification.relatedId, pickup, drop)
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleRejectRental(notification.relatedId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Confirmation Actions */}
                  {notification.type === 'payment_confirmation' && notification.relatedType === 'booking' && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-800 mb-3">
                        Payment received! The renter can now proceed with pickup.
                      </p>
                      <button
                        onClick={() => {
                          // Navigate to booking details or mark as read
                          setNotifications(prev => prev.map(n => 
                            n._id === notification._id ? { ...n, isRead: true } : n
                          ))
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}

                  {/* Payment Required for Renter */}
                  {notification.type === 'payment_confirmation' && notification.relatedType === 'booking' && user?.id === notification.userClerkId && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        Your rental request has been accepted! Please complete payment to confirm your booking.
                      </p>
                      <button
                        onClick={() => {
                          // Fetch booking details and show payment form
                          fetch(`${API_BASE_URL}/bookings/${notification.relatedId}`)
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setSelectedBooking(data.booking)
                                setShowPaymentForm(true)
                              }
                            })
                            .catch(err => alert('Failed to load booking details'))
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedBooking && (
        <PaymentForm
          booking={selectedBooking}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedBooking(null)
          }}
        />
      )}
    </div>
  )
}

export default Notifications
