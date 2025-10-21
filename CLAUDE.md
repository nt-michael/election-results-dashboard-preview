# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cameroon Election Results Visualization App** - A web application for visualizing and navigating election results in Cameroon at various administrative levels: Regions, Departments, Arrondissements, and Voting Centers (polling stations).

### Core Functionality

The app provides an intuitive **split-screen interface**:
- **Left half**: Interactive map (defaulting to an overview of Cameroon) that highlights selected areas
- **Right half**: Navigation controls (dropdowns for regions, departments, arrondissements) and detailed displays of voting centers with statistics (votes per candidate, party affiliations, percentages)

### Administrative Hierarchy

Cameroon's administrative structure (used for navigation):
- **10 Regions** → **58 Departments** → **~360 Arrondissements** → **Voting Centers**

Flow: Region > Department > Arrondissement > Voting Center

### Tech Stack

- React 19.1.1 with TypeScript
- Vite 7.x for build tooling and development server
- Babel plugin for React Compiler (experimental optimization)
- ESLint with TypeScript and React hooks configurations
- **Tailwind CSS 4.0+** for styling
- **react-leaflet 3.4+** and **leaflet 1.9+** for mapping
- GeoJSON data from www.geoboundaries.org for administrative boundaries

## Development Commands

### Start Development Server
```bash
npm run dev
```
Starts Vite dev server with HMR (Hot Module Replacement). The React Compiler is enabled and will impact dev performance.

### Build for Production
```bash
npm run build
```
First runs TypeScript compiler in build mode (`tsc -b`), then runs Vite build.

### Lint Code
```bash
npm run lint
```
Runs ESLint on all files. Configuration includes recommended rules for TypeScript, React hooks, and React refresh.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

## Architecture

### Planned Folder Structure

```
src/
├── components/
│   ├── MapView.tsx          // react-leaflet map, layers, highlights, markers
│   ├── SelectorPanel.tsx    // Chained dropdowns for region/dept/arrondissement
│   ├── ResultsDisplay.tsx   // List/table of voting centers with stats
│   ├── BreadcrumbNav.tsx    // Navigation trail (Region > Department > Arrondissement)
├── data/
│   ├── cameroon-regions.geojson     // ADM1 boundaries
│   ├── cameroon-departments.geojson // ADM2 boundaries
│   ├── cameroon-arrondissements.geojson // ADM3 boundaries
│   ├── voting-centers.json  // Mock election data
├── types/
│   ├── geo.types.ts         // TypeScript interfaces for GeoJSON, selections, voting data
├── App.tsx                  // Main split-screen layout (50/50)
├── main.tsx                 // Entry point (imports Leaflet CSS, Tailwind)
├── index.css                // Tailwind imports and custom theme
```

### Key Data Structures

**Selection State**:
```typescript
interface Selection {
  region: string | null;
  department: string | null;
  arrondissement: string | null;
}
```

**Voting Center Data**:
```typescript
interface VotingCenter {
  arrondissementId: string;
  centerId: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  stats: {
    totalVotes: number;
    candidates: Array<{
      name: string;
      party: string;
      votes: number;
      percentage: number;
    }>;
  };
}
```

### Build Configuration

- **TypeScript**: Uses project references with separate configs for app (`tsconfig.app.json`) and node/build tools (`tsconfig.node.json`)
- **Vite**: Configured with `@vitejs/plugin-react` and babel-plugin-react-compiler. Will need `@tailwindcss/vite` plugin added.
- **React Compiler**: Enabled via Babel plugin in [vite.config.ts](vite.config.ts#L8-L10). This experimental feature automatically optimizes React components but impacts build/dev performance.
- **Tailwind CSS 4.0**: Uses `@import "tailwindcss"` in CSS (no separate config file needed for basic setup). Custom theme via `@theme` directive if needed.

### Application Structure

- **Entry Point**: [src/main.tsx](src/main.tsx) - Renders root App, imports Leaflet CSS (`leaflet/dist/leaflet.css`) and Tailwind
- **Main Component**: [src/App.tsx](src/App.tsx) - Split-screen layout using Tailwind flex (`flex h-screen` with `w-1/2`)
- **Map Component**: MapView.tsx - Uses `<MapContainer>` from react-leaflet, default center `[6.0, 12.0]` (Cameroon), zoom 6
- **Styling**: Tailwind classes for layout, Leaflet for map controls
- **Assets**: GeoJSON files in `src/data/`, static assets in [public/](public/)

### ESLint Configuration

The project uses ESLint 9.x with flat config format ([eslint.config.js](eslint.config.js)):
- TypeScript recommended rules
- React hooks recommended-latest rules
- React refresh rules for Vite
- Ignores `dist` directory
- Targets ES2020 with browser globals

## Component Implementation Details

### MapView.tsx
- Uses `<MapContainer>` from react-leaflet
- Default center: `[6.0, 12.0]` (Cameroon), zoom: 6
- Add GeoJSON layers with `onEachFeature` for highlighting (change style on selection)
- Markers for voting centers with popups showing quick stats
- Interactive (zoom, pan), but reset highlights when changing selections

### SelectorPanel.tsx
- Chained dropdowns: Region → filter Departments → filter Arrondissements
- Use React Context or Zustand for shared state (selected region/dept/arrondissement)
- Include search functionality (type to filter) for large lists

### ResultsDisplay.tsx
- Table or card layout showing voting centers
- Columns: Name, Total Votes, Candidate Stats
- Visual elements: Progress bars using Tailwind (e.g., `bg-green-500 w-[60%]` for percentages)
- Display aggregate stats (Arrondissement-level totals) above the list

### BreadcrumbNav.tsx
- Shows current selection path: Region > Department > Arrondissement
- Allows backtracking by clicking previous levels

## Data Flow

1. **Load GeoJSON on app init** - Load all boundary files from `src/data/`
2. **On selection change**:
   - Filter GeoJSON layers for map rendering
   - Query voting center data for selected arrondissement
   - Update ResultsDisplay component
   - Highlight selected area on map and zoom appropriately
3. **Use `useMemo`** for map layers to optimize performance
4. **Lazy-load data** where possible

## Setup Requirements

### Dependencies to Install
```bash
npm install tailwindcss @tailwindcss/vite
npm install leaflet react-leaflet @types/react-leaflet
```

### GeoJSON Data Preparation
1. Download shapefiles from www.geoboundaries.org:
   - ADM0 (country outline)
   - ADM1 (Regions)
   - ADM2 (Departments)
   - ADM3 (Arrondissements)
2. Convert to GeoJSON using tools like `ogr2ogr` or mapshaper.org
3. Place in `src/data/` with descriptive names

### Mock Election Data
Create `src/data/voting-centers.json` with structure:
```json
[
  {
    "arrondissementId": "arr001",
    "centerId": "vc001",
    "name": "Voting Center 1",
    "coords": [10.123, 4.567],
    "stats": {
      "totalVotes": 1000,
      "candidates": [
        {"name": "Candidate A", "party": "Party X", "votes": 600, "percentage": 60},
        {"name": "Candidate B", "party": "Party Y", "votes": 400, "percentage": 40}
      ]
    }
  }
]
```

## User Stories & Features

### Map Navigation and Highlighting
- Default to full map view of Cameroon on load
- Select Region from dropdown → map highlights and zooms to Region
- Select Department → map highlights Department
- Select Arrondissement → map highlights and displays voting center markers
- Interactive map (zoom, pan) with reset on selection changes

### Election Results Display
- View list of all Voting Centers in selected Arrondissement
- Show stats: total votes, votes per candidate, party, percentages
- Click voting center marker on map → show detailed stats in popup
- Display aggregate Arrondissement-level totals above center list
- Visual elements: progress bars/charts for percentages

### User Interface
- Split-screen layout: 50/50 (map left, controls/results right)
- Breadcrumb navigation for backtracking
- Search within selectors for faster selection
- Loading states (spinners) when fetching data or rendering maps
- Dark mode support via Tailwind
- Responsive: desktop-optimized, mobile fallback to stacked layout

### Error Handling
- Display "No data available" for empty results
- Handle missing or invalid GeoJSON gracefully
- Loading states for async operations

## Performance Considerations

- Use `useMemo` for map layers to prevent unnecessary re-renders
- Optimize large GeoJSON files (simplify geometries if needed using mapshaper)
- Lazy-load voting center data until arrondissement selected
- Consider using React.lazy for code-splitting components

## Important Notes

- The React Compiler is an experimental feature that automatically optimizes components. See [React Compiler documentation](https://react.dev/learn/react-compiler) for details.
- The build process runs TypeScript compilation before Vite build, so type errors will fail the build.
- ESLint configuration can be extended with type-aware rules or additional React-specific plugins as documented in the README.
- **State Management**: Use React Context or Zustand for shared state across components (selected region/dept/arrond, filtered data)
- **Accessibility**: Add ARIA labels on selectors and map elements
- **Responsive Design**: Optimized for desktop split-screen, mobile should stack map and controls vertically

## Future Enhancements

- Integrate real election API (replace mock data)
- Add filters by candidate or party
- Mobile optimization and testing
- Authentication for admin/user-specific views
- Export results to CSV/PDF
- Historical election data comparison
- Real-time results updates (WebSocket integration)
