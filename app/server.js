require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const games = require('./data/games');
const ads = require('./data/ads');

// ---------- Base de données simple (fichier JSON) ----------
const adapter = new FileSync(path.join(__dirname, 'db', 'db.json'));
const db = low(adapter);
db.defaults({ users: [] }).write();

// ---------- Config app ----------
const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ramigame_secret_change_moi',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 jours
}));

app.use(passport.initialize());
app.use(passport.session());

// ---------- Passport : sérialisation ----------
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.get('users').find({ id }).value();
  done(null, user || false);
});

// ---------- Stratégie locale (email + mot de passe) ----------
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  const user = db.get('users').find({ email }).value();
  if (!user) return done(null, false, { message: 'Compte introuvable.' });
  if (!user.password) return done(null, false, { message: 'Utilisez la connexion Google pour ce compte.' });
  bcrypt.compare(password, user.password, (err, ok) => {
    if (err) return done(err);
    if (!ok) return done(null, false, { message: 'Mot de passe incorrect.' });
    return done(null, user);
  });
}));

// ---------- Stratégie Google OAuth ----------
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${SITE_URL}/auth/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    let user = db.get('users').find({ googleId: profile.id }).value();
    if (!user) {
      user = {
        id: uuidv4(),
        googleId: profile.id,
        nom: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
        password: null,
        createdAt: new Date().toISOString()
      };
      db.get('users').push(user).write();
    }
    return done(null, user);
  }));
} else {
  console.warn('[RAMIGame] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET absents : connexion Google désactivée.');
}

// ---------- Middleware d'authentification ----------
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.redirectTo = req.originalUrl;
  res.redirect('/login');
}

// ---------- Infos du site ----------
const SITE_INFO = {
  nom: 'RAMIGame',
  domaine: 'ramigame.onrender.com',
  proprietaire: 'Rami Garouachi رامي القرواشي',
  localisation: 'Cité El Gazella Ariana, Tunisie'
};

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.render('index', {
    site: SITE_INFO,
    games: games.slice(0, 100),
    ads,
    user: req.user || null
  });
});

app.get('/jouer/:id', requireAuth, (req, res) => {
  const jeu = games.find(g => g.id === parseInt(req.params.id, 10));
  if (!jeu) return res.status(404).send('Jeu introuvable');
  res.render('jouer', { site: SITE_INFO, jeu, user: req.user });
});

// --- Inscription ---
app.get('/register', (req, res) => {
  res.render('register', { site: SITE_INFO, error: null });
});

app.post('/register', async (req, res) => {
  const { nom, email, password } = req.body;
  if (!nom || !email || !password) {
    return res.render('register', { site: SITE_INFO, error: 'Tous les champs sont requis.' });
  }
  const exists = db.get('users').find({ email }).value();
  if (exists) {
    return res.render('register', { site: SITE_INFO, error: 'Un compte existe déjà avec cet email.' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    nom,
    email,
    password: hash,
    googleId: null,
    createdAt: new Date().toISOString()
  };
  db.get('users').push(user).write();
  req.login(user, (err) => {
    if (err) return res.redirect('/login');
    res.redirect('/');
  });
});

// --- Connexion locale ---
app.get('/login', (req, res) => {
  res.render('login', { site: SITE_INFO, error: null, googleEnabled: !!process.env.GOOGLE_CLIENT_ID });
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', {
        site: SITE_INFO,
        error: info ? info.message : 'Connexion impossible.',
        googleEnabled: !!process.env.GOOGLE_CLIENT_ID
      });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      const redirectTo = req.session.redirectTo || '/';
      delete req.session.redirectTo;
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// --- Connexion Google ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  }
);

// --- Déconnexion ---
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

app.listen(PORT, () => {
  console.log(`[RAMIGame] Serveur démarré sur ${SITE_URL} (port ${PORT})`);
});
