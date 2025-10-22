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
  votingCenters,
  regionsData,
  departmentsData,
  arrondissementsData,
  onRegionClick,
  onDepartmentClick,
  onArrondissementClick,
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

  // Memoize the style function for arrondissements
  const getArrondissementStyle = useMemo(() => {
    return (feature?: Feature): MapStyle => {
      if (!feature?.properties) return DEFAULT_STYLE;

      const arrondissementName = feature.properties.shapeName;
      const isSelected = selectedArrondissement === arrondissementName;
      const isHovered = hoveredFeature === arrondissementName;

      if (isSelected) return HIGHLIGHTED_STYLE;
      if (isHovered) return HOVER_STYLE;
      return DEFAULT_STYLE;
    };
  }, [selectedArrondissement, hoveredFeature]);

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

  // Event handlers for arrondissements
  const onEachArrondissement = (feature: Feature, layer: Layer) => {
    const arrondissementName = feature.properties?.shapeName;

    if (arrondissementName) {
      layer.on({
        mouseover: () => setHoveredFeature(arrondissementName),
        mouseout: () => setHoveredFeature(null),
        click: () => onArrondissementClick?.(arrondissementName),
      });

      layer.bindTooltip(arrondissementName, {
        permanent: false,
        direction: 'center',
        className: 'bg-gray-800 text-white px-2 py-1 rounded text-sm',
      });
    }

    // Don't zoom when arrondissement is selected - maintain department bounds
    // The map should stay at the department level view
  };

  // Reset bounds when nothing is selected (show whole country)
  useEffect(() => {
    if (!selectedRegion && !selectedDepartment && !selectedArrondissement) {
      setMapBounds(null);
    }
  }, [selectedRegion, selectedDepartment, selectedArrondissement]);

  // Determine which data to show based on selection hierarchy
  // CHANGED: Always show regions to maintain map clickability
  const shouldShowRegions = !selectedRegion;
  const shouldShowDepartments = !!selectedRegion; // Show departments when region is selected
  const shouldShowArrondissements = !!selectedDepartment; // Show arrondissements when department is selected
  const shouldShowVotingCenters = !!selectedArrondissement && votingCenters.length > 0;

  // Filter voting centers for the selected arrondissement
  const filteredVotingCenters = useMemo(() => {
    if (!selectedArrondissement) return [];
    return votingCenters.filter(
      (center) => center.arrondissementId === selectedArrondissement
    );
  }, [votingCenters, selectedArrondissement]);

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

        {/* Render departments when region is selected but no department */}
        {shouldShowDepartments && departmentsData && (
          <GeoJSON
            key={`departments-${selectedRegion}`}
            data={departmentsData}
            style={getDepartmentStyle}
            onEachFeature={onEachDepartment}
            filter={(feature) => {
              console.log(feature);
              // Filter departments by selected region
              // This assumes your GeoJSON has a regionId or similar property
              return true; // Adjust based on your data structure
            }}
          />
        )}

        {/* Render arrondissements when department is selected */}
        {shouldShowArrondissements && arrondissementsData && (
          <GeoJSON
            key={`arrondissements-${selectedDepartment}`}
            data={arrondissementsData}
            style={getArrondissementStyle}
            onEachFeature={onEachArrondissement}
            filter={(feature) => {
              console.log(feature);
              // Filter arrondissements by selected department
              // Adjust based on your data structure
              return true;
            }}
          />
        )}

        {/* Render voting center markers */}
        {shouldShowVotingCenters &&
          filteredVotingCenters.map((center) => (
            <Marker key={center.centerId} position={center.coords}>
              <Popup className="min-w-64">
                <div className="p-2">
                  <h3 className="font-bold text-base mb-2">{center.name}</h3>
                  <div className="text-sm mb-2">
                    <span className="font-semibold">Total Votes:</span>{' '}
                    {center.stats.totalVotes.toLocaleString()}
                  </div>
                  <div className="space-y-1">
                    {center.stats.candidates.map((candidate, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{candidate.name}</span>
                          <span className="text-gray-600">
                            {candidate.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${candidate.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {candidate.party} - {candidate.votes.toLocaleString()} votes
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

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
