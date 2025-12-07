import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import ResponseTypeMapper from "../../utils/ResponseTypeMapper";
import QuestionTypeIconMapper from "../../utils/QuestionTypeIconMapper";
import InspectionQuestionAccordion from "../InspectionQuestionAccordion";

export default function WorkOrderDetailsFormQuestion({
  val,
  index,
  submissionIndex,
  handleImageFocus,
}) {
  return (
    <Flex>
      {val.submissions?.length ? (
        <Flex w={"100%"} flexDir={"column"}>
          <Flex fontWeight={700}>
            <Flex>{index + 1}.&nbsp;</Flex>
            <Flex>{val.question}</Flex>
          </Flex>
          <Flex pl={"18px"} color={val.response ? "black" : "#848484"}>
            <ResponseTypeMapper
              type={val.question_type}
              submissions={val.submissions}
              submissionIndex={submissionIndex}
              options={val.options}
              format={val.format}
              unit={val.unit}
              include_date={val.include_date}
              include_time={val.include_time}
              handleImageFocus={handleImageFocus}
            />
          </Flex>
        </Flex>
      ) : (
        <Flex
          w={"100%"}
          color={"#848484"}
          shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        >
          <InspectionQuestionAccordion
            question={val?.question || val?.title}
            type={val?.question_type || val?.type.title}
            required={val?.required || val?.is_required}
            format={val?.format || val?.type?.format}
            includeDate={val?.include_date || val?.type?.date}
            includeTime={val?.include_time || val?.type?.time}
            unit={val?.unit || val?.type?.unit}
            options={val?.options || val?.type?.options}
          />
        </Flex>
      )}
    </Flex>
  );
}
