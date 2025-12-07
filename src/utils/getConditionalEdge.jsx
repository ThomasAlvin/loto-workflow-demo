import defaultNodeSettings from "../constants/defaultNodeSettings";

export default function getConditionalEdge(
  conditionalNodeUuid,
  parentNodeUuid,
) {
  return conditionalNodeUuid.map((nodeUuid, conditionalIndex) => ({
    id: `edge-${parentNodeUuid}-${nodeUuid}`,
    source: parentNodeUuid,
    target: nodeUuid,
    label: conditionalIndex ? "Yes" : "No",
    type: defaultNodeSettings.edgeType,
    markerEnd: defaultNodeSettings.defaultMarkerEnd,
  }));
}
