import type { GeoJsonObject, FeatureCollection, Feature } from 'geojson';
import type { SelectOption } from '../components/SearchableSelect';
import { getDepartmentsInRegion, getArrondissementsInDepartment } from './spatialHelpers';

/**
 * Extract unique administrative units from GeoJSON data
 */
export function extractRegionsFromGeoJSON(geoJson?: GeoJsonObject): SelectOption[] {
  if (!geoJson || geoJson.type !== 'FeatureCollection') return [];

  const featureCollection = geoJson as FeatureCollection;
  const regions = new Set<string>();

  featureCollection.features.forEach((feature) => {
    const shapeName = feature.properties?.shapeName;
    if (shapeName) {
      regions.add(shapeName);
    }
  });

  return Array.from(regions)
    .sort()
    .map((name) => ({
      value: name,
      label: name,
    }));
}

/**
 * Extract departments filtered by selected region using spatial containment
 */
export function extractDepartmentsFromGeoJSON(
  departmentsGeoJson?: GeoJsonObject,
  selectedRegion?: string | null,
  regionsGeoJson?: GeoJsonObject
): SelectOption[] {
  if (!departmentsGeoJson || departmentsGeoJson.type !== 'FeatureCollection') return [];
  if (!selectedRegion) return [];

  // Find the selected region feature
  const regionFeature = getFeatureByName(regionsGeoJson, selectedRegion);
  if (!regionFeature) {
    // Fallback: return all departments if region not found
    console.warn(`Region "${selectedRegion}" not found in GeoJSON`);
    return [];
  }

  // Get departments within the region using spatial filtering
  const departmentsInRegion = getDepartmentsInRegion(departmentsGeoJson, regionFeature);

  return departmentsInRegion
    .map((feature) => ({
      value: feature.properties?.shapeName || '',
      label: `${feature.properties?.shapeName || ''} (ID: ${feature.properties?.shapeID || 'N/A'})`,
    }))
    .filter((opt) => opt.value)
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Extract arrondissements filtered by selected department using spatial containment
 */
export function extractArrondissementsFromGeoJSON(
  arrondissementsGeoJson?: GeoJsonObject,
  selectedDepartment?: string | null,
  departmentsGeoJson?: GeoJsonObject
): SelectOption[] {
  if (!arrondissementsGeoJson || arrondissementsGeoJson.type !== 'FeatureCollection') return [];
  if (!selectedDepartment) return [];

  // Find the selected department feature
  const departmentFeature = getFeatureByName(departmentsGeoJson, selectedDepartment);
  if (!departmentFeature) {
    // Fallback: return empty if department not found
    console.warn(`Department "${selectedDepartment}" not found in GeoJSON`);
    return [];
  }

  // Get arrondissements within the department using spatial filtering
  const arrondissementsInDepartment = getArrondissementsInDepartment(
    arrondissementsGeoJson,
    departmentFeature
  );

  return arrondissementsInDepartment
    .map((feature) => ({
      value: feature.properties?.shapeName || '',
      label: `${feature.properties?.shapeName || ''} (ID: ${feature.properties?.shapeID || 'N/A'})`,
    }))
    .filter((opt) => opt.value)
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Get feature from GeoJSON by name
 */
export function getFeatureByName(
  geoJson?: GeoJsonObject,
  name?: string | null
): Feature | null {
  if (!geoJson || geoJson.type !== 'FeatureCollection' || !name) return null;

  const featureCollection = geoJson as FeatureCollection;
  return (
    featureCollection.features.find(
      (feature) => feature.properties?.shapeName === name
    ) || null
  );
}

/**
 * Calculate bounds for a given feature
 */
export function getFeatureBounds(feature: Feature): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (!feature.geometry) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const processCoordinates = (coords: any) => {
    if (typeof coords[0] === 'number') {
      // Single coordinate pair [lng, lat]
      const [lng, lat] = coords;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    } else {
      // Nested array of coordinates
      coords.forEach(processCoordinates);
    }
  };

  if (feature.geometry.type === 'Point') {
    const [lng, lat] = feature.geometry.coordinates as [number, number];
    return { minLat: lat, maxLat: lat, minLng: lng, maxLng: lng };
  }

  processCoordinates((feature.geometry as any).coordinates);

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
  };
}

/**
 * Count administrative units
 */
export function countAdministrativeUnits(geoJson?: GeoJsonObject): number {
  if (!geoJson || geoJson.type !== 'FeatureCollection') return 0;
  return (geoJson as FeatureCollection).features.length;
}

/**
 * Validate GeoJSON structure
 */
export function validateGeoJSON(geoJson: any): boolean {
  if (!geoJson) return false;
  if (geoJson.type !== 'FeatureCollection') return false;
  if (!Array.isArray(geoJson.features)) return false;

  // Check that at least one feature has the expected properties
  return geoJson.features.some(
    (feature: any) =>
      feature.properties &&
      (feature.properties.shapeName || feature.properties.name)
  );
}
