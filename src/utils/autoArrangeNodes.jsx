import ELK from "elkjs/lib/elk.bundled.js";
import getConnectedNodes from "./getConnectedNodes";

const elk = new ELK();

export default async function autoArrangeNodes(
  nodes,
  edges,
  direction = "TB",
  options = { spacing: [150, 150] }
) {
  if (!nodes?.length) return [];

  edges = edges.filter((edge) => edge.sourceHandle !== "loop-back");

  const startNode = nodes.find((n) => n.data?.isStart);
  const connectedNodeIds = getConnectedNodes(startNode, edges);

  const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id));
  const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

  const elkDirection =
    direction === "TB"
      ? "DOWN"
      : direction === "BT"
      ? "UP"
      : direction === "LR"
      ? "RIGHT"
      : "LEFT";

  // Build an ELK graph following the "guy's code" style
  const buildElkGraph = (nodeList) => ({
    id: "elk-root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": elkDirection,
      "elk.edgeRouting": "POLYLINE",
      "elk.spacing.nodeNode": options.spacing[0],
      "elk.spacing.edgeNode": options.spacing[1],
      "elk.layered.spacing.nodeNodeBetweenLayers": "150",
    },
    children: nodeList.map((node) => {
      const isBranch = node.data.condition;

      return {
        id: node.id,
        width: 90,
        height: 90,
        ...(isBranch
          ? {
              properties: { "org.eclipse.elk.portConstraints": "FIXED_ORDER" },
              ports: [
                { id: node.id }, // default port (if needed)
                {
                  id: `${node.id}-match`,
                  properties: {
                    side: "EAST",
                    index: 1,
                  },
                },
                {
                  id: `${node.id}-nomatch`,
                  properties: {
                    side: "WEST",
                    index: 0,
                  },
                },
              ],
            }
          : {}),
      };
    }),
    edges: edges
      .filter(
        (e) =>
          nodeList.find((n) => n.id === e.source) &&
          nodeList.find((n) => n.id === e.target)
      )
      .map((edge) => {
        const sourceNode = nodeList.find((n) => n.id === edge.source);
        const isBranch = sourceNode?.type === "Branch";

        return {
          id: edge.id,
          sources: [
            isBranch
              ? `${edge.source}-${edge.label === "Yes" ? "match" : "nomatch"}`
              : edge.source,
          ],
          targets: [edge.target],
        };
      }),
  });

  // Layout connected nodes
  const elkGraphConnected = buildElkGraph(connectedNodes);
  const elkLayoutConnected = await elk.layout(elkGraphConnected);

  const positionedConnectedNodes = connectedNodes.map((node) => {
    const layoutNode = elkLayoutConnected.children.find(
      (n) => n.id === node.id
    );
    return {
      ...node,
      position: { x: layoutNode?.x ?? 0, y: layoutNode?.y ?? 0 },
    };
  });

  // Layout unconnected clusters
  const rightColumnX =
    Math.max(...positionedConnectedNodes.map((n) => n.position.x)) + 250;
  const clusters = getClusters(unconnectedNodes, edges);

  let clusterYOffset = 0;
  const positionedUnconnectedNodes = [];

  for (const cluster of clusters) {
    if (!cluster.length) continue;

    const clusterGraph = buildElkGraph(cluster);
    const clusterLayout = await elk.layout(clusterGraph);

    clusterLayout.children.forEach((layoutNode) => {
      positionedUnconnectedNodes.push({
        ...cluster.find((n) => n.id === layoutNode.id),
        position: {
          x: rightColumnX + layoutNode.x,
          y: clusterYOffset + layoutNode.y,
        },
      });
    });

    clusterYOffset += Math.max(...clusterLayout.children.map((n) => n.y)) + 200;
  }

  return [...positionedConnectedNodes, ...positionedUnconnectedNodes];
}

// --- Clustering helper ---
function getClusters(unconnectedNodes, edges) {
  const visited = new Set();
  const clusters = [];

  function dfs(node, cluster) {
    visited.add(node.id);
    cluster.push(node);

    const neighbors = edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) =>
        e.source === node.id
          ? unconnectedNodes.find((n) => n.id === e.target)
          : unconnectedNodes.find((n) => n.id === e.source)
      )
      .filter(Boolean);

    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor.id)) dfs(neighbor, cluster);
    });
  }

  unconnectedNodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const cluster = [];
      dfs(node, cluster);
      clusters.push(cluster);
    }
  });

  return clusters;
}
