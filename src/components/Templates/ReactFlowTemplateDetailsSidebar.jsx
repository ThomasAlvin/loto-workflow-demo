import {
  Avatar,
  Box,
  Button,
  Flex,
  Slide,
  useDisclosure,
} from "@chakra-ui/react";
import { IoCloseSharp } from "react-icons/io5";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { useReactFlow } from "@xyflow/react";
import CustomReactFlowNodeGhost from "../CustomReactFlowNodeGhost";
import ReactDOM from "react-dom";
import { useRef, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import LabelizeRole from "../../utils/LabelizeRole";
import moment from "moment";
import TableStatusStyleMapper from "../../utils/tableStatusStyleMapper";

export default function ReactFlowTemplateDetailsSidebar({ templateDetails }) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    defaultIsOpen: true,
  });
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const nodeGhostRef = useRef();
  const [ghostData, setGhostData] = useState({});
  const { getEdges, getNodes } = useReactFlow();
  const creator = templateDetails.template_access.find(
    (user) => user.role === "owner"
  );
  const { bgColor, textColor, icon, text } = TableStatusStyleMapper(
    templateDetails.status
  );
  const creatorInfo = creator?.super_admin
    ? {
        ...creator?.super_admin,
        role: LabelizeRole("super_admin"),
      }
    : {
        ...creator?.member,
        first_name: creator?.member?.user.first_name,
        last_name: creator?.member?.user.last_name,
        role: LabelizeRole(creator?.member?.role),
        employee_id: creator?.member?.employee_id,
      };
  return (
    <Flex h={"100%"} position={"relative"}>
      <Flex position={"relative"} overflow={"hidden"}>
        <Flex
          flexDir={"column"}
          overflow={"hidden"}
          // width={"250px"}
          w={isOpen ? "350px" : "0px"} // width animation
          transform={isOpen ? "translateX(0)" : "translateX(-100%)"} // move it off-screen
          position={"relative"}
          transition={"width 0.1s ease, transform 0.3s ease"} // animate both properties
        >
          <Flex
            h={"100%"}
            w={"350px"}
            pt={"10px"}
            borderRight={"1px solid #848484"}
            flexDir={"column"}
            gap={"16px"}
          >
            <Flex
              px={"14px"}
              alignItems={"center"}
              justify={"space-between"}
              fontWeight={700}
              fontSize={"20px"}
            >
              <Flex
                color={"#dc134c"}
                onClick={() => {
                  console.log("Nodes", getNodes());
                  console.log("Edges", getEdges());
                  console.log(templateDetails);
                }}
              >
                Template Details
              </Flex>
              <Flex cursor={"pointer"} onClick={onClose} fontSize={"20px"}>
                <IoCloseSharp />
              </Flex>
            </Flex>
            <Flex flexDir={"column"} px={"16px"} gap={"20px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Template Name :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex color={"#848484"}>{templateDetails.name}</Flex>
                </Flex>
              </Flex>
              {templateDetails.description ? (
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Description :
                  </Box>
                  <Flex
                    flexDir={"column"}
                    textAlign={"center"}
                    justifyContent={"space-between"}
                  >
                    <Flex color={"#848484"}>
                      {templateDetails.description || "Not set"}
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                ""
              )}

              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Access :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  color={"#848484"}
                  justifyContent={"space-between"}
                >
                  {templateDetails?.template_access?.map((value, index) => {
                    return (
                      <>
                        {value.role === "owner" ? (
                          <Flex>
                            {index + 1}.{" "}
                            {(value?.member?.user?.first_name ||
                              value?.super_admin?.first_name) +
                              " " +
                              (value?.member?.user?.last_name ||
                                value?.super_admin?.last_name)}
                            &nbsp; (Owner)
                          </Flex>
                        ) : (
                          <Flex>
                            {index + 1}.{" "}
                            {value?.member?.user?.first_name +
                              " " +
                              value?.member?.user?.last_name}
                          </Flex>
                        )}
                      </>
                    );
                  })}
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Creator :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  color={"#848484"}
                  justifyContent={"space-between"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    {creatorInfo.first_name ? (
                      <Avatar
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        name={
                          creatorInfo.first_name + " " + creatorInfo.last_name
                        }
                        src={
                          creatorInfo?.profile_image_url
                            ? IMGURL + creatorInfo?.profile_image_url
                            : null
                        }
                      ></Avatar>
                    ) : (
                      <Flex
                        outline={"1px solid #dc143c"}
                        bg={"#bababa"}
                        borderRadius={"100%"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        h={"48px"}
                        w={"48px"}
                        border={"2px solid white"}
                      >
                        <Flex color={"white"} fontSize={"24px"}>
                          <FaUserAlt />
                        </Flex>
                      </Flex>
                    )}

                    <Flex flexDir={"column"}>
                      <Flex
                        display={"inline-block"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        maxW={"200px"}
                        whiteSpace={"nowrap"}
                        color={"black"}
                        fontWeight={700}
                      >
                        {creatorInfo.first_name
                          ? creatorInfo.first_name + " " + creatorInfo.last_name
                          : "No Creator"}
                      </Flex>
                      <Flex fontSize={"14px"} color={"#848484"}>
                        {creatorInfo.role
                          ? LabelizeRole(creatorInfo.role) +
                            (creatorInfo?.employee_id
                              ? " - " + creatorInfo.employee_id
                              : "")
                          : "No Creator"}
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Status :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  color={"#848484"}
                  justifyContent={"space-between"}
                >
                  <Flex>
                    <Flex
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
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Last Published :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex color={"#848484"}>
                    {moment(templateDetails.updated_at).format(
                      "YYYY-MM-DD hh:mm A"
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        transition="opacity 0.3s ease"
        // opacity={sidebarClosed ? 1 : 0}
        position="absolute"
        top="50%"
        right="-25px"
        transform="translate(0%, -50%)"
        fontSize="24px"
        color="#dc134c"
        zIndex={"1"}
      >
        <Flex
          cursor={"pointer"}
          // pointerEvents={sidebarClosed ? "auto" : "none"}
          onClick={onToggle}
          w={"25px"}
          pr={"5px"}
          h={"50px"}
          justify={"center"}
          alignItems={"center"}
          background={"#f8f9fa"}
          border={"1px solid #dc143c"}
          borderLeft={"0px"}
          borderRadius={"0 50px 50px 0 "}
        >
          <Flex
            w={"100%"}
            h={"100%"}
            alignItems={"center"}
            transition="transform 0.3s ease"
            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
          >
            <FiChevronsRight />
          </Flex>
        </Flex>
      </Flex>
      <CustomReactFlowNodeGhost data={ghostData} nodeGhostRef={nodeGhostRef} />
    </Flex>
  );
}
