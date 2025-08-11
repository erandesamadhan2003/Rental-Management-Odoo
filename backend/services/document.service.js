import Document from '../models/document.model.js';
import Booking from '../models/booking.model.js';
import Product from '../models/product.model.js';

// Generate document number
const generateDocumentNumber = (type) => {
  const prefix = type === 'pickup' ? 'PU' : type === 'return' ? 'RT' : 'RA';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Generate rental agreement for approved booking
export const generateRentalAgreement = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title category')
      .populate('renterId', 'firstName lastName email phone')
      .populate('ownerId', 'firstName lastName email phone');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Create rental agreement document
    const document = {
      bookingId: booking._id,
      type: 'agreement',
      documentNumber: generateDocumentNumber('agreement'),
      status: 'active',
      scheduledDate: new Date(),
      items: [{
        productId: booking.productId._id,
        quantity: 1,
        condition: 'good',
        notes: `Rental agreement for ${booking.productId.title}`
      }],
      notes: `Rental agreement between ${booking.ownerId.firstName} ${booking.ownerId.lastName} (Owner) and ${booking.renterId.firstName} ${booking.renterId.lastName} (Renter) for ${booking.productId.title}`
    };

    return document;
  } catch (error) {
    console.error('Error generating rental agreement:', error);
    throw error;
  }
};

// Create pickup document for confirmed booking
export const createPickupDocument = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title category')
      .populate('renterId', 'firstName lastName email phone');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if pickup document already exists
    const existingDocument = await Document.findOne({ 
      bookingId: booking._id,
      type: 'pickup'
    });
    
    if (existingDocument) {
      return existingDocument;
    }

    // Create pickup document
    const document = await Document.create({
      bookingId: booking._id,
      type: 'pickup',
      documentNumber: generateDocumentNumber('pickup'),
      status: 'pending',
      scheduledDate: booking.startDate,
      items: [{
        productId: booking.productId._id,
        quantity: 1,
        condition: 'good',
        notes: `Pickup for rental of ${booking.productId.title}`
      }],
      notes: `Pickup document for rental of ${booking.productId.title} to ${booking.renterId.firstName} ${booking.renterId.lastName}`
    });

    // Update booking pickup status
    await Booking.findByIdAndUpdate(bookingId, { pickupStatus: 'scheduled' });

    return document;
  } catch (error) {
    console.error('Error creating pickup document:', error);
    throw error;
  }
};

// Create return document for completed rental
export const createReturnDocument = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title category')
      .populate('renterId', 'firstName lastName email phone');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if return document already exists
    const existingDocument = await Document.findOne({ 
      bookingId: booking._id,
      type: 'return'
    });
    
    if (existingDocument) {
      return existingDocument;
    }

    // Create return document
    const document = await Document.create({
      bookingId: booking._id,
      type: 'return',
      documentNumber: generateDocumentNumber('return'),
      status: 'pending',
      scheduledDate: booking.endDate,
      items: [{
        productId: booking.productId._id,
        quantity: 1,
        condition: 'good', // Will be updated upon actual return
        notes: `Return for rental of ${booking.productId.title}`
      }],
      notes: `Return document for rental of ${booking.productId.title} from ${booking.renterId.firstName} ${booking.renterId.lastName}`
    });

    // Update booking return status
    await Booking.findByIdAndUpdate(bookingId, { returnStatus: 'scheduled' });

    return document;
  } catch (error) {
    console.error('Error creating return document:', error);
    throw error;
  }
};