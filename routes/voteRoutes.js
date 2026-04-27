// routes/voteRoutes.js
import express from 'express';
import {
  castFreeVote, initPaidVote,
  fedapayCallback, fedapayMockRedirect, fedapayMock,
  verifyPayment, castJuryVote,
  getLiveResults, getStats, checkVoted, getVoteHistory,
} from '../controllers/voteController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router   = express.Router();
const voteLimiter = rateLimit({ windowMs: 60000, max: 20, message: { success: false, message: 'Trop de requêtes.' } });

// ── Publiques ─────────────────────────────────────────────
router.get('/results',              getLiveResults);
router.get('/stats',                getStats);
router.get('/check/:artistId',      checkVoted);

// Vote gratuit
router.post('/free',                voteLimiter, castFreeVote);

// Vote payant FedaPay
router.post('/paid/init',           voteLimiter, initPaidVote);

// Callback FedaPay — webhook POST + redirect GET
// Les deux REDIRIGENT vers le frontend (pas de JSON)
router.post('/fedapay/callback',    fedapayCallback);
router.get('/fedapay/callback',     fedapayCallback);

// Mock dev/sandbox — simule paiement approuvé et REDIRIGE
router.get('/fedapay/mock-redirect', fedapayMockRedirect);
router.get('/fedapay/mock',          fedapayMock);

// Vérification paiement (utilisée par la page succès)
router.get('/fedapay/verify',       verifyPayment);

// ── Admin ──────────────────────────────────────────────────
router.post('/jury',    protect, authorize('admin','super_admin'), castJuryVote);
router.get('/history',  protect, authorize('admin','super_admin'), getVoteHistory);

export default router;
