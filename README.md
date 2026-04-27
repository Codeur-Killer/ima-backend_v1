# 🏆 IMA Awards — Backend API

API REST complète Node.js + Socket.io pour la plateforme de vote IMA Awards.

---

## 🚀 Installation

```bash
npm install
cp .env.example .env
# → Modifier MONGODB_URI si nécessaire

# Peupler la base de données
npm run seed

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

L'API démarre sur **http://localhost:5000

---

## 🔐 Identifiants de démo

| Rôle       | Email                    | Mot de passe |
|------------|--------------------------|--------------|
| Super Admin | admin@ima-awards.com    | admin123     |

---

## 📋 Endpoints API

### Auth — `/api/auth`
| Méthode | Route       | Accès  | Description                  |
|---------|-------------|--------|------------------------------|
| POST    | `/register` | Public | Créer un compte admin        |
| POST    | `/login`    | Public | Connexion → retourne JWT     |
| GET     | `/me`       | Admin  | Profil de l'admin connecté   |

### Catégories — `/api/categories`
| Méthode | Route              | Accès  | Description                    |
|---------|--------------------|--------|--------------------------------|
| GET     | `/`                | Public | Toutes les catégories          |
| GET     | `/:identifier`     | Public | Par slug ou ID                 |
| GET     | `/:id/ranking`     | Public | Classement artistes par catégorie |
| POST    | `/`                | Admin  | Créer une catégorie            |
| PUT     | `/:id`             | Admin  | Modifier                       |
| PATCH   | `/:id/toggle`      | Admin  | Ouvrir / Fermer les votes      |
| DELETE  | `/:id`             | Admin  | Supprimer                      |

### Artistes — `/api/artists`
| Méthode | Route    | Accès  | Description                        |
|---------|----------|--------|------------------------------------|
| GET     | `/`      | Public | Tous les artistes + votePercentage |
| GET     | `/:id`   | Public | Détail + rang + %                  |
| POST    | `/`      | Admin  | Créer un artiste                   |
| PUT     | `/:id`   | Admin  | Modifier                           |
| DELETE  | `/:id`   | Admin  | Désactiver (soft delete)           |

### Votes — `/api/votes`
| Méthode | Route            | Accès  | Description                             |
|---------|------------------|--------|-----------------------------------------|
| POST    | `/`              | Public | 🗳️ Voter pour un artiste                |
| GET     | `/results`       | Public | Résultats live toutes catégories        |
| GET     | `/stats`         | Public | Statistiques globales                   |
| GET     | `/check/:id`     | Public | Vérifier si déjà voté (anti-double)     |
| GET     | `/history`       | Admin  | Historique paginé des votes             |

---

## 🔌 Socket.io — Événements temps réel

### Client → Serveur
```js
socket.emit('join-category', categoryId) // Rejoindre une room catégorie
socket.emit('leave-category', categoryId)
socket.emit('join-admin')               // Rejoindre le dashboard admin
```

### Serveur → Client
```js
socket.on('vote:update', (data) => {
  // { artistId, categoryId, artist, categoryStats, globalStats }
  // → Mettre à jour l'affichage en temps réel
})

socket.on('admin:vote-update', (data) => {
  // Notification admin d'un nouveau vote
})

socket.on('admin:stats-update', (stats) => {
  // Mise à jour des stats du dashboard
})
```

---

## 📡 Exemples d'appels depuis React

```js
// Voter pour un artiste
const res = await fetch('http://localhost:5000/api/votes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ artistId: '...' })
});

// Récupérer les résultats live
const res = await fetch('http://localhost:5000/api/votes/results');
const { data } = await res.json();
// data = [{ category, artists: [{ rank, votePercentage, ... }], totalVotes }]

// Connexion admin
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@ima-awards.com', password: 'admin123' })
});
const { data: { token } } = await res.json();
localStorage.setItem('ima_admin_token', token);
```

---

## 🏗️ Structure

```
ima-backend/
├── config/
│   ├── db.js          → Connexion MongoDB
│   └── seed.js        → Données de démo
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── artistController.js
│   └── voteController.js
├── models/
│   ├── User.js        → bcrypt + JWT
│   ├── Category.js    → slug auto
│   ├── Artist.js      → votes, featured
│   └── Vote.js        → anti-double vote (fingerprint IP+jour)
├── routes/
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── artistRoutes.js
│   └── voteRoutes.js
├── middlewares/
│   └── authMiddleware.js → protect + authorize + asyncHandler
├── socket/
│   └── socket.js      → Socket.io rooms + émissions
├── server.js          → Point d'entrée Express + HTTP + Socket.io
└── package.json       → ES Modules (type: "module")
```

---

## 🔒 Sécurité

- **JWT** : access token 7 jours
- **bcrypt** : hash mots de passe (salt 12)
- **Anti-double vote** : fingerprint SHA-256 (IP + artistId + date)
- **Rate limiting** : 300 req/15min global, 10 votes/minute
- **Helmet** : headers HTTP sécurisés
- **CORS** : origines configurables via `.env`
