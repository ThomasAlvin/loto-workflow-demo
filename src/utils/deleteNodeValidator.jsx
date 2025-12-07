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
    const hasCondition = selectedDeleteNodes.some(
      (node) => node.data?.condition === true
    );
    const hasMultiLockMain = selectedDeleteNodes.some(
      (node) => node.data?.isMainMultiLockAccess === true
    );
    const hasMultiLockLinkedStep = selectedDeleteNodes.some(
      (node) =>
        !node.data.isMainMultiLockAccess &&
        node.data?.multiLockAccessGroup?.name
    );
    const hasTopConditionBranch = selectedDeleteNodes.some((node) =>
      isTopConditionBranch(node, allNodes)
    );
    console.log(hasCondition);

    if (hasMultiLockLinkedStep) {
      toast.closeAll();
      toast({
        title: "Cannot Delete Linked Lock Access Step",
        description: "Please unselect the step to continue deleting",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } else if (hasTopConditionBranch) {
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
      console.log(selectedDeleteNodes);
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

function isTopConditionBranch(node, allNodes) {
  if (!node.data.parent_UID || !node.data.condition_value) return false;

  const branchNodes = allNodes.filter(
    (n) =>
      n.data.parent_UID === node.data.parent_UID &&
      n.data.condition_value === node.data.condition_value
  );

  const isTop = node.id === branchNodes[0].id;
  return isTop;
}
