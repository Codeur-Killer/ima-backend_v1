// config/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User     from '../models/User.js';
import Category from '../models/Category.js';
import Artist   from '../models/Artist.js';

const CATEGORIES = [
  { name: 'Meilleur Artiste Masculin',  slug: 'meilleur-artiste-masculin',  description: "Récompense le meilleur artiste masculin de l'année.",        icon: '🎤', color: '#C9A84C', status: 'open', displayOrder: 1 },
  { name: 'Meilleure Artiste Féminine', slug: 'meilleure-artiste-feminine',  description: 'Célèbre les femmes artistes qui ont marqué la scène musicale.', icon: '👑', color: '#E879A0', status: 'open', displayOrder: 2 },
  { name: "Révélation de l'Année",      slug: 'revelation-de-lannee',        description: "L'artiste émergent(e) qui a le plus impressionné cette année.",  icon: '⭐', color: '#7C3AED', status: 'open', displayOrder: 3 },
  { name: 'Meilleur Album',             slug: 'meilleur-album',              description: "L'album qui a le plus captivé les fans cette année.",            icon: '💿', color: '#10B981', status: 'open', displayOrder: 4 },
  { name: 'Meilleur Clip Vidéo',        slug: 'meilleur-clip',               description: "Le clip vidéo le plus créatif et marquant de l'année.",          icon: '🎬', color: '#F59E0B', status: 'open', displayOrder: 5 },
];

const ARTISTS = (cats) => [
  // Meilleur Artiste Masculin
  { name: 'Wizkid',         realName: 'Ayodeji Ibrahim Balogun',     category: cats[0]._id, photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80', bio: "Superstar afrobeat nigériane, l'un des artistes africains les plus influents au monde.", genre: 'Afrobeats',     nationality: '🇳🇬 Nigeria',        votes: 5240, featured: true  },
  { name: 'Burna Boy',      realName: 'Damini Ebunoluwa Ogulu',      category: cats[0]._id, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80', bio: "Pionnier de l'Afrofusion, Grammy Award winner 2021.",                                  genre: 'Afrofusion',    nationality: '🇳🇬 Nigeria',        votes: 4100, featured: true  },
  { name: 'Fally Ipupa',    realName: "Fally Ipupa N'Simba",         category: cats[0]._id, photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&q=80', bio: "Roi de la rumba congolaise moderne.",                                                   genre: 'Rumba / Afropop',nationality: '🇨🇩 Congo',           votes: 3180, featured: false },
  { name: "Youssou N'Dour", realName: "Youssou Madjiguène N'Dour",   category: cats[0]._id, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80', bio: "Légende de la musique africaine, ambassadeur du mbalax sénégalais.",                   genre: 'Mbalax / World',nationality: '🇸🇳 Sénégal',         votes: 1890, featured: false },
  { name: 'Dadju',           realName: 'Dadju Nsungula',              category: cats[0]._id, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80', bio: "Artiste franco-congolais, mêle R&B, afropop et pop française.",                        genre: 'R&B / Afropop', nationality: '🇫🇷🇨🇩 France/Congo',  votes:  410, featured: false },
  // Meilleure Artiste Féminine
  { name: 'Tiwa Savage',    realName: 'Tiwatope Savage-Balogun',     category: cats[1]._id, photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80', bio: "Reine de l'afrobeat féminin, icône inspirante pour toute une génération.",             genre: 'Afrobeats / R&B',nationality: '🇳🇬 Nigeria',        votes: 4500, featured: true  },
  { name: 'Yemi Alade',     realName: 'Yemi Eberechi Alade',         category: cats[1]._id, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80', bio: "Mama Africa, connue pour ses performances époustouflantes.",                           genre: 'Afropop',        nationality: '🇳🇬 Nigeria',        votes: 3200, featured: true  },
  { name: 'Charlotte Dipanda', realName: 'Charlotte Dipanda Mouelle',category: cats[1]._id, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80', bio: "Voix exceptionnelle du bikutsi et makossa camerounais.",                               genre: 'Afropop / Bikutsi', nationality: '🇨🇲 Cameroun',    votes: 2100, featured: false },
  { name: 'Fatoumata Diawara', realName: 'Fatoumata Diawara',        category: cats[1]._id, photo: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop&q=80', bio: "Fusion entre tradition mandingue et musique contemporaine.",                           genre: 'World / Blues',  nationality: '🇲🇱 Mali',           votes: 1140, featured: false },
  { name: 'Aya Nakamura',   realName: 'Aya Danioko',                 category: cats[1]._id, photo: 'https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400&h=400&fit=crop&q=80', bio: "Artiste francophone la plus écoutée au monde.",                                        genre: 'Afropop / R&B',  nationality: '🇫🇷🇲🇱 France/Mali',   votes:  400, featured: false },
  // Révélation de l'Année
  { name: 'Asake',          realName: 'Ahmed Ololade',               category: cats[2]._id, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80', bio: "Phénomène de l'afrobeats nouvelle génération.",                                        genre: 'Afrobeats / Fuji', nationality: '🇳🇬 Nigeria',        votes: 3800, featured: true  },
  { name: 'Oxlade',         realName: 'Ikuforiji Olaitan Abdulrahman',category: cats[2]._id,photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80', bio: "Voix soul et afrobeats de la nouvelle génération.",                                    genre: 'Afrobeats / Soul', nationality: '🇳🇬 Nigeria',       votes: 2600, featured: false },
  { name: 'Rema',           realName: 'Divine Ikubor',               category: cats[2]._id, photo: 'https://images.unsplash.com/photo-1534308143912-9f7b2b3c08de?w=400&h=400&fit=crop&q=80', bio: "Prodige de l'afrorave, hit mondial \"Calm Down\".",                                    genre: 'Afrorave',        nationality: '🇳🇬 Nigeria',        votes: 1900, featured: true  },
  { name: 'Ayra Starr',     realName: 'Oyinkansola Sarah Aderibigbe',category: cats[2]._id, photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&q=80', bio: "Fraîcheur nouvelle dans l'afrobeats.",                                                 genre: 'Afropop / R&B',  nationality: '🇳🇬 Nigeria',        votes:  920, featured: false },
  { name: 'Omah Lay',       realName: 'Stanley Omah Didia',          category: cats[2]._id, photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&q=80', bio: "Pop afro intimiste et profondément personnelle.",                                      genre: 'Afrobeats / Pop',nationality: '🇳🇬 Nigeria',        votes:  430, featured: false },
  // Meilleur Album
  { name: 'Wizkid — "More Love, Less Ego"', realName: 'Wizkid',    category: cats[3]._id, photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80', bio: "14 titres de pure fusion afrobeats. Un album mature et profond.",                       genre: 'Afrobeats',      nationality: '🇳🇬 Nigeria',        votes: 3500, featured: true  },
  { name: 'Burna Boy — "I Told Them"',      realName: 'Burna Boy', category: cats[3]._id, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80', bio: "Album statement, classique de l'afrofusion moderne.",                                   genre: 'Afrofusion',     nationality: '🇳🇬 Nigeria',        votes: 2450, featured: false },
  { name: 'Fally Ipupa — "Ya Lyami"',       realName: 'Fally Ipupa',category: cats[3]._id,photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&q=80', bio: "Retour aux sources de la rumba congolaise avec arrangements modernes.",                 genre: 'Rumba / Afropop',nationality: '🇨🇩 Congo',           votes: 1500, featured: false },
  { name: 'Rema — "Rave & Roses"',          realName: 'Rema',      category: cats[3]._id, photo: 'https://images.unsplash.com/photo-1534308143912-9f7b2b3c08de?w=400&h=400&fit=crop&q=80', bio: "16 titres, mélange parfait d'afrorave, pop et dancehall.",                              genre: 'Afrorave',       nationality: '🇳🇬 Nigeria',        votes:  580, featured: false },
  { name: 'Tiwa Savage — "Water & Garri"',  realName: 'Tiwa Savage',category: cats[3]._id,photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80', bio: "EP puissant, polyvalence et maturité artistique.",                                     genre: 'Afrobeats / R&B',nationality: '🇳🇬 Nigeria',        votes:  170, featured: false },
  // Meilleur Clip
  { name: 'Burna Boy — "Last Last"',            realName: 'Burna Boy',      category: cats[4]._id, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80', bio: "Clip cinématographique tourné à Lagos.",                          genre: 'Afrofusion',     nationality: '🇳🇬 Nigeria', votes: 3200, featured: false },
  { name: 'Wizkid — "Essence"',                 realName: 'Wizkid ft. Tems',category: cats[4]._id, photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80', bio: "Clip lumineux capturant l'essence de l'Afrique de l'Ouest.",     genre: 'Afrobeats',      nationality: '🇳🇬 Nigeria', votes: 2180, featured: true  },
  { name: 'Yemi Alade — "Tear My Trouble"',     realName: 'Yemi Alade',     category: cats[4]._id, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80', bio: "Costumes africains traditionnels sublimés par effets visuels.", genre: 'Afropop',        nationality: '🇳🇬 Nigeria', votes: 1400, featured: false },
  { name: 'Fally Ipupa — "Eloko Oyo"',          realName: 'Fally Ipupa',    category: cats[4]._id, photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&q=80', bio: "Clip tourné entre Kinshasa et Paris.",                           genre: 'Rumba / Afropop',nationality: '🇨🇩 Congo',    votes:  480, featured: false },
  { name: "Tiwa Savage — \"Somebody's Son\"",   realName: 'Tiwa Savage',    category: cats[4]._id, photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80', bio: "Clip narratif émouvant sur la quête de l'amour vrai.",           genre: 'Afrobeats / R&B',nationality: '🇳🇬 Nigeria', votes:  220, featured: false },
];

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ima_awards';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connecté');

    // Nettoyer TOUTES les collections (including votes pour éviter les index dupliqués)
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Artist.deleteMany({}),
      // Supprimer les votes existants aussi
      mongoose.connection.collection('votes').drop().catch(() => {}),
    ]);
    console.log('🧹 Collections nettoyées');

    // Créer l'admin
    const admin = await User.create({
      name:     process.env.ADMIN_NAME     || 'Administrateur IMA',
      email:    process.env.ADMIN_EMAIL    || 'admin@ima-awards.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role:     'super_admin',
    });
    console.log(`👤 Admin : ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);

    // Créer les catégories
    const cats = await Category.insertMany(CATEGORIES);
    console.log(`📁 ${cats.length} catégories`);

    // Créer les artistes
    const artists = await Artist.insertMany(ARTISTS(cats));
    console.log(`🎤 ${artists.length} artistes`);

    const totalVotes = ARTISTS(cats).reduce((s, a) => s + a.votes, 0);
    console.log(`🗳️  ${totalVotes.toLocaleString()} votes initiaux`);

    console.log('\n✅ Seed terminé avec succès !');
    console.log('─────────────────────────────────────');
    console.log(`📧 Email    : ${admin.email}`);
    console.log(`🔑 Password : ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`🌐 Frontend : http://localhost:5173`);
    console.log(`🔗 API      : http://localhost:5000/api`);
    console.log('─────────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed :', err.message);
    process.exit(1);
  }
};

seed();
