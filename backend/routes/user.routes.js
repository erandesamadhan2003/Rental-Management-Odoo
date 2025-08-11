import express from 'express'
import {
  createUser,
  getUserById,
  getUserByClerkId,
  updateUser,
  deleteUser,
  getAllUsers,
  handleClerkWebhook
} from '../controllers/user.controller.js'

const router = express.Router()

// User CRUD routes
router.post('/', createUser)
router.get('/', getAllUsers)
router.get('/id/:userId', getUserById)
router.get('/clerk/:clerkId', getUserByClerkId)
router.put('/clerk/:clerkId', updateUser)
router.delete('/clerk/:clerkId', deleteUser)

// Clerk webhook route
router.post('/webhooks/clerk', handleClerkWebhook)

export default router
