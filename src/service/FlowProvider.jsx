import { createContext, useRef, useEffect, useState, useMemo } from "react";
import defaultNodeSettings from "../constants/defaultNodeSettings";
import computeNodeOrder from "../utils/computeNodeOrder";
import DebugContext from "../debugging/DebugContext";

export const ActionsContext = createContext(null);
export const UIContext = createContext(null);
export const FlagContext = createContext(null);
export const AllowedTargetsContext = createContext(null);
export default function FlowProvider({
  children,
  nodes,
  edges,
  setNodes,
  setEdges,
  formikSetValues,
  editStepDisclosureOnClose,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  editable = true,
  variant = "workOrder",
  // componentVariant,
}) {
  const actionsRef = useRef({ deleteStep: () => {} });

  const [connectingSourceId, setConnectingSourceId] = useState(null);
  const [allowedTargetIds, setAllowedTargetIds] = useState(new Set());
  const [flaggedSteps, setFlaggedSteps] = useState([]);
  const uiValue = useMemo(
    () => ({
      connectingSourceId,
      setConnectingSourceId,
      editable,
      variant,
    }),
    [connectingSourceId, editable, variant],
  );
  const flagValue = useMemo(
    () => ({
      flaggedSteps,
      setFlaggedSteps,
    }),
    [flaggedSteps],
  );
  const allowedValue = useMemo(
    () => ({
      allowedTargetIds,
      setAllowedTargetIds,
    }),
    [allowedTargetIds],
  );
  useEffect(() => {
    if (editable) {
      actionsRef.current.deleteStep = (deletedNodes, newNodes, newEdges) => {
        let isStartDeleted = false;

        // Use the defaults from arguments OR fallback to latest state from context
        const nodes = newNodes ?? actionsRef.current.latestNodes;
        const edges = newEdges ?? actionsRef.current.latestEdges;

        // 1. Update Formik
        if (variant === "workOrder") {
          formikSetValues((prevState) => ({
            ...prevState,
            workOrderSteps: prevState.workOrderSteps.filter(
              (workOrderStep) =>
                !deletedNodes.some(
                  (node) => node.data.UID === workOrderStep.UID,
                ),
            ),
          }));
        } else if (variant === "template") {
          formikSetValues((prevState) => ({
            ...prevState,
            templateSteps: prevState.templateSteps.filter(
              (templateStep) =>
                // switch id to UID
                !deletedNodes.some(
                  (node) => node.data.UID === templateStep.UID,
                ),
            ),
          }));
        }

        // 2. Remove nodes
        const nodesAfterDeletion = nodes.filter(
          (node) =>
            !deletedNodes.some((deletedNode) => deletedNode.id === node.id),
        );

        // 3. Detect if start deleted
        deletedNodes.forEach((deletedNode) => {
          if (deletedNode.data.isStart) isStartDeleted = true;
        });

        // 4. Rebuild edges
        let remainingNodes = [...nodes];
        const updatedEdges = deletedNodes.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc).filter(
            (edgeNode) => {
              const edge = acc.find(
                (e) => e.target === node.id && e.source === edgeNode.id,
              );
              return edge && edge.sourceHandle !== "loop-back";
            },
          );

          const outgoers = getOutgoers(node, remainingNodes, acc).filter(
            (edgeNode) => {
              const edge = acc.find(
                (e) => e.source === node.id && e.target === edgeNode.id,
              );
              return edge && edge.sourceHandle !== "loop-back";
            },
          );
          const connectedEdges = getConnectedEdges([node], acc);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers
              .filter(({ id: target }) => target !== source) // ← ADD THIS
              .map(({ id: target }) => ({
                id: `${source}->${target}`,
                source,
                target,
                type: defaultNodeSettings.edgeType,
                markerEnd: defaultNodeSettings.defaultMarkerEnd,
              })),
          );

          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

          return [...remainingEdges, ...createdEdges];
        }, edges);

        setEdges(updatedEdges);

        // 5. Reorder nodes
        let reorderedNodes = computeNodeOrder(
          nodesAfterDeletion,
          updatedEdges,
          nodesAfterDeletion[0]?.id || null,
        );

        setNodes(reorderedNodes);

        // 6. Restore start node if needed
        if (isStartDeleted) {
          setNodes((prev) =>
            prev.map((node) =>
              node.data.order === 1
                ? { ...node, data: { ...node.data, isStart: true } }
                : node,
            ),
          );
        }

        // 7. Close drawer
        editStepDisclosureOnClose();
      };
    }
  }, [
    formikSetValues,
    editStepDisclosureOnClose,
    getIncomers,
    getOutgoers,
    getConnectedEdges,
    computeNodeOrder,
    defaultNodeSettings,
  ]);
  useEffect(() => {
    actionsRef.current.latestNodes = nodes;
    actionsRef.current.latestEdges = edges;
  }, [nodes, edges]);
  return (
    <ActionsContext.Provider value={actionsRef}>
      {/* <DebugContext name="ActionsContext" value={actionsRef} /> */}

      <UIContext.Provider value={uiValue}>
        {/* <DebugContext
          name="UIContext"
          value={{
            connectingSourceId,
            setConnectingSourceId,
            editable,
            variant,
          }}
        /> */}
        <FlagContext.Provider value={flagValue}>
          {/* <DebugContext
            name="FlagContext"
            value={{ flaggedSteps, setFlaggedSteps }}
          /> */}
          <AllowedTargetsContext.Provider value={allowedValue}>
            {/* <DebugContext
              name="AllowedTargetsContext"
              value={{ allowedTargetIds, setAllowedTargetIds }}
            /> */}
            {children}
          </AllowedTargetsContext.Provider>
        </FlagContext.Provider>
      </UIContext.Provider>
    </ActionsContext.Provider>
  );
}
