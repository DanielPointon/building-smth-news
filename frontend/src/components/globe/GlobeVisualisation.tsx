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
    coordinates: number[][][];
  };
}

// Seeded pseudo-random number generator
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Create a seeded random generator
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
};

// Generate a vibrant color using seeded random
const generateCountryColor = (countryId: string): string => {
  const random = seededRandom(countryId);
  
  // Generate HSL color with:
  // - Random hue (0-360)
  // - High saturation (70-100%)
  // - Medium-high lightness (45-65%)
  const hue = Math.floor(random * 360);
  const saturation = 70 + (seededRandom(countryId + '1') * 30); // 70-100%
  const lightness = 45 + (seededRandom(countryId + '2') * 20);  // 45-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const GlobeVisualization = () => {
  const globeRef = useRef<GlobeMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });

  // Handle container resizing
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

    // Initial size
    updateDimensions();

    // Setup resize observer
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    // Handle window resize as well
    window.addEventListener('resize', updateDimensions);

    // Cleanup
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

  useEffect(() => {
    if (globeRef.current) {
      const controls = (globeRef.current as any).controls();
      if (controls) {
        controls.autoRotate = false;
      }
    }
  }, []);

  const getPolygonAltitude = (obj: object) => {
    const d = obj as CountryFeature;
    return hoveredCountry === d.properties.ISO_A2 ? 0.1 : 0.01;
  };

  const getPolygonCapColor = (obj: object) => {
    const d = obj as CountryFeature;
    const baseColor = generateCountryColor(d.properties.ISO_A2);
    
    if (hoveredCountry === d.properties.ISO_A2) {
      // Return the full opacity color for hovered country
      return baseColor;
    }
    
    // Convert to RGBA for non-hovered countries
    return baseColor.replace('hsl', 'hsla').replace(')', ', 0.7)');
  };

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0" style={{ minHeight: '100%' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-lg">Loading globe data...</div>
        </div>
      )}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={countries}
        polygonSideColor={() => 'rgba(0, 0, 0, 0.6)'}
        polygonStrokeColor={() => 'rgba(0, 0, 0, 0.05)'}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonCapColor}
        polygonsTransitionDuration={500} // Added this line - 500ms transition (half of default)
        onPolygonHover={(polygon: object | null, prevPolygon: object | null) => {
          const typedPolygon = polygon as CountryFeature | null;
          setHoveredCountry(typedPolygon ? typedPolygon.properties.ISO_A2 : null);
        }}
        polygonLabel={(d: any) => `
          <div class="bg-gray-900 p-2 rounded-lg shadow-lg">
            <div class="font-bold text-purple-400">${d.properties.ADMIN} (${d.properties.ISO_A2})</div>
            <div class="text-gray-300">Population: ${(d.properties.POP_EST / 1e6).toFixed(2)}M</div>
          </div>
        `}
        showGraticules={true}
      />
    </div>
  );
};

export default GlobeVisualization;