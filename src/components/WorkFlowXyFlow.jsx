import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  addEdge,
  useOnSelectionChange,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomReactFlowNode from "./CustomReactFlowNode";
import { FaPlus } from "react-icons/fa";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap } from "react-icons/md";
import { v4 as uuid } from "uuid";
import CustomReactFlowControls from "./CustomReactFlowControls";
import ReactFlowDragAndDropSidebar from "./CreateEditWorkOrderTemplate/ReactFlowDragAndDropSidebar";
import defaultNodeSettings from "../constants/defaultNodeSettings";
import computeNodeOrder from "../utils/computeNodeOrder";
import getConnectedNodes from "../utils/getConnectedNodes";
import { useDeleteContext } from "../service/DeleteMultiLockAccessContext";
import CustomReactFlowEdge from "./CustomReactFlowEdge";
import getConditionalEdge from "../utils/getConditionalEdge";
import getConditionalNode from "../utils/getConditionalNode";
import getConditionalStepValue from "../utils/getConditionalStepValue";
import ConfirmationModal from "./ConfirmationModal";
import deleteNodeValidator from "../utils/deleteNodeValidator";
import ReactFlowTemplateDetailsSidebar from "./Templates/ReactFlowTemplateDetailsSidebar";
import { IoMdClose } from "react-icons/io";
import getLocalDescendantNodesById from "../utils/getLocalDescendantNodesById";
import CustomConnectionLine from "./CustomConnectionLine";
import findAncestorConditions from "../utils/findAncestorConditions";
import reactFlowConnectValidation from "../utils/reactFlowConnectValidation";
import { getAllowedLoopTargets } from "../utils/getAllowedLoopTargets";
import { getAllowedLoopTargetsLatest } from "../utils/getAllowedLoopTargetsLatest";
import { memoPropsComparator } from "../debugging/memoPropsComparator";
import {
  ActionsContext,
  AllowedTargetsContext,
  UIContext,
} from "../service/FlowProvider";
const nodeTypes = {
  step: CustomReactFlowNode,
};

const edgeTypes = {
  custom: CustomReactFlowEdge, // 👈 register your custom edge type
};
function WorkFlowXyFlowMemo({
  editStepDisclosureOnClose,
  // deleteStep,
  deleteEdges,
  flowWrapperRef,
  nextAlphabeticalSequence,
  formikSetValues,
  formikWorkOrderStepsErrors,
  formikWorkOrderSteps,
  handleOpenEditStepModal,
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodesChange,
  onEdgesChange,
  variant = "workOrder",
  editable = true,
  fullScreen,
  templateDetails,
  templateOnClose,
}) {
  // console.log("WorkFlowXyFlow Rerendered");

  const actionsRef = useContext(ActionsContext);
  const { deleteStep } = actionsRef.current;

  const { isOpen, deleteTarget, openDeleteConfirm, closeDeleteConfirm } =
    useDeleteContext();
  const { setConnectingSourceId, connectingSourceId } = useContext(UIContext);
  const { allowedTargetIds, setAllowedTargetIds } = useContext(
    AllowedTargetsContext,
  );

  const toast = useToast();
  const [isFullScreen, setIsFullScreen] = useState(fullScreen || false);
  const [lockInteractivity, setLockInteractivity] = useState(false);
  const reactFlowInstance = useRef();
  const defaultEdgeOptions = {
    type: defaultNodeSettings.edgeType,
    markerEnd: defaultNodeSettings.defaultMarkerEnd,
  };
  const connectionLineStyle = {
    strokeWidth: 2,
  };
  const proOptions = { hideAttribution: true };
  const snapGrid = [5, 5];
  const nodeOrigin = [0.5, 0.5];

  const onConnect = useCallback(
    (params) => {
      const targetId = params.target;
      const sourceId = params.source;

      const sourceNode = nodes.find((node) => node.id === sourceId);
      const targetNode = nodes.find((node) => node.id === targetId);

      const isValid = reactFlowConnectValidation(
        nodes,
        edges,
        sourceNode,
        targetNode,
        params.sourceHandle,
        toast,
      );
      if (!isValid) {
        return;
      }
      let afterConnectionEdges = addEdge(params, edges);

      setEdges(afterConnectionEdges);

      if (params.sourceHandle === "normal") {
        let reorderedNodes = computeNodeOrder(
          nodes,
          afterConnectionEdges,
          nodes[0]?.id || null,
        );
        const localDescendant = getLocalDescendantNodesById(
          targetId,
          edges,
          nodes,
        ).descendantNodes;
        const isSourceConditionalChild = sourceNode?.data?.condition_value
          ? true
          : false;
        setNodes(
          reorderedNodes.map((nds, ndsIndex) => {
            return {
              ...nds,
              data: {
                ...nds.data,
                isEnd: false,
                ...(isSourceConditionalChild &&
                (localDescendant.some(
                  (locDescNode) => nds.id === locDescNode.id,
                ) ||
                  nds.id === params.target)
                  ? {
                      parent_UID: sourceNode?.data?.parent_UID,
                      condition_value: sourceNode?.data?.condition_value,
                    }
                  : {}),
              },
            };
          }),
        );
      } else if (params.sourceHandle === "loop-back") {
        setNodes(
          nodes.map((nds, ndsIndex) => {
            if (nds.id === sourceId) {
              return {
                ...nds,
                data: {
                  ...nds.data,
                  // switch id to UID
                  // loop_target_UID: targetNode.data.id,
                  loop_target_UID: targetNode.data.UID,
                },
              };
            }
            return nds;
          }),
        );
      }
    },
    [nodes, edges],
  );

  const onConnectStart = useCallback(
    (event, params) => {
      if (params.handleId !== "loop-back") return;

      const sourceNode = nodes.find((n) => n.id === params.nodeId);
      if (!sourceNode) return;

      // 1. Store the connecting source id
      setConnectingSourceId(sourceNode.id);

      // 2. Compute allowed targets ONCE
      const allowedTargets = getAllowedLoopTargetsLatest(nodes, sourceNode);
      console.log(allowedTargets);

      // switch id to UID
      // setAllowedTargetIds(new Set(allowedTargets.map((n) => n.data.id)));
      setAllowedTargetIds(new Set(allowedTargets.map((n) => n.data.UID)));
    },
    [nodes],
  );

  const onConnectEnd = useCallback(() => {
    setConnectingSourceId(null);
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      let dragData = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      );
      // switch id to UID
      dragData = { ...dragData, UID: uuid() };

      if (dragData.multiLockAccess) {
        dragData = {
          ...dragData,
          ...(dragData.multiLockAccess
            ? {
                multiLockAccessStepIndex: 0,
                multiLockAccessGroup: {
                  name: nextAlphabeticalSequence,
                  totalStep: 0,
                  // Hide preassign feature
                  isPreAssigned: true,
                  multiLockAccessGroupItems: [
                    {
                      name: "",
                      id: "",
                      label: "",
                      value: "",
                    },
                  ],
                  // isPreAssigned: false,
                },
              }
            : {}),
        };
      }

      if (!dragData) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNodeUuid = uuid();
      const conditionalNodeUuid = [uuid(), uuid()];
      const conditionalDataUuid = [uuid(), uuid()];
      const startNode = nodes.find((n) => n.data.isStart);
      const orderedNodes = startNode ? getConnectedNodes(startNode, edges) : [];
      const lastOrderedNode = nodes.find(
        (nd) => nd.id === Array.from(orderedNodes).pop(),
      );
      formikSetValues((prevState) => {
        return {
          ...prevState,
          [variant === "template" ? "templateSteps" : "workOrderSteps"]: [
            ...(variant === "template"
              ? prevState.templateSteps
              : prevState.workOrderSteps),
            dragData,
            ...(dragData.condition
              ? // switch id to UID
                getConditionalStepValue(dragData.UID, conditionalDataUuid)
              : []),
          ],
        };
      });

      // Calculate New Edges value first
      let updatedEdges;

      const newEdge =
        lastOrderedNode && !lastOrderedNode.data.condition_value
          ? {
              id: `edge-${lastOrderedNode.id}-${newNodeUuid}`,
              source: lastOrderedNode.id,
              target: newNodeUuid,
              type: defaultNodeSettings.edgeType,
              markerEnd: defaultNodeSettings.defaultMarkerEnd,
            }
          : null;
      const allNewEdges = [
        ...(newEdge ? [newEdge] : []),
        ...(dragData.condition
          ? getConditionalEdge(conditionalNodeUuid, newNodeUuid)
          : []),
      ];
      updatedEdges = [...edges, ...allNewEdges];
      // Calculate New Edges value first

      // Calculate Node value after edge because edge is needed to determine node order
      let updatedNodes;
      if (nodes.length === 0) {
        // Add updated nodes and conditional steps if condition is true
        updatedNodes = [
          {
            id: newNodeUuid,
            type: "step",
            position,
            data: {
              ...dragData,
              isStart: true,
              isEnd: true,
              order: 1,
            },
          },
          ...(dragData.condition
            ? getConditionalNode(
                conditionalNodeUuid,
                position,
                // switch id to UID
                dragData.UID,
                conditionalDataUuid,
              )
            : []),
        ];
        // Reorder the nodes based on edges
      } else {
        // Remove isEnd on all nodes
        updatedNodes = nodes.map((node) =>
          node.data.isEnd
            ? {
                ...node,
                data: { ...node.data, isEnd: false },
              }
            : node,
        );
        // Add new node and conditional step if node has condition true
        updatedNodes = [
          ...updatedNodes,
          {
            id: newNodeUuid,
            type: "step",
            position,
            data: {
              ...dragData,
              isStart: false,
              isEnd: true,
              order: orderedNodes.size + 1,
            },
          },
          ...(dragData.condition
            ? getConditionalNode(
                conditionalNodeUuid,
                position,
                // switch id to UID
                dragData.UID,
                conditionalDataUuid,
              )
            : []),
        ];
        // Reorder the nodes based on edges
      }
      updatedNodes = computeNodeOrder(
        updatedNodes,
        updatedEdges,
        nodes.length === 0 ? newNodeUuid : updatedNodes[0].id,
      );
      // Calculate Node value after edge because edge is needed to determine node order
      console.log(updatedNodes);

      setNodes(updatedNodes);
      setEdges(updatedEdges);
    },
    [nodes, edges],
  );

  const onInit = (instance) => {
    reactFlowInstance.current = instance; // capture instance
    console.log("Flow loaded:", instance);
  };
  const handleNodeClick = useCallback(
    (event, node) => {
      handleOpenEditStepModal({ ...node.data, nodeId: node.id });
    },
    [handleOpenEditStepModal],
  );
  const handlePaneClick = useCallback(() => {
    editStepDisclosureOnClose();
  }, [editStepDisclosureOnClose]);
  const connectionLineComponent = useCallback(
    (props) => (
      <CustomConnectionLine
        {...props}
        strokeColor={connectingSourceId ? "#80d9bf" : "#B1B1B7"}
      />
    ),
    [connectingSourceId],
  );
  // Escape full screen when esc is pressed
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false); // exit fullscreen
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Delete selected node when backspace is pressed
  useEffect(() => {
    const handleKeyDown = (e, withConfirmationCheck = true) => {
      if (!editable) return;
      const target = e.target;
      const tagName = target.tagName;
      const isEditable =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isEditable) return; // exit early

      if (e.key === "Backspace" || e.key === "Delete") {
        // get currently selected nodes

        const selectedNodes = nodes.filter((n) => n.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        deleteNodeValidator(
          selectedNodes,
          nodes,
          edges,
          openDeleteConfirm,
          toast,
          deleteStep,
        );

        if (selectedEdges.length > 0) {
          let hasCondition = false;
          selectedEdges.map((edge) => {
            const sourceNode = nodes.find((node) => node.id === edge.source);
            if (sourceNode.data.condition) hasCondition = true;
          });
          if (hasCondition) {
            toast.closeAll();
            toast({
              title: "Cannot Delete This Connection",
              description: "Each condition branch must have at least one step.",
              status: "error",
              duration: 3000,
              position: "top",
              isClosable: true,
            });
          } else {
            deleteEdges(selectedEdges);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges]);
  useEffect(() => {
    if (variant !== "workOrder") return;
    setNodes((prev) => {
      // Create a shallow copy, but only modify specific elements
      let changed = false;
      const next = [...prev];

      for (let i = 0; i < prev.length; i++) {
        const n = prev[i];
        const idx = formikWorkOrderSteps.findIndex((s) => {
          return s.UID === n.data.UID;
        });

        const nextHasError = Boolean(formikWorkOrderStepsErrors?.[idx]);
        const prevHasError = n.data.hasError;

        if (nextHasError !== prevHasError) {
          // Update only THE node that needs change
          next[i] = {
            ...n,
            data: {
              ...n.data,
              hasError: nextHasError,
            },
          };
          changed = true;
        }
      }

      // ❗ If NOTHING changed, return the exact same array instance
      if (!changed) return prev;

      return next;
    });
  }, [formikWorkOrderStepsErrors, formikWorkOrderSteps]);
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      const selectedNodeIds = nodes.map((n) => n.id);

      // 1. Mark the selected nodes
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          selected: selectedNodeIds.includes(node.id),
        })),
      );

      // 2. Edge selection ALWAYS disabled
      setEdges((prev) =>
        prev.map((edge) => ({
          ...edge,
          selected: false, // <- critical
        })),
      );
    },
  });
  return (
    <>
      {/* Is needed when user escape fullscreen so it doesnt mess up the overflow when minimizing */}
      <Flex display={isFullScreen ? "Flex" : "none"} pb={"1000px"}></Flex>
      <Flex
        top={0}
        left={0}
        position={isFullScreen ? "fixed" : "static"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        w={isFullScreen ? "100vw" : "100%"}
        h={isFullScreen ? "100vh" : "100%"}
        bg={"white"}
        zIndex={isFullScreen ? 11 : 9}
      >
        <Flex
          display={editable ? "flex" : "none"}
          h={isFullScreen ? "100%" : "600px"}
        >
          <ReactFlowDragAndDropSidebar
            flowWrapperRef={flowWrapperRef}
            nextAlphabeticalSequence={nextAlphabeticalSequence}
            formikSetValues={formikSetValues}
            variant={variant}
          />
        </Flex>
        {variant === "templateDetails" ? (
          <Flex h={isFullScreen ? "100%" : "600px"}>
            <ReactFlowTemplateDetailsSidebar
              templateDetails={templateDetails}
            />
          </Flex>
        ) : (
          ""
        )}

        <Flex
          position="relative"
          ref={flowWrapperRef}
          flexDir={"column"}
          flex={1}
          bg={"#f8f9fa"}
          h={isFullScreen ? "100%" : "600px"}
        >
          <ReactFlowDebug
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={onInit}
            defaultEdgeOptions={defaultEdgeOptions}
            // connectionLineComponent={CustomConnectionLine}
            connectionLineComponent={connectionLineComponent}
            connectionLineType={"smoothstep"}
            connectionLineStyle={connectionLineStyle}
            // panOnDrag={false}
            // deleteKeyCode={8}
            deleteKeyCode={null}
            proOptions={proOptions}
            snapToGrid={true}
            snapGrid={snapGrid}
            nodeOrigin={nodeOrigin}
            minZoom={0.3}
            connectionRadius={30}
            // panOnDrag={!lockInteractivity}
            // zoomOnScroll={!lockInteractivity}
            // zoomOnPinch={!lockInteractivity}
            nodesDraggable={editable ? !lockInteractivity : false}
            nodesConnectable={editable ? !lockInteractivity : false}
          >
            <CustomReactFlowControls
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              fullScreen={fullScreen}
              setLockInteractivity={setLockInteractivity}
              lockInteractivity={lockInteractivity}
              editable={editable}
              formikSetValues={formikSetValues}
              variant={variant}
            />
            {variant === "templateDetails" ? (
              <Flex
                position={"absolute"}
                top={"5px"}
                right={"5px"}
                zIndex={10}
                gap={"10px"}
              >
                <Flex
                  p={"5px"}
                  w={"34px"}
                  h={"34px"}
                  onClick={() => templateOnClose()}
                  _hover={{ color: "#dc143c" }}
                  cursor={"pointer"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Flex fontSize={"24px"} flexDir={"column"} gap={"10px"}>
                    <Icon as={IoMdClose}></Icon>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              ""
            )}

            {/* <Controls /> */}
            <Background variant="lines" color="#dedede" />
          </ReactFlowDebug>
        </Flex>
      </Flex>
    </>
  );
}

const WorkFlowXyFlow = memo(
  WorkFlowXyFlowMemo,
  memoPropsComparator("WorkFlowXyFlow"),
);

export default WorkFlowXyFlow;

const ReactFlowDebug = memo((props) => {
  // console.log("%c<ReactFlow> re-rendered", "color: red");
  return <ReactFlow {...props} />;
});
