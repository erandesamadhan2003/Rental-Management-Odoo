import Product from "../models/product.model.js";
import User from "../models/user.js";

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

    const owner = await User.findOne({ clerkId });
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    const product = await Product.create({
      ownerId: owner._id,
      ownerClerkId: clerkId,
      title,
      description,
      category,
      brand,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      targetAudience,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      location,
      pickupLocation,
      dropLocation,
      images,
      availability,
      status: 'approved'
    });

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
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
