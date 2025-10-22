/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import type { Layer, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import {
  type VotingCenter,
  DEFAULT_STYLE,
  HIGHLIGHTED_STYLE,
  HOVER_STYLE,
  type MapStyle,
} from '../types/geo.types';
import { getFeatureCentroid } from '../utils/spatialHelpers';

// Fix for default marker icons in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  selectedRegion: string | null;
  selectedDepartment: string | null;
  selectedArrondissement: string | null;
  votingCenters: VotingCenter[];
  regionsData?: GeoJsonObject;
  departmentsData?: GeoJsonObject;
  arrondissementsData?: GeoJsonObject;
  onRegionClick?: (regionName: string) => void;
  onDepartmentClick?: (departmentName: string) => void;
  onArrondissementClick?: (arrondissementName: string) => void;
}

// Component to handle map viewport changes
function MapController({
  bounds,
  shouldFit,
  defaultCenter,
  defaultZoom
}: {
  bounds: LatLngBounds | null;
  shouldFit: boolean;
  defaultCenter: [number, number];
  defaultZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds && shouldFit) {
      // Zoom to specific bounds (region or department)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } else if (!bounds && !shouldFit) {
      // Reset to default Cameroon view
      map.setView(defaultCenter, defaultZoom);
    }
  }, [bounds, shouldFit, map, defaultCenter, defaultZoom]);

  return null;
}

export default function MapView({
  selectedRegion,
  selectedDepartment,
  selectedArrondissement,
  regionsData,
  departmentsData,
  onRegionClick,
  onDepartmentClick,
}: MapViewProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  // Cameroon default view - centered and zoomed on the country
  const defaultCenter: [number, number] = [7.3697, 12.3547]; // Cameroon center
  const defaultZoom = 7;

  // Memoize the style function for regions
  const getRegionStyle = useMemo(() => {
    return (feature?: Feature): MapStyle => {
      if (!feature?.properties) return DEFAULT_STYLE;

      const regionName = feature.properties.shapeName;
      const isSelected = selectedRegion === regionName;
      const isHovered = hoveredFeature === regionName;

      if (isSelected) return HIGHLIGHTED_STYLE;
      if (isHovered) return HOVER_STYLE;
      return DEFAULT_STYLE;
    };
  }, [selectedRegion, hoveredFeature]);

  // Memoize the style function for departments
  const getDepartmentStyle = useMemo(() => {
    return (feature?: Feature): MapStyle => {
      if (!feature?.properties) return DEFAULT_STYLE;

      const departmentName = feature.properties.shapeName;
      const isSelected = selectedDepartment === departmentName;
      const isHovered = hoveredFeature === departmentName;

      if (isSelected) return HIGHLIGHTED_STYLE;
      if (isHovered) return HOVER_STYLE;
      return DEFAULT_STYLE;
    };
  }, [selectedDepartment, hoveredFeature]);


  // Event handlers for regions
  const onEachRegion = (feature: Feature, layer: Layer) => {
    const regionName = feature.properties?.shapeName;

    if (regionName) {
      layer.on({
        mouseover: () => setHoveredFeature(regionName),
        mouseout: () => setHoveredFeature(null),
        click: () => onRegionClick?.(regionName),
      });

      layer.bindTooltip(regionName, {
        permanent: false,
        direction: 'center',
        className: 'bg-gray-800 text-white px-2 py-1 rounded text-sm',
      });
    }

    // Update bounds when a region is selected
    if (selectedRegion === regionName) {
      const bounds = (layer as any).getBounds();
      if (bounds) {
        setMapBounds(bounds);
      }
    }
  };

  // Event handlers for departments
  const onEachDepartment = (feature: Feature, layer: Layer) => {
    const departmentName = feature.properties?.shapeName;

    if (departmentName) {
      layer.on({
        mouseover: () => setHoveredFeature(departmentName),
        mouseout: () => setHoveredFeature(null),
        click: () => onDepartmentClick?.(departmentName),
      });

      layer.bindTooltip(departmentName, {
        permanent: false,
        direction: 'center',
        className: 'bg-gray-800 text-white px-2 py-1 rounded text-sm',
      });
    }

    // Update bounds when a department is selected
    if (selectedDepartment === departmentName) {
      const bounds = (layer as any).getBounds();
      if (bounds) {
        setMapBounds(bounds);
      }
    }
  };


  // Reset bounds when nothing is selected (show whole country)
  useEffect(() => {
    if (!selectedRegion && !selectedDepartment && !selectedArrondissement) {
      setMapBounds(null);
    }
  }, [selectedRegion, selectedDepartment, selectedArrondissement]);

  // Determine which data to show based on selection hierarchy
  // Map navigation stops at ADM2 (departments) level
  const shouldShowRegions = !selectedRegion;
  const shouldShowDepartments = !!selectedRegion; // Show departments when region is selected

  // Calculate marker position for selected region or department
  const markerPosition = useMemo(() => {
    if (selectedDepartment && departmentsData) {
      // Find department feature and get its centroid
      const deptFeatures = (departmentsData as any).features || [];
      const deptFeature = deptFeatures.find(
        (f: any) => f.properties?.shapeName === selectedDepartment
      );
      if (deptFeature) {
        const centroid = getFeatureCentroid(deptFeature);
        if (centroid) return [centroid[1], centroid[0]] as [number, number]; // [lat, lng]
      }
    } else if (selectedRegion && regionsData) {
      // Find region feature and get its centroid
      const regionFeatures = (regionsData as any).features || [];
      const regionFeature = regionFeatures.find(
        (f: any) => f.properties?.shapeName === selectedRegion
      );
      if (regionFeature) {
        const centroid = getFeatureCentroid(regionFeature);
        if (centroid) return [centroid[1], centroid[0]] as [number, number]; // [lat, lng]
      }
    }
    return null;
  }, [selectedRegion, selectedDepartment, regionsData, departmentsData]);

  return (
    <div className="h-screen">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        {/* Satellite imagery base layer */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Labels overlay */}
        <TileLayer
          attribution=''
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Render regions when no region is selected */}
        {shouldShowRegions && regionsData && (
          <GeoJSON
            key="regions"
            data={regionsData}
            style={getRegionStyle}
            onEachFeature={onEachRegion}
          />
        )}

        {/* Render departments when region is selected */}
        {shouldShowDepartments && departmentsData && (
          <GeoJSON
            key={`departments-${selectedRegion}`}
            data={departmentsData}
            style={getDepartmentStyle}
            onEachFeature={onEachDepartment}
          />
        )}

        {/* Marker for selected region or department */}
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              <div className="!p-2">
                <h3 className="font-bold text-base !mb-2">
                  {selectedDepartment || selectedRegion}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDepartment ? 'Department' : 'Region'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Map controller for handling zoom/pan to selected areas */}
        <MapController
          bounds={mapBounds}
          shouldFit={mapBounds !== null}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        />
      </MapContainer>
    </div>
  );
}
