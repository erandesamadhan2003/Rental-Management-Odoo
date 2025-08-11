import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { createUser, updateUser } from '../lib/actions/user.actions'

// This component handles automatic user synchronization with your backend
const ClerkUserSync = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      try {
        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          photo: user.imageUrl || '',
        }

        // Try to create or update user in your backend
        await createUser(userData)
      } catch (error) {
        // If user already exists, try to update
        if (error.message.includes('already exists') || error.status === 409) {
          try {
            await updateUser(user.id, {
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
              photo: user.imageUrl || '',
            })
          } catch (updateError) {
            console.error('Failed to update user:', updateError)
          }
        } else {
          console.error('Failed to sync user:', error)
        }
      }
    }

    syncUser()
  }, [user, isLoaded])

  return null // This component doesn't render anything
}

export default ClerkUserSync
