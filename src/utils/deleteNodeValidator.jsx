import getDescendantNodesById from "./getDescendantNodesById";

export default function deleteNodeValidator(
  selectedDeleteNodes,
  allNodes,
  allEdges,
  openDeleteConfirm,
  toast,
  deleteStepFn
) {
  if (selectedDeleteNodes.length > 0) {
    const selectedNodeIds = new Set(selectedDeleteNodes.map((n) => n.id));
    const hasCondition = selectedDeleteNodes.some(
      (node) => node.data?.condition === true
    );
    const hasMultiLockMain = selectedDeleteNodes.some(
      (node) => node.data?.isMainMultiLockAccess === true
    );

    // Check for invalid linked multi-lock steps
    const hasInvalidMultiLockLinkedStep = selectedDeleteNodes.some((node) => {
      if (node.data?.isMainMultiLockAccess || !node.data?.multiLockAccessGroup)
        return false;

      const mainNode = allNodes.find(
        (n) =>
          n.data?.isMainMultiLockAccess &&
          n.data?.multiLockAccessGroup?.name ===
            node.data.multiLockAccessGroup.name
      );

      if (!mainNode) return false;

      return !selectedNodeIds.has(mainNode.id);
    });
    const hasInvalidTopConditionBranch = selectedDeleteNodes.some((node) => {
      // Ignore non-top branches
      if (!isTopConditionBranch(node, allNodes, allEdges)) return false;

      // Find parent condition node
      const parentConditionNode = allNodes.find(
        (n) => n.data.UID === node.data.parent_UID
      );

      if (!parentConditionNode) return false;

      // Invalid if parent condition is NOT selected
      return !selectedNodeIds.has(parentConditionNode.id);
    });
    if (hasInvalidMultiLockLinkedStep) {
      toast.closeAll();
      toast({
        title: "Cannot Delete Linked Lock Access Step",
        description: "Please unselect the step to continue deleting",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } else if (hasInvalidTopConditionBranch) {
      toast.closeAll();
      toast({
        title: "Cannot Delete Top Condition Branch",
        description: "Each condition must atleast have 1 step on each branch",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } else if (hasMultiLockMain || hasCondition) {
      let finalSelectedNodes = [...selectedDeleteNodes];
      if (hasMultiLockMain) {
        const selectedGroupNames = selectedDeleteNodes
          .filter((nds) => nds.data.isMainMultiLockAccess)
          .map((nds) => nds.data.multiLockAccessGroup?.name)
          .filter(Boolean);
        const relatedNodes = allNodes.filter(
          (nds) =>
            selectedGroupNames.includes(nds.data.multiLockAccessGroup?.name) &&
            !nds.data.isMainMultiLockAccess
        );
        finalSelectedNodes = [
          ...finalSelectedNodes,
          ...relatedNodes.filter(
            (relNode) =>
              !selectedDeleteNodes.some((selNode) => selNode.id === relNode.id)
          ),
        ];
      }
      if (hasCondition) {
        const conditionalNodes = selectedDeleteNodes.filter(
          (node) => node.data?.condition
        );
        const allBranchesToDelete = new Map(); // ✅ use Map to store allNodes by id
        for (const node of conditionalNodes) {
          const { descendantNodes } = getDescendantNodesById(
            node.id,
            allEdges,
            allNodes
          );
          for (const descendantNode of descendantNodes) {
            allBranchesToDelete.set(descendantNode.id, descendantNode);
          }
        }
        const selectedBranches = Array.from(allBranchesToDelete.values());
        finalSelectedNodes = [...finalSelectedNodes, ...selectedBranches];
      }
      if (hasMultiLockMain && hasCondition) {
        openDeleteConfirm(finalSelectedNodes, {
          header: "Delete Steps?",
          header2: "Are you sure you want to delete the selected steps?",
          body: "The selected steps contain a condition and lock access. Deleting them will also remove all related conditional branches, their connected steps and their linked steps.",
          confirmationLabel: "Delete",
        });
      } else if (hasMultiLockMain) {
        openDeleteConfirm(finalSelectedNodes, {
          header: "Delete Steps?",
          header2: "Are you sure you want to delete the selected steps?",
          body: "The selected steps contain a lock access. Deleting them will also remove all their linked steps.",
          confirmationLabel: "Delete",
        });
      } else if (hasCondition) {
        openDeleteConfirm(finalSelectedNodes, {
          header: "Delete Steps?",
          header2: "Are you sure you want to delete the selected steps?",
          body: "The selected steps contain a condition. Deleting them will also remove all related conditional branches and their connected steps.",
          confirmationLabel: "Delete",
        });
      }
    } else {
      deleteStepFn(selectedDeleteNodes);
    }
  }
}

function isTopConditionBranch(node, allNodes, allEdges) {
  if (!node.data.parent_UID || !node.data.condition_value) return false;
  const parentConditionNode = allNodes.find(
    (n) => n.data.UID === node.data.parent_UID
  );
  if (!parentConditionNode) return false;
  return allEdges.some(
    (e) => e.source === parentConditionNode.id && e.target === node.id
  );
}
