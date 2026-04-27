// models/Artist.js
import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  realName:    { type: String, trim: true, default: '' },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  photo:       { type: String, default: '' },
  bio:         { type: String, trim: true, default: '' },
  genre:       { type: String, trim: true, default: '' },
  nationality: { type: String, trim: true, default: '' },

  // Compteurs bruts par type (mise à jour automatique via hook Vote)
  votes:       { type: Number, default: 0, min: 0 },  // total brut (gratuit + payant)
  votesGratuit:{ type: Number, default: 0, min: 0 },  // votes gratuits
  votesPay:    { type: Number, default: 0, min: 0 },  // votes payants
  votesJury:   { type: Number, default: 0, min: 0 },  // votes jury (interne)

  // Score pondéré = votesGratuit*0.2 + votesPay*0.6 + votesJury*0.2
  scoreTotal:  { type: Number, default: 0 },

  featured:    { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

artistSchema.index({ category: 1 });
artistSchema.index({ scoreTotal: -1 });
artistSchema.index({ votes: -1 });

export default mongoose.model('Artist', artistSchema);
