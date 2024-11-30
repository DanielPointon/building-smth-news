import React, { useEffect, useRef, useState } from 'react';
import { SigmaContainer, useLoadGraph, ControlsContainer, useSigma } from '@react-sigma/core';
import Graph from 'graphology';
import { Attributes } from 'graphology-types';
import { Cluster, Article } from 'types/question';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { useNavigate } from 'react-router-dom';

interface TopicGraphProps {
  clusters: Cluster[];
  articles: Article[];
  onClusterSelect: (cluster: string) => void;
}

const LoadGraph = ({ clusters, articles }: { clusters: Cluster[]; articles: Article[] }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Create graph data
    const graph = new Graph();

    // Add cluster nodes
    clusters.forEach((cluster, i) => {
      const clusterId = `cluster-${i}`;
      graph.addNode(clusterId, {
        x: Math.random(),
        y: Math.random(),
        size: 20,
        label: cluster.cluster_topic,
        type: 'circle',
        color: '#0D7680',
      });

      // Add article nodes and edges
      cluster.article_ids.forEach((articleId, j) => {
        const articleNode = articles.find((a) => a.id === articleId);
        if (articleNode) {
          const articleNodeId = `article-${articleId}`;
          graph.addNode(articleNodeId, {
            x: Math.random(),
            y: Math.random(),
            size: 12,
            label: articleNode.title,
            type: 'circle',
            color: '#262A33',
            url: '#',
          });

          // Connect article to cluster
          graph.addEdge(clusterId, articleNodeId, {
            type: 'line',
            size: 2,
            color: '#ccc',
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

const TopicSidebar = ({ clusters, onClusterSelect }: { clusters: Cluster[]; onClusterSelect: (cluster: string) => void }) => (
  <div className="absolute left-4 top-4 bg-[rgb(255,241,229)] p-4 rounded-lg shadow-lg w-64">
    <h3 className="text-lg font-georgia text-[rgb(38,42,51)] mb-4">Topics</h3>
    <div className="space-y-2">
      {clusters.map((cluster, index) => (
        <button
          key={index}
          onClick={() => onClusterSelect(cluster.cluster_topic)}
          className="w-full text-left p-2 hover:bg-[rgb(242,223,206)] rounded-lg transition-colors"
        >
          <p className="font-georgia text-[rgb(38,42,51)]">{cluster.cluster_topic}</p>
          <p className="text-sm text-gray-500">{cluster.article_ids.length} articles</p>
        </button>
      ))}
    </div>
  </div>
);

const TopicGraph: React.FC<TopicGraphProps> = ({ clusters, articles, onClusterSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[600px] bg-[rgb(242,223,206)] rounded-lg">
      <SigmaContainer
        style={{ height: '100%', width: '100%' }}
        settings={{
          defaultNodeType: 'circle',
          defaultEdgeType: 'line',
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 12,
          labelFont: "Lato, sans-serif",
          zIndex: true,
          defaultNodeColor: '#999',
          defaultEdgeColor: '#ccc',
          nodeProgramClasses: {},
          labelSize: 12,
          labelWeight: 'normal',
          renderEdgeLabels: false,
          //   defaultDrawNodeLabel: drawLabel,
          //   defaultDrawNodeHover: drawHover
        }}
      >
        <LoadGraph clusters={clusters} articles={articles} />
        <ControlsContainer position={'bottom-right'} />
      </SigmaContainer>
      <TopicSidebar clusters={clusters} onClusterSelect={onClusterSelect} />
    </div>
  );
};

export default TopicGraph;