// controllers/artistController.js
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Artist from '../models/Artist.js';
import Category from '../models/Category.js';
import Vote from '../models/Vote.js';
import { asyncHandler } from '../middlewares/authMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// BASE_URL for building full photo URLs (read at call-time, not module load)
const getBaseUrl = () => process.env.BASE_URL || 'http://localhost:5000';

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const getCategoryVoteTotal = async (categoryId) => {
  try {
    const agg = await Vote.aggregate([
      { $match: { category: toObjectId(categoryId), status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$voteCount' } } },
    ]);
    return agg[0]?.total || 0;
  } catch { return 0; }
};

/**
 * Normalise la photo : stockée comme `/uploads/filename.ext`,
 * exposée au frontend comme `http://localhost:5000/uploads/filename.ext`
 */
const buildPhotoUrl = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('http')) return photo; // déjà une URL
  // assure le slash initial
  const relative = photo.startsWith('/') ? photo : `/${photo}`;
  return `${getBaseUrl()}${relative}`;
};

/**
 * Formate un artiste Mongoose → objet consommé par le frontend
 * La photo est toujours une URL HTTP complète
 */
const formatArtist = (artist, categoryTotalVotes = 0) => ({
  id:             artist._id.toString(),
  _id:            artist._id.toString(),
  name:           artist.name,
  realName:       artist.realName || '',
  categoryId:     (artist.category?._id || artist.category).toString(),
  photo:          buildPhotoUrl(artist.photo),
  bio:            artist.bio || '',
  genre:          artist.genre || '',
  nationality:    artist.nationality || '',
  votes:          artist.votes || 0,
  featured:       artist.featured || false,
  votePercentage: categoryTotalVotes > 0
    ? Math.round(((artist.votes || 0) / categoryTotalVotes) * 100) : 0,
});

/** Supprimer l'ancien fichier photo du disque */
const deletePhotoFile = (photoPath) => {
  if (!photoPath) return;
  // Extraire le path relatif depuis URL ou path
  const rel = photoPath
    .replace(/^https?:\/\/[^/]+/, '') // retirer host
    .replace(/^\//, '');              // retirer slash initial
  if (!rel.startsWith('uploads/')) return;
  const full = path.join(__dirname, '..', rel);
  try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch {}
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getArtists = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category)            filter.category = req.query.category;
  if (req.query.featured === 'true') filter.featured = true;

  const artists = await Artist.find(filter)
    .populate('category', 'name slug icon color status')
    .sort({ votes: -1 }).lean();

  const catIds = [...new Set(artists.map(a => a.category?._id?.toString()).filter(Boolean))];
  const totals = {};
  await Promise.all(catIds.map(async id => { totals[id] = await getCategoryVoteTotal(id); }));

  const data = artists.map(a => ({
    ...formatArtist(a, totals[a.category?._id?.toString()] || 0),
    category: a.category ? {
      id: a.category._id.toString(), _id: a.category._id.toString(),
      name: a.category.name, slug: a.category.slug,
      icon: a.category.icon, color: a.category.color, status: a.category.status,
    } : null,
  }));

  res.json({ success: true, data, count: data.length });
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────
export const getArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id, isActive: true })
    .populate('category', 'name slug icon color status');
  if (!artist) return res.status(404).json({ success: false, message: 'Artiste introuvable.' });

  const catTotal = await getCategoryVoteTotal(artist.category._id);
  const rank     = await Artist.countDocuments({
    category: artist.category._id, votes: { $gt: artist.votes || 0 }, isActive: true,
  }) + 1;

  res.json({ success: true, data: { ...formatArtist(artist, catTotal), rank, categoryTotalVotes: catTotal } });
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createArtist = asyncHandler(async (req, res) => {
  const { name, realName, categoryId, bio, genre, nationality, votes, featured } = req.body;

  if (!name?.trim()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'Le nom est requis.' });
  }
  if (!categoryId) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'La catégorie est requise.' });
  }

  const cat = await Category.findById(categoryId);
  if (!cat) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
  }

  // Stocker le path relatif en DB, exposer l'URL complète via formatArtist
  const photo = req.file ? `/uploads/${req.file.filename}` : '';

  const artist = await Artist.create({
    name: name.trim(),
    realName: realName?.trim() || '',
    category: categoryId,
    photo,
    bio:         bio?.trim() || '',
    genre:       genre?.trim() || '',
    nationality: nationality?.trim() || '',
    votes:       Math.max(0, parseInt(votes) || 0),
    featured:    featured === 'true' || featured === true,
  });

  const catTotal = await getCategoryVoteTotal(categoryId);
  return res.status(201).json({
    success: true,
    message: 'Artiste créé.',
    data:    formatArtist(artist, catTotal),
  });
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateArtist = asyncHandler(async (req, res) => {
  const existing = await Artist.findById(req.params.id);
  if (!existing) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ success: false, message: 'Artiste introuvable.' });
  }

  const { name, realName, categoryId, bio, genre, nationality, votes, featured } = req.body;
  const update = {};

  if (name        !== undefined) update.name        = name.trim();
  if (realName    !== undefined) update.realName     = realName?.trim() || '';
  if (categoryId  !== undefined) update.category     = categoryId;
  if (bio         !== undefined) update.bio          = bio?.trim() || '';
  if (genre       !== undefined) update.genre        = genre?.trim() || '';
  if (nationality !== undefined) update.nationality  = nationality?.trim() || '';
  if (votes       !== undefined) update.votes        = Math.max(0, parseInt(votes) || 0);
  if (featured    !== undefined) update.featured     = featured === 'true' || featured === true;

  if (req.file) {
    // Supprimer l'ancienne photo
    deletePhotoFile(existing.photo);
    update.photo = `/uploads/${req.file.filename}`;
  }

  const artist = await Artist.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('category', 'name slug icon color status');

  const catTotal = await getCategoryVoteTotal(artist.category._id);
  return res.json({
    success: true,
    message: 'Artiste mis à jour.',
    data:    formatArtist(artist, catTotal),
  });
});

// ─── DELETE (soft) ────────────────────────────────────────────────────────────
export const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return res.status(404).json({ success: false, message: 'Artiste introuvable.' });
  artist.isActive = false;
  await artist.save();
  res.json({ success: true, message: 'Artiste désactivé.' });
});
