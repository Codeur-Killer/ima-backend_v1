// server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import connectDB        from './config/db.js';
import { initSocketIO } from './socket/socket.js';
import authRoutes     from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import artistRoutes   from './routes/artistRoutes.js';
import voteRoutes     from './routes/voteRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();

app.set('trust proxy', 1);
// MANQUANT

const server = http.createServer(app);

initSocketIO(server, process.env.CORS_ORIGIN);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // pour les images
}));
app.use(compression());

// const allowedOrigins = (process.env.CORS_ORIGIN)
//   .split(',').map(s => s.trim());

app.use(cors({
 origin: process.env.CORS_ORIGIN,
 credentials: true,
 methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
 allowedHeaders: ['Content-Type','Authorization']
}));

app.use(cors({
 origin: process.env.CORS_ORIGIN,
 credentials:true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes.' },
}));

// ── Static — fichiers uploadés (photos artistes) ──────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/artists',    artistRoutes);
app.use('/api/votes',      voteRoutes);

app.get('/api/health', (_req, res) => res.json({
  success: true, status: 'OK', service: 'IMA Awards API v2',
  timestamp: new Date().toISOString(), env: process.env.NODE_ENV,
}));

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route introuvable.' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌', err.message);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false, message: 'Vous avez déjà voté gratuitement pour cet artiste.',
      data: { alreadyVoted: true },
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Identifiant invalide.' });
  }
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Fichier trop lourd (max 5MB).' });
  }
  if (err.message?.includes('Format non supporté')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Erreur serveur.' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║  🏆 IMA Awards API v2                     ║`);
  console.log(`║  🌍  ${PORT}                ║`);
  console.log(`║  🔌  Socket.io actif                      ║`);
  console.log(`║  💳  FedaPay: ${process.env.FEDAPAY_ENV || 'sandbox'}                  ║`);
  console.log(`║  📁  Uploads: /${process.env.UPLOAD_DIR || 'uploads'}                  ║`);
  console.log('╚══════════════════════════════════════════╝\n');
});

process.on('unhandledRejection', err => { console.error('❌', err.message); server.close(() => process.exit(1)); });
process.on('SIGTERM', () => server.close(() => process.exit(0)));
