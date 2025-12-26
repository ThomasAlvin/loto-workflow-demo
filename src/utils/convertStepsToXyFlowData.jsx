import defaultNodeSettings from "../constants/defaultNodeSettings";
import { v4 as uuid } from "uuid";
import autoArrangeNodes from "./autoArrangeNodes";

export default async function convertStepsToXyFlowData(workOrderSteps) {
  if (!workOrderSteps || !workOrderSteps.length)
    return { nodes: [], edges: [] };

  const newUuids = {};
  workOrderSteps.forEach((step) => {
    newUuids[step.UID] = uuid();
  });

  const nodes = workOrderSteps.map((step, index) => {
    return {
      id: newUuids[step.UID],
      type: "step",
      position: { x: 120, y: (index + 1) * defaultNodeSettings.newStepGap },
      data: {
        ...step,
        idDB: step.id,
        // switch id to UID
        // id: step.UID,
        label: step.name,
        order: index + 1,
        isStart: index === 0,
        isEnd: index + 1 === workOrderSteps.length,
      },
    };
  });

  const edges = [];

  // Recursive function to process children
  function addEdgesFromParent(parentUID) {
    const parent = workOrderSteps.find((steps) => steps.UID === parentUID);
    if (!parent) return;

    // Find children of this parent
    const children = workOrderSteps.filter(
      (steps) => steps.parent_UID === parentUID
    );

    if (!children.length) return;

    // If parent is conditional, group children by condition_value

    const groupedChildren = parent.condition
      ? children.reduce((acc, child) => {
          if (!child.condition_value) return acc;
          if (!acc[child.condition_value]) acc[child.condition_value] = [];
          acc[child.condition_value].push(child);
          return acc;
        }, {})
      : { normal: children }; // non-conditional parent

    for (const groupKey in groupedChildren) {
      const group = groupedChildren[groupKey];

      // Connect children sequentially
      group.forEach((child, index) => {
        // Edge from parent to first child
        if (index === 0) {
          edges.push({
            id: `edge-${newUuids[parent.UID]}-${newUuids[child.UID]}`,
            source: newUuids[parent.UID],
            sourceHandle: "normal",
            target: newUuids[child.UID],
            type: defaultNodeSettings.edgeType,
            markerEnd: defaultNodeSettings.defaultMarkerEnd,
            label: groupKey,

            // data:
            //   parent.condition === 1
            //     ? { fromCondition: true, conditionValue: child.condition_value }
            //     : {},
          });
        } else {
          // Edge from previous sibling
          const prevChild = group[index - 1];
          edges.push({
            id: `edge-${newUuids[prevChild.UID]}-${newUuids[child.UID]}`,
            source: newUuids[prevChild.UID],
            sourceHandle: "normal",
            target: newUuids[child.UID],
            type: defaultNodeSettings.edgeType,
            markerEnd: defaultNodeSettings.defaultMarkerEnd,
            // data:
            //   parent.condition === 1
            //     ? { fromCondition: true, conditionValue: child.condition_value }
            //     : {},
          });
        }

        // Recurse if this child is itself a conditional parent
        addEdgesFromParent(child.UID);
      });
    }
  }

  // Process top-level nodes
  const topLevelSteps = workOrderSteps.filter((step) => !step.parent_UID);
  topLevelSteps.forEach((step, i) => {
    // Sequential edges between top-level nodes
    if (i > 0) {
      edges.push({
        id: `edge-seq-${newUuids[topLevelSteps[i - 1].UID]}-${
          newUuids[step.UID]
        }`,
        source: newUuids[topLevelSteps[i - 1].UID],
        target: newUuids[step.UID],
        type: defaultNodeSettings.edgeType,
        markerEnd: defaultNodeSettings.defaultMarkerEnd,
      });
    }

    addEdgesFromParent(step.UID);
  });

  workOrderSteps.forEach((step, i) => {
    if (step.loop_target_UID) {
      edges.push({
        id: `edge-seq-${newUuids[step.UID]}-${newUuids[step.loop_target_UID]}`,
        source: newUuids[step.UID],
        sourceHandle: "loop-back",
        target: newUuids[step.loop_target_UID],
        type: defaultNodeSettings.edgeType,
        markerEnd: defaultNodeSettings.defaultMarkerEnd,
      });
    }
  });

  const arrangedNodes = await autoArrangeNodes(nodes, edges, "TB");

  return { nodes: arrangedNodes, edges };
}
