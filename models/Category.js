// models/Category.js
// Correspond EXACTEMENT à la structure frontend :
// { id, slug, name, description, icon, color, status, artistCount, totalVotes }
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true, default: '' },
  icon:        { type: String, default: '🎵' },
  color:       { type: String, default: '#C9A84C' },
  status:      { type: String, enum: ['open', 'closed'], default: 'open' },
  displayOrder:{ type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Générer le slug automatiquement
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }
  next();
});

// Virtual : nombre d'artistes actifs
categorySchema.virtual('artistCount', {
  ref: 'Artist',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

export default mongoose.model('Category', categorySchema);
