import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

// Configuration for dataset size (can be overridden via env)
const NUM_PRODUCTS_PER_OWNER = Number(process.env.SEED_NUM_PRODUCTS_PER_OWNER || 100);
const NUM_BOOKINGS = Number(process.env.SEED_NUM_BOOKINGS || 1000);
const NUM_NOTIFICATIONS_PER_USER = Number(process.env.SEED_NUM_NOTIFICATIONS_PER_USER || 100);
const NUM_REPORTS = Number(process.env.SEED_NUM_REPORTS || 100);
const NUM_REVIEWS = Number(process.env.SEED_NUM_REVIEWS || 800);
const NUM_INVOICES = Number(process.env.SEED_NUM_INVOICES || 1000);

const objectId = (value) => new mongoose.Types.ObjectId(value);

// Fixed users provided by the requester
const FIXED_USERS = [
  {
    _id: objectId('6899c6898d7ee7783b9e410e'),
    clerkId: 'user_3182pIAMOXBJ7saei8wgER68WNq',
    email: 'erandesamadhan2003@gmail.com',
    username: 'erandesamadhan2003',
    firstName: 'Samadhan',
    lastName: 'Erande',
  },
  {
    _id: objectId('6899ba2b895dca3447429cf7'),
    clerkId: 'user_3182ZwvbETpR5BiRRwOULTqhEia',
    email: 'atharvaspatil247@gmail.com',
    username: 'atharvapatil',
    firstName: 'Atharva',
    lastName: 'Patil',
  }
];

function randomInt(minInclusive, maxInclusive) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateAvailabilityBlocks(numBlocks = 3) {
  const blocks = [];
  const now = Date.now();
  for (let i = 0; i < numBlocks; i++) {
    const start = new Date(now + randomInt(1, 20) * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000);
    blocks.push({ startDate: start, endDate: end });
  }
  return blocks;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Ensure only the two fixed users exist
  const fixedUserIds = FIXED_USERS.map((u) => u._id);
  await User.deleteMany({ _id: { $nin: fixedUserIds } });
  for (const user of FIXED_USERS) {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          clerkId: user.clerkId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { upsert: true }
    );
  }
  const users = await User.find({ _id: { $in: fixedUserIds } }).lean();

  // Clear existing related collections
  await Promise.all([
    Product.deleteMany({}),
    Pricelist.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
    Review.deleteMany({}),
    Invoice.deleteMany({}),
  ]);

  // Generate Products for each owner
  const categories = ['Rental - Service', 'Rental - Equipment', 'Rental - Vehicle'];
  const locations = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3', 'Downtown Hub', 'Uptown Depot'];
  const productsToInsert = [];
  for (const owner of users) {
    for (let i = 0; i < NUM_PRODUCTS_PER_OWNER; i++) {
      const base = i + 1;
      const pricePerDay = randomInt(50, 1000);
      const productDoc = {
        ownerId: owner._id,
        ownerClerkId: owner.clerkId,
        title: `${owner.firstName || 'Owner'} Product ${base}`,
        description: `High quality rentable item #${base} by ${owner.username}.`,
        category: pickOne(categories),
        brand: `Brand ${base}`,
        tags: [pickOne(['sports', 'badminton', 'outdoor', 'indoor', 'professional', 'beginner']), pickOne(['equipment', 'gear', 'tools'])],
        targetAudience: pickOne(['beginners', 'professionals', 'kids', 'adults', 'all-ages']),
        pricePerHour: Math.max(5, Math.round(pricePerDay / 10)),
        pricePerDay,
        pricePerWeek: pricePerDay * 5,
        location: pickOne(locations),
        pickupLocation: pickOne(locations),
        dropLocation: pickOne(locations),
        images: [],
        availability: generateAvailabilityBlocks(randomInt(2, 5)),
        status: 'approved',
      };
      productsToInsert.push(productDoc);
    }
  }
  const products = await Product.insertMany(productsToInsert, { ordered: false });
  console.log(`Inserted ${products.length} products`);

  // Create a Default Pricelist with rules for a sample of products
  const sampleRuleCount = Math.min(200, products.length);
  const chosenIndexes = new Set();
  while (chosenIndexes.size < sampleRuleCount) {
    chosenIndexes.add(randomInt(0, products.length - 1));
  }
  const priceRules = Array.from(chosenIndexes).map((idx) => ({
    productId: products[idx]._id,
    unit: pickOne(['hour', 'day', 'week']),
    price: randomInt(10, 2000),
  }));
  await Pricelist.create({
    name: 'Default Pricelist',
    description: 'Auto-generated default pricelist with sample rules',
    rules: priceRules,
    isActive: true,
    createdBy: users[0]._id,
  });
  console.log(`Inserted pricelist with ${priceRules.length} rules`);

  // Generate Bookings
  const bookingsToInsert = [];
  for (let i = 0; i < NUM_BOOKINGS; i++) {
    const product = products[randomInt(0, products.length - 1)];
    const owner = users.find((u) => String(u._id) === String(product.ownerId));
    const renter = users.find((u) => String(u._id) !== String(owner._id));

    const startDate = new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000);
    const durationDays = randomInt(1, 14);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const totalPrice = (product.pricePerDay || 100) * durationDays;
    const platformFee = Math.round(totalPrice * 0.1);
    const ownerAmount = totalPrice - platformFee;

    bookingsToInsert.push({
      productId: product._id,
      renterId: renter._id,
      renterClerkId: renter.clerkId,
      ownerId: owner._id,
      ownerClerkId: owner.clerkId,
      startDate,
      endDate,
      totalPrice,
      securityDeposit: randomInt(0, 200),
      status: pickOne(['pending', 'confirmed', 'in_rental', 'cancelled', 'completed']),
      paymentStatus: pickOne(['unpaid', 'paid', 'refunded']),
      platformFee,
      ownerAmount,
      pickupStatus: pickOne(['pending', 'scheduled', 'completed']),
      deliveryStatus: pickOne(['pending', 'out_for_delivery', 'delivered']),
      returnStatus: pickOne(['pending', 'scheduled', 'completed', 'late']),
      lateFee: randomInt(0, 50),
      notes: Math.random() < 0.2 ? 'Special handling required' : undefined,
    });
  }
  const bookings = await Booking.insertMany(bookingsToInsert, { ordered: false });
  console.log(`Inserted ${bookings.length} bookings`);

  // Payments (one per booking)
  const paymentsToInsert = bookings.map((bk, index) => {
    const owner = users.find((u) => String(u._id) === String(bk.ownerId));
    const renter = users.find((u) => String(u._id) === String(bk.renterId));
    return {
      bookingId: bk._id,
      renterId: renter._id,
      renterClerkId: renter.clerkId,
      ownerId: owner._id,
      ownerClerkId: owner.clerkId,
      paymentGateway: 'stripe',
      gatewayPaymentId: `pi_${index}_${Math.random().toString(36).slice(2, 10)}`,
      gatewayChargeId: Math.random() < 0.9 ? `ch_${index}_${Math.random().toString(36).slice(2, 10)}` : undefined,
      amount: bk.totalPrice,
      currency: 'usd',
      platformFee: bk.platformFee,
      ownerAmount: bk.ownerAmount,
      paymentStatus: pickOne(['initiated', 'successful', 'failed', 'refunded']),
      paymentDate: new Date(bk.startDate.getTime() + randomInt(0, 3) * 24 * 60 * 60 * 1000),
      payoutStatus: pickOne(['pending', 'processing', 'completed', 'failed']),
      payoutDate: Math.random() < 0.6 ? new Date(bk.endDate.getTime() + randomInt(0, 7) * 24 * 60 * 60 * 1000) : undefined,
      refundStatus: pickOne(['none', 'requested', 'processed']),
      refundDate: Math.random() < 0.1 ? new Date(bk.endDate.getTime() + randomInt(1, 15) * 24 * 60 * 60 * 1000) : undefined,
      refundAmount: Math.random() < 0.1 ? randomInt(1, Math.max(1, Math.round(bk.totalPrice * 0.3))) : undefined,
      notes: Math.random() < 0.15 ? 'Auto-generated payment record' : undefined,
    };
  });
  const payments = await Payment.insertMany(paymentsToInsert, { ordered: false });
  console.log(`Inserted ${payments.length} payments`);

  // Back-fill booking.paymentId
  const bookingUpdates = payments.map((pmt) => ({
    updateOne: {
      filter: { _id: pmt.bookingId },
      update: { $set: { paymentId: pmt._id } },
    },
  }));
  if (bookingUpdates.length > 0) {
    await Booking.bulkWrite(bookingUpdates);
  }

  // Notifications for each user
  const notificationsToInsert = [];
  for (const user of users) {
    for (let i = 0; i < NUM_NOTIFICATIONS_PER_USER; i++) {
      notificationsToInsert.push({
        userId: user._id,
        userClerkId: user.clerkId,
        type: pickOne(['reminder', 'payment', 'system', 'promotion']),
        message: `Notification ${i + 1} for ${user.username}`,
        isRead: Math.random() < 0.5,
      });
    }
  }
  if (notificationsToInsert.length > 0) {
    await Notification.insertMany(notificationsToInsert, { ordered: false });
  }
  console.log(`Inserted ${notificationsToInsert.length} notifications`);

  // Reports for a subset of bookings
  const reportsToInsert = [];
  for (let i = 0; i < Math.min(NUM_REPORTS, bookings.length); i++) {
    const bk = bookings[i];
    reportsToInsert.push({
      reportedBy: bk.renterId,
      productId: bk.productId,
      bookingId: bk._id,
      reason: pickOne([
        'Item delivered late',
        'Damaged on arrival',
        'Incorrect item',
        'Poor communication',
      ]),
      status: pickOne(['open', 'resolved']),
    });
  }
  if (reportsToInsert.length > 0) {
    await Report.insertMany(reportsToInsert, { ordered: false });
  }
  console.log(`Inserted ${reportsToInsert.length} reports`);

  // Reviews for random bookings
  const reviewsToInsert = [];
  const reviewCount = Math.min(NUM_REVIEWS, bookings.length);
  for (let i = 0; i < reviewCount; i++) {
    const bk = bookings[randomInt(0, bookings.length - 1)];
    reviewsToInsert.push({
      bookingId: bk._id,
      productId: bk.productId,
      reviewerId: bk.renterId,
      reviewerClerkId: users.find((u) => String(u._id) === String(bk.renterId))?.clerkId || FIXED_USERS[1].clerkId,
      rating: randomInt(3, 5),
      comment: pickOne([
        'Great experience!',
        'Good service and item quality',
        'Satisfactory',
        'Would rent again',
      ]),
    });
  }
  if (reviewsToInsert.length > 0) {
    await Review.insertMany(reviewsToInsert, { ordered: false });
  }
  console.log(`Inserted ${reviewsToInsert.length} reviews`);

  // Invoices (one per booking up to NUM_INVOICES)
  const invoicesToInsert = [];
  const invoiceCount = Math.min(NUM_INVOICES, bookings.length);
  for (let i = 0; i < invoiceCount; i++) {
    const bk = bookings[i];
    const invoiceNumber = `INV-${(i + 1).toString().padStart(6, '0')}`;
    invoicesToInsert.push({
      bookingId: bk._id,
      userId: bk.renterId,
      invoiceNumber,
      amount: bk.totalPrice,
      currency: 'usd',
      status: pickOne(['unpaid', 'paid', 'partial', 'cancelled']),
      dueDate: new Date(bk.endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      paidDate: Math.random() < 0.6 ? new Date(bk.endDate.getTime() + randomInt(0, 14) * 24 * 60 * 60 * 1000) : undefined,
      items: [
        {
          description: `Rental for booking ${bk._id.toString()}`,
          quantity: 1,
          unitPrice: bk.totalPrice,
          total: bk.totalPrice,
        },
      ],
      deposit: randomInt(0, 200),
      lateFee: randomInt(0, 50),
      notes: Math.random() < 0.2 ? 'Auto-generated invoice' : undefined,
    });
  }
  if (invoicesToInsert.length > 0) {
    await Invoice.insertMany(invoicesToInsert, { ordered: false });
  }
  console.log(`Inserted ${invoicesToInsert.length} invoices`);

  console.log('Seed data created!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});