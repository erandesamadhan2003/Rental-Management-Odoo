import Document from '../models/document.model.js';
import Booking from '../models/booking.model.js';
import Product from '../models/product.model.js';

// Generate document number
const generateDocumentNumber = (type) => {
  const prefix = type === 'pickup' ? 'PU' : 'RT';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Create pickup document for approved booking
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

// Generate HTML content for document
const generateDocumentHTML = (document, booking, product, user) => {
  const documentType = document.type.charAt(0).toUpperCase() + document.type.slice(1);
  const action = document.type === 'pickup' ? 'Deliver to' : 'Collect from';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${documentType} Document ${document.documentNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .document-details { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
        .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${documentType.toUpperCase()} DOCUMENT</h1>
        <h2>${document.documentNumber}</h2>
      </div>
      
      <div class="document-details">
        <p><strong>${action}:</strong></p>
        <p>${user.firstName} ${user.lastName}</p>
        <p>Email: ${user.email}</p>
        <p>Phone: ${user.phone || 'N/A'}</p>
        <br>
        <p><strong>Scheduled Date:</strong> ${new Date(document.scheduledDate).toDateString()}</p>
        <p><strong>Status:</strong> ${document.status.toUpperCase()}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Condition</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${document.items.map(item => `
            <tr>
              <td>${product.title}</td>
              <td>${item.quantity}</td>
              <td>${item.condition}</td>
              <td>${item.notes || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="notes">
        <p><strong>Notes:</strong> ${document.notes || 'No additional notes'}</p>
      </div>
      
      <div class="signature-area">
        <div class="signature-box">Customer Signature</div>
        <div class="signature-box">Agent Signature</div>
      </div>
      
      <p style="margin-top: 30px; text-align: center; color: #666;">
        This document serves as proof of ${document.type} for the rental transaction.
      </p>
    </body>
    </html>
  `;
};

// Download document as PDF
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'renterId' },
          { path: 'productId' }
        ]
      });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const booking = document.bookingId;
    const product = booking.productId;
    const user = booking.renterId;

    // Generate PDF content
    const htmlContent = generateDocumentHTML(document, booking, product, user);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.type}-${document.documentNumber}.pdf"`);
    
    // For now, return HTML content that frontend can convert to PDF
    // In a real application, you'd use a library like puppeteer to generate actual PDF
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate document', error: error.message });
  }
};

// View document in browser
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'renterId' },
          { path: 'productId' }
        ]
      });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const booking = document.bookingId;
    const product = booking.productId;
    const user = booking.renterId;

    // Generate HTML content for viewing
    const htmlContent = generateDocumentHTML(document, booking, product, user);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to view document', error: error.message });
  }
};

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    
    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('bookingId', 'startDate endDate status')
        .populate('items.productId', 'title')
        .sort({ scheduledDate: 1 })
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit),
      Document.countDocuments(filter),
    ]);
    
    res.json({ 
      success: true, 
      documents, 
      pagination: { 
        page: numericPage, 
        limit: numericLimit, 
        total, 
        pages: Math.ceil(total / numericLimit) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('bookingId')
      .populate('items.productId');
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch document', error: error.message });
  }
};

// Update document status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, condition, notes } = req.body;
    
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Update document status
    document.status = status || document.status;
    
    if (status === 'completed') {
      document.completedDate = new Date();
    }
    
    // Update item condition if provided
    if (condition && document.items.length > 0) {
      document.items[0].condition = condition;
    }
    
    // Update notes if provided
    if (notes) {
      document.notes = notes;
    }
    
    await document.save();
    
    // Update booking status based on document type and status
    if (status === 'completed') {
      const booking = await Booking.findById(document.bookingId);
      
      if (document.type === 'pickup') {
        await Booking.findByIdAndUpdate(document.bookingId, { pickupStatus: 'completed' });
        
        // If this is a pickup completion, create the return document
        if (booking && booking.returnStatus === 'pending') {
          await createReturnDocument(document.bookingId);
        }
      } else if (document.type === 'return') {
        await Booking.findByIdAndUpdate(document.bookingId, { 
          returnStatus: 'completed',
          status: 'completed'
        });
        
        // Update product availability after return
        if (booking && booking.productId) {
          // Mark the product as available again
          await Product.findByIdAndUpdate(booking.productId, {
            $set: { status: 'available' }
          });
        }
      }
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update document status', error: error.message });
  }
};