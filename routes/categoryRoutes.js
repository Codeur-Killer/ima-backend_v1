// routes/categoryRoutes.js
import express from 'express';
import {
  getCategories, getCategory, getCategoryRanking,
  createCategory, updateCategory, toggleCategoryStatus, deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public
router.get('/',               getCategories);
router.get('/:identifier',    getCategory);
router.get('/:id/ranking',    getCategoryRanking);

// Admin
router.post('/',              protect, authorize('admin','super_admin'), createCategory);
router.put('/:id',            protect, authorize('admin','super_admin'), updateCategory);
router.patch('/:id/toggle',   protect, authorize('admin','super_admin'), toggleCategoryStatus);
router.delete('/:id',         protect, authorize('super_admin'), deleteCategory);

export default router;
