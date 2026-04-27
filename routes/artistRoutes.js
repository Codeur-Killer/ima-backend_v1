// routes/artistRoutes.js
import express from 'express';
import { getArtists, getArtist, createArtist, updateArtist, deleteArtist } from '../controllers/artistController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public
router.get('/',    getArtists);
router.get('/:id', getArtist);

// Admin — multipart/form-data pour la photo
router.post('/',    protect, authorize('admin','super_admin'), upload.single('photo'), createArtist);
router.put('/:id',  protect, authorize('admin','super_admin'), upload.single('photo'), updateArtist);
router.delete('/:id', protect, authorize('admin','super_admin'), deleteArtist);

export default router;
