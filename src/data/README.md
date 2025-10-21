# GeoJSON Data Structure Guide

This directory contains GeoJSON files for Cameroon's administrative boundaries and mock election data.

## Required Files

### 1. cameroon-regions.geojson (ADM1)
GeoJSON file containing all 10 regions of Cameroon.

**Expected structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "shapeName": "Adamawa",
        "shapeID": "CMR-ADM1-01",
        "shapeGroup": "CMR",
        "shapeType": "ADM1"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

### 2. cameroon-departments.geojson (ADM2)
GeoJSON file containing all 58 departments of Cameroon.

**Expected structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "shapeName": "Vina",
        "shapeID": "CMR-ADM2-01",
        "regionId": "Adamawa",
        "shapeGroup": "CMR",
        "shapeType": "ADM2"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

### 3. cameroon-arrondissements.geojson (ADM3)
GeoJSON file containing all ~360 arrondissements of Cameroon.

**Expected structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "shapeName": "Belel",
        "shapeID": "CMR-ADM3-001",
        "departmentId": "Vina",
        "regionId": "Adamawa",
        "shapeGroup": "CMR",
        "shapeType": "ADM3"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

### 4. voting-centers.json
Mock election data for voting centers.

**Structure:**
```json
[
  {
    "arrondissementId": "Belel",
    "centerId": "vc001",
    "name": "Centre de Vote 1",
    "coords": [9.5, 13.8],
    "stats": {
      "totalVotes": 1000,
      "candidates": [
        {
          "name": "Candidate A",
          "party": "Party X",
          "votes": 600,
          "percentage": 60
        },
        {
          "name": "Candidate B",
          "party": "Party Y",
          "votes": 400,
          "percentage": 40
        }
      ]
    }
  }
]
```

## Data Sources

### GeoJSON Boundaries
Download from **www.geoboundaries.org**:
1. Search for "Cameroon"
2. Download shapefiles for:
   - ADM0 (country outline)
   - ADM1 (regions)
   - ADM2 (departments)
   - ADM3 (arrondissements)

### Converting Shapefiles to GeoJSON

**Using ogr2ogr (command line):**
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 cameroon-regions.geojson input.shp
```

**Using mapshaper.org (online):**
1. Go to https://mapshaper.org
2. Upload your .shp file (with .shx, .dbf, .prj files)
3. Simplify if needed (for performance)
4. Export as GeoJSON

## Property Naming Conventions

The MapView component expects these property names:
- `shapeName` - The display name (e.g., "Adamawa", "Vina")
- `shapeID` - Unique identifier
- `regionId` - Parent region name (for departments and arrondissements)
- `departmentId` - Parent department name (for arrondissements)

If your GeoJSON uses different property names, update the component or transform your data to match.

## Performance Tips

1. **Simplify geometries**: Large GeoJSON files can slow down rendering. Use mapshaper to simplify:
   ```
   Simplify > 10% or visually-weighted
   ```

2. **File size targets**:
   - Regions: < 500 KB
   - Departments: < 1 MB
   - Arrondissements: < 2 MB

3. **Coordinate precision**: Reduce to 4-5 decimal places (sufficient for visualization)
