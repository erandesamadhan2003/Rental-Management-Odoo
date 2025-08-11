import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import { getAllProducts } from '../lib/actions/product.actions'
import RentalForm from './RentalForm'
import ProductForm from './ProductForm'

const Products = () => {
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRentalForm, setShowRentalForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllProducts()
      setProducts(data || [])
    } catch (e) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      await loadProducts()
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Open form if ?new=1 in URL
  useEffect(() => {
    const shouldOpen = searchParams.get('new') === '1'
    if (shouldOpen) {
      setShowProductForm(true)
    }
  }, [searchParams])

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [products])

  const filteredProducts = products.filter(product => {
    const title = (product.title || '').toLowerCase()
    const category = (product.category || '').toLowerCase()
    const brand = (product.brand || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || 
                         category.includes(searchTerm.toLowerCase()) ||
                         brand.includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleRentNow = (product) => {
    setSelectedProduct(product)
    setShowRentalForm(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-midnight-800 mb-2">Equipment Inventory</h1>
              <p className="text-navy-600">Browse and rent equipment from our community</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-navy-600">Total Equipment</div>
              <div className="text-2xl font-bold text-midnight-800">{products.length}</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-midnight-800 mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md bg-white/90 text-navy-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['All', 'approved', 'pending', 'rejected'].map(status => (
                    <label key={status} className="flex items-center">
                      <input type="checkbox" className="rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-navy-600 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-purple-200 pt-4">
                <h4 className="text-sm font-medium text-navy-700 mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-navy-600">Available</span>
                    <span className="text-sm font-medium text-green-600">
                      {products.filter(p => p.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-navy-600">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {products.filter(p => p.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Search and Actions Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search equipment by name, model, or specifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-purple-300 rounded-md leading-5 bg-white/90 text-navy-900 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-purple-500 text-white rounded-md">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button className="p-2 text-navy-600 hover:bg-purple-100 rounded-md">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button 
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2"
                    onClick={() => setShowProductForm(true)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Equipment
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      selectedProducts.length > 0
                        ? 'bg-beige-500 text-midnight-800 hover:bg-beige-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={selectedProducts.length === 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bulk Edit ({selectedProducts.length})
                  </button>
                  <button className="px-4 py-2 bg-navy-500 text-white rounded-md hover:bg-navy-600 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {loading && <div className="col-span-full text-center text-navy-600">Loading...</div>}
              {error && <div className="col-span-full text-center text-red-600">{error}</div>}
              {!loading && !error && filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer ${
                    selectedProducts.includes(product._id)
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-purple-200'
                  }`}
                  onClick={() => handleProductSelect(product._id)}
                >
                  {/* Product Image */}
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-beige-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-navy-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm text-navy-600">{product.category}</span>
                      </div>
                    </div>
                    
                    {/* Checkbox */}
                    <div className="absolute top-3 left-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedProducts.includes(product._id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'bg-white border-purple-300'
                      }`}>
                        {selectedProducts.includes(product._id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-midnight-800 mb-1">{product.title}</h3>
                    <p className="text-sm text-navy-600 mb-2">{product.category} • {product.brand}</p>
                    <p className="text-xs text-navy-500 mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-sm text-navy-600">Daily Rate</span>
                        <p className="text-xl font-bold text-midnight-800">₹{product.pricePerDay || product.pricePerHour || '-'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-navy-600">Owner</span>
                        <p className="text-sm font-medium text-midnight-800">{product.ownerId?.firstName || product.ownerId?.username || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRentNow(product)
                        }}
                      >
                        Rent Now
                      </button>
                      <button className="flex-1 px-3 py-2 bg-beige-500 text-midnight-800 text-sm rounded-md hover:bg-beige-600 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-navy-600">
                    Showing {filteredProducts.length} of {products.length} equipment
                    {selectedProducts.length > 0 && (
                      <span className="ml-2 text-purple-600 font-medium">
                        ({selectedProducts.length} selected)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-white border border-purple-300 text-navy-700 rounded-md text-sm hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    <button className="w-8 h-8 bg-purple-500 text-white rounded text-sm">1</button>
                    <button className="w-8 h-8 bg-white border border-purple-300 text-navy-700 rounded text-sm hover:bg-purple-50">2</button>
                    <button className="w-8 h-8 bg-white border border-purple-300 text-navy-700 rounded text-sm hover:bg-purple-50">3</button>
                  </div>
                  <button className="px-4 py-2 bg-white border border-purple-300 text-navy-700 rounded-md text-sm hover:bg-purple-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Form Modal */}
      {showRentalForm && selectedProduct && (
        <RentalForm
          product={selectedProduct}
          onClose={() => {
            setShowRentalForm(false)
            setSelectedProduct(null)
          }}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onClose={() => {
            setShowProductForm(false)
            // Clean up ?new=1 from URL if present
            if (searchParams.get('new') === '1') {
              searchParams.delete('new')
              setSearchParams(searchParams, { replace: true })
            }
          }}
          onCreated={() => {
            setShowProductForm(false)
            if (searchParams.get('new') === '1') {
              searchParams.delete('new')
              setSearchParams(searchParams, { replace: true })
            }
            loadProducts()
          }}
        />
      )}
    </div>
  )
}

export default Products
