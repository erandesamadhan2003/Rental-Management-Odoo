import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from './Navbar'
import { getBookingById, cancelBooking, initiateBookingPayment } from '../lib/actions/booking.actions'

const BookingDetails = () => {
  const { bookingId } = useParams()
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!isLoaded || !user || !bookingId) return
      
      try {
        setLoading(true)
        const fetchedBooking = await getBookingById(bookingId)
        setBooking(fetchedBooking)
        setError(null)
      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError('Failed to load booking details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, user, isLoaded])

  const handleCancelBooking = async () => {
    if (!booking || !bookingId) return
    
    try {
      setProcessing(true)
      await cancelBooking(bookingId, 'Customer cancelled')
      
      // Update local state after successful cancellation
      setBooking({
        ...booking,
        status: 'cancelled',
        paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'unpaid'
      })
    } catch (err) {
      console.error('Error cancelling booking:', err)
      setError('Failed to cancel booking. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!booking || !bookingId) return
    
    try {
      setProcessing(true)
      const paymentData = await initiateBookingPayment(bookingId)
      
      // In a real application, you would redirect to a payment page or open a payment modal
      // For this example, we'll just update the booking status
      alert(`Payment initiated! Client Secret: ${paymentData.clientSecret.substring(0, 10)}...`)
      
      // Simulate payment completion (in a real app, this would happen after payment confirmation)
      setBooking({
        ...booking,
        paymentStatus: 'paid',
        status: 'confirmed'
      })
    } catch (err) {
      console.error('Error initiating payment:', err)
      setError('Failed to initiate payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_rental':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link 
            to="/orders" 
            className="text-purple-600 hover:text-purple-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Bookings
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-navy-600">Loading booking details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4">{error}</p>
              <button 
                onClick={() => navigate('/orders')} 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Return to Bookings
              </button>
            </div>
          ) : !booking ? (
            <div className="text-center py-8 text-red-600">
              <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4">Booking not found</p>
              <button 
                onClick={() => navigate('/orders')} 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Return to Bookings
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-midnight-800">Booking Details</h1>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                    {booking.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                  <h2 className="text-xl font-semibold text-navy-800 mb-4">Booking Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-navy-500">Booking ID:</span>
                      <span className="text-navy-800 font-medium">{booking._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">Created:</span>
                      <span className="text-navy-800 font-medium">{formatDate(booking.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">Start Date:</span>
                      <span className="text-navy-800 font-medium">{formatDate(booking.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">End Date:</span>
                      <span className="text-navy-800 font-medium">{formatDate(booking.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">Total Amount:</span>
                      <span className="text-navy-800 font-medium">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                    {booking.securityDeposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-navy-500">Security Deposit:</span>
                        <span className="text-navy-800 font-medium">₹{booking.securityDeposit?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                  <h2 className="text-xl font-semibold text-navy-800 mb-4">Equipment Details</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-16 w-16 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-navy-900">{booking.productTitle || 'Equipment'}</h3>
                      <p className="text-navy-500">Product ID: {booking.productId}</p>
                    </div>
                  </div>

                  <Link 
                    to={`/products/${booking.productId}`} 
                    className="text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    View Equipment Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                <h2 className="text-xl font-semibold text-navy-800 mb-4">Status & Actions</h2>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  {booking.status === 'pending' && booking.paymentStatus === 'unpaid' && (
                    <button
                      onClick={handlePayment}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Pay Now'}
                      {!processing && (
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={handleCancelBooking}
                      disabled={processing}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Cancel Booking'}
                      {!processing && (
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  )}
                  
                  <Link 
                    to="/orders" 
                    className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
                  >
                    Back to Bookings
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingDetails