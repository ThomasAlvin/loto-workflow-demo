import { Flex, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

import { AiOutlineEye } from "react-icons/ai";
import { FaCogs } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import { IoMdCheckmark } from "react-icons/io";
import { LuNetwork } from "react-icons/lu";
import { TiClipboard } from "react-icons/ti";
import tinycolor from "tinycolor2";
import ConfirmSubmitWorkOrderStepModal from "./ConfirmSubmitWorkOrderStepModal";
export default function SubmitWorkOrderStepSideMenu({
  submitButtonLoading,
  submitWorkOrderStep,
  handleSubmit,
  setOpenMachineInspectionFormIndexes,
  setOpenMachineIndexes,
  setSubmitScope,
  workOrderStep,
  validStepCount,
  taskRefs,
  highlightedIndex,
  getTaskCounter,
  isWOMValid,
  isWOQValid,
  isWOCValid,
  hasNotify,
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [showMore, setShowMore] = useState(false);
  const confirmSubmitWorkOrderStepDisclosure = useDisclosure();
  const taskItems = [
    workOrderStep?.form && {
      label: "Form",
      bg: "#e6e6fa",
      color: "#7059ff",
      icon: <TiClipboard />,
      isFinished: isWOQValid,
    },
    workOrderStep?.notify && {
      label: "Notify",
      bg: "#fff1d9",
      color: "#ff8629",
      icon: <FaRegBell />,
      isFinished: true,
    },
    workOrderStep?.machine && {
      label: "Machine",
      bg: "#EDF2F7",
      color: "#848484",
      icon: <FaCogs />,
      isFinished: isWOMValid,
    },
    workOrderStep?.condition && {
      label: "Condition",
      bg: "#fddeff",
      color: "#f329ff",
      icon: <LuNetwork />,
      isFinished: isWOCValid,
    },
  ].filter(Boolean);

  function hoverToStep(index) {
    taskRefs.current[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // const startIndex =
  //   highlightedIndex - 2 < 0 || showMore
  //     ? 0
  //     : highlightedIndex + 1 === formik.values.workOrderSteps.length
  //     ? highlightedIndex - 2
  //     : highlightedIndex - 1;
  // const endIndex = highlightedIndex + 1 < 3 ? 3 : highlightedIndex + 2;
  return (
    <Flex
      alignSelf={"flex-start"}
      position={"sticky"}
      top={"20px"}
      left={0}
      w={"400px"}
      p={"1px"}
      maxW={"35%"}
      maxH={"90vh"}
      overflowY={"auto"}
      gap={"20px"}
      flexDir={"column"}
    >
      <Flex
        flexDir={"column"}
        p={"20px"}
        gap={"20px"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      >
        <Flex flexDir={"column"} gap={"10px"}>
          <Flex fontWeight={700}>Tasks:</Flex>
          <Flex gap={"10px"} flexDir={"column"}>
            {taskItems.map((val, taskIndex) => (
              <Flex
                bg={
                  val.isFinished
                    ? "#e1f5d5"
                    : highlightedIndex === taskIndex
                    ? "#ededed"
                    : "#ECEFF3"
                }
                onClick={() => {
                  hoverToStep(taskIndex);
                }}
                cursor={"pointer"}
                _hover={{
                  bg: tinycolor(
                    highlightedIndex === taskIndex ? "#ededed" : "white"
                  )
                    .darken(5)
                    .toString(),
                }}
                role="group"
                borderRadius={"5px"}
                minW={"250px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                px={"8px"}
                py={"4px"}
                alignItems={"center"}
                justify={"space-between"}
              >
                <Flex py={"2px"}>
                  <Flex
                    color={val.color}
                    fontWeight={700}
                    gap={"10px"}
                    alignItems={"center"}
                  >
                    <Flex
                      bg={val.bg}
                      p={"5px"}
                      borderRadius={"100px"}
                      fontSize={"20px"}
                    >
                      {val.icon}
                    </Flex>
                    <Flex>{val.label}</Flex>
                    {val.isFinished ? (
                      <Flex fontSize={"20px"} color={"#3D9666"}>
                        <IoMdCheckmark />
                      </Flex>
                    ) : (
                      ""
                    )}
                  </Flex>
                </Flex>
                <Flex
                  transition={"0.2s ease-in-out"}
                  _groupHover={{ opacity: 1 }}
                  opacity={highlightedIndex === taskIndex ? 1 : 0}
                  color={highlightedIndex === taskIndex ? "#039be5" : "#848484"}
                  fontSize={"24px"}
                >
                  <AiOutlineEye />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
      <Flex color={"#848484"} fontSize={"14px"}>
        Finished Tasks {validStepCount} of {getTaskCounter()}
      </Flex>
      <Flex gap={"10px"} flexDir={"column"}>
        <ConfirmSubmitWorkOrderStepModal
          hasNotify={hasNotify}
          confirmSubmitWorkOrderStepDisclosure={
            confirmSubmitWorkOrderStepDisclosure
          }
          setOpenMachineInspectionFormIndexes={
            setOpenMachineInspectionFormIndexes
          }
          setOpenMachineIndexes={setOpenMachineIndexes}
          setSubmitScope={setSubmitScope}
          submitWorkOrderStep={submitWorkOrderStep}
          handleSubmit={handleSubmit}
          workOrderStep={workOrderStep}
          buttonLoading={submitButtonLoading}
        />
      </Flex>
    </Flex>
  );
}
