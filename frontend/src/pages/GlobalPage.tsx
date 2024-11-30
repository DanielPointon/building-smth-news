import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import GlobeVisualization from 'components/globe/GlobeVisualisation';

export const GlobePage: React.FC = () => {
  return (
    <GlobeVisualization />
  );
};

export default GlobePage;