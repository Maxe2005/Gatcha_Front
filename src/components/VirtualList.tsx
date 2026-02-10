import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Box } from '@mui/material';

/**
 * VirtualList Component
 * Affiche des listes longues sans lag en ne rendant que les éléments visibles
 * Utilise "windowing" technique pour perfor> maximale
 *
 * Props:
 * - items: Array des éléments à afficher
 * - itemHeight: Hauteur fixe de chaque élément (px)
 * - children: Fonction de rendu (item, index) => React.ReactNode
 * - containerHeight: Hauteur du conteneur (px, default: '500px')
 * - overscan: Nombre d'items à pré-rendre hors écran (default: 3)
 *
 * Exemple:
 * <VirtualList items={monsters} itemHeight={80} containerHeight="600px">
 *   {(monster) => <MonsterCard monster={monster} />}
 * </VirtualList>
 */
const VirtualList = ({
  items = [],
  itemHeight,
  children,
  containerHeight = '500px',
  overscan = 3,
  sx = {},
}) => {
  const scrollContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculer les indices visibles
  const visibleRange = useMemo(() => {
    const containerHeightNum = parseInt(containerHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeightNum) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Handler de scroll optimisé avec debounce
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Éléments à rendre
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [visibleRange, items]);

  // Hauteur totale du scroll
  const totalHeight = items.length * itemHeight;

  // Offset du premier élément visible
  const offsetY =
    Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) * itemHeight;

  return (
    <Box
      ref={scrollContainerRef}
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        width: '100%',
        position: 'relative',
        ...sx,
      }}
    >
      {/* Spacer pour maintenir le scroll height correct */}
      <Box
        sx={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        {/* Container des éléments visibles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
            width: '100%',
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <Box key={`${index}`} sx={{ height: `${itemHeight}px` }}>
              {children(item, index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualList;
