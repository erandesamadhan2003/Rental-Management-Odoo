import mongoose from 'mongoose';
import dotenv from 'dotenv';
import faker from 'faker';
import User from './models/user.js';
import Product from './models/product.model.js';
import Pricelist from './models/pricelist.model.js';
import Booking from './models/booking.model.js';
import Payment from './models/payment.model.js';
import Notification from './models/notification.model.js';
import Report from './models/report.model.js';
import Review from './models/review.model.js';
import Invoice from './models/invoice.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental_management';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Product.deleteMany({}), Pricelist.deleteMany({}), Booking.deleteMany({}),
    Payment.deleteMany({}), Notification.deleteMany({}), Report.deleteMany({}), Review.deleteMany({}), Invoice.deleteMany({})
  ]);

  // Users
  const users = await User.insertMany([
    { clerkId: 'clerk1', email: 'adam@example.com', username: 'adam', firstName: 'Adam', lastName: 'Smith' },
    { clerkId: 'clerk2', email: 'eve@example.com', username: 'eve', firstName: 'Eve', lastName: 'Johnson' }
  ]);

  // Products
  const products = await Product.insertMany([
    {
      ownerId: users[0]._id,
      ownerClerkId: users[0].clerkId,
      title: 'Accurate Swallow',
      description: 'A great rental product.',
      category: 'Rental - Service',
      pricePerDay: 300,
      pricePerHour: 50,
      pricePerWeek: 1500,
      location: 'Warehouse 1',
      images: [],
      availability: [],
      status: 'approved'
    },
    {
      ownerId: users[1]._id,
      ownerClerkId: users[1].clerkId,
      title: 'Busy Squirrel',
      description: 'Another great rental product.',
      category: 'Rental - Service',
      pricePerDay: 200,
      pricePerHour: 30,
      pricePerWeek: 1000,
      location: 'Warehouse 2',
      images: [],
      availability: [],
      status: 'approved'
    }
  ]);

  // Pricelists
  const pricelists = await Pricelist.insertMany([
    {
      name: 'Default Pricelist',
      description: 'Standard pricing',
      rules: [
        { productId: products[0]._id, unit: 'day', price: 300 },
        { productId: products[1]._id, unit: 'day', price: 200 }
      ],
      isActive: true
    }
  ]);

  // Bookings
  const bookings = await Booking.insertMany([
    {
      productId: products[0]._id,
      renterId: users[1]._id,
      renterClerkId: users[1].clerkId,
      ownerId: users[0]._id,
      ownerClerkId: users[0].clerkId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      totalPrice: 900,
      securityDeposit: 100,
      status: 'confirmed',
      paymentStatus: 'paid',
      platformFee: 90,
      ownerAmount: 810
    }
  ]);

  // Payments
  const payments = await Payment.insertMany([
    {
      bookingId: bookings[0]._id,
      renterId: users[1]._id,
      renterClerkId: users[1].clerkId,
      ownerId: users[0]._id,
      ownerClerkId: users[0].clerkId,
      paymentGateway: 'stripe',
      gatewayPaymentId: 'pi_fake',
      gatewayChargeId: 'ch_fake',
      amount: 900,
      currency: 'usd',
      platformFee: 90,
      ownerAmount: 810,
      paymentStatus: 'successful',
      paymentDate: new Date()
    }
  ]);

  // Notifications
  await Notification.insertMany([
    {
      userId: users[1]._id,
      userClerkId: users[1].clerkId,
      type: 'reminder',
      message: 'Your rental is due soon!',
      isRead: false
    }
  ]);

  // Reports
  await Report.insertMany([
    {
      reportedBy: users[1]._id,
      productId: products[0]._id,
      bookingId: bookings[0]._id,
      reason: 'Product was late',
      status: 'open'
    }
  ]);

  // Reviews
  await Review.insertMany([
    {
      bookingId: bookings[0]._id,
      productId: products[0]._id,
      reviewerId: users[1]._id,
      reviewerClerkId: users[1].clerkId,
      rating: 5,
      comment: 'Great experience!'
    }
  ]);

  // Invoices
  await Invoice.insertMany([
    {
      bookingId: bookings[0]._id,
      userId: users[1]._id,
      invoiceNumber: 'INV-0001',
      amount: 900,
      currency: 'usd',
      status: 'paid',
      dueDate: new Date(),
      paidDate: new Date(),
      items: [
        { description: 'Rental for Accurate Swallow', quantity: 3, unitPrice: 300, total: 900 }
      ],
      deposit: 100,
      lateFee: 0,
      notes: 'Thank you for your business.'
    }
  ]);

  console.log('Seed data created!');
  process.exit();
}

seed();