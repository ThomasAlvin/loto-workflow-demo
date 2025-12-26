import { Flex, useDisclosure } from "@chakra-ui/react";
import AddStepModal from "./AddStepModal";
import generalStepsData from "../../utils/generalStepsData";
import StepModal from "../CreateTemplate/StepModal";
import { IoCloseSharp } from "react-icons/io5";
import { FiChevronsRight } from "react-icons/fi";
import { useReactFlow } from "@xyflow/react";
import CustomReactFlowNodeGhost from "../CustomReactFlowNodeGhost";
import { useRef, useState } from "react";

export default function ReactFlowDragAndDropSidebar({
  flowWrapperRef,
  nextAlphabeticalSequence,
  formikSetValues,
  variant,
}) {
  const { isOpen, onClose, onToggle } = useDisclosure({
    defaultIsOpen: true,
  });
  const nodeGhostRef = useRef();
  const [ghostData, setGhostData] = useState({});
  const { getEdges, getNodes } = useReactFlow();
  const onDragStart = (event, val) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ label: val.name, ...val })
    );
    setGhostData({ label: val.name, ...val });
    event.dataTransfer.effectAllowed = "move";
    const ghost = nodeGhostRef.current;
    if (!ghost) return;

    const width = ghost.offsetWidth;
    const height = ghost.offsetHeight;

    event.dataTransfer.setDragImage(ghost, width / 2, height / 2);
  };

  return (
    <Flex h={"100%"} position={"relative"}>
      <Flex position={"relative"} overflow={"hidden"}>
        <Flex
          flexDir={"column"}
          overflow={"hidden"}
          // width={"250px"}
          w={isOpen ? "280px" : "0px"} // width animation
          transform={isOpen ? "translateX(0)" : "translateX(-100%)"} // move it off-screen
          position={"relative"}
          transition={"width 0.1s ease, transform 0.3s ease"} // animate both properties
        >
          <Flex
            h={"100%"}
            w={"280px"}
            pt={"10px"}
            borderRight={"1px solid #848484"}
            flexDir={"column"}
            // gap={"16px"}
          >
            <Flex
              px={"14px"}
              alignItems={"center"}
              justify={"space-between"}
              fontWeight={700}
              fontSize={"20px"}
            >
              <Flex color={"#dc134c"}>General Steps</Flex>
              <Flex cursor={"pointer"} onClick={onClose} fontSize={"20px"}>
                <IoCloseSharp />
              </Flex>
            </Flex>
            <Flex
              pt={"16px"}
              pb={"16px"}
              px={"14px"}
              borderBottom={"1px solid #bababa"}
              gap={"10px"}
              flexDir={"column"}
            >
              <Flex
                textAlign={"center"}
                fontSize={"12px"}
                color={"#848484"}
                justify={"center"}
              >
                You can drag and drop these steps
                <br /> to add to your workflow
              </Flex>
            </Flex>
            <Flex
              pt={"16px"}
              pb={"24px"}
              overflow={"auto"}
              flexDir={"column"}
              gap={"16px"}
            >
              <AddStepModal
                flowWrapperRef={flowWrapperRef}
                nextAlphabeticalSequence={nextAlphabeticalSequence}
                formikSetValues={formikSetValues}
                variant={variant}
              />
              <Flex px={"14px"} flexDir={"column"} gap={"16px"}>
                {generalStepsData?.map((val, index) => {
                  return (
                    <Flex
                      cursor={"grab"}
                      draggable
                      w={"100%"}
                      onDragStart={(e) => onDragStart(e, val)}
                    >
                      <StepModal val={val} />
                    </Flex>
                  );
                })}
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
