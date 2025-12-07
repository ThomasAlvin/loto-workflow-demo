import { Flex } from "@chakra-ui/react";
import { memo, useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { FiChevronsLeft } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import generalStepsData from "../utils/generalStepsData";
import StepModal from "./CreateTemplate/StepModal";
function CreateTemplateAndWorkOrderSidebarMemo() {
  const [sidebarClosed, setSidebarClosed] = useState(true);

  return (
    <>
      <Flex
        shadow="0px 0px 3px rgba(50, 50, 93, 0.5)"
        display={sidebarClosed ? "none" : "flex"}
        w={sidebarClosed ? "0px" : "440px"}
        // maxW={sidebarClosed ? "0px" : "440px"}
        position="sticky"
        h="100vh"
        top="0"
        right="0"
        transition="width 0.3s ease, opacity 0.3s ease"
        opacity={sidebarClosed ? 0 : 1}
        bg={"#F8F9FA"}
      >
        <Flex w={"100%"} py={"20px"} flexDir={"column"} gap={"10px"}>
          <Flex
            pl={"20px"}
            pr={"10px"}
            alignItems={"center"}
            justify={"space-between"}
            fontWeight={700}
            fontSize={"20px"}
          >
            <Flex color={"#dc134c"}>General Steps</Flex>
            <Flex
              cursor={"pointer"}
              onClick={() => setSidebarClosed((prevValue) => !prevValue)}
              fontSize={"28px"}
            >
              <IoCloseSharp />
            </Flex>
          </Flex>
          <Flex
            pb={"10px"}
            borderBottom={"1px solid #bababa"}
            px={"20px"}
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
            className="template-step-sidebar"
            pt={"10px"}
            pb={"40px"}
            px={"20px"}
          >
            <Droppable
              direction="vertical"
              style={{
                // height: "100vh",
                // overflowY: "auto",
                position: "sticky",
              }}
              isDropDisabled={true}
              droppableId={"GeneralSidebar"}
            >
              {(provided, snapshot) => {
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      width: "100%",
                    }}
                  >
                    <Flex flexDir={"column"} w={"100%"}>
                      {generalStepsData?.map((val, index) => {
                        return (
                          <Draggable
                            key={val.id}
                            draggableId={String(val.id)}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              return (
                                <>
                                  <Flex
                                    mb={"10px"}
                                    w={"100%"}
                                    ref={provided.innerRef}
                                    {...provided.dragHandleProps}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      userSelect: "none",
                                      transform: snapshot.isDragging
                                        ? provided.draggableProps.style
                                            ?.transform
                                        : "translate(0px, 0px)",
                                    }}
                                  >
                                    <StepModal val={val} />
                                  </Flex>
                                  {snapshot.isDragging && (
                                    <Flex
                                      style={{ transform: "none !important" }}
                                      mb={"10px"}
                                      w={"100%"}
                                      opacity={0.5}
                                    >
                                      <StepModal
                                        val={val}
                                        index={index}
                                        // title={val.name}
                                        // draftedSteps={draftedSteps}
                                        // variant={"workOrder"}
                                        // setWorkOrderDetails={
                                        // setWorkOrderDetails
                                        // }
                                      />
                                    </Flex>
                                  )}
                                </>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                    </Flex>
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        transition="opacity 0.3s ease"
        opacity={sidebarClosed ? 1 : 0}
        position="fixed"
        top="50%"
        right="0%"
        transform="translate(0%, -50%)"
        fontSize="24px"
        color="#dc134c"
      >
        <Flex
          cursor={"pointer"}
          pointerEvents={sidebarClosed ? "auto" : "none"}
          onClick={() => setSidebarClosed((prevState) => !prevState)}
          w={"40px"}
          h={"80px"}
          justify={"center"}
          alignItems={"center"}
          background={"#f8f9fa"}
          border={"1px solid #dc143c"}
          borderRight={"0px"}
          borderRadius={"500px 0 0 500px"}
        >
          <FiChevronsLeft />
        </Flex>
      </Flex>
    </>
  );
}
const CreateTemplateAndWorkOrderSidebar = memo(
  CreateTemplateAndWorkOrderSidebarMemo
);
export default CreateTemplateAndWorkOrderSidebar;
