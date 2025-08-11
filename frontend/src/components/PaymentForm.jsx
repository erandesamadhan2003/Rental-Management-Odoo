import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RuxzRGzgYJAvIRfUv2E0uufRsyByCV2adjGdQj4a6VKNz3ycDaj2ceuMEvhrWK7JFR7firCv7l7nLnVP8ypBLNy00utNHKSIS')

// CheckoutForm component for Stripe Elements
const CheckoutForm = ({ clientSecret, booking, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.')
      return
    }

    setLoading(true)
    setError('')

    // Get a reference to the CardElement
    const cardElement = elements.getElement(CardElement)

    // Use card element with confirmCardPayment
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: booking.renterName || 'Customer',
          email: booking.renterEmail || '',
        },
      },
    })

    if (paymentError) {
      setError(paymentError.message || 'Payment failed')
      onError && onError(paymentError.message)
      setLoading(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      // Payment successful, confirm on backend
      try {
        const response = await fetch(`${API_BASE_URL}/payments/confirm/${booking._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        })

        if (!response.ok) {
          throw new Error('Payment confirmation failed')
        }

        const data = await response.json()
        console.log('Payment confirmed:', data)
        onSuccess(data)
      } catch (err) {
        const errorMessage = err.message || 'Payment confirmation failed'
        setError(errorMessage)
        onError && onError(errorMessage)
      }
    } else {
      const errorMessage = `Payment status: ${paymentIntent.status}. Please try again.`
      setError(errorMessage)
      onError && onError(errorMessage)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
                padding: '10px 14px',
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: false,
          }}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <strong>Test Card Numbers:</strong><br/>
          • Success: 4242 4242 4242 4242<br/>
          • Declined: 4000 0000 0000 0002<br/>
          • Use any future date for expiry and any 3-digit CVC
        </p>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing Payment...' : `Pay ₹${booking.totalPrice || booking.totalAmount}`}
      </button>
    </form>
  )
}

const PaymentForm = ({ booking, onSuccess, onClose, onError }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    if (booking && booking._id) {
      initiatePayment()
    }
  }, [booking])

  const initiatePayment = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/payments/initiate/${booking._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initiate payment')
      }

      const data = await response.json()
      if (data.success && data.paymentIntent) {
        setClientSecret(data.paymentIntent.client_secret)
      } else {
        throw new Error('Invalid payment response')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to initiate payment'
      setError(errorMessage)
      onError && onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  const totalAmount = booking.totalPrice || booking.totalAmount || 0

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Rental Amount:</span>
            <span className="font-medium">₹{totalAmount}</span>
          </div>
          {booking.platformFee && (
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span>₹{booking.platformFee}</span>
            </div>
          )}
          {booking.ownerAmount && (
            <div className="flex justify-between">
              <span>Owner Receives:</span>
              <span>₹{booking.ownerAmount}</span>
            </div>
          )}
          <hr className="my-2"/>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total to Pay:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {loading && !clientSecret && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing secure payment...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {clientSecret && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">
                Payment ready! Amount: ₹{totalAmount}
              </p>
            </div>
          </div>

          {/* Stripe Elements integration */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              clientSecret={clientSecret} 
              booking={booking} 
              onSuccess={onSuccess} 
              onError={onError}
            />
          </Elements>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secure and encrypted. We use Stripe for payment processing.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Test mode: Use test card numbers above for testing
        </p>
      </div>
    </div>
  )
}

export default PaymentForm
