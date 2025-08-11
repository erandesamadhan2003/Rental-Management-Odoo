// Since this is React (not Next.js), we'll use regular async functions instead of 'use server'
// These functions will interact with your backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * @typedef {Object} CreateUserParams
 * @property {string} clerkId
 * @property {string} email
 * @property {string} username
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [photo]
 */

/**
 * @typedef {Object} UpdateUserParams
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [username]
 * @property {string} [photo]
 */

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error)
  throw error
}

// User management functions
export async function createUser(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }
    
    const newUser = await response.json()
    console.log(newUser);
    return newUser
  } catch (error) {
    handleError(error)
  }
}

export async function getUserById(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)

    if (!response.ok) {
      throw new Error('User not found')
    }

    const user = await response.json()
    return user
  } catch (error) {
    handleError(error)
  }
}

export async function updateUser(clerkId, user) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/clerk/${clerkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      throw new Error('User update failed')
    }

    const updatedUser = await response.json()
    return updatedUser
  } catch (error) {
    handleError(error)
  }
}

export async function deleteUser(clerkId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/clerk/${clerkId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('User deletion failed')
    }

    const deletedUser = await response.json()
    return deletedUser
  } catch (error) {
    handleError(error)
  }
}

// Webhook handler for Clerk events (you'll need to implement this on your backend)
export async function handleClerkWebhook(event) {
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error('Webhook processing failed')
    }

    return await response.json()
  } catch (error) {
    handleError(error)
  }
}
