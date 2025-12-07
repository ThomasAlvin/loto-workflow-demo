import { Flex, Input, Textarea, Tooltip } from "@chakra-ui/react";
import { FaRegCircleQuestion, FaTriangleExclamation } from "react-icons/fa6";

export default function WorkOrderDetailsInput({
  workOrderTitleInputRef,
  formik,
  debouncedUpdateWorkOrderDetails,
  variant,
  workOrderDetailsInput,
  setWorkOrderDetailsInput,
}) {
  function inputHandler(event) {
    const { id, value } = event.target;
    const tempObject = { ...formik.values };
    tempObject[id] = value;
    setWorkOrderDetailsInput(tempObject);
    debouncedUpdateWorkOrderDetails(id, value);
  }

  return (
    <Flex flexDir={"column"} gap={"10px"}>
      <Flex
        flexDir={"column"}
        color={"black"}
        fontWeight={700}
        fontSize={"24px"}
      >
        <Flex color={"#dc143c"}>
          {variant === "edit" ? "Edit Work Orders" : "Create Work Orders"}
        </Flex>
        <Flex textAlign={"center"} fontSize={"12px"} color={"#848484"}>
          {variant === "edit"
            ? "Edit Title and Description"
            : "Add Title and Description"}
        </Flex>
      </Flex>

      <Flex
        w={"100%"}
        justifyContent={"center"}
        gap={"10px"}
        flexDir={"column"}
      >
        <Flex gap={"10px"}>
          <Flex w={"60%"} flexDir={"column"}>
            <Input
              ref={workOrderTitleInputRef}
              border={
                formik.touched.name && formik.errors.name
                  ? "1px solid crimson"
                  : "1px solid #bababa"
              }
              id="name"
              // onBlur={formik.handleBlur}
              value={workOrderDetailsInput.name}
              onChange={inputHandler}
              placeholder="Work order title"
            ></Input>
            {formik.touched.name && formik.errors.name && (
              <Flex
                color="crimson"
                fontSize="14px"
                gap="5px"
                alignItems="center"
              >
                <FaTriangleExclamation />
                <Flex>{formik.errors.name}</Flex>
              </Flex>
            )}
          </Flex>
          <Flex w={"40%"} flexDir={"column"}>
            <Flex position={"relative"} alignItems={"center"} gap={"10px"}>
              <Input
                border={"1px solid #bababa"}
                id="workOrderCustomId"
                // onBlur={formik.handleBlur}
                value={workOrderDetailsInput.workOrderCustomId}
                onChange={inputHandler}
                placeholder="Custom Work Order ID (Optional)"
              ></Input>

              <Tooltip
                hasArrow
                placement={"top"}
                maxW={"none"}
                label={
                  <Flex _hover={{ color: "black" }} whiteSpace={"nowrap"}>
                    An ID will be auto-generated if left blank.{" "}
                  </Flex>
                }
              >
                <Flex
                  position={"absolute"}
                  right={"-30px"}
                  color={"#848484"}
                  fontSize={"20px"}
                >
                  <FaRegCircleQuestion />
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>

        <Flex>
          <Textarea
            id="description"
            value={workOrderDetailsInput.description || ""}
            onChange={inputHandler}
            placeholder="Description (optional)"
            borderColor={"#bababa"}
          ></Textarea>
        </Flex>
      </Flex>
    </Flex>
  );
}
