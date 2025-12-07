import { MarkerType } from "@xyflow/react";

const defaultNodeSettings = {
  edgeType: "custom",
  newStepGap: 240,
  conditionalGap: { x: 120, y: 240 },
  defaultStyle: { strokeWidth: 2 },
  defaultMarkerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: "#dc143c",
  },
};
export default defaultNodeSettings;
