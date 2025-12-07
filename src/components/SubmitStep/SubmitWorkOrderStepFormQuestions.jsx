import { Box, Flex } from "@chakra-ui/react";
import SubmitQuestionTypeMapper from "../../utils/SubmitQuestionTypeMapper";
import { useRef, useState } from "react";

export default function SubmitWorkOrderStepFormQuestions({
  formQuestionCounterIndex,
  index,
  val,
  register,
  errors,
  getValues,
  setValue,
  trigger,
}) {
  return (
    <Flex
      bg={"white"}
      flexDir={"column"}
      p={"20px"}
      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      gap={"10px"}
    >
      <Flex gap={"10px"} fontWeight={700}>
        <Flex color={"#dc143c"}>{index + 1}.</Flex>
        <Flex flexDir={"column"}>
          <Flex>
            {val.question}&nbsp;
            {val.is_required ? (
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            ) : (
              ""
            )}
          </Flex>

          {val.question_type === "Image" ? (
            <Flex fontSize={"14px"} color={"#848484"} fontWeight={"400"}>
              You can upload up to 5 images, with a maximum file size of 2MB
              each.
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
      <Flex px={"24px"}>
        <SubmitQuestionTypeMapper
          type={val.question_type}
          options={val.options}
          register={register}
          registerId={`workOrderFormQuestions[${formQuestionCounterIndex}].response`}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          format={val.format}
          unit={val.unit}
          include_date={val.include_date}
          include_time={val.include_time}
          trigger={trigger}
        />
      </Flex>
    </Flex>
  );
}
