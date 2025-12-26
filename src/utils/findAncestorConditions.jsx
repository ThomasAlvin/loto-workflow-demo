export default function findAncestorConditions(nodes, node) {
  const ancestors = [];
  let current = node;

  while (current?.data?.parent_UID) {
    const parent = nodes.find((n) => n.data.UID === current.data.parent_UID);
    if (!parent) break;

    if (parent.data.condition) {
      ancestors.push(parent);
    }

    current = parent;
  }

  return ancestors; // from nearest → farthest up
}
