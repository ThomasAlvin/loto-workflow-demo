import defaultNodeSettings from "../constants/defaultNodeSettings";
import generalStepsData from "./generalStepsData";
import { v4 as uuid } from "uuid";

export default function getConditionalNode(
  conditionalNodeUuid,
  position,
  newNodeUuid,
  conditionalDataUuid,
  isEnd = false
) {
  return conditionalNodeUuid.map((nodeUuid, conditionIndex) => ({
    id: nodeUuid,
    type: "step",
    position: {
      x:
        position.x +
        (conditionIndex
          ? defaultNodeSettings.conditionalGap.x
          : -defaultNodeSettings.conditionalGap.x),
      y: position.y + defaultNodeSettings.conditionalGap.y,
    },
    data: {
      ...generalStepsData[0],
      // switch id to UID
      UID: conditionalDataUuid[conditionIndex],
      label: generalStepsData[0].name,
      condition_value: conditionIndex ? "Yes" : "No",
      parent_UID: newNodeUuid,
      isStart: false,
      isEnd: isEnd,
      // order: 1,
    },
  }));
}
