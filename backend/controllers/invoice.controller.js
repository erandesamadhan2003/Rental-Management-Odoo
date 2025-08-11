import Invoice from '../models/invoice.model.js';
import Booking from '../models/booking.model.js';

// Generate invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Create invoice for approved booking
export const createInvoiceForBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate('productId', 'title category');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
    if (existingInvoice) {
      return existingInvoice;
    }

    // Calculate due date (7 days from creation)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Calculate rental duration
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Create invoice items
    const basePrice = booking.totalPrice - booking.platformFee;
    const taxAmount = basePrice * 0.18; // 18% GST
    const subtotal = basePrice - taxAmount;

    const items = [
      {
        description: `Rental of ${booking.productId?.title || 'Product'} (${durationDays} day${durationDays > 1 ? 's' : ''})`,
        quantity: durationDays,
        unitPrice: subtotal / durationDays,
        total: subtotal
      },
      {
        description: 'GST (18%)',
        quantity: 1,
        unitPrice: taxAmount,
        total: taxAmount
      }
    ];

    const invoice = await Invoice.create({
      bookingId: booking._id,
      userId: booking.renterId,
      invoiceNumber: generateInvoiceNumber(),
      amount: booking.totalPrice,
      currency: 'inr',
      status: 'unpaid',
      dueDate: dueDate,
      items: items,
      notes: `Invoice for rental of ${booking.productId?.title || 'Product'} from ${startDate.toDateString()} to ${endDate.toDateString()}`
    });

    return invoice;
  } catch (error) {
    console.error('Error creating invoice for booking:', error);
    throw error;
  }
};

// Download invoice as PDF
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('bookingId')
      .populate('userId', 'firstName lastName email');
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate PDF content (simple HTML that can be converted to PDF)
    const htmlContent = generateInvoiceHTML(invoice);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    // For now, return HTML content that frontend can convert to PDF
    // In a real application, you'd use a library like puppeteer to generate actual PDF
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice', error: error.message });
  }
};

// View invoice in browser
export const viewInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('bookingId')
      .populate('userId', 'firstName lastName email');
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate HTML content for viewing
    const htmlContent = generateInvoiceHTML(invoice);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to view invoice', error: error.message });
  }
};

// Generate HTML content for invoice
const generateInvoiceHTML = (invoice) => {
  const booking = invoice.bookingId;
  const user = invoice.userId;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
        .total { text-align: right; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <h2>${invoice.invoiceNumber}</h2>
      </div>
      
      <div class="invoice-details">
        <p><strong>Bill To:</strong></p>
        <p>${user.firstName} ${user.lastName}</p>
        <p>${user.email}</p>
        <br>
        <p><strong>Invoice Date:</strong> ${invoice.createdAt.toDateString()}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate.toDateString()}</p>
        <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice.toFixed(2)}</td>
              <td>₹${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <h3>Total Amount: ₹${invoice.amount.toFixed(2)}</h3>
      </div>
      
      ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
      
      <p style="margin-top: 30px; text-align: center; color: #666;">
        Thank you for your business!
      </p>
    </body>
    </html>
  `;
};

export const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).limit(numericLimit).skip((numericPage - 1) * numericLimit),
      Invoice.countDocuments(filter),
    ]);
    res.json({ success: true, invoices, pagination: { page: numericPage, limit: numericLimit, total, pages: Math.ceil(total / numericLimit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoice', error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update invoice', error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete invoice', error: error.message });
  }
};