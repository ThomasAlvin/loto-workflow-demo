import { Flex } from "@chakra-ui/react";
import { memo } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import ReactSelect from "react-select";
import dynamicPropsComparator from "../../utils/dynamicPropsComparator";

function SelectAssignLockMemo({
  // formik,
  formikError,
  formikTouched,
  formikValidateForm,
  formikSetFieldTouched,
  deleteLock,
  selectHandler,
  lockCheckboxHandler,
  lockSelection,
  value,
  index,
  stepIndex,
  getCustomReactSelectStyles,
  handleCallToAction,
}) {
  return (
    <Flex flexDir={"column"}>
      <Flex gap={"10px"} w={"100%"} flexDir={"column"}>
        <Flex w={"100%"} alignItems={"center"}>
          <Flex
            whiteSpace={"nowrap"}
            color={"#dc143c"}
            fontSize={"15px"}
            fontWeight={700}
            onClick={() => {
              console.log(lockSelection);
              console.log(value);
            }}
          >
            Lock {index + 1} : &nbsp;
          </Flex>
          <Flex pr={"8px"} overflow={"visible"} w={"100%"} flexDir={"column"}>
            <ReactSelect
              classNamePrefix={"react-select"}
              placeholder="Select the lock you want to assign"
              onBlur={() => {
                formikValidateForm();
                formikSetFieldTouched(
                  `workOrderSteps[${stepIndex}].multiLockAccessGroup.multiLockAccessGroupItems[${index}].id`,
                  true
                );
              }}
              styles={getCustomReactSelectStyles("lock", index)}
              isSearchable
              isClearable
              // value={value}
              value={value?.id ? value : null}
              onChange={(event) => {
                selectHandler(event, "lock", index);
              }}
              options={lockSelection}
              noOptionsMessage={() => (
                // Disabled for production
                // <Flex
                //   flexDir={"column"}
                //   justify={"center"}
                //   alignItems={"center"}
                //   fontWeight={700}
                //   py={"30px"}
                // >
                //   <Flex color={"#848484"}>No Locks found</Flex>
                //   <Flex color={"#dc143c"}>
                //     <Flex
                //       cursor={"pointer"}
                //       textDecoration={"underline"}
                //     >
                //       Add a new lock now
                //     </Flex>
                //     <Flex>&nbsp;to get started!</Flex>
                //   </Flex>
                // </Flex>
                <Flex
                  flexDir={"column"}
                  justify={"center"}
                  alignItems={"center"}
                  fontWeight={700}
                  py={"30px"}
                >
                  <Flex color={"#848484"}>No Locks found</Flex>
                  <Flex color={"#dc143c"}>
                    <Flex>
                      Please add a new lock through the mobile app to get
                      started!
                    </Flex>
                  </Flex>
                </Flex>
              )}
            />
          </Flex>

          <Flex
            onClick={() => {
              if (index) {
                deleteLock(index);
              }
            }}
            opacity={index ? 1 : 0.6}
            fontSize={"20px"}
            cursor={index ? "pointer" : "default"}
            _hover={{ color: index ? "#dc143c" : "black" }}
          >
            <IoCloseSharp />
          </Flex>
        </Flex>

        {/* Disable Require Lock Image */}
        {/* <Flex gap={"10px"}>
          <Flex gap={"10px"} alignItems={"center"}>
            <Checkbox
              bg={"white"}
              defaultChecked={value?.require_lock_image}
              onChange={(event) => {
                lockCheckboxHandler(event, index);
              }}
              size={"md"}
            >
              <Flex
                color={value?.require_lock_image ? "#3182CE" : "#848484"}
                fontWeight={700}
                fontSize={"14px"}
              >
                Require Lock Image on Submission
              </Flex>
            </Checkbox>
          </Flex>
        </Flex> */}
        {
          // Array.isArray(formik.errors.workOrderSteps) &&
          // Array.isArray(
          //   formik.errors.workOrderSteps[stepIndex]?.work_order_locks
          // ) &&
          // formik.errors.workOrderSteps[stepIndex]?.work_order_locks[index]?.id &&
          // Array.isArray(formik.touched.workOrderSteps) &&
          // Array.isArray(
          //   formik.touched.workOrderSteps[stepIndex]?.work_order_locks
          // ) &&
          // formik.touched.workOrderSteps[stepIndex]?.work_order_locks[index]
          //   ?.id
          formikError && formikTouched ? (
            <Flex
              py={"4px"}
              px={"8px"}
              alignItems={"center"}
              gap={"5px"}
              color={"#dc143c"}
              fontSize={"14px"}
              bg={"#FDE2E2"}
            >
              <Flex>
                <FaTriangleExclamation />
              </Flex>
              <Flex>{formikError}</Flex>
            </Flex>
          ) : (
            ""
          )
        }
      </Flex>
    </Flex>
  );
}
// const SelectAssignLock = memo(SelectAssignLockMemo, () => false);
const SelectAssignLock = memo(SelectAssignLockMemo, dynamicPropsComparator);
export default SelectAssignLock;
