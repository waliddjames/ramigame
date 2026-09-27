# RAMIGame — Site dynamique de jeux gratuits

Site web dynamique (Node.js + Express + Docker) contenant :
- une liste de **100 jeux gratuits**,
- une section vidéos publicitaires **RAMIpublicités**,
- une connexion obligatoire avant de jouer, via **Google** ou **compte local** (email/mot de passe),
- le nom du propriétaire affiché en pied de page : **Rami Garouachi — Ariana, Tunisie**.

Domaine prévu : **RamiGame.gr.com**

## Structure du projet
```
ramigame/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
└── app/
    ├── Dockerfile
    ├── server.js
    ├── package.json
    ├── data/ (games.js, ads.js)
    ├── views/ (index, login, register, jouer)
    └── public/css/style.css
```

---

## 1) Prérequis (Ubuntu Desktop)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # puis déconnectez-vous/reconnectez-vous
```

Vérifiez :
```bash
docker --version
docker compose version
```

---

## 2) Obtenir vos identifiants Google OAuth (optionnel mais recommandé)

1. Allez sur https://console.cloud.google.com/
2. Créez un projet, puis allez dans **APIs & Services > Credentials**.
3. Cliquez **Create Credentials > OAuth client ID**.
4. Type d'application : **Web application**.
5. Dans **Authorized redirect URIs**, ajoutez :
   - Pour test local : `http://localhost:3000/auth/google/callback`
   - Pour production : `https://RamiGame.gr.com/auth/google/callback`
6. Copiez le **Client ID** et le **Client Secret** générés.

Si vous ne configurez pas Google, le bouton "Se connecter avec Google" est simplement masqué : la connexion par compte local (email/mot de passe) fonctionne normalement.

---

## 3) Configuration

```bash
cd ramigame
cp .env.example .env
nano .env
```

Remplissez `SESSION_SECRET`, et éventuellement `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

---

## 4) Tester en local

Pour un test local simple (sans nginx, accès direct) :

```bash
docker compose up --build web
```

Ouvrez ensuite : **http://localhost:3000**

- Créez un compte via "S'inscrire", ou connectez-vous avec Google si configuré.
- Cliquez sur "Jouer" sur un jeu : si vous n'êtes pas connecté, vous êtes redirigé vers la connexion.

Pour arrêter :
```bash
docker compose down
```

Pour tester aussi le reverse proxy nginx en local (optionnel) :
```bash
docker compose up --build
```
Puis ouvrez **http://localhost** (port 80). Dans ce cas mettez `SITE_URL=http://localhost` dans `.env`
et l'URI de callback Google `http://localhost/auth/google/callback`.

---

## 5) Héberger sur Internet avec le domaine RamiGame.gr.com

### a) Louer un serveur (VPS)
Prenez un VPS Ubuntu (OVH, Hostinger, DigitalOcean, Contabo…) avec une **IP publique fixe**.

### b) Configurer le DNS du domaine
Chez votre registrar (là où vous avez pris `RamiGame.gr.com`), créez :
- un enregistrement **A** : `RamiGame.gr.com` → IP de votre VPS
- un enregistrement **A** : `www.RamiGame.gr.com` → IP de votre VPS

Attendez la propagation DNS (quelques minutes à quelques heures). Vérifiez avec :
```bash
ping RamiGame.gr.com
```

### c) Installer Docker sur le VPS
Même procédure que l'étape 1 (Docker + docker compose) sur le VPS.

### d) Copier le projet sur le VPS
Depuis votre machine Ubuntu :
```bash
scp -r ramigame utilisateur@IP_DU_VPS:/home/utilisateur/
```
Ou via un dépôt Git si vous en utilisez un.

### e) Configurer le `.env` pour la production
Sur le VPS :
```bash
cd ramigame
cp .env.example .env
nano .env
```
Mettez :
```
SITE_URL=https://RamiGame.gr.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SESSION_SECRET=une_valeur_longue_et_aleatoire
```

### f) Ouvrir les ports du pare-feu
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow OpenSSH
sudo ufw enable
```

### g) Démarrer les conteneurs
```bash
docker compose up -d --build
```

À ce stade, `http://RamiGame.gr.com` doit déjà répondre (nginx sert le site en HTTP, sans SSL).

### h) Obtenir le certificat HTTPS (Let's Encrypt / certbot)
```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d RamiGame.gr.com -d www.RamiGame.gr.com \
  --email votre-email@example.com --agree-tos --no-eff-email
```

Puis :
1. Ouvrez `nginx/nginx.conf`, décommentez le bloc `server { listen 443 ssl; ... }` en bas du fichier,
   et décommentez la ligne `return 301 https://$host$request_uri;` dans le bloc port 80.
2. Redémarrez nginx :
```bash
docker compose restart nginx
```

Votre site est maintenant accessible en HTTPS : **https://RamiGame.gr.com**

Le service `certbot` du `docker-compose.yml` renouvelle automatiquement le certificat toutes les 12h (vérification interne), donc aucune action manuelle n'est requise ensuite.

---

## 6) Commandes utiles

```bash
docker compose ps                 # état des conteneurs
docker compose logs -f web        # logs de l'application
docker compose down               # arrêter tout
docker compose up -d --build      # reconstruire et relancer en arrière-plan
```

---

## 7) Personnalisation

- **Jeux** : modifiez `app/data/games.js` pour changer les titres, catégories, images ou liens réels de vos jeux.
- **Publicités** : modifiez `app/data/ads.js` pour remplacer les vidéos d'exemple par vos vraies vidéos RAMIpublicités (fichiers `.mp4` hébergés sur votre serveur ou un CDN).
- **Propriétaire / footer** : modifiez l'objet `SITE_INFO` dans `app/server.js`.

## 8) Notes de sécurité pour la production

- La base d'utilisateurs actuelle utilise un fichier JSON (`lowdb`) : suffisant pour démarrer, mais pour un site à fort trafic, migrez vers PostgreSQL/MySQL.
- Changez impérativement `SESSION_SECRET` par une valeur longue et aléatoire en production.
- Ne committez jamais votre fichier `.env` (il est déjà ignoré par `.gitignore`).
