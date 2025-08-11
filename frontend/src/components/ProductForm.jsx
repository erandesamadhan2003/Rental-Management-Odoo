import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { createProduct } from '../lib/actions/product.actions'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const CATEGORIES = [
  'Sports', 'Badminton', 'Cricket', 'Football', 'Cycling', 'Photography', 'Music', 'Camping', 'Tools', 'Electronics'
]
const TARGET_AUDIENCES = ['Beginners', 'Professionals', 'Kids', 'Adults', 'All Ages']

const ProductForm = ({ onClose, onCreated }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    brand: '',
    tags: '',
    targetAudience: TARGET_AUDIENCES[0],
    pricePerDay: '',
    location: '',
    pickupLocation: '',
    dropLocation: '',
    images: []
  })
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))
      const res = await fetch(`${API_BASE_URL}/products/upload`, {
        method: 'POST',
        body: fd
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setForm(prev => ({ ...prev, images: [...prev.images, ...data.files] }))
    } catch (err) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) {
      setError('You must be logged in')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        clerkId: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        brand: form.brand,
        tags: form.tags, // comma-separated string handled in backend
        targetAudience: form.targetAudience,
        pricePerDay: Number(form.pricePerDay) || 0,
        location: form.location,
        pickupLocation: form.pickupLocation,
        dropLocation: form.dropLocation,
        images: form.images
      }
      const product = await createProduct(payload)
      onCreated?.(product)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Equipment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input name="title" required value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea name="description" required value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand *</label>
            <input name="brand" required value={form.brand} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Audience *</label>
            <select name="targetAudience" value={form.targetAudience} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {TARGET_AUDIENCES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Per Day *</label>
            <input type="number" name="pricePerDay" required value={form.pricePerDay} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input name="location" required value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Location *</label>
            <input name="pickupLocation" required value={form.pickupLocation} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Drop Location *</label>
            <input name="dropLocation" required value={form.dropLocation} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleFiles} />
            {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            {!!form.images.length && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} className="w-full h-24 object-cover rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
