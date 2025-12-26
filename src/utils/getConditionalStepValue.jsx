import generalStepsData from "./generalStepsData";

export default function getConditionalStepValue(newNodeUuid, newConditionUuid) {
  return [
    {
      ...generalStepsData[0],
      // switch id to UID
      UID: newConditionUuid[0],
      condition_value: "No",
      parent_UID: newNodeUuid,
    },
    {
      ...generalStepsData[0],
      // switch id to UID
      UID: newConditionUuid[1],
      condition_value: "Yes",
      parent_UID: newNodeUuid,
    },
  ];
}
