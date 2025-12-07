import { Flex } from "@chakra-ui/react";
import { components } from "react-select";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
export default function ReactSelectStepSelection(props) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    props.data.status
  );
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
                  // borderRadius={"5px"}
                  // bg={"white"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex color={"crimson"} fontWeight={700}>
                      {props.data.stepIndex + 1}.
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex>{props.data?.name}</Flex>
                      {/* <Flex
                        fontWeight={700}
                        borderRadius={"10px"}
                        px={"8px"}
                        py={"4px"}
                        alignItems={"center"}
                        gap={"8px"}
                        bg={bgColor}
                        color={textColor}
                        fontSize={"14px"}
                      >
                        <Flex fontSize={"18px"}>{icon}</Flex>
                        <Flex>{text}</Flex>
                      </Flex> */}
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
