import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct
} from "../controllers/product.controller.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Authenticated user
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Admin only
router.put("/:id/approve", approveProduct);
router.put("/:id/reject", rejectProduct);

export default router;
