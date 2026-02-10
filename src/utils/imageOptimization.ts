/**
 * Image Optimization Utility
 * Optimise les images: compression, lazy loading, formats WebP
 */

/**
 * Génère un WebP thumbnail pour lazy loading
 * @param {string} imagePath - Chemin de l'image
 * @returns {string} - URL optimisée
 */
export const getOptimizedImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // Si c'est déjà une URL optimisée, retourner
  if (imagePath.includes('?') || imagePath.includes('#')) {
    return imagePath;
  }

  // Ajouter les paramètres d'optimisation pour Vite
  return `${imagePath}?format=webp&quality=80&fit=contain`;
};

/**
 * Crée une image responsive avec srcset
 * @param {string} imagePath - Chemin de l'image
 * @returns {object} - { src, srcSet }
 */
export const getResponsiveImageProps = (imagePath) => {
  if (!imagePath) return { src: '', srcSet: '' };

  const basePath = imagePath.split('?')[0]; // Enlever les params existants

  return {
    src: `${basePath}?format=webp&quality=80&w=800`,
    srcSet: `
      ${basePath}?format=webp&quality=80&w=400 400w,
      ${basePath}?format=webp&quality=80&w=800 800w,
      ${basePath}?format=webp&quality=80&w=1200 1200w
    `.trim(),
    sizes: '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
};

/**
 * Génère une image placeholder flou pour LQIP (Low Quality Image Placeholder)
 * @param {string} imagePath
 * @returns {string}
 */
export const getPlaceholderImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${imagePath}?format=webp&quality=10&w=50&blur=15`;
};

/**
 * Précharge une image (pour optimisation critique)
 * @param {string} imagePath
 */
export const preloadImage = (imagePath) => {
  if (!imagePath) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(imagePath);
  link.imagesrcset = getResponsiveImageProps(imagePath).srcSet;
  document.head.appendChild(link);
};

/**
 * Cache des images chargées
 */
const imageCache = new Map();

/**
 * Précharge une liste d'images pour la performance
 * @param {array} imagePaths - Liste des chemins d'images
 */
export const preloadImages = (imagePaths = []) => {
  imagePaths.forEach((path) => {
    if (!imageCache.has(path)) {
      const img = new Image();
      img.src = getOptimizedImageUrl(path);
      imageCache.set(path, img);
    }
  });
};

/**
 * Obtient une image cachée
 * @param {string} imagePath
 * @returns {Image | null}
 */
export const getCachedImage = (imagePath) => {
  return imageCache.get(imagePath) || null;
};

export default {
  getOptimizedImageUrl,
  getResponsiveImageProps,
  getPlaceholderImageUrl,
  preloadImage,
  preloadImages,
  getCachedImage,
};
