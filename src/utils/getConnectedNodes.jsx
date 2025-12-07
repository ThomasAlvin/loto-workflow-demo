export default function getConnectedNodes(startNode, edges) {
  if (!startNode) return [];
  if (!edges) return [];
  const connected = new Set([startNode.id]);
  let stack = [startNode.id];

  while (stack.length > 0) {
    const current = stack.pop();
    edges.forEach((e) => {
      if (e.source === current && !connected.has(e.target)) {
        connected.add(e.target);
        stack.push(e.target);
      }
    });
  }

  return connected;
}
