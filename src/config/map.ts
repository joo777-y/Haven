/**
 * Map configuration for HAVEN Location Intelligence.
 *
 * Architecture:
 * - Renderer: MapLibre GL JS (open-source WebGL client renderer)
 * - Tile / Style Provider: CARTO Basemaps Vector GL Styles (free, open, no private API key required)
 * - Coordinates convention: [longitude, latitude] (GeoJSON standard used by MapLibre)
 */

export const MAP_CONFIG = {
  // Primary luxury editorial style: CARTO Positron (clean, minimal architectural aesthetic)
  defaultStyle: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",

  // Alternative high-contrast dark style: CARTO Dark Matter
  darkStyle: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",

  // Default camera zoom level for single property detail inspection
  defaultPropertyZoom: 15,

  // Default camera zoom level for multi-property catalog / city view
  defaultCatalogZoom: 12,

  // Constraints
  minZoom: 2,
  maxZoom: 18,

  // Default geographic fallback center: [lng, lat]
  defaultCenter: [31.2357, 30.0444] as [number, number],
} as const;
