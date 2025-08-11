import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const PaymentForm = ({ booking, onSuccess, onClose }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIntent, setPaymentIntent] = useState(null)

  useEffect(() => {
    if (booking && booking._id) {
      initiatePayment()
    }
  }, [booking])

  const initiatePayment = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/bookings/${booking._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const data = await response.json()
      setPaymentIntent(data)
    } catch (err) {
      setError(err.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentIntent) return

    try {
      setLoading(true)
      setError('')

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate the payment confirmation
      const response = await fetch(`${API_BASE_URL}/bookings/${booking._id}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.paymentIntentId
        })
      })

      if (!response.ok) {
        throw new Error('Payment confirmation failed')
      }

      const data = await response.json()
      alert('Payment successful! Your rental is confirmed.')
      onSuccess(data)
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Rental Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">₹{booking.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (10%):</span>
                <span>₹{booking.platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner Receives:</span>
                <span>₹{booking.ownerAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {loading && !paymentIntent && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Initializing payment...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {paymentIntent && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  Payment ready! Amount: ₹{paymentIntent.amount / 100}
                </p>
              </div>

              {/* Stripe Elements would go here in production */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-sm">Stripe payment form would be integrated here</p>
                  <p className="text-xs mt-1">For demo purposes, click "Pay Now" to simulate payment</p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Payment...' : 'Pay Now'}
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your payment is secure and encrypted. We use Stripe for payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
