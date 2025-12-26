export default function computeNodeOrder(nodes, edges, startNodeId) {
  const orderMap = {};
  const visited = new Set();
  let counter = 1;

  function dfs(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    orderMap[nodeId] = counter++;

    edges
      .filter((e) => e.source === nodeId && !visited.has(e.target))
      .forEach((e) => dfs(e.target));
  }

  dfs(startNodeId);

  return nodes.map((n) => ({
    ...n,
    data: { ...n.data, order: orderMap[n.id] || 0 },
  }));
}
