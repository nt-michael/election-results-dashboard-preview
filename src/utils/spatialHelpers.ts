import type { GeoJsonObject, FeatureCollection, Feature, Position } from 'geojson';

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
function pointInPolygon(point: Position, polygon: Position[]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Get the center point (centroid) of a polygon
 */
function getPolygonCentroid(coordinates: Position[][]): Position {
  // Use the first ring (exterior ring) of the polygon
  const ring = coordinates[0];

  let sumX = 0;
  let sumY = 0;
  const count = ring.length - 1; // Exclude the closing point

  for (let i = 0; i < count; i++) {
    sumX += ring[i][0];
    sumY += ring[i][1];
  }

  return [sumX / count, sumY / count];
}

/**
 * Get centroid of a feature
 */
export function getFeatureCentroid(feature: Feature): Position | null {
  if (!feature.geometry) return null;

  const geometry = feature.geometry;

  switch (geometry.type) {
    case 'Polygon':
      return getPolygonCentroid(geometry.coordinates);

    case 'MultiPolygon':
      // Return centroid of the first (usually largest) polygon
      return getPolygonCentroid(geometry.coordinates[0]);

    case 'Point':
      return geometry.coordinates as Position;

    default:
      return null;
  }
}

/**
 * Check if a point is inside a feature's geometry
 */
export function isPointInFeature(point: Position, feature: Feature): boolean {
  if (!feature.geometry) return false;

  const geometry = feature.geometry;

  switch (geometry.type) {
    case 'Polygon':
      // Check exterior ring (first array)
      return pointInPolygon(point, geometry.coordinates[0]);

    case 'MultiPolygon':
      // Check if point is in any of the polygons
      return geometry.coordinates.some(polygon =>
        pointInPolygon(point, polygon[0])
      );

    default:
      return false;
  }
}

/**
 * Find all features (children) whose centroids are within a parent feature
 */
export function getFeaturesWithinParent(
  childrenGeoJSON: GeoJsonObject,
  parentFeature: Feature
): Feature[] {
  if (!childrenGeoJSON || childrenGeoJSON.type !== 'FeatureCollection') {
    return [];
  }

  const featureCollection = childrenGeoJSON as FeatureCollection;
  const childrenWithinParent: Feature[] = [];

  featureCollection.features.forEach((childFeature) => {
    const centroid = getFeatureCentroid(childFeature);

    if (centroid && isPointInFeature(centroid, parentFeature)) {
      childrenWithinParent.push(childFeature);
    }
  });

  return childrenWithinParent;
}

/**
 * Get departments within a specific region
 */
export function getDepartmentsInRegion(
  departmentsGeoJSON: GeoJsonObject,
  regionFeature: Feature
): Feature[] {
  return getFeaturesWithinParent(departmentsGeoJSON, regionFeature);
}

/**
 * Get arrondissements within a specific department
 */
export function getArrondissementsInDepartment(
  arrondissementsGeoJSON: GeoJsonObject,
  departmentFeature: Feature
): Feature[] {
  return getFeaturesWithinParent(arrondissementsGeoJSON, departmentFeature);
}

/**
 * Find parent region for a given department
 */
export function findParentRegion(
  departmentName: string,
  departmentsGeoJSON?: GeoJsonObject,
  regionsGeoJSON?: GeoJsonObject
): string | null {
  if (!departmentsGeoJSON || departmentsGeoJSON.type !== 'FeatureCollection') return null;
  if (!regionsGeoJSON || regionsGeoJSON.type !== 'FeatureCollection') return null;

  const departmentCollection = departmentsGeoJSON as FeatureCollection;
  const regionCollection = regionsGeoJSON as FeatureCollection;

  // Find the department feature
  const departmentFeature = departmentCollection.features.find(
    (f) => f.properties?.shapeName === departmentName
  );

  if (!departmentFeature) return null;

  // Get department's centroid
  const departmentCentroid = getFeatureCentroid(departmentFeature);
  if (!departmentCentroid) return null;

  // Find which region contains this department's centroid
  const parentRegion = regionCollection.features.find((regionFeature) =>
    isPointInFeature(departmentCentroid, regionFeature)
  );

  return parentRegion?.properties?.shapeName || null;
}

/**
 * Find parent department for a given arrondissement
 */
export function findParentDepartment(
  arrondissementName: string,
  arrondissementsGeoJSON?: GeoJsonObject,
  departmentsGeoJSON?: GeoJsonObject
): string | null {
  if (!arrondissementsGeoJSON || arrondissementsGeoJSON.type !== 'FeatureCollection') return null;
  if (!departmentsGeoJSON || departmentsGeoJSON.type !== 'FeatureCollection') return null;

  const arrondissementCollection = arrondissementsGeoJSON as FeatureCollection;
  const departmentCollection = departmentsGeoJSON as FeatureCollection;

  // Find the arrondissement feature
  const arrondissementFeature = arrondissementCollection.features.find(
    (f) => f.properties?.shapeName === arrondissementName
  );

  if (!arrondissementFeature) return null;

  // Get arrondissement's centroid
  const arrondissementCentroid = getFeatureCentroid(arrondissementFeature);
  if (!arrondissementCentroid) return null;

  // Find which department contains this arrondissement's centroid
  const parentDepartment = departmentCollection.features.find((departmentFeature) =>
    isPointInFeature(arrondissementCentroid, departmentFeature)
  );

  return parentDepartment?.properties?.shapeName || null;
}
