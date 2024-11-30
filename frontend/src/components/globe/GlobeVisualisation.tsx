import React, { useEffect, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface CountryProperties {
  ADMIN: string;
  ISO_A2: string;
  POP_EST: number;
}

interface CountryFeature {
  type: string;
  properties: CountryProperties;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GlobeVisualizationProps {
  onCountrySelect?: (countryName: string, countryCode: string) => void;
  selectedCountry?: string | null;
}

interface ClickPopupState {
  country: string;
  screenPosition: { x: number; y: number };
  visible: boolean;
}

// Get country center coordinates
const getCountryCoordinates = (geometry: any): [number, number] => {
  let totalLat = 0;
  let totalLon = 0;
  let points = 0;

  const processCoordinates = (coords: number[]) => {
    totalLon += coords[0];
    totalLat += coords[1];
    points++;
  };

  const processPolygon = (coordinates: any[]) => {
    coordinates[0].forEach(processCoordinates);
  };

  if (geometry.type === 'Polygon') {
    processPolygon(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(processPolygon);
  }

  return [totalLat / points, totalLon / points];
};

const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
};

const generateCountryColor = (countryId: string): string => {
  const random = seededRandom(countryId);
  const hue = Math.floor(random * 360);
  const saturation = 70 + (seededRandom(countryId + '1') * 30);
  const lightness = 45 + (seededRandom(countryId + '2') * 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({
  onCountrySelect,
  selectedCountry
}) => {
  const globeRef = useRef<GlobeMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  const [clickPopup, setClickPopup] = useState<ClickPopupState>({
    country: '',
    screenPosition: { x: 0, y: 0 },
    visible: false
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: parent.clientHeight
          });
        }
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setCountries(data.features.filter((d: CountryFeature) => d.properties.ISO_A2 !== 'AQ'));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading country data:', error);
        setLoading(false);
      });
  }, []);

  const focusOnCountry = (countryFeature: CountryFeature) => {
    if (!globeRef.current) return;

    const [lat, lon] = getCountryCoordinates(countryFeature.geometry);

    globeRef.current.pointOfView({
      lat,
      lng: lon,
      altitude: 1.75
    }, 1000);
  };

  const handleCountryClick = (polygon: any, event: any) => {
    if (!polygon || !event) return;

    const coordinates = { x: event.clientX, y: event.clientY };

    setClickPopup({
      country: polygon.properties.ADMIN,
      screenPosition: coordinates,
      visible: true
    });

    // Focus globe on selected country
    focusOnCountry(polygon);

    // Notify parent component
    if (onCountrySelect) {
      onCountrySelect(
        polygon.properties.ADMIN,
        polygon.properties.ISO_A2
      );
    }

    // Hide popup after delay
    setTimeout(() => {
      setClickPopup(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  const getPolygonAltitude = (obj: object) => {
    const d = obj as CountryFeature;
    return (hoveredCountry === d.properties.ISO_A2 || selectedCountry === d.properties.ISO_A2) ? 0.1 : 0.01;
  };

  const getPolygonCapColor = (obj: object) => {
    const d = obj as CountryFeature;
    const baseColor = generateCountryColor(d.properties.ISO_A2);
    const isActive = hoveredCountry === d.properties.ISO_A2 || selectedCountry === d.properties.ISO_A2;
    return isActive ? baseColor : baseColor.replace('hsl', 'hsla').replace(')', ', 0.7)');
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[rgb(255,241,229)]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgb(255,241,229)] z-10">
          <div className="text-[rgb(38,42,51)] text-lg">Loading globe data...</div>
        </div>
      )}

      {clickPopup.visible && (
        <div 
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ 
            left: clickPopup.screenPosition.x,
            top: clickPopup.screenPosition.y,
          }}
        >
          <div className="bg-[rgb(242,223,206)] text-[rgb(38,42,51)] px-4 py-2 rounded-lg shadow-lg mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="font-bold">
              {clickPopup.country}
            </div>
          </div>
        </div>
      )}

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgb(255,241,229)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        polygonsData={countries}
        polygonSideColor={() => 'rgba(38,42,51, 0.6)'}
        polygonStrokeColor={() => 'rgba(38,42,51, 0.2)'}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonCapColor}
        polygonsTransitionDuration={500}
        onPolygonHover={(polygon: object | null) => {
          const typedPolygon = polygon as CountryFeature | null;
          setHoveredCountry(typedPolygon ? typedPolygon.properties.ISO_A2 : null);
        }}
        onPolygonClick={handleCountryClick}
        polygonLabel={(d: any) => `
          <div class="bg-[rgb(242,223,206)] p-2 rounded-lg">
            <div class="font-bold text-[rgb(38,42,51)]">${d.properties.ADMIN} (${d.properties.ISO_A2})</div>
            <div class="text-[rgb(38,42,51)]">Population: ${(d.properties.POP_EST / 1e6).toFixed(2)}M</div>
          </div>
        `}
        showGraticules={true}
        showAtmosphere={false}
      />
    </div>
  );
};

export default GlobeVisualization;