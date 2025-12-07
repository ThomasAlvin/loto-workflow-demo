export default function getDescendantNodesById(targetUID, edges, nodes) {
  const visited = new Set();
  const stack = [targetUID];

  while (stack.length > 0) {
    const currentId = stack.pop();
    visited.add(currentId);

    const outgoingEdges = edges.filter(
      (e) => e.source === currentId && e.sourceHandle !== "loop-back",
    );
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        stack.push(edge.target);
      }
    }
  }

  visited.delete(targetUID);

  // const descendantNodes = nodes.filter((n) => visited.has(n.id));
  const descendantNodes = nodes.filter((n) => visited.has(n.id));
  const remainingNodes = nodes.filter((n) => !visited.has(n.id));

  return {
    remainingNodes,
    descendantNodes,
  };
}
