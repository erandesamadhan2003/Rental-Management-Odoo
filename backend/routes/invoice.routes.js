import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  viewInvoice
} from '../controllers/invoice.controller.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/download', downloadInvoice);
router.get('/:id/view', viewInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;