import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const RentalForm = ({ product, onClose }) => {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: product.pickupLocation || '',
    dropLocation: product.dropLocation || '',
    totalPrice: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculatePrice = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days * (product.pricePerDay || product.pricePerHour * 24 || 0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'startDate' || name === 'endDate') {
      const newStartDate = name === 'startDate' ? value : formData.startDate
      const newEndDate = name === 'endDate' ? value : formData.endDate
      const price = calculatePrice(newStartDate, newEndDate)
      setFormData(prev => ({ ...prev, totalPrice: price }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/rental-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          renterId: user.id,
          renterClerkId: user.id,
          ownerId: product.ownerId._id,
          ownerClerkId: product.ownerClerkId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: formData.totalPrice,
          pickupLocation: formData.pickupLocation,
          dropLocation: formData.dropLocation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create rental request')
      }

      const data = await response.json()
      alert('Rental request sent successfully! The owner will review and respond.')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create rental request')
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rent {product.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.brand} • {product.category}</p>
            <p className="text-sm text-gray-600">₹{product.pricePerDay || product.pricePerHour || 0} per day</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={minDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || minDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Location Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drop Location *
              </label>
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleInputChange}
                placeholder="Enter drop location"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Total Price Display */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Price:</span>
                <span className="text-2xl font-bold text-purple-600">₹{formData.totalPrice}</span>
              </div>
              {formData.totalPrice > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days × ₹{product.pricePerDay || product.pricePerHour * 24 || 0}/day
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.startDate || !formData.endDate || formData.totalPrice <= 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Rental Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RentalForm
