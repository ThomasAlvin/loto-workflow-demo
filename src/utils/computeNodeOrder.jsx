export default function computeNodeOrder(nodes, edges, startNodeId) {
  const orderMap = {};
  const visited = new Set();
  let counter = 1;

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function dfs(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    orderMap[nodeId] = counter++;

    const node = nodeMap[nodeId];
    console.log(node);
    // useless??
    // if (node?.data?.conditional) {
    //   const noNodes = nodes.filter(
    //     (n) => n.data?.parent_uid === nodeId && n.data.condition_value === "no",
    //   );
    //   const yesNodes = nodes.filter(
    //     (n) =>
    //       n.data?.parent_uid === nodeId && n.data.condition_value === "yes",
    //   );
    //   console.log(noNodes);
    //   console.log(yesNodes);

    //   noNodes.forEach((n) => dfs(n.id));
    //   yesNodes.forEach((n) => dfs(n.id));
    // }

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
