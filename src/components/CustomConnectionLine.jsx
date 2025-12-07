import { getSmoothStepPath } from "@xyflow/react";

export default function CustomConnectionLine({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineStyle,
  strokeColor,
}) {
  const [path] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <defs>
        <marker
          id="custom-connection-arrow"
          markerWidth="7"
          markerHeight="7"
          viewBox="0 0 12 12"
          refX="12"
          refY="5"
          orient="auto"
        >
          <path
            d="M4,0 L10,5 L4,10 z"
            fill="#dc143c"
            stroke="#dc143c"
            strokeWidth="1"
          />
        </marker>
      </defs>

      <path
        fill="none"
        stroke={strokeColor || "#B1B1B7"}
        strokeWidth={2}
        d={path}
        markerEnd="url(#custom-connection-arrow)"
        style={connectionLineStyle}
      />
    </g>
  );
}
