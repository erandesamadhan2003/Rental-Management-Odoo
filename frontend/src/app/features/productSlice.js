import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Helper function for API calls
const makeApiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }

  return data
}

// Product Async Thunks
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/products?${queryString}` : '/products'
      const data = await makeApiCall(url)
      return data.products || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/products/${productId}`)
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      })
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      })
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/products/${productId}`, {
        method: 'DELETE',
      })
      return productId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    category: '',
    priceRange: { min: 0, max: 1000 },
    availability: '',
    search: '',
  }
}

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        priceRange: { min: 0, max: 1000 },
        availability: '',
        search: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload
        state.error = null
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Product by ID
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedProduct = action.payload
        state.error = null
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products.push(action.payload)
        state.error = null
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.products.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
          state.selectedProduct = action.payload
        }
        state.error = null
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter(p => p._id !== action.payload)
        if (state.selectedProduct && state.selectedProduct._id === action.payload) {
          state.selectedProduct = null
        }
        state.error = null
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedProduct, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = productSlice.actions

// Export selectors
export const selectProducts = (state) => state.products.products
export const selectSelectedProduct = (state) => state.products.selectedProduct
export const selectProductsLoading = (state) => state.products.isLoading
export const selectProductsError = (state) => state.products.error
export const selectProductFilters = (state) => state.products.filters
export const selectCurrentPage = (state) => state.products.currentPage
export const selectTotalPages = (state) => state.products.totalPages

export default productSlice.reducer
