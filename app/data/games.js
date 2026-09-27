// data/games.js
// Génère une liste de 100 jeux gratuits (catalogue de démonstration).
// Chaque jeu a : id, titre, catégorie, image (placeholder), lien externe.
// -> Remplacez "external" par vos propres liens/iframes de jeux réels si besoin.

const categories = [
  'Action', 'Aventure', 'Arcade', 'Puzzle', 'Course',
  'Sport', 'Stratégie', 'Tir', 'Plateforme', 'Multijoueur'
];

// Icône dédiée (SVG) pour chaque catégorie, servie depuis /public/icons/
const categoryIcons = {
  'Action': '/icons/action.svg',
  'Aventure': '/icons/aventure.svg',
  'Arcade': '/icons/arcade.svg',
  'Puzzle': '/icons/puzzle.svg',
  'Course': '/icons/course.svg',
  'Sport': '/icons/sport.svg',
  'Stratégie': '/icons/strategie.svg',
  'Tir': '/icons/tir.svg',
  'Plateforme': '/icons/plateforme.svg',
  'Multijoueur': '/icons/multijoueur.svg'
};

const noms = [
  'Dragon Quest', 'Space Runner', 'Block Puzzle', 'Moto Race', 'Zombie Attack',
  'Ninja Jump', 'City Builder', 'Sniper Elite', 'Cube Master', 'Speed Drift',
  'Castle Defense', 'Fruit Slicer', 'Sky Fighter', 'Maze Escape', 'Robot War',
  'Chess Master', 'Football Cup', 'Basket Star', 'Tank Battle', 'Pirate Island',
  'Farm Life', 'Candy Match', 'Word Hunt', 'Sudoku Pro', 'Card Duel',
  'Bubble Pop', 'Jungle Run', 'Ice Slide', 'Fire Escape', 'Star Blaster',
  'Puzzle Quest', 'Bike Stunt', 'Car Parking', 'Truck Driver', 'Air Combat',
  'Sea Battle', 'Golf Champion', 'Tennis Pro', 'Boxing King', 'Wrestling Star',
  'Monster Hunt', 'Alien Invasion', 'Galaxy War', 'Treasure Hunt', 'Gold Miner',
  'Snake Classic', 'Tetris Fun', 'Pac Adventure', 'Frog Jump', 'Ball Bounce'
];

const games = [];
let id = 1;
for (let i = 0; i < 100; i++) {
  const baseName = noms[i % noms.length];
  const suffix = i >= noms.length ? ` ${Math.floor(i / noms.length) + 1}` : '';
  const titre = baseName + suffix;
  const cat = categories[i % categories.length];
  games.push({
    id: id++,
    titre,
    categorie: cat,
    image: categoryIcons[cat],
    // Lien de démonstration : recherche du jeu sur une plateforme externe de jeux gratuits.
    // A remplacer par vos propres jeux hébergés / iframes si vous en avez.
    external: `https://www.crazygames.com/search?q=${encodeURIComponent(baseName)}`
  });
}

module.exports = games;
