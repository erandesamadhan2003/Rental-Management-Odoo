import express from "express";
import multer from 'multer'
import path from 'path'
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct
} from "../controllers/product.controller.js";
import { uploadBuffer } from '../services/cloudinary.service.js'

const router = express.Router();

// Multer memory storage for Cloudinary
const upload = multer({ storage: multer.memoryStorage() })

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Upload images to Cloudinary
router.post('/upload', upload.array('images', 8), async (req, res) => {
  try {
    const files = req.files || []
    if (!files.length) return res.json({ success: true, files: [] })

    const uploads = await Promise.all(
      files.map((file, idx) => uploadBuffer(file.buffer, 'rental-products', `product-${idx}`))
    )
    const urls = uploads.map(u => u.secure_url || u.url)
    res.json({ success: true, files: urls })
  } catch (error) {
    console.error('Cloudinary upload failed', error)
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message })
  }
})

// Authenticated user
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Admin only
router.put("/:id/approve", approveProduct);
router.put("/:id/reject", rejectProduct);

export default router;
