import React, { useEffect, useState } from 'react';
import { SigmaContainer, useLoadGraph, ZoomControl, FullScreenControl, useSigma } from '@react-sigma/core';
import Graph from 'graphology';
import { Cluster, Article } from 'types/question';
import forceAtlas2 from 'graphology-layout-forceatlas2';

// Predefined colors that work well with sigma.js
const CLUSTER_COLORS = [
  '#e6194B',
  '#4363d8',
  '#3cb44b',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#bfef45',
  '#fabed4',
  '#469990',
  '#dcbeff',
  '#9A6324',
  '#fffac8',
  '#800000',
  '#aaffc3'
];

const GraphDataController: React.FC<{ selectedClusters: Record<string, boolean> }> = ({ selectedClusters }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    graph.forEachNode((node) => {
      const clusterTopic = graph.getNodeAttribute(node, 'clusterTopic');
      const isHidden = !selectedClusters[clusterTopic];
      graph.setNodeAttribute(node, 'hidden', isHidden);
    });

    graph.forEachEdge((edge) => {
      const source = graph.source(edge);
      const target = graph.target(edge);
      const sourceHidden = graph.getNodeAttribute(source, 'hidden');
      const targetHidden = graph.getNodeAttribute(target, 'hidden');
      graph.setEdgeAttribute(edge, 'hidden', sourceHidden || targetHidden);
    });
  }, [graph, selectedClusters]);

  return null;
};

// Panel component remains the same...
const Panel: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
  initiallyDeployed?: boolean;
}> = ({ title, children, initiallyDeployed = false }) => {
  const [isDeployed, setIsDeployed] = useState(initiallyDeployed);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
      <h2 className="flex items-center justify-between text-lg font-georgia mb-2">
        {title}
        <button 
          onClick={() => setIsDeployed(!isDeployed)}
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
        >
          {isDeployed ? '−' : '+'}
        </button>
      </h2>
      {isDeployed && <div className="mt-4">{children}</div>}
    </div>
  );
};

// SearchField component remains the same...
const SearchField: React.FC<{ onSearch: (value: string) => void }> = ({ onSearch }) => {
  return (
    <div className="relative mb-4">
      <input
        type="search"
        placeholder="Search in nodes..."
        className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:border-[rgb(13,118,128)]"
        onChange={(e) => onSearch(e.target.value)}
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
    </div>
  );
};

const LoadGraph: React.FC<{ 
  clusters: Cluster[]; 
  articles: Article[]; 
}> = ({ clusters, articles }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    clusters.forEach((cluster, i) => {
      const clusterColor = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
      
      // Add cluster node
      graph.addNode(`cluster-${i}`, {
        x: Math.random(),
        y: Math.random(),
        size: 30,
        label: cluster.cluster_topic,
        color: clusterColor,
        type: 'circle',
        clusterTopic: cluster.cluster_topic
      });

      // Add article nodes and edges
      cluster.article_ids.forEach((articleId) => {
        const article = articles.find(a => a.id === articleId);
        if (article) {
          graph.addNode(`article-${articleId}`, {
            x: Math.random(),
            y: Math.random(),
            size: 20,
            label: article.title,
            color: clusterColor,
            type: 'circle',
            article: article,
            clusterTopic: cluster.cluster_topic
          });

          graph.addEdge(`cluster-${i}`, `article-${articleId}`, {
            size: 2,
            color: clusterColor
          });
        }
      });
    });

    // Apply force atlas layout
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 100 });

    loadGraph(graph);
  }, [clusters, articles, loadGraph]);

  return null;
};

const TopicGraph: React.FC<{
  clusters: Cluster[];
  articles: Article[];
  onClusterSelect: (cluster: string) => void;
}> = ({ clusters, articles, onClusterSelect }) => {
  const [showContents, setShowContents] = useState(true);
  const [selectedClusters, setSelectedClusters] = useState<Record<string, boolean>>(
    Object.fromEntries(clusters.map(c => [c.cluster_topic, true]))
  );

  return (
    <div className="relative w-full h-[600px] bg-[rgb(242,223,206)] rounded-lg">
      <SigmaContainer
        style={{ height: '100%' }}
        settings={{
          defaultNodeType: 'circle',
          defaultEdgeType: 'arrow',
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 15,
          labelFont: "Lato, sans-serif",
          zIndex: true,
          minCameraRatio: 0.1,
          maxCameraRatio: 2,
          defaultNodeColor: "#999",
          defaultEdgeColor: "#ccc",
        }}
      >
        <LoadGraph clusters={clusters} articles={articles} />
        <GraphDataController selectedClusters={selectedClusters} />

        {/* Controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <button
              onClick={() => setShowContents(!showContents)}
              className="p-2 hover:text-[rgb(13,118,128)]"
              title="Toggle contents"
            >
              📑
            </button>
          </div>
          <FullScreenControl className="bg-white p-2 rounded-lg shadow-lg">
            <span className="block p-2">⤢</span>
            <span className="block p-2">⤡</span>
          </FullScreenControl>
          <ZoomControl className="bg-white p-2 rounded-lg shadow-lg">
            <span className="block p-2">+</span>
            <span className="block p-2">−</span>
            <span className="block p-2">⦿</span>
          </ZoomControl>
        </div>

        {/* Sidebar */}
        {showContents && (
          <div className="absolute right-4 top-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto bg-white rounded-lg shadow-lg">
            <div className="p-4">
              <SearchField onSearch={() => {}} />
              
              <Panel
                title={
                  <>
                    <span className="flex items-center">
                      <span className="mr-2">📁</span> Topics
                      <span className="text-sm text-gray-500 ml-2">
                        ({Object.values(selectedClusters).filter(Boolean).length} / {clusters.length})
                      </span>
                    </span>
                  </>
                }
                initiallyDeployed={true}
              >
                <div className="mb-4 flex gap-2">
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    onClick={() => setSelectedClusters(Object.fromEntries(clusters.map(c => [c.cluster_topic, true])))}
                  >
                    ✓ Check all
                  </button>
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    onClick={() => setSelectedClusters({})}
                  >
                    ✕ Uncheck all
                  </button>
                </div>
                <div className="space-y-2">
                  {clusters.map((cluster, index) => {
                    const clusterColor = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`cluster-${index}`}
                          checked={selectedClusters[cluster.cluster_topic] || false}
                          onChange={() => {
                            setSelectedClusters(prev => ({
                              ...prev,
                              [cluster.cluster_topic]: !prev[cluster.cluster_topic]
                            }));
                            onClusterSelect(cluster.cluster_topic);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`cluster-${index}`}
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: selectedClusters[cluster.cluster_topic] ? clusterColor : 'white',
                              border: `2px solid ${clusterColor}`
                            }}
                          />
                          <span className="flex-grow">{cluster.cluster_topic}</span>
                          <span className="text-sm text-gray-500">
                            ({cluster.article_ids.length})
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </SigmaContainer>
    </div>
  );
};

export default TopicGraph;