import findAncestorConditions from "./findAncestorConditions";

export default function reactFlowConnectValidation(
  nodes,
  edges,
  sourceNode,
  targetNode,
  sourceHandle,
  toast
) {
  function showConnectionErrorToast({ title, description }) {
    toast.closeAll();
    toast({
      title,
      description,
      status: "error",
      duration: 5000,
      position: "top",
      isClosable: true,
    });
  }
  const targetAlreadyConnectedNormal = edges.some(
    (edge) => edge.target === targetNode.id && edge.sourceHandle === "normal"
  );
  const sourceAlreadyConnected = edges.some(
    (edge) => edge.source === sourceNode.id
  );

  if (sourceNode.id === targetNode.id) {
    toast.closeAll();
    showConnectionErrorToast({
      title: "Invalid connection",
      description:
        "A step cannot connect to itself. Please connect to a different step.",
    });
    return false;
  }
  if (sourceHandle === "normal") {
    if (targetAlreadyConnectedNormal || sourceAlreadyConnected) {
      showConnectionErrorToast({
        title: "Invalid Connection",
        description: "You can only have one connection on each step.",
      });

      return false;
    }
  } else if (sourceHandle === "loop-back") {
    const conditionAncestors = findAncestorConditions(nodes, sourceNode);
    const isAncestor = conditionAncestors.some((a) => a.id === targetNode.id);
    const sourceNodeWithAncestors = [sourceNode, ...conditionAncestors];
    const validAncestors = [];
    for (
      let ancIndex = 0;
      ancIndex < sourceNodeWithAncestors.length;
      ancIndex++
    ) {
      if (sourceNodeWithAncestors[ancIndex]?.data?.condition_value === "No") {
        let allAbove = sourceNodeWithAncestors.slice(
          ancIndex + 1,
          sourceNodeWithAncestors.length
        );
        validAncestors.push(...allAbove);
        break;
      }
    }

    if (sourceAlreadyConnected) {
      showConnectionErrorToast({
        title: "Invalid loop-back connection",
        description: "You can only have one connection on each step.",
      });
      return false;
    }

    if (!targetNode.data.condition) {
      showConnectionErrorToast({
        title: "Invalid loop-back connection",
        description: "Loop-backs can only connect to condition steps",
      });
      return false;
    }

    if (sourceNode.data.condition_value === "No") {
      if (!isAncestor) {
        showConnectionErrorToast({
          title: "Invalid loop-back connection",
          description:
            "Loop-backs can only connect to condition steps within the same branch path.",
        });
        return false;
      }
    }

    if (sourceNode.data.condition_value === "Yes") {
      if (!isAncestor) {
        showConnectionErrorToast({
          title: "Invalid loop",
          description:
            "Loop-backs can only connect to condition steps within the same branch path.",
        });
        return false;
      }

      if (!validAncestors.some((ances) => ances.id === targetNode.id)) {
        showConnectionErrorToast({
          title: "Invalid loop-back connection",
          description:
            "This connection is not allowed. Looping back to this condition step may create an infinite loop.",
        });
        return false;
      }
    }
  }
  return true;
}
