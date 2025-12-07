export default function getLocalDescendantNodesById(targetUID, edges, nodes) {
  const visited = new Set();
  const stack = [targetUID];

  function isConditionNode(nodeId) {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data?.condition;
  }

  if (isConditionNode(targetUID)) {
    return {
      descendantNodes: [],
      remainingNodes: nodes, // or nodes.filter(n => n.id !== targetUID) if you prefer
    };
  }

  while (stack.length > 0) {
    const currentId = stack.pop();
    visited.add(currentId);

    // Get outgoing edges
    const outgoingEdges = edges.filter((e) => e.source === currentId);

    for (const edge of outgoingEdges) {
      const targetId = edge.target;

      // ⛔ Stop if the next node is a condition node
      if (isConditionNode(targetId)) {
        // ✅ Include condition node
        visited.add(targetId);
        // 🚫 But do NOT go deeper into its branches
        continue;
      }

      if (!visited.has(targetId)) {
        stack.push(targetId);
      }
    }
  }

  visited.delete(targetUID);

  const descendantNodes = nodes.filter((n) => visited.has(n.id));
  const remainingNodes = nodes.filter((n) => !visited.has(n.id));

  return {
    descendantNodes,
    remainingNodes,
  };
}
