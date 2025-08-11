import User from '../models/user.js'

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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ clerkId }, { email }, { username }]
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
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

    const user = await User.findById(userId).populate('events').populate('orders')

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

    const user = await User.findOne({ clerkId }).populate('events').populate('orders')

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

    // Note: You'll need to implement Event and Order models for this to work
    // For now, we'll just delete the user
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
