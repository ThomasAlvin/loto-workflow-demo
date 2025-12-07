import { Flex, Tooltip } from "@chakra-ui/react";
import moment from "moment";
import TableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import { SlGlobe } from "react-icons/sl";
import { IoWarning } from "react-icons/io5";

export default function WorkOrderDetailsHeader({ workOrder, variant }) {
  const { bgColor, textColor, icon, text } = TableStatusStyleMapper(
    workOrder?.status
  );
  return (
    <Flex
      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      // bg={"#ededed"}
      w={"100%"}
      justify={"center"}
      flexDirection={"column"}
    >
      <Flex p={"20px"} bg={"white"} flexDir={"column"} gap={"10px"}>
        <Flex
          w={"100%"}
          alignItems={"center"}
          justify={"space-between"}
          color={"#dc143c"}
          background={"white"}
        >
          <Flex flexDir={"column"}>
            <Flex gap={"10px"} alignItems={"center"}>
              <Flex wordBreak={"break-word"} fontSize={"32px"} fontWeight={700}>
                {workOrder?.name}
              </Flex>
              {variant !== "review" ? (
                <Flex
                  h={"fit-content"}
                  fontWeight={700}
                  borderRadius={"10px"}
                  px={"8px"}
                  py={"4px"}
                  alignItems={"center"}
                  gap={"8px"}
                  bg={bgColor}
                  color={textColor}
                >
                  <Flex fontSize={"20px"}>{icon}</Flex>
                  <Flex>{text}</Flex>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
            <Flex color={"#848484"} fontWeight={700}>
              {workOrder?.work_order_custom_id}
            </Flex>
            <Flex gap={"5px"} color={"#848484"}>
              <Flex>{workOrder?.work_site?.name}</Flex>
              <Flex>-</Flex>
              {moment(workOrder?.started_at || workOrder?.created_at).format(
                "DD MMMM YYYY hh:mm A"
              )}{" "}
            </Flex>
          </Flex>
          <Flex fontSize={"64px"}>
            <SlGlobe />
          </Flex>
        </Flex>
        <Flex
          fontSize={"16px"}
          color={workOrder?.description ? "black" : "#848484"}
        >
          {workOrder?.description}
        </Flex>
        <Flex borderY={"1px solid #848484"} justify={"space-between"}>
          <Flex
            borderRight={"1px solid #848484"}
            flexDir={"column"}
            w={"33%"}
            gap={"10px"}
            p={"10px"}
          >
            <Flex fontSize={"14px"} color={"#848484"}>
              Total Steps
            </Flex>
            <Flex fontWeight={700} fontSize={"18px"}>
              {workOrder?.work_order_steps.length}
            </Flex>
          </Flex>
          <Flex
            borderRight={"1px solid #848484"}
            flexDir={"column"}
            w={"33%"}
            gap={"10px"}
            p={"10px"}
          >
            <Flex fontSize={"14px"} color={"#848484"}>
              Completion Time
            </Flex>
            <Flex
              color={workOrder?.is_overdue ? "#dc143c" : "black"}
              fontWeight={700}
              fontSize={"18px"}
              alignItems={"center"}
              gap={"5px"}
            >
              {workOrder?.finished_at
                ? moment(workOrder?.finished_at).format("DD MMMM YYYY hh:mm A")
                : "-"}
              {workOrder?.is_overdue ? (
                <Tooltip
                  label="This work order was completed past its deadline."
                  hasArrow
                  placement="top"
                  bg={"#dc143c"}
                >
                  <Flex fontSize={"20px"}>
                    <IoWarning />
                  </Flex>
                </Tooltip>
              ) : (
                ""
              )}
            </Flex>
          </Flex>
          <Flex p={"10px"} flexDir={"column"} w={"33%"} gap={"10px"}>
            <Flex fontSize={"14px"} color={"#848484"}>
              Deadline Time
            </Flex>
            <Flex
              fontWeight={700}
              color={workOrder?.deadline_date_time}
              fontSize={"18px"}
            >
              {workOrder?.deadline_date_time
                ? moment(workOrder?.deadline_date_time).format(
                    "DD MMMM YYYY hh:mm A"
                  )
                : "-"}{" "}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
