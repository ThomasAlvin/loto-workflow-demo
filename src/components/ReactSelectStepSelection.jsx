import { Flex } from "@chakra-ui/react";
import { components } from "react-select";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
export default function ReactSelectStepSelection(props) {
  return (
    <components.Option {...props}>
      {props.data.value === "all" ? (
        <Flex fontWeight={700} alignItems={"center"}>
          <Flex>Select All Assigned Steps&nbsp;</Flex>
        </Flex>
      ) : (
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex flexDir={"column"}>
            {props.data ? (
              <Flex>
                <Flex
                  w={"100%"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex color={"crimson"} fontWeight={700}>
                      {props.data.stepIndex + 1}.
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex>{props.data?.name}</Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              <Flex color={"#848484"}>Not assigned yet</Flex>
            )}
          </Flex>
        </Flex>
      )}
    </components.Option>
  );
}
