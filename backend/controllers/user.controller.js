import User from '../models/user.js'
import NotificationService from '../services/notification.service.js'

// Helper function to handle errors
const handleError = (res, error, message = 'An error occurred', statusCode = 500) => {
  console.error('Error:', error)
  return res.status(statusCode).json({
    success: false,
    message,
    error: error.message,
  })
}

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { clerkId, email, username, firstName, lastName, photo } = req.body

    if (!clerkId || !email || !username) {
      return res.status(400).json({
        success: false,
        message: 'clerkId, email, and username are required',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ clerkId }, { email }, { username }]
    })

    if (existingUser) {
      // If user exists with same clerkId, return the existing user instead of error
      if (existingUser.clerkId === clerkId) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
          user: existingUser,
        })
      }
      
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      })
    }

    const newUser = await User.create({
      clerkId,
      email,
      username,
      firstName: firstName || '',
      lastName: lastName || '',
      photo: photo || '',
    })

    // Create welcome notification for new user
    try {
      await NotificationService.createSystemNotification({
        userClerkId: clerkId,
        message: `Welcome to our rental platform, ${firstName || username}! Start by listing your first product or browsing available rentals.`,
        metadata: {
          welcomeBonus: true,
          action: 'user_welcome',
          signupDate: new Date()
        }
      })
    } catch (notificationError) {
      console.error('Failed to create welcome notification:', notificationError)
      // Don't fail user creation if notification fails
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to create user')
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).populate('products').populate('bookings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get user')
  }
}

// Get user by Clerk ID
export const getUserByClerkId = async (req, res) => {
  try {
    const { clerkId } = req.params

    if (!clerkId || clerkId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid Clerk ID is required',
      })
    }

    const user = await User.findOne({ clerkId }).populate('products').populate('bookings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get user')
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { clerkId } = req.params
    const updateData = req.body

    if (!clerkId || clerkId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid Clerk ID is required',
      })
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to update user')
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { clerkId } = req.params

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId })

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Delete user - clean up related data
    const deletedUser = await User.findByIdAndDelete(userToDelete._id)

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser,
    })
  } catch (error) {
    return handleError(res, error, 'Failed to delete user')
  }
}

// Get all users (admin function)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query

    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const users = await User.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(res, error, 'Failed to get users')
  }
}

// Clerk webhook handler
export const handleClerkWebhook = async (req, res) => {
  try {
    const { type, data } = req.body

    switch (type) {
      case 'user.created':
        await createUser({
          body: {
            clerkId: data.id,
            email: data.email_addresses[0]?.email_address,
            username: data.username || data.email_addresses[0]?.email_address?.split('@')[0],
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            photo: data.image_url || '',
          }
        }, res)
        break

      case 'user.updated':
        await updateUser({
          params: { clerkId: data.id },
          body: {
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            username: data.username || data.email_addresses[0]?.email_address?.split('@')[0],
            photo: data.image_url || '',
          }
        }, res)
        break

      case 'user.deleted':
        await deleteUser({
          params: { clerkId: data.id }
        }, res)
        break

      default:
        return res.status(200).json({ success: true, message: 'Webhook received' })
    }
  } catch (error) {
    return handleError(res, error, 'Webhook processing failed')
  }
}
