import { Flex, Input, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";

export default function TemplateDetailsInput({
  formik,
  templateDetails,
  templateTitleInputRef,
  debouncedUpdateTemplateDetails,
  variant,
}) {
  const [detailsInput, setDetailsInput] = useState({ ...templateDetails });
  function inputHandler(event) {
    const { id, value } = event.target;
    debouncedUpdateTemplateDetails(id, value);
  }

  useEffect(() => {
    setDetailsInput(templateDetails);
  }, [templateDetails]);
  return (
    <Flex flexDir={"column"} gap={"20px"}>
      <Flex
        flexDir={"column"}
        color={"black"}
        fontWeight={700}
        fontSize={"24px"}
      >
        <Flex color={"#dc143c"}>
          {variant === "edit" ? "Edit Template" : "Create Template"}
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
        gap={"20px"}
        flexDir={"column"}
      >
        <Flex flexDir={"column"}>
          <Input
            ref={templateTitleInputRef}
            border={
              formik.touched.name && formik.errors.name
                ? "1px solid crimson"
                : "1px solid #bababa"
            }
            id="name"
            // onBlur={formik.handleBlur}
            onChange={inputHandler}
            defaultValue={detailsInput.name}
            placeholder="Template Title"
          ></Input>
          {formik.touched.name && formik.errors.name && (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{formik.errors.name}</Flex>
            </Flex>
          )}
        </Flex>

        <Flex>
          <Textarea
            id="description"
            onChange={inputHandler}
            defaultValue={detailsInput.description}
            placeholder="Description (optional)"
            borderColor={"#bababa"}
          ></Textarea>
        </Flex>
      </Flex>
    </Flex>
  );
}
