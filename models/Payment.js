// models/Payment.js
// Enregistrement des transactions FedaPay
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Référence FedaPay
  fedapayId:       { type: String, unique: true, sparse: true },
  transactionRef:  { type: String, unique: true, required: true }, // Référence interne IMA

  // Quoi / Qui
  artist:          { type: mongoose.Schema.Types.ObjectId, ref: 'Artist',   required: true },
  category:        { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  vote:            { type: mongoose.Schema.Types.ObjectId, ref: 'Vote',     default: null },

  // Montant
  voteCount:       { type: Number, required: true, min: 1 },
  amount:          { type: Number, required: true },        // en XOF
  currency:        { type: String, default: 'XOF' },

  // Client
  customerEmail:   { type: String, required: true, lowercase: true, trim: true },
  customerName:    { type: String, default: '' },
  customerIp:      { type: String, default: '' },

  // Statut FedaPay
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'cancelled', 'refunded'],
    default: 'pending',
  },

  // URLs
  checkoutUrl:     { type: String, default: '' },
  callbackUrl:     { type: String, default: '' },

  // Dates
  paidAt:          { type: Date, default: null },
  failedAt:        { type: Date, default: null },
  failureReason:   { type: String, default: '' },

}, { timestamps: true, toJSON: { virtuals: true } });

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ customerEmail: 1 });
paymentSchema.index({ artist: 1 });
paymentSchema.index({ transactionRef: 1 });

export default mongoose.model('Payment', paymentSchema);
