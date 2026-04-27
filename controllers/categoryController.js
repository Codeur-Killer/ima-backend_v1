// controllers/categoryController.js
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Artist from '../models/Artist.js';
import Vote from '../models/Vote.js';
import { asyncHandler } from '../middlewares/authMiddleware.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toObjectId = (id) => new mongoose.Types.ObjectId(id.toString());

/** Total des votes d'une catégorie (correctement casté) */
const getCategoryTotalVotes = async (categoryId) => {
  try {
    const agg = await Vote.aggregate([
      { $match: { category: toObjectId(categoryId), status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$voteCount' } } },
    ]);
    return agg[0]?.total || 0;
  } catch {
    return 0;
  }
};

/** Formater une catégorie en shape exacte attendue par le frontend */
const formatCategory = async (cat) => {
  const [artistCount, totalVotes] = await Promise.all([
    Artist.countDocuments({ category: cat._id, isActive: true }),
    getCategoryTotalVotes(cat._id),
  ]);
  return {
    id:          cat._id.toString(),
    _id:         cat._id.toString(),
    slug:        cat.slug,
    name:        cat.name,
    description: cat.description || '',
    icon:        cat.icon,
    color:       cat.color,
    status:      cat.status,
    artistCount,
    totalVotes,
  };
};

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Liste toutes les catégories avec artistCount et totalVotes
 */
export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const cats = await Category.find(filter).sort({ displayOrder: 1, createdAt: 1 });
  const data = await Promise.all(cats.map(formatCategory));

  res.json({ success: true, data, count: data.length });
});

/**
 * GET /api/categories/:identifier
 * Récupère une catégorie par slug ou par _id
 */
export const getCategory = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const cat  = await Category.findOne(isId ? { _id: identifier } : { slug: identifier });
  if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });

  res.json({ success: true, data: await formatCategory(cat) });
});

/**
 * GET /api/categories/:id/ranking
 * Classement complet des artistes dans la catégorie avec %, rang
 */
export const getCategoryRanking = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });

  const artists    = await Artist.find({ category: cat._id, isActive: true }).sort({ votes: -1 }).lean();
  const totalVotes = artists.reduce((s, a) => s + (a.votes || 0), 0);

  const ranking = artists.map((a, i) => ({
    id:             a._id.toString(),
    _id:            a._id.toString(),
    name:           a.name,
    realName:       a.realName || '',
    categoryId:     cat._id.toString(),
    photo:          a.photo || '',
    bio:            a.bio || '',
    genre:          a.genre || '',
    nationality:    a.nationality || '',
    votes:          a.votes || 0,
    featured:       a.featured,
    rank:           i + 1,
    votePercentage: totalVotes > 0 ? Math.round(((a.votes || 0) / totalVotes) * 100) : 0,
  }));

  res.json({
    success: true,
    data:    ranking,
    meta: {
      category:    { id: cat._id.toString(), name: cat.name, icon: cat.icon, color: cat.color },
      totalVotes,
      artistCount: ranking.length,
    },
  });
});

/**
 * POST /api/categories (admin)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, message: 'Catégorie créée.', data: await formatCategory(cat) });
});

/**
 * PUT /api/categories/:id (admin)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  // Si le slug est modifié manuellement, on l'accepte, sinon on le laisse
  const updateData = { ...req.body };
  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-').trim();
  }

  const cat = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });

  res.json({ success: true, message: 'Catégorie mise à jour.', data: await formatCategory(cat) });
});

/**
 * PATCH /api/categories/:id/toggle (admin)
 * Basculer ouvert/fermé
 */
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });

  cat.status = cat.status === 'open' ? 'closed' : 'open';
  await cat.save();

  res.json({
    success: true,
    message: `Votes ${cat.status === 'open' ? 'ouverts' : 'fermés'} pour "${cat.name}".`,
    data:    await formatCategory(cat),
  });
});

/**
 * DELETE /api/categories/:id (super_admin)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const count = await Artist.countDocuments({ category: req.params.id });
  if (count > 0) {
    return res.status(409).json({
      success: false,
      message: `Impossible de supprimer : ${count} artiste(s) lié(s) à cette catégorie.`,
    });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Catégorie supprimée.' });
});
