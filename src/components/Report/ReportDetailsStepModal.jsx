import {
  Box,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FaGlobeAmericas } from "react-icons/fa";
import {
  FaArrowLeft,
  FaArrowRight,
  FaLocationDot,
  FaPhoneVolume,
} from "react-icons/fa6";
import { SlGlobe } from "react-icons/sl";

import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import MemberGroupList from "../MemberGroupList";
import ReportDetailsStepSubmissions from "./ReportDetailsStepSubmissions";
export default function ReportDetailsStepModal({
  report,
  onClose,
  isOpen,
  selectedStep,
  setSelectedStep,
}) {
  const multiLockAccessNames =
    selectedStep?.report_multi_lock_group?.report_multi_lock_group_items.map(
      (item) => item.name
    ) || [];

  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    selectedStep?.status
  );

  const reportStepByStatus =
    selectedStep.status === "completed" ||
    selectedStep.status === "cancelled" ||
    selectedStep.status === "submitted"
      ? report?.report_steps.filter(
          (step) =>
            step.status === "completed" ||
            step.status === "cancelled" ||
            step.status === "submitted"
        ) || []
      : report?.report_steps.filter((step) => step.status === "skipped") || [];
  function carouselHandler(direction) {
    if (direction === "left") {
      setSelectedStep((prevState) => {
        const newIndex = prevState.index - 1;
        if (newIndex < 0) return prevState;

        return {
          ...reportStepByStatus[newIndex],
          index: newIndex,
        };
      });
    } else if (direction === "right") {
      setSelectedStep((prevState) => {
        const newIndex = prevState.index + 1;
        if (newIndex >= reportStepByStatus.length) return prevState;

        return {
          ...reportStepByStatus[newIndex],
          index: newIndex,
        };
      });
    }
  }
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") {
          carouselHandler("left");
          // handleLeftArrowPress();
        } else if (event.key === "ArrowRight") {
          carouselHandler("right");
          // handleRightArrowPress();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalCloseButton
        position={"fixed"}
        right="20px"
        zIndex={1500}
        fontSize={"16px"}
        // bg={"#EDF2F7"}
        color={"white"}
      />
      <IconButton
        onClick={() => {
          carouselHandler("left");
        }}
        isDisabled={!!selectedStep.index - 1}
        icon={<FaArrowLeft />}
        position="fixed"
        left="20px"
        top="50%"
        transform="translateY(-50%)"
        opacity={1}
        zIndex="1500" // Higher zIndex to ensure buttons are on top
        // onClick={goToPreviousPage}
        aria-label="Previous page"
      />
      <IconButton
        onClick={() => {
          carouselHandler("right");
        }}
        isDisabled={selectedStep.index + 1 >= reportStepByStatus.length}
        icon={<FaArrowRight />}
        position="fixed"
        right="20px"
        top="50%"
        transform="translateY(-50%)"
        opacity={1}
        zIndex="1500" // Higher zIndex to ensure buttons are on top
        // onClick={goToNextPage}
        aria-label="Next page"
      />
      <ModalContent bg={"#ededed"} maxW={"900px"}>
        <ModalBody p={"20px"}>
          <Flex flexDir={"column"}>
            <Flex
              // px={"20px"}
              bg={"#ededed"}
              // py={"20px"}
              flexDirection={"column"}
            >
              <Flex
                alignItems={"center"}
                justify={"space-between"}
                p={"20px"}
                color={"white"}
                background={
                  selectedStep?.status === "completed" ||
                  selectedStep?.status === "cancelled" ||
                  selectedStep?.status === "submitted"
                    ? "#dc143c"
                    : "#bababa"
                }
              >
                <Flex flexDir={"column"}>
                  <Flex fontSize={"24px"}>{report?.name}</Flex>
                  <Text fontSize="32px" fontWeight={700} lineHeight="1.2">
                    {selectedStep.originalIndex +
                      1 +
                      ". " +
                      selectedStep.name +
                      " "}
                    <Box
                      display="inline-flex"
                      alignItems="center"
                      px="8px"
                      py="4px"
                      ml="8px"
                      borderRadius="10px"
                      bg={bgColor}
                      color={textColor}
                      fontSize="16px"
                      fontWeight="700"
                      gap="8px"
                    >
                      <Box fontSize="20px">{icon}</Box>
                      {text}
                    </Box>
                  </Text>
                </Flex>
                <Flex fontSize={"48px"}>
                  <SlGlobe />
                </Flex>
              </Flex>
              <Flex minH={"900px"} w={"100%"} py={"20px"} bg={"white"}>
                <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                  {selectedStep?.description ? (
                    <Flex fontSize={"16px"} color={"black"}>
                      {selectedStep.description}
                    </Flex>
                  ) : (
                    ""
                  )}

                  <Flex px={"20px"} w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex w={"100%"} flexDir={"column"} gap={"5px"}>
                      <Flex gap={"20px"} justifyContent={"space-between"}>
                        <Flex fontWeight={700}>Assigned to :</Flex>
                      </Flex>
                      <MemberGroupList
                        memberArray={selectedStep?.report_step_assigned_members?.map(
                          (assignedMember) => ({
                            ...assignedMember,
                            user: {
                              first_name: assignedMember.first_name,
                              last_name: assignedMember.last_name,
                              profile_image_url:
                                assignedMember.profile_image_url,
                            },
                          })
                        )}
                        hasShowMore={false}
                      />
                    </Flex>

                    {selectedStep?.aborted_by_report_user ? (
                      <Flex flexDir={"column"} gap={"5px"}>
                        <Box
                          fontWeight={700}
                          as="span"
                          flex="1"
                          textAlign="left"
                        >
                          Aborted By :
                        </Box>
                        <MemberGroupList
                          memberArray={[
                            selectedStep?.aborted_by_report_user,
                          ].map((abortedUser) => ({
                            ...abortedUser,
                            user: {
                              first_name: abortedUser.first_name,
                              last_name: abortedUser.last_name,
                              profile_image_url: abortedUser.profile_image_url,
                            },
                          }))}
                          hasShowMore={false}
                        />
                      </Flex>
                    ) : (
                      ""
                    )}
                  </Flex>
                  <ReportDetailsStepSubmissions selectedStep={selectedStep} />
                </Flex>
              </Flex>
              <Flex
                alignItems={"center"}
                justify={"space-between"}
                p={"20px"}
                color={"#dc143c"}
                background={"#FDE2E2"}
                gap={"20px"}
              >
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex fontSize={"24px"} fontWeight={700}>
                    {report?.name}
                  </Flex>

                  <Flex flexDir={"column"} gap={"5px"} fontSize={"14px"}>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex fontSize={"16px"}>
                        <FaPhoneVolume />
                      </Flex>
                      <Flex>(1) 949 558 0160</Flex>
                    </Flex>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex fontSize={"16px"}>
                        <FaGlobeAmericas />
                      </Flex>
                      <Flex>www.egeetouch.com</Flex>
                    </Flex>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex fontSize={"16px"}>
                        <FaLocationDot />
                      </Flex>
                      <Flex>
                        200 Spectrum Center Drive, Suite 300, Irvine, CA 92618
                        USA
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex fontSize={"48px"}>
                  <SlGlobe />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
