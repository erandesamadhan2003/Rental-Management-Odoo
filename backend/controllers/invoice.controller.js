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
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const invoiceDate = invoice.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate subtotal and tax
  let subtotal = 0;
  invoice.items.forEach(item => {
    if (!item.description.includes('GST')) {
      subtotal += item.total;
    }
  });
  
  // Find tax item
  const taxItem = invoice.items.find(item => item.description.includes('GST'));
  const taxAmount = taxItem ? taxItem.total : 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #4a86e8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #4a86e8; }
        .company-details { float: right; text-align: right; }
        .invoice-title { clear: both; text-align: center; margin: 40px 0 20px; }
        .invoice-title h1 { margin: 0; color: #4a86e8; font-size: 36px; }
        .invoice-title h2 { margin: 5px 0 0; font-size: 20px; color: #666; font-weight: normal; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .invoice-info-block { width: 45%; }
        .invoice-info-block h4 { margin: 0 0 5px; color: #4a86e8; font-size: 16px; }
        .invoice-info-block p { margin: 0 0 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f5f5f5; color: #4a86e8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .items-table .amount { text-align: right; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .summary-table td { padding: 8px; }
        .summary-table .label { text-align: right; font-weight: normal; width: 80%; }
        .summary-table .amount { text-align: right; width: 20%; }
        .summary-table .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #4a86e8; padding-top: 12px; }
        .terms { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
        .terms h4 { color: #4a86e8; margin: 0 0 10px; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 14px; }
        .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">RENTAL MANAGEMENT SYSTEM</div>
          <div class="company-details">
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: support@rentalsystem.com</p>
            <p>GST No: 29AADCB2230M1ZP</p>
          </div>
        </div>
        
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <h2>${invoice.invoiceNumber}</h2>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-info-block">
            <h4>BILL TO:</h4>
            <p><strong>${user.firstName} ${user.lastName}</strong></p>
            <p>${user.email}</p>
            <p>${user.phone || 'No phone provided'}</p>
          </div>
          
          <div class="invoice-info-block">
            <h4>INVOICE DETAILS:</h4>
            <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            <p><strong>Payment Terms:</strong> Due on receipt</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th class="amount">Unit Price</th>
              <th class="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td class="amount">₹${item.unitPrice.toFixed(2)}</td>
                <td class="amount">₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td class="label">Subtotal:</td>
            <td class="amount">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">GST (18%):</td>
            <td class="amount">₹${taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Total Amount:</td>
            <td class="amount">₹${invoice.amount.toFixed(2)}</td>
          </tr>
        </table>
        
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <ol>
            <p>1. Payment is due within 7 days of invoice date.</p>
            <p>2. This invoice is subject to the terms of the rental agreement.</p>
            <p>3. Late payments are subject to a 2% monthly interest charge.</p>
            <p>4. All disputes must be raised within 7 days of invoice receipt.</p>
          </ol>
        </div>
        
        ${invoice.notes ? `<div class="notes"><h4>Additional Notes</h4><p>${invoice.notes}</p></div>` : ''}
        
        <div class="signature-area">
          <div class="signature-box">Authorized Signature</div>
          <div class="signature-box">Customer Signature</div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated invoice and does not require a physical signature.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
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