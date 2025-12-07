import { Button, Flex } from "@chakra-ui/react";
import { useCallback } from "react";
import SelectAssignLock from "../CreateWorkOrder/SelectAssignLock";
import { FaPlus } from "react-icons/fa6";

export default function SelectLockAssignFormikProvider({
  editStepDrawerFormik,
  removeFn,
  pushFn,
  lockCheckboxHandler,
  selectHandler,
  filteredLockSelection,
  index,
  getCustomReactSelectStyles,
  handleCallToAction,
}) {
  const deleteLock = useCallback(
    (lockIndex) => {
      removeFn(lockIndex);
    },
    [removeFn],
  );
  return (
    <Flex flexDir={"column"}>
      <Flex flexDir={"column"} gap={"10px"}>
        {editStepDrawerFormik.values?.multiLockAccessGroup?.multiLockAccessGroupItems?.map(
          (value, workOrderLockIndex) => (
            <SelectAssignLock
              formikError={
                editStepDrawerFormik.errors?.multiLockAccessGroup
                  ?.multiLockAccessGroupItems?.[workOrderLockIndex]?.id
              }
              formikTouched={
                editStepDrawerFormik.touched?.multiLockAccessGroup
                  ?.multiLockAccessGroupItems?.[workOrderLockIndex]?.id
              }
              formikValidateForm={editStepDrawerFormik.validateForm}
              formikSetFieldTouched={editStepDrawerFormik.setFieldTouched}
              deleteLock={deleteLock}
              lockCheckboxHandler={lockCheckboxHandler}
              selectHandler={selectHandler}
              lockSelection={filteredLockSelection}
              value={value}
              index={workOrderLockIndex}
              stepIndex={index}
              getCustomReactSelectStyles={getCustomReactSelectStyles}
              handleCallToAction={handleCallToAction}
            />
          ),
        )}
      </Flex>
      <Flex pt={"10px"}>
        <Button
          onClick={() =>
            pushFn({
              name: "",
              id: "",
              require_lock_image: false,
              label: "New Lock",
              value: "",
            })
          }
          fontSize={"14px"}
          bg={"white"}
          minH={"0px"}
          h={"auto"}
          py={"5px"}
          px={"10px"}
          color={"#dc143c"}
          border={"dashed 2px #dc143c"}
        >
          <Flex gap={"5px"} alignItems={"center"}>
            <FaPlus />
            <Flex>Add Lock</Flex>
          </Flex>
        </Button>
      </Flex>
    </Flex>
  );
}
