// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middlewares/authMiddleware.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * POST /api/auth/register
 * Inscription admin (premier utilisateur = super_admin automatiquement)
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nom, email et mot de passe requis.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
  }

  // Premier utilisateur devient super_admin
  const count = await User.countDocuments();
  const userRole = count === 0 ? 'super_admin' : (role || 'admin');

  const user = await User.create({ name, email, password, role: userRole });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès.',
    data: { user, token, expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  res.json({
    success: true,
    message: 'Connexion réussie.',
    data: {
      user: user.toJSON(),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
