import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'

const PaymentStatus = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useUser()
  
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const paymentIntentId = searchParams.get('payment_intent')
  const bookingId = searchParams.get('bookingId')
  const status = searchParams.get('status')

  useEffect(() => {
    if (paymentIntentId || bookingId) {
      fetchPaymentDetails()
    } else {
      setError('Missing payment information')
      setLoading(false)
    }
  }, [paymentIntentId, bookingId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      
      // Try to get payment details
      let response
      if (paymentIntentId) {
        response = await fetch(`${API_BASE_URL}/payments?paymentIntentId=${paymentIntentId}`)
      } else if (bookingId) {
        response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`)
      }

      if (!response.ok) {
        throw new Error('Failed to fetch payment details')
      }

      const data = await response.json()
      setPaymentData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch payment details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'succeeded':
        return '✅'
      case 'processing':
        return '⏳'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful!'
      case 'processing':
        return 'Payment Processing...'
      case 'failed':
        return 'Payment Failed'
      default:
        return 'Payment Status Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 border-b ${getStatusColor()}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{getStatusIcon()}</div>
              <h1 className="text-2xl font-bold">{getStatusMessage()}</h1>
              {paymentIntentId && (
                <p className="text-sm opacity-75 mt-2">
                  Payment ID: {paymentIntentId.slice(-12).toUpperCase()}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            {status === 'succeeded' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h3>
                  <p className="text-green-700 text-sm">
                    Your rental payment has been processed successfully. You will receive a confirmation email shortly.
                  </p>
                </div>

                {paymentData && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">₹{paymentData.booking?.totalPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="font-medium">₹{paymentData.booking?.platformFee || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner Receives:</span>
                        <span className="font-medium">₹{paymentData.booking?.ownerAmount || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">Card</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction Date:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📧</span>
                      <span>Check your email for the payment receipt and booking confirmation</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📋</span>
                      <span>View your booking details in the Orders section</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📞</span>
                      <span>The owner will contact you for pickup arrangements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Payment Failed</h3>
                  <p className="text-red-700 text-sm">
                    Unfortunately, your payment could not be processed. Please try again or contact support.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Common reasons for payment failure:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Insufficient funds in your account</li>
                    <li>• Incorrect card details</li>
                    <li>• Card expired or blocked</li>
                    <li>• Bank security restrictions</li>
                  </ul>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Payment Processing</h3>
                  <p className="text-yellow-700 text-sm">
                    Your payment is being processed. This usually takes a few minutes. Please do not refresh this page.
                  </p>
                </div>

                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-center space-x-4">
              {status === 'succeeded' && (
                <>
                  <button
                    onClick={() => navigate('/orders')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}
              
              {status === 'failed' && (
                <>
                  <button
                    onClick={() => navigate(`/payment?bookingId=${bookingId}`)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}
              
              {status === 'processing' && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 text-sm">
            🧪 <strong>Test Mode:</strong> This is a test transaction. No real money was charged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus
