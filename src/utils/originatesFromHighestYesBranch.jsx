// Will be disabled in latest version
export default function originatesFromHighestYesBranch(
  nodes,
  node,
  highestBranches
) {
  let current = node;

  while (current?.data?.parent_UID) {
    const parent = nodes.find((n) => n.data.id === current.data.parent_UID);
    if (!parent) break;

    // Does this parent match one of the highest branches?
    const branch = highestBranches.find((b) => b.id === parent.id);
    if (branch) {
      return branch.data.condition_value === "Yes";
    }

    current = parent;
  }

  return false;
}
