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

const GlobeVisualization = () => {
  const globeRef = useRef<GlobeMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeight, setShowHeight] = useState(false);
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
        setTimeout(() => setShowHeight(true), 3000);
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
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.8;
      }
    }
  }, []);

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
        polygonCapColor={() => 'rgba(0, 0, 100, 0.6)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 1)'}
        polygonStrokeColor={() => 'rgba(173, 216, 230, 0.05)'}
        polygonLabel={(d: any) => `
          <div class="bg-gray-900 p-2 rounded-lg shadow-lg">
            <div class="font-bold text-purple-400">${d.properties.ADMIN} (${d.properties.ISO_A2})</div>
            <div class="text-gray-300">Population: ${(d.properties.POP_EST / 1e6).toFixed(2)}M</div>
          </div>
        `}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.25}
        showGraticules={true}
      />
    </div>
  );
};

export default GlobeVisualization;