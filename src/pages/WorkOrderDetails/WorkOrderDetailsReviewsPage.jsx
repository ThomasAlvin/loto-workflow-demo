import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Button,
  Divider,
  Flex,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import WorkOrderDetailsAssociation from "../../components/WorkOrders/WorkOrderDetailsAssociations";
import WorkOrderDetailsHeader from "../../components/WorkOrders/WorkOrderDetailsHeader";
import { FaCheck, FaFlag, FaRegBell, FaRegClock } from "react-icons/fa6";
import labelizeRole from "../../utils/labelizeRole";
import labelizeReviewType from "../../utils/labelizeReviewType";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import moment from "moment";
import { FaUserAlt } from "react-icons/fa";
import { TbClockX } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function WorkOrderDetailsReviewsPage({
  workOrder,
  UID,
  hasManagePermission,
  handleOpenSendReminder,
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const nav = useNavigate();

  return (
    <Flex p={"30px"}>
      <Flex
        p={"20px"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        bg={"#f8f9fa"}
        gap={"20px"}
      >
        <Flex flex={1} gap={"20px"} flexDir={"column"} alignItems={"center"}>
          <WorkOrderDetailsHeader workOrder={workOrder} />
          <Flex
            minH={"800px"}
            w={"100%"}
            px={"20px"}
            py={"20px"}
            bg={"white"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Flex w={"100%"} flexDir={"column"}>
              <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex
                    alignItems={"center"}
                    justify={"space-between"}
                    gap={"10px"}
                  >
                    <Flex fontSize={"20px"} fontWeight={700} color={"#dc143c"}>
                      Review Timeline
                    </Flex>
                  </Flex>
                  <Divider borderColor={"#848484"} m={0} />
                </Flex>
              </Flex>

              <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                <Flex flexDir={"column"}>
                  <Accordion
                    w={"100%"}
                    defaultIndex={[0]}
                    allowToggle
                    allowMultiple
                  >
                    {workOrder?.latest_work_order_reviews?.map((val, index) => {
                      const { bgColor, textColor, text } =
                        tableStatusStyleMapper("review-" + val.status);
                      const collectedReviews = [
                        ...(val?.work_order_reviewer_super_admin
                          ? [val.work_order_reviewer_super_admin]
                          : []),
                        ...val.work_order_reviewer_members,
                      ];

                      const approvedReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                            "approved"
                          );
                        }
                      );
                      const rejectedReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                            "rejected"
                          );
                        }
                      );
                      const submittedReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                              "rejected" ||
                            review.work_order_reviewer_response.status ===
                              "approved"
                          );
                        }
                      );
                      const pendingReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                            "pending"
                          );
                        }
                      );
                      const skippedReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                            "skipped"
                          );
                        }
                      );
                      const draftedReviews = collectedReviews?.filter(
                        (review) => {
                          return (
                            review.work_order_reviewer_response.status ===
                            "draft"
                          );
                        }
                      );
                      return (
                        <AccordionItem border={"none"} w={"100%"}>
                          <AccordionButton
                            w={"100%"}
                            justifyContent={"space-between"}
                            borderBottom={"1px solid #848484"}
                            bg={"#f8f9fa"}
                          >
                            <Flex
                              alignItems={"center"}
                              justify={"space-between"}
                              gap={"10px"}
                            >
                              <Flex
                                justify={"space-between"}
                                alignItems={"center"}
                                w={"100%"}
                                fontSize={"18px"}
                                fontWeight={700}
                                color={"black"}
                                py={"5px"}
                              >
                                <Flex flexDir={"column"}>
                                  <Flex alignItems={"center"}>
                                    <Flex>
                                      Review{" "}
                                      {workOrder?.latest_work_order_reviews
                                        .length - index}
                                      &nbsp;
                                    </Flex>
                                    <Flex gap={"5px"} alignItems={"center"}>
                                      <Flex>
                                        - {labelizeReviewType(val.type)}
                                        &nbsp;&nbsp;
                                      </Flex>
                                    </Flex>
                                    <Flex
                                      bg={bgColor}
                                      color={textColor}
                                      fontSize={"12px"}
                                      px={"4px"}
                                      border={`2px solid ${textColor} `}
                                    >
                                      {text}
                                    </Flex>
                                  </Flex>
                                  <Flex
                                    fontSize={"16px"}
                                    color={"#848484"}
                                    fontWeight={400}
                                  >
                                    {moment(val.created_at).format(
                                      "DD MMMM YYYY hh:mm A"
                                    )}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                            <AccordionIcon fontSize={"32px"} />
                          </AccordionButton>
                          <AccordionPanel
                            borderBottom={"1px solid #848484"}
                            py={5}
                          >
                            <Flex flexDir={"column"} gap={"20px"}>
                              {val.type === "all" && val.status !== "draft" ? (
                                <Flex justify={"space-between"} gap={"30px"}>
                                  <Flex
                                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                    bg={"#f8f9fa"}
                                    flexDir={"column"}
                                    w={"33%"}
                                    p={"10px"}
                                    gap={"10px"}
                                  >
                                    <Flex fontSize={"14px"} color={"#848484"}>
                                      Approved Review
                                    </Flex>
                                    <Flex flexDir={"column"} gap={"5px"}>
                                      <Flex fontWeight={700} color={"#3D9666"}>
                                        {`${approvedReviews.length} out of ${
                                          collectedReviews.length
                                        } reviews (${(
                                          (approvedReviews.length /
                                            collectedReviews.length) *
                                          100
                                        ).toFixed(2)}%)`}
                                      </Flex>
                                      <Progress
                                        size={"sm"}
                                        colorScheme="green"
                                        hasStripe
                                        value={
                                          (approvedReviews.length /
                                            collectedReviews.length) *
                                          100
                                        }
                                      />
                                    </Flex>
                                  </Flex>

                                  <Flex
                                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                    justify={"space-between"}
                                    bg={"#f8f9fa"}
                                    p={"10px"}
                                    flexDir={"column"}
                                    w={"33%"}
                                  >
                                    <Flex fontSize={"14px"} color={"#848484"}>
                                      Rejected Review
                                    </Flex>
                                    <Flex flexDir={"column"} gap={"5px"}>
                                      <Flex fontWeight={700} color={"#dc143c"}>
                                        {`${rejectedReviews.length} out of ${
                                          collectedReviews.length
                                        } reviews (${(
                                          (rejectedReviews.length /
                                            collectedReviews.length) *
                                          100
                                        ).toFixed(2)}%)`}
                                      </Flex>
                                      <Progress
                                        size={"sm"}
                                        hasStripe
                                        value={
                                          (rejectedReviews.length /
                                            collectedReviews.length) *
                                          100
                                        }
                                        colorScheme="red"
                                      />
                                    </Flex>
                                  </Flex>
                                  <Flex
                                    justify={"space-between"}
                                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                    bg={"#f8f9fa"}
                                    flexDir={"column"}
                                    w={"33%"}
                                    p={"10px"}
                                  >
                                    <Flex fontSize={"14px"} color={"#848484"}>
                                      Skipped/Pending Review
                                    </Flex>
                                    <Flex flexDir={"column"} gap={"5px"}>
                                      <Flex fontWeight={700} color={"#848484"}>
                                        {`${
                                          [...skippedReviews, ...pendingReviews]
                                            .length
                                        } out of ${
                                          collectedReviews.length
                                        } reviews (${(
                                          ([
                                            ...skippedReviews,
                                            ...pendingReviews,
                                          ].length /
                                            collectedReviews.length) *
                                          100
                                        ).toFixed(2)}%)`}
                                      </Flex>
                                      <Progress
                                        size={"sm"}
                                        hasStripe
                                        value={
                                          ([
                                            ...skippedReviews,
                                            ...pendingReviews,
                                          ].length /
                                            collectedReviews.length) *
                                          100
                                        }
                                        colorScheme="gray"
                                      />
                                    </Flex>
                                  </Flex>
                                </Flex>
                              ) : (
                                ""
                              )}

                              {/* <Flex gap={"20px"}>
                                <Flex
                                  w={"50%"}
                                  bg={"#f8f9fa"}
                                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                  p={"20px"}
                                  flexDir={"column"}
                                  gap={"10px"}
                                >
                                  <Flex
                                    fontWeight={700}
                                    fontSize={"18px"}
                                    color={"#3D9666"}
                                  >
                                    7 out of 10 Approved
                                  </Flex>
                                  <Flex flexDir={"column"}>
                                    <Flex
                                      fontSize={"14px"}
                                      justify={"start"}
                                      color={"#848484"}
                                    >
                                      <Flex>70%</Flex>
                                    </Flex>
                                    <Progress
                                      hasStripe
                                      colorScheme="green"
                                      value={70}
                                    />
                                  </Flex>
                                  <Flex fontSize={"14px"} color={"#848484"}>
                                    Employee Test, Test Super Admin, and 3
                                    others
                                  </Flex>
                                </Flex>
                                <Flex
                                  w={"50%"}
                                  bg={"#f8f9fa"}
                                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                  p={"20px"}
                                  flexDir={"column"}
                                  gap={"10px"}
                                >
                                  <Flex
                                    fontWeight={700}
                                    fontSize={"18px"}
                                    // color={"#dc143c"}
                                  >
                                    Review Results
                                  </Flex>
                                  <Flex flexDir={"column"}>
                                    <Flex flexDir={"column"}>
                                      <Flex
                                        fontSize={"14px"}
                                        justify={"start"}
                                        color={"#848484"}
                                      >
                                        <Flex>3 out of 10 Rejected</Flex>
                                      </Flex>
                                      <Progress
                                        hasStripe
                                        // color={"#dc143c"}
                                        colorScheme="red"
                                        value={30}
                                      />
                                    </Flex>
                                  </Flex>
                                  <Flex flexDir={"column"}>
                                    <Flex flexDir={"column"}>
                                      <Flex
                                        fontSize={"14px"}
                                        justify={"start"}
                                        color={"#848484"}
                                      >
                                        <Flex>7 out of 10 Approved</Flex>
                                      </Flex>
                                      <Progress
                                        hasStripe
                                        colorScheme="green"
                                        value={70}
                                      />
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Flex> */}
                              {submittedReviews?.length ? (
                                <Flex
                                  w={"100%"}
                                  flexDir={"column"}
                                  gap={"20px"}
                                >
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                    >
                                      <Flex
                                        color={"#dc143c"}
                                        fontSize={"20px"}
                                        fontWeight={700}
                                      >
                                        Submitted Reviews (
                                        {submittedReviews?.length})
                                      </Flex>
                                    </Flex>
                                    <Divider borderColor={"#848484"} m={0} />
                                  </Flex>

                                  <Flex flexDir={"column"} gap={"20px"}>
                                    {submittedReviews.map((val, index) => {
                                      const { bgColor, icon, textColor, text } =
                                        tableStatusStyleMapper(
                                          "review-" +
                                            val.work_order_reviewer_response
                                              .status
                                        );

                                      const requester = val.super_admin
                                        ? {
                                            ...val.super_admin,
                                            is_superadmin: true,
                                          }
                                        : {
                                            ...val.member.user,
                                            role: val.member.role,
                                            employee_id: val.member.employee_id,
                                          };
                                      return (
                                        <Flex
                                          w={"100%"}
                                          flexDir={"column"}
                                          gap={"20px"}
                                        >
                                          <Flex flexDir={"column"}>
                                            <Flex
                                              alignItems={"center"}
                                              gap={"10px"}
                                            >
                                              {requester?.first_name ? (
                                                <Avatar
                                                  outline={"1px solid #dc143c"}
                                                  border={"2px solid white"}
                                                  name={
                                                    requester?.first_name +
                                                    " " +
                                                    requester?.last_name
                                                  }
                                                  src={
                                                    requester?.profile_image_url
                                                      ? IMGURL +
                                                        requester?.profile_image_url
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
                                                  <Flex
                                                    color={"white"}
                                                    fontSize={"24px"}
                                                  >
                                                    <FaUserAlt />
                                                  </Flex>
                                                </Flex>
                                              )}
                                              <Flex
                                                w={"100%"}
                                                flexDir={"column"}
                                              >
                                                <Flex
                                                  w={"100%"}
                                                  alignItems={"center"}
                                                  justify={"space-between"}
                                                >
                                                  <Flex flexDir={"column"}>
                                                    <Flex fontWeight={700}>
                                                      {requester.first_name +
                                                        " " +
                                                        requester.last_name}
                                                    </Flex>

                                                    <Flex
                                                      fontSize={"14px"}
                                                      color={"#848484"}
                                                    >
                                                      {requester?.is_superadmin
                                                        ? "Super Admin"
                                                        : labelizeRole(
                                                            requester?.role
                                                          ) +
                                                          " - " +
                                                          requester?.employee_id}
                                                    </Flex>
                                                  </Flex>
                                                  <Flex color={"green"}>
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
                                                      <Flex fontSize={"20px"}>
                                                        {icon}
                                                      </Flex>
                                                      <Flex>{text}</Flex>
                                                    </Flex>
                                                  </Flex>
                                                </Flex>
                                              </Flex>
                                            </Flex>
                                          </Flex>
                                          <Flex>
                                            {val.work_order_reviewer_response
                                              .status === "approved" ? (
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
                                            ) : val.work_order_reviewer_response
                                                .status === "rejected" ? (
                                              <Flex
                                                gap={"5px"}
                                                flexDir={"column"}
                                              >
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
                                                <Flex
                                                  flexWrap={"wrap"}
                                                  gap={"10px"}
                                                >
                                                  {val
                                                    .work_order_step_review_rejections
                                                    .length ? (
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
                                                          border={
                                                            "1px solid #dc143c"
                                                          }
                                                          color={"#dc143c"}
                                                          bg={"#FDE2E2"}
                                                        >
                                                          <Flex>
                                                            {
                                                              step.no_work_order_step
                                                            }
                                                            .{" "}
                                                            {
                                                              step.name_work_order_step
                                                            }
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
                                                      border={
                                                        "1px solid #848484"
                                                      }
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
                                                val.work_order_reviewer_response
                                                  .reason
                                                  ? "black"
                                                  : "#848484"
                                              }
                                            >
                                              {val.work_order_reviewer_response
                                                .reason ||
                                                "No Additional Comment"}
                                            </Flex>
                                            <Flex
                                              justify={"end"}
                                              color={"#848484"}
                                              fontSize={"14px"}
                                            >
                                              {moment(val.updated_at).format(
                                                "DD MMMM YYYY hh:mm A"
                                              )}
                                            </Flex>
                                          </Flex>
                                          {index !==
                                            submittedReviews.length - 1 && (
                                            <Divider
                                              m={0}
                                              borderColor={"#848484"}
                                            />
                                          )}
                                        </Flex>
                                      );
                                    })}
                                  </Flex>
                                  {workOrder.status === "review_rejected" &&
                                  index === 0 ? (
                                    <Flex justify={"end"}>
                                      <Button
                                        bg={"#dc143c"}
                                        color={"white"}
                                        h={"32px"}
                                        fontSize={"14px"}
                                        px={"10px"}
                                        py={"4px"}
                                        onClick={() => {
                                          nav(`/work-order/edit/${UID}`);
                                        }}
                                      >
                                        <Flex alignItems={"center"} gap={"5px"}>
                                          <Flex fontSize={"16px"}>
                                            <MdEdit />
                                          </Flex>
                                          <Flex>Edit work order</Flex>
                                        </Flex>
                                      </Button>
                                    </Flex>
                                  ) : (
                                    ""
                                  )}
                                </Flex>
                              ) : null}

                              {pendingReviews?.length ? (
                                <Flex
                                  w={"100%"}
                                  flexDir={"column"}
                                  gap={"20px"}
                                >
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                    >
                                      <Flex
                                        color={"#dc143c"}
                                        fontSize={"20px"}
                                        fontWeight={700}
                                      >
                                        Pending Reviews (
                                        {pendingReviews?.length})
                                      </Flex>
                                    </Flex>
                                    <Divider borderColor={"#848484"} m={0} />
                                  </Flex>
                                  <Flex flexDir={"column"} gap={"10px"}>
                                    {pendingReviews.map((val) => {
                                      const requester = val.super_admin
                                        ? val.super_admin
                                        : {
                                            ...val.member.user,
                                            role: val.member.role,
                                            employee_id: val.member.employee_id,
                                          };
                                      return (
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            alignItems={"center"}
                                            gap={"10px"}
                                          >
                                            {requester.first_name ? (
                                              <Avatar
                                                outline={"1px solid #dc143c"}
                                                border={"2px solid white"}
                                                name={
                                                  requester.first_name +
                                                  " " +
                                                  requester.last_name
                                                }
                                                src={
                                                  requester.profile_image_url
                                                    ? IMGURL +
                                                      requester.profile_image_url
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
                                                <Flex
                                                  color={"white"}
                                                  fontSize={"24px"}
                                                >
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
                                                    {requester.first_name +
                                                      " " +
                                                      requester.last_name}
                                                  </Flex>

                                                  <Flex
                                                    fontSize={"14px"}
                                                    color={"#848484"}
                                                  >
                                                    {requester?.is_superadmin
                                                      ? "Super Admin"
                                                      : labelizeRole(
                                                          requester?.role
                                                        ) +
                                                        " - " +
                                                        requester?.employee_id}
                                                  </Flex>
                                                </Flex>
                                                <Flex
                                                  gap={"20px"}
                                                  alignItems={"center"}
                                                >
                                                  <Flex
                                                    fontWeight={700}
                                                    borderRadius={"10px"}
                                                    px={"8px"}
                                                    py={"4px"}
                                                    alignItems={"center"}
                                                    gap={"8px"}
                                                    bg={"#ffeebd"}
                                                    fontSize={"16px"}
                                                    color={"#ff9100"}
                                                  >
                                                    <Flex fontSize={"20px"}>
                                                      <FaRegClock />
                                                    </Flex>
                                                    <Flex>Pending</Flex>
                                                  </Flex>
                                                  {handleOpenSendReminder &&
                                                  hasManagePermission ? (
                                                    <Flex>
                                                      <Tooltip
                                                        hasArrow
                                                        openDelay={300}
                                                        closeDelay={100}
                                                        bg={"#dc143c"}
                                                        placement="top"
                                                        label="Send Reminder"
                                                      >
                                                        <Button
                                                          onClick={() =>
                                                            handleOpenSendReminder(
                                                              requester,
                                                              "reviewer"
                                                            )
                                                          }
                                                          position={"static"}
                                                          _hover={{
                                                            bg: "#dc143c",
                                                            color: "white",
                                                          }}
                                                          boxShadow={
                                                            "0px 0px 3px rgba(50,50,93,0.5)"
                                                          }
                                                          bg={"white"}
                                                          color={"#dc143c"}
                                                          h={"auto"}
                                                          p={"12px"}
                                                          borderRadius={"100%"}
                                                        >
                                                          <Flex
                                                            w={"16px"}
                                                            h={"16px"}
                                                          >
                                                            <FaRegBell />
                                                          </Flex>
                                                        </Button>
                                                      </Tooltip>
                                                    </Flex>
                                                  ) : (
                                                    ""
                                                  )}
                                                </Flex>
                                              </Flex>
                                            </Flex>
                                          </Flex>
                                        </Flex>
                                      );
                                    })}
                                  </Flex>
                                </Flex>
                              ) : null}
                              {skippedReviews?.length ? (
                                <Flex
                                  w={"100%"}
                                  flexDir={"column"}
                                  gap={"20px"}
                                >
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                    >
                                      <Flex
                                        color={"#dc143c"}
                                        fontSize={"20px"}
                                        fontWeight={700}
                                      >
                                        Skipped Reviews (
                                        {skippedReviews?.length})
                                      </Flex>
                                    </Flex>
                                    <Divider borderColor={"#848484"} m={0} />
                                  </Flex>
                                  <Flex flexDir={"column"} gap={"10px"}>
                                    {skippedReviews.map((val) => {
                                      const requester = val.super_admin
                                        ? val.super_admin
                                        : {
                                            ...val.member.user,
                                            role: val.member.role,
                                            employee_id: val.member.employee_id,
                                          };
                                      return (
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            alignItems={"center"}
                                            gap={"10px"}
                                          >
                                            {requester.first_name ? (
                                              <Avatar
                                                outline={"1px solid #dc143c"}
                                                border={"2px solid white"}
                                                name={
                                                  requester.first_name +
                                                  " " +
                                                  requester.last_name
                                                }
                                                src={
                                                  requester.profile_image_url
                                                    ? IMGURL +
                                                      requester.profile_image_url
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
                                                <Flex
                                                  color={"white"}
                                                  fontSize={"24px"}
                                                >
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
                                                    {requester.first_name +
                                                      " " +
                                                      requester.last_name}
                                                  </Flex>

                                                  <Flex
                                                    fontSize={"14px"}
                                                    color={"#848484"}
                                                  >
                                                    {requester?.is_superadmin
                                                      ? "Super Admin"
                                                      : labelizeRole(
                                                          requester?.role
                                                        ) +
                                                        " - " +
                                                        requester?.employee_id}
                                                  </Flex>
                                                </Flex>
                                                <Flex color={"green"}>
                                                  <Flex
                                                    fontWeight={700}
                                                    borderRadius={"10px"}
                                                    px={"8px"}
                                                    py={"4px"}
                                                    alignItems={"center"}
                                                    gap={"8px"}
                                                    bg={"#dedede"}
                                                    fontSize={"16px"}
                                                    color={"#848484"}
                                                  >
                                                    <Flex fontSize={"20px"}>
                                                      <TbClockX />
                                                    </Flex>
                                                    <Flex>Skipped</Flex>
                                                  </Flex>
                                                </Flex>
                                              </Flex>
                                            </Flex>
                                          </Flex>
                                        </Flex>
                                      );
                                    })}
                                  </Flex>
                                </Flex>
                              ) : null}
                              {draftedReviews?.length ? (
                                <Flex
                                  w={"100%"}
                                  flexDir={"column"}
                                  gap={"20px"}
                                >
                                  <Flex flexDir={"column"} gap={"20px"}>
                                    <Flex
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                    >
                                      <Flex
                                        color={"#dc143c"}
                                        fontSize={"20px"}
                                        fontWeight={700}
                                      >
                                        Assigned Reviewers (
                                        {draftedReviews?.length})
                                      </Flex>
                                    </Flex>
                                    <Divider borderColor={"#848484"} m={0} />
                                  </Flex>
                                  <Flex flexDir={"column"} gap={"10px"}>
                                    {draftedReviews.map((val) => {
                                      const requester = val.super_admin
                                        ? val.super_admin
                                        : {
                                            ...val.member.user,
                                            role: val.member.role,
                                            employee_id: val.member.employee_id,
                                          };
                                      return (
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            alignItems={"center"}
                                            gap={"10px"}
                                          >
                                            {requester.first_name ? (
                                              <Avatar
                                                outline={"1px solid #dc143c"}
                                                border={"2px solid white"}
                                                name={
                                                  requester.first_name +
                                                  " " +
                                                  requester.last_name
                                                }
                                                src={
                                                  requester.profile_image_url
                                                    ? IMGURL +
                                                      requester.profile_image_url
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
                                                <Flex
                                                  color={"white"}
                                                  fontSize={"24px"}
                                                >
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
                                                    {requester.first_name +
                                                      " " +
                                                      requester.last_name}
                                                  </Flex>

                                                  <Flex
                                                    fontSize={"14px"}
                                                    color={"#848484"}
                                                  >
                                                    {requester?.is_superadmin
                                                      ? "Super Admin"
                                                      : labelizeRole(
                                                          requester?.role
                                                        ) +
                                                        " - " +
                                                        requester?.employee_id}
                                                  </Flex>
                                                </Flex>
                                              </Flex>
                                            </Flex>
                                          </Flex>
                                        </Flex>
                                      );
                                    })}
                                  </Flex>
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {/* <Divider borderColor={"#848484"} m={0} /> */}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <WorkOrderDetailsAssociation
          workOrder={workOrder}
          handleOpenSendReminder={handleOpenSendReminder}
          hasManagePermission={hasManagePermission}
        />
      </Flex>
    </Flex>
  );
}
