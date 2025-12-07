import { Flex } from "@chakra-ui/react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import defaultNodeSettings from "../constants/defaultNodeSettings";

export default function CustomReactFlowEdge({
  id,
  sourceHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  label,
  selected,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        style={{
          ...defaultNodeSettings.defaultStyle,
          stroke:
            sourceHandleId === "loop-back"
              ? selected
                ? "#009e73"
                : "#00CB94"
              : "",
        }}
        path={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <Flex
            fontWeight={700}
            position={"absolute"}
            transform={`translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`}
            background={"white"}
            p={"2px 10px"}
            minW={"40px"}
            justify={"center"}
            borderRadius={"5px"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            whiteSpace={"nowrap"}
            fontSize={"12px"}
            className="nodrag nopan"
          >
            {label}
          </Flex>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
