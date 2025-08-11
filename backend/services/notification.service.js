import Notification from '../models/notification.model.js'
import User from '../models/user.js'

// Notification service for creating dynamic notifications
class NotificationService {
  
  // Create a rental request notification
  static async createRentalRequestNotification(bookingData) {
    try {
      const { renterId, ownerId, productId, productTitle, startDate, endDate, totalAmount, bookingId } = bookingData
      
      console.log('Creating rental request notification for:', { renterId, ownerId, productTitle, bookingId })
      
      // Get user details
      const renter = await User.findOne({ clerkId: renterId })
      const owner = await User.findOne({ clerkId: ownerId })
      
      console.log('Found users:', { renter: !!renter, owner: !!owner })
      
      if (!owner) {
        console.error('Owner not found with clerkId:', ownerId)
        return
      }
      
      const notification = new Notification({
        userId: owner._id,
        userClerkId: ownerId,
        type: 'rental_request',
        message: `${renter?.firstName || 'A user'} has requested to rent your product "${productTitle}"`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          renterName: renter?.firstName || 'Unknown',
          renterId,
          startDate,
          endDate,
          totalAmount,
          bookingId,
          duration: `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
          actionRequired: true,
          actions: ['accept', 'reject']
        }
      })
      
      const savedNotification = await notification.save()
      console.log('Rental request notification created:', savedNotification._id)
      return savedNotification
    } catch (error) {
      console.error('Error creating rental request notification:', error)
      throw error
    }
  }
  
  // Create payment confirmation notification
  static async createPaymentConfirmationNotification(paymentData) {
    try {
      const { userId, userClerkId, amount, method, bookingId, productTitle } = paymentData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'payment_confirmation',
        message: `Payment of ₹${amount} received for "${productTitle}"`,
        relatedId: bookingId,
        relatedType: 'payment',
        metadata: {
          amount,
          method,
          productTitle,
          bookingId
        }
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating payment confirmation notification:', error)
    }
  }

  // Create rental acceptance notification
  static async createRentalAcceptanceNotification(bookingData) {
    try {
      const { renterId, ownerId, productTitle, bookingId, totalAmount } = bookingData
      
      console.log('Creating rental acceptance notification for:', { renterId, ownerId, productTitle, bookingId })
      
      // Get user details
      const renter = await User.findOne({ clerkId: renterId })
      const owner = await User.findOne({ clerkId: ownerId })
      
      console.log('Found users:', { renter: !!renter, owner: !!owner })
      
      if (!renter) {
        console.error('Renter not found with clerkId:', renterId)
        return
      }
      
      const notification = new Notification({
        userId: renter._id,
        userClerkId: renterId,
        type: 'rental_accepted',
        message: `Great news! Your rental request for "${productTitle}" has been accepted. Please complete the payment.`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          ownerName: owner?.firstName || 'Owner',
          ownerId,
          totalAmount,
          bookingId,
          actionRequired: true,
          actions: ['pay_now']
        }
      })
      
      const savedNotification = await notification.save()
      console.log('Rental acceptance notification created:', savedNotification._id)
      return savedNotification
    } catch (error) {
      console.error('Error creating rental acceptance notification:', error)
      throw error
    }
  }

  // Create rental rejection notification
  static async createRentalRejectionNotification(bookingData) {
    try {
      const { renterId, ownerId, productTitle, bookingId } = bookingData
      
      console.log('Creating rental rejection notification for:', { renterId, ownerId, productTitle, bookingId })
      
      // Get user details
      const renter = await User.findOne({ clerkId: renterId })
      const owner = await User.findOne({ clerkId: ownerId })
      
      console.log('Found users:', { renter: !!renter, owner: !!owner })
      
      if (!renter) {
        console.error('Renter not found with clerkId:', renterId)
        return
      }
      
      const notification = new Notification({
        userId: renter._id,
        userClerkId: renterId,
        type: 'rental_rejected',
        message: `Sorry, your rental request for "${productTitle}" has been declined.`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          ownerName: owner?.firstName || 'Owner',
          ownerId,
          bookingId
        }
      })
      
      const savedNotification = await notification.save()
      console.log('Rental rejection notification created:', savedNotification._id)
      return savedNotification
    } catch (error) {
      console.error('Error creating rental rejection notification:', error)
      throw error
    }
  }
  
  // Create pickup scheduled notification
  static async createPickupScheduledNotification(scheduleData) {
    try {
      const { userId, userClerkId, productTitle, pickupLocation, scheduledDate, bookingId } = scheduleData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'pickup_scheduled',
        message: `Pickup scheduled for "${productTitle}" on ${new Date(scheduledDate).toLocaleDateString()}`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          location: pickupLocation,
          scheduledDate,
          pickupTime: new Date(scheduledDate).toLocaleTimeString()
        }
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating pickup scheduled notification:', error)
    }
  }
  
  // Create drop-off scheduled notification
  static async createDropScheduledNotification(scheduleData) {
    try {
      const { userId, userClerkId, productTitle, dropLocation, scheduledDate, bookingId } = scheduleData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'drop_scheduled',
        message: `Drop-off scheduled for "${productTitle}" on ${new Date(scheduledDate).toLocaleDateString()}`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          location: dropLocation,
          scheduledDate,
          dropTime: new Date(scheduledDate).toLocaleTimeString()
        }
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating drop scheduled notification:', error)
    }
  }
  
  // Create due payment notification
  static async createDuePaymentNotification(dueData) {
    try {
      const { userId, userClerkId, amount, dueDate, productTitle, bookingId } = dueData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'due_payment',
        message: `Payment of $${amount} is due for "${productTitle}"`,
        relatedId: bookingId,
        relatedType: 'payment',
        metadata: {
          amount,
          dueDate,
          productTitle,
          daysOverdue: Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24))
        }
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating due payment notification:', error)
    }
  }
  
  // Create reminder notification
  static async createReminderNotification(reminderData) {
    try {
      const { userId, userClerkId, message, relatedId, relatedType, metadata } = reminderData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'reminder',
        message,
        relatedId,
        relatedType,
        metadata
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating reminder notification:', error)
    }
  }
  
  // Create system notification
  static async createSystemNotification(systemData) {
    try {
      const { userId, userClerkId, message, metadata } = systemData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'system',
        message,
        metadata
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating system notification:', error)
    }
  }
  
  // Create promotional notification
  static async createPromotionNotification(promoData) {
    try {
      const { userId, userClerkId, message, metadata } = promoData
      
      const notification = new Notification({
        userId,
        userClerkId,
        type: 'promotion',
        message,
        metadata
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating promotion notification:', error)
    }
  }
  
  // Create booking status update notification
  static async createBookingStatusNotification(statusData) {
    try {
      const { userId, userClerkId, status, productTitle, bookingId } = statusData
      
      let message = ''
      let type = 'system'
      
      switch (status) {
        case 'confirmed':
          message = `Your booking for "${productTitle}" has been confirmed`
          type = 'payment_confirmation'
          break
        case 'cancelled':
          message = `Your booking for "${productTitle}" has been cancelled`
          break
        case 'completed':
          message = `Your booking for "${productTitle}" has been completed`
          break
        default:
          message = `Booking status updated for "${productTitle}"`
      }
      
      const notification = new Notification({
        userId,
        userClerkId,
        type,
        message,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          status,
          statusDate: new Date()
        }
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating booking status notification:', error)
    }
  }
  
  // Cleanup old notifications (run periodically)
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      })
      
      console.log(`Cleaned up ${result.deletedCount} old notifications`)
      return result
    } catch (error) {
      console.error('Error cleaning up notifications:', error)
    }
  }

  // Create payment confirmation and pickup notification for owner
  static async createPaymentConfirmationPickupNotification(notificationData) {
    try {
      const { 
        ownerId, 
        ownerClerkId,
        renterName, 
        productTitle, 
        amount, 
        startDate, 
        endDate, 
        bookingId 
      } = notificationData;
      
      console.log('Creating payment confirmation pickup notification for owner:', { ownerClerkId, productTitle, bookingId });
      
      const notification = new Notification({
        userId: ownerId,
        userClerkId: ownerClerkId,
        type: 'payment_confirmation',
        message: `Payment received! ${renterName} has paid ₹${amount} for "${productTitle}". Prepare for pickup on ${new Date(startDate).toLocaleDateString()}.`,
        relatedId: bookingId,
        relatedType: 'booking',
        metadata: {
          productTitle,
          renterName,
          amount,
          startDate,
          endDate,
          bookingId,
          pickupDate: new Date(startDate).toLocaleDateString(),
          rentalDuration: `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
          actionRequired: true,
          actions: ['download_pickup_document', 'contact_renter']
        }
      });
      
      const savedNotification = await notification.save();
      console.log('Payment confirmation pickup notification created:', savedNotification._id);
      return savedNotification;
    } catch (error) {
      console.error('Error creating payment confirmation pickup notification:', error);
      throw error;
    }
  }
  
  // Get notification statistics
  static async getNotificationStats(userClerkId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { userClerkId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: [{ $eq: ['$isRead', false] }, 1, 0]
              }
            }
          }
        }
      ])
      
      return stats
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return []
    }
  }
}

export default NotificationService
