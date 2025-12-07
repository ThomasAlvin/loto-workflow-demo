import findAncestorConditions from "./findAncestorConditions";

/**
 * Detects whether a node is inside a YES-origin branch tree.
 * This checks ALL parents (condition or branch), not just condition steps.
 * If ANY ancestor is a YES-branch, the entire subtree is YES-origin.
 */
function hasNoAncestor(nodes, node) {
  let current = node;

  while (current?.data?.parent_UID) {
    // switch id to UID
    // const parent = nodes.find((n) => n.data.id === current.data.parent_UID);
    const parent = nodes.find((n) => n.data.UID === current.data.parent_UID);
    if (!parent) break;

    // Found a NO branch parent → this YES is allowed to loop
    if (parent.data.condition_value === "No") {
      return true;
    }

    current = parent;
  }

  return false; // pure yes ancestry
}

export function getAllowedLoopTargetsLatest(nodes, node) {
  if (!node) return [];
  const isYes = node.data.condition_value === "Yes";
  const isNo = node.data.condition_value === "No";

  const ancestors = findAncestorConditions(nodes, node);
  if (ancestors.length === 0) return [];

  // -------------------------------------------------------
  // RULE 1: NO BRANCH → can loop to ALL ancestor conditions
  // -------------------------------------------------------
  if (isNo) return ancestors;

  // STEP 1: detect if YES branch is "pure yes" or "yes with a no ancestor"
  const hasNo = hasNoAncestor(nodes, node);

  // If no ancestor is a "No" → pure yes → no loops allowed
  if (!hasNo) return [];

  // STEP 2: Allowed to loop, but NOT to own parent
  const sourceNodeWithAncestors = [node, ...ancestors];
  const validAncestors = [];
  for (
    let ancIndex = 0;
    ancIndex < sourceNodeWithAncestors.length;
    ancIndex++
  ) {
    if (sourceNodeWithAncestors[ancIndex]?.data?.condition_value === "No") {
      let allAbove = sourceNodeWithAncestors.slice(
        ancIndex + 1,
        sourceNodeWithAncestors.length,
      );
      validAncestors.push(...allAbove);
      break;
    }
  }

  return validAncestors;
}
