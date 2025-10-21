const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage forcé des routes problématiques...');

// Routes à supprimer
const problematicRoutes = [
  'app/robots.txt',
  'app/manifest.webmanifest',
  'app/api'
];

problematicRoutes.forEach(route => {
  const routePath = path.join(process.cwd(), route);
  if (fs.existsSync(routePath)) {
    fs.rmSync(routePath, { recursive: true, force: true });
    console.log(`✅ Supprimé: ${route}`);
  }
});

// Supprimer le cache de build
const cacheDirs = ['.next', '.turbo'];
cacheDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Cache supprimé: ${dir}`);
  }
});

console.log('🎉 Nettoyage terminé!');