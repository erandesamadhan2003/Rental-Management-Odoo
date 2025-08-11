import Product from "../models/product.model.js";
import User from "../models/user.js";
import NotificationService from "../services/notification.service.js";

const handleError = (res, error, message = "An error occurred", status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, message, error: error.message });
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const { 
      clerkId, 
      title, 
      description, 
      category, 
      brand,
      tags,
      targetAudience,
      pricePerHour, 
      pricePerDay, 
      pricePerWeek, 
      location, 
      pickupLocation,
      dropLocation,
      images, 
      availability 
    } = req.body;

    // Validate required fields
    if (!clerkId) {
      return res.status(400).json({ success: false, message: "Clerk ID is required" });
    }

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: "Title, description, category, and location are required" });
    }

    // Find or create user
    let owner = await User.findOne({ clerkId });
    if (!owner) {
      // Try to create a basic user record if not found
      try {
        owner = await User.create({
          clerkId,
          email: `${clerkId}@temp.com`, // Temporary email
          username: `user_${clerkId.slice(-8)}`, // Temporary username
          firstName: '',
          lastName: ''
        });
        console.log('Created new user for product creation:', owner._id);
      } catch (userError) {
        console.error('Failed to create user:', userError);
        return res.status(404).json({ success: false, message: "Owner not found and could not be created" });
      }
    }

    const product = await Product.create({
      ownerId: owner._id,
      ownerClerkId: clerkId,
      title,
      description,
      category,
      brand: brand || '',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      targetAudience: targetAudience || 'All Ages',
      pricePerHour: pricePerHour || 0,
      pricePerDay: pricePerDay || 0,
      pricePerWeek: pricePerWeek || 0,
      location,
      pickupLocation: pickupLocation || location,
      dropLocation: dropLocation || location,
      images: images || [],
      availability: availability || [],
      status: 'approved'
    });

    // Create notification for successful product listing
    try {
      await NotificationService.createSystemNotification({
        userClerkId: clerkId,
        message: `Your product "${title}" has been successfully listed and is now available for rent!`,
        metadata: {
          productId: product._id,
          productTitle: title,
          category,
          action: 'product_listed'
        }
      })
    } catch (notificationError) {
      console.error('Failed to create product listing notification:', notificationError)
      // Don't fail the product creation if notification fails
    }

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    console.error('Product creation error:', error);
    handleError(res, error, "Failed to create product");
  }
};

// Get products with optional filters
export const getAllProducts = async (req, res) => {
  try {
    const { ownerClerkId, ownerId, status = 'approved', q, category, brand, targetAudience } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (ownerClerkId) filter.ownerClerkId = ownerClerkId;
    if (ownerId) filter.ownerId = ownerId;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { brand: regex }];
    }
    const products = await Product.find(filter).populate("ownerId", "username email firstName lastName");
    res.status(200).json({ success: true, products });
  } catch (error) {
    handleError(res, error, "Failed to fetch products");
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("ownerId", "username email firstName lastName");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    handleError(res, error, "Failed to fetch product");
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product updated", product: updatedProduct });
  } catch (error) {
    handleError(res, error, "Failed to update product");
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    handleError(res, error, "Failed to delete product");
  }
};

// Approve product
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product approved", product });
  } catch (error) {
    handleError(res, error, "Failed to approve product");
  }
};

// Reject product
export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product rejected", product });
  } catch (error) {
    handleError(res, error, "Failed to reject product");
  }
};
