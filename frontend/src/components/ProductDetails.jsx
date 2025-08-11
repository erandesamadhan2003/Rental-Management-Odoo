import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [rentalDays, setRentalDays] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [availabilityStatus, setAvailabilityStatus] = useState(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availableDateRanges, setAvailableDateRanges] = useState([])

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`)
        if (response.data.success) {
          setProduct(response.data.product)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      }
    }
    
    if (productId) {
      fetchProduct()
    }
  }, [productId])
  
  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!productId || !startDate || !endDate) return
      
      setIsCheckingAvailability(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/bookings/availability/check?productId=${productId}&startDate=${startDate}&endDate=${endDate}`)
        if (response.data.success) {
          setAvailabilityStatus({
            isAvailable: response.data.available,
            requestedDates: { startDate, endDate }
          })
          
          if (!response.data.availability.isAvailable) {
            setAvailableDateRanges(response.data.availability.nextAvailableDates)
          }
        }
      } catch (error) {
        console.error('Error checking availability:', error)
      } finally {
        setIsCheckingAvailability(false)
      }
    }
    
    if (startDate && endDate) {
      checkAvailability()
    }
  }, [productId, startDate, endDate])

  const calculateTotal = () => {
    if (!product) return 0
    
    let rate = product.dailyRate
    if (rentalDays >= 30) {
      rate = product.monthlyRate / 30
    } else if (rentalDays >= 7) {
      rate = product.weeklyRate / 7
    }
    
    return (rate * rentalDays * quantity).toFixed(2)
  }

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      quantity,
      rentalDays,
      startDate,
      endDate,
      dailyRate: product.dailyRate,
      total: calculateTotal()
    }
    
    // Add to cart logic
    console.log('Adding to cart:', cartItem)
    alert('Product added to cart!')
  }

  const checkProductAvailability = async () => {
    if (!productId || !startDate || !endDate) {
      setAvailabilityStatus(null)
      return
    }
    
    setIsCheckingAvailability(true)
    try {
      const response = await axios.get(`/api/products/availability/${productId}`, {
        params: { startDate, endDate }
      })
      
      if (response.data.success) {
        setAvailabilityStatus({
          isAvailable: response.data.isAvailable,
          requestedDates: { startDate, endDate }
        })
        
        if (!response.data.isAvailable && response.data.nextAvailableDates) {
          setAvailableDateRanges(response.data.nextAvailableDates)
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setIsCheckingAvailability(false)
    }
  }
  
  const handleRentNow = () => {
    // Only proceed if product is available
    if (availabilityStatus && availabilityStatus.isAvailable) {
      navigate('/checkout', { 
        state: { 
          products: [{
            productId: product.id,
            name: product.name,
            quantity,
            rentalDays,
            startDate,
            endDate,
            total: calculateTotal()
          }]
        }
      })
    } else {
      // If not checked yet, check availability first
      checkProductAvailability()
    }
  }
  
  const selectAvailableDateRange = (range) => {
    setStartDate(range.startDate)
    setEndDate(range.endDate)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-navy-600">Loading product details...</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'included', label: 'What\'s Included' },
    { id: 'reviews', label: 'Reviews' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-navy-600">
            <button onClick={() => navigate('/catalog')} className="hover:text-purple-600">
              Products
            </button>
            <span>/</span>
            <button onClick={() => navigate('/catalog')} className="hover:text-purple-600">
              {product.category}
            </button>
            <span>/</span>
            <span className="text-midnight-800">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md border border-purple-200 overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-purple-500' : 'border-purple-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Booking */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-midnight-800 mb-2">{product.name}</h1>
                  <p className="text-navy-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-navy-600">({product.reviews} reviews)</span>
                  </div>
                  <div className="text-sm text-navy-600">
                    Available at: {product.location}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${product.dailyRate}</div>
                    <div className="text-sm text-navy-600">per day</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${product.weeklyRate}</div>
                    <div className="text-sm text-navy-600">per week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${product.monthlyRate}</div>
                    <div className="text-sm text-navy-600">per month</div>
                  </div>
                </div>
                <div className="text-center mt-3 pt-3 border-t border-purple-200">
                  <span className="text-sm text-navy-600">Security Deposit: </span>
                  <span className="font-semibold text-midnight-800">${product.securityDeposit}</span>
                </div>
              </div>

              <p className="text-navy-700 mb-6">{product.description}</p>

              {/* Status */}
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-700 font-medium">Available for rent</span>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6">
              <h3 className="text-xl font-semibold text-midnight-800 mb-4">Book This Item</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                      min="1"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Rental Days</label>
                    <input
                      type="number"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value)))}
                      min="1"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Availability Check */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <button
                    onClick={checkProductAvailability}
                    disabled={!startDate || !endDate || isCheckingAvailability}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                  
                  {isCheckingAvailability && (
                    <div className="flex justify-center mt-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                    </div>
                  )}
                  
                  {availabilityStatus && (
                    <div className={`mt-3 p-3 rounded-lg ${availabilityStatus.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {availabilityStatus.isAvailable 
                        ? 'Product is available for the selected dates!' 
                        : 'Product is not available for the selected dates.'}
                    </div>
                  )}
                  
                  {/* Available Date Ranges */}
                  {availabilityStatus && !availabilityStatus.isAvailable && availableDateRanges.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-navy-700 mb-2">Available Date Ranges:</h4>
                      <div className="max-h-40 overflow-y-auto">
                        {availableDateRanges.map((range, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b border-purple-200">
                            <span className="text-sm text-navy-700">
                              {new Date(range.startDate).toLocaleDateString()} - {new Date(range.endDate).toLocaleDateString()}
                            </span>
                            <button 
                              className="bg-purple-500 text-white text-xs py-1 px-2 rounded-lg"
                              onClick={() => selectAvailableDateRange(range)}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-midnight-800">Total Cost:</span>
                    <span className="text-2xl font-bold text-purple-600">${calculateTotal()}</span>
                  </div>
                  <div className="text-sm text-navy-600 mt-1">
                    {quantity} item(s) × {rentalDays} day(s)
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full px-6 py-3 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleRentNow}
                    className={`w-full px-6 py-3 rounded-lg transition-colors font-medium ${(!availabilityStatus || availabilityStatus.isAvailable) ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}
                    disabled={availabilityStatus && !availabilityStatus.isAvailable}
                  >
                    {(!startDate || !endDate) ? 'Select Dates to Rent' : 
                     (availabilityStatus && !availabilityStatus.isAvailable) ? 'Not Available' : 'Rent Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Tab Navigation */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight-800 mb-3">Product Description</h3>
                  <p className="text-navy-700 leading-relaxed">{product.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-midnight-800 mb-3">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-navy-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold text-midnight-800 mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="border border-purple-100 rounded-lg p-4">
                      <div className="text-sm font-medium text-navy-600 capitalize">{key}</div>
                      <div className="text-lg text-midnight-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'included' && (
              <div>
                <h3 className="text-lg font-semibold text-midnight-800 mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.included.map((item, index) => (
                    <div key={index} className="flex items-center bg-purple-50 rounded-lg p-3">
                      <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M4 9h2" />
                      </svg>
                      <span className="text-navy-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-midnight-800 mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {/* Sample reviews */}
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border border-purple-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-medium">U</span>
                          </div>
                          <span className="font-medium text-midnight-800">User {review}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-navy-700">
                        Great quality equipment! Very professional and easy to use. Would definitely rent again.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
