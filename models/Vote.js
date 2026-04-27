// models/Vote.js
import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  artist:           { type: mongoose.Schema.Types.ObjectId, ref: 'Artist',   required: true },
  category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ipAddress:        { type: String, required: true },
  // Fingerprint unique = SHA-256(IP + artistId) — SEULEMENT pour vote gratuit
  voterFingerprint: { type: String, default: null },
  voteCount:        { type: Number, default: 1, min: 1 },
  // 3 types officiels
  type: {
    type: String,
    enum: ['gratuit', 'payant', 'jury'],
    required: true,
  },
  amount:           { type: Number, default: 0 },
  customerEmail:    { type: String, default: '' },
  payment:          { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  status:           { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

// Index unique UNIQUEMENT pour les votes gratuits (1 seul par artiste par IP)
// Les votes payants et jury n'ont PAS cette contrainte
voteSchema.index(
  { voterFingerprint: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      type: 'gratuit',
      voterFingerprint: { $ne: null }
    }
  }
);
voteSchema.index({ artist: 1, type: 1 });
voteSchema.index({ category: 1, type: 1 });
voteSchema.index({ createdAt: -1 });
voteSchema.index({ type: 1, status: 1 });

// Incrémenter votes bruts de l'artiste après chaque confirmation
voteSchema.post('save', async function (doc) {
  if (doc.status === 'confirmed') {
    await mongoose.model('Artist').findByIdAndUpdate(
      doc.artist,
      { $inc: { votes: doc.voteCount } }
    );
  }
});

export default mongoose.model('Vote', voteSchema);
