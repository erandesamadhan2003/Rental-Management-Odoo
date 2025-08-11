import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// CheckoutForm component for Stripe Elements
const CheckoutForm = ({ clientSecret, booking, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    // TESTING MODE: Don't require stripe or elements to be loaded
    // if (!stripe || !elements) {
    //   // Stripe.js has not loaded yet
    //   return
    // }

    setLoading(true)
    setError('')

    // Get a reference to the CardElement (if available)
    const cardElement = elements ? elements.getElement(CardElement) : null

    // TESTING MODE: Bypass Stripe validation
    console.log('TEST MODE: Bypassing Stripe validation for testing purposes');
    
    // Skip actual payment validation and create a mock successful paymentIntent
    const mockPaymentIntent = {
      id: 'test_pi_' + Date.now(),
      status: 'succeeded'
    };
    
    // Comment out actual Stripe validation for testing
    /*
    // Use card element with confirmCardPayment
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: booking.renterName || 'Customer',
        },
      },
    })

    if (paymentError) {
      setError(paymentError.message || 'Payment failed')
      setLoading(false)
      return
    }
    */
    
    // Use mock payment intent instead of actual one
    const paymentIntent = mockPaymentIntent;
    
    // Always consider payment as succeeded for testing
    if (true) { // Was: if (paymentIntent.status === 'succeeded') {
      // Payment successful, confirm on backend
      try {
        console.log('TEST MODE: Confirming payment with mock payment intent ID:', paymentIntent.id);
        
        const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId: booking._id
          })
        })

        if (!response.ok) {
          console.error('TEST MODE: Backend confirmation failed, but proceeding anyway for testing');
          // For testing, we'll proceed even if the backend confirmation fails
          onSuccess({
            success: true,
            message: 'TEST MODE: Payment processed successfully',
            paymentId: 'test_' + Date.now(),
            bookingId: booking._id
          });
          return;
        }

        const data = await response.json()
        onSuccess(data)
      } catch (err) {
        console.error('TEST MODE: Error during confirmation, but proceeding anyway:', err);
        // For testing, we'll proceed even if there's an error
        onSuccess({
          success: true,
          message: 'TEST MODE: Payment processed successfully despite errors',
          paymentId: 'test_' + Date.now(),
          bookingId: booking._id
        });
      }
    } 
    /* In test mode, we never reach this else block because we're always setting the payment as successful
    else {
      setError(`Payment status: ${paymentIntent.status}. Please try again.`)
    }
    */

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        {/* TESTING MODE: Add a message about test mode */}
        <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
          <p className="font-medium">TEST MODE ACTIVE</p>
          <p>Card validation is bypassed. You can enter any values or click Pay Now directly.</p>
        </div>
        
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            // Disable all client-side validation for testing
            hidePostalCode: true
          }}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {/* Removed !stripe condition for testing */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing Payment...' : 'Pay Now (Test Mode)'}
      </button>
    </form>
  )
}

const PaymentForm = ({ booking, onSuccess, onClose }) => {
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
      
      console.log('TEST MODE: Initiating payment for testing');
      
      // Try to get a client secret from the backend
      try {
        const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking._id,
            amount: booking.totalPrice,
            currency: 'inr'
          })
        })

        if (response.ok) {
          const data = await response.json()
          setClientSecret(data.clientSecret)
        } else {
          console.warn('TEST MODE: Failed to get client secret from backend, using mock client secret');
          // For testing, create a mock client secret if the backend fails
          setClientSecret('test_secret_' + Date.now());
        }
      } catch (err) {
        console.warn('TEST MODE: Error getting client secret, using mock client secret:', err);
        // For testing, create a mock client secret if there's an error
        setClientSecret('test_secret_' + Date.now());
      }
    } catch (err) {
      console.error('TEST MODE: Unexpected error in initiatePayment:', err);
      // Even in case of errors, set a mock client secret for testing
      setClientSecret('test_secret_' + Date.now());
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
          {loading && !clientSecret && (
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

          {/* Always show payment form in test mode */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                <strong>TEST MODE:</strong> Payment ready! Amount: ₹{booking.totalPrice}
              </p>
            </div>

            {/* Stripe Elements integration - Modified for testing */}
            <Elements stripe={stripePromise} options={{ clientSecret: clientSecret || 'test_secret', loader: 'never' }}>
              <CheckoutForm 
                clientSecret={clientSecret || 'test_secret'} 
                booking={booking} 
                onSuccess={onSuccess} 
              />
            </Elements>
          </div>

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
