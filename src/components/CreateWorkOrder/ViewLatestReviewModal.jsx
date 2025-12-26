import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import moment from "moment";
import { FaCheck, FaUserAlt } from "react-icons/fa";
import { FaFlag } from "react-icons/fa6";
import labelizeRole from "../../utils/labelizeRole";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";

export default function ViewLatestReviewModal({ latestReview }) {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        bg={"#dc143c"}
        color={"white"}
        h={"32px"}
        fontSize={"14px"}
        px={"8px"}
        py={"4px"}
      >
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex>
            <FaFlag />
          </Flex>
          <Flex>View latest feedback</Flex>
        </Flex>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={"white"} maxW={"800px"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex>Latest Feedback</Flex>
              <Box
                fontWeight={700}
                color={"#848484"}
                fontSize={"16px"}
                as="span"
                flex="1"
                textAlign="left"
              ></Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              {latestReview.map((val, index) => {
                const { bgColor, icon, textColor, text } =
                  tableStatusStyleMapper(
                    "review-" + val.work_order_reviewer_response.status
                  );
                const filteredReviewer = val.super_admin
                  ? { ...val.super_admin, is_superadmin: true }
                  : {
                      ...val.member.user,
                      role: val.member.role,
                      employee_id: val.member.employee_id,
                    };
                return (
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex flexDir={"column"}>
                      <Flex alignItems={"center"} gap={"10px"}>
                        {filteredReviewer.first_name ? (
                          <Avatar
                            outline={"1px solid #dc143c"}
                            border={"2px solid white"}
                            name={
                              filteredReviewer.first_name +
                              " " +
                              filteredReviewer.last_name
                            }
                            src={
                              filteredReviewer.profile_image_url
                                ? filteredReviewer.profile_image_url
                                : null
                            }
                          ></Avatar>
                        ) : (
                          <Flex
                            outline={"2px solid #dc143c"}
                            bg={"#bababa"}
                            borderRadius={"100%"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            h={"88px"}
                            w={"88px"}
                            border={"4px solid white"}
                          >
                            <Flex color={"white"} fontSize={"44px"}>
                              <FaUserAlt />
                            </Flex>
                          </Flex>
                        )}
                        <Flex w={"100%"} flexDir={"column"}>
                          <Flex
                            w={"100%"}
                            alignItems={"center"}
                            justify={"space-between"}
                          >
                            <Flex flexDir={"column"}>
                              <Flex fontWeight={700}>
                                {filteredReviewer.first_name +
                                  " " +
                                  filteredReviewer.last_name}
                              </Flex>

                              <Flex fontSize={"14px"} color={"#848484"}>
                                {filteredReviewer?.is_superadmin
                                  ? "Super Admin"
                                  : labelizeRole(filteredReviewer?.role) +
                                    " - " +
                                    filteredReviewer?.employee_id}
                              </Flex>
                            </Flex>
                            <Flex>
                              <Flex
                                fontWeight={700}
                                borderRadius={"10px"}
                                px={"8px"}
                                py={"4px"}
                                alignItems={"center"}
                                gap={"8px"}
                                bg={bgColor}
                                fontSize={"16px"}
                                color={textColor}
                              >
                                <Flex fontSize={"20px"}>{icon}</Flex>
                                <Flex>{text}</Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex>
                      {val.work_order_reviewer_response.status ===
                      "approved" ? (
                        <Flex
                          alignItems={"center"}
                          fontWeight={700}
                          color={"#3D9666"}
                          gap={"5px"}
                        >
                          <Flex>
                            <FaCheck />
                          </Flex>
                          <Flex>All Steps Approved!</Flex>
                        </Flex>
                      ) : val.work_order_reviewer_response.status ===
                        "rejected" ? (
                        <Flex gap={"5px"} flexDir={"column"}>
                          <Flex
                            alignItems={"center"}
                            fontWeight={700}
                            color={"#dc143c"}
                            gap={"5px"}
                          >
                            <Flex>
                              <FaFlag />
                            </Flex>
                            <Flex>Problematic Steps</Flex>
                          </Flex>
                          <Flex flexWrap={"wrap"} gap={"10px"}>
                            {val.work_order_step_review_rejections.length ? (
                              val.work_order_step_review_rejections.map(
                                (step) => (
                                  <Flex
                                    alignItems={"center"}
                                    gap={"3px"}
                                    borderRadius={"full"}
                                    px={"6px"}
                                    py={"2px"}
                                    fontSize={"12px"}
                                    fontWeight={700}
                                    border={"1px solid #dc143c"}
                                    color={"#dc143c"}
                                    bg={"#FDE2E2"}
                                  >
                                    <Flex>
                                      {step.no_work_order_step}.{" "}
                                      {step.name_work_order_step}
                                    </Flex>
                                  </Flex>
                                )
                              )
                            ) : (
                              <Flex
                                fontWeight={700}
                                fontSize={"12px"}
                                bg={"#ededed"}
                                color={"#848484"}
                                borderRadius={"10px"}
                                border={"1px solid #848484"}
                                px={"8px"}
                              >
                                No Steps Flagged
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>

                    <Flex flexDir={"column"}>
                      <Flex
                        maxW={"100%"}
                        whiteSpace="normal"
                        wordBreak="break-word"
                        color={
                          val.work_order_reviewer_response.reason
                            ? "black"
                            : "#848484"
                        }
                      >
                        {val.work_order_reviewer_response.reason ||
                          "No Additional Comment"}
                      </Flex>
                      <Flex justify={"end"} color={"#848484"} fontSize={"14px"}>
                        {moment(val.updated_at).format("DD MMMM YYYY hh:mm A")}
                      </Flex>
                    </Flex>
                    {index !== latestReview.length - 1 && (
                      <Divider m={0} borderColor={"#848484"} />
                    )}
                  </Flex>
                );
              })}
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
